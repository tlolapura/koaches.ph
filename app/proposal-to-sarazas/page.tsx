import type { Metadata } from "next";
import { InternalProposalToSarazasPage } from "@/components/koaches/internal/InternalProposalToSarazasPage";

export const metadata: Metadata = {
  title: "A personal letter for Kim and Meds",
  description: "Private founder letter.",
  robots: { index: false, follow: false },
};

export default function ProposalToSarazasPage() {
  return <InternalProposalToSarazasPage />;
}
