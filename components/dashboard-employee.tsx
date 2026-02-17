"use client";

import { useAuth } from "@/lib/auth-context";
import { useServiceRequests, useAnnouncements, useLunchTokens } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Megaphone,
  UtensilsCrossed,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const PRIORITY_CONFIG = {
  high: { label: "High", icon: ArrowUp, className: "text-red-600 bg-red-50" },
  medium: { label: "Med", icon: ArrowRight, className: "text-amber-600 bg-amber-50" },
  low: { label: "Low", icon: ArrowDown, className: "text-emerald-600 bg-emerald-50" },
} as const;

function PriorityBadge({ priority }: { priority: "low" | "medium" | "high" }) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading: reqLoading } = useServiceRequests(
    user?.id,
  );
  const { data: announcements, isLoading: annLoading } = useAnnouncements();
  const today = new Date().toISOString().split("T")[0];
  const { data: todayTokens, isLoading: tokenLoading } = useLunchTokens(today);
  const tokenCount = todayTokens?.length ?? 0;

  const pending = requests?.filter((r) => r.status === "pending").length ?? 0;
  const inProgress =
    requests?.filter((r) => r.status === "in-progress").length ?? 0;
  const resolved = requests?.filter((r) => r.status === "resolved").length ?? 0;
  const total = requests?.length ?? 0;

  const recentRequests = requests?.slice(0, 5) ?? [];
  const pinnedAnnouncements =
    announcements?.filter((a) => a.pinned).slice(0, 2) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is a summary of your service requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/requests">
            <Button className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {reqLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
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
                  <p className="text-xs text-muted-foreground">Total</p>
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
            <Link href="/dashboard/lunch">
              <Card className="transition-colors hover:bg-muted/30 h-full">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                    <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {tokenLoading ? "-" : tokenCount}
                    </p>
                    <p className="text-xs text-muted-foreground">{"Today's Tokens"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Requests */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Your Recent Requests
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
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No requests yet. Create your first request.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentRequests.map((req) => (
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
                        {req.id} - {format(new Date(req.createdAt), "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Announcements
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/dashboard/announcements"
                className="text-xs text-muted-foreground"
              >
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {annLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : pinnedAnnouncements.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No announcements.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {pinnedAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="flex items-start gap-2 rounded-md border border-border p-3"
                  >
                    <Megaphone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {ann.title}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {ann.content}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
