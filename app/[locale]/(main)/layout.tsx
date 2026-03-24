import { Footer } from "@/components/main/footer";
import { Navbar } from "@/components/main/navbar";
import { getSiteData, getSocials, getLinks } from "@/lib/data";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: PropsWithChildren) {
  const site = getSiteData();
  const socials = getSocials();
  const links = getLinks();

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
      <Footer
        footerGroups={socials.footer}
        copyright={site.copyright}
      />
    </>
  );
}
