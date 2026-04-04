"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { FlagIcon } from "./flag-icon";

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const languages = [
    { code: "en" as const, country: "gb" as const, label: "English" },
    { code: "tr" as const, country: "tr" as const, label: "Türkçe" },
  ];

  const switchTo = (next: "en" | "tr") => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      className="inline-flex shrink-0 items-center overflow-hidden rounded-full border border-[rgba(112,66,248,0.5)] bg-[rgba(3,0,20,0.34)]"
      title={t("switchLanguage")}
    >
      {languages.map((language, i) => (
        <button
          key={language.code}
          onClick={() => switchTo(language.code)}
          disabled={isPending}
          aria-label={`${t("switchLanguage")}: ${language.label}`}
          title={language.label}
          className={`flex h-9 w-10 items-center justify-center transition disabled:opacity-50 ${
            locale === language.code
              ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
              : "text-gray-400 hover:text-white bg-transparent"
          } ${i === 0 ? "" : "border-l border-[rgba(112,66,248,0.5)]"}`}
        >
          <FlagIcon
            country={language.country}
            className="h-5 w-5 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
          />
        </button>
      ))}
    </div>
  );
};
