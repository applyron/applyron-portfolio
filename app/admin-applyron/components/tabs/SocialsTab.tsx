"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { SocialItem, SocialsData } from "@/lib/data";
import { validateSocials } from "@/lib/validate";

import IconPicker from "../IconPicker";
import { useAdminI18n } from "../AdminI18nProvider";
import {
  type AdminTabProps,
  getAdminErrorMessage,
  useDirtyTracker,
} from "./tab-utils";

const newItem = (): SocialItem => ({
  id: Date.now().toString(),
  name: "",
  icon: "RxInstagramLogo",
  link: "",
});

export default function SocialsTab({
  onDirtyChange,
  onUnauthorized,
}: AdminTabProps) {
  const [data, setData] = useState<SocialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { messages } = useAdminI18n();
  const { currentSnapshot, setCleanSnapshot } = useDirtyTracker(
    data,
    onDirtyChange,
  );

  const loadSocials = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/socials", {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        onUnauthorized?.();
        return;
      }

      if (!response.ok) {
        setError(getAdminErrorMessage(payload, messages.common.loadError));
        return;
      }

      if (validateSocials(payload).length > 0) {
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
    void loadSocials();
  }, []);

  async function handleSave() {
    if (!data) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/admin/socials", {
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

  function updateNavbarItem(
    id: string,
    field: keyof SocialItem,
    value: string | null,
  ) {
    setData(
      (prev) =>
        prev && {
          ...prev,
          navbar: prev.navbar.map((item) =>
            item.id === id ? { ...item, [field]: value } : item,
          ),
        },
    );
  }

  function removeNavbarItem(id: string) {
    setData(
      (prev) =>
        prev && {
          ...prev,
          navbar: prev.navbar.filter((item) => item.id !== id),
        },
    );
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
        {messages.socials.heading}
      </h2>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-purple-300">
            {messages.socials.navbarIcons}
          </h3>
          <button
            onClick={() =>
              setData((prev) =>
                prev && { ...prev, navbar: [...prev.navbar, newItem()] },
              )
            }
            className="px-3 py-1.5 text-xs rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition"
          >
            {messages.socials.addItem}
          </button>
        </div>
        <div className="space-y-2">
          {data.navbar.map((item) => (
            <SocialItemRow
              key={item.id}
              item={item}
              onUpdate={(field, value) => updateNavbarItem(item.id, field, value)}
              onRemove={() => removeNavbarItem(item.id)}
              messages={messages}
            />
          ))}
          {data.navbar.length === 0 && (
            <p className="text-gray-500 text-sm">{messages.socials.noNavbarItems}</p>
          )}
        </div>
      </section>

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

function SocialItemRow({
  item,
  onUpdate,
  onRemove,
  allowNoIcon,
  messages,
}: {
  item: SocialItem;
  onUpdate: (field: keyof SocialItem, value: string | null) => void;
  onRemove: () => void;
  allowNoIcon?: boolean;
  messages: ReturnType<typeof useAdminI18n>["messages"];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-purple-500/20 bg-[#0d0030] p-4 md:grid-cols-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          {messages.common.nameLabel}
        </label>
        <input
          type="text"
          value={item.name}
          onChange={(event) => onUpdate("name", event.target.value)}
          placeholder={messages.socials.namePlaceholder}
          className="w-full bg-[#06001a] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          {messages.common.iconLabel}
        </label>
        <IconPicker
          value={item.icon}
          onChange={(iconId) => onUpdate("icon", iconId)}
          allowEmpty={allowNoIcon}
          emptyLabel={messages.socials.noIcon}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          {messages.common.urlLabel}
        </label>
        <input
          type="url"
          value={item.link}
          onChange={(event) => onUpdate("link", event.target.value)}
          placeholder={messages.socials.urlPlaceholder}
          className="w-full bg-[#06001a] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={onRemove}
          className="w-full px-3 py-2 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
        >
          {messages.socials.remove}
        </button>
      </div>
    </div>
  );
}
