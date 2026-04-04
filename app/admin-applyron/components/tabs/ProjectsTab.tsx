"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { MultiLangString, Project } from "@/lib/data";
import { validateProjects } from "@/lib/validate";

import ImageUploader from "../ImageUploader";
import { useAdminI18n } from "../AdminI18nProvider";
import {
  type AdminTabProps,
  getAdminErrorMessage,
} from "./tab-utils";

type Lang = "en" | "tr";

const EMPTY_PROJECT = (): Project => ({
  id: Date.now().toString(),
  slug: "",
  title: { en: "", tr: "" },
  description: { en: "", tr: "" },
  longDescription: { en: "", tr: "" },
  image: "",
  technologies: [],
  githubUrl: "",
  demoUrl: "",
});

function cloneProject(project: Project): Project {
  return {
    ...project,
    title: { ...project.title },
    description: { ...project.description },
    longDescription: { ...project.longDescription },
    technologies: [...project.technologies],
  };
}

function parseTechnologies(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDraftSnapshot(project: Project, techInput: string): string {
  return JSON.stringify({
    ...project,
    technologies: parseTechnologies(techInput),
  });
}

export default function ProjectsTab({
  onDirtyChange,
  onUnauthorized,
}: AdminTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editorDirty, setEditorDirty] = useState(false);
  const { messages } = useAdminI18n();

  useEffect(() => {
    onDirtyChange?.(Boolean(editing) && editorDirty);
  }, [editing, editorDirty, onDirtyChange]);

  useEffect(() => {
    return () => {
      onDirtyChange?.(false);
    };
  }, [onDirtyChange]);

  const loadProjects = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/projects", {
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

      if (validateProjects(payload).length > 0) {
        setError(messages.common.loadError);
        return;
      }

      setProjects(payload);
    } catch {
      setError(messages.common.loadError);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void loadProjects();
  }, []);

  async function saveAll(updated: Project[]) {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        onUnauthorized?.();
        return false;
      }

      if (!response.ok || payload?.success !== true) {
        setError(getAdminErrorMessage(payload, messages.common.saveError));
        return false;
      }

      setProjects(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch {
      setError(messages.common.saveError);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function startEdit(project: Project) {
    setError("");
    setEditorDirty(false);
    setEditing(cloneProject(project));
  }

  function handleNew() {
    setError("");
    setEditorDirty(false);
    setEditing(EMPTY_PROJECT());
  }

  async function handleDelete(id: string) {
    const updated = projects.filter((project) => project.id !== id);
    const success = await saveAll(updated);

    if (success) {
      setEditorDirty(false);
    }
  }

  async function handleSaveProject(project: Project) {
    const slug = project.slug || slugify(project.title.en || project.title.tr);
    const withSlug = { ...project, slug };
    const exists = projects.some((item) => item.id === project.id);
    const updated = exists
      ? projects.map((item) => (item.id === project.id ? withSlug : item))
      : [...projects, withSlug];

    const success = await saveAll(updated);

    if (success) {
      setEditing(null);
      setEditorDirty(false);
    }

    return success;
  }

  if (loading) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  if (editing) {
    return (
      <ProjectForm
        error={error}
        onDirtyChange={setEditorDirty}
        onSave={handleSaveProject}
        onCancel={() => {
          setEditing(null);
          setEditorDirty(false);
        }}
        project={editing}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{messages.projects.heading}</h2>
        <button
          onClick={handleNew}
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition disabled:opacity-50"
        >
          {messages.projects.add}
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 bg-[#0d0030] border border-purple-500/20 rounded-xl"
          >
            <div>
              <p className="font-medium text-white">{project.title.en}</p>
              <p className="text-sm text-gray-400">{project.title.tr}</p>
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.map((technology) => (
                    <span
                      key={technology}
                      className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <button
                onClick={() => startEdit(project)}
                disabled={saving}
                className="px-3 py-1.5 text-sm rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition disabled:opacity-50"
              >
                {messages.projects.edit}
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      messages.projects.deleteConfirm(
                        project.title.en || project.title.tr || project.slug,
                      ),
                    )
                  ) {
                    void handleDelete(project.id);
                  }
                }}
                disabled={saving}
                className="px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
              >
                {messages.projects.delete}
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">{messages.projects.empty}</div>
        )}
      </div>

      {saved && <p className="mt-4 text-green-400 text-sm">{messages.common.saved}</p>}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function ProjectForm({
  error,
  onDirtyChange,
  onSave,
  onCancel,
  project,
  saving,
}: {
  error: string;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (project: Project) => Promise<boolean>;
  onCancel: () => void;
  project: Project;
  saving: boolean;
}) {
  const [data, setData] = useState<Project>(project);
  const [lang, setLang] = useState<Lang>("en");
  const [techInput, setTechInput] = useState(project.technologies.join(", "));
  const [initialSnapshot] = useState(() =>
    buildDraftSnapshot(project, project.technologies.join(", ")),
  );
  const { messages } = useAdminI18n();

  const isDirty = buildDraftSnapshot(data, techInput) !== initialSnapshot;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    return () => {
      onDirtyChange(false);
    };
  }, [onDirtyChange]);

  function setLangField(
    field: keyof Pick<Project, "title" | "description" | "longDescription">,
    value: string,
  ) {
    setData((prev) => ({
      ...prev,
      [field]: { ...(prev[field] as MultiLangString), [lang]: value },
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const technologies = parseTechnologies(techInput);
    const slug = data.slug || slugify(data.title.en || data.title.tr);

    await onSave({ ...data, technologies, slug });
  }

  function handleCancel() {
    if (
      isDirty &&
      !window.confirm(messages.common.unsavedChangesConfirm)
    ) {
      return;
    }

    onCancel();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="text-gray-400 hover:text-white transition text-sm disabled:opacity-50"
        >
          ← {messages.projects.form.back}
        </button>
        <h2 className="text-xl font-bold text-white">
          {project.title.en || project.title.tr
            ? messages.projects.form.editTitle
            : messages.projects.form.newTitle}
        </h2>
      </div>

      <div className="flex gap-2 mb-6">
        {(["en", "tr"] as Lang[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLang(item)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              lang === item
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                : "bg-[#0d0030] border border-purple-500/20 text-gray-400 hover:text-white"
            }`}
          >
            {item === "en"
              ? messages.common.languageTabEnglish
              : messages.common.languageTabTurkish}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.projects.form.titleLabel(lang.toUpperCase())}
          </label>
          <input
            type="text"
            value={(data.title as MultiLangString)[lang]}
            onChange={(event) => setLangField("title", event.target.value)}
            required
            className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.projects.form.slugLabel}
          </label>
          <input
            type="text"
            value={data.slug}
            onChange={(event) => setData({ ...data, slug: event.target.value })}
            placeholder={messages.projects.form.slugPlaceholder}
            className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.projects.form.shortDescription(lang.toUpperCase())}
          </label>
          <textarea
            value={(data.description as MultiLangString)[lang]}
            onChange={(event) => setLangField("description", event.target.value)}
            rows={2}
            className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.projects.form.longDescription(lang.toUpperCase())}
          </label>
          <textarea
            value={(data.longDescription as MultiLangString)[lang]}
            onChange={(event) =>
              setLangField("longDescription", event.target.value)
            }
            rows={4}
            className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.projects.form.projectImage}
          </label>
          <ImageUploader
            currentUrl={data.image}
            uploadTarget="project"
            onUploaded={(url) => setData({ ...data, image: url })}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages.projects.form.githubUrl}
            </label>
            <input
              type="url"
              value={data.githubUrl}
              onChange={(event) =>
                setData({ ...data, githubUrl: event.target.value })
              }
              placeholder="https://github.com/..."
              className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {messages.projects.form.demoUrl}
            </label>
            <input
              type="url"
              value={data.demoUrl}
              onChange={(event) =>
                setData({ ...data, demoUrl: event.target.value })
              }
              placeholder="https://..."
              className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {messages.projects.form.technologies}{" "}
            <span className="text-gray-500 font-normal">
              ({messages.projects.form.commaSeparated})
            </span>
          </label>
          <input
            type="text"
            value={techInput}
            onChange={(event) => setTechInput(event.target.value)}
            placeholder={messages.projects.form.technologiesPlaceholder}
            className="w-full bg-[#0d0030] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 transition"
        >
          {saving ? messages.common.saving : messages.projects.form.save}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="px-6 py-2 rounded-lg border border-purple-500/30 text-gray-400 hover:text-white transition disabled:opacity-50"
        >
          {messages.common.cancel}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </form>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
