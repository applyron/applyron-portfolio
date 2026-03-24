import { NextResponse } from "next/server";
import { getSocials, setSocials } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { validateSocials } from "@/lib/validate";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { revalidatePublicLayout } from "@/lib/revalidate-public";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }
  return NextResponse.json(getSocials());
}

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }
  const data = await req.json();
  const errors = validateSocials(data);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: messages.apiErrors.validationFailed, errors },
      { status: 400 },
    );
  }
  setSocials(data);
  revalidatePublicLayout();
  return NextResponse.json({ success: true });
}
