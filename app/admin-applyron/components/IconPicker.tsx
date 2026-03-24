"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ICON_CATALOG, getIcon, getIconMeta } from "@/lib/icons";
import { useAdminI18n } from "./AdminI18nProvider";

type Props = {
  value: string | null;
  onChange: (iconId: string | null) => void;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
};

export default function IconPicker({
  value,
  onChange,
  disabled,
  allowEmpty = false,
  emptyLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { messages } = useAdminI18n();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedMeta = getIconMeta(value);
  const fallbackMeta = ICON_CATALOG[0];
  const displayMeta = selectedMeta ?? fallbackMeta;
  const SelectedIcon = getIcon(displayMeta.id);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredIcons = ICON_CATALOG.filter((icon) => {
    if (!normalizedQuery) return true;
    return [icon.label, icon.category, ...icon.tags].some((entry) =>
      entry.toLowerCase().includes(normalizedQuery),
    );
  });

  const groupedIcons = filteredIcons.reduce<Record<string, typeof ICON_CATALOG>>(
    (groups, icon) => {
      groups[icon.category] ??= [];
      groups[icon.category].push(icon);
      return groups;
    },
    {},
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 bg-[#06001a] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedMeta && SelectedIcon ? (
            <SelectedIcon className="h-4 w-4 shrink-0 text-cyan-300" />
          ) : null}
          <span className="truncate">
            {selectedMeta ? selectedMeta.label : (emptyLabel ?? messages.socials.noIcon)}
          </span>
        </span>
        <span className="text-xs text-gray-500">{messages.iconPicker.choose}</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={messages.iconPicker.dialogLabel}
          className="absolute left-0 top-full z-50 mt-2 w-[min(34rem,calc(100vw-3rem))] rounded-2xl border border-purple-500/30 bg-[#09001f] p-4 shadow-2xl shadow-purple-950/40"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={messages.iconPicker.searchPlaceholder}
                className="w-full bg-[#06001a] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              className="px-3 py-2 text-xs rounded-lg border border-purple-500/20 text-gray-400 hover:text-white hover:border-purple-500/50 transition"
            >
              {messages.iconPicker.close}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto pr-1 space-y-4">
            {allowEmpty && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  value === null
                    ? "border-cyan-400/70 bg-cyan-500/10 text-white"
                    : "border-purple-500/20 bg-[#06001a] text-gray-300 hover:border-purple-500/50 hover:text-white"
                }`}
              >
                <span>{emptyLabel ?? messages.socials.noIcon}</span>
                <span className="text-xs text-gray-500">{messages.common.remove}</span>
              </button>
            )}

            {Object.entries(groupedIcons).map(([category, icons]) => (
              <div key={category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {messages.iconPicker.categories[category] ?? category}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {icons.map((icon) => {
                    const Icon = getIcon(icon.id);
                    const selected = value === icon.id;

                    return (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => {
                          onChange(icon.id);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                          selected
                            ? "border-cyan-400/70 bg-cyan-500/10 text-white"
                            : "border-purple-500/20 bg-[#06001a] text-gray-300 hover:border-purple-500/50 hover:text-white"
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-cyan-300" />}
                        <span className="truncate">{icon.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredIcons.length === 0 && (
              <div className="rounded-xl border border-purple-500/20 bg-[#06001a] px-4 py-6 text-center text-sm text-gray-400">
                {messages.iconPicker.noResults}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
