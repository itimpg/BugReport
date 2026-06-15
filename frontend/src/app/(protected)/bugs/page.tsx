"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { BugReportList, Category } from "@/types";
import { BugReportTable } from "@/components/bugs/BugReportTable";
import { BugFilters } from "@/components/bugs/BugFilters";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function BugsPage() {
  const { user } = useAuth();
  const [bugList, setBugList]   = useState<BugReportList | null>(null);
  const [categories, setCats]   = useState<Category[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage]         = useState(1);
  const [filters, setFilters]   = useState<{ search?: string; categoryId?: string; status?: string; dateFrom?: string; dateTo?: string }>(() => {
    const now  = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { dateFrom: from, dateTo: to };
  });
  const { toast } = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const fetchBugs = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (filters.search)     params.set("search",     filters.search);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.status)     params.set("status",     filters.status);
    if (filters.dateFrom)   params.set("dateFrom",   filters.dateFrom);
    if (filters.dateTo)     params.set("dateTo",     filters.dateTo);

    setLoading(true);
    api.get<BugReportList>(`/bugs?${params}`)
      .then(setBugList)
      .catch(() => toastRef.current({ title: "Error", description: "Failed to load bugs.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCats).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const handleDelete = async (id: string) => {
    await api.delete(`/bugs/${id}`);
    fetchBugs();
    toast({ title: "Deleted", description: "Bug report deleted." });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bug Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.role === "Admin" ? "Viewing all bug reports" : "Viewing your bug reports"}
          </p>
        </div>
        <Button asChild>
          <Link href="/bugs/create"><Plus className="mr-2 h-4 w-4" /> New Bug Report</Link>
        </Button>
      </div>

      <BugFilters categories={categories} onChange={(f) => { setFilters(f); setPage(1); }} />

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <BugReportTable bugs={bugList?.items ?? []} onDelete={handleDelete} />
          {bugList && bugList.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={bugList.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
