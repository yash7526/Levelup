"use client";

import { PRIORITY_TITLE_MAX_LENGTH } from "@levelup/utils";
import { Plus } from "lucide-react";
import { useActionState } from "react";

import { type AddPriorityState, addPriority } from "@/app/(app)/today/actions";
import { Button } from "@/components/ui/button";
import { Label, TextField } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { lifeAreaLabels } from "@/lib/locale";

const areaOptions = Object.entries(lifeAreaLabels);

/** Adds a priority to today. Works before JavaScript loads (plain form post). */
export function AddPriorityForm({ slotsLeft }: { slotsLeft: number }) {
  const [state, formAction, pending] = useActionState<AddPriorityState, FormData>(addPriority, {
    status: "idle",
  });

  return (
    <form
      // A new key after each success clears the fields.
      key={state.nonce ?? "new"}
      action={formAction}
      className="grid gap-3 border-t border-border pt-5"
    >
      <TextField
        id="priority-title"
        name="title"
        label="Add a priority"
        placeholder="What would make today a win?"
        maxLength={PRIORITY_TITLE_MAX_LENGTH}
        autoComplete="off"
        defaultValue={state.values?.title}
        hint={`${slotsLeft} of 3 slots left today.`}
        error={state.fieldErrors?.title}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-40 flex-1 gap-1.5 sm:w-52 sm:flex-none">
          <Label htmlFor="priority-area">Area (optional)</Label>
          <Select
            id="priority-area"
            name="area"
            defaultValue={state.values?.area ?? ""}
            invalid={Boolean(state.fieldErrors?.area)}
          >
            <option value="">No area</option>
            {areaOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" loading={pending}>
          {pending ? null : <Plus aria-hidden="true" />}
          Add priority
        </Button>
      </div>
      <p role="status" className="text-body-sm text-danger empty:hidden">
        {state.status === "error" ? state.error : null}
      </p>
    </form>
  );
}
