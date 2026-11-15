"use server";

import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from "@levelup/utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { PREFERRED_NAME_COOKIE, PREFERRED_NAME_MAX_AGE_SECONDS } from "@/lib/preferences";

export interface PreferredNameState {
  status: "idle" | "saved" | "cleared" | "error";
  message?: string;
  /** Echo of the submitted value so the field keeps what the user typed on error. */
  value?: string;
}

/**
 * Saves the name used in greetings to an HTTP-only cookie on this device.
 * When accounts arrive this moves to `public.profiles.display_name`.
 */
export async function updatePreferredName(
  _previous: PreferredNameState,
  formData: FormData,
): Promise<PreferredNameState> {
  const raw = formData.get("preferredName");
  if (typeof raw !== "string") {
    return { status: "error", message: "Enter a name, or leave it blank to remove it." };
  }

  if (Array.from(raw.trim()).length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      status: "error",
      message: `Keep it to ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
      value: raw,
    };
  }

  const name = normalizeDisplayName(raw);
  const cookieStore = await cookies();

  if (!name) {
    cookieStore.delete(PREFERRED_NAME_COOKIE);
    revalidatePath("/", "layout");
    return { status: "cleared", message: "Name removed.", value: "" };
  }

  cookieStore.set(PREFERRED_NAME_COOKIE, name, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PREFERRED_NAME_MAX_AGE_SECONDS,
  });
  revalidatePath("/", "layout");
  return { status: "saved", message: `Saved. We'll call you ${name}.`, value: name };
}
