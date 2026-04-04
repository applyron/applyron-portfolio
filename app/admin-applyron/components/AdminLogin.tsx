"use client";

import { useState } from "react";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";
import { useAdminI18n } from "./AdminI18nProvider";

type Props = {
  notice?: string;
  onComplete: () => void;
};

export default function AdminLogin({ notice, onComplete }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { messages } = useAdminI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || messages.auth.login.fallbackError);
      } else {
        onComplete();
      }
    } catch {
      setError(messages.auth.login.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030014] flex items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <AdminLanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/40 mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {messages.auth.login.title}
          </h1>
          <p className="text-gray-400 mt-2">
            {messages.auth.login.description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0a0020] border border-purple-500/30 rounded-2xl p-8 shadow-xl shadow-purple-900/20"
        >
          {notice && (
            <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
              {notice}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages.auth.login.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={messages.auth.login.passwordPlaceholder}
              autoComplete="current-password"
              className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 transition"
          >
            {loading
              ? messages.auth.login.submitting
              : messages.auth.login.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
