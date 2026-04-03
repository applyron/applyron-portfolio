import { NextResponse } from "next/server";

import { addContactMessage } from "@/lib/data";
import { validateContactSubmission } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const errors = validateContactSubmission(payload);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", errors },
      { status: 400 },
    );
  }

  await addContactMessage({
    name: payload.name,
    phone: payload.phone,
    message: payload.message,
  });

  return NextResponse.json({ success: true });
}
