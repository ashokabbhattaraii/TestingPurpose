"use client"

import { useAuth } from "@/lib/auth-context"
import { useServiceRequests } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ConnectedAccounts } from "@/components/connected-accounts"
import {
  Mail,
  Building,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  Edit3,
  Link as LinkIcon,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const roleLabel: Record<string, string> = {
  employee: "Employee",
  admin: "Admin",
  superadmin: "Super Admin",
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: requests } = useServiceRequests(user?.id)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)

  if (!user) return null

  const recentRequests = requests?.slice(0, 5) ?? []

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/settings" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-transparent"
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              title="Update profile picture"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                {roleLabel[user.role]}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700"
              >
                <CheckCircle className="h-3 w-3" />
                {user.status}
              </Badge>
            </div>

            <Separator className="my-2 w-full" />

            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">
                  Department
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {user.department}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">
                  Joined
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {format(new Date(user.joinedAt), "MMM yyyy")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">
                  Role
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {roleLabel[user.role]}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">
                  Status
                </span>
                <span className="text-sm font-semibold capitalize text-green-600">
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  Last Login
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.lastLogin
                    ? format(
                        new Date(user.lastLogin),
                        "MMM d, yyyy 'at' h:mm a"
                      )
                    : "Never"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  Account Created
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(user.joinedAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  Email
                </span>
                <span className="text-xs text-muted-foreground break-all">
                  {user.email}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <Building className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  Department
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.department}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Social Accounts */}
      <ConnectedAccounts accounts={user.socialAccounts} />

      {/* Request History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Recent Service Requests</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/dashboard/requests"
              className="text-xs text-muted-foreground"
            >
              View all
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="py-8 text-center">
              <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No service requests yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first request to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/dashboard/requests/${req.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {req.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {req.id} -{" "}
                      {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <StatusBadge status={req.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild variant="outline" className="justify-center bg-transparent">
          <Link href="/dashboard/requests">View All Requests</Link>
        </Button>
        <Button asChild variant="outline" className="justify-center bg-transparent">
          <Link href="/dashboard/settings">Account Settings</Link>
        </Button>
        <Button asChild variant="outline" className="justify-center bg-transparent">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
