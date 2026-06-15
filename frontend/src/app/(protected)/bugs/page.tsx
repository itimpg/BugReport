"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { BugReportList, Category } from "@/types";
import { BugReportTable } from "@/components/bugs/BugReportTable";
import { BugFilters } from "@/components/bugs/BugFilters";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BugsPage() {
  const [bugList, setBugList]   = useState<BugReportList | null>(null);
  const [categories, setCats]   = useState<Category[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage]         = useState(1);
  const [filters, setFilters]   = useState<{ search?: string; categoryId?: string; status?: string }>({});
  const { toast } = useToast();

  const fetchBugs = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (filters.search)     params.set("search",     filters.search);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.status)     params.set("status",     filters.status);

    setLoading(true);
    api.get<BugReportList>(`/bugs?${params}`)
      .then(setBugList)
      .catch(() => toast({ title: "Error", description: "Failed to load bugs.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, filters, toast]);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bug Reports</h1>
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
