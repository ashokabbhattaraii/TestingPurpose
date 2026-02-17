"use client";

import { useAuth } from "@/lib/auth-context";
import { useNotifications, useMarkNotificationRead } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications(user?.id, true);
  const markRead = useMarkNotificationRead();

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  // Mark as read on click, then navigate to detail
  const handleNotificationClick = (notif: { id: string; read: boolean; link?: string }) => {
    if (!notif.read) {
      markRead.mutate(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

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
              onClick={() => handleNotificationClick(notif)}
              className={`transition-colors ${
                notif.link ? "cursor-pointer hover:bg-muted/50" : ""
              } ${
                notif.read
                  ? "border-border"
                  : "border-primary/30 bg-primary/[0.02]"
              }`}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    notif.read ? "bg-muted" : "bg-primary/10"
                  }`}
                >
                  <Bell
                    className={`h-4 w-4 ${
                      notif.read ? "text-muted-foreground" : "text-primary"
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
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
