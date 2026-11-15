"use client"

import { Suspense } from "react"
import { NoteEditor } from "@/components/routes/notes/notemanager"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  useState, useEffect
} from "react"
import { toast } from "@/components/ui/toast"

export type NoteBlock = {
  id: string
  type: "paragraph" | "h1" | "h2" | "todo" | "bullet" | "image"
  content: string
  caption?: string
  checked?: boolean
}

export type Note = {
  id: string
  user_id: string
  parent_id: string | null
  cover_url: string | null
  title: string
  blocks: NoteBlock[]
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

function NotesView() {
  // 1. Read the ?id=... from the URL
  const searchParams = useSearchParams()
  const [loading , setLoading] = useState(false)
  const selectedNoteId = searchParams.get("id")
  const [note, setNote] = useState<Note|null>(null)
  const supabase = createClient()
  console.log(selectedNoteId)
  async function fetchNotes() {
    if (selectedNoteId) {
      setLoading(true)
      const { data, error } = await supabase.from("notes").select("*").eq("id" , selectedNoteId).single()

      if (error) {
            toast.add({
              type: "error",
              description: "Failed to load notes.",
            })
          } else if (data) {
            setNote(data)
      }
      setLoading(false)
    }


  }
  useEffect(() => {
    fetchNotes()
  }, [selectedNoteId])

  return (
    <div className="w-full p-6">
      <div >
        {!selectedNoteId ? (
          <div className="h-[450px] flex items-center justify-center text-sm text-muted-foreground">
            Select a note on the left or create a new one.
          </div> ) : ( loading || !note ? (
                    <div className="h-[450px] flex items-center justify-center text-sm text-muted-foreground">
                      Loading your note...
                    </div>
                  ) : (
                    <NoteEditor note={note} />
                  )
        )}
      </div>
    </div>
  )
}
// 2. Your default export MUST NOT call useSearchParams() — it only wraps <NotesView /> in <Suspense>
export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-6">
          <div className="rounded-lg border bg-card p-6 min-h-[500px] flex items-center justify-center text-sm text-muted-foreground">
            Loading notes...
          </div>
        </div>
      }
    >
      <NotesView />
    </Suspense>
  )
}
