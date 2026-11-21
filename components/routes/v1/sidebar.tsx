"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useNotes } from "@/components/context/notes-context"
import { toast } from "../../ui/toast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChevronDown,
  Plus,
  Trash2,
  RotateCcw,
  XCircle,
  Home,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Wallet,
} from "lucide-react"

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeNoteId = searchParams.get("id")

  const {
    activeNotes,
    trashedNotes,
    loading,
    createNote,
    moveToTrash,
    restoreNote,
    permanentDelete,
  } = useNotes()

  const [isOpen, setIsOpen] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  async function onCreateNote() {
    setIsCreating(true)
    const newNote = await createNote()
    if (newNote) {
      setIsOpen(true)
      toast.add({ type: "success", description: "New note created." })
      router.push(`/dashboard/notes?id=${newNote.id}`)
    } else {
      toast.add({ type: "error", description: "Could not create note." })
    }
    setIsCreating(false)
  }

  async function onMoveToTrash(id: string) {
    await moveToTrash(id)
    toast.add({ type: "success", description: "Moved to Recycle Bin." })
    if (activeNoteId === id) {
      router.push("/dashboard/notes")
    }
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Credits", href: "/dashboard/credits", icon: ArrowDownLeft },
    { label: "Expenses", href: "/dashboard/expenses", icon: ArrowUpRight },
  ]

  return (
    <Sidebar className="border-r">
      {/* --- BRAND HEADER --- */}
      <SidebarHeader className="px-4 py-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <img src="/icon.png"></img>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight font-peace">Fiscal</span>
            <span className="text-[11px] text-muted-foreground">
              Personal Workspace
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 gap-4">
        {/* --- MAIN NAVIGATION --- */}
        <SidebarGroup className="gap-1">
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground px-2">
            Overview
          </SidebarGroupLabel>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </SidebarGroup>

        {/* --- COLLAPSIBLE NOTES SECTION --- */}
        <SidebarGroup className="gap-1">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center justify-between px-2 py-1">
              <Link
                href="/dashboard/notes"
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Notes</span>
                <span className="text-[10px] font-normal bg-muted px-1.5 py-0.5 rounded-full">
                  {activeNotes.length}
                </span>
              </Link>

              <div className="flex items-center gap-0.5">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={onCreateNote}
                  disabled={isCreating}
                  title="New Note"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>

                <CollapsibleTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  }
                />
              </div>
            </div>

            <CollapsibleContent className="mt-1 scrollbar-none max-h-64 overflow-y-auto pr-1">
              <div className="flex scrollbar-none  flex-col gap-1">
                {loading ? (
                  <p className="px-2.5 py-3 text-xs text-muted-foreground">
                    Loading notes...
                  </p>
                ) : activeNotes.length === 0 ? (
                  <div className="mx-1 rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                    No notes yet. Click <strong>+</strong> to create one.
                  </div>
                ) : (
                  activeNotes.map((note) => {
                    const isSelected = activeNoteId === note.id
                    return (
                      <div
                        key={note.id}
                        onClick={() =>
                          router.push(`/dashboard/notes?id=${note.id}`)
                        }
                        className={` group flex items-center justify-between px-2.5 py-2 rounded-md scrollbar-none  cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center scrollbar-none  gap-2 min-w-0 pr-2">
                          <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <div className="scrollbar-none  min-w-0">
                            <p className="text-sm truncate leading-tight">
                              {note.title || "Untitled Note"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {new Date(note.updated_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMoveToTrash(note.id)
                          }}
                          title="Move to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      {/* --- FOOTER: RECYCLE BIN POPOVER --- */}
      <SidebarFooter className="p-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="w-full justify-between px-2.5 text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" />
                  Trash
                </span>
                {trashedNotes.length > 0 && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                    {trashedNotes.length}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent side="right" align="end" className="w-80 p-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Recycle Bin ({trashedNotes.length})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5 mt-1">
                {trashedNotes.length === 0 ? (
                  <div className="rounded-md border border-dashed py-8 text-center text-xs text-muted-foreground">
                    Recycle Bin is empty.
                  </div>
                ) : (
                  trashedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between p-2.5 rounded-md border bg-card/50 hover:bg-accent/40 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-medium text-xs truncate">
                          {note.title || "Untitled Note"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Deleted{" "}
                          {note.deleted_at
                            ? new Date(note.deleted_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )
                            : "recently"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-emerald-600"
                          title="Restore Note"
                          onClick={async () => {
                            await restoreNote(note.id)
                            toast.add({
                              type: "success",
                              description: "Note restored!",
                            })
                          }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive"
                          title="Delete Forever"
                          onClick={async () => {
                            await permanentDelete(note.id)
                            toast.add({
                              type: "success",
                              description: "Note permanently deleted.",
                            })
                          }}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
