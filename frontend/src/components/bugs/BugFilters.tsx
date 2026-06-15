"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Props {
  categories: Category[];
  onChange: (filters: { search?: string; categoryId?: string; status?: string }) => void;
}

const STATUSES = ["Open", "InProgress", "Resolved", "Closed"];

export function BugFilters({ categories, onChange }: Props) {
  const [search, setSearch]         = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus]         = useState("all");

  const emit = (updates: Partial<{ search: string; categoryId: string; status: string }>) => {
    const s  = updates.search     ?? search;
    const c  = updates.categoryId ?? categoryId;
    const st = updates.status     ?? status;
    onChange({
      search:     s  || undefined,
      categoryId: c  !== "all" ? c  : undefined,
      status:     st !== "all" ? st : undefined,
    });
  };

  return (
    <div className="flex gap-3 flex-wrap">
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
    </div>
  );
}
