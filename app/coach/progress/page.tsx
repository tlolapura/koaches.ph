import { redirect } from "next/navigation";

/** Progress cards live under Students — keep route for old links */
export default function ProgressRedirectPage() {
  redirect("/coach/students");
}
