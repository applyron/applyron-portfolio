"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

import type { SocialItem, ExternalLink, NavLink } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { resolveLocalizedHref } from "@/lib/public-links";
import { ExternalLinksDropdown } from "@/components/sub/external-links-dropdown";
import { LanguageSwitcher } from "@/components/sub/language-switcher";

type NavbarProps = {
  socials: SocialItem[];
  externalLinks: ExternalLink[];
  siteName: string;
  logoUrl: string;
  navLinks: NavLink[];
};

export const Navbar = ({
  socials,
  externalLinks,
  siteName,
  logoUrl,
  navLinks,
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale() as "en" | "tr";

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileMenuOpen]);

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const resolveNavHref = (href: string) =>
    href.startsWith("#")
      ? `/${locale}${href}`
      : resolveLocalizedHref(locale, href);

  return (
    <>
      <div className="fixed top-0 z-50 h-[88px] w-full bg-[#03001427] px-4 shadow-lg shadow-[#2A0E61]/50 backdrop-blur-md sm:h-[96px] sm:px-6 lg:h-[112px] lg:px-8 xl:h-[132px] xl:px-10">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 lg:gap-6">
          <Link
            href={resolveNavHref("#about-me")}
            className="flex shrink-0 items-center"
          >
            <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:h-24 lg:w-24 xl:h-[120px] xl:w-[120px]">
              <Image
                src={logoUrl}
                alt={t("logoAlt", { siteName })}
                fill
                priority
                sizes="(min-width: 1280px) 120px, (min-width: 1024px) 96px, (min-width: 640px) 80px, 64px"
                draggable={false}
                className="cursor-pointer object-contain"
              />
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-2 lg:flex xl:px-6">
            <nav className="flex min-w-0 items-center gap-4 rounded-full border border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-5 py-3 text-sm text-gray-200 xl:gap-6 xl:px-7 xl:text-base">
              {navLinks.map((link) => {
                const title = typeof link.title === "object"
                  ? (link.title[locale] || link.title.en)
                  : link.title;
                return (
                  <Link
                    key={link.link}
                    href={resolveNavHref(link.link)}
                    className="cursor-pointer whitespace-nowrap transition hover:text-[rgb(112,66,248)]"
                  >
                    {title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-4">
            <div className="flex shrink-0 items-center gap-3 rounded-full border border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-3 py-2 text-sm text-gray-200 xl:px-4">
              <ExternalLinksDropdown links={externalLinks} label={t("externalLinks")} />
              <LanguageSwitcher />
            </div>

            {socials.length > 0 && (
              <div className="flex shrink-0 items-center gap-4 rounded-full border border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-4 py-3">
                {socials.map(({ link, name, icon }) => {
                  const Icon = getIcon(icon);
                  return Icon ? (
                    <Link
                      href={link}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={name}
                      key={name}
                    >
                      <Icon className="h-5 w-5 text-white transition hover:text-[rgb(112,66,248)] xl:h-6 xl:w-6" />
                    </Link>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-full border border-[rgba(112,66,248,0.35)] bg-[rgba(3,0,20,0.55)] p-2 text-2xl leading-none text-white transition hover:border-purple-400/60 hover:bg-purple-500/10 focus:outline-none lg:hidden"
            onClick={toggleMenu}
            aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-panel"
          >
            ☰
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t("closeMenu")}
            className="absolute inset-0 bg-[#030014cc] backdrop-blur-sm"
          />

          <div
            id="mobile-nav-panel"
            className="absolute left-0 right-0 top-[88px] border-t border-[rgba(112,66,248,0.2)] bg-[#030014f2] px-4 py-4 text-gray-300 shadow-2xl shadow-[#2A0E61]/40 backdrop-blur-xl sm:top-[96px] sm:px-6"
          >
            <div className="mx-auto flex max-h-[calc(100dvh-120px)] w-full max-w-sm flex-col items-stretch gap-4 overflow-y-auto text-center">
              {navLinks.map((link) => {
                const title = typeof link.title === "object"
                  ? (link.title[locale] || link.title.en)
                  : link.title;
                return (
                  <Link
                    key={link.link}
                    href={resolveNavHref(link.link)}
                    className="rounded-xl border border-transparent px-4 py-2.5 transition hover:border-[rgba(112,66,248,0.35)] hover:bg-purple-500/10 hover:text-[rgb(112,66,248)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {title}
                  </Link>
                );
              })}

              {externalLinks.length > 0 && (
                <>
                  <div className="w-full border-t border-[rgba(112,66,248,0.2)] my-1" />
                  <span className="text-xs uppercase tracking-widest text-gray-500">
                    {t("externalLinks")}
                  </span>
                  {externalLinks.map((link) => {
                    const Icon = getIcon(link.icon);
                    return (
                      <Link
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2.5 transition hover:border-[rgba(112,66,248,0.35)] hover:bg-purple-500/10 hover:text-[rgb(112,66,248)]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {link.name}
                      </Link>
                    );
                  })}
                </>
              )}

              <div className="mt-2 flex justify-center">
                <LanguageSwitcher />
              </div>

              <div className="mt-3 flex justify-center gap-6">
                {socials.map(({ link, name, icon }) => {
                  const Icon = getIcon(icon);
                  return Icon ? (
                    <Link
                      href={link}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={name}
                      key={name}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
