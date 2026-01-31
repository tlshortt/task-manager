import {
  DEFAULT_LOOKAHEAD_DAYS,
  getNextOccurrenceMs,
  getValidDayOfMonth,
  generateRecurrenceInstancesMs,
  isValidRecurrence,
  needsLookaheadExtensionMs,
} from "./recurrenceUtils";

describe("recurrenceUtils", () => {
  describe("isValidRecurrence", () => {
    it("rejects missing or invalid fields", () => {
      expect(isValidRecurrence({ frequency: "daily", interval: 0 })).toBe(false);
      expect(isValidRecurrence({ frequency: "weekly", interval: 1 })).toBe(false);
      expect(isValidRecurrence({ frequency: "monthly", interval: 1 })).toBe(false);
      expect(isValidRecurrence({ frequency: "monthly", interval: 1, dayOfMonth: 0 })).toBe(false);
      expect(isValidRecurrence({ frequency: "monthly", interval: 1, dayOfMonth: 32 })).toBe(false);
      expect(isValidRecurrence({ frequency: "daily", interval: 1, count: 0 })).toBe(false);
    });

    it("accepts valid patterns", () => {
      expect(isValidRecurrence({ frequency: "daily", interval: 1 })).toBe(true);
      expect(isValidRecurrence({ frequency: "weekly", interval: 1, daysOfWeek: [1] })).toBe(true);
      expect(isValidRecurrence({ frequency: "monthly", interval: 1, dayOfMonth: 15 })).toBe(true);
      expect(isValidRecurrence({ frequency: "yearly", interval: 2 })).toBe(true);
    });
  });

  describe("getValidDayOfMonth", () => {
    it("caps day at month end", () => {
      expect(getValidDayOfMonth(2026, 1, 31)).toBe(28);
      expect(getValidDayOfMonth(2024, 1, 31)).toBe(29);
      expect(getValidDayOfMonth(2026, 0, 31)).toBe(31);
    });
  });

  describe("getNextOccurrenceMs", () => {
    it("handles daily recurrence", () => {
      const start = Date.UTC(2026, 0, 1);
      const next = getNextOccurrenceMs({ frequency: "daily", interval: 2 }, start);
      expect(next).toBe(Date.UTC(2026, 0, 3));
    });

    it("handles weekly recurrence", () => {
      const start = Date.UTC(2026, 0, 1);
      const startDay = new Date(start).getUTCDay();
      const targetDay = (startDay + 1) % 7;
      const next = getNextOccurrenceMs(
        { frequency: "weekly", interval: 1, daysOfWeek: [targetDay] },
        start
      );
      expect(next).toBe(start + 24 * 60 * 60 * 1000);
    });

    it("handles monthly recurrence", () => {
      const start = Date.UTC(2026, 0, 1);
      const next = getNextOccurrenceMs(
        { frequency: "monthly", interval: 1, dayOfMonth: 15 },
        start
      );
      expect(next).toBe(Date.UTC(2026, 1, 15));
    });

    it("handles yearly recurrence", () => {
      const start = Date.UTC(2026, 0, 1);
      const next = getNextOccurrenceMs({ frequency: "yearly", interval: 1 }, start);
      expect(next).toBe(Date.UTC(2027, 0, 1));
    });

    it("returns null for invalid weekly/monthly patterns", () => {
      const start = Date.UTC(2026, 0, 1);
      expect(getNextOccurrenceMs({ frequency: "weekly", interval: 1 }, start)).toBeNull();
      expect(getNextOccurrenceMs({ frequency: "monthly", interval: 1 }, start)).toBeNull();
    });
  });

  describe("generateRecurrenceInstancesMs", () => {
    const parent = {
      id: "task-1" as import("convex/values").GenericId<"tasks">,
      title: "Parent",
      priority: "low" as const,
      recurrence: { frequency: "daily", interval: 1 },
    };

    it("returns empty for invalid patterns", () => {
      const instances = generateRecurrenceInstancesMs(
        {
          ...parent,
          recurrence: { frequency: "weekly", interval: 1 },
        },
        Date.UTC(2026, 0, 1)
      );
      expect(instances).toHaveLength(0);
    });

    it("honors count limit", () => {
      const instances = generateRecurrenceInstancesMs(
        {
          ...parent,
          recurrence: { frequency: "daily", interval: 1, count: 3 },
        },
        Date.UTC(2026, 0, 1),
        30
      );
      expect(instances).toHaveLength(3);
      expect(instances[0]?.instanceDateMs).toBe(Date.UTC(2026, 0, 1));
    });

    it("honors endDateMs", () => {
      const start = Date.UTC(2026, 0, 1);
      const endDateMs = Date.UTC(2026, 0, 3);
      const instances = generateRecurrenceInstancesMs(
        {
          ...parent,
          recurrence: { frequency: "daily", interval: 1, endDateMs },
        },
        start,
        30
      );
      expect(instances.at(-1)?.instanceDateMs).toBe(endDateMs);
      expect(instances).toHaveLength(3);
    });

    it("honors lookahead window", () => {
      const start = Date.UTC(2026, 0, 1);
      const instances = generateRecurrenceInstancesMs(
        {
          ...parent,
          recurrence: { frequency: "daily", interval: 1 },
        },
        start,
        2
      );
      expect(instances).toHaveLength(3);
    });
  });

  describe("needsLookaheadExtensionMs", () => {
    it("returns true when no instances", () => {
      const now = Date.UTC(2026, 0, 1);
      expect(needsLookaheadExtensionMs([], now, DEFAULT_LOOKAHEAD_DAYS)).toBe(true);
    });

    it("returns true when latest instance is within window", () => {
      const now = Date.UTC(2026, 0, 1);
      const instances = [{ instanceDateMs: now + 10 * 24 * 60 * 60 * 1000 }];
      expect(needsLookaheadExtensionMs(instances, now, 30)).toBe(true);
    });

    it("returns false when latest instance is beyond window", () => {
      const now = Date.UTC(2026, 0, 1);
      const instances = [{ instanceDateMs: now + 45 * 24 * 60 * 60 * 1000 }];
      expect(needsLookaheadExtensionMs(instances, now, 30)).toBe(false);
    });
  });
});
