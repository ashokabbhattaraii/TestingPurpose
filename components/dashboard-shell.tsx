"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Building2,
    LayoutDashboard,
    ClipboardList,
    Megaphone,
    BarChart3,
    Users,
    User,
    LogOut,
    Menu,
    ChevronRight,
    UtensilsCrossed,
    Bell,
    ExternalLink,
    Settings,
    PanelLeft,
  } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useNotifications, useMarkNotificationRead, useLunchTokens } from "@/lib/queries"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  roles: string[]
  badgeKey?: string
  section?: string
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["employee", "admin", "superadmin"],
    section: "General",
  },
  {
    label: "Service Requests",
    href: "/dashboard/requests",
    icon: <ClipboardList className="h-4 w-4" />,
    roles: ["employee", "admin", "superadmin"],
    section: "General",
  },
  {
    label: "Lunch Token",
    href: "/dashboard/lunch",
    icon: <UtensilsCrossed className="h-4 w-4" />,
    roles: ["employee", "admin", "superadmin"],
    badgeKey: "lunchToken",
    section: "General",
  },
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    icon: <Megaphone className="h-4 w-4" />,
    roles: ["employee", "admin", "superadmin"],
    section: "General",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ["admin", "superadmin"],
    section: "Administration",
  },
  {
    label: "User Management",
    href: "/dashboard/users",
    icon: <Users className="h-4 w-4" />,
    roles: ["superadmin"],
    section: "Administration",
  },
]

function getToday() {
  return new Date().toISOString().split("T")[0]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getRoleLabel(role: string) {
  switch (role) {
    case "superadmin":
      return "Super Admin"
    case "admin":
      return "Admin"
    default:
      return "Employee"
  }
}

function NotificationPopover({ userId }: { userId: string }) {
  const { data: notifications, isLoading } = useNotifications(userId)
  const markRead = useMarkNotificationRead()
  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  const handleMarkRead = (id: string) => {
    markRead.mutate(id)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex h-12 items-center border-b border-border px-4">
          <h2 className="text-sm font-semibold text-foreground">
            Notifications
          </h2>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "border-b border-border p-3 text-xs last:border-b-0 transition-colors",
                    notif.read ? "bg-background" : "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                        notif.read ? "bg-muted" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${
                          notif.read
                            ? "text-muted-foreground"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                        </span>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            className="text-primary hover:underline text-[10px] flex items-center gap-0.5"
                          >
                            View
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-1 py-0 text-[10px] text-muted-foreground hover:text-foreground"
                            onClick={() => handleMarkRead(notif.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <div className="flex border-t border-border">
          <Link
            href="/dashboard/notifications"
            className="flex-1 flex items-center justify-center gap-1 py-2 px-4 text-xs font-medium text-primary hover:bg-muted transition-colors"
          >
            View all notifications
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SidebarNav({ onLinkClick, collapsed, badges }: { onLinkClick?: () => void; collapsed?: boolean; badges?: Record<string, number> }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "")
  )

  // Group items by section
  const sections: { label: string; items: typeof filteredItems }[] = []
  const sectionMap = new Map<string, typeof filteredItems>()
  for (const item of filteredItems) {
    const sec = item.section || "General"
    if (!sectionMap.has(sec)) {
      sectionMap.set(sec, [])
      sections.push({ label: sec, items: sectionMap.get(sec)! })
    }
    sectionMap.get(sec)!.push(item)
  }

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="flex flex-col gap-1.5 items-center">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href
              const badgeCount = item.badgeKey ? (badges?.[item.badgeKey] ?? 0) : 0
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {item.icon}
                      {badgeCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                          {badgeCount > 9 ? "9+" : badgeCount}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                    {badgeCount > 0 && ` (${badgeCount})`}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </nav>
      </TooltipProvider>
    )
  }

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3">
      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-1">
            <span className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {section.label}
            </span>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              const badgeCount = item.badgeKey ? (badges?.[item.badgeKey] ?? 0) : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center flex-shrink-0 transition-colors",
                    isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                  )}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={cn(
                      "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-sidebar-primary-foreground"
                        : "bg-orange-500 text-white"
                    )}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                  {isActive && badgeCount === 0 && (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
    </nav>
  )
}

function MobileSidebarContent({ onLinkClick, badges }: { onLinkClick?: () => void; badges?: Record<string, number> }) {
  const { user } = useAuth()
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary shadow-md">
          <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
            WorkOps
          </span>
          <span className="text-[10px] text-sidebar-foreground/40">Workplace Portal</span>
        </div>
      </div>
      <SidebarNav onLinkClick={onLinkClick} badges={badges} />
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {getInitials(user?.name || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-sidebar-foreground truncate">
              {user?.name}
            </span>
            <span className="text-[10px] text-sidebar-foreground/40 truncate">
              {getRoleLabel(user?.role || "")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const today = getToday()
  const { data: todayTokens } = useLunchTokens(today)
  const lunchCount = todayTokens?.length ?? 0

  const badges: Record<string, number> = {
    lunchToken: lunchCount,
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out lg:flex lg:flex-col flex-shrink-0",
          sidebarCollapsed ? "w-[68px]" : "w-60"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className={cn(
            "flex h-14 items-center border-b border-sidebar-border",
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary shadow-md">
                  <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
                    WorkOps
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/40">Workplace Portal</span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "h-8 w-8 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground flex-shrink-0 transition-colors",
              )}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Nav */}
          <SidebarNav collapsed={sidebarCollapsed} badges={badges} />

          {/* Footer */}
          <div className={cn(
            "border-t border-sidebar-border",
            sidebarCollapsed ? "p-2" : "p-3"
          )}>
            <div className={cn(
              "flex items-center rounded-lg transition-colors",
              sidebarCollapsed ? "justify-center py-1" : "gap-3 bg-sidebar-accent/50 px-3 py-2.5"
            )}>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                        {getInitials(user?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right" className="text-xs">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-muted-foreground">{getRoleLabel(user?.role || "")}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-sidebar-foreground truncate">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/40 truncate">
                    {getRoleLabel(user?.role || "")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-foreground"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-56 bg-sidebar p-0 text-sidebar-foreground"
              >
                <MobileSidebarContent onLinkClick={() => setMobileOpen(false)} badges={badges} />
              </SheetContent>
            </Sheet>
            <h1 className="text-sm font-medium text-foreground lg:hidden">
              WorkOps
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {user && <NotificationPopover userId={user.id} />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-foreground">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm md:inline-block">
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col gap-0.5">
                      <span>My Profile</span>
                      <span className="text-xs text-muted-foreground">
                        View and manage profile
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <div className="flex flex-col gap-0.5">
                      <span>Settings</span>
                      <span className="text-xs text-muted-foreground">
                        Account & preferences
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    router.push("/")
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
