"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import AdminSetup from "./components/AdminSetup";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { useAdminI18n } from "./components/AdminI18nProvider";

type AuthState = "loading" | "setup" | "login" | "authenticated";

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [loginNotice, setLoginNotice] = useState("");
  const { messages } = useAdminI18n();

  const updateAuthState = useEffectEvent((nextState: AuthState) => {
    startTransition(() => {
      setAuthState(nextState);
    });
  });

  const checkSetup = useEffectEvent(async () => {
    try {
      const res = await fetch("/api/admin/setup", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (res.ok && data && !data.isSetup) {
        setLoginNotice("");
        updateAuthState("setup");
      } else {
        updateAuthState("login");
        setLoginNotice("");

        void fetch("/api/admin/site", { cache: "no-store" })
          .then((authCheck) => {
            if (authCheck.ok) {
              setLoginNotice("");
              updateAuthState("authenticated");
            }
          })
          .catch(() => {
          });
      }
    } catch {
      updateAuthState("login");
    }
  });

  useEffect(() => {
    void checkSetup();
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-purple-400 text-xl animate-pulse">
          {messages.common.loading}
        </div>
      </div>
    );
  }

  if (authState === "setup") {
    return (
      <AdminSetup
        onComplete={() => {
          setLoginNotice("");
          setAuthState("authenticated");
        }}
      />
    );
  }

  if (authState === "login") {
    return (
      <AdminLogin
        notice={loginNotice}
        onComplete={() => {
          setLoginNotice("");
          setAuthState("authenticated");
        }}
      />
    );
  }

  return (
    <AdminDashboard
      onLogout={() => {
        setLoginNotice("");
        setAuthState("login");
      }}
      onUnauthorized={() => {
        setLoginNotice(messages.common.sessionExpired);
        setAuthState("login");
      }}
    />
  );
}
