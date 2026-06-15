import { NextResponse } from "next/server";
import { getAuthProfile, createSupabaseServiceClient } from "@/lib/supabase/server";
import { decryptBuffer } from "@/lib/encryption";

const MIME: Record<string, string> = {
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  gif:  "image/gif",
  webp: "image/webp",
};

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, { params }: Params) {
  const profile = await getAuthProfile();
  if (!profile) return new NextResponse("Unauthorized", { status: 401 });

  const { path } = await params;
  const filePath = path.join("/");

  const service = createSupabaseServiceClient();
  const { data, error } = await service.storage.from("bug-images").download(filePath);
  if (error || !data) return new NextResponse("Not found", { status: 404 });

  const encryptedBuffer = Buffer.from(await data.arrayBuffer());

  let imageBuffer: Buffer;
  try {
    imageBuffer = decryptBuffer(encryptedBuffer);
  } catch {
    return new NextResponse("Decryption failed", { status: 500 });
  }

  // filename is {uuid}.{ext}.enc — extract ext from second-to-last segment
  const segments = filePath.split(".");
  const ext = segments.length >= 2 ? segments[segments.length - 2].toLowerCase() : "jpg";
  const contentType = MIME[ext] ?? "image/jpeg";

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
