"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  onChange: (filters: { month?: number; year?: number; categoryId?: string }) => void;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function DashboardFilters({ onChange }: Props) {
  const [month, setMonth]           = useState<string>("all");
  const [year, setYear]             = useState<string>(String(currentYear));
  const [categoryId, setCategoryId] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  const emit = (updates: Partial<{ month: string; year: string; categoryId: string }>) => {
    const m  = updates.month      ?? month;
    const y  = updates.year       ?? year;
    const c  = updates.categoryId ?? categoryId;
    onChange({
      month:      m !== "all" ? Number(m) : undefined,
      year:       y !== "all" ? Number(y) : undefined,
      categoryId: c !== "all" ? c         : undefined,
    });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Select value={month} onValueChange={(v) => { setMonth(v); emit({ month: v }); }}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Month" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={(v) => { setYear(v); emit({ year: v }); }}>
        <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); emit({ categoryId: v }); }}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
