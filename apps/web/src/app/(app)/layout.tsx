import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { SIGN_IN_PATH } from "@/lib/auth/routes";
import { getViewer, isAuthEnabled } from "@/lib/viewer";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  // Server-side check behind the proxy's optimistic redirect (defence in depth).
  if (isAuthEnabled() && !viewer.isAuthenticated) redirect(SIGN_IN_PATH);
  return <AppShell viewer={viewer}>{children}</AppShell>;
}
