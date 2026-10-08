import { describe, expect, it } from "vitest";
import { collarsModifierKey, collarsV2, parseCollarsV2Ratings } from "./catalogV2Collars";

describe("Collars V2 pilot", () => {
  it("keeps approved modifier groups and distinct keys", () => {
    expect(collarsV2.groups.map(group => group.id)).toEqual(["use", "form", "material", "features", "meaning"]);
    const keys = collarsV2.groups.flatMap(group => group.values.map(([id]) => collarsModifierKey(group.id, id)));
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("ignores invalid and unrelated saved preferences", () => {
    const key = collarsModifierKey("use", "play-scene");
    expect(parseCollarsV2Ratings(JSON.stringify({ [key]: "love", "collaring:use:play-scene": "love", "collars:material:metal": "bogus" }))).toEqual({ [key]: "love" });
    expect(parseCollarsV2Ratings("not json")).toEqual({});
  });
});
