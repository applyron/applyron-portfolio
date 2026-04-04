import { isAvailableIcon } from "@/lib/icons";

const SKILL_CATEGORY_KEYS = [
  "core",
  "frontend",
  "backend",
  "fullstack",
  "other",
] as const;

const CONTACT_MESSAGE_STATUSES = ["new", "read", "archived"] as const;

export type ValidationError = { field: string; message: string };

function err(field: string, message: string): ValidationError {
  return { field, message };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function isMultiLangString(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return isString(entry.en) && isString(entry.tr);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isEmail(value: unknown): value is string {
  return isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  return (
    /^[+\d\s()-]+$/.test(trimmed) &&
    digits.length >= 10 &&
    digits.length <= 15
  );
}

function isStoredContactPoint(value: unknown): value is string {
  return isPhone(value) || isEmail(value);
}

function isSiteLink(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  if (value.startsWith("#")) {
    return value.length > 1;
  }

  return value.startsWith("/");
}

function isSocialIcon(value: unknown, allowEmpty: boolean): boolean {
  if (value === null) {
    return allowEmpty;
  }

  return typeof value === "string" && isAvailableIcon(value);
}

export function validateSiteData(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return [err("root", "Must be an object")];
  }

  const site = data as Record<string, unknown>;

  if (!isNonEmptyString(site.name)) {
    errors.push(err("name", "Required string"));
  }

  if (!isNonEmptyString(site.title)) {
    errors.push(err("title", "Required string"));
  }

  if (!isNonEmptyString(site.description)) {
    errors.push(err("description", "Required string"));
  }

  if (!isNonEmptyString(site.logoUrl)) {
    errors.push(err("logoUrl", "Required string"));
  }

  if (!isNonEmptyString(site.copyright)) {
    errors.push(err("copyright", "Required string"));
  }

  if (!Array.isArray(site.navLinks)) {
    errors.push(err("navLinks", "Must be an array"));
    return errors;
  }

  site.navLinks.forEach((item: unknown, index: number) => {
    if (!item || typeof item !== "object") {
      errors.push(err(`navLinks[${index}]`, "Must be an object"));
      return;
    }

    const navItem = item as Record<string, unknown>;

    if (!isMultiLangString(navItem.title)) {
      errors.push(err(`navLinks[${index}].title`, "Must be {en, tr}"));
    }

    if (!isSiteLink(navItem.link)) {
      errors.push(
        err(`navLinks[${index}].link`, "Must start with # or /"),
      );
    }
  });

  return errors;
}

export function validateProjects(data: unknown): ValidationError[] {
  if (!Array.isArray(data)) {
    return [err("root", "Must be an array")];
  }

  const errors: ValidationError[] = [];

  data.forEach((item: unknown, index: number) => {
    if (!item || typeof item !== "object") {
      errors.push(err(`[${index}]`, "Must be an object"));
      return;
    }

    const project = item as Record<string, unknown>;

    if (!isNonEmptyString(project.id)) {
      errors.push(err(`[${index}].id`, "Required string"));
    }

    if (!isNonEmptyString(project.slug)) {
      errors.push(err(`[${index}].slug`, "Required string"));
    }

    if (!isMultiLangString(project.title)) {
      errors.push(err(`[${index}].title`, "Must be {en, tr}"));
    }

    if (!isMultiLangString(project.description)) {
      errors.push(err(`[${index}].description`, "Must be {en, tr}"));
    }

    if (!isMultiLangString(project.longDescription)) {
      errors.push(err(`[${index}].longDescription`, "Must be {en, tr}"));
    }

    if (!isNonEmptyString(project.image)) {
      errors.push(err(`[${index}].image`, "Required string"));
    }

    if (!isStringArray(project.technologies)) {
      errors.push(err(`[${index}].technologies`, "Must be a string array"));
    }

    if (!isString(project.githubUrl)) {
      errors.push(err(`[${index}].githubUrl`, "Required string"));
    }

    if (!isString(project.demoUrl)) {
      errors.push(err(`[${index}].demoUrl`, "Required string"));
    }
  });

  return errors;
}

export function validateLinks(data: unknown): ValidationError[] {
  if (!Array.isArray(data)) {
    return [err("root", "Must be an array")];
  }

  const errors: ValidationError[] = [];

  data.forEach((item: unknown, index: number) => {
    if (!item || typeof item !== "object") {
      errors.push(err(`[${index}]`, "Must be an object"));
      return;
    }

    const link = item as Record<string, unknown>;

    if (!isNonEmptyString(link.id)) {
      errors.push(err(`[${index}].id`, "Required string"));
    }

    if (!isNonEmptyString(link.name)) {
      errors.push(err(`[${index}].name`, "Required string"));
    }

    if (!isString(link.icon) || !isAvailableIcon(link.icon)) {
      errors.push(err(`[${index}].icon`, "Must be a valid icon"));
    }

    if (!isNonEmptyString(link.url)) {
      errors.push(err(`[${index}].url`, "Required string"));
    }
  });

  return errors;
}

export function validateSocials(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return [err("root", "Must be an object")];
  }

  const socials = data as Record<string, unknown>;

  if (!Array.isArray(socials.navbar)) {
    errors.push(err("navbar", "Must be an array"));
  } else {
    socials.navbar.forEach((item: unknown, index: number) => {
      if (!item || typeof item !== "object") {
        errors.push(err(`navbar[${index}]`, "Must be an object"));
        return;
      }

      const socialItem = item as Record<string, unknown>;

      if (!isNonEmptyString(socialItem.id)) {
        errors.push(err(`navbar[${index}].id`, "Required string"));
      }

      if (!isNonEmptyString(socialItem.name)) {
        errors.push(err(`navbar[${index}].name`, "Required string"));
      }

      if (!isSocialIcon(socialItem.icon, false)) {
        errors.push(err(`navbar[${index}].icon`, "Must be a valid icon"));
      }

      if (!isNonEmptyString(socialItem.link)) {
        errors.push(err(`navbar[${index}].link`, "Required string"));
      }
    });
  }

  if (!Array.isArray(socials.footer)) {
    errors.push(err("footer", "Must be an array"));
    return errors;
  }

  socials.footer.forEach((item: unknown, index: number) => {
    if (!item || typeof item !== "object") {
      errors.push(err(`footer[${index}]`, "Must be an object"));
      return;
    }

    const group = item as Record<string, unknown>;

    if (!isNonEmptyString(group.id)) {
      errors.push(err(`footer[${index}].id`, "Required string"));
    }

    if (!isNonEmptyString(group.title)) {
      errors.push(err(`footer[${index}].title`, "Required string"));
    }

    if (!Array.isArray(group.items)) {
      errors.push(err(`footer[${index}].items`, "Must be an array"));
      return;
    }

    group.items.forEach((footerItem: unknown, itemIndex: number) => {
      if (!footerItem || typeof footerItem !== "object") {
        errors.push(
          err(`footer[${index}].items[${itemIndex}]`, "Must be an object"),
        );
        return;
      }

      const socialItem = footerItem as Record<string, unknown>;

      if (!isNonEmptyString(socialItem.id)) {
        errors.push(
          err(`footer[${index}].items[${itemIndex}].id`, "Required string"),
        );
      }

      if (!isNonEmptyString(socialItem.name)) {
        errors.push(
          err(`footer[${index}].items[${itemIndex}].name`, "Required string"),
        );
      }

      if (!isSocialIcon(socialItem.icon, true)) {
        errors.push(
          err(
            `footer[${index}].items[${itemIndex}].icon`,
            "Must be a valid icon or null",
          ),
        );
      }

      if (!isNonEmptyString(socialItem.link)) {
        errors.push(
          err(`footer[${index}].items[${itemIndex}].link`, "Required string"),
        );
      }
    });
  });

  return errors;
}

export function validateAbout(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return [err("root", "Must be an object")];
  }

  const about = data as Record<string, unknown>;

  if (!isMultiLangString(about.badge)) {
    errors.push(err("badge", "Must be {en, tr}"));
  }

  if (!isMultiLangString(about.heroTitle)) {
    errors.push(err("heroTitle", "Must be {en, tr}"));
  }

  if (!isMultiLangString(about.heroHighlight)) {
    errors.push(err("heroHighlight", "Must be {en, tr}"));
  }

  if (!isMultiLangString(about.description)) {
    errors.push(err("description", "Must be {en, tr}"));
  }

  if (!isMultiLangString(about.ctaText)) {
    errors.push(err("ctaText", "Must be {en, tr}"));
  }

  if (!isNonEmptyString(about.ctaLink)) {
    errors.push(err("ctaLink", "Required string"));
  }

  if (!isNonEmptyString(about.heroImage)) {
    errors.push(err("heroImage", "Required string"));
  }

  return errors;
}

export function validateSkills(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return [err("root", "Must be an object")];
  }

  const skills = data as Record<string, unknown>;

  SKILL_CATEGORY_KEYS.forEach((category) => {
    const value = skills[category];

    if (!Array.isArray(value)) {
      errors.push(err(category, "Must be an array"));
      return;
    }

    value.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(err(`${category}[${index}]`, "Must be an object"));
        return;
      }

      const skill = item as Record<string, unknown>;

      if (!isNonEmptyString(skill.id)) {
        errors.push(err(`${category}[${index}].id`, "Required string"));
      }

      if (!isNonEmptyString(skill.name)) {
        errors.push(err(`${category}[${index}].name`, "Required string"));
      }

      if (!isNonEmptyString(skill.image)) {
        errors.push(err(`${category}[${index}].image`, "Required string"));
      }

      if (!isPositiveNumber(skill.width)) {
        errors.push(err(`${category}[${index}].width`, "Must be a positive number"));
      }

      if (!isPositiveNumber(skill.height)) {
        errors.push(err(`${category}[${index}].height`, "Must be a positive number"));
      }
    });
  });

  return errors;
}

export function validateContactSubmission(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return [err("root", "Must be an object")];
  }

  const submission = data as Record<string, unknown>;

  if (!isNonEmptyString(submission.name)) {
    errors.push(err("name", "Required string"));
  }

  if (!isPhone(submission.phone)) {
    errors.push(err("phone", "Must be a valid phone"));
  }

  if (!isNonEmptyString(submission.message)) {
    errors.push(err("message", "Required string"));
  }

  return errors;
}

export function validateMessages(data: unknown): ValidationError[] {
  if (!Array.isArray(data)) {
    return [err("root", "Must be an array")];
  }

  const errors: ValidationError[] = [];

  data.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push(err(`[${index}]`, "Must be an object"));
      return;
    }

    const message = item as Record<string, unknown>;

    if (!isNonEmptyString(message.id)) {
      errors.push(err(`[${index}].id`, "Required string"));
    }

    if (!isNonEmptyString(message.name)) {
      errors.push(err(`[${index}].name`, "Required string"));
    }

    if (!isStoredContactPoint(message.phone)) {
      errors.push(err(`[${index}].phone`, "Must be a valid phone"));
    }

    if (!isNonEmptyString(message.message)) {
      errors.push(err(`[${index}].message`, "Required string"));
    }

    if (!isNonEmptyString(message.createdAt)) {
      errors.push(err(`[${index}].createdAt`, "Required string"));
    }

    if (
      !isNonEmptyString(message.status) ||
      !CONTACT_MESSAGE_STATUSES.includes(
        message.status as (typeof CONTACT_MESSAGE_STATUSES)[number],
      )
    ) {
      errors.push(err(`[${index}].status`, "Must be a valid status"));
    }
  });

  return errors;
}
