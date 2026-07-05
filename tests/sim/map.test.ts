import { describe, expect, it } from "vitest";
import { MVP_MAP_CONFIG } from "../../src/sim/constants";
import {
  createFallbackMvpMap,
  generateMvpMap,
  getOreFieldCoords,
  validateMvpMap,
} from "../../src/sim/map";
import { fnv1a32Utf8 } from "../../src/sim/rng";
import type { FieldCoord } from "../../src/sim/types";

// Kanonische Referenz aus docs/03-technical/pathfinding-and-map-generation.md
const MVP_DEFAULT_IRON_ORE_FIELDS: FieldCoord[] = [
  { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
  { x: 9, y: 3 },
  { x: 8, y: 4 }, { x: 9, y: 4 },
  { x: 8, y: 5 }, { x: 9, y: 5 },
  { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 },
  { x: 0, y: 7 }, { x: 1, y: 7 },
  { x: 7, y: 8 },
];

function coordinateSignature(coords: FieldCoord[]): number {
  return fnv1a32Utf8(coords.map((c) => `${c.x},${c.y}`).join("|"));
}

describe("MVP-Map-Generator (docs/03-technical/pathfinding-and-map-generation.md)", () => {
  const map = generateMvpMap("mvp-default");

  it("MVP-V98-001: mvp-default akzeptiert attempt 0 und nutzt nicht die Fallback-Karte", () => {
    const fallbackCoords = getOreFieldCoords(createFallbackMvpMap());
    const generatedCoords = getOreFieldCoords(map);
    expect(generatedCoords).not.toEqual(fallbackCoords);
    expect(validateMvpMap(map, MVP_MAP_CONFIG)).toBe(true);
  });

  it("MVP-V98-002: Iron-Ore-Koordinaten entsprechen exakt MVP_DEFAULT_IRON_ORE_FIELDS", () => {
    expect(getOreFieldCoords(map)).toEqual(MVP_DEFAULT_IRON_ORE_FIELDS);
  });

  it("MVP-V98-003: Koordinaten-Signatur ist 40375871", () => {
    expect(coordinateSignature(getOreFieldCoords(map))).toBe(40375871);
    // Kontrolle: Referenzliste selbst ergibt dieselbe Signatur.
    expect(coordinateSignature(MVP_DEFAULT_IRON_ORE_FIELDS)).toBe(40375871);
  });

  it("MVP-V98-004: 25 initial sichtbare Felder, 0 initial sichtbare Iron-Ore-Felder", () => {
    let visibleCount = 0;
    let visibleOreCount = 0;
    for (const row of map) {
      for (const field of row) {
        if (field.visibility === "visible") {
          visibleCount += 1;
          if (field.resource) {
            visibleOreCount += 1;
          }
        }
      }
    }
    expect(visibleCount).toBe(25);
    expect(visibleOreCount).toBe(0);
  });

  it("Grid-Signatur ist 317699538", () => {
    const gridRows: string[] = [];
    for (let y = 0; y < 10; y += 1) {
      let rowString = "";
      for (let x = 0; x < 10; x += 1) {
        if (map[y][x].resource) {
          rowString += "O";
        } else if (x === 5 && y === 5) {
          rowString += "S";
        } else {
          rowString += ".";
        }
      }
      gridRows.push(rowString);
    }
    expect(fnv1a32Utf8(gridRows.join("\n"))).toBe(317699538);
  });

  it("gleicher Seed erzeugt gleiche Karte; anderer Seed ist valide", () => {
    const again = generateMvpMap("mvp-default");
    expect(getOreFieldCoords(again)).toEqual(getOreFieldCoords(map));

    const other = generateMvpMap("anderer-seed");
    expect(validateMvpMap(other, { ...MVP_MAP_CONFIG, seed: "anderer-seed" })).toBe(true);
  });

  it("MVP-MAP-001/002/005/006/007: Karte 10x10, map[y][x], Startfeld plains ohne Ressource/Gebaeude", () => {
    expect(map).toHaveLength(10);
    for (const row of map) {
      expect(row).toHaveLength(10);
    }
    const startField = map[5][5];
    expect(startField.x).toBe(5);
    expect(startField.y).toBe(5);
    expect(startField.terrainType).toBe("plains");
    expect(startField.resource).toBeUndefined();
    expect(startField.buildingId).toBeUndefined();
  });

  it("Fallback-Karte ist valide und enthaelt 20 Ore-Felder", () => {
    const fallback = createFallbackMvpMap();
    expect(validateMvpMap(fallback, MVP_MAP_CONFIG)).toBe(true);
  });

  it("jedes Iron-Ore-Feld enthaelt 20 Iron Ore mit directMining", () => {
    for (const coord of getOreFieldCoords(map)) {
      const field = map[coord.y][coord.x];
      expect(field.resource?.amount).toBe(20);
      expect(field.resource?.extractionMethod).toBe("directMining");
    }
  });
});
