import { access, mkdir } from "fs/promises";
import { constants } from "fs";
import { NextResponse } from "next/server";

import { getJwtSecretStatus } from "@/lib/auth";
import { checkRedisHealth } from "@/lib/redis";
import { getDataDir, getUploadsDir } from "@/lib/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckResult = {
  ok: boolean;
  error?: string;
};

async function ensureWritableDirectory(dirPath: string): Promise<CheckResult> {
  try {
    await mkdir(dirPath, { recursive: true });
    await access(dirPath, constants.R_OK | constants.W_OK);

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Directory access failed",
    };
  }
}

async function checkJwtSecret(): Promise<CheckResult & { source?: string }> {
  const status = await getJwtSecretStatus();
  return {
    ok: status.ok,
    error: status.error,
    source: status.source,
  };
}

export async function GET() {
  const dataDir = getDataDir();
  const uploadsDir = getUploadsDir();

  const [dataCheck, uploadsCheck, jwtSecretCheck, redisCheck] = await Promise.all([
    ensureWritableDirectory(dataDir),
    ensureWritableDirectory(uploadsDir),
    checkJwtSecret(),
    checkRedisHealth(),
  ]);

  const ok = dataCheck.ok && uploadsCheck.ok && jwtSecretCheck.ok && redisCheck.ok;
  const isProduction = process.env.NODE_ENV === "production";

  return NextResponse.json(
    isProduction
      ? {
          status: ok ? "ok" : "error",
          timestamp: new Date().toISOString(),
        }
      : {
          status: ok ? "ok" : "error",
          timestamp: new Date().toISOString(),
          checks: {
            process: {
              ok: true,
              nodeEnv: process.env.NODE_ENV ?? "unknown",
            },
            dataDir: dataCheck,
            uploadsDir: uploadsCheck,
            jwtSecret: jwtSecretCheck,
            redis: redisCheck,
          },
        },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
