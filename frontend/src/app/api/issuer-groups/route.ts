import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("issuer_groups")
    .select("id, name, created_at, updated_at")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map((g) => ({ id: g.id, name: g.name, createdAt: g.created_at, updatedAt: g.updated_at }))
  );
}

export async function POST(request: Request) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("issuer_groups")
    .insert({ name })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at }, { status: 201 });
}
