import { describe, expect, it } from "vitest";
import type { ProfileBackupV1 } from "./profileBackup";
import {
  buildUploadedProfileComparison,
  type ComparisonProfileSource,
} from "./profileComparisonUpload";

const updatedAt = "2026-09-09T00:00:00.000Z";

function source(
  displayName: string,
  state: "love" | "like" | "curious" | "hard_limit",
): ComparisonProfileSource {
  return {
    displayName,
    profile: {
      schemaVersion: 2,
      quizzes: {},
    },
    catalogProfile: {
      schemaVersion: 1,
      preferences: {
        "comparison-test-item": {
          overall: state,
          updatedAt,
        },
      },
      comparisons: [],
    },
  };
}

function backup(
  displayName: string,
  state: "love" | "like" | "curious" | "hard_limit",
): ProfileBackupV1 {
  return {
    format: "kink-profile",
    version: 1,
    exportedAt: "2026-09-09T00:10:00.000Z",
    profile: {
      settings: {
        schemaVersion: 1,
        displayName,
      },
      quizzes: {
        schemaVersion: 2,
        quizzes: {},
      },
      catalog: {
        schemaVersion: 1,
        preferences: {
          "comparison-test-item": {
            overall: state,
            updatedAt,
          },
        },
        comparisons: [],
      },
    },
  };
}

describe("buildUploadedProfileComparison", () => {
  it("compares a validated backup without importing or mutating either profile", () => {
    const current = source("Current", "love");
    const uploaded = backup("Taylor", "like");
    const currentBefore = JSON.stringify(current);
    const uploadedBefore = JSON.stringify(uploaded);

    const result = buildUploadedProfileComparison(current, uploaded);

    expect(result.displayName).toBe("Taylor");
    expect(result.exportedAt).toBe(uploaded.exportedAt);
    expect(
      result.comparison.catalogItems.find(
        (item) => item.catalogId === "comparison-test-item",
      )?.state,
    ).toBe("mutual_positive");
    expect(JSON.stringify(current)).toBe(currentBefore);
    expect(JSON.stringify(uploaded)).toBe(uploadedBefore);
  });

  it("keeps an uploaded exclusion authoritative for shared suggestions", () => {
    const result = buildUploadedProfileComparison(
      source("Current", "love"),
      backup("Other", "hard_limit"),
    );

    expect(
      result.comparison.catalogItems.find(
        (item) => item.catalogId === "comparison-test-item",
      )?.state,
    ).toBe("excluded");
  });

  it("preserves uploaded curiosity as a shared exploration state", () => {
    const result = buildUploadedProfileComparison(
      source("Current", "like"),
      backup("Other", "curious"),
    );

    expect(
      result.comparison.catalogItems.find(
        (item) => item.catalogId === "comparison-test-item",
      )?.state,
    ).toBe("one_positive_one_curious");
  });
});
