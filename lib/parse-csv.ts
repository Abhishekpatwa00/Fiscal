import Papa from "papaparse"

export type StagedExpense = {
  id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_ROWS = 500
const REQUIRED_HEADERS = ["title", "amount", "tag", "expense_date"]

export function parseExpenseCsv(file: File): Promise<StagedExpense[]> {
  return new Promise((resolve, reject) => {
    // 1. Validate File Type & Size
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      return reject(new Error("Invalid file type. Please upload a .csv file."))
    }
    if (file.size > MAX_FILE_SIZE) {
      return reject(new Error("File is too large. Maximum size is 2MB."))
    }

    // 2. Run PapaParse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // Normalize headers: " Expense_Date " -> "expense_date"
      transformHeader: (header) => header.trim().toLowerCase(),

      complete: (results) => {
        const headers = results.meta.fields || []

        // 3. Check for Missing Required Columns
        const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
        if (missingHeaders.length > 0) {
          return reject(
            new Error(`Missing required columns: ${missingHeaders.join(", ")}`)
          )
        }

        // 4. Validate Row Count
        if (results.data.length === 0) {
          return reject(new Error("The CSV file is empty."))
        }
        if (results.data.length > MAX_ROWS) {
          return reject(
            new Error(`Too many rows (${results.data.length}). Max allowed is ${MAX_ROWS}.`)
          )
        }

        // 5. Sanitize & Format Each Row for the Preview Table
        const stagedRows: StagedExpense[] = []

        results.data.forEach((rawRow: any, index: number) => {
          const title = rawRow.title?.trim() || "Untitled Expense"

          // Strip currency symbols (₹, $), commas, and spaces before converting to Number
          const cleanAmount = Number(
            String(rawRow.amount ?? "").replace(/[₹$,\s]/g, "")
          )

          const tag = rawRow.tag?.trim() || "Other"

          // Parse Date or fallback to today's date (YYYY-MM-DD) so user can edit in preview
          const parsedDate = new Date(rawRow.expense_date?.trim())
          const validDate = !isNaN(parsedDate.getTime())
            ? parsedDate.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]

          // Only include rows with a valid positive amount
          if (!isNaN(cleanAmount) && cleanAmount > 0) {
            stagedRows.push({
              id: `csv-${Date.now()}-${index}`,
              title: title.slice(0, 100),
              amount: cleanAmount,
              tag,
              expense_date: validDate,
            })
          }
        })

        if (stagedRows.length === 0) {
          return reject(
            new Error("No valid rows found. Make sure 'amount' contains positive numbers.")
          )
        }

        // 6. Return the clean array for your Staging / Review Table!
        resolve(stagedRows)
      },

      error: (err) => {
        reject(new Error(`CSV Parsing Failed: ${err.message}`))
      },
    })
  })
}
