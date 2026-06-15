"use client";

import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { BugsByCategoryChart } from "@/components/dashboard/BugsByCategoryChart";
import { BugsByMonthChart } from "@/components/dashboard/BugsByMonthChart";
import { RecentBugsTable } from "@/components/dashboard/RecentBugsTable";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { Bug, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role !== "Admin") redirect("/bugs");
  const [data, setData]         = useState<DashboardData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [filters, setFilters]   = useState<{ month?: number; year?: number; categoryId?: string }>({});
  const { toast } = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.month)      params.set("month",      String(filters.month));
    if (filters.year)       params.set("year",       String(filters.year));
    if (filters.categoryId) params.set("categoryId", filters.categoryId);

    setLoading(true);
    api.get<DashboardData>(`/reports/dashboard?${params}`)
      .then(setData)
      .catch(() => toastRef.current({ title: "Error", description: "Failed to load dashboard.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [filters]);

  if (isLoading) return <div className="flex items-center justify-center h-full"><p className="text-gray-500">Loading dashboard...</p></div>;
  if (!data)     return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <DashboardFilters onChange={setFilters} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Total"       value={data.totalBugs}      icon={Bug}          color="blue"   />
        <KpiCard label="Open"        value={data.openBugs}       icon={AlertCircle}  color="red"    />
        <KpiCard label="In Progress" value={data.inProgressBugs} icon={Clock}        color="yellow" />
        <KpiCard label="Resolved"    value={data.resolvedBugs}   icon={CheckCircle2} color="green"  />
        <KpiCard label="Closed"      value={data.closedBugs}     icon={XCircle}      color="gray"   />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BugsByCategoryChart data={data.byCategory} />
        <BugsByMonthChart    data={data.byMonth}    />
      </div>

      <RecentBugsTable bugs={data.recentBugs} />
    </div>
  );
}
