import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

export const UPLOAD_TARGETS = {
  generic: {
    label: "general image",
    width: 1600,
    height: 1600,
  },
  logo: {
    label: "site logo",
    width: 256,
    height: 256,
  },
  hero: {
    label: "hero image",
    width: 1200,
    height: 1200,
  },
  project: {
    label: "project image",
    width: 1600,
    height: 900,
  },
} as const;

export type UploadTarget = keyof typeof UPLOAD_TARGETS;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_REQUEST_BYTES = 6 * 1024 * 1024;
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

type ProcessUploadInput = {
  buffer: Buffer;
  mimeType: AllowedUploadMimeType;
  target: UploadTarget;
};

type ProcessUploadResult = {
  buffer: Buffer;
  extension: string;
  width: number | null;
  height: number | null;
  resized: boolean;
};

const RASTER_FORMATS: Record<
  AllowedUploadMimeType,
  {
    extension: string;
    output:
      | { kind: "jpeg"; options: sharp.JpegOptions }
      | { kind: "png"; options: sharp.PngOptions }
      | { kind: "webp"; options: sharp.WebpOptions };
  }
> = {
  "image/jpeg": {
    extension: "jpg",
    output: {
      kind: "jpeg",
      options: { quality: 85, mozjpeg: true },
    },
  },
  "image/png": {
    extension: "png",
    output: {
      kind: "png",
      options: { compressionLevel: 9 },
    },
  },
  "image/webp": {
    extension: "webp",
    output: {
      kind: "webp",
      options: { quality: 85 },
    },
  },
};

export function normalizeUploadTarget(target: FormDataEntryValue | null): UploadTarget {
  if (typeof target !== "string") return "generic";
  return target in UPLOAD_TARGETS ? (target as UploadTarget) : "generic";
}

export async function detectUploadMimeType(
  buffer: Buffer,
): Promise<AllowedUploadMimeType | null> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected) {
    return null;
  }

  return ALLOWED_UPLOAD_MIME_TYPES.includes(detected.mime as AllowedUploadMimeType)
    ? (detected.mime as AllowedUploadMimeType)
    : null;
}

export async function processUploadedImage({
  buffer,
  mimeType,
  target,
}: ProcessUploadInput): Promise<ProcessUploadResult> {
  const format = RASTER_FORMATS[mimeType];
  if (!format) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  const preset = UPLOAD_TARGETS[target];
  const transformer = sharp(buffer).rotate().resize({
    width: preset.width,
    height: preset.height,
    fit: "inside",
    withoutEnlargement: true,
  });

  let outputBuffer: Buffer;
  let info: sharp.OutputInfo;

  switch (format.output.kind) {
    case "jpeg":
      ({ data: outputBuffer, info } = await transformer
        .jpeg(format.output.options)
        .toBuffer({ resolveWithObject: true }));
      break;
    case "png":
      ({ data: outputBuffer, info } = await transformer
        .png(format.output.options)
        .toBuffer({ resolveWithObject: true }));
      break;
    case "webp":
      ({ data: outputBuffer, info } = await transformer
        .webp(format.output.options)
        .toBuffer({ resolveWithObject: true }));
      break;
  }

  return {
    buffer: outputBuffer,
    extension: format.extension,
    width: info.width,
    height: info.height,
    resized: true,
  };
}
