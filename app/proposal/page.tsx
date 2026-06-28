import type { Metadata } from "next";
import { InternalProposalPage } from "@/components/koaches/internal/InternalProposalPage";

export const metadata: Metadata = {
  title: "A personal letter",
  description: "Private founder letter.",
  robots: { index: false, follow: false },
};

export default function ProposalPage() {
  return <InternalProposalPage />;
}
