"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { MultiLangString, NavLink, SiteData } from "@/lib/data";
import { validateSiteData } from "@/lib/validate";

import ImageUploader from "../ImageUploader";
import { useAdminI18n } from "../AdminI18nProvider";
import {
  type AdminTabProps,
  getAdminErrorMessage,
  useDirtyTracker,
} from "./tab-utils";

type LangTab = "en" | "tr";

const EMPTY_NAV_LINK = (): NavLink => ({
  title: { en: "", tr: "" },
  link: "#new-link",
});

export default function SiteTab({
  onDirtyChange,
  onUnauthorized,
}: AdminTabProps) {
  const [data, setData] = useState<SiteData | null>(null);
  const [navLang, setNavLang] = useState<LangTab>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { messages } = useAdminI18n();
  const { currentSnapshot, setCleanSnapshot } = useDirtyTracker(
    data,
    onDirtyChange,
  );

  const loadSiteData = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/site", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        onUnauthorized?.();
        return;
      }

      if (!response.ok) {
        setError(getAdminErrorMessage(payload, messages.common.loadError));
        return;
      }

      if (validateSiteData(payload).length > 0) {
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
    void loadSiteData();
  }, []);

  async function handleSave() {
    if (!data) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/admin/site", {
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

  function updateNavLinkTitle(index: number, lang: LangTab, value: string) {
    if (!data) {
      return;
    }

    const links = [...data.navLinks];
    const current = links[index].title as MultiLangString;
    links[index] = { ...links[index], title: { ...current, [lang]: value } };
    setData({ ...data, navLinks: links });
  }

  function updateNavLinkLink(index: number, value: string) {
    if (!data) {
      return;
    }

    const links = [...data.navLinks];
    links[index] = { ...links[index], link: value };
    setData({ ...data, navLinks: links });
  }

  function addNavLink() {
    if (!data) {
      return;
    }

    setData({ ...data, navLinks: [...data.navLinks, EMPTY_NAV_LINK()] });
  }

  function removeNavLink(index: number) {
    if (!data) {
      return;
    }

    setData({
      ...data,
      navLinks: data.navLinks.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function getNavLinkTitle(link: NavLink, lang: LangTab): string {
    if (typeof link.title === "object") {
      return (link.title as MultiLangString)[lang] ?? "";
    }

    return link.title as string;
  }

  if (loading) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  if (!data) {
    return <p className="text-sm text-red-400">{error || messages.common.loadError}</p>;
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
          onChange={(value) => setData({ ...data, name: value })}
        />
        <Field
          label={messages.site.siteTitle}
          value={data.title}
          onChange={(value) => setData({ ...data, title: value })}
        />
        <div className="md:col-span-2">
          <Field
            label={messages.site.siteDescription}
            value={data.description}
            onChange={(value) => setData({ ...data, description: value })}
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
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-white">
            {messages.site.navigationLinks}
          </h3>
          <button
            onClick={addNavLink}
            className="px-3 py-1.5 text-xs rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition"
          >
            {messages.site.addNavLink}
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          {(["en", "tr"] as LangTab[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setNavLang(lang)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                navLang === lang
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                  : "border border-purple-500/30 text-gray-400 hover:text-white"
              }`}
            >
              {lang === "en"
                ? messages.common.languageTabEnglish
                : messages.common.languageTabTurkish}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {data.navLinks.map((link, index) => (
            <div key={`${link.link}-${index}`} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder={messages.site.navLabelPlaceholder}
                value={getNavLinkTitle(link, navLang)}
                onChange={(event) =>
                  updateNavLinkTitle(index, navLang, event.target.value)
                }
                className="flex-1 bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition"
              />
              <input
                type="text"
                placeholder={messages.site.navLinkPlaceholder}
                value={link.link}
                onChange={(event) =>
                  updateNavLinkLink(index, event.target.value)
                }
                className="flex-1 bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition"
              />
              <button
                onClick={() => removeNavLink(index)}
                className="shrink-0 rounded-lg border border-red-500/30 px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                {messages.site.removeNavLink}
              </button>
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

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
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
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
        />
      )}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
