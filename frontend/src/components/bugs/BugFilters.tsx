"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Filters {
  search?: string;
  categoryId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface Props {
  categories: Category[];
  onChange: (filters: Filters) => void;
}

const STATUSES = ["Open", "InProgress", "Resolved", "Closed"];

function currentMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

const defaultRange = currentMonthRange();

export function BugFilters({ categories, onChange }: Props) {
  const [search, setSearch]         = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus]         = useState("all");
  const [dateFrom, setDateFrom]     = useState(defaultRange.from);
  const [dateTo, setDateTo]         = useState(defaultRange.to);

  const emit = (updates: Partial<{ search: string; categoryId: string; status: string; dateFrom: string; dateTo: string }>) => {
    const s   = updates.search     ?? search;
    const c   = updates.categoryId ?? categoryId;
    const st  = updates.status     ?? status;
    const df  = updates.dateFrom   ?? dateFrom;
    const dt  = updates.dateTo     ?? dateTo;
    onChange({
      search:     s  || undefined,
      categoryId: c  !== "all" ? c  : undefined,
      status:     st !== "all" ? st : undefined,
      dateFrom:   df || undefined,
      dateTo:     dt || undefined,
    });
  };

  return (
    <div className="flex gap-3 flex-wrap items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by title..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); emit({ search: e.target.value }); }}
        />
      </div>

      <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); emit({ categoryId: v }); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => { setStatus(v); emit({ status: v }); }}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "InProgress" ? "In Progress" : s}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 flex-1 sm:flex-none">
        <Input
          type="date"
          className="flex-1 sm:w-36"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(e) => { setDateFrom(e.target.value); emit({ dateFrom: e.target.value }); }}
        />
        <span className="text-gray-400 text-sm">—</span>
        <Input
          type="date"
          className="flex-1 sm:w-36"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(e) => { setDateTo(e.target.value); emit({ dateTo: e.target.value }); }}
        />
      </div>
    </div>
  );
}
