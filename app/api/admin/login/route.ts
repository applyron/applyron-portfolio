import { NextResponse } from "next/server";
import { getAuth } from "@/lib/data";
import {
  clearAdminAuthCookie,
  getJwtSecretStatus,
  issueAdminSessionToken,
  jsonWithAdminSession,
  verifyPassword,
} from "@/lib/auth";
import {
  clearAdminAuthFailures,
  inspectAdminAuthRateLimit,
  recordAdminAuthFailure,
} from "@/lib/admin-rate-limit";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { isAdminSetupEnabled } from "@/lib/runtime-config";

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await getJwtSecretStatus()).ok) {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
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

  const auth = await getAuth();
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
    try {
      const failureState = await recordAdminAuthFailure(req);
      const response = NextResponse.json(
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
      clearAdminAuthCookie(response);
      return response;
    } catch {
      return NextResponse.json(
        { error: messages.apiErrors.authUnavailable },
        { status: 503 },
      );
    }
  }

  try {
    await clearAdminAuthFailures(req);
    return jsonWithAdminSession({ success: true }, await issueAdminSessionToken());
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }
}
