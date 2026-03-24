"use client";

import { useEffect, useState } from "react";
import type { SocialsData, SocialItem, FooterGroup } from "@/lib/data";
import IconPicker from "../IconPicker";
import { useAdminI18n } from "../AdminI18nProvider";

const newItem = (): SocialItem => ({
  id: Date.now().toString(),
  name: "",
  icon: "RxInstagramLogo",
  link: "",
});

const newFooterGroup = (title: string): FooterGroup => ({
  id: Date.now().toString(),
  title,
  items: [],
});

export default function SocialsTab() {
  const [data, setData] = useState<SocialsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { messages } = useAdminI18n();

  useEffect(() => {
    fetch("/api/admin/socials")
      .then((r) => r.json())
      .then(setData);
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/socials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!data) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  function updateNavbarItem(id: string, field: keyof SocialItem, value: string | null) {
    setData((prev) => prev && ({
      ...prev,
      navbar: prev.navbar.map((i) => i.id === id ? { ...i, [field]: value } : i),
    }));
  }

  function removeNavbarItem(id: string) {
    setData((prev) => prev && ({ ...prev, navbar: prev.navbar.filter((i) => i.id !== id) }));
  }

  function updateFooterItem(groupId: string, itemId: string, field: keyof SocialItem, value: string | null) {
    setData((prev) => prev && ({
      ...prev,
      footer: prev.footer.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.map((i) => i.id === itemId ? { ...i, [field]: value } : i) }
          : g,
      ),
    }));
  }

  function removeFooterItem(groupId: string, itemId: string) {
    setData((prev) => prev && ({
      ...prev,
      footer: prev.footer.map((g) =>
        g.id === groupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g,
      ),
    }));
  }

  function removeGroup(groupId: string) {
    setData((prev) => prev && ({ ...prev, footer: prev.footer.filter((g) => g.id !== groupId) }));
  }

  function updateGroupTitle(groupId: string, title: string) {
    setData((prev) => prev && ({
      ...prev,
      footer: prev.footer.map((g) => g.id === groupId ? { ...g, title } : g),
    }));
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
            onClick={() => setData((prev) => prev && ({ ...prev, navbar: [...prev.navbar, newItem()] }))}
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

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-purple-300">
            {messages.socials.footerGroups}
          </h3>
          <button
            onClick={() =>
              setData((prev) =>
                prev && ({
                  ...prev,
                  footer: [...prev.footer, newFooterGroup(messages.socials.newGroup)],
                })
              )
            }
            className="px-3 py-1.5 text-xs rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition"
          >
            {messages.socials.addGroup}
          </button>
        </div>
        <div className="space-y-4">
          {data.footer.map((group) => (
            <div key={group.id} className="bg-[#0d0030] border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={group.title}
                  onChange={(e) => updateGroupTitle(group.id, e.target.value)}
                  className="flex-1 bg-[#06001a] border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  placeholder={messages.socials.groupTitlePlaceholder}
                />
                <button
                  onClick={() => removeGroup(group.id)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                >
                  {messages.socials.removeGroup}
                </button>
                <button
                  onClick={() =>
                    setData((prev) => prev && ({
                      ...prev,
                      footer: prev.footer.map((g) =>
                        g.id === group.id ? { ...g, items: [...g.items, newItem()] } : g,
                      ),
                    }))
                  }
                  className="px-3 py-1.5 text-xs rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition"
                >
                  {messages.socials.addGroupItem}
                </button>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <SocialItemRow
                    key={item.id}
                    item={item}
                    allowNoIcon
                    onUpdate={(field, value) => updateFooterItem(group.id, item.id, field, value)}
                    onRemove={() => removeFooterItem(group.id, item.id)}
                    messages={messages}
                  />
                ))}
                {group.items.length === 0 && (
                  <p className="text-gray-600 text-xs">{messages.socials.noItems}</p>
                )}
              </div>
            </div>
          ))}
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
          onChange={(e) => onUpdate("name", e.target.value)}
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
          onChange={(e) => onUpdate("link", e.target.value)}
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
