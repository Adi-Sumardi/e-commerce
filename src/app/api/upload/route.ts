import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

// Upload disimpan di disk lokal server (public/uploads) — cocok untuk dev/VPS.
// Kalau nanti deploy ke platform serverless (mis. Vercel), filesystem-nya
// ephemeral (tidak permanen) — perlu diganti ke object storage (S3/Cloudinary/
// Vercel Blob/Supabase Storage) sebelum production. Lihat docs/MEMORY.md.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format file harus JPG, PNG, atau WebP." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
