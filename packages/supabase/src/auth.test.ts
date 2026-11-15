import { describe, expect, it } from "vitest";

import {
  describeAuthError,
  isExistingAccountSignUp,
  normalizeEmail,
  normalizeOtp,
  validateEmail,
  validateOtp,
  validatePassword,
} from "./auth";

describe("email", () => {
  it("normalises case and whitespace", () => {
    expect(normalizeEmail("  Sam@Example.COM ")).toBe("sam@example.com");
  });

  it("validates format", () => {
    expect(validateEmail("")).toMatch(/enter your email/i);
    expect(validateEmail("sam@")).toMatch(/valid email/i);
    expect(validateEmail("sam@example")).toMatch(/valid email/i);
    expect(validateEmail(" sam@example.com ")).toBeUndefined();
  });
});

describe("password", () => {
  it("requires 8–72 characters", () => {
    expect(validatePassword("")).toMatch(/enter a password/i);
    expect(validatePassword("short")).toMatch(/at least 8/);
    expect(validatePassword("long enough")).toBeUndefined();
    expect(validatePassword("x".repeat(73))).toMatch(/at most 72/);
  });

  it("measures the 72 limit in bytes, as bcrypt does", () => {
    // 25 × 3-byte characters = 75 bytes.
    expect(validatePassword("€".repeat(25))).toMatch(/at most 72/);
  });
});

describe("one-time code", () => {
  it("accepts 6–10 digits and ignores spaces and dashes", () => {
    expect(normalizeOtp("123 456")).toBe("123456");
    expect(validateOtp("123-456")).toBeUndefined();
    expect(validateOtp("12345678")).toBeUndefined();
    expect(validateOtp("12345")).toMatch(/6-digit/);
    expect(validateOtp("12ab56")).toMatch(/6-digit/);
    expect(validateOtp("")).toMatch(/enter the code/i);
  });
});

describe("describeAuthError", () => {
  it("maps known Supabase error codes to friendly copy", () => {
    expect(describeAuthError({ code: "invalid_credentials" })).toMatch(/don't match/);
    expect(describeAuthError({ code: "otp_expired" })).toMatch(/expired/);
    expect(describeAuthError({ code: "over_email_send_rate_limit" })).toMatch(/wait/);
  });

  it("recognises rate limits and network failures", () => {
    expect(describeAuthError({ status: 429 })).toMatch(/wait a minute/);
    expect(describeAuthError({ message: "TypeError: fetch failed" })).toMatch(/connection/);
  });

  it("never leaks raw messages", () => {
    expect(describeAuthError({ message: "Database error saving new user" })).toBe(
      "Something went wrong. Please try again.",
    );
    expect(describeAuthError(null)).toBe("Something went wrong. Please try again.");
  });
});

describe("isExistingAccountSignUp", () => {
  it("detects Supabase's obfuscated response for an already-registered email", () => {
    expect(isExistingAccountSignUp({ identities: [] })).toBe(true);
    expect(isExistingAccountSignUp({ identities: [{ provider: "email" }] })).toBe(false);
    expect(isExistingAccountSignUp(null)).toBe(false);
  });
});
