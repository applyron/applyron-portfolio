"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

import type { SocialItem, ExternalLink, NavLink } from "@/lib/data";
import { getIcon } from "@/lib/icons";
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
  logoUrl,
  navLinks,
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale() as "en" | "tr";

  return (
    <div className="w-full h-[104px] md:h-[132px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001427] backdrop-blur-md z-50 px-10">
      <div className="w-full h-full flex items-center justify-between m-auto px-[10px]">
        <Link href={`/${locale}#about-me`} className="flex items-center shrink-0">
          <div className="relative h-24 w-24 md:h-[120px] md:w-[120px] shrink-0">
            <Image
              src={logoUrl}
              alt="Logo"
              fill
              priority
              sizes="(min-width: 768px) 120px, 96px"
              draggable={false}
              className="cursor-pointer object-contain"
            />
          </div>
        </Link>

        <div className="hidden md:flex w-[540px] h-full flex-row items-center justify-between md:mr-20">
          <div className="flex items-center justify-between w-full h-auto border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200">
            {navLinks.map((link) => {
              const title = typeof link.title === "object"
                ? (link.title[locale] || link.title.en)
                : link.title;
              return (
                <Link
                  key={link.link}
                  href={`/${locale}${link.link}`}
                  className="cursor-pointer hover:text-[rgb(112,66,248)] transition"
                >
                  {title}
                </Link>
              );
            })}

            <ExternalLinksDropdown links={externalLinks} label={t("externalLinks")} />

            <LanguageSwitcher />
          </div>
        </div>

        <div className="hidden md:flex flex-row gap-5">
          {socials.map(({ link, name, icon }) => {
            const Icon = getIcon(icon);
            return Icon ? (
              <Link
                href={link}
                target="_blank"
                rel="noreferrer noopener"
                key={name}
              >
                <Icon className="h-6 w-6 text-white" />
              </Link>
            ) : null;
          })}
        </div>

        <button
          className="md:hidden text-white focus:outline-none text-4xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[104px] left-0 w-full bg-[#030014] p-5 flex flex-col items-center text-gray-300 md:hidden">
          <div className="flex flex-col items-center gap-4">
            {navLinks.map((link) => {
              const title = typeof link.title === "object"
                ? (link.title[locale] || link.title.en)
                : link.title;
              return (
                <Link
                  key={link.link}
                  href={`/${locale}${link.link}`}
                  className="cursor-pointer hover:text-[rgb(112,66,248)] transition text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {title}
                </Link>
              );
            })}

            {externalLinks.length > 0 && (
              <>
                <div className="w-full border-t border-[rgba(112,66,248,0.2)] my-1" />
                <span className="text-xs text-gray-500 uppercase tracking-widest">
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
                      className="flex items-center gap-2 cursor-pointer hover:text-[rgb(112,66,248)] transition text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.name}
                    </Link>
                  );
                })}
              </>
            )}

            <div className="mt-2">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-6">
            {socials.map(({ link, name, icon }) => {
              const Icon = getIcon(icon);
              return Icon ? (
                <Link
                  href={link}
                  target="_blank"
                  rel="noreferrer noopener"
                  key={name}
                >
                  <Icon className="h-8 w-8 text-white" />
                </Link>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
