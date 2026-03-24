"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  ADMIN_LOCALE_COOKIE,
  getAdminMessages,
  type AdminLocale,
  type AdminMessages,
} from "@/lib/admin-i18n";

type AdminI18nContextValue = {
  locale: AdminLocale;
  messages: AdminMessages;
  setLocale: (locale: AdminLocale) => void;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

type Props = PropsWithChildren<{
  initialLocale: AdminLocale;
}>;

export function AdminI18nProvider({ children, initialLocale }: Props) {
  const [locale, setLocaleState] = useState<AdminLocale>(initialLocale);

  const messages = useMemo(() => getAdminMessages(locale), [locale]);

  function syncLocale(nextLocale: AdminLocale) {
    document.cookie = `${ADMIN_LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    setLocaleState(nextLocale);
  }

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = messages.meta.title;
  }, [locale, messages.meta.title]);

  const value = useMemo<AdminI18nContextValue>(
    () => ({
      locale,
      messages,
      setLocale: (nextLocale) => syncLocale(nextLocale),
    }),
    [locale, messages],
  );

  return (
    <AdminI18nContext.Provider value={value}>
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  const context = useContext(AdminI18nContext);
  if (!context) {
    throw new Error("useAdminI18n must be used within AdminI18nProvider");
  }
  return context;
}
