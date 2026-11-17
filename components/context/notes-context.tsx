"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"


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


type NotesContextType = {
  notes: Note[]
  activeNotes: Note[]
  trashedNotes: Note[]
  loading: boolean
  refreshNotes: () => Promise<void>
  createNote: () => Promise<Note | null>
  updateNoteLocalTitle: (id: string, newTitle: string) => void
  moveToTrash: (id: string) => Promise<void>
  restoreNote: (id: string) => Promise<void>
  permanentDelete: (id: string) => Promise<void>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchNotes() {
    setLoading(true)
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false })

    if (data) setNotes(data as Note[])
    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [])
  function updateNoteLocalTitle(id: string, newTitle: string) {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title: newTitle } : n))
      )
  }
  async function createNote(): Promise<Note | null> {
      const defaultBlock: NoteBlock = {
        id: `block-${Date.now()}`,
        type: "paragraph",
        content: "",
      }

      const { data, error } = await supabase
        .from("notes")
        .insert({
          title: "Untitled Note",
          blocks: [defaultBlock],
          is_deleted: false,
        })
        .select()
        .single()

      if (error || !data) return null

      const newNote = data as Note
      setNotes((prev) => [newNote, ...prev])
      return newNote
    }
    async function moveToTrash(id: string) {
        const now = new Date().toISOString()
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_deleted: true, deleted_at: now } : n))
        )
        await supabase.from("notes").update({ is_deleted: true, deleted_at: now }).eq("id", id)
      }

      async function restoreNote(id: string) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_deleted: false, deleted_at: null } : n))
        )
        await supabase.from("notes").update({ is_deleted: false, deleted_at: null }).eq("id", id)
      }

      async function permanentDelete(id: string) {
        setNotes((prev) => prev.filter((n) => n.id !== id))
        await supabase.from("notes").delete().eq("id", id)
      }
      const activeNotes = notes.filter((n) => !n.is_deleted)
        const trashedNotes = notes.filter((n) => n.is_deleted)
        return (
            <NotesContext.Provider
              value={{
                notes,
                activeNotes,
                trashedNotes,
                loading,
                refreshNotes: fetchNotes,
                createNote,
                updateNoteLocalTitle,
                moveToTrash,
                restoreNote,
                permanentDelete,
              }}
            >
              {children}
            </NotesContext.Provider>
          )
        }

        export function useNotes() {
          const context = useContext(NotesContext)
          if (!context) throw new Error("useNotes must be used within a NotesProvider")
          return context
        }
