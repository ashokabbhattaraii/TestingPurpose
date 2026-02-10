"use client"

import { useAuth } from "@/lib/auth-context"
import { useUsers, useUpdateUserRole } from "@/lib/queries"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { format } from "date-fns"
import type { UserRole } from "@/lib/types"
import { Shield } from "lucide-react"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const roleBadge: Record<string, string> = {
  employee: "bg-muted text-muted-foreground",
  admin: "bg-blue-100 text-blue-800",
  superadmin: "bg-primary/10 text-primary",
}

const roleLabel: Record<string, string> = {
  employee: "Employee",
  admin: "Admin",
  superadmin: "Super Admin",
}

export default function UsersPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const { data: allUsers, isLoading } = useUsers()
  const updateRole = useUpdateUserRole()

  useEffect(() => {
    if (user && user.role !== "superadmin") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user?.role !== "superadmin") return null

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRole.mutate(
      { userId, role: newRole },
      {
        onSuccess: () => {
          // Refresh current user in case super admin changed their own role
          refreshUser()
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all system users and manage their roles. Role changes take effect immediately.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg border border-border">
            <div className="col-span-4 text-xs font-semibold text-muted-foreground">
              User
            </div>
            <div className="col-span-3 text-xs font-semibold text-muted-foreground">
              Department
            </div>
            <div className="col-span-2 text-xs font-semibold text-muted-foreground">
              Joined
            </div>
            <div className="col-span-3 text-xs font-semibold text-muted-foreground text-right">
              Role
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {allUsers?.map((u) => {
              const isSelf = u.id === user.id
              return (
                <Card key={u.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                  <CardContent className="p-0">
                    <div className="hidden lg:grid grid-cols-12 gap-4 items-center p-4">
                      {/* User Info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {u.name}
                            </span>
                            {isSelf && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-primary/10 text-primary flex-shrink-0"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      {/* Department */}
                      <div className="col-span-3">
                        <span className="text-sm text-foreground">
                          {u.department}
                        </span>
                      </div>

                      {/* Joined Date */}
                      <div className="col-span-2">
                        <span className="text-sm text-foreground">
                          {format(new Date(u.joinedAt), "MMM yyyy")}
                        </span>
                      </div>

                      {/* Role Selector */}
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Select
                          value={u.role}
                          onValueChange={(value) =>
                            handleRoleChange(u.id, value as UserRole)
                          }
                          disabled={isSelf || updateRole.isPending}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden flex flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {u.name}
                            </span>
                            {isSelf && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-primary/10 text-primary"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department</span>
                          <span className="text-foreground font-medium">
                            {u.department}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined</span>
                          <span className="text-foreground font-medium">
                            {format(new Date(u.joinedAt), "MMM yyyy")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Role</span>
                        <div className="flex-1" />
                        <Select
                          value={u.role}
                          onValueChange={(value) =>
                            handleRoleChange(u.id, value as UserRole)
                          }
                          disabled={isSelf || updateRole.isPending}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900">
          Note: Role Management
        </p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Role changes take effect immediately system-wide</li>
          <li>• You cannot change your own role</li>
          <li>• Super Admin has full system access</li>
          <li>• Admin can manage announcements and view analytics</li>
        </ul>
      </div>
    </div>
  )
}
