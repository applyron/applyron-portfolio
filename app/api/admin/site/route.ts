import { NextResponse } from "next/server";
import { getSiteData, setSiteData } from "@/lib/data";
import {
  isAuthenticated,
  issueAdminSessionToken,
  jsonWithAdminSession,
} from "@/lib/auth";
import { validateSiteData } from "@/lib/validate";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { revalidateHomePages, revalidatePublicLayout } from "@/lib/revalidate-public";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }

  try {
    return jsonWithAdminSession(await getSiteData(), await issueAdminSessionToken());
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
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

  const data = await req.json();
  const errors = validateSiteData(data);
  if (errors.length > 0) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.validationFailed, errors },
      sessionToken,
      { status: 400 },
    );
  }
  await setSiteData(data);
  revalidatePublicLayout();
  revalidateHomePages();
  return jsonWithAdminSession({ success: true }, sessionToken);
}
