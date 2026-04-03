import { NextResponse } from "next/server";

import { getSkills, setSkills } from "@/lib/data";
import {
  isAuthenticated,
  issueAdminSessionToken,
  jsonWithAdminSession,
} from "@/lib/auth";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { revalidateHomePages } from "@/lib/revalidate-public";
import { validateSkills } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: messages.apiErrors.unauthorized },
      { status: 401 },
    );
  }

  try {
    return jsonWithAdminSession(
      await getSkills(),
      await issueAdminSessionToken(),
    );
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: messages.apiErrors.unauthorized },
      { status: 401 },
    );
  }

  let sessionToken: string;
  try {
    sessionToken = await issueAdminSessionToken();
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }

  const payload = await request.json().catch(() => null);
  const errors = validateSkills(payload);

  if (errors.length > 0) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.validationFailed, errors },
      sessionToken,
      { status: 400 },
    );
  }

  await setSkills(payload);
  revalidateHomePages();
  return jsonWithAdminSession({ success: true }, sessionToken);
}
