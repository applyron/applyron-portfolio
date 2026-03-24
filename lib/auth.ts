import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

import { isAuthConfigured } from "@/lib/data";
import { getDataFilePath } from "@/lib/runtime-config";

const COOKIE_NAME = "admin_token";
const TOKEN_EXPIRY = "24h";
const SECRET_FILE = getDataFilePath(".jwt_secret");

function getJwtSecret(): string {
  try {
    const existing = fs.readFileSync(SECRET_FILE, "utf-8").trim();
    if (existing && existing.length >= 32) return existing;
  } catch {
  }

  if (process.env.NODE_ENV === "production" && isAuthConfigured()) {
    throw new Error("Missing or invalid JWT secret file");
  }

  const secret = randomBytes(48).toString("hex");
  fs.mkdirSync(path.dirname(SECRET_FILE), { recursive: true });
  fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  return secret;
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

export function generateToken(): string {
  return jwt.sign({ role: "admin" }, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, getJwtSecret());
    return true;
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

export { COOKIE_NAME };
