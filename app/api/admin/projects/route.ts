import { NextResponse } from "next/server";
import { getProjects, setProjects } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { validateProjects } from "@/lib/validate";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { revalidateHomePages, revalidateProjectPages } from "@/lib/revalidate-public";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }
  return NextResponse.json(getProjects());
}

export async function POST(req: Request) {
  const messages = await getAdminRequestMessages();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: messages.apiErrors.unauthorized }, { status: 401 });
  }
  const projects = await req.json();
  const errors = validateProjects(projects);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: messages.apiErrors.validationFailed, errors },
      { status: 400 },
    );
  }
  setProjects(projects);
  revalidateHomePages();
  revalidateProjectPages(projects);
  return NextResponse.json({ success: true });
}
