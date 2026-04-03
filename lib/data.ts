import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { isAvailableIcon } from "@/lib/icons";
import { getDataFilePath } from "@/lib/runtime-config";

async function readJson(filename: string): Promise<unknown> {
  const filePath = getDataFilePath(filename);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

async function writeJson(filename: string, data: unknown): Promise<void> {
  const filePath = getDataFilePath(filename);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNonEmptyString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function asPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const normalized = Math.round(value);
  return normalized > 0 ? normalized : fallback;
}

function asTrimmedString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

function isSiteLink(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  if (value.startsWith("#")) {
    return value.length > 1;
  }

  return value.startsWith("/");
}

function asSiteLink(value: unknown, fallback: string): string {
  return typeof value === "string" && isSiteLink(value) ? value : fallback;
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelyPhone(value: string): boolean {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  return (
    /^[+\d\s()-]+$/.test(trimmed) &&
    digits.length >= 10 &&
    digits.length <= 15
  );
}

function isStoredContactPoint(value: string): boolean {
  return isLikelyPhone(value) || isLikelyEmail(value);
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

export const SKILL_CATEGORY_KEYS = [
  "core",
  "frontend",
  "backend",
  "fullstack",
  "other",
] as const;

export type SkillCategoryKey = (typeof SKILL_CATEGORY_KEYS)[number];

export type SkillItem = {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
};

export type SkillsData = Record<SkillCategoryKey, SkillItem[]>;

export const CONTACT_MESSAGE_STATUSES = ["new", "read", "archived"] as const;

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  status: ContactMessageStatus;
};

export type ContactSubmission = {
  name: string;
  phone: string;
  message: string;
};

const EMPTY_MULTI_LANG = (): MultiLangString => ({ en: "", tr: "" });

function cloneMultiLangString(value: MultiLangString): MultiLangString {
  return { ...value };
}

function normalizeMultiLangString(
  value: unknown,
  fallback: MultiLangString = EMPTY_MULTI_LANG(),
): MultiLangString {
  if (!isRecord(value)) {
    return cloneMultiLangString(fallback);
  }

  return {
    en: asString(value.en, fallback.en),
    tr: asString(value.tr, fallback.tr),
  };
}

function hasVisibleText(value: MultiLangString): boolean {
  return value.en.trim().length > 0 || value.tr.trim().length > 0;
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  { title: { en: "About", tr: "Hakkımızda" }, link: "#about-me" },
  { title: { en: "Skills", tr: "Yetenekler" }, link: "#skills" },
  { title: { en: "Projects", tr: "Projeler" }, link: "#projects" },
  { title: { en: "Contact", tr: "İletişim" }, link: "/contact" },
];

function cloneNavLinks(links: NavLink[]): NavLink[] {
  return links.map((link) => ({
    title: cloneMultiLangString(link.title),
    link: link.link,
  }));
}

function normalizeNavLink(value: unknown): NavLink | null {
  if (!isRecord(value)) {
    return null;
  }

  const link = asSiteLink(value.link, "");
  if (!link) {
    return null;
  }

  return {
    title: normalizeMultiLangString(value.title),
    link,
  };
}

const DEFAULT_SITE_DATA: SiteData = {
  name: "Applyron",
  title: "Applyron | Digital Studio",
  description:
    "Applyron creates multilingual launch-ready web experiences for modern brands.",
  logoUrl: "/logo.png",
  copyright: "Applyron",
  navLinks: DEFAULT_NAV_LINKS,
};

function cloneSiteData(value: SiteData): SiteData {
  return {
    ...value,
    navLinks: cloneNavLinks(value.navLinks),
  };
}

function normalizeSiteData(value: unknown): SiteData {
  if (!isRecord(value)) {
    return cloneSiteData(DEFAULT_SITE_DATA);
  }

  const navLinks = Array.isArray(value.navLinks)
    ? value.navLinks
        .map(normalizeNavLink)
        .filter((item): item is NavLink => item !== null)
    : [];

  return {
    name: asNonEmptyString(value.name, DEFAULT_SITE_DATA.name),
    title: asNonEmptyString(value.title, DEFAULT_SITE_DATA.title),
    description: asNonEmptyString(
      value.description,
      DEFAULT_SITE_DATA.description,
    ),
    logoUrl: asNonEmptyString(value.logoUrl, DEFAULT_SITE_DATA.logoUrl),
    copyright: asNonEmptyString(value.copyright, DEFAULT_SITE_DATA.copyright),
    navLinks: navLinks.length > 0 ? navLinks : cloneNavLinks(DEFAULT_NAV_LINKS),
  };
}

function normalizeProject(value: unknown): Project | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNonEmptyString(value.id, "");
  const slug = asNonEmptyString(value.slug, "");
  const image = asNonEmptyString(value.image, "");
  const title = normalizeMultiLangString(value.title);
  const description = normalizeMultiLangString(value.description);

  if (
    !id ||
    !slug ||
    !image ||
    !hasVisibleText(title) ||
    !hasVisibleText(description)
  ) {
    return null;
  }

  return {
    id,
    slug,
    title,
    description,
    longDescription: normalizeMultiLangString(value.longDescription),
    image,
    technologies: asStringArray(value.technologies),
    githubUrl: asString(value.githubUrl),
    demoUrl: asString(value.demoUrl),
  };
}

function normalizeExternalLink(value: unknown): ExternalLink | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNonEmptyString(value.id, "");
  const name = asNonEmptyString(value.name, "");
  const url = asNonEmptyString(value.url, "");
  const icon = asString(value.icon);

  if (!id || !name || !url || !isAvailableIcon(icon)) {
    return null;
  }

  return {
    id,
    name,
    icon,
    url,
  };
}

function normalizeSocialItem(
  value: unknown,
  allowEmptyIcon: boolean,
): SocialItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNonEmptyString(value.id, "");
  const name = asNonEmptyString(value.name, "");
  const link = asNonEmptyString(value.link, "");

  if (!id || !name || !link) {
    return null;
  }

  let icon: string | null = null;
  const rawIcon = value.icon;

  if (rawIcon === null && allowEmptyIcon) {
    icon = null;
  } else if (typeof rawIcon === "string" && isAvailableIcon(rawIcon)) {
    icon = rawIcon;
  } else if (!allowEmptyIcon) {
    return null;
  }

  return {
    id,
    name,
    icon,
    link,
  };
}

function cloneSocialItem(item: SocialItem): SocialItem {
  return { ...item };
}

function normalizeFooterGroup(value: unknown): FooterGroup | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNonEmptyString(value.id, "");
  const title = asNonEmptyString(value.title, "");

  if (!id || !title) {
    return null;
  }

  const items = Array.isArray(value.items)
    ? value.items
        .map((item) => normalizeSocialItem(item, true))
        .filter((item): item is SocialItem => item !== null)
    : [];

  return {
    id,
    title,
    items,
  };
}

const DEFAULT_SOCIALS_DATA: SocialsData = {
  navbar: [
    {
      id: "instagram",
      name: "Instagram",
      icon: "RxInstagramLogo",
      link: "https://instagram.com/applyron",
    },
  ],
  footer: [],
};

function cloneSocialsData(value: SocialsData): SocialsData {
  return {
    navbar: value.navbar.map(cloneSocialItem),
    footer: value.footer.map((group) => ({
      ...group,
      items: group.items.map(cloneSocialItem),
    })),
  };
}

function normalizeSocialsData(value: unknown): SocialsData {
  if (!isRecord(value)) {
    return cloneSocialsData(DEFAULT_SOCIALS_DATA);
  }

  const navbar = Array.isArray(value.navbar)
    ? value.navbar
        .map((item) => normalizeSocialItem(item, false))
        .filter((item): item is SocialItem => item !== null)
    : DEFAULT_SOCIALS_DATA.navbar.map(cloneSocialItem);

  const footer = Array.isArray(value.footer)
    ? value.footer
        .map(normalizeFooterGroup)
        .filter((item): item is FooterGroup => item !== null)
    : cloneSocialsData(DEFAULT_SOCIALS_DATA).footer;

  return {
    navbar,
    footer,
  };
}

const DEFAULT_ABOUT: AboutData = {
  badge: { en: "Applyron Studio", tr: "Applyron Studio" },
  heroTitle: {
    en: "Designing launch-ready digital experiences.",
    tr: "Lansmana hazir dijital deneyimler tasarliyoruz.",
  },
  heroHighlight: {
    en: "launch-ready",
    tr: "Lansmana hazir",
  },
  description: {
    en: "Applyron builds multilingual websites, polished launch flows, and flexible content experiences for modern brands that need a stronger digital presence.",
    tr: "Applyron, daha guclu bir dijital varlik isteyen modern markalar icin cok dilli web siteleri, ozenli lansman akisleri ve esnek icerik deneyimleri tasarlar.",
  },
  ctaText: { en: "Start a project", tr: "Proje başlat" },
  ctaLink: "/contact",
  heroImage: "/hero-bg.svg",
};

function cloneAboutData(value: AboutData): AboutData {
  return {
    badge: cloneMultiLangString(value.badge),
    heroTitle: cloneMultiLangString(value.heroTitle),
    heroHighlight: cloneMultiLangString(value.heroHighlight),
    description: cloneMultiLangString(value.description),
    ctaText: cloneMultiLangString(value.ctaText),
    ctaLink: value.ctaLink,
    heroImage: value.heroImage,
  };
}

function normalizeAboutData(value: unknown): AboutData {
  if (!isRecord(value)) {
    return cloneAboutData(DEFAULT_ABOUT);
  }

  return {
    badge: normalizeMultiLangString(value.badge, DEFAULT_ABOUT.badge),
    heroTitle: normalizeMultiLangString(
      value.heroTitle,
      DEFAULT_ABOUT.heroTitle,
    ),
    heroHighlight: normalizeMultiLangString(
      value.heroHighlight,
      DEFAULT_ABOUT.heroHighlight,
    ),
    description: normalizeMultiLangString(
      value.description,
      DEFAULT_ABOUT.description,
    ),
    ctaText: normalizeMultiLangString(value.ctaText, DEFAULT_ABOUT.ctaText),
    ctaLink: asNonEmptyString(value.ctaLink, DEFAULT_ABOUT.ctaLink),
    heroImage: asNonEmptyString(value.heroImage, DEFAULT_ABOUT.heroImage),
  };
}

function normalizeAuthData(value: unknown): AuthData {
  if (!isRecord(value)) {
    return { password: "" };
  }

  return {
    password: asString(value.password),
  };
}

const DEFAULT_SKILLS_DATA: SkillsData = {
  core: [
    { id: "core-html", name: "HTML", image: "html.webp", width: 80, height: 80 },
    { id: "core-css", name: "CSS", image: "css.webp", width: 80, height: 80 },
    { id: "core-js", name: "JavaScript", image: "js.webp", width: 65, height: 65 },
    { id: "core-tailwind", name: "Tailwind CSS", image: "tailwind.webp", width: 80, height: 80 },
    { id: "core-react", name: "React", image: "react.webp", width: 80, height: 80 },
    { id: "core-redux", name: "Redux", image: "redux.webp", width: 80, height: 80 },
    { id: "core-react-query", name: "React Query", image: "reactquery.webp", width: 80, height: 80 },
    { id: "core-typescript", name: "TypeScript", image: "ts.webp", width: 80, height: 80 },
    { id: "core-nextjs", name: "Next.js", image: "next.webp", width: 80, height: 80 },
    { id: "core-framer", name: "Framer Motion", image: "framer.webp", width: 80, height: 80 },
    { id: "core-stripe", name: "Stripe", image: "stripe.webp", width: 80, height: 80 },
    { id: "core-node", name: "Node.js", image: "node.webp", width: 80, height: 80 },
    { id: "core-mongodb", name: "MongoDB", image: "mongodb.webp", width: 40, height: 40 },
  ],
  frontend: [
    { id: "frontend-html", name: "HTML", image: "html.webp", width: 80, height: 80 },
    { id: "frontend-css", name: "CSS", image: "css.webp", width: 80, height: 80 },
    { id: "frontend-js", name: "JavaScript", image: "js.webp", width: 65, height: 65 },
    { id: "frontend-tailwind", name: "Tailwind CSS", image: "tailwind.webp", width: 80, height: 80 },
    { id: "frontend-mui", name: "Material UI", image: "mui.webp", width: 80, height: 80 },
    { id: "frontend-react", name: "React", image: "react.webp", width: 80, height: 80 },
    { id: "frontend-redux", name: "Redux", image: "redux.webp", width: 80, height: 80 },
    { id: "frontend-react-query", name: "React Query", image: "reactquery.webp", width: 80, height: 80 },
    { id: "frontend-typescript", name: "TypeScript", image: "ts.webp", width: 80, height: 80 },
    { id: "frontend-nextjs", name: "Next.js", image: "next.webp", width: 80, height: 80 },
  ],
  backend: [
    { id: "backend-node", name: "Node.js", image: "node.webp", width: 80, height: 80 },
    { id: "backend-express", name: "Express.js", image: "express.webp", width: 80, height: 80 },
    { id: "backend-mongodb", name: "MongoDB", image: "mongodb.webp", width: 40, height: 40 },
    { id: "backend-firebase", name: "Firebase", image: "firebase.webp", width: 55, height: 55 },
    { id: "backend-postgresql", name: "PostgreSQL", image: "postgresql.webp", width: 70, height: 70 },
    { id: "backend-mysql", name: "MySQL", image: "mysql.webp", width: 70, height: 70 },
    { id: "backend-prisma", name: "Prisma", image: "prisma.webp", width: 70, height: 70 },
    { id: "backend-graphql", name: "GraphQL", image: "graphql.webp", width: 80, height: 80 },
  ],
  fullstack: [
    { id: "fullstack-react-native", name: "React Native", image: "reactnative.webp", width: 70, height: 70 },
    { id: "fullstack-tauri", name: "Tauri", image: "tauri.webp", width: 70, height: 70 },
    { id: "fullstack-docker", name: "Docker", image: "docker.webp", width: 70, height: 70 },
    { id: "fullstack-figma", name: "Figma", image: "figma.webp", width: 50, height: 50 },
  ],
  other: [
    { id: "other-go", name: "Go", image: "go.webp", width: 60, height: 60 },
  ],
};

function cloneSkillItem(item: SkillItem): SkillItem {
  return { ...item };
}

function cloneSkillsData(value: SkillsData): SkillsData {
  return {
    core: value.core.map(cloneSkillItem),
    frontend: value.frontend.map(cloneSkillItem),
    backend: value.backend.map(cloneSkillItem),
    fullstack: value.fullstack.map(cloneSkillItem),
    other: value.other.map(cloneSkillItem),
  };
}

function normalizeSkillItem(value: unknown): SkillItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNonEmptyString(value.id, "");
  const name = asNonEmptyString(value.name, "");
  const image = asNonEmptyString(value.image, "");
  const width = asPositiveInteger(value.width, 80);
  const height = asPositiveInteger(value.height, 80);

  if (!id || !name || !image) {
    return null;
  }

  return {
    id,
    name,
    image,
    width,
    height,
  };
}

function normalizeSkillsData(value: unknown): SkillsData {
  if (!isRecord(value)) {
    return cloneSkillsData(DEFAULT_SKILLS_DATA);
  }

  const defaults = cloneSkillsData(DEFAULT_SKILLS_DATA);
  const normalized = {} as SkillsData;

  for (const key of SKILL_CATEGORY_KEYS) {
    normalized[key] = Array.isArray(value[key])
      ? value[key]
          .map(normalizeSkillItem)
          .filter((item): item is SkillItem => item !== null)
      : defaults[key];
  }

  return normalized;
}

function normalizeMessageStatus(value: unknown): ContactMessageStatus | null {
  if (
    typeof value === "string" &&
    CONTACT_MESSAGE_STATUSES.includes(value as ContactMessageStatus)
  ) {
    return value as ContactMessageStatus;
  }

  return null;
}

function normalizeContactMessage(value: unknown): ContactMessage | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNonEmptyString(value.id, "");
  const name = asTrimmedString(value.name);
  const phone = asTrimmedString(value.phone);
  const legacyEmail = asTrimmedString(value.email).toLowerCase();
  const contactPoint = phone || legacyEmail;
  const message = asTrimmedString(value.message);
  const createdAt = asNonEmptyString(value.createdAt, "");
  const status = normalizeMessageStatus(value.status);

  if (
    !id ||
    !name ||
    !message ||
    !createdAt ||
    !status ||
    !isStoredContactPoint(contactPoint) ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    return null;
  }

  return {
    id,
    name,
    phone: contactPoint,
    message,
    createdAt,
    status,
  };
}

function sortMessages(messages: ContactMessage[]): ContactMessage[] {
  return [...messages].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function getSiteData(): Promise<SiteData> {
  return normalizeSiteData(await readJson("site.json"));
}

export async function setSiteData(data: SiteData): Promise<void> {
  await writeJson("site.json", data);
}

export async function getProjects(): Promise<Project[]> {
  const value = await readJson("projects.json");
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeProject)
    .filter((item): item is Project => item !== null);
}

export async function setProjects(data: Project[]): Promise<void> {
  await writeJson("projects.json", data);
}

export async function getLinks(): Promise<ExternalLink[]> {
  const value = await readJson("links.json");
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeExternalLink)
    .filter((item): item is ExternalLink => item !== null);
}

export async function setLinks(data: ExternalLink[]): Promise<void> {
  await writeJson("links.json", data);
}

export async function getSocials(): Promise<SocialsData> {
  return normalizeSocialsData(await readJson("socials.json"));
}

export async function setSocials(data: SocialsData): Promise<void> {
  await writeJson("socials.json", data);
}

export async function getAbout(): Promise<AboutData> {
  return normalizeAboutData(await readJson("about.json"));
}

export async function setAbout(data: AboutData): Promise<void> {
  await writeJson("about.json", data);
}

export async function getAuth(): Promise<AuthData> {
  return normalizeAuthData(await readJson("auth.json"));
}

export async function setAuth(data: AuthData): Promise<void> {
  await writeJson("auth.json", data);
}

export async function isAuthConfigured(): Promise<boolean> {
  const auth = await getAuth();
  return typeof auth.password === "string" && auth.password.trim().length > 0;
}

export async function getSkills(): Promise<SkillsData> {
  return normalizeSkillsData(await readJson("skills.json"));
}

export async function setSkills(data: SkillsData): Promise<void> {
  await writeJson("skills.json", data);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const value = await readJson("messages.json");
  if (!Array.isArray(value)) {
    return [];
  }

  return sortMessages(
    value
      .map(normalizeContactMessage)
      .filter((item): item is ContactMessage => item !== null),
  );
}

export async function setContactMessages(
  data: ContactMessage[],
): Promise<void> {
  await writeJson("messages.json", sortMessages(data));
}

export async function addContactMessage(
  submission: ContactSubmission,
): Promise<ContactMessage> {
  const message: ContactMessage = {
    id: randomUUID(),
    name: submission.name.trim(),
    phone: submission.phone.trim(),
    message: submission.message.trim(),
    createdAt: new Date().toISOString(),
    status: "new",
  };

  const existing = await getContactMessages();
  await setContactMessages([message, ...existing]);
  return message;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessage | null> {
  const messages = await getContactMessages();
  let updatedMessage: ContactMessage | null = null;

  const updated = messages.map((message) => {
    if (message.id !== id) {
      return message;
    }

    updatedMessage = { ...message, status };
    return updatedMessage;
  });

  if (!updatedMessage) {
    return null;
  }

  await setContactMessages(updated);
  return updatedMessage;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const messages = await getContactMessages();
  const filtered = messages.filter((message) => message.id !== id);

  if (filtered.length === messages.length) {
    return false;
  }

  await setContactMessages(filtered);
  return true;
}
