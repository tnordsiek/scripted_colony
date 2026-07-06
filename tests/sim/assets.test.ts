import { describe, expect, it } from "vitest";
import {
  MVP_FALLBACK_ASSET_REGISTRY,
  resolveAsset,
  resolveAssetDetailed,
} from "../../src/sim/assets";
import type { AssetKey, FallbackAssetRegistry } from "../../src/sim/types";

const ALL_KEYS: AssetKey[] = [
  "terrain.plains",
  "terrain.unknown",
  "fog.unknown",
  "fog.discovered",
  "resource.ironOre",
  "robot.starterRobot",
  "robot.ironMiner",
  "building.solarCollector",
  "building.robotFactory",
  "building.construction",
  "ui.selection",
  "ui.reservation",
  "ui.productionPaused",
  "ui.spawnBlocked",
];

describe("Assets und Fallbacks (docs/05-assets/asset-fallbacks.md)", () => {
  it("MVP-ASSET-001/MVP-V91-002: jeder MVP-AssetKey loest zu einem RenderAsset auf", () => {
    for (const key of ALL_KEYS) {
      const asset = resolveAsset(key);
      expect(asset.key).toBe(key);
      expect(asset.fallback).toBe(true);
    }
  });

  it("MVP-ASSET-002/MVP-V91-004: fehlendes finales Asset nutzt Fallback", () => {
    const result = resolveAssetDetailed("terrain.plains");
    expect(result.type).toBe("fallback");
  });

  it("MVP-V91-004: finales Asset hat Vorrang", () => {
    const result = resolveAssetDetailed("terrain.plains", {
      "terrain.plains": {
        key: "terrain.plains",
        kind: "image",
        source: "assets/tiles/plains.png",
        fallback: false,
      },
    });
    expect(result.type).toBe("final");
  });

  it("MVP-ASSET-003/MVP-V91-003: fehlender Fallback -> missingFallback bzw. Fehler", () => {
    const brokenRegistry = { ...MVP_FALLBACK_ASSET_REGISTRY } as Record<string, unknown>;
    delete brokenRegistry["ui.spawnBlocked"];
    const result = resolveAssetDetailed(
      "ui.spawnBlocked",
      {},
      brokenRegistry as unknown as FallbackAssetRegistry,
    );
    expect(result.type).toBe("missingFallback");
    if (result.type === "missingFallback") {
      expect(result.diagnostic.code).toBe("debug.asset.missingFallback");
    }
    expect(() =>
      resolveAsset("ui.spawnBlocked", {}, brokenRegistry as unknown as FallbackAssetRegistry),
    ).toThrow();
  });

  it("MVP-ASSET-004/005/007: Roboter, Gebaeude und Baustelle sind unterscheidbar", () => {
    expect(resolveAsset("robot.starterRobot").source).not.toBe(
      resolveAsset("robot.ironMiner").source,
    );
    expect(resolveAsset("building.solarCollector").source).not.toBe(
      resolveAsset("building.robotFactory").source,
    );
    expect(resolveAsset("building.construction").source).not.toBe(
      resolveAsset("building.solarCollector").source,
    );
  });

  it("MVP-ASSET-008: spawnBlocked hat UI-Status-Fallback", () => {
    const asset = resolveAsset("ui.spawnBlocked");
    expect(asset.kind).toBe("textBadge");
    expect(asset.label).toBeTruthy();
  });
});
