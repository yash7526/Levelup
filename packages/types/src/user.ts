import type { Id, ISODateTimeString } from "./common";

/** Public profile stored in `public.profiles`. */
export interface UserProfile {
  id: Id;
  displayName: string | null;
  avatarUrl: string | null;
  /** IANA time zone, e.g. `Europe/London`. */
  timezone: string | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/** The person currently using the app, signed in or not. */
export interface Viewer {
  isAuthenticated: boolean;
  /** Account email when signed in, otherwise `null`. */
  email: string | null;
  /** Name used for greetings. `null` when the person has not told us. */
  displayName: string | null;
}
