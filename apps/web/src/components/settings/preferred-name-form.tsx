"use client";

import { DISPLAY_NAME_MAX_LENGTH } from "@levelup/utils";
import { CircleCheck } from "lucide-react";
import { useActionState } from "react";

import { type PreferredNameState, updatePreferredName } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

export function PreferredNameForm({ currentName }: { currentName: string | null }) {
  const [state, formAction, pending] = useActionState<PreferredNameState, FormData>(
    updatePreferredName,
    { status: "idle" },
  );

  const value = state.value ?? currentName ?? "";

  return (
    <form action={formAction} className="grid gap-4">
      <TextField
        // Re-mount with the saved value after each submission.
        key={`${state.status}:${value}`}
        id="preferred-name"
        name="preferredName"
        label="Preferred name"
        defaultValue={value}
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        autoComplete="given-name"
        placeholder="e.g. Sam"
        hint="Used in your dashboard greeting. Saved on this device until accounts are available. Leave blank to remove."
        error={state.status === "error" ? state.message : undefined}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          Save name
        </Button>
        <p role="status" className="flex items-center gap-1.5 text-body-sm text-success">
          {state.status === "saved" || state.status === "cleared" ? (
            <>
              <CircleCheck className="size-4" aria-hidden="true" />
              {state.message}
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
