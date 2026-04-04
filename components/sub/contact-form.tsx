"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type ContactFormState = {
  name: string;
  phone: string;
  message: string;
};

const EMPTY_STATE: ContactFormState = {
  name: "",
  phone: "",
  message: "",
};

const PHONE_ALLOWED_PATTERN = /^[+\d\s()-]+$/;

function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  return (
    trimmed.length > 0 &&
    PHONE_ALLOWED_PATTERN.test(trimmed) &&
    digits.length >= 10 &&
    digits.length <= 15
  );
}

export function ContactForm() {
  const t = useTranslations("contactPage.form");
  const [data, setData] = useState<ContactFormState>(EMPTY_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !data.name.trim() ||
      !isValidPhoneNumber(data.phone) ||
      !data.message.trim()
    ) {
      setError(t("validation"));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success !== true) {
        setError(response.status === 400 ? t("validation") : t("error"));
        return;
      }

      setSuccess(t("success"));
      setData(EMPTY_STATE);
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-[rgba(6,10,24,0.78)] p-6 shadow-[0_18px_60px_rgba(4,10,24,0.3)] backdrop-blur-sm sm:p-7"
    >
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-white sm:text-[2rem]">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-7 text-gray-300/85 sm:text-base">
          {t("description")}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-200">
            {t("nameLabel")}
          </span>
          <input
            type="text"
            autoComplete="name"
            value={data.name}
            onChange={(event) =>
              setData((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder={t("namePlaceholder")}
            className="w-full rounded-2xl border border-white/10 bg-[rgba(4,8,20,0.82)] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400/60 focus:bg-[rgba(7,12,30,0.92)]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-200">
            {t("phoneLabel")}
          </span>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={data.phone}
            onChange={(event) =>
              setData((prev) => ({ ...prev, phone: event.target.value }))
            }
            placeholder={t("phonePlaceholder")}
            className="w-full rounded-2xl border border-white/10 bg-[rgba(4,8,20,0.82)] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400/60 focus:bg-[rgba(7,12,30,0.92)]"
          />
          <p className="mt-2 text-xs leading-6 text-gray-500">
            {t("phoneHint")}
          </p>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-gray-200">
          {t("messageLabel")}
        </span>
        <textarea
          value={data.message}
          onChange={(event) =>
            setData((prev) => ({ ...prev, message: event.target.value }))
          }
          placeholder={t("messagePlaceholder")}
          rows={7}
          className="w-full rounded-2xl border border-white/10 bg-[rgba(4,8,20,0.82)] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400/60 focus:bg-[rgba(7,12,30,0.92)]"
        />
      </label>

      <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-7 text-gray-400">
          {t("helper")}
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </div>

      <div aria-live="polite" className="mt-4 min-h-[24px] text-sm">
        {error && <p className="text-red-400">{error}</p>}
        {success && <p className="text-emerald-400">{success}</p>}
      </div>
    </form>
  );
}
