"use client";

import { useAuth } from "@/lib/auth-context";
import { useServiceRequests, useAnnouncements } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function AdminDashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading: reqLoading } = useServiceRequests();
  const { data: announcements, isLoading: annLoading } = useAnnouncements();

  const pending = requests?.filter((r) => r.status === "pending").length ?? 0;
  const inProgress =
    requests?.filter((r) => r.status === "in-progress").length ?? 0;
  const resolved = requests?.filter((r) => r.status === "resolved").length ?? 0;
  const total = requests?.length ?? 0;

  const urgentRequests =
    requests
      ?.filter((r) => r.status === "pending" || r.status === "in-progress")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 6) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and resolve office service requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/requests/new">
              <Plus className="mr-1 h-4 w-4" />
              New Request
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/analytics">
              <BarChart3 className="mr-1 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {reqLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{total}</p>
                  <p className="text-xs text-muted-foreground">
                    Total Requests
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pending}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {inProgress}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {resolved}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Active Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Active Requests
          </CardTitle>
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
          {reqLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : urgentRequests.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No active requests.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {urgentRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/dashboard/requests/${req.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">
                      {req.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {req.id} - by {req.createdByName} -{" "}
                      {format(new Date(req.createdAt), "MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.priority === "high" && (
                      <span className="text-xs font-medium text-red-600">
                        High
                      </span>
                    )}
                    <StatusBadge status={req.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
