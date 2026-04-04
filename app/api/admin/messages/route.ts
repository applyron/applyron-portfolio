import { NextResponse } from "next/server";

import {
  CONTACT_MESSAGE_STATUSES,
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from "@/lib/data";
import {
  isAuthenticated,
  issueAdminSessionToken,
  jsonWithAdminSession,
} from "@/lib/auth";
import { getAdminRequestMessages } from "@/lib/admin-i18n-server";

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
      await getContactMessages(),
      await issueAdminSessionToken(),
    );
  } catch {
    return NextResponse.json(
      { error: messages.apiErrors.authUnavailable },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
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
  const id = typeof payload?.id === "string" ? payload.id.trim() : "";
  const status = typeof payload?.status === "string" ? payload.status : "";

  if (
    !id ||
    !CONTACT_MESSAGE_STATUSES.includes(
      status as (typeof CONTACT_MESSAGE_STATUSES)[number],
    )
  ) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.validationFailed },
      sessionToken,
      { status: 400 },
    );
  }

  const updated = await updateContactMessageStatus(
    id,
    status as (typeof CONTACT_MESSAGE_STATUSES)[number],
  );

  if (!updated) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.recordNotFound },
      sessionToken,
      { status: 404 },
    );
  }

  return jsonWithAdminSession({ success: true }, sessionToken);
}

export async function DELETE(request: Request) {
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
  const id = typeof payload?.id === "string" ? payload.id.trim() : "";

  if (!id) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.validationFailed },
      sessionToken,
      { status: 400 },
    );
  }

  const deleted = await deleteContactMessage(id);

  if (!deleted) {
    return jsonWithAdminSession(
      { error: messages.apiErrors.recordNotFound },
      sessionToken,
      { status: 404 },
    );
  }

  return jsonWithAdminSession({ success: true }, sessionToken);
}
