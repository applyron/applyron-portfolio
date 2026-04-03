import { Footer } from "@/components/main/footer";
import { Navbar } from "@/components/main/navbar";
import type { PropsWithChildren } from "react";
import {
  getPublicLinks,
  getPublicSiteData,
  getPublicSocials,
} from "@/lib/public-data";

export default async function MainLayout({ children }: PropsWithChildren) {
  const [site, socials, links] = await Promise.all([
    getPublicSiteData(),
    getPublicSocials(),
    getPublicLinks(),
  ]);

  return (
    <>
      <Navbar
        socials={socials.navbar}
        externalLinks={links}
        siteName={site.name}
        logoUrl={site.logoUrl}
        navLinks={site.navLinks ?? []}
      />
      {children}
      <Footer />
    </>
  );
}
