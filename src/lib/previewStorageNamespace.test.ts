import { describe, expect, it } from "vitest";
import {
  previewStorageKey,
  previewStoragePrefix,
} from "./previewStorageNamespace";

describe("preview storage namespace", () => {
  it("preserves production keys when no PR preview is active", () => {
    expect(previewStoragePrefix(undefined)).toBe("");
    expect(previewStorageKey("pet-profile-v2", undefined)).toBe(
      "pet-profile-v2",
    );
  });

  it("isolates app-owned storage keys by PR number", () => {
    expect(previewStorageKey("pet-profile-v2", "179")).toBe(
      "kink-profile:preview:pr-179:pet-profile-v2",
    );
    expect(
      previewStorageKey("kink-profile:developer-tools-enabled", "179"),
    ).toBe(
      "kink-profile:preview:pr-179:kink-profile:developer-tools-enabled",
    );
  });

  it("does not rewrite unrelated origin storage", () => {
    expect(previewStorageKey("another-app:key", "179")).toBe(
      "another-app:key",
    );
  });
});
