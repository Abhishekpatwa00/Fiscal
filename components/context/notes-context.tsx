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
  createNote: (parentId?: string | null) => Promise<Note | null>
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
  const createNote = async (parentId: string | null = null) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        parent_id: parentId,
        title: "Untitled Note",
        blocks: [],
      })
      .select()
      .single()

    if (error || !data) {
      console.error("Failed to create note:", error)
      return null
    }

    setNotes((prev) => [data, ...prev])
    return data
  }

  function getSubtreeIds(rootId: string, allNotes: Note[]): string[] {
    const children = allNotes.filter((n) => n.parent_id === rootId)
    return [
      rootId,
      ...children.flatMap((child) => getSubtreeIds(child.id, allNotes)),
    ]
  }

  async function moveToTrash(id: string) {
    const idsToTrash = getSubtreeIds(id, notes)
    const idSet = new Set(idsToTrash)
    const now = new Date().toISOString()

    setNotes((prev) =>
      prev.map((n) =>
        idSet.has(n.id) ? { ...n, is_deleted: true, deleted_at: now } : n
      )
    )
    await supabase
      .from("notes")
      .update({ is_deleted: true, deleted_at: now })
      .in("id", idsToTrash)
  }

  async function restoreNote(id: string) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_deleted: false, deleted_at: null } : n
      )
    )
    await supabase
      .from("notes")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
  }

  async function permanentDelete(id: string) {
    const idsToDelete = getSubtreeIds(id, notes)
    const idSet = new Set(idsToDelete)

    setNotes((prev) => prev.filter((n) => !idSet.has(n.id)))
    await supabase.from("notes").delete().in("id", idsToDelete)
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
