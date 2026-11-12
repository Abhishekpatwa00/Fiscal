import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import dns from "node:dns"

dns.setDefaultResultOrder("ipv4first")

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing in .env.local" },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Convert PDF/Image file to base64 data URL
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")
    const dataUrl = `data:${file.type || "application/pdf"};base64,${base64Data}`

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a financial data extraction assistant. Extract all transactions (both debits/expenses and credits/income) from this bank statement and return ONLY a valid JSON object matching this exact schema:
{
  "rows": [
    {
      "title": "String (clean merchant or person name)",
      "amount": 0.00,
      "tag": "String (concise lowercase category)",
      "expense_date": "YYYY-MM-DD",
      "type": "expense" | "credit"
    }
  ]
}

Rules:
1. Clean messy UPI/bank strings (e.g., "UPI/SWIGGY/839201...") into short, human-readable merchant or person names (e.g., "Swiggy").
2. Set "type" strictly to "expense" for money spent/debited/withdrawn, or "credit" for money received/deposited/refunded.
3. Keep "amount" as a positive number (float or integer, no currency symbols).
4. Assign a concise lowercase "tag" (e.g., "food", "bills", "transport", "shopping", "groceries", "income", "allowance", "refund", "transfer").
5. Format "expense_date" strictly as YYYY-MM-DD.
6. Ignore opening/closing balance summary lines.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all transactions (both expenses and credits) from this bank statement into the requested JSON format under the 'rows' key.",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      temperature: 0.1,
    })

    const content = completion.choices[0]?.message?.content || '{ "rows": [] }'
    const parsedData = JSON.parse(content)
    const rawRows = Array.isArray(parsedData.rows)
      ? parsedData.rows
      : Array.isArray(parsedData)
      ? parsedData
      : []

    // Sanitize each row on the server so the frontend always receives strict types
    const rows = rawRows
      .map((row: any, index: number) => ({
        id: `stmt-${Date.now()}-${index}`,
        title: String(row.title || "Untitled Transaction").trim(),
        amount: Math.abs(Number(row.amount) || 0),
        tag: String(row.tag || "other").trim().toLowerCase(),
        expense_date: String(
          row.expense_date || new Date().toISOString().split("T")[0]
        ).split("T")[0],
        type:
          String(row.type || "")
            .trim()
            .toLowerCase() === "credit"
            ? "credit"
            : "expense",
      }))
      .filter((row: any) => row.amount > 0)

    return NextResponse.json({ rows })
  } catch (error: any) {
    console.error("Groq Parser Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to parse bank statement via Groq" },
      { status: 500 }
    )
  }
}
