import { notFound } from "next/navigation";
import { fetchProgressCardByIdAction } from "@/lib/koaches/actions/progress-cards";
import { ProgressCardView } from "@/components/koaches/ProgressCardView";

export const revalidate = 60;

export default async function ProgressCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await fetchProgressCardByIdAction(id);
  if (!card) notFound();
  return <ProgressCardView card={card} />;
}
