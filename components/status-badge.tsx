import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  "on-hold": {
    label: "On Hold",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
