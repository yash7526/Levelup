import { moduleCopy } from "@levelup/utils";
import { Target } from "lucide-react";
import type { Metadata } from "next";

import { ModulePreview } from "@/components/modules/module-preview";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return <ModulePreview icon={Target} {...moduleCopy.goals} />;
}
