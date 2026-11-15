import { moduleCopy } from "@levelup/utils";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { ModulePreview } from "@/components/modules/module-preview";

export const metadata: Metadata = { title: "AI Coach" };

export default function CoachPage() {
  return <ModulePreview icon={Sparkles} {...moduleCopy.coach} />;
}
