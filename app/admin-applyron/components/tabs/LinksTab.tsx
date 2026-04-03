"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { ExternalLink } from "@/lib/data";
import { validateLinks } from "@/lib/validate";

import IconPicker from "../IconPicker";
import { useAdminI18n } from "../AdminI18nProvider";
import {
  type AdminTabProps,
  getAdminErrorMessage,
  useDirtyTracker,
} from "./tab-utils";

const EMPTY_LINK = (): ExternalLink => ({
  id: Date.now().toString(),
  name: "",
  icon: "RxGithubLogo",
  url: "",
});

export default function LinksTab({
  onDirtyChange,
  onUnauthorized,
}: AdminTabProps) {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { messages } = useAdminI18n();
  const { currentSnapshot, setCleanSnapshot } = useDirtyTracker(
    links,
    onDirtyChange,
  );

  const loadLinks = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/links", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        onUnauthorized?.();
        return;
      }

      if (!response.ok) {
        setError(getAdminErrorMessage(payload, messages.links.loadError));
        return;
      }

      if (validateLinks(payload).length > 0) {
        setError(messages.links.loadError);
        return;
      }

      setLinks(payload);
      setCleanSnapshot(JSON.stringify(payload));
    } catch {
      setError(messages.links.loadError);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void loadLinks();
  }, []);

  function update(id: string, field: keyof ExternalLink, value: string) {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    );
  }

  function remove(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(links),
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        onUnauthorized?.();
        return;
      }

      if (!response.ok || payload?.success !== true) {
        setError(getAdminErrorMessage(payload, messages.links.saveError));
        return;
      }

      setSaved(true);
      setCleanSnapshot(currentSnapshot);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(messages.links.saveError);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">{messages.links.heading}</h2>
        <button
          onClick={() => setLinks((prev) => [...prev, EMPTY_LINK()])}
          className="px-4 py-2 text-sm rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition"
        >
          {messages.links.add}
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {messages.links.description}
      </p>

      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="grid grid-cols-1 gap-3 rounded-xl border border-purple-500/20 bg-[#0d0030] p-4 md:grid-cols-4"
          >
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                {messages.links.titleLabel}
              </label>
              <input
                type="text"
                value={link.name}
                onChange={(event) => update(link.id, "name", event.target.value)}
                placeholder={messages.links.titlePlaceholder}
                className="w-full bg-[#06001a] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                {messages.common.iconLabel}
              </label>
              <IconPicker
                value={link.icon}
                onChange={(iconId) => {
                  if (iconId) {
                    update(link.id, "icon", iconId);
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                {messages.links.urlLabel}
              </label>
              <input
                type="url"
                value={link.url}
                onChange={(event) => update(link.id, "url", event.target.value)}
                placeholder={messages.links.urlPlaceholder}
                className="w-full bg-[#06001a] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => remove(link.id)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
              >
                {messages.links.remove}
              </button>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="rounded-xl border border-dashed border-purple-500/20 py-8 text-center text-gray-500">
            {messages.links.empty}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 transition"
        >
          {saving ? messages.common.saving : messages.common.saveChanges}
        </button>
        {saved && <span className="text-green-400 text-sm">{messages.links.saved}</span>}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
