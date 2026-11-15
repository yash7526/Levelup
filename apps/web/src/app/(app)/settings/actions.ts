"use server";

import { updateProfileDisplayName } from "@levelup/supabase";
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from "@levelup/utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { PREFERRED_NAME_COOKIE, PREFERRED_NAME_MAX_AGE_SECONDS } from "@/lib/preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PreferredNameState {
  status: "idle" | "saved" | "cleared" | "error";
  message?: string;
  /** Echo of the submitted value so the field keeps what the user typed on error. */
  value?: string;
}

type ParsedName = { ok: true; name: string | null } | { ok: false; state: PreferredNameState };

function parseName(formData: FormData): ParsedName {
  const raw = formData.get("preferredName");
  if (typeof raw !== "string") {
    return {
      ok: false,
      state: { status: "error", message: "Enter a name, or leave it blank to remove it." },
    };
  }
  if (Array.from(raw.trim()).length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      ok: false,
      state: {
        status: "error",
        message: `Keep it to ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
        value: raw,
      },
    };
  }
  return { ok: true, name: normalizeDisplayName(raw) };
}

function savedState(name: string | null): PreferredNameState {
  return name
    ? { status: "saved", message: `Saved. We'll call you ${name}.`, value: name }
    : { status: "cleared", message: "Name removed.", value: "" };
}

/** Signed-in users: saves the display name to their LevelUp account (`public.profiles`). */
export async function updateAccountName(
  _previous: PreferredNameState,
  formData: FormData,
): Promise<PreferredNameState> {
  const parsed = parseName(formData);
  if (!parsed.ok) return parsed.state;

  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getClaims() : { data: null };
  const userId = data?.claims.sub;
  if (!supabase || !userId) {
    return { status: "error", message: "Your session has expired. Please sign in again." };
  }

  try {
    await updateProfileDisplayName(supabase, userId, parsed.name);
  } catch (error) {
    console.error("[settings] Failed to update display name", error);
    return {
      status: "error",
      message: "We couldn't save your name. Please try again.",
      value: parsed.name ?? "",
    };
  }

  revalidatePath("/", "layout");
  return savedState(parsed.name);
}

/**
 * Without accounts (no Supabase configured): saves the greeting name in an HTTP-only
 * cookie on this device.
 */
export async function updatePreferredName(
  _previous: PreferredNameState,
  formData: FormData,
): Promise<PreferredNameState> {
  const parsed = parseName(formData);
  if (!parsed.ok) return parsed.state;

  const cookieStore = await cookies();
  if (!parsed.name) {
    cookieStore.delete(PREFERRED_NAME_COOKIE);
  } else {
    cookieStore.set(PREFERRED_NAME_COOKIE, parsed.name, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PREFERRED_NAME_MAX_AGE_SECONDS,
    });
  }
  revalidatePath("/", "layout");
  return savedState(parsed.name);
}
