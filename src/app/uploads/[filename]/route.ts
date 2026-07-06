import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/upload-dir";

// Serve file upload dari luar public/ (lihat upload-dir.ts) supaya tidak
// hilang tiap deploy. Path ini sengaja menempati "/uploads/:filename" —
// sama seperti URL yang selama ini disimpan di database — jadi tidak perlu
// migrasi data, cukup ganti cara serve-nya.
const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()];
  if (!contentType) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const filePath = path.join(getUploadDir(), filename);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("not a file");
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
