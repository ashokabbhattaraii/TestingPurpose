"use client"

import { useAuth } from "@/lib/auth-context"
import { useAnnouncements, useCreateAnnouncement, usePinAnnouncement } from "@/lib/queries"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Megaphone, Pin, X, ChevronLeft, ChevronRight, Search, CalendarIcon } from "lucide-react"
import { format, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 5;
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
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [pinnedFilter, setPinnedFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const canCreate = user?.role === "admin" || user?.role === "superadmin"

  const filtered = announcements?.filter((ann) => {
    const matchSearch =
      ann.title.toLowerCase().includes(search.toLowerCase()) ||
      ann.content.toLowerCase().includes(search.toLowerCase()) ||
      ann.authorName.toLowerCase().includes(search.toLowerCase())
    const matchPinned =
      pinnedFilter === "all" ||
      (pinnedFilter === "pinned" && ann.pinned) ||
      (pinnedFilter === "unpinned" && !ann.pinned)

    let matchDate = true
    if (dateRange?.from) {
      const annDate = new Date(ann.createdAt)
      if (dateRange.to) {
        matchDate = isWithinInterval(annDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        })
      } else {
        matchDate = isSameDay(annDate, dateRange.from)
      }
    }

    return matchSearch && matchPinned && matchDate
  }) ?? []

  const totalAnnouncements = filtered.length
  const totalPages = Math.ceil(totalAnnouncements / ITEMS_PER_PAGE)
  const paginatedAnnouncements = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }
  const handlePinnedFilter = (value: string) => {
    setPinnedFilter(value)
    setCurrentPage(1)
  }
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setCurrentPage(1)
  }
  const clearDateFilter = () => {
    setDateRange(undefined)
    setCurrentPage(1)
  }

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

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal gap-2",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <span className="truncate">
                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                  </span>
                ) : (
                  <span className="truncate">{format(dateRange.from, "MMM d, yyyy")}</span>
                )
              ) : (
                <span>Filter by date</span>
              )}
              {dateRange?.from && (
                <span
                  role="button"
                  tabIndex={0}
                  className="ml-auto rounded-full p-0.5 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearDateFilter()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                      clearDateFilter()
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Clear date filter</span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select value={pinnedFilter} onValueChange={handlePinnedFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pinned">Pinned Only</SelectItem>
            <SelectItem value="unpinned">Unpinned Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {search || pinnedFilter !== "all" || dateRange?.from
                ? "No announcements match your filters."
                : "No announcements at this time."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {paginatedAnnouncements.map((ann) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalAnnouncements)} of {totalAnnouncements}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
