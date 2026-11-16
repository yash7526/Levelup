"use client";

import { CloudOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

/** Shown when priorities and habits couldn't be loaded. Retrying re-renders the page. */
export function GrowthLoadError({ message }: { message: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Card>
      <EmptyState
        icon={CloudOff}
        title="Couldn't load your data"
        description={message}
        action={
          <Button loading={pending} onClick={() => startTransition(() => router.refresh())}>
            Try again
          </Button>
        }
      />
    </Card>
  );
}
