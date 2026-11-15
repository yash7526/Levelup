import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getViewer } from "@/lib/viewer";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  return <AppShell viewer={viewer}>{children}</AppShell>;
}
