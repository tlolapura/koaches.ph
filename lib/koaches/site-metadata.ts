import type { Metadata } from "next";
import { SITE_DOMAIN } from "@/lib/koaches/constants";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_DOMAIN}`;

export const SITE_NAME = "PickleKoach";

export const SITE_DESCRIPTION =
  "Find pickleball coaches in the Philippines, book sessions, track progress, and grow your game.";

export const FAVICON_BASE = "/favicon_io";

export function siteMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — Pickleball Coaching Platform`,
      template: `%s — ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    icons: {
      icon: [
        { url: `${FAVICON_BASE}/favicon.ico` },
        { url: `${FAVICON_BASE}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
        { url: `${FAVICON_BASE}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      ],
      apple: `${FAVICON_BASE}/apple-touch-icon.png`,
    },
    manifest: `${FAVICON_BASE}/site.webmanifest`,
    openGraph: {
      siteName: SITE_NAME,
      locale: "en_PH",
      type: "website",
      title: `${SITE_NAME} — Pickleball Coaching Platform`,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Pickleball Coaching Platform`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — Pickleball Coaching Platform`,
      description: SITE_DESCRIPTION,
    },
    appleWebApp: {
      capable: true,
      title: SITE_NAME,
      statusBarStyle: "default",
    },
  };
}
