import { redirect } from "next/navigation";

/** Legacy route — mobile More is a bottom sheet; desktop uses the sidebar. */
export default function MorePage() {
  redirect("/coach/dashboard");
}
