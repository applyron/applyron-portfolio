"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ContactMessage, ContactMessageStatus } from "@/lib/data";
import { validateMessages } from "@/lib/validate";

import { useAdminI18n } from "../AdminI18nProvider";
import { type AdminTabProps, getAdminErrorMessage } from "./tab-utils";

type MessagesTabProps = Pick<AdminTabProps, "onUnauthorized"> & {
  onUnreadCountChange?: (count: number) => void;
};

export default function MessagesTab({
  onUnauthorized,
  onUnreadCountChange,
}: MessagesTabProps) {
  const [messagesData, setMessagesData] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { messages } = useAdminI18n();

  const unreadCount = useMemo(
    () => messagesData.filter((message) => message.status === "new").length,
    [messagesData],
  );

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/messages", {
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

      if (validateMessages(payload).length > 0) {
        setError(messages.common.loadError);
        return;
      }

      setMessagesData(payload);
    } catch {
      setError(messages.common.loadError);
    } finally {
      setLoading(false);
    }
  }, [messages.common.loadError, onUnauthorized]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  async function updateStatus(id: string, status: ContactMessageStatus) {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
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

      setMessagesData((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, status } : message,
        ),
      );
    } catch {
      setError(messages.common.saveError);
    } finally {
      setBusyId(null);
    }
  }

  async function removeMessage(id: string) {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
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

      setMessagesData((prev) => prev.filter((message) => message.id !== id));
      setExpandedId((prev) => (prev === id ? null : prev));
    } catch {
      setError(messages.common.saveError);
    } finally {
      setBusyId(null);
    }
  }

  function handleSelect(message: ContactMessage) {
    setExpandedId((prev) => (prev === message.id ? null : message.id));

    if (message.status === "new") {
      void updateStatus(message.id, "read");
    }
  }

  if (loading) {
    return (
      <div className="text-gray-400 animate-pulse">{messages.common.loading}</div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{messages.messages.heading}</h2>
          <p className="mt-1 text-sm text-gray-400">
            {messages.messages.unreadBadge(unreadCount)}
          </p>
        </div>
        <button
          onClick={() => void loadMessages()}
          className="rounded-lg border border-purple-500/30 px-4 py-2 text-sm text-gray-300 transition hover:border-purple-500 hover:text-white"
        >
          {messages.messages.refresh}
        </button>
      </div>

      <div className="space-y-3">
        {messagesData.map((message) => {
          const expanded = expandedId === message.id;
          const statusLabel =
            message.status === "new"
              ? messages.messages.unread
              : message.status === "archived"
                ? messages.messages.archived
                : messages.messages.read;

          return (
            <article
              key={message.id}
              className={`rounded-2xl border p-4 transition ${
                message.status === "new"
                  ? "border-cyan-400/30 bg-cyan-500/5"
                  : "border-purple-500/20 bg-[#0d0030]"
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelect(message)}
                className="flex w-full flex-col gap-3 text-left md:flex-row md:items-start md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">
                      {message.name}
                    </h3>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-cyan-200">
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-300">
                    {message.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatMessageDate(message.createdAt)}
                </span>
              </button>

              {expanded && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#06001a] p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                        {messages.messages.phone}
                      </p>
                      <p className="mt-2 text-sm text-white">{message.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                        {messages.messages.receivedAt}
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                    {message.message}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {message.status === "new" && (
                      <button
                        type="button"
                        onClick={() => void updateStatus(message.id, "read")}
                        disabled={busyId === message.id}
                        className="rounded-lg border border-cyan-400/30 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/10 disabled:opacity-50"
                      >
                        {messages.messages.markRead}
                      </button>
                    )}
                    {message.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => void updateStatus(message.id, "archived")}
                        disabled={busyId === message.id}
                        className="rounded-lg border border-purple-500/30 px-4 py-2 text-sm text-gray-200 transition hover:bg-purple-500/10 disabled:opacity-50"
                      >
                        {messages.messages.archive}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void removeMessage(message.id)}
                      disabled={busyId === message.id}
                      className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {messages.messages.delete}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {messagesData.length === 0 && (
          <p className="rounded-2xl border border-purple-500/20 bg-[#0d0030] px-4 py-10 text-center text-sm text-gray-500">
            {messages.messages.empty}
          </p>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function formatMessageDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
