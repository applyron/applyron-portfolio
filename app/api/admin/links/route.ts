import { NextResponse } from "next/server";
import { getLinks, setLinks } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { validateLinks } from "@/lib/validate";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { revalidatePublicLayout } from "@/lib/revalidate-public";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }
  return NextResponse.json(getLinks());
}

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }
  const data = await req.json();
  const errors = validateLinks(data);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: messages.apiErrors.validationFailed, errors },
      { status: 400 },
    );
  }
  setLinks(data);
  revalidatePublicLayout();
  return NextResponse.json({ success: true });
}
