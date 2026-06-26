import { AdminCoachesClient } from "@/components/koaches/admin/AdminCoachesClient";
import { fetchCoachesAction } from "@/lib/koaches/actions/coaches";
import { fetchCourtsAction } from "@/lib/koaches/actions/courts";

export default async function AdminCoachesPage() {
  const [coaches, courts] = await Promise.all([fetchCoachesAction(), fetchCourtsAction()]);

  return <AdminCoachesClient coaches={coaches} courts={courts} />;
}
