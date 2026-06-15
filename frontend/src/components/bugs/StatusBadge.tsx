import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  Open:       { label: "Open",        className: "bg-red-100    text-red-700    border-red-200" },
  InProgress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Resolved:   { label: "Resolved",    className: "bg-green-100  text-green-700  border-green-200" },
  Closed:     { label: "Closed",      className: "bg-gray-100   text-gray-600   border-gray-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
