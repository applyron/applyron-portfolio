import { access, mkdir, readFile } from "fs/promises";
import { constants } from "fs";
import { NextResponse } from "next/server";

import { getDataDir, getDataFilePath, getUploadsDir } from "@/lib/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckResult = {
  ok: boolean;
  path?: string;
  writable?: boolean;
  error?: string;
  required?: boolean;
};

async function ensureWritableDirectory(dirPath: string): Promise<CheckResult> {
  try {
    await mkdir(dirPath, { recursive: true });
    await access(dirPath, constants.R_OK | constants.W_OK);

    return {
      ok: true,
      path: dirPath,
      writable: true,
    };
  } catch (error) {
    return {
      ok: false,
      path: dirPath,
      writable: false,
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
      path: secretPath,
      required: false,
    };
  }

  try {
    const secret = (await readFile(secretPath, "utf-8")).trim();
    if (secret.length < 32) {
      throw new Error("JWT secret is shorter than expected");
    }

    return {
      ok: true,
      path: secretPath,
      required: true,
    };
  } catch (error) {
    return {
      ok: false,
      path: secretPath,
      required: true,
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

  return NextResponse.json(
    {
      status: ok ? "ok" : "error",
      timestamp: new Date().toISOString(),
      checks: {
        process: {
          ok: true,
          pid: process.pid,
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
