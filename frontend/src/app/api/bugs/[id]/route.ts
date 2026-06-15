import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const service = createSupabaseServiceClient();

  const { data: bug, error } = await service
    .from("bug_reports")
    .select(
      `id, title, description, status, incident_date, image_url,
       reported_by, created_at, updated_at,
       users!reported_by ( display_name ),
       bug_report_categories ( categories ( id, name ) )`
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error || !bug) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (profile.role !== "Admin" && bug.reported_by !== profile.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let imageUrl: string | undefined;
  if (bug.image_url) {
    const { data } = await service.storage.from("bug-images").createSignedUrl(bug.image_url, 3600);
    imageUrl = data?.signedUrl ?? undefined;
  }

  return NextResponse.json({
    id:           bug.id,
    title:        bug.title,
    description:  bug.description,
    status:       bug.status,
    incidentDate: bug.incident_date,
    imageUrl,
    reportedBy:   bug.reported_by,
    reporterName: (bug.users as { display_name: string } | null)?.display_name ?? "Unknown",
    createdAt:    bug.created_at,
    updatedAt:    bug.updated_at,
    categories:   (bug.bug_report_categories as { categories: { id: string; name: string } }[])
                    ?.map((bc) => bc.categories).filter(Boolean) ?? [],
  });
}

export async function PUT(request: Request, { params }: Params) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const service = createSupabaseServiceClient();

  const { data: existing, error: fetchError } = await service
    .from("bug_reports")
    .select("id, reported_by, image_url")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (fetchError || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (profile.role !== "Admin" && existing.reported_by !== profile.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData     = await request.formData();
  const title        = formData.get("title")        as string;
  const description  = formData.get("description")  as string;
  const incidentDate = formData.get("incidentDate") as string | null;
  const status       = formData.get("status")       as string | null;
  const categoryIds  = formData.getAll("categoryIds") as string[];
  const image        = formData.get("image") as File | null;

  let imagePath = existing.image_url as string | null;

  if (image && image.size > 0) {
    // Delete old image
    if (existing.image_url) {
      await service.storage.from("bug-images").remove([existing.image_url]);
    }
    const ext      = image.name.split(".").pop() ?? "jpg";
    const fileName = `${randomUUID()}.${ext}`;
    const buffer   = Buffer.from(await image.arrayBuffer());
    const { error: uploadError } = await service.storage
      .from("bug-images")
      .upload(fileName, buffer, { contentType: image.type });
    if (!uploadError) imagePath = fileName;
  }

  const updateData: Record<string, unknown> = {};
  if (title)        updateData.title        = title;
  if (description)  updateData.description  = description;
  if (incidentDate) updateData.incident_date = new Date(incidentDate).toISOString();
  if (status && profile.role === "Admin") updateData.status = status;
  updateData.image_url = imagePath;

  const { data: updated, error } = await service
    .from("bug_reports")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace categories
  await service.from("bug_report_categories").delete().eq("bug_report_id", id);
  if (categoryIds.length > 0) {
    await service.from("bug_report_categories").insert(
      categoryIds.map((cid) => ({ bug_report_id: id, category_id: cid }))
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const service = createSupabaseServiceClient();

  const { data: existing, error: fetchError } = await service
    .from("bug_reports")
    .select("id, reported_by")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (fetchError || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (profile.role !== "Admin" && existing.reported_by !== profile.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await service.from("bug_reports").update({ is_deleted: true }).eq("id", id);
  return new NextResponse(null, { status: 204 });
}
