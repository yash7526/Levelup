import { redirect } from "next/navigation";

/**
 * The web app currently opens on the dashboard. A marketing/landing page or an
 * auth gate can replace this redirect in a later milestone.
 */
export default function RootPage() {
  redirect("/dashboard");
}
