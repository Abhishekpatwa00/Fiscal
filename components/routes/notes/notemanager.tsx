import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { Save } from "lucide-react";
import { useEffect, useState } from "react";



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



export const NoteEditor = ({ note }: { note: Note }) => {
  const [editNote , setEditNote] = useState<Note>(note)
  const supabase = createClient();
  async function save() {
    const { error } = await supabase.from("notes").update({
      "title": editNote?.title,
      "cover_url": editNote?.cover_url,
      "blocks": editNote?.blocks,
    }).eq("id", editNote?.id)
    if (error) {
      toast.add({
        type: "error",
        description: "Failed to save note.",
      })
    }
  }


  return (
    <>


      <div>
        <Button
          variant={"ghost"}
          className="text-md"
          onClick={save}
        ><Save /></Button>
        <div className="rounded-lg border bg-white p-6 min-h-[500px]">
          <input
            type="text"
            value={editNote?.title}
            onChange={(e) => {
              setEditNote({ ...editNote, title: `${e.target.value}` })

            }}
            className=" bg-transparent text-5xl font-peace border-transparent focus:border-primary outline-none"
          />
        </div>
      </div>

    </>
  )
}
