"use client";

import { useEffect, useState } from "react";
import type { AboutData, MultiLangString } from "@/lib/data";
import ImageUploader from "../ImageUploader";
import { useAdminI18n } from "../AdminI18nProvider";

type LangTab = "en" | "tr";

export default function AboutTab() {
  const [data, setData] = useState<AboutData | null>(null);
  const [activeLang, setActiveLang] = useState<LangTab>("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { messages } = useAdminI18n();

  useEffect(() => {
    fetch("/api/admin/about")
      .then((r) => r.json())
      .then(setData);
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateLangField(field: keyof AboutData, lang: LangTab, value: string) {
    if (!data) return;
    const current = data[field] as MultiLangString;
    setData({ ...data, [field]: { ...current, [lang]: value } });
  }

  if (!data) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  const lang = activeLang;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        {messages.about.heading}
      </h2>

      <div className="flex gap-2 mb-6">
        {(["en", "tr"] as LangTab[]).map((l) => (
          <button
            key={l}
            onClick={() => setActiveLang(l)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              activeLang === l
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                : "border border-purple-500/30 text-gray-400 hover:text-white"
            }`}
          >
            {l === "en"
              ? messages.common.languageTabEnglish
              : messages.common.languageTabTurkish}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiField
          label={messages.about.badgeText}
          value={(data.badge as MultiLangString)[lang]}
          onChange={(v) => updateLangField("badge", lang, v)}
        />
        <MultiField
          label={messages.about.ctaButtonText}
          value={(data.ctaText as MultiLangString)[lang]}
          onChange={(v) => updateLangField("ctaText", lang, v)}
        />
        <div className="md:col-span-2">
          <MultiField
            label={messages.about.heroTitle}
            value={(data.heroTitle as MultiLangString)[lang]}
            onChange={(v) => updateLangField("heroTitle", lang, v)}
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
          onChange={(v) => updateLangField("heroHighlight", lang, v)}
          hint={messages.about.highlightHint}
        />
        <SingleField
          label={messages.about.ctaLink}
          value={data.ctaLink}
          onChange={(v) => setData({ ...data, ctaLink: v })}
        />
        <div className="md:col-span-2">
          <MultiField
            label={messages.about.description}
            value={(data.description as MultiLangString)[lang]}
            onChange={(v) => updateLangField("description", lang, v)}
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
    </div>
  );
}

function MultiField({
  label, value, onChange, textarea, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
        />
      )}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function SingleField({
  label, value, onChange, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
