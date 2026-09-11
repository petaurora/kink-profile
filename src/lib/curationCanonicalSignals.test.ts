import { describe, expect, it } from "vitest";
import { canonicalSignalDefinitions } from "../data/canonicalSignals";
import {
  canonicalizeCurationSignalRef,
  curationSignalOptions,
  curationSignalRefKey,
  getCurationSignalChannelOptions,
  validateCurationSignalRef,
} from "./curationCanonicalSignals";

describe("M16.2 canonical curation Signal adapter", () => {
  it("offers canonical Signal concepts instead of legacy directional IDs", () => {
    expect(curationSignalOptions).toHaveLength(canonicalSignalDefinitions.length);
    expect(curationSignalOptions.some((option) => option.value === "control")).toBe(
      true,
    );
    expect(
      curationSignalOptions.some(
        (option) => String(option.value) === "receiving_control",
      ),
    ).toBe(false);
    expect(
      curationSignalOptions.some(
        (option) => String(option.value) === "pain_receiving",
      ),
    ).toBe(false);
  });

  it("uses semantic channel labels defined by the canonical Signal", () => {
    expect(getCurationSignalChannelOptions("control")).toEqual([
      { value: "overall", label: "Overall" },
      { value: "receiving", label: "Being controlled / Receiving control" },
      { value: "giving", label: "Exercising control" },
    ]);
  });

  it("does not invent directional channels for Overall-only Signals", () => {
    expect(getCurationSignalChannelOptions("autonomy")).toEqual([
      { value: "overall", label: "Overall" },
    ]);
  });

  it("translates legacy directional IDs into canonical Signal + channel refs", () => {
    expect(canonicalizeCurationSignalRef("receiving_control", 0.75)).toEqual({
      signalId: "control",
      channel: "receiving",
      weight: 0.75,
    });

    expect(canonicalizeCurationSignalRef("pain_giving", 1)).toEqual({
      signalId: "pain",
      channel: "giving",
      weight: 1,
    });
  });

  it("preserves quiz-specific channel semantics during compatibility translation", () => {
    expect(
      canonicalizeCurationSignalRef("structure", 1, {
        quizQuestionId: "ds-001",
      }),
    ).toEqual({
      signalId: "structure",
      channel: "receiving",
      weight: 1,
    });
  });

  it("treats channel as part of Signal relationship identity", () => {
    expect(
      curationSignalRefKey({ signalId: "care", channel: "receiving" }),
    ).not.toBe(curationSignalRefKey({ signalId: "care", channel: "giving" }));
  });

  it("rejects unsupported authored channels", () => {
    expect(
      validateCurationSignalRef({
        signalId: "autonomy",
        channel: "receiving",
        weight: 1,
      }),
    ).toEqual([
      'Signal "autonomy" does not support the "receiving" channel.',
    ]);
  });
});
