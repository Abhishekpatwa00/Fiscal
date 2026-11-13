"use client"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

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

export function AppSidebar() {

  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useState<"active" | "trash">("active")
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const activeNotes = notes.filter((n) => !n.is_deleted)
  const trashedNotes = notes.filter((n) => n.is_deleted)
  const selectedNote = activeNotes.find((n) => n.id === selectedNoteId) || null
  const [isOpen, setIsOpen] = useState(false)

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


  return (
    <Sidebar>
      <SidebarHeader >Welcome To Fiscal</SidebarHeader>
      <SidebarContent>
        <SidebarGroup >
          <Link href="/dashboard">Home</Link>
          <Link href="/dashboard/credits">Credits</Link>
          <Link href="/dashboard/expenses">Expenses</Link>

        </SidebarGroup>

        <SidebarGroup  >
          <Collapsible>
            <span className="flex items-center w-full justify-between">
              <Link href="/dashboard/notes" className="w-full">Notes</Link>
              <Button
                size="icon-sm"
                onClick={handleCreateNote}
                disabled={isCreating}
                className="gap-2 mr-1"
                variant="ghost"


              >
                <Plus className="w-3 h-3" />
              </Button>
              <CollapsibleTrigger onClick={() => setIsOpen(!isOpen)} render={
                <Button variant={"ghost"} size="icon-sm">
                  <ChevronDown  className={`${isOpen && "rotate-180"} text-[2px] font-extralight  text-foreground transition-all duration-100 ease-in-out`} />
                </Button>
              } />

            </span>
            <CollapsibleContent className="h-52 mt-2 overflow-scroll scrollbar-none">
              <div className="flex flex-col  gap-2">
                {activeNotes.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No notes yet. Click &ldquo;New Note&rdquo; to start writing.
                  </div>
                ) : (
                  activeNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`group flex items-center justify-between p-3 rounded-lg  cursor-pointer transition-colors ${
                        selectedNoteId === note.id
                          ? "border-primary bg-secondary"
                          : " hover:bg-accent/50"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-medium text-sm truncate">
                          {note.title || "Untitled Note"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(note.updated_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-70 hover:opacity-100 hover:text-destructive shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveToTrash(note.id)
                        }}
                        title="Move to Recycle Bin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>



            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarGroup>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="flex gap-2 justify-start" />}>
              <Trash2/>  Thrash
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" className={"w-sm"}>
              <DropdownMenuGroup>
                <div className="flex flex-col gap-2 ">
                  <div className="flex flex-col gap-2">
                    {trashedNotes.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                        Recycle Bin is empty.
                      </div>
                    ) : (
                      trashedNotes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-center justify-between  p-4 rounded-lg "
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
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreNote(note.id)}
                              className="gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePermanentDelete(note.id)}
                              className="gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter >

      </SidebarFooter>
    </Sidebar>
  )
}
