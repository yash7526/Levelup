"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mt-6">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description="We couldn't load this page. Try again, and if the problem continues, head back to your dashboard."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={retry}>Try again</Button>
            <ButtonLink href="/dashboard" variant="outline">
              Back to dashboard
            </ButtonLink>
          </div>
        }
      />
    </Card>
  );
}
