import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page     = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") ?? "10"));
  const search   = searchParams.get("search") ?? "";
  const offset   = (page - 1) * pageSize;

  const service = createSupabaseServiceClient();
  let query = service
    .from("users")
    .select("id, email, display_name, role, is_disabled, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (search) query = query.ilike("email", `%${search}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalCount = count ?? 0;
  return NextResponse.json({
    items:      (data ?? []).map((u) => ({
        id:          u.id,
        email:       u.email,
        displayName: u.display_name,
        role:        u.role,
        isDisabled:  u.is_disabled,
        createdAt:   u.created_at,
      })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  });
}
