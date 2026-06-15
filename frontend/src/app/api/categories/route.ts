import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("categories")
    .select("id, name, description, created_at, updated_at")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map((c) => ({ id: c.id, name: c.name, description: c.description, createdAt: c.created_at, updatedAt: c.updated_at }))
  );
}

export async function POST(request: Request) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description } = await request.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("categories")
    .insert({ name, description: description ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, name: data.name, description: data.description, createdAt: data.created_at, updatedAt: data.updated_at }, { status: 201 });
}
