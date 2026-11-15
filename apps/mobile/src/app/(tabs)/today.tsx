import { ListChecks } from "lucide-react-native";

import { ModulePreview } from "@/components/module-preview";

export default function TodayScreen() {
  return <ModulePreview module="today" icon={ListChecks} kind="tab" />;
}
