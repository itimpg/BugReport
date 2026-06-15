import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page       = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
  const pageSize   = Math.max(1, parseInt(searchParams.get("pageSize") ?? "10"));
  const search     = searchParams.get("search")     ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const status     = searchParams.get("status")     ?? "";
  const offset     = (page - 1) * pageSize;

  const service = createSupabaseServiceClient();

  // Resolve category filter to bug IDs first
  let categoryBugIds: string[] | null = null;
  if (categoryId) {
    const { data } = await service
      .from("bug_report_categories")
      .select("bug_report_id")
      .eq("category_id", categoryId);
    categoryBugIds = data?.map((r) => r.bug_report_id) ?? [];
    if (categoryBugIds.length === 0) {
      return NextResponse.json({ items: [], totalCount: 0, page, pageSize, totalPages: 0 });
    }
  }

  let query = service
    .from("bug_reports")
    .select(
      `id, title, description, status, incident_date, image_url,
       reported_by, created_at, updated_at,
       users!reported_by ( display_name ),
       bug_report_categories ( categories ( id, name ) )`,
      { count: "exact" }
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (profile.role !== "Admin") query = query.eq("reported_by", profile.id);
  if (status)                   query = query.eq("status", status);
  if (categoryBugIds)           query = query.in("id", categoryBugIds);
  if (search)                   query = query.textSearch("title", search, { type: "websearch" });

  const { data: bugs, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Batch signed URLs for images
  const imagePaths = bugs?.filter((b) => b.image_url).map((b) => b.image_url!) ?? [];
  const signedUrls: Record<string, string> = {};
  if (imagePaths.length > 0) {
    const { data: urls } = await service.storage.from("bug-images").createSignedUrls(imagePaths, 3600);
    urls?.forEach((u) => { if (u.signedUrl) signedUrls[u.path] = u.signedUrl; });
  }

  const items = (bugs ?? []).map((b) => ({
    id:           b.id,
    title:        b.title,
    description:  b.description,
    status:       b.status,
    incidentDate: b.incident_date,
    imageUrl:     b.image_url ? signedUrls[b.image_url] : undefined,
    reportedBy:   b.reported_by,
    reporterName: (b.users as { display_name: string } | null)?.display_name ?? "Unknown",
    createdAt:    b.created_at,
    updatedAt:    b.updated_at,
    categories:   (b.bug_report_categories as { categories: { id: string; name: string } }[])
                    ?.map((bc) => bc.categories).filter(Boolean) ?? [],
  }));

  const totalCount = count ?? 0;
  return NextResponse.json({ items, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) });
}

export async function POST(request: Request) {
  const profile = await getAuthProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData    = await request.formData();
  const title       = formData.get("title")        as string;
  const description = formData.get("description")  as string;
  const incidentDate= formData.get("incidentDate") as string | null;
  const categoryIds = formData.getAll("categoryIds") as string[];
  const image       = formData.get("image") as File | null;

  if (!title || !description)
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });

  const service = createSupabaseServiceClient();
  let imagePath: string | null = null;

  if (image && image.size > 0) {
    const ext      = image.name.split(".").pop() ?? "jpg";
    const fileName = `${randomUUID()}.${ext}`;
    const buffer   = Buffer.from(await image.arrayBuffer());
    const { error: uploadError } = await service.storage
      .from("bug-images")
      .upload(fileName, buffer, { contentType: image.type });
    if (!uploadError) imagePath = fileName;
  }

  const { data: bug, error } = await service
    .from("bug_reports")
    .insert({
      title,
      description,
      incident_date: incidentDate ? new Date(incidentDate).toISOString() : new Date().toISOString(),
      image_url:     imagePath,
      reported_by:   profile.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (categoryIds.length > 0) {
    await service.from("bug_report_categories").insert(
      categoryIds.map((cid) => ({ bug_report_id: bug.id, category_id: cid }))
    );
  }

  return NextResponse.json(bug, { status: 201 });
}
