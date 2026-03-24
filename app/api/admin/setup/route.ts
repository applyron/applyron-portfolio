import { NextResponse } from "next/server";
import { isAuthConfigured, setAuth } from "@/lib/data";
import { hashPassword, generateToken, COOKIE_NAME } from "@/lib/auth";
import {
  clearAdminAuthFailures,
  inspectAdminAuthRateLimit,
  recordAdminAuthFailure,
} from "@/lib/admin-rate-limit";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { isAdminSetupEnabled } from "@/lib/runtime-config";

export async function GET() {
  const messages = await getAdminRequestMessages();
  const authConfigured = isAuthConfigured();
  if (!isAdminSetupEnabled(authConfigured)) {
    return NextResponse.json(
      { error: messages.apiErrors.setupDisabled, setupEnabled: false },
      { status: 403 },
    );
  }

  return NextResponse.json({ isSetup: authConfigured, setupEnabled: true });
}

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  const authConfigured = isAuthConfigured();
  if (!isAdminSetupEnabled(authConfigured)) {
    return NextResponse.json(
      { error: messages.apiErrors.setupDisabled, setupEnabled: false },
      { status: 403 },
    );
  }

  const rateLimit = inspectAdminAuthRateLimit(req);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: messages.apiErrors.tooManyAttempts },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  if (authConfigured) {
    return NextResponse.json({ error: messages.apiErrors.alreadySetUp }, { status: 400 });
  }
  const { password } = await req.json();
  if (!password || password.length < 6) {
    recordAdminAuthFailure(req);
    return NextResponse.json(
      { error: messages.apiErrors.passwordTooShort },
      { status: 400 },
    );
  }
  const hashed = await hashPassword(password);
  setAuth({ password: hashed });
  let token: string;
  try {
    token = generateToken();
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }

  clearAdminAuthFailures(req);
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return response;
}
