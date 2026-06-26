import { SessionDetailPageClient } from "@/components/koaches/coach/SessionDetailPageClient";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SessionDetailPageClient sessionId={id} />;
}
