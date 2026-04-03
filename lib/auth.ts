import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";

import {
  getAdminJwtSecretFilePath,
  getDataFilePath,
  isProductionRuntime,
} from "@/lib/runtime-config";

const COOKIE_NAME = "admin_token";
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24;
const TOKEN_EXPIRY = "24h";
const DEV_SECRET_FILE = getDataFilePath(".jwt_secret");

let jwtSecretPromise: Promise<string> | null = null;

export type JwtSecretStatus = {
  ok: boolean;
  source?: "admin-jwt-secret-file" | "admin-jwt-secret" | "development-fallback";
  error?: string;
};

function normalizeSecret(secret: string | undefined | null): string | null {
  const trimmed = secret?.trim();
  return trimmed && trimmed.length >= 32 ? trimmed : null;
}

async function readSecretFile(secretPath: string): Promise<string | null> {
  try {
    return normalizeSecret(await fs.readFile(secretPath, "utf-8"));
  } catch {
    return null;
  }
}

async function readOrCreateDevJwtSecret(): Promise<string> {
  const existing = await readSecretFile(DEV_SECRET_FILE);
  if (existing) {
    return existing;
  }

  if (isProductionRuntime()) {
    throw new Error("JWT secret fallback is disabled in production");
  }

  const secret = randomBytes(48).toString("hex");
  await fs.mkdir(path.dirname(DEV_SECRET_FILE), { recursive: true });
  await fs.writeFile(DEV_SECRET_FILE, secret, { mode: 0o600 });
  return secret;
}

async function readOrResolveJwtSecret(): Promise<string> {
  const secretFilePath = getAdminJwtSecretFilePath();
  if (secretFilePath) {
    const fileSecret = await readSecretFile(secretFilePath);
    if (!fileSecret) {
      throw new Error("ADMIN_JWT_SECRET_FILE is missing or invalid");
    }
    return fileSecret;
  }

  const envSecret = normalizeSecret(process.env.ADMIN_JWT_SECRET);
  if (envSecret) {
    return envSecret;
  }

  return readOrCreateDevJwtSecret();
}

async function getJwtSecret(): Promise<string> {
  if (!jwtSecretPromise) {
    jwtSecretPromise = readOrResolveJwtSecret();
  }

  try {
    return await jwtSecretPromise;
  } catch (error) {
    jwtSecretPromise = null;
    throw error;
  }
}

export async function getJwtSecretStatus(): Promise<JwtSecretStatus> {
  const secretFilePath = getAdminJwtSecretFilePath();
  if (secretFilePath) {
    const fileSecret = await readSecretFile(secretFilePath);
    return fileSecret
      ? { ok: true, source: "admin-jwt-secret-file" }
      : { ok: false, error: "ADMIN_JWT_SECRET_FILE is missing or invalid" };
  }

  const envSecret = normalizeSecret(process.env.ADMIN_JWT_SECRET);
  if (envSecret) {
    return { ok: true, source: "admin-jwt-secret" };
  }

  if (isProductionRuntime()) {
    return {
      ok: false,
      error: "ADMIN_JWT_SECRET or ADMIN_JWT_SECRET_FILE is required in production",
    };
  }

  return {
    ok: true,
    source: "development-fallback",
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(): Promise<string> {
  return jwt.sign({ role: "admin" }, await getJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
    jwtid: randomBytes(16).toString("hex"),
    subject: "admin",
  });
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const payload = jwt.verify(token, await getJwtSecret());
    return typeof payload !== "string" && (payload as JwtPayload).role === "admin";
  } catch {
    return false;
  }
}

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  if (!token) return false;
  return verifyToken(token);
}

function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: isProductionRuntime(),
    sameSite: "strict" as const,
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: "/",
  };
}

export function setAdminAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, getAdminCookieOptions());
}

export function clearAdminAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    ...getAdminCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function issueAdminSessionToken(): Promise<string> {
  return generateToken();
}

export function jsonWithAdminSession<T>(
  body: T,
  token: string,
  init?: ResponseInit,
): NextResponse {
  const response = NextResponse.json(body, init);
  setAdminAuthCookie(response, token);
  return response;
}

export { COOKIE_NAME };
