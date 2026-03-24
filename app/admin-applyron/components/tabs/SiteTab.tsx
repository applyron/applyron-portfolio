"use client";

import { useEffect, useState } from "react";
import type { SiteData, NavLink, MultiLangString } from "@/lib/data";
import ImageUploader from "../ImageUploader";
import { useAdminI18n } from "../AdminI18nProvider";

type LangTab = "en" | "tr";

export default function SiteTab() {
  const [data, setData] = useState<SiteData | null>(null);
  const [navLang, setNavLang] = useState<LangTab>("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { messages } = useAdminI18n();

  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then(setData);
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateNavLinkTitle(index: number, lang: LangTab, value: string) {
    if (!data) return;
    const links = [...data.navLinks];
    const current = links[index].title as MultiLangString;
    links[index] = { ...links[index], title: { ...current, [lang]: value } };
    setData({ ...data, navLinks: links });
  }

  function getNavLinkTitle(link: NavLink, lang: LangTab): string {
    if (typeof link.title === "object") {
      return (link.title as MultiLangString)[lang] ?? "";
    }
    return link.title as string;
  }

  if (!data) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">
        {messages.site.heading}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label={messages.site.siteName}
          value={data.name}
          onChange={(v) => setData({ ...data, name: v })}
        />
        <Field
          label={messages.site.siteTitle}
          value={data.title}
          onChange={(v) => setData({ ...data, title: v })}
        />
        <div className="md:col-span-2">
          <Field
            label={messages.site.siteDescription}
            value={data.description}
            onChange={(v) => setData({ ...data, description: v })}
            textarea
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.site.logo}
          </label>
          <ImageUploader
            currentUrl={data.logoUrl}
            uploadTarget="logo"
            onUploaded={(url) => setData({ ...data, logoUrl: url })}
          />
        </div>
        <Field
          label={messages.site.footerCopyright}
          value={data.copyright}
          onChange={(v) => setData({ ...data, copyright: v })}
          hint={messages.site.footerHint(data.copyright, new Date().getFullYear())}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-white mb-3">
          {messages.site.navigationLinks}
        </h3>
        <div className="flex gap-2 mb-4">
          {(["en", "tr"] as LangTab[]).map((l) => (
            <button
              key={l}
              onClick={() => setNavLang(l)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                navLang === l
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
        <div className="flex flex-col gap-3">
          {data.navLinks.map((link, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder={messages.site.navLabelPlaceholder}
                value={getNavLinkTitle(link, navLang)}
                onChange={(e) => updateNavLinkTitle(i, navLang, e.target.value)}
                className="flex-1 bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition"
              />
              <input
                type="text"
                placeholder={messages.site.navLinkPlaceholder}
                value={link.link}
                onChange={(e) => {
                  const links = [...data.navLinks];
                  links[i] = { ...links[i], link: e.target.value };
                  setData({ ...data, navLinks: links });
                }}
                className="flex-1 bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          ))}
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

function Field({
  label,
  value,
  onChange,
  textarea,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
        />
      )}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
