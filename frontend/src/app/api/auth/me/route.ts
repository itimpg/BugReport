import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/supabase/server";

export async function GET() {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(profile);
}
