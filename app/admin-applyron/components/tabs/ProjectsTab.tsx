"use client";

import { useEffect, useState } from "react";
import type { Project, MultiLangString } from "@/lib/data";
import ImageUploader from "../ImageUploader";
import { useAdminI18n } from "../AdminI18nProvider";

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

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { messages } = useAdminI18n();

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then(setProjects);
  }, []);

  async function saveAll(updated: Project[]) {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function startEdit(project: Project) {
    setEditing({ ...project });
  }

  function handleNew() {
    setEditing(EMPTY_PROJECT());
  }

  function handleDelete(id: string) {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveAll(updated);
  }

  function handleSaveProject(project: Project) {
    const slug = project.slug || slugify(project.title.en || project.title.tr);
    const withSlug = { ...project, slug };
    const exists = projects.some((p) => p.id === project.id);
    const updated = exists
      ? projects.map((p) => (p.id === project.id ? withSlug : p))
      : [...projects, withSlug];
    setProjects(updated);
    setEditing(null);
    saveAll(updated);
  }

  if (editing) {
    return (
      <ProjectForm
        project={editing}
        onSave={handleSaveProject}
        onCancel={() => setEditing(null)}
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
          className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition"
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
                  {project.technologies.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <button
                onClick={() => startEdit(project)}
                className="px-3 py-1.5 text-sm rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition"
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
                    handleDelete(project.id);
                  }
                }}
                className="px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
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
    </div>
  );
}

function ProjectForm({
  project,
  onSave,
  onCancel,
  saving,
}: {
  project: Project;
  onSave: (p: Project) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [data, setData] = useState<Project>(project);
  const [lang, setLang] = useState<Lang>("en");
  const [techInput, setTechInput] = useState(data.technologies.join(", "));
  const { messages } = useAdminI18n();

  function setLangField(field: keyof Pick<Project, "title" | "description" | "longDescription">, value: string) {
    setData((prev) => ({
      ...prev,
      [field]: { ...(prev[field] as MultiLangString), [lang]: value },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const technologies = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const slug = data.slug || slugify(data.title.en || data.title.tr);
    onSave({ ...data, technologies, slug });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition text-sm"
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
        {(["en", "tr"] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              lang === l
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                : "bg-[#0d0030] border border-purple-500/20 text-gray-400 hover:text-white"
            }`}
          >
            {l === "en"
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
            onChange={(e) => setLangField("title", e.target.value)}
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
            onChange={(e) => setData({ ...data, slug: e.target.value })}
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
            onChange={(e) => setLangField("description", e.target.value)}
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
            onChange={(e) => setLangField("longDescription", e.target.value)}
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
              onChange={(e) => setData({ ...data, githubUrl: e.target.value })}
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
              onChange={(e) => setData({ ...data, demoUrl: e.target.value })}
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
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="React, TypeScript, Tailwind CSS"
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
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-purple-500/30 text-gray-400 hover:text-white transition"
        >
          {messages.common.cancel}
        </button>
      </div>
    </form>
  );
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
