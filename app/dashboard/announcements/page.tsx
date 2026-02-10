"use client"

import { useAuth } from "@/lib/auth-context"
import { useAnnouncements, useCreateAnnouncement, usePinAnnouncement } from "@/lib/queries"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Megaphone, Pin, X } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const { data: announcements, isLoading } = useAnnouncements()
  const createAnnouncement = useCreateAnnouncement()
  const pinAnnouncement = usePinAnnouncement()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const canCreate = user?.role === "admin" || user?.role === "superadmin"

  const handleCreateAnnouncement = () => {
    if (title.trim() && content.trim() && user) {
      createAnnouncement.mutate(
        {
          title,
          content,
          authorId: user.id,
          authorName: user.name,
        },
        {
          onSuccess: () => {
            setTitle("")
            setContent("")
            setOpen(false)
          },
        }
      )
    }
  }

  const handleTogglePin = (announcementId: string, currentPinned: boolean) => {
    pinAnnouncement.mutate({
      announcementId,
      pinned: !currentPinned,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Office-wide announcements and updates.
          </p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Create Announcement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Share an important announcement with all users.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Announcement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-24"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAnnouncement}
                    disabled={createAnnouncement.isPending || !title.trim() || !content.trim()}
                  >
                    {createAnnouncement.isPending
                      ? "Creating..."
                      : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No announcements at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((ann) => (
            <Card
              key={ann.id}
              className={ann.pinned ? "border-primary/30 bg-primary/[0.02]" : ""}
            >
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 flex-shrink-0 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">
                      {ann.title}
                    </h3>
                    {ann.pinned && (
                      <Badge
                        variant="outline"
                        className="border-primary/30 text-primary text-xs gap-1"
                      >
                        <Pin className="h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  {canCreate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs"
                      onClick={() => handleTogglePin(ann.id, ann.pinned)}
                      disabled={pinAnnouncement.isPending}
                      title={ann.pinned ? "Unpin announcement" : "Pin announcement"}
                    >
                      <Pin
                        className={`h-3.5 w-3.5 ${
                          ann.pinned
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {ann.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{ann.authorName}</span>
                  <span>-</span>
                  <span>
                    {format(new Date(ann.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
