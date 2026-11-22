"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronDown, FileText, Plus, Trash2 } from "lucide-react"

export type SidebarNote = {
  id: string
  title: string
  parent_id: string | null
  is_deleted?: boolean
}

type NoteTreeProps = {
  notes: SidebarNote[]
  parentId?: string | null
  level?: number
  activeNoteId?: string | null
  onCreateNote: (parentId: string | null) => Promise<SidebarNote | null>
  onMoveToTrash: (id: string) => Promise<void>
}

export function NoteTree({
  notes,
  parentId = null,
  level = 0,
  activeNoteId = null,
  onCreateNote,
  onMoveToTrash,
}: NoteTreeProps) {
  const activeNotes = useMemo(
    () => notes.filter((n) => !n.is_deleted),
    [notes]
  )

  const activeIds = useMemo(
    () => new Set(activeNotes.map((n) => n.id)),
    [activeNotes]
  )

  const children = useMemo(() => {
    return activeNotes.filter((note) => {
      if (parentId === null) {
        // Render at root if it has no parent OR its parent is currently in Trash
        return note.parent_id === null || !activeIds.has(note.parent_id)
      }
      return note.parent_id === parentId
    })
  }, [activeNotes, activeIds, parentId])

  if (children.length === 0) return null

  return (
    <div className="flex flex-col gap-0.5">
      {children.map((note) => (
        <NoteTreeItem
          key={note.id}
          note={note}
          allNotes={activeNotes}
          level={level}
          activeNoteId={activeNoteId}
          onCreateNote={onCreateNote}
          onMoveToTrash={onMoveToTrash}
        />
      ))}
    </div>
  )
}

function NoteTreeItem({
  note,
  allNotes,
  level,
  activeNoteId,
  onCreateNote,
  onMoveToTrash,
}: {
  note: SidebarNote
  allNotes: SidebarNote[]
  level: number
  activeNoteId: string | null
  onCreateNote: (parentId: string | null) => Promise<SidebarNote | null>
  onMoveToTrash: (id: string) => Promise<void>
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const hasChildren = allNotes.some((n) => n.parent_id === note.id)
  const isActive = activeNoteId === note.id

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleAddChild = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
    const created = await onCreateNote(note.id)
    if (created) {
      router.push(`/dashboard/notes?id=${created.id}`)
    }
  }

  const handleTrash = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await onMoveToTrash(note.id)
  }

  return (
    <div>
      <Link
        href={`/dashboard/notes?id=${note.id}`}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        className={`group flex items-center justify-between gap-1 pr-2 py-1.5 rounded-md text-sm transition-colors ${
          isActive
            ? "bg-secondary text-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleToggle}
            className={`p-0.5 rounded hover:bg-muted shrink-0 ${
              hasChildren ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label={isOpen ? "Collapse sub-notes" : "Expand sub-notes"}
          >
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span className="truncate">{note.title || "Untitled Note"}</span>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={handleAddChild}
            title="Add sub-note"
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleTrash}
            title="Move to Trash"
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </Link>

      {isOpen && hasChildren && (
        <NoteTree
          notes={allNotes}
          parentId={note.id}
          level={level + 1}
          activeNoteId={activeNoteId}
          onCreateNote={onCreateNote}
          onMoveToTrash={onMoveToTrash}
        />
      )}
    </div>
  )
}
