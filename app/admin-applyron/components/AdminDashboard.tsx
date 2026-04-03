"use client";

import { useEffect, useState } from "react";

import SiteTab from "./tabs/SiteTab";
import ProjectsTab from "./tabs/ProjectsTab";
import SkillsTab from "./tabs/SkillsTab";
import LinksTab from "./tabs/LinksTab";
import MessagesTab from "./tabs/MessagesTab";
import SocialsTab from "./tabs/SocialsTab";
import AboutTab from "./tabs/AboutTab";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";
import { useAdminI18n } from "./AdminI18nProvider";

type Tab =
  | "site"
  | "projects"
  | "skills"
  | "links"
  | "messages"
  | "socials"
  | "about";

type Props = {
  onLogout: () => void;
  onUnauthorized: () => void;
};

export default function AdminDashboard({
  onLogout,
  onUnauthorized,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("site");
  const [dirtyTabs, setDirtyTabs] = useState<Record<Tab, boolean>>({
    site: false,
    projects: false,
    skills: false,
    links: false,
    messages: false,
    socials: false,
    about: false,
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const { messages } = useAdminI18n();

  const tabs: {
    id: Tab;
    label: string;
    icon: string;
    dirty: boolean;
    badge?: number;
  }[] = [
    {
      id: "site",
      label: messages.dashboard.tabs.site,
      icon: "⚙️",
      dirty: dirtyTabs.site,
    },
    {
      id: "projects",
      label: messages.dashboard.tabs.projects,
      icon: "📁",
      dirty: dirtyTabs.projects,
    },
    {
      id: "skills",
      label: messages.dashboard.tabs.skills,
      icon: "🧠",
      dirty: dirtyTabs.skills,
    },
    {
      id: "links",
      label: messages.dashboard.tabs.links,
      icon: "🔗",
      dirty: dirtyTabs.links,
    },
    {
      id: "messages",
      label: messages.dashboard.tabs.messages,
      icon: "✉️",
      dirty: dirtyTabs.messages,
      badge: unreadMessages,
    },
    {
      id: "socials",
      label: messages.dashboard.tabs.socials,
      icon: "👥",
      dirty: dirtyTabs.socials,
    },
    {
      id: "about",
      label: messages.dashboard.tabs.about,
      icon: "👤",
      dirty: dirtyTabs.about,
    },
  ];

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/admin/messages", { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (response.status === 401) {
          onUnauthorized();
          return;
        }

        if (!response.ok || !Array.isArray(payload)) {
          return;
        }

        setUnreadMessages(
          payload.filter(
            (message) =>
              message &&
              typeof message === "object" &&
              (message as { status?: string }).status === "new",
          ).length,
        );
      } catch {
      }
    }

    void loadUnreadCount();
  }, [onUnauthorized]);

  useEffect(() => {
    if (!dirtyTabs[activeTab]) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = messages.common.unsavedChangesConfirm;
      return messages.common.unsavedChangesConfirm;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeTab, dirtyTabs, messages.common.unsavedChangesConfirm]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    onLogout();
  }

  function updateDirtyState(tab: Tab, dirty: boolean) {
    setDirtyTabs((prev) =>
      prev[tab] === dirty ? prev : { ...prev, [tab]: dirty },
    );
  }

  function handleTabChange(nextTab: Tab) {
    if (nextTab === activeTab) {
      return;
    }

    if (
      dirtyTabs[activeTab] &&
      !window.confirm(messages.common.unsavedChangesConfirm)
    ) {
      return;
    }

    setActiveTab(nextTab);
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <header className="border-b border-purple-500/20 bg-[#030014]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm">
              A
            </div>
            <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {messages.dashboard.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AdminLanguageSwitcher />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 text-sm rounded-lg border border-purple-500/30 text-gray-400 hover:text-white hover:border-purple-500 transition disabled:opacity-50"
            >
              {loggingOut
                ? messages.common.loggingOut
                : messages.common.logOut}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-900/30"
                  : "bg-[#0a0020] border border-purple-500/20 text-gray-400 hover:text-white hover:border-purple-500/50"
              }`}
              title={tab.dirty ? messages.common.unsavedChanges : undefined}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs font-semibold text-cyan-200">
                  {tab.badge}
                </span>
              )}
              {tab.dirty && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400"
                  aria-label={messages.common.unsavedChanges}
                />
              )}
            </button>
          ))}
        </div>

        <div className="bg-[#0a0020] border border-purple-500/20 rounded-2xl p-6 shadow-xl">
          {activeTab === "site" && (
            <SiteTab
              onDirtyChange={(dirty) => updateDirtyState("site", dirty)}
              onUnauthorized={onUnauthorized}
            />
          )}
          {activeTab === "projects" && (
            <ProjectsTab
              onDirtyChange={(dirty) => updateDirtyState("projects", dirty)}
              onUnauthorized={onUnauthorized}
            />
          )}
          {activeTab === "skills" && (
            <SkillsTab
              onDirtyChange={(dirty) => updateDirtyState("skills", dirty)}
              onUnauthorized={onUnauthorized}
            />
          )}
          {activeTab === "links" && (
            <LinksTab
              onDirtyChange={(dirty) => updateDirtyState("links", dirty)}
              onUnauthorized={onUnauthorized}
            />
          )}
          {activeTab === "messages" && (
            <MessagesTab
              onUnauthorized={onUnauthorized}
              onUnreadCountChange={setUnreadMessages}
            />
          )}
          {activeTab === "socials" && (
            <SocialsTab
              onDirtyChange={(dirty) => updateDirtyState("socials", dirty)}
              onUnauthorized={onUnauthorized}
            />
          )}
          {activeTab === "about" && (
            <AboutTab
              onDirtyChange={(dirty) => updateDirtyState("about", dirty)}
              onUnauthorized={onUnauthorized}
            />
          )}
        </div>
      </div>
    </div>
  );
}
