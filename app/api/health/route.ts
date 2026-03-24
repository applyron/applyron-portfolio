import { access, mkdir, readFile } from "fs/promises";
import { constants } from "fs";
import { NextResponse } from "next/server";

import { getDataDir, getDataFilePath, getUploadsDir } from "@/lib/runtime-config";

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

async function checkJwtSecret(): Promise<CheckResult> {
  const authPath = getDataFilePath("auth.json");
  const secretPath = getDataFilePath(".jwt_secret");

  let authConfigured = false;

  try {
    const authRaw = await readFile(authPath, "utf-8");
    const auth = JSON.parse(authRaw) as { password?: unknown };
    authConfigured =
      typeof auth.password === "string" && auth.password.trim().length > 0;
  } catch {
    authConfigured = false;
  }

  if (!authConfigured) {
    return {
      ok: true,
    };
  }

  try {
    const secret = (await readFile(secretPath, "utf-8")).trim();
    if (secret.length < 32) {
      throw new Error("JWT secret is shorter than expected");
    }

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "JWT secret check failed",
    };
  }
}

export async function GET() {
  const dataDir = getDataDir();
  const uploadsDir = getUploadsDir();

  const [dataCheck, uploadsCheck, jwtSecretCheck] = await Promise.all([
    ensureWritableDirectory(dataDir),
    ensureWritableDirectory(uploadsDir),
    checkJwtSecret(),
  ]);

  const ok = dataCheck.ok && uploadsCheck.ok && jwtSecretCheck.ok;
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
