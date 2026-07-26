import type { Metadata } from "next";
import { InstagramPostsPage } from "@/components/koaches/internal/InstagramPostsPage";

export const metadata: Metadata = {
  title: "Instagram posts",
  description: "Internal PickleKoach Instagram brand assets.",
  robots: { index: false, follow: false },
};

export default function InstagramPostsRoute() {
  return <InstagramPostsPage />;
}
