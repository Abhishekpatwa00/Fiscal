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

    // Convert PDF/File to text or base64 data URL
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")
    const dataUrl = `data:${file.type || "application/pdf"};base64,${base64Data}`

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a financial parsing assistant. Extract all debit/expense transactions from the provided bank statement file.
          Ignore credits, deposits, or incoming transfers.
          Return a valid JSON object containing an array named "rows". Each object in the array must have:
          - "title" (string, cleaned readable merchant name)
          - "amount" (number)
          - "tag" (string, 1-2 word category like food, utilities, transport, shopping)
          - "expense_date" (string formatted strictly as YYYY-MM-DD)`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the expenses from this bank statement into the requested JSON format.",
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

    const content = completion.choices[0]?.message?.content || "{ \"rows\": [] }"
    const parsedData = JSON.parse(content)
    const rows = parsedData.rows || parsedData

    return NextResponse.json({ rows })
  } catch (error: any) {
    console.error("Groq Parser Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to parse bank statement via Groq" },
      { status: 500 }
    )
  }
}
