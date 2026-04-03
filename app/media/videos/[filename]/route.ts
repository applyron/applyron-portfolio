import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VIDEO_ROOT = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "videos",
);

const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function resolveVideoPath(filename: string) {
  if (
    !filename ||
    filename === "." ||
    filename === ".." ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return null;
  }

  const filePath = path.resolve(VIDEO_ROOT, filename);
  if (!filePath.startsWith(`${VIDEO_ROOT}${path.sep}`)) {
    return null;
  }

  return filePath;
}

function parseRangeHeader(rangeHeader: string, fileSize: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) {
    return null;
  }

  const [, startValue, endValue] = match;

  let start = startValue ? Number.parseInt(startValue, 10) : 0;
  let end = endValue ? Number.parseInt(endValue, 10) : fileSize - 1;

  if (!startValue && endValue) {
    const suffixLength = Number.parseInt(endValue, 10);
    if (Number.isNaN(suffixLength) || suffixLength <= 0) {
      return null;
    }

    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  }

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize
  ) {
    return null;
  }

  return {
    start,
    end: Math.min(end, fileSize - 1),
  };
}

async function createVideoResponse(
  request: Request,
  filename: string,
  method: "GET" | "HEAD",
) {
  const filePath = resolveVideoPath(filename);
  if (!filePath) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension];

  if (!contentType) {
    return NextResponse.json({ error: "Unsupported video type" }, { status: 415 });
  }

  try {
    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;
    const rangeHeader = request.headers.get("range");

    const headers = new Headers({
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    });

    if (!rangeHeader) {
      headers.set("Content-Length", String(fileSize));

      if (method === "HEAD") {
        return new Response(null, { status: 200, headers });
      }

      const buffer = await readFile(filePath);
      return new Response(buffer, { status: 200, headers });
    }

    const range = parseRangeHeader(rangeHeader, fileSize);
    if (!range) {
      headers.set("Content-Range", `bytes */${fileSize}`);
      return new Response(null, { status: 416, headers });
    }

    headers.set("Content-Length", String(range.end - range.start + 1));
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${fileSize}`);

    if (method === "HEAD") {
      return new Response(null, { status: 206, headers });
    }

    const buffer = await readFile(filePath);
    return new Response(buffer.subarray(range.start, range.end + 1), {
      status: 206,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  return createVideoResponse(request, filename, "GET");
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  return createVideoResponse(request, filename, "HEAD");
}
