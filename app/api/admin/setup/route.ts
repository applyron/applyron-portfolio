import { NextResponse } from "next/server";
import { isAuthConfigured, setAuth } from "@/lib/data";
import {
  clearAdminAuthCookie,
  getJwtSecretStatus,
  hashPassword,
  issueAdminSessionToken,
  jsonWithAdminSession,
} from "@/lib/auth";
import {
  clearAdminAuthFailures,
  inspectAdminAuthRateLimit,
  recordAdminAuthFailure,
} from "@/lib/admin-rate-limit";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { checkRedisHealth } from "@/lib/redis";
import { isAdminSetupEnabled } from "@/lib/runtime-config";

export async function GET() {
  const messages = await getAdminRequestMessages();
  const [authConfigured, jwtSecretStatus, redisStatus] = await Promise.all([
    isAuthConfigured(),
    getJwtSecretStatus(),
    checkRedisHealth(),
  ]);

  if (!jwtSecretStatus.ok || !redisStatus.ok) {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable, setupEnabled: false },
      { status: 503 },
    );
  }

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
  if (!(await getJwtSecretStatus()).ok) {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }

  const authConfigured = await isAuthConfigured();
  if (!isAdminSetupEnabled(authConfigured)) {
    return NextResponse.json(
      { error: messages.apiErrors.setupDisabled, setupEnabled: false },
      { status: 403 },
    );
  }

  let rateLimit;
  try {
    rateLimit = await inspectAdminAuthRateLimit(req);
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }

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
    try {
      await recordAdminAuthFailure(req);
    } catch {
      return NextResponse.json(
        { error: messages.apiErrors.authUnavailable },
        { status: 503 },
      );
    }

    const response = NextResponse.json(
      { error: messages.apiErrors.passwordTooShort },
      { status: 400 },
    );
    clearAdminAuthCookie(response);
    return response;
  }
  const hashed = await hashPassword(password);
  let sessionToken: string;
  try {
    sessionToken = await issueAdminSessionToken();
    await clearAdminAuthFailures(req);
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }

  await setAuth({ password: hashed });
  return jsonWithAdminSession({ success: true }, sessionToken);
}
