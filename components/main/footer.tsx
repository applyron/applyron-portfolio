"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { FooterGroup } from "@/lib/data";
import { getIcon } from "@/lib/icons";

type FooterProps = {
  footerGroups: FooterGroup[];
  copyright: string;
};

export const Footer = ({ footerGroups, copyright }: FooterProps) => {
  const t = useTranslations("footer");
  return (
    <div className="w-full h-full bg-transparent text-gray-200 shadow-lg p-[15px]">
      <div className="w-full flex flex-col items-center justify-center m-auto">
        <div className="w-full h-full flex flex-row items-center justify-around flex-wrap">
          {footerGroups.map((column) => (
            <div
              key={column.id}
              className="min-w-[200px] h-auto flex flex-col items-center justify-start"
            >
              <h3 className="font-bold text-[16px]">{column.title}</h3>
              {column.items.map(({ icon, name, link, id }) => {
                const Icon = getIcon(icon);
                return (
                  <Link
                    key={id}
                    href={link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex flex-row items-center my-[15px]"
                  >
                    {Icon && <Icon />}
                    <span className="text-[15px] ml-[6px]">{name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mb-[20px] text-[15px] text-center">
          &copy; {copyright} {new Date().getFullYear()} {t("rights")}
        </div>
      </div>
    </div>
  );
};
