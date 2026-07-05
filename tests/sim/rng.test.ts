import { describe, expect, it } from "vitest";
import { createSeededRng, fnv1a32Utf8, makeRngInput } from "../../src/sim/rng";

describe("Seeded RNG (docs/03-technical/seeded-rng.md)", () => {
  it("MVP-V97-001: makeRngInput baut den kanonischen Eingabestring", () => {
    expect(makeRngInput(["mvp-default", "map", 0])).toBe("11:mvp-default|3:map|1:0");
    expect(
      makeRngInput(["mvp-default", "tie", 37, "scoutTarget", "robot.starter.001"]),
    ).toBe("11:mvp-default|3:tie|2:37|11:scoutTarget|17:robot.starter.001");
  });

  it("MVP-V97-002: fnv1a32Utf8 trifft den Referenzwert", () => {
    expect(fnv1a32Utf8("mvp-default")).toBe(2236944682);
    expect(fnv1a32Utf8("11:mvp-default|3:map|1:0")).toBe(2914558808);
  });

  it("MVP-V97-003: createSeededRng liefert die fortlaufende Referenzsequenz", () => {
    const rng = createSeededRng("mvp-default");
    expect(rng.nextUint32()).toBe(2072433787);
    expect(rng.nextUint32()).toBe(2977076701);
    expect(rng.nextUint32()).toBe(185255773);
  });

  it("Referenz-Floats aus frischem RNG-Objekt", () => {
    const rng = createSeededRng("mvp-default");
    expect(rng.nextFloat()).toBeCloseTo(0.4825260926, 9);
    expect(rng.nextFloat()).toBeCloseTo(0.6931546845, 9);
    expect(rng.nextFloat()).toBeCloseTo(0.0431332209, 9);
  });

  it("Referenzsequenz fuer den Map-Kontext-Seed", () => {
    const rng = createSeededRng(makeRngInput(["mvp-default", "map", 0]));
    expect(rng.nextUint32()).toBe(2543255916);
    expect(rng.nextUint32()).toBe(2482908342);
    expect(rng.nextUint32()).toBe(4149768718);
  });
});
