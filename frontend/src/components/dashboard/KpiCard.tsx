import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  blue:   "bg-blue-50   text-blue-600",
  red:    "bg-red-50    text-red-600",
  yellow: "bg-yellow-50 text-yellow-600",
  green:  "bg-green-50  text-green-600",
  gray:   "bg-gray-100  text-gray-500",
};

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export function KpiCard({ label, value, icon: Icon, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={cn("p-2.5 rounded-lg", colorMap[color] ?? colorMap.blue)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
