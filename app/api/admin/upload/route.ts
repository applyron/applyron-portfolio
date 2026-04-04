import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  isAuthenticated,
  issueAdminSessionToken,
  jsonWithAdminSession,
} from "@/lib/auth";
import {
  detectUploadMimeType,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_REQUEST_BYTES,
  normalizeUploadTarget,
  processUploadedImage,
  UPLOAD_TARGETS,
} from "@/lib/upload-image";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { getUploadsDir } from "@/lib/runtime-config";

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }

  let sessionToken: string;
  try {
    sessionToken = await issueAdminSessionToken();
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_REQUEST_BYTES) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.fileTooLarge },
      sessionToken,
      { status: 413 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const target = normalizeUploadTarget(formData.get("target"));
  if (!file) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.noFileProvided },
      sessionToken,
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.fileTooLarge },
      sessionToken,
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.fileTooLarge },
      sessionToken,
      { status: 413 },
    );
  }

  const mimeType = await detectUploadMimeType(buffer);
  if (!mimeType) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.invalidFileType },
      sessionToken,
      { status: 400 },
    );
  }

  let processed: Awaited<ReturnType<typeof processUploadedImage>>;
  try {
    processed = await processUploadedImage({
      buffer,
      mimeType,
      target,
    });
  } catch {
    return jsonWithAdminSession(
      { error: messages.apiErrors.invalidFileType },
      sessionToken,
      { status: 400 },
    );
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${processed.extension}`;
  const uploadDir = getUploadsDir();
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, processed.buffer);

  return jsonWithAdminSession(
    {
      url: `/uploads/${filename}`,
      resized: processed.resized,
      width: processed.width,
      height: processed.height,
      target,
      targetLabel: UPLOAD_TARGETS[target].label,
    },
    sessionToken,
  );
}
