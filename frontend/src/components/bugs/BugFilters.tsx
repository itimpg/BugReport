"use client";

import { useEffect, useRef, useState } from "react";
import type { Category, IssuerGroup } from "@/types";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, Tag, X } from "lucide-react";
import { getBangkokMonthRange } from "@/lib/utils";

interface Filters {
  search?: string;
  categoryIds?: string[];
  issuerGroupId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface Props {
  categories: Category[];
  onChange: (filters: Filters) => void;
}

const STATUSES = ["Open", "InProgress", "Resolved", "Closed"];
const defaultRange = getBangkokMonthRange();

export function BugFilters({ categories, onChange }: Props) {
  const [search, setSearch]           = useState("");
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [issuerGroups, setIssuerGroups] = useState<IssuerGroup[]>([]);
  const [issuerGroupId, setIssuerGroupId] = useState("all");
  const [status, setStatus]           = useState("all");
  const [dateFrom, setDateFrom]       = useState(defaultRange.from);
  const [dateTo, setDateTo]           = useState(defaultRange.to);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<IssuerGroup[]>("/issuer-groups").then(setIssuerGroups).catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setCatDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const emit = (updates: Partial<{ search: string; categoryIds: string[]; issuerGroupId: string; status: string; dateFrom: string; dateTo: string }>) => {
    const s   = updates.search        ?? search;
    const c   = updates.categoryIds   ?? selectedCatIds;
    const ig  = updates.issuerGroupId ?? issuerGroupId;
    const st  = updates.status        ?? status;
    const df  = updates.dateFrom      ?? dateFrom;
    const dt  = updates.dateTo        ?? dateTo;
    onChange({
      search:        s  || undefined,
      categoryIds:   c.length > 0 ? c : undefined,
      issuerGroupId: ig !== "all" ? ig : undefined,
      status:        st !== "all" ? st : undefined,
      dateFrom:      df || undefined,
      dateTo:        dt || undefined,
    });
  };

  const toggleCategory = (id: string) => {
    const next = selectedCatIds.includes(id)
      ? selectedCatIds.filter((c) => c !== id)
      : [...selectedCatIds, id];
    setSelectedCatIds(next);
    emit({ categoryIds: next });
  };

  const clearCategories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCatIds([]);
    emit({ categoryIds: [] });
  };

  const triggerLabel = selectedCatIds.length === 0
    ? "All Categories"
    : selectedCatIds.length === 1
      ? (categories.find((c) => c.id === selectedCatIds[0])?.name ?? "1 selected")
      : `${selectedCatIds.length} selected`;

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

      {/* Multi-select category dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setCatDropOpen((v) => !v)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground min-w-[11rem] justify-between"
        >
          <span className="flex items-center gap-1.5 truncate">
            <Tag className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <span className="flex items-center gap-0.5 shrink-0">
            {selectedCatIds.length > 0 && (
              <span onClick={clearCategories} className="p-0.5 rounded hover:bg-gray-200">
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
        </button>

        {catDropOpen && (
          <div className="absolute top-full mt-1 z-50 bg-white rounded-md border shadow-md w-52 py-1 max-h-60 overflow-y-auto">
            {categories.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">No categories</p>
            )}
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCatIds.includes(c.id)}
                  onChange={() => toggleCategory(c.id)}
                  className="rounded border-gray-300"
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <Select value={issuerGroupId} onValueChange={(v) => { setIssuerGroupId(v); emit({ issuerGroupId: v }); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Issuer Group" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Issuer Groups</SelectItem>
          {issuerGroups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
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
