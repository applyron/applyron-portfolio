import { cache } from "react";

import {
  getAbout,
  getSkills,
  getLinks,
  getProjects,
  getSiteData,
  getSocials,
} from "@/lib/data";

export const getPublicAbout = cache(getAbout);
export const getPublicSkills = cache(getSkills);
export const getPublicLinks = cache(getLinks);
export const getPublicProjects = cache(getProjects);
export const getPublicSiteData = cache(getSiteData);
export const getPublicSocials = cache(getSocials);
