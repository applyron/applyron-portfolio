import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { getUploadFilePath } from "@/lib/runtime-config";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function resolveUploadPath(filename: string) {
  return getUploadFilePath(path.basename(filename));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const filePath = resolveUploadPath(filename);
  const extension = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[extension] ?? "application/octet-stream";

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
