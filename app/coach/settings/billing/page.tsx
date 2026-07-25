import { redirect } from "next/navigation";

/** Old settings path — keep for bookmarks and emails. */
export default function SettingsBillingRedirect() {
  redirect("/coach/billing");
}
