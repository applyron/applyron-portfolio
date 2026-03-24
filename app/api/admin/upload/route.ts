import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";
import { normalizeUploadTarget, processUploadedImage, UPLOAD_TARGETS } from "@/lib/upload-image";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { getUploadsDir } from "@/lib/runtime-config";

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const target = normalizeUploadTarget(formData.get("target"));
  if (!file) {
    return NextResponse.json({ error: messages.apiErrors.noFileProvided }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: messages.apiErrors.invalidFileType }, { status: 400 });
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: messages.apiErrors.fileTooLarge }, { status: 400 });
  }

  let processed: Awaited<ReturnType<typeof processUploadedImage>>;
  try {
    processed = await processUploadedImage({
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      target,
    });
  } catch {
    return NextResponse.json({ error: messages.apiErrors.invalidFileType }, { status: 400 });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${processed.extension}`;
  const uploadDir = getUploadsDir();
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, processed.buffer);

  return NextResponse.json({
    url: `/uploads/${filename}`,
    resized: processed.resized,
    width: processed.width,
    height: processed.height,
    target,
    targetLabel: UPLOAD_TARGETS[target].label,
  });
}
