"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { AboutData, MultiLangString } from "@/lib/data";
import { validateAbout } from "@/lib/validate";

import ImageUploader from "../ImageUploader";
import { useAdminI18n } from "../AdminI18nProvider";
import {
  type AdminTabProps,
  getAdminErrorMessage,
  useDirtyTracker,
} from "./tab-utils";

type LangTab = "en" | "tr";

export default function AboutTab({
  onDirtyChange,
  onUnauthorized,
}: AdminTabProps) {
  const [data, setData] = useState<AboutData | null>(null);
  const [activeLang, setActiveLang] = useState<LangTab>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { messages } = useAdminI18n();
  const { currentSnapshot, setCleanSnapshot } = useDirtyTracker(
    data,
    onDirtyChange,
  );

  const loadAbout = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/about", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        onUnauthorized?.();
        return;
      }

      if (!response.ok) {
        setError(getAdminErrorMessage(payload, messages.common.loadError));
        return;
      }

      if (validateAbout(payload).length > 0) {
        setError(messages.common.loadError);
        return;
      }

      setData(payload);
      setCleanSnapshot(JSON.stringify(payload));
    } catch {
      setError(messages.common.loadError);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void loadAbout();
  }, []);

  async function handleSave() {
    if (!data) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        onUnauthorized?.();
        return;
      }

      if (!response.ok || payload?.success !== true) {
        setError(getAdminErrorMessage(payload, messages.common.saveError));
        return;
      }

      setSaved(true);
      setCleanSnapshot(currentSnapshot);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(messages.common.saveError);
    } finally {
      setSaving(false);
    }
  }

  function updateLangField(
    field: keyof Pick<
      AboutData,
      "badge" | "ctaText" | "heroTitle" | "heroHighlight" | "description"
    >,
    lang: LangTab,
    value: string,
  ) {
    if (!data) {
      return;
    }

    const current = data[field] as MultiLangString;
    setData({ ...data, [field]: { ...current, [lang]: value } });
  }

  if (loading) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  if (!data) {
    return <p className="text-sm text-red-400">{error || messages.common.loadError}</p>;
  }

  const lang = activeLang;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        {messages.about.heading}
      </h2>

      <div className="flex gap-2 mb-6">
        {(["en", "tr"] as LangTab[]).map((item) => (
          <button
            key={item}
            onClick={() => setActiveLang(item)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              activeLang === item
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                : "border border-purple-500/30 text-gray-400 hover:text-white"
            }`}
          >
            {item === "en"
              ? messages.common.languageTabEnglish
              : messages.common.languageTabTurkish}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiField
          label={messages.about.badgeText}
          value={(data.badge as MultiLangString)[lang]}
          onChange={(value) => updateLangField("badge", lang, value)}
        />
        <MultiField
          label={messages.about.ctaButtonText}
          value={(data.ctaText as MultiLangString)[lang]}
          onChange={(value) => updateLangField("ctaText", lang, value)}
        />
        <div className="md:col-span-2">
          <MultiField
            label={messages.about.heroTitle}
            value={(data.heroTitle as MultiLangString)[lang]}
            onChange={(value) => updateLangField("heroTitle", lang, value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            {messages.about.highlightPreview}{" "}
            <code className="text-purple-400">
              {(data.heroHighlight as MultiLangString)[lang]}
            </code>
          </p>
        </div>
        <MultiField
          label={messages.about.highlightedWords}
          value={(data.heroHighlight as MultiLangString)[lang]}
          onChange={(value) => updateLangField("heroHighlight", lang, value)}
          hint={messages.about.highlightHint}
        />
        <SingleField
          label={messages.about.ctaLink}
          value={data.ctaLink}
          onChange={(value) => setData({ ...data, ctaLink: value })}
        />
        <div className="md:col-span-2">
          <MultiField
            label={messages.about.description}
            value={(data.description as MultiLangString)[lang]}
            onChange={(value) => updateLangField("description", lang, value)}
            textarea
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.about.heroImage}
          </label>
          <ImageUploader
            currentUrl={data.heroImage}
            uploadTarget="hero"
            onUploaded={(url) => setData({ ...data, heroImage: url })}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 transition"
        >
          {saving ? messages.common.saving : messages.common.saveChanges}
        </button>
        {saved && <span className="text-green-400 text-sm">{messages.common.saved}</span>}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function MultiField({
  label,
  value,
  onChange,
  textarea,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
        />
      )}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function SingleField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
