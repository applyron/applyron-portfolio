"use client";

import type { AdminLocale } from "@/lib/admin-i18n";
import { useAdminI18n } from "./AdminI18nProvider";

const LOCALES: { code: AdminLocale; flag: string }[] = [
  { code: "en", flag: "🇬🇧" },
  { code: "tr", flag: "🇹🇷" },
];

export default function AdminLanguageSwitcher() {
  const { locale, messages, setLocale } = useAdminI18n();

  return (
    <div
      className="flex items-center rounded-full border border-[rgba(112,66,248,0.45)] overflow-hidden bg-[#09001f]/90"
      aria-label={messages.language.switch}
      title={messages.language.switch}
    >
      {LOCALES.map(({ code, flag }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-label={
            code === "en"
              ? messages.language.english
              : messages.language.turkish
          }
          title={
            code === "en"
              ? messages.language.english
              : messages.language.turkish
          }
          className={`flex h-9 w-10 items-center justify-center text-lg transition ${
            locale === code
              ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <span aria-hidden="true">{flag}</span>
        </button>
      ))}
    </div>
  );
}
