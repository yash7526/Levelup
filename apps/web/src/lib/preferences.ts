/** Cookie holding the preferred name used before accounts exist. */
export const PREFERRED_NAME_COOKIE = "levelup-preferred-name";

export const PREFERRED_NAME_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Cookie holding the browser's IANA time zone (e.g. "Asia/Kolkata"), so the server
 * knows the viewer's calendar day. Kept current by <TimeZoneSync />.
 */
export const TIME_ZONE_COOKIE = "levelup-tz";
