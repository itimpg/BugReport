import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export async function GET(request: Request) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const monthParam  = searchParams.get("month")      ? parseInt(searchParams.get("month")!)      : null;
  const yearParam   = searchParams.get("year")       ? parseInt(searchParams.get("year")!)       : null;
  const categoryId  = searchParams.get("categoryId") ?? "";

  const service = createSupabaseServiceClient();

  // Resolve category filter
  let categoryBugIds: string[] | null = null;
  if (categoryId) {
    const { data } = await service
      .from("bug_report_categories")
      .select("bug_report_id")
      .eq("category_id", categoryId);
    categoryBugIds = data?.map((r) => r.bug_report_id) ?? [];
  }

  let query = service
    .from("bug_reports")
    .select(`id, title, status, incident_date, created_at, reported_by, users!reported_by ( display_name )`)
    .eq("is_deleted", false);

  if (yearParam) {
    query = query
      .gte("incident_date", `${yearParam}-01-01`)
      .lt("incident_date",  `${yearParam + 1}-01-01`);
  }
  if (monthParam && yearParam) {
    const mo      = monthParam.toString().padStart(2, "0");
    const nextMo  = (monthParam === 12 ? 1 : monthParam + 1).toString().padStart(2, "0");
    const nextYr  = monthParam === 12 ? yearParam + 1 : yearParam;
    query = query
      .gte("incident_date", `${yearParam}-${mo}-01`)
      .lt("incident_date",  `${nextYr}-${nextMo}-01`);
  }
  if (categoryBugIds) query = query.in("id", categoryBugIds);

  const { data: bugs, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const all = bugs ?? [];

  // KPIs
  const totalBugs      = all.length;
  const openBugs       = all.filter((b) => b.status === "Open").length;
  const inProgressBugs = all.filter((b) => b.status === "InProgress").length;
  const resolvedBugs   = all.filter((b) => b.status === "Resolved").length;
  const closedBugs     = all.filter((b) => b.status === "Closed").length;

  // Bugs by category
  const bugIds = all.map((b) => b.id);
  const { data: catLinks } = bugIds.length > 0
    ? await service
        .from("bug_report_categories")
        .select("bug_report_id, categories ( name )")
        .in("bug_report_id", bugIds)
    : { data: [] };

  const catCounts: Record<string, number> = {};
  (catLinks ?? []).forEach((bc) => {
    const name = (bc.categories as any)?.name;
    if (name) catCounts[name] = (catCounts[name] ?? 0) + 1;
  });
  const byCategory = Object.entries(catCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Bugs by month
  const monthCounts: Record<string, number> = {};
  all.forEach((b) => {
    const d   = new Date(b.incident_date ?? b.created_at);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthCounts[key] = (monthCounts[key] ?? 0) + 1;
  });
  const byMonth = Object.entries(monthCounts)
    .map(([key, count]) => {
      const [yr, mo] = key.split("-").map(Number);
      return { year: yr, month: mo, monthName: MONTH_NAMES[mo - 1], count };
    })
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

  // Recent bugs
  const recentBugs = all.slice(0, 10).map((b) => ({
    id:           b.id,
    title:        b.title,
    status:       b.status,
    createdAt:    b.created_at,
    reporterName: (b.users as any)?.display_name ?? "Unknown",
  }));

  return NextResponse.json({ totalBugs, openBugs, inProgressBugs, resolvedBugs, closedBugs, byCategory, byMonth, recentBugs });
}
