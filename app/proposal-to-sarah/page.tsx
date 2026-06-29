import type { Metadata } from "next";
import { InternalProposalToSarahPage } from "@/components/koaches/internal/InternalProposalToSarahPage";

export const metadata: Metadata = {
  title: "A personal letter for Sarah",
  description: "Private founder letter.",
  robots: { index: false, follow: false },
};

export default function ProposalToSarahPage() {
  return <InternalProposalToSarahPage />;
}
