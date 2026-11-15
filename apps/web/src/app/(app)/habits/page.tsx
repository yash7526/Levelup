import { moduleCopy } from "@levelup/utils";
import { Repeat } from "lucide-react";
import type { Metadata } from "next";

import { ModulePreview } from "@/components/modules/module-preview";

export const metadata: Metadata = { title: "Habits" };

export default function HabitsPage() {
  return <ModulePreview icon={Repeat} {...moduleCopy.habits} />;
}
