"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

import type { ExternalLink } from "@/lib/data";
import { getIcon } from "@/lib/icons";

type Props = {
  links: ExternalLink[];
  label?: string;
};

export const ExternalLinksDropdown = ({ links, label = "External Links" }: Props) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  if (links.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        onFocus={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm transition hover:text-[rgb(112,66,248)] xl:text-base"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="external-links-menu"
      >
        {label}
        <svg
          className={`w-3 h-3 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className={`absolute top-full left-1/2 z-50 -translate-x-1/2 pt-2 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          id="external-links-menu"
          role="menu"
          className={`w-56 bg-[#030014cc] backdrop-blur-md border border-[rgba(112,66,248,0.38)] rounded-xl py-2 shadow-xl shadow-purple-900/30 transition duration-150 ${
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
          aria-hidden={!open}
        >
          {links.map((link) => {
            const Icon = getIcon(link.icon);
            return (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-200 hover:text-[rgb(112,66,248)] hover:bg-purple-500/10 transition text-sm"
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
