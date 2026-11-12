<div align="center">
  <img src="./public/logo-transparent.png" alt="Logo" width="160" />
  <h1>Expense Tracker (v1)</h1>
  <p><strong>Stop typing out expenses manually. Drop your bank statement, review, and commit.</strong></p>
</div>

---

## Overview

A modern, full-stack personal finance and expense tracking web application built with **Next.js**, **Supabase**, and **Google Gemini AI**. 

Most expense trackers fail because manual entry is tedious, and bank statements are messy walls of cryptic UPI strings and timestamps. This application bridges the gap by combining traditional manual tracking with deterministic **CSV batch imports** and an **AI-powered PDF Bank Statement Parser** that automatically cleans merchant names, categorizes spending, and stages transactions for human review before touching your database.

## Key Features (v1)

* **AI Bank Statement Parsing:** Upload raw PDF bank statements directly. Powered by `gemini-2.5-flash` structured outputs, the engine filters out credits/transfers, turns messy strings (like `UPI/SWIGGY/839201...`) into clean titles (`Swiggy`), assigns category tags, and formats dates to strict `YYYY-MM-DD`.
* **Interactive Staging & Review Table:** Bulk imports (CSV or PDF) never blindly pollute your database. Every uploaded file loads into an interactive staging table where you can inline-edit rows, delete false positives, and verify totals before committing.
* **CSV Batch Ingestion:** Fast client-side CSV parsing for power users migrating spreadsheets or exported ledger data.
* **Full Expense CRUD & Pagination:** Chronological newest-first sorting, custom client-side pagination, live total calculations, inline row editing, and confirmation-guarded deletions.
* **Secure Authentication & Row-Level Security:** Built on Supabase SSR (`@supabase/ssr`) with Next.js Server Actions, protected routes, and user-scoped database queries.
* **Dark/Light Mode:** Custom theming with `shadcn/ui` and Tailwind CSS.

## Tech Stack

* **Framework:** Next.js 16 (App Router, Turbopack, Server Actions)
* **Database & Auth:** Supabase (PostgreSQL + SSR Auth)
* **AI Engine:** Google Gen AI SDK (`@google/genai` — `gemini-2.5-flash`)
* **Styling & UI:** Tailwind CSS, `shadcn/ui`, Lucide Icons, custom local typography (`Peace Sans` + `Inter`)

## Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
