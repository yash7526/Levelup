import { moduleCopy } from "@levelup/utils";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";

import { ModulePreview } from "@/components/modules/module-preview";

export const metadata: Metadata = { title: "Learning" };

export default function LearningPage() {
  return <ModulePreview icon={GraduationCap} {...moduleCopy.learning} />;
}
