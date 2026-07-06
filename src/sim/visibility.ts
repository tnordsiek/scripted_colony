// Sicht und Fog-of-War nach docs/03-technical/pathfinding-and-map-generation.md
// (Sichtzustands-Übergänge) und docs/03-technical/simulation-rules.md.
import { chebyshevDistance } from "./pathfinding";
import type { FieldCoord, GameState } from "./types";

// Sichtquellen: aktive Roboter sowie active+enabled Gebäude.
export function computeCurrentVisibleFields(state: GameState): Set<string> {
  const visible = new Set<string>();
  const sources: Array<{ coord: FieldCoord; range: number }> = [];

  for (const robot of state.robots) {
    if (robot.status === "active" || robot.status === "stasis") {
      // Stasis-Roboter existieren weiter auf der Karte; Sichtquelle ist laut
      // Doku "aktive Roboter" – Stasis zaehlt nicht als Sichtquelle.
      if (robot.status === "active") {
        sources.push({ coord: { x: robot.x, y: robot.y }, range: robot.sightRange });
      }
    }
  }

  for (const building of state.buildings) {
    if (building.status === "active" && building.isEnabled) {
      sources.push({
        coord: { x: building.x, y: building.y },
        range: building.sightRange,
      });
    }
  }

  for (const row of state.map) {
    for (const field of row) {
      for (const source of sources) {
        if (chebyshevDistance(field, source.coord) <= source.range) {
          visible.add(`${field.x},${field.y}`);
          break;
        }
      }
    }
  }

  return visible;
}

// Kanonische Übergangsregel: visible -> discovered -> unknown bleibt Gedächtnis.
export function updateVisibility(state: GameState): void {
  const currentVisible = computeCurrentVisibleFields(state);

  for (const row of state.map) {
    for (const field of row) {
      if (currentVisible.has(`${field.x},${field.y}`)) {
        field.visibility = "visible";
      } else if (field.visibility === "visible" || field.visibility === "discovered") {
        field.visibility = "discovered";
      } else {
        field.visibility = "unknown";
      }
    }
  }
}
