"use client"

import { createClient } from "@/lib/supabase/client"
import { useState , useEffect } from "react"
import { toast } from "../../ui/toast"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Trash2,
  RotateCcw,
  FileText,
  ArchiveRestore,
  XCircle,
} from "lucide-react"

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

export const NoteManager = () => {
  const supabase = createClient();

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useState<"active" | "trash">("active")
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const activeNotes = notes.filter((n) => !n.is_deleted)
  const trashedNotes = notes.filter((n) => n.is_deleted)
  const selectedNote = activeNotes.find ((n) => n.id === selectedNoteId) || null

  async function fetchNotes() {
    setLoading(true)
    const { data, error } = await supabase.from("notes").select("*").order("updated_at", { ascending: false })
    if (error) {
          toast.add({
            type: "error",
            description: "Failed to load notes.",
          })
        } else if (data) {
          setNotes(data as Note[])
        }
        setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  async function handleCreateNote() {
    setIsCreating(true)
    const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsCreating(false)
          return
    }

    const defaultBlock: NoteBlock = {
          id: `block-${Date.now()}`,
          type: "paragraph",
          content: "",
        }

    const { data, error } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            title: "Untitled Note",
            blocks: [defaultBlock],
            is_deleted: false,
          })
          .select()
          .single()


    if (error) {
          toast.add({
            type: "error",
            description: "Could not create note.",
          })
        } else if (data) {
          const newNote = data as Note
          setNotes((prev) => [newNote, ...prev])
          setViewMode("active")
          setSelectedNoteId(newNote.id)
          toast.add({
            type: "success",
            description: "New note created.",
          })
        }
        setIsCreating(false)
  }

  async function handleMoveToTrash(id: string) {
    const now = new Date().toISOString()
    setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_deleted: true, deleted_at: now } : n
          )
    )
    if (selectedNoteId === id) setSelectedNoteId(null)

    const { error } = await supabase
          .from("notes")
          .update({ is_deleted: true, deleted_at: now })
          .eq("id", id)

        if (error) {
          toast.add({ type: "error", description: "Failed to move note to bin." })
          fetchNotes() // Revert on error
        } else {
          toast.add({ type: "success", description: "Moved to Recycle Bin." })
        }
  }

  async function handleRestoreNote(id: string) {
    setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_deleted: false, deleted_at: null } : n
          )
    )
    const { error } = await supabase
          .from("notes")
          .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
    if (error) {
          toast.add({ type: "error", description: "Failed to restore note." })
          fetchNotes()
        } else {
          toast.add({ type: "success", description: "Note restored!" })
        }

  }

  async function handlePermanentDelete(id : string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))

        const { error } = await supabase.from("notes").delete().eq("id", id)

        if (error) {
          toast.add({ type: "error", description: "Failed to permanently delete." })
          fetchNotes()
        } else {
          toast.add({ type: "success", description: "Note permanently deleted." })
        }
  }


  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 pb-16 flex flex-col gap-6">


            {/* --- CONTENT AREA --- */}
            {loading ? (
              <div className="text-sm text-muted-foreground py-12 text-center">
                Loading note...
              </div>
            ) : viewMode === "active" ?(

                <div className="md:col-span-2 rounded-lg border bg-card p-6 min-h-[360px]">
                  {selectedNote ? (
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        Note ID: {selectedNote.id} — Ready for Step 4 Block Editor!
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      Select a note on the left or create a new one.
                    </div>
                  )}
                </div>

            ) : (
              /* RECYCLE BIN VIEW */
              <div className="flex flex-col gap-3">
                {trashedNotes.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                    Recycle Bin is empty.
                  </div>
                ) : (
                  trashedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {note.title || "Untitled Note"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Deleted on{" "}
                          {note.deleted_at
                            ? new Date(note.deleted_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recently"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreNote(note.id)}
                          className="gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handlePermanentDelete(note.id)}
                          className="gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Delete Forever
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
    </>
  )
}
