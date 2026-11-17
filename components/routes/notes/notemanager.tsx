"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uploadNoteImage } from "@/lib/upload-note-image"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/shadcn"
import "@blocknote/shadcn/style.css"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Check, Loader2 } from "lucide-react"
import { useNotes } from "@/components/context/notes-context"
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core"
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react"
import { PiggyBank } from "lucide-react"
import { BudgetTrackerBlock } from "./customblocks"

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

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,

    budgetTracker: BudgetTrackerBlock(),
  },
})



export function NoteEditor({ initialNote }: { initialNote: Note }) {
  const supabase = createClient()
  const { updateNoteLocalTitle } = useNotes()

  const [title, setTitle] = useState(initialNote.title || "")
  const [coverUrl, setCoverUrl] = useState<string | null>(initialNote.cover_url || null)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved")
  const [uploadingCover, setUploadingCover] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize BlockNote editor with existing blocks from Supabase
  const editor = useCreateBlockNote({
    schema,
    initialContent:
      Array.isArray(initialNote.blocks) && initialNote.blocks.length > 0
        ? initialNote.blocks
        : undefined,
    uploadFile: async (file: File) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      return await uploadNoteImage(file, user.id)
    },
  })

  // Debounced Autosave (waits 700ms after you stop typing)
  const triggerAutoSave = (updatedFields: {
    title?: string
    blocks?: any[]
    cover_url?: string | null
  }) => {
    setSaveStatus("saving")
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from("notes")
        .update(updatedFields)
        .eq("id", initialNote.id)
      setSaveStatus("saved")
    }, 700)
  }

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const publicUrl = await uploadNoteImage(file, user.id)
      setCoverUrl(publicUrl)
      await supabase
        .from("notes")
        .update({ cover_url: publicUrl })
        .eq("id", initialNote.id)
    } catch (err) {
      console.error("Cover upload failed:", err)
    } finally {
      setUploadingCover(false)
    }
  }

  return (
    <div className="flex bg-white flex-col gap-4  w-full">
      <span className="text-xs pt-4 pr-4 text-muted-foreground flex items-center self-end gap-1">
        {saveStatus === "saving" ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Check className="w-3 h-3 text-emerald-500" /> Saved
          </>
        )}
      </span>
      {/* --- HEADER COVER BANNER --- */}
      {coverUrl ? (
        <div className="relative group w-full h-44 sm:h-56  overflow-hidden">
          <img
            src={coverUrl}
            alt="Note cover"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
            onClick={() => {
              setCoverUrl(null)
              triggerAutoSave({ cover_url: null })
            }}
          >
            <X className="w-3.5 h-3.5" /> Remove Cover
          </Button>
        </div>
      ) : (
        <div className="flex p-4 items-center  justify-between">
          <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded hover:bg-accent transition-colors">
            <ImagePlus className="w-3.5 h-3.5" />
            {uploadingCover ? "Uploading cover..." : "Add Cover Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
            />
          </label>



        </div>
      )}

      {/* --- TITLE INPUT --- */}
      <input
        type="text"
        value={title}
        placeholder="Untitled Note"
        onChange={(e) => {
          const val = e.target.value
          setTitle(val)
          updateNoteLocalTitle(initialNote.id,val)
          triggerAutoSave({ title: val, blocks: editor.document })
        }}
        className="w-full ml-4  text-2xl sm:text-7xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 px-2"
      />

      {/* --- BLOCKNOTE EDITOR CANVAS --- */}
      <div className="min-h-[380px] ">
        <BlockNoteView
          editor={editor}
          slashMenu={false}
          onChange={() => {
            triggerAutoSave({ title, blocks: editor.document })
          }}
          theme="light"
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(
                [
                  ...getDefaultReactSlashMenuItems(editor),
                  {
                    title: "Budget Tracker",
                    subtext: "Track live category spending against a limit",
                    aliases: ["budget", "limit", "tracker"],
                    group: "Finance",
                    icon: <PiggyBank className="w-4 h-4" />,
                    onItemClick: () => {
                      editor.insertBlocks(
                        [{ type: "budgetTracker" }],
                        editor.getTextCursorPosition().block,
                        "after"
                      )
                    },
                  },
                ],
                query
              )
            }
          />
        </BlockNoteView>
      </div>
    </div>
  )
}
