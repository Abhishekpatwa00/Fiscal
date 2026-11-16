import { createClient } from "@/lib/supabase/client"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadNoteImage(
  file: File,
  userId: string
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file (PNG, JPG, WebP).")
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be smaller than 5MB.")
  }

  const supabase = createClient()
  const ext = file.name.split(".").pop() || "png"
  const filePath = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("note-images")
    .upload(filePath, file, { upsert: false })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from("note-images").getPublicUrl(filePath)

  return data.publicUrl
}
