"use client";

import { useState } from "react";
import SiteTab from "./tabs/SiteTab";
import ProjectsTab from "./tabs/ProjectsTab";
import LinksTab from "./tabs/LinksTab";
import SocialsTab from "./tabs/SocialsTab";
import AboutTab from "./tabs/AboutTab";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";
import { useAdminI18n } from "./AdminI18nProvider";

type Tab = "site" | "projects" | "links" | "socials" | "about";

type Props = { onLogout: () => void };

export default function AdminDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("site");
  const [loggingOut, setLoggingOut] = useState(false);
  const { messages } = useAdminI18n();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "site", label: messages.dashboard.tabs.site, icon: "⚙️" },
    { id: "projects", label: messages.dashboard.tabs.projects, icon: "📁" },
    { id: "links", label: messages.dashboard.tabs.links, icon: "🔗" },
    { id: "socials", label: messages.dashboard.tabs.socials, icon: "👥" },
    { id: "about", label: messages.dashboard.tabs.about, icon: "👤" },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    onLogout();
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
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-900/30"
                  : "bg-[#0a0020] border border-purple-500/20 text-gray-400 hover:text-white hover:border-purple-500/50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#0a0020] border border-purple-500/20 rounded-2xl p-6 shadow-xl">
          {activeTab === "site" && <SiteTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "links" && <LinksTab />}
          {activeTab === "socials" && <SocialsTab />}
          {activeTab === "about" && <AboutTab />}
        </div>
      </div>
    </div>
  );
}
