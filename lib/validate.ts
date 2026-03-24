import { isAvailableIcon } from "@/lib/icons";

export type ValidationError = { field: string; message: string };

function err(field: string, message: string): ValidationError {
  return { field, message };
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isMultiLangString(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return isString(o.en) && isString(o.tr);
}

export function validateSiteData(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data || typeof data !== "object") return [err("root", "Must be an object")];
  const d = data as Record<string, unknown>;
  if (!isString(d.name) || !d.name.trim()) errors.push(err("name", "Required string"));
  if (!isString(d.title) || !d.title.trim()) errors.push(err("title", "Required string"));
  if (!isString(d.logoUrl)) errors.push(err("logoUrl", "Required string"));
  if (!isString(d.copyright)) errors.push(err("copyright", "Required string"));
  if (!Array.isArray(d.navLinks)) {
    errors.push(err("navLinks", "Must be an array"));
  } else {
    d.navLinks.forEach((item: unknown, i: number) => {
      if (!item || typeof item !== "object") {
        errors.push(err(`navLinks[${i}]`, "Must be an object"));
        return;
      }
      const nav = item as Record<string, unknown>;
      if (!isMultiLangString(nav.title)) errors.push(err(`navLinks[${i}].title`, "Must be {en, tr}"));
      if (!isString(nav.link)) errors.push(err(`navLinks[${i}].link`, "Required string"));
    });
  }
  return errors;
}

export function validateProjects(data: unknown): ValidationError[] {
  if (!Array.isArray(data)) return [err("root", "Must be an array")];
  const errors: ValidationError[] = [];
  data.forEach((p: unknown, i: number) => {
    if (!p || typeof p !== "object") { errors.push(err(`[${i}]`, "Must be an object")); return; }
    const proj = p as Record<string, unknown>;
    if (!isString(proj.id)) errors.push(err(`[${i}].id`, "Required string"));
    if (!isString(proj.slug)) errors.push(err(`[${i}].slug`, "Required string"));
    if (!proj.title || typeof proj.title !== "object") errors.push(err(`[${i}].title`, "Must be {en, tr}"));
    if (!proj.description || typeof proj.description !== "object") errors.push(err(`[${i}].description`, "Must be {en, tr}"));
    if (!isString(proj.image)) errors.push(err(`[${i}].image`, "Required string"));
  });
  return errors;
}

export function validateLinks(data: unknown): ValidationError[] {
  if (!Array.isArray(data)) return [err("root", "Must be an array")];
  const errors: ValidationError[] = [];
  data.forEach((l: unknown, i: number) => {
    if (!l || typeof l !== "object") { errors.push(err(`[${i}]`, "Must be an object")); return; }
    const link = l as Record<string, unknown>;
    if (!isString(link.id)) errors.push(err(`[${i}].id`, "Required string"));
    if (!isString(link.name) || !link.name.trim()) errors.push(err(`[${i}].name`, "Required string"));
    if (!isString(link.icon) || !isAvailableIcon(link.icon)) errors.push(err(`[${i}].icon`, "Must be a valid icon"));
    if (!isString(link.url) || !link.url.trim()) errors.push(err(`[${i}].url`, "Required string"));
  });
  return errors;
}

export function validateSocials(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data || typeof data !== "object") return [err("root", "Must be an object")];
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.navbar)) errors.push(err("navbar", "Must be an array"));
  if (!Array.isArray(d.footer)) errors.push(err("footer", "Must be an array"));
  return errors;
}

export function validateAbout(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data || typeof data !== "object") return [err("root", "Must be an object")];
  const d = data as Record<string, unknown>;
  if (!isMultiLangString(d.badge)) errors.push(err("badge", "Must be {en, tr}"));
  if (!isMultiLangString(d.heroTitle)) errors.push(err("heroTitle", "Must be {en, tr}"));
  if (!isMultiLangString(d.heroHighlight)) errors.push(err("heroHighlight", "Must be {en, tr}"));
  if (!isMultiLangString(d.description)) errors.push(err("description", "Must be {en, tr}"));
  if (!isMultiLangString(d.ctaText)) errors.push(err("ctaText", "Must be {en, tr}"));
  if (!isString(d.ctaLink)) errors.push(err("ctaLink", "Required string"));
  if (!isString(d.heroImage)) errors.push(err("heroImage", "Required string"));
  return errors;
}
