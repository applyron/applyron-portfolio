"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";

import type {
  SkillCategoryKey,
  SkillItem,
  SkillsData,
} from "@/lib/data";
import { validateSkills } from "@/lib/validate";

import { useAdminI18n } from "../AdminI18nProvider";
import {
  type AdminTabProps,
  getAdminErrorMessage,
  useDirtyTracker,
} from "./tab-utils";

const CATEGORY_ORDER: SkillCategoryKey[] = [
  "core",
  "frontend",
  "backend",
  "fullstack",
  "other",
];

const EMPTY_SKILL = (): SkillItem => ({
  id: Date.now().toString(),
  name: "",
  image: "",
  width: 80,
  height: 80,
});

export default function SkillsTab({
  onDirtyChange,
  onUnauthorized,
}: AdminTabProps) {
  const [data, setData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const { messages } = useAdminI18n();
  const { currentSnapshot, setCleanSnapshot } = useDirtyTracker(
    data,
    onDirtyChange,
  );

  const loadSkills = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/skills", {
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

      if (validateSkills(payload).length > 0) {
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
    void loadSkills();
  }, []);

  async function handleSave() {
    if (!data) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/admin/skills", {
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

  function updateSkill(
    category: SkillCategoryKey,
    id: string,
    field: keyof SkillItem,
    value: string | number,
  ) {
    setData(
      (prev) =>
        prev && {
          ...prev,
          [category]: prev[category].map((item) =>
            item.id === id ? { ...item, [field]: value } : item,
          ),
        },
    );
  }

  function addSkill(category: SkillCategoryKey) {
    setData(
      (prev) =>
        prev && {
          ...prev,
          [category]: [...prev[category], EMPTY_SKILL()],
        },
    );
  }

  function removeSkill(category: SkillCategoryKey, id: string) {
    setData(
      (prev) =>
        prev && {
          ...prev,
          [category]: prev[category].filter((item) => item.id !== id),
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
      <h2 className="mb-6 text-xl font-bold text-white">
        {messages.skills.heading}
      </h2>

      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => (
          <section
            key={category}
            className="rounded-2xl border border-purple-500/20 bg-[#0d0030] p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-purple-300">
                {messages.skills.categories[category]}
              </h3>
              <button
                onClick={() => addSkill(category)}
                className="rounded-lg border border-purple-500/40 bg-purple-600/30 px-3 py-1.5 text-xs text-purple-200 transition hover:bg-purple-600/50"
              >
                {messages.skills.addSkill}
              </button>
            </div>

            <div className="space-y-3">
              {data[category].map((skill) => (
                <div
                  key={skill.id}
                  className="grid grid-cols-1 gap-3 rounded-2xl border border-purple-500/20 bg-[#06001a] p-4 md:grid-cols-[84px_minmax(0,1.4fr)_minmax(0,1fr)_96px_96px_112px]"
                >
                  <div className="flex items-center justify-center rounded-xl border border-white/10 bg-[#030014] p-3">
                    {skill.image ? (
                      <Image
                        src={`/skills/${skill.image}`}
                        alt={skill.name || "Skill preview"}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">No preview</span>
                    )}
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs text-gray-400">
                      {messages.common.nameLabel}
                    </span>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(event) =>
                        updateSkill(category, skill.id, "name", event.target.value)
                      }
                      className="w-full rounded-lg border border-purple-500/20 bg-[#0d0030] px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-gray-400">
                      {messages.skills.imageLabel}
                    </span>
                    <input
                      type="text"
                      value={skill.image}
                      onChange={(event) =>
                        updateSkill(category, skill.id, "image", event.target.value)
                      }
                      className="w-full rounded-lg border border-purple-500/20 bg-[#0d0030] px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-gray-400">
                      {messages.skills.widthLabel}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={skill.width}
                      onChange={(event) =>
                        updateSkill(category, skill.id, "width", Number(event.target.value) || 0)
                      }
                      className="w-full rounded-lg border border-purple-500/20 bg-[#0d0030] px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-gray-400">
                      {messages.skills.heightLabel}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={skill.height}
                      onChange={(event) =>
                        updateSkill(category, skill.id, "height", Number(event.target.value) || 0)
                      }
                      className="w-full rounded-lg border border-purple-500/20 bg-[#0d0030] px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500"
                    />
                  </label>

                  <div className="flex items-end">
                    <button
                      onClick={() => removeSkill(category, skill.id)}
                      className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      {messages.common.remove}
                    </button>
                  </div>
                </div>
              ))}

              {data[category].length === 0 && (
                <p className="text-sm text-gray-500">{messages.skills.empty}</p>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-2 font-semibold text-white transition hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50"
        >
          {saving ? messages.common.saving : messages.common.saveChanges}
        </button>
        {saved && <span className="text-sm text-green-400">{messages.common.saved}</span>}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
