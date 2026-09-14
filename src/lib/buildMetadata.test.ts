import { describe, expect, it } from "vitest";
import packageMetadata from "../../package.json";
import {
  APP_VERSION,
  DATA_SCHEMA_VERSION,
  LOCAL_BUILD_IDENTIFIER,
  resolveBuildIdentifier,
} from "./buildMetadata";
import { PROFILE_SCHEMA_VERSION } from "./profileStorage";

describe("build metadata", () => {
  it("uses canonical app and persisted-data version sources", () => {
    expect(APP_VERSION).toBe(packageMetadata.version);
    expect(DATA_SCHEMA_VERSION).toBe(PROFILE_SCHEMA_VERSION);
  });

  it("normalizes the injected build identifier with a local fallback", () => {
    expect(resolveBuildIdentifier("  abc123def456  ")).toBe("abc123def456");
    expect(resolveBuildIdentifier("")).toBe(LOCAL_BUILD_IDENTIFIER);
    expect(resolveBuildIdentifier(undefined)).toBe(LOCAL_BUILD_IDENTIFIER);
  });
});
