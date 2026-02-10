"use client"

import { useAuth } from "@/lib/auth-context"
import { useNotifications, useMarkNotificationRead } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, BellOff, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function NotificationsPage() {
  const { user } = useAuth()
  const { data: notifications, isLoading } = useNotifications(user?.id)
  const markRead = useMarkNotificationRead()

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  const handleMarkRead = (id: string) => {
    markRead.mutate(id)
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={
                notif.read
                  ? "border-border"
                  : "border-primary/30 bg-primary/[0.02]"
              }
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    notif.read ? "bg-muted" : "bg-primary/10"
                  }`}
                >
                  <Bell
                    className={`h-4 w-4 ${
                      notif.read
                        ? "text-muted-foreground"
                        : "text-primary"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm ${
                        notif.read
                          ? "text-muted-foreground"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                    </span>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View Request
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-0.5 text-xs text-muted-foreground"
                        onClick={() => handleMarkRead(notif.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
