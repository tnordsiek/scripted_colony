// BFS-Pfadfindung und Distanzen nach docs/03-technical/pathfinding-and-map-generation.md.
import type { Field, FieldCoord } from "./types";

export function manhattanDistance(a: FieldCoord, b: FieldCoord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function chebyshevDistance(a: FieldCoord, b: FieldCoord): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// Reihenfolge oben, unten, links, rechts; Aufrufer sortieren Kandidaten
// vor seeded Auswahl stabil nach y, dann x.
export function getOrthogonalNeighbors(coord: FieldCoord): FieldCoord[] {
  return [
    { x: coord.x, y: coord.y - 1 },
    { x: coord.x, y: coord.y + 1 },
    { x: coord.x - 1, y: coord.y },
    { x: coord.x + 1, y: coord.y },
  ];
}

export function isInsideMap(map: Field[][], coord: FieldCoord): boolean {
  return (
    coord.y >= 0 &&
    coord.y < map.length &&
    coord.x >= 0 &&
    coord.x < (map[0]?.length ?? 0)
  );
}

export type PassabilityCheck = (field: Field) => boolean;

// Feld-Begehbarkeit ohne Roboterbelegung: plains, kein Gebäude/Baustelle,
// keine aktive Ressource. Roboter werden in der Bewegungssimulation separat geprüft.
export function isFieldPassable(field: Field): boolean {
  if (field.terrainType !== "plains") {
    return false;
  }
  if (field.buildingId) {
    return false;
  }
  if (field.resource && field.resource.amount > 0) {
    return false;
  }
  return true;
}

// Kürzester Pfad per BFS. Das Zielfeld darf blockiert sein (z. B. Ore-Feld als
// Erreichbarkeitsziel); es zählt dann als letzter Schritt.
export function bfsPath(
  map: Field[][],
  from: FieldCoord,
  to: FieldCoord,
  isPassable: PassabilityCheck = isFieldPassable,
): FieldCoord[] | null {
  if (!isInsideMap(map, from) || !isInsideMap(map, to)) {
    return null;
  }
  if (from.x === to.x && from.y === to.y) {
    return [];
  }

  const width = map[0].length;
  const key = (c: FieldCoord) => c.y * width + c.x;
  const visited = new Set<number>([key(from)]);
  const parent = new Map<number, FieldCoord>();
  const queue: FieldCoord[] = [from];

  while (queue.length > 0) {
    const current = queue.shift() as FieldCoord;

    for (const neighbor of getOrthogonalNeighbors(current)) {
      if (!isInsideMap(map, neighbor)) {
        continue;
      }
      const neighborKey = key(neighbor);
      if (visited.has(neighborKey)) {
        continue;
      }

      const isTarget = neighbor.x === to.x && neighbor.y === to.y;
      const field = map[neighbor.y][neighbor.x];
      if (!isTarget && !isPassable(field)) {
        continue;
      }

      visited.add(neighborKey);
      parent.set(neighborKey, current);

      if (isTarget) {
        const path: FieldCoord[] = [neighbor];
        let stepKey = neighborKey;
        while (parent.has(stepKey)) {
          const prev = parent.get(stepKey) as FieldCoord;
          if (prev.x === from.x && prev.y === from.y) {
            break;
          }
          path.unshift(prev);
          stepKey = key(prev);
        }
        return path;
      }

      queue.push(neighbor);
    }
  }

  return null;
}

export function bfsDistance(
  map: Field[][],
  from: FieldCoord,
  to: FieldCoord,
  isPassable: PassabilityCheck = isFieldPassable,
): number | null {
  const path = bfsPath(map, from, to, isPassable);
  return path === null ? null : path.length;
}
