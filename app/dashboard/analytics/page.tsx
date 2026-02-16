"use client";

import { useAuth } from "@/lib/auth-context";
import { useAnalytics, useServiceRequests } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Filter,
  X,
  TrendingUp,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { format, subDays, subMonths, isAfter, parseISO } from "date-fns";
import type { ServiceRequest, RequestStatus } from "@/lib/types";

const PIE_COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(10, 100%, 67%)",
  "hsl(0, 84%, 60%)",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "on-hold": "bg-orange-100 text-orange-700",
  resolved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

type TimePeriod = "7d" | "30d" | "3m" | "6m" | "1y" | "all";
type DrillDownType = "month" | "category" | "status" | null;

interface DrillDownState {
  type: DrillDownType;
  label: string;
  filterValue: string;
}

function getTimePeriodLabel(period: TimePeriod) {
  switch (period) {
    case "7d": return "Last 7 days";
    case "30d": return "Last 30 days";
    case "3m": return "Last 3 months";
    case "6m": return "Last 6 months";
    case "1y": return "Last year";
    case "all": return "All time";
  }
}

function filterByTimePeriod(requests: ServiceRequest[], period: TimePeriod): ServiceRequest[] {
  if (period === "all") return requests;
  const now = new Date();
  let cutoff: Date;
  switch (period) {
    case "7d": cutoff = subDays(now, 7); break;
    case "30d": cutoff = subDays(now, 30); break;
    case "3m": cutoff = subMonths(now, 3); break;
    case "6m": cutoff = subMonths(now, 6); break;
    case "1y": cutoff = subMonths(now, 12); break;
  }
  return requests.filter((r) => isAfter(parseISO(r.createdAt), cutoff));
}

function computeAnalytics(requests: ServiceRequest[]) {
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const inProgressRequests = requests.filter((r) => r.status === "in-progress").length;
  const onHoldRequests = requests.filter((r) => r.status === "on-hold").length;
  const resolvedRequests = requests.filter((r) => r.status === "resolved").length;

  const resolved = requests.filter((r) => r.status === "resolved");
  let avgResolutionTimeHours = 0;
  if (resolved.length > 0) {
    const totalMs = resolved.reduce((acc, r) => {
      return acc + (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime());
    }, 0);
    avgResolutionTimeHours = Math.round(totalMs / resolved.length / (1000 * 60 * 60));
  }

  const categoryMap = new Map<string, number>();
  requests.forEach((r) => {
    categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + 1);
  });
  const requestsByCategory = Array.from(categoryMap, ([category, count]) => ({ category, count }));

  const monthMap = new Map<string, number>();
  requests.forEach((r) => {
    const m = format(parseISO(r.createdAt), "MMM yyyy");
    monthMap.set(m, (monthMap.get(m) ?? 0) + 1);
  });
  const requestsByMonth = Array.from(monthMap, ([month, count]) => ({ month, count }));

  const statusMap = new Map<string, number>();
  requests.forEach((r) => {
    const label = r.status.charAt(0).toUpperCase() + r.status.slice(1).replace("-", " ");
    statusMap.set(label, (statusMap.get(label) ?? 0) + 1);
  });
  const requestsByStatus = Array.from(statusMap, ([status, count]) => ({ status, count }));

  return {
    totalRequests,
    pendingRequests,
    inProgressRequests,
    onHoldRequests,
    resolvedRequests,
    avgResolutionTimeHours,
    requestsByCategory,
    requestsByMonth,
    requestsByStatus,
  };
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("-", " ")}
    </span>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: allRequests, isLoading: reqLoading } = useServiceRequests();
  const { isLoading: analyticsLoading } = useAnalytics();

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [drillDown, setDrillDown] = useState<DrillDownState | null>(null);

  const isLoading = reqLoading || analyticsLoading;

  useEffect(() => {
    if (user && user.role === "employee") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Compute filtered analytics from raw requests
  const filteredRequests = useMemo(() => {
    if (!allRequests) return [];
    let filtered = filterByTimePeriod(allRequests, timePeriod);
    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    return filtered;
  }, [allRequests, timePeriod, categoryFilter, statusFilter]);

  const analytics = useMemo(() => computeAnalytics(filteredRequests), [filteredRequests]);

  // Drill-down: get filtered requests for a clicked chart segment
  const drillDownRequests = useMemo(() => {
    if (!drillDown || !allRequests) return [];
    let base = filterByTimePeriod(allRequests, timePeriod);
    if (categoryFilter !== "all") base = base.filter((r) => r.category === categoryFilter);
    if (statusFilter !== "all") base = base.filter((r) => r.status === statusFilter);

    switch (drillDown.type) {
      case "month":
        return base.filter((r) => format(parseISO(r.createdAt), "MMM yyyy") === drillDown.filterValue);
      case "category":
        return base.filter((r) => r.category === drillDown.filterValue);
      case "status":
        return base.filter(
          (r) => r.status.charAt(0).toUpperCase() + r.status.slice(1).replace("-", " ") === drillDown.filterValue
        );
      default:
        return [];
    }
  }, [drillDown, allRequests, timePeriod, categoryFilter, statusFilter]);

  // Drill-down pagination & search
  const DRILLDOWN_PAGE_SIZE = 10;
  const [ddPage, setDdPage] = useState(1);
  const [ddSearch, setDdSearch] = useState("");

  // Reset drill-down pagination when drill-down changes
  useEffect(() => {
    setDdPage(1);
    setDdSearch("");
  }, [drillDown]);

  const filteredDrillDown = useMemo(() => {
    if (!ddSearch.trim()) return drillDownRequests;
    const q = ddSearch.toLowerCase();
    return drillDownRequests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.createdByName.toLowerCase().includes(q)
    );
  }, [drillDownRequests, ddSearch]);

  const ddTotalPages = Math.ceil(filteredDrillDown.length / DRILLDOWN_PAGE_SIZE);
  const paginatedDrillDown = filteredDrillDown.slice(
    (ddPage - 1) * DRILLDOWN_PAGE_SIZE,
    ddPage * DRILLDOWN_PAGE_SIZE
  );

  const activeFilterCount = [
    timePeriod !== "all" ? 1 : 0,
    categoryFilter !== "all" ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setTimePeriod("all");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // Export helpers
  const exportCSV = (data: ServiceRequest[], filename: string) => {
    const headers = ["ID", "Title", "Category", "Status", "Priority", "Created By", "Assigned To", "Created At", "Updated At"];
    const rows = data.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.status,
      r.priority,
      r.createdByName,
      r.assignedToName ?? "",
      format(parseISO(r.createdAt), "yyyy-MM-dd HH:mm"),
      format(parseISO(r.updatedAt), "yyyy-MM-dd HH:mm"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csv, `${filename}.csv`, "text/csv");
  };

  const exportJSON = (data: ServiceRequest[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, "application/json");
  };

  const exportSummaryTXT = (filename: string) => {
    const lines = [
      `Analytics Report - ${getTimePeriodLabel(timePeriod)}`,
      `Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`,
      "",
      "--- Summary ---",
      `Total Requests: ${analytics.totalRequests}`,
      `Pending: ${analytics.pendingRequests}`,
      `In Progress: ${analytics.inProgressRequests}`,
      `On Hold: ${analytics.onHoldRequests}`,
      `Resolved: ${analytics.resolvedRequests}`,
      `Avg Resolution Time: ${analytics.avgResolutionTimeHours}h`,
      "",
      "--- By Category ---",
      ...analytics.requestsByCategory.map((c) => `  ${c.category}: ${c.count}`),
      "",
      "--- By Month ---",
      ...analytics.requestsByMonth.map((m) => `  ${m.month}: ${m.count}`),
      "",
      "--- By Status ---",
      ...analytics.requestsByStatus.map((s) => `  ${s.status}: ${s.count}`),
    ];
    downloadFile(lines.join("\n"), `${filename}.txt`, "text/plain");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportFilename = `analytics-${timePeriod}-${format(new Date(), "yyyyMMdd")}`;

  if (user?.role === "employee") return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Resolution metrics and request distribution.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => exportCSV(filteredRequests, exportFilename)} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportJSON(filteredRequests, exportFilename)} className="gap-2 cursor-pointer">
              <FileJson className="h-4 w-4 text-blue-600" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportSummaryTXT(exportFilename)} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4 text-orange-600" />
              Export Summary (TXT)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
                <SelectTrigger className="h-9 w-[150px] text-xs">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[160px] text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food and Supplies">Food and Supplies</SelectItem>
                  <SelectItem value="Office Maintenance">Office Maintenance</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[140px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs gap-1">
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {isLoading ? (
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
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.totalRequests}
                  </p>
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
                    {analytics.pendingRequests}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.inProgressRequests}
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
                    {analytics.resolvedRequests}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
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
                    {analytics.avgResolutionTimeHours}h
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Resolve</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Requests by Month - Clickable */}
        <Card className="group">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Requests by Month
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">Click a bar for details</span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-60" />
            ) : analytics.requestsByMonth.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={analytics.requestsByMonth}
                  className="cursor-pointer"
                  onClick={(state) => {
                    if (state?.activePayload?.[0]) {
                      const payload = state.activePayload[0].payload;
                      setDrillDown({
                        type: "month",
                        label: `Requests in ${payload.month}`,
                        filterValue: payload.month,
                      });
                    }
                  }}
                >
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(214, 20%, 90%)",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "hsl(214, 20%, 95%)" }}
                  />
                  <Bar dataKey="count" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Requests by Category - Clickable Pie */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Requests by Category
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">Click a slice for details</span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-60" />
            ) : analytics.requestsByCategory.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.requestsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                    className="cursor-pointer"
                    onClick={(data) => {
                      if (data?.category) {
                        setDrillDown({
                          type: "category",
                          label: `${data.category} Requests`,
                          filterValue: data.category,
                        });
                      }
                    }}
                  >
                    {analytics.requestsByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(214, 20%, 90%)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Requests by Status - Clickable */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Requests by Status
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">Click a bar for details</span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-60" />
            ) : analytics.requestsByStatus.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={analytics.requestsByStatus}
                  layout="vertical"
                  className="cursor-pointer"
                  onClick={(state) => {
                    if (state?.activePayload?.[0]) {
                      const payload = state.activePayload[0].payload;
                      setDrillDown({
                        type: "status",
                        label: `${payload.status} Requests`,
                        filterValue: payload.status,
                      });
                    }
                  }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={85} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(214, 20%, 90%)",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "hsl(214, 20%, 95%)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {analytics.requestsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drill-Down Dialog */}
      <Dialog open={drillDown !== null} onOpenChange={(open) => { if (!open) setDrillDown(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              {drillDown?.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {filteredDrillDown.length} request{filteredDrillDown.length !== 1 ? "s" : ""}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Search + export for drill-down */}
          {drillDownRequests.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, ID, or author..."
                  value={ddSearch}
                  onChange={(e) => { setDdSearch(e.target.value); setDdPage(1); }}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shrink-0">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => exportCSV(filteredDrillDown, `drilldown-${drillDown?.filterValue ?? "data"}`)} className="gap-2 cursor-pointer text-xs">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportJSON(filteredDrillDown, `drilldown-${drillDown?.filterValue ?? "data"}`)} className="gap-2 cursor-pointer text-xs">
                    <FileJson className="h-3.5 w-3.5 text-blue-600" />
                    JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Requests list */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {filteredDrillDown.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {ddSearch ? "No matching requests found." : "No requests found."}
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-2">
                {paginatedDrillDown.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => {
                      setDrillDown(null);
                      router.push(`/dashboard/requests/${req.id}`);
                    }}
                    className="flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                        <span className="text-[10px] capitalize text-muted-foreground">{req.category}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{req.title}</span>
                      <span className="text-xs text-muted-foreground">by {req.createdByName}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(req.createdAt), "MMM d, yyyy")}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drill-down pagination */}
          {ddTotalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3 -mx-6 px-6">
              <p className="text-xs text-muted-foreground">
                {(ddPage - 1) * DRILLDOWN_PAGE_SIZE + 1}-{Math.min(ddPage * DRILLDOWN_PAGE_SIZE, filteredDrillDown.length)} of {filteredDrillDown.length}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setDdPage((p) => Math.max(1, p - 1))}
                  disabled={ddPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: Math.min(ddTotalPages, 5) }, (_, i) => {
                  let page: number;
                  if (ddTotalPages <= 5) {
                    page = i + 1;
                  } else if (ddPage <= 3) {
                    page = i + 1;
                  } else if (ddPage >= ddTotalPages - 2) {
                    page = ddTotalPages - 4 + i;
                  } else {
                    page = ddPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={ddPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-7 p-0 text-xs"
                      onClick={() => setDdPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setDdPage((p) => Math.min(ddTotalPages, p + 1))}
                  disabled={ddPage === ddTotalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
