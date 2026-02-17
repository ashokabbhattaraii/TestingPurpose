"use client"

import { useServiceRequests, useUsers, useAnalytics, useLunchTokens } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ClipboardList,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  UtensilsCrossed,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function SuperadminDashboard() {
  const { data: requests, isLoading: reqLoading } = useServiceRequests()
  const { data: users, isLoading: userLoading } = useUsers()
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const today = new Date().toISOString().split("T")[0]
  const { data: todayTokens, isLoading: tokenLoading } = useLunchTokens(today)
  const tokenCount = todayTokens?.length ?? 0

  const total = requests?.length ?? 0
  const totalUsers = users?.length ?? 0
  const avgTime = analytics?.avgResolutionTimeHours ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            System Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor operations and system-wide metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/analytics">
              <BarChart3 className="mr-1 h-4 w-4" />
              Full Analytics
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/users">
              <Users className="mr-1 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {reqLoading || userLoading || analyticsLoading ? (
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
                  <p className="text-xs text-muted-foreground">
                    Total Requests
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {totalUsers}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {avgTime}h
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg Resolution
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics?.resolvedRequests ?? 0}
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

      {/* Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Requests by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <Skeleton className="h-52" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics?.requestsByMonth ?? []}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(214, 20%, 90%)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(217, 91%, 50%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
