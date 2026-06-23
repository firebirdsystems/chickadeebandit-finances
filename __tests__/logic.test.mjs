import { describe, expect, it } from "vitest";
import {
  COLORS,
  MAX_CENTS,
  currentPeriodBounds,
  dollarsToCents,
  isValidDateString,
  normalizeColor,
} from "../src/logic.js";

describe("money conversion", () => {
  it("converts dollars to integer cents", () => {
    expect(dollarsToCents("24.99")).toBe(2499);
    expect(dollarsToCents("0.01")).toBe(1);
    expect(dollarsToCents("0", { allowZero: true })).toBe(0);
  });

  it("rejects blank, non-positive, unsafe, and excessive transaction amounts", () => {
    expect(dollarsToCents("")).toBeNull();
    expect(dollarsToCents("0")).toBeNull();
    expect(dollarsToCents("0.001")).toBeNull();
    expect(dollarsToCents("-1")).toBeNull();
    expect(dollarsToCents((MAX_CENTS / 100) + 1)).toBeNull();
  });
});

describe("budget periods", () => {
  it("returns UTC month boundaries", () => {
    expect(currentPeriodBounds("monthly", new Date("2026-06-23T18:00:00Z"))).toEqual({
      start: "2026-06-01",
      end: "2026-07-01",
    });
  });

  it("returns Monday-exclusive-Monday UTC week boundaries", () => {
    expect(currentPeriodBounds("weekly", new Date("2026-06-23T18:00:00Z"))).toEqual({
      start: "2026-06-22",
      end: "2026-06-29",
    });
  });
});

describe("stored value validation", () => {
  it("accepts only real ISO calendar dates", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2024-02-31")).toBe(false);
    expect(isValidDateString("2024-2-9")).toBe(false);
  });

  it("falls back to the default color", () => {
    expect(normalizeColor(COLORS[2])).toBe(COLORS[2]);
    expect(normalizeColor('red"><img src=x onerror=alert(1)>')).toBe(COLORS[0]);
  });
});
