import "server-only";

import { cookies } from "next/headers";
import {
  ADMIN_LOCALE_COOKIE,
  getAdminMessages,
  normalizeAdminLocale,
  type AdminLocale,
} from "./admin-i18n";

export async function getAdminRequestLocale(): Promise<AdminLocale> {
  const cookieStore = await cookies();
  return normalizeAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
}

export async function getAdminRequestMessages() {
  return getAdminMessages(await getAdminRequestLocale());
}

