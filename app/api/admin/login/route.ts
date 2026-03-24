import { NextResponse } from "next/server";
import { getAuth } from "@/lib/data";
import { verifyPassword, generateToken, COOKIE_NAME } from "@/lib/auth";
import {
  clearAdminAuthFailures,
  inspectAdminAuthRateLimit,
  recordAdminAuthFailure,
} from "@/lib/admin-rate-limit";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { isAdminSetupEnabled } from "@/lib/runtime-config";

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
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

  const auth = getAuth();
  if (!auth.password) {
    if (!isAdminSetupEnabled(false)) {
      return NextResponse.json(
        { error: messages.apiErrors.setupDisabled },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: messages.apiErrors.notSetUp }, { status: 400 });
  }
  const { password } = await req.json();
  const valid = await verifyPassword(password, auth.password);
  if (!valid) {
    const failureState = recordAdminAuthFailure(req);
    return NextResponse.json(
      {
        error: failureState.limited
          ? messages.apiErrors.tooManyAttempts
          : messages.apiErrors.invalidPassword,
      },
      {
        status: failureState.limited ? 429 : 401,
        headers: failureState.limited
          ? { "Retry-After": String(failureState.retryAfterSeconds) }
          : undefined,
      },
    );
  }

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
