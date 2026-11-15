import { moduleCopy } from "@levelup/utils";
import { ListChecks } from "lucide-react";
import type { Metadata } from "next";

import { ModulePreview } from "@/components/modules/module-preview";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  return <ModulePreview icon={ListChecks} {...moduleCopy.today} />;
}
