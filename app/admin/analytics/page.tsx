import { fetchAdminAnalyticsAction } from "@/lib/koaches/actions/admin-analytics";
import { AdminAnalyticsPage } from "@/components/koaches/admin/AdminAnalyticsPage";

export default async function AdminAnalyticsRoute() {
  const data = await fetchAdminAnalyticsAction();
  return <AdminAnalyticsPage data={data} />;
}
