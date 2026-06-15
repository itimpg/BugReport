import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export async function GET(request: Request) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const service = createSupabaseServiceClient();
  const { data: bugs, error } = await service
    .from("bug_reports")
    .select("incident_date")
    .eq("is_deleted", false)
    .gte("incident_date", `${year}-01-01`)
    .lt("incident_date",  `${year + 1}-01-01`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const monthCounts: Record<number, number> = {};
  (bugs ?? []).forEach((b) => {
    const mo = new Date(b.incident_date).getMonth() + 1;
    monthCounts[mo] = (monthCounts[mo] ?? 0) + 1;
  });

  const data = Array.from({ length: 12 }, (_, i) => ({
    year,
    month:     i + 1,
    monthName: MONTH_NAMES[i],
    count:     monthCounts[i + 1] ?? 0,
  }));

  return NextResponse.json(data);
}
