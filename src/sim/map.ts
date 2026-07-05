// MVP-Map-Generator nach docs/03-technical/pathfinding-and-map-generation.md.
// Die RNG-Aufrufreihenfolge ist verbindlich; die mvp-default-Referenzwerte
// (Selektions-Checkpoints, Koordinaten-Signatur 40375871) werden per Test abgenommen.
import {
  MVP_FALLBACK_IRON_ORE_FIELDS,
  MVP_IRON_ORE_PER_FIELD,
  MVP_MAP_CONFIG,
} from "./constants";
import {
  bfsDistance,
  chebyshevDistance,
  getOrthogonalNeighbors,
  isInsideMap,
} from "./pathfinding";
import { createSeededRng, makeRngInput, sortFieldCoords, type SeededRng } from "./rng";
import type { Field, FieldCoord, MapGenerationConfig } from "./types";

export function createPlainMap(width: number, height: number): Field[][] {
  const map: Field[][] = [];
  for (let y = 0; y < height; y += 1) {
    const row: Field[] = [];
    for (let x = 0; x < width; x += 1) {
      row.push({
        x,
        y,
        terrainType: "plains",
        visibility: "unknown",
      });
    }
    map.push(row);
  }
  return map;
}

export function isInInitialVisibleArea(
  coord: FieldCoord,
  start: FieldCoord,
  sightRange: number,
): boolean {
  return chebyshevDistance(coord, start) <= sightRange;
}

export function getInitialVisibleFields(
  start: FieldCoord,
  sightRange: number,
  width = MVP_MAP_CONFIG.width,
  height = MVP_MAP_CONFIG.height,
): FieldCoord[] {
  const fields: FieldCoord[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isInInitialVisibleArea({ x, y }, start, sightRange)) {
        fields.push({ x, y });
      }
    }
  }
  return fields;
}

function setIronOre(map: Field[][], coord: FieldCoord, amount: number): void {
  map[coord.y][coord.x].resource = {
    type: "ironOre",
    amount,
    extractionMethod: "directMining",
  };
}

function hasOre(map: Field[][], coord: FieldCoord): boolean {
  return map[coord.y][coord.x].resource !== undefined;
}

export function countOreFields(map: Field[][]): number {
  let count = 0;
  for (const row of map) {
    for (const field of row) {
      if (field.resource) {
        count += 1;
      }
    }
  }
  return count;
}

export function getOreFieldCoords(map: Field[][]): FieldCoord[] {
  const coords: FieldCoord[] = [];
  for (const row of map) {
    for (const field of row) {
      if (field.resource) {
        coords.push({ x: field.x, y: field.y });
      }
    }
  }
  return sortFieldCoords(coords);
}

type OreClusterRules = {
  start: FieldCoord;
  sightRange: number;
};

function validNeighborCandidates(
  map: Field[][],
  source: FieldCoord,
  rules: OreClusterRules,
): FieldCoord[] {
  const candidates = getOrthogonalNeighbors(source).filter(
    (coord) =>
      isInsideMap(map, coord) &&
      !isInInitialVisibleArea(coord, rules.start, rules.sightRange) &&
      !hasOre(map, coord),
  );
  return sortFieldCoords(candidates);
}

// Cluster-Wachstum: Quelle und Nachbar werden jeweils seeded aus stabil
// sortierten Kandidatenlisten gewählt (Referenz-Erzeugungsregeln).
export function placeOreCluster(
  map: Field[][],
  seedCoord: FieldCoord,
  targetSize: number,
  rng: SeededRng,
  rules: OreClusterRules,
): FieldCoord[] {
  const cluster: FieldCoord[] = [seedCoord];
  setIronOre(map, seedCoord, MVP_IRON_ORE_PER_FIELD);

  while (cluster.length < targetSize) {
    const sources = sortFieldCoords(
      cluster.filter(
        (coord) => validNeighborCandidates(map, coord, rules).length > 0,
      ),
    );

    if (sources.length === 0) {
      break;
    }

    const source = sources[rng.pickIndex(sources.length)];
    const candidates = validNeighborCandidates(map, source, rules);
    const next = candidates[rng.pickIndex(candidates.length)];

    setIronOre(map, next, MVP_IRON_ORE_PER_FIELD);
    cluster.push(next);
  }

  return cluster;
}

function applyInitialVisibility(
  map: Field[][],
  start: FieldCoord,
  sightRange: number,
): void {
  for (const row of map) {
    for (const field of row) {
      field.visibility = isInInitialVisibleArea(field, start, sightRange)
        ? "visible"
        : "unknown";
    }
  }
}

export function validateMvpMap(map: Field[][], config: MapGenerationConfig): boolean {
  if (map.length !== config.height) {
    return false;
  }
  if (map.some((row) => row.length !== config.width)) {
    return false;
  }

  const oreCoords: FieldCoord[] = [];
  for (const row of map) {
    for (const field of row) {
      if (field.terrainType !== "plains") {
        return false;
      }
      if (field.resource) {
        if (field.resource.type !== "ironOre") {
          return false;
        }
        if (field.resource.amount !== config.ironOrePerField) {
          return false;
        }
        if (field.resource.extractionMethod !== "directMining") {
          return false;
        }
        oreCoords.push({ x: field.x, y: field.y });
      }
    }
  }

  if (oreCoords.length !== config.ironOreFieldCount) {
    return false;
  }

  const start = config.startPosition;
  if (
    oreCoords.some((coord) =>
      isInInitialVisibleArea(coord, start, config.starterSightRange),
    )
  ) {
    return false;
  }

  const hasReachableOreInBand = oreCoords.some((coord) => {
    const distance = bfsDistance(map, start, coord);
    return (
      distance !== null &&
      distance >= config.requiredReachableIronOreMinDistance &&
      distance <= config.requiredReachableIronOreMaxDistance
    );
  });

  return hasReachableOreInBand;
}

export function createFallbackMvpMap(
  config: MapGenerationConfig = MVP_MAP_CONFIG,
): Field[][] {
  const map = createPlainMap(config.width, config.height);
  for (const coord of MVP_FALLBACK_IRON_ORE_FIELDS) {
    setIronOre(map, coord, config.ironOrePerField);
  }
  applyInitialVisibility(map, config.startPosition, config.starterSightRange);
  return map;
}

function generateCandidateMap(
  rng: SeededRng,
  config: MapGenerationConfig,
): Field[][] {
  const map = createPlainMap(config.width, config.height);
  const start = config.startPosition;
  const rules: OreClusterRules = {
    start,
    sightRange: config.starterSightRange,
  };

  // Zielring: nicht initial sichtbar UND BFS-Distanz 4-6 vom Start.
  const targetRing: FieldCoord[] = [];
  for (const row of map) {
    for (const field of row) {
      const coord = { x: field.x, y: field.y };
      if (isInInitialVisibleArea(coord, start, config.starterSightRange)) {
        continue;
      }
      const distance = bfsDistance(map, start, coord);
      if (
        distance !== null &&
        distance >= config.requiredReachableIronOreMinDistance &&
        distance <= config.requiredReachableIronOreMaxDistance
      ) {
        targetRing.push(coord);
      }
    }
  }

  // Garantiertes erstes Cluster: Zielgröße 3-5.
  const sortedRing = sortFieldCoords(targetRing);
  const guaranteedSeed = sortedRing[rng.pickIndex(sortedRing.length)];
  const guaranteedSize = rng.intInclusive(3, 5);
  placeOreCluster(map, guaranteedSeed, guaranteedSize, rng, rules);

  // Weitere Cluster, bis ironOreFieldCount erreicht ist.
  while (countOreFields(map) < config.ironOreFieldCount) {
    const remaining = config.ironOreFieldCount - countOreFields(map);

    const seedCandidates: FieldCoord[] = [];
    for (const row of map) {
      for (const field of row) {
        const coord = { x: field.x, y: field.y };
        if (isInInitialVisibleArea(coord, start, config.starterSightRange)) {
          continue;
        }
        if (field.resource) {
          continue;
        }
        seedCandidates.push(coord);
      }
    }

    if (seedCandidates.length === 0) {
      break;
    }

    const sortedSeeds = sortFieldCoords(seedCandidates);
    const clusterSeed = sortedSeeds[rng.pickIndex(sortedSeeds.length)];
    const rawSize = rng.intInclusive(config.minClusterSize, config.maxClusterSize);
    const effectiveSize = Math.min(rawSize, remaining);
    placeOreCluster(map, clusterSeed, effectiveSize, rng, rules);
  }

  applyInitialVisibility(map, start, config.starterSightRange);
  return map;
}

export function generateMvpMap(
  seed: string,
  config: MapGenerationConfig = MVP_MAP_CONFIG,
): Field[][] {
  const effectiveConfig: MapGenerationConfig = { ...config, seed };

  for (let attempt = 0; attempt < effectiveConfig.maxGenerationAttempts; attempt += 1) {
    const rng = createSeededRng(makeRngInput([seed, "map", attempt]));
    const candidate = generateCandidateMap(rng, effectiveConfig);
    if (validateMvpMap(candidate, effectiveConfig)) {
      return candidate;
    }
  }

  return createFallbackMvpMap(effectiveConfig);
}
