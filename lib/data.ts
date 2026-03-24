import fs from "fs";
import path from "path";

import { getDataFilePath } from "@/lib/runtime-config";

function readJson<T>(filename: string, fallback: T): T {
  const filePath = getDataFilePath(filename);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filename: string, data: unknown): void {
  const filePath = getDataFilePath(filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export type MultiLangString = { en: string; tr: string };

export type NavLink = {
  title: MultiLangString;
  link: string;
};

export type SiteData = {
  name: string;
  title: string;
  description: string;
  logoUrl: string;
  copyright: string;
  navLinks: NavLink[];
};

export type Project = {
  id: string;
  slug: string;
  title: MultiLangString;
  description: MultiLangString;
  longDescription: MultiLangString;
  image: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
};

export type ExternalLink = {
  id: string;
  name: string;
  icon: string;
  url: string;
};

export type SocialItem = {
  id: string;
  name: string;
  icon: string | null;
  link: string;
};

export type FooterGroup = {
  id: string;
  title: string;
  items: SocialItem[];
};

export type SocialsData = {
  navbar: SocialItem[];
  footer: FooterGroup[];
};

export type AboutData = {
  badge: MultiLangString;
  heroTitle: MultiLangString;
  heroHighlight: MultiLangString;
  description: MultiLangString;
  ctaText: MultiLangString;
  ctaLink: string;
  heroImage: string;
};

export type AuthData = {
  password: string;
};

const DEFAULT_NAV_LINKS: NavLink[] = [
  { title: { en: "About me", tr: "Hakkımda" }, link: "#about-me" },
  { title: { en: "Skills", tr: "Yetenekler" }, link: "#skills" },
  { title: { en: "Projects", tr: "Projeler" }, link: "#projects" },
];

export const getSiteData = (): SiteData =>
  readJson<SiteData>("site.json", {
    name: "Applyron",
    title: "Applyron | Web Design",
    description: "Applyron için çok dilli web tasarım vitrini.",
    logoUrl: "/logo.png",
    copyright: "Applyron",
    navLinks: DEFAULT_NAV_LINKS,
  });

export const setSiteData = (data: SiteData) => writeJson("site.json", data);

export const getProjects = (): Project[] =>
  readJson<Project[]>("projects.json", []);

export const setProjects = (data: Project[]) =>
  writeJson("projects.json", data);

export const getLinks = (): ExternalLink[] =>
  readJson<ExternalLink[]>("links.json", []);

export const setLinks = (data: ExternalLink[]) =>
  writeJson("links.json", data);

export const getSocials = (): SocialsData =>
  readJson<SocialsData>("socials.json", { navbar: [], footer: [] });

export const setSocials = (data: SocialsData) =>
  writeJson("socials.json", data);

const DEFAULT_ABOUT: AboutData = {
  badge: { en: "", tr: "" },
  heroTitle: { en: "", tr: "" },
  heroHighlight: { en: "", tr: "" },
  description: { en: "", tr: "" },
  ctaText: { en: "Learn more", tr: "Daha fazla" },
  ctaLink: "#about-me",
  heroImage: "/hero-bg.svg",
};

export const getAbout = (): AboutData =>
  readJson<AboutData>("about.json", DEFAULT_ABOUT);

export const setAbout = (data: AboutData) => writeJson("about.json", data);

export const getAuth = (): AuthData =>
  readJson<AuthData>("auth.json", { password: "" });

export const setAuth = (data: AuthData) => writeJson("auth.json", data);

export const isAuthConfigured = (): boolean => {
  const auth = getAuth();
  return typeof auth.password === "string" && auth.password.trim().length > 0;
};
