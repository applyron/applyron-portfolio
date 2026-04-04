import { NextResponse } from "next/server";
import { getLinks, setLinks } from "@/lib/data";
import {
  isAuthenticated,
  issueAdminSessionToken,
  jsonWithAdminSession,
} from "@/lib/auth";
import { validateLinks } from "@/lib/validate";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { revalidatePublicLayout } from "@/lib/revalidate-public";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }

  try {
    return jsonWithAdminSession(await getLinks(), await issueAdminSessionToken());
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
  const errors = validateLinks(data);
  if (errors.length > 0) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.validationFailed, errors },
      sessionToken,
      { status: 400 },
    );
  }
  await setLinks(data);
  revalidatePublicLayout();
  return jsonWithAdminSession({ success: true }, sessionToken);
}
