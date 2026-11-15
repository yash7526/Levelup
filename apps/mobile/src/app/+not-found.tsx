import { Compass } from "lucide-react-native";

import { Screen } from "@/components/layout/screen";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFoundScreen() {
  return (
    <Screen kind="stack">
      <Card>
        <EmptyState
          icon={Compass}
          title="This screen doesn't exist"
          description="The link may be broken, or the screen may have moved."
          action={<ButtonLink href="/" label="Back to dashboard" />}
        />
      </Card>
    </Screen>
  );
}
