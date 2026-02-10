"use client"

import { useAuth } from "@/lib/auth-context"
import {
  useServiceRequest,
  useUpdateRequestStatus,
  useAssignRequest,
  useUsers,
} from "@/lib/queries"
import { useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Calendar, User, Tag, Flag, UserPlus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useState } from "react"
import type { RequestStatus } from "@/lib/types"
import { toast } from "sonner"

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-800" },
  high: { label: "High", className: "bg-red-100 text-red-800" },
}

export default function RequestDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const id = params.id as string
  const { data: request, isLoading } = useServiceRequest(id)
  const { data: allUsers } = useUsers()
  const updateStatus = useUpdateRequestStatus()
  const assignRequest = useAssignRequest()
  const [newStatus, setNewStatus] = useState<RequestStatus | "">("")
  const [assignTo, setAssignTo] = useState<string>("")

  const isAdminOrSuper =
    user?.role === "admin" || user?.role === "superadmin"

  const handleStatusUpdate = () => {
    if (!newStatus || !request) return
    updateStatus.mutate(
      { id: request.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Request status updated to ${newStatus}.`)
          setNewStatus("")
        },
      }
    )
  }

  const handleAssign = () => {
    if (!assignTo || !request || !user) return
    const targetUser = allUsers?.find((u) => u.id === assignTo)
    if (!targetUser) return
    assignRequest.mutate(
      {
        requestId: request.id,
        assignedToId: targetUser.id,
        assignedToName: targetUser.name,
        assignedByName: user.name,
      },
      {
        onSuccess: () => {
          toast.success(`Request assigned to ${targetUser.name}. They have been notified.`)
          setAssignTo("")
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/dashboard/requests">Back to Requests</Link>
        </Button>
      </div>
    )
  }

  const pConfig = priorityConfig[request.priority]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono text-muted-foreground">
                {request.id}
              </span>
              <CardTitle className="text-lg text-foreground">
                {request.title}
              </CardTitle>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-foreground">
            {request.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm capitalize text-foreground">
                  {request.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <Badge
                  variant="outline"
                  className={`text-xs ${pConfig.className}`}
                >
                  {pConfig.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Requested by</p>
                <p className="text-sm text-foreground">
                  {request.createdByName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">
                  {format(new Date(request.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {request.assignedToName && (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Assigned to</p>
              <p className="text-sm font-medium text-foreground">
                {request.assignedToName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last updated:{" "}
                {format(new Date(request.updatedAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          )}

          {/* Admin: Assign Request */}
          {isAdminOrSuper &&
            request.status !== "resolved" &&
            request.status !== "rejected" && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Assign To
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={assignTo}
                    onValueChange={setAssignTo}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers
                        ?.filter((u) => u.id !== request.createdBy)
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.department})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssign}
                    disabled={!assignTo || assignRequest.isPending}
                    size="sm"
                    variant="outline"
                  >
                    {assignRequest.isPending ? "Assigning..." : "Assign"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The assigned person will be notified automatically.
                </p>
              </div>
            )}

          {/* Admin: Update Status */}
          {isAdminOrSuper &&
            request.status !== "resolved" &&
            request.status !== "rejected" && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">
                  Update Status
                </p>
                <div className="flex gap-2">
                  <Select
                    value={newStatus}
                    onValueChange={(v) =>
                      setNewStatus(v as RequestStatus)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || updateStatus.isPending}
                    size="sm"
                  >
                    {updateStatus.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
