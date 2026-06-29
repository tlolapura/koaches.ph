import type { Metadata } from "next";
import { InternalProposalToJaysteelPage } from "@/components/koaches/internal/InternalProposalToJaysteelPage";

export const metadata: Metadata = {
  title: "A personal letter for Daks",
  description: "Private founder letter.",
  robots: { index: false, follow: false },
};

export default function ProposalToJaysteelPage() {
  return <InternalProposalToJaysteelPage />;
}
