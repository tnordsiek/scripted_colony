// action.buildBuilding: Zielauswahl, Reservierung und Task-Planung nach
// docs/03-technical/action-executability-matrix.md und
// docs/03-technical/pathfinding-and-map-generation.md (Build-Action Bauplatzwahl).
import {
  EXP2_GRID_ENERGY_LINE_CONSTRUCTION_REQUIRED,
  EXP2_GRID_ENERGY_LINE_COST_STEEL_PLATES,
  EXP2_GRID_ENERGY_LINE_HP,
  EXP2_RESOURCE_STORAGE_CONSTRUCTION_REQUIRED,
  EXP2_RESOURCE_STORAGE_COST_STEEL_PLATES,
  EXP2_RESOURCE_STORAGE_HP,
  EXP1_AI_RESEARCH_CENTER_CONSTRUCTION_REQUIRED,
  EXP1_AI_RESEARCH_CENTER_COST_IRON_ORE,
  EXP1_AI_RESEARCH_CENTER_HP,
  EXP1_ENERGY_STORAGE_CONSTRUCTION_REQUIRED,
  EXP1_ENERGY_STORAGE_COST_STEEL_PLATES,
  EXP1_ENERGY_STORAGE_HP,
  EXP1_STEELWORKS_CONSTRUCTION_REQUIRED,
  EXP1_STEELWORKS_COST_IRON_ORE,
  EXP1_STEELWORKS_HP,
  MVP_BUILDING_CONSTRUCTION_REQUIRED,
  MVP_BUILDING_SIGHT_RANGE,
  MVP_BUILD_BATTERY_COST,
  MVP_BUILD_TICKS,
  MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED,
  MVP_ROBOT_FACTORY_COST_IRON_ORE,
  MVP_ROBOT_FACTORY_IDLE_POWER_REQUIRED,
  MVP_SOLAR_COLLECTOR_COST_IRON_ORE,
  MVP_SOLAR_COLLECTOR_POWER_PROVIDED,
} from "../constants";
import { isProjectCompleted } from "../research";
import { createBuildingId, createRobotTaskId } from "../ids";
import {
  bfsPath,
  getOrthogonalNeighbors,
  isFieldPassable,
  isInsideMap,
  manhattanDistance,
} from "../pathfinding";
import { createSeededRng, makeRngInput, sortFieldCoords } from "../rng";
import type {
  ActionExecutabilityResult,
  ActiveBuildableType,
  BuildTarget,
  Building,
  BuildingTask,
  FieldCoord,
  GameState,
  MovementTask,
  ProgramAction,
  ProgramInstanceId,
  ProgramRowId,
  ResourceCost,
  Robot,
} from "../types";

// Aktive Gebaeudekonfiguration (MVP + Expansion 1, docs/02-mvp/expansion-1-scope.md).
type ActiveBuildingConfig = {
  cost: ResourceCost;
  hp: number;
  constructionRequired: number;
  sightRange: number;
  extraFields: Partial<Building>;
  requiredResearch?:
    | "research.metalProcessing1"
    | "research.energyBuffer1"
    | "research.transportLogistics1";
};

export const ACTIVE_BUILDING_CONFIGS: Record<ActiveBuildableType, ActiveBuildingConfig> = {
  solarCollector: {
    cost: { ironOre: MVP_SOLAR_COLLECTOR_COST_IRON_ORE },
    hp: 100,
    constructionRequired: MVP_BUILDING_CONSTRUCTION_REQUIRED,
    sightRange: MVP_BUILDING_SIGHT_RANGE,
    extraFields: { powerProvided: MVP_SOLAR_COLLECTOR_POWER_PROVIDED },
  },
  robotFactory: {
    cost: { ironOre: MVP_ROBOT_FACTORY_COST_IRON_ORE },
    hp: 100,
    constructionRequired: MVP_BUILDING_CONSTRUCTION_REQUIRED,
    sightRange: MVP_BUILDING_SIGHT_RANGE,
    extraFields: {
      powerRequired: MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED,
      powerConsumed: MVP_ROBOT_FACTORY_IDLE_POWER_REQUIRED,
    },
  },
  aiResearchCenter: {
    cost: { ironOre: EXP1_AI_RESEARCH_CENTER_COST_IRON_ORE },
    hp: EXP1_AI_RESEARCH_CENTER_HP,
    constructionRequired: EXP1_AI_RESEARCH_CENTER_CONSTRUCTION_REQUIRED,
    sightRange: MVP_BUILDING_SIGHT_RANGE,
    extraFields: {},
  },
  steelworks: {
    cost: { ironOre: EXP1_STEELWORKS_COST_IRON_ORE },
    hp: EXP1_STEELWORKS_HP,
    constructionRequired: EXP1_STEELWORKS_CONSTRUCTION_REQUIRED,
    sightRange: MVP_BUILDING_SIGHT_RANGE,
    extraFields: {},
    requiredResearch: "research.metalProcessing1",
  },
  energyStorage: {
    cost: { steelPlates: EXP1_ENERGY_STORAGE_COST_STEEL_PLATES },
    hp: EXP1_ENERGY_STORAGE_HP,
    constructionRequired: EXP1_ENERGY_STORAGE_CONSTRUCTION_REQUIRED,
    sightRange: 1,
    extraFields: { storedEnergy: 0 },
    requiredResearch: "research.energyBuffer1",
  },
  // Expansion 2 (docs/02-mvp/expansion-2-scope.md):
  resourceStorage: {
    cost: { steelPlates: EXP2_RESOURCE_STORAGE_COST_STEEL_PLATES },
    hp: EXP2_RESOURCE_STORAGE_HP,
    constructionRequired: EXP2_RESOURCE_STORAGE_CONSTRUCTION_REQUIRED,
    sightRange: 1,
    extraFields: { inventory: { storage: {}, totalCapacity: 100 } },
    requiredResearch: "research.transportLogistics1",
  },
  gridEnergyLine: {
    cost: { steelPlates: EXP2_GRID_ENERGY_LINE_COST_STEEL_PLATES },
    hp: EXP2_GRID_ENERGY_LINE_HP,
    constructionRequired: EXP2_GRID_ENERGY_LINE_CONSTRUCTION_REQUIRED,
    sightRange: 0,
    extraFields: {},
    requiredResearch: "research.transportLogistics1",
  },
};

// Expansion 2: Energienetz-Elemente fuer die Gridline-Platzierung.
const GRID_NETWORK_TYPES = new Set([
  "solarCollector",
  "energyStorage",
  "robotFactory",
  "steelworks",
  "aiResearchCenter",
  "gridEnergyLine",
]);

function isAdjacentToGridNetwork(state: GameState, coord: FieldCoord): boolean {
  return state.buildings.some(
    (building) =>
      building.status !== "destroyed" &&
      GRID_NETWORK_TYPES.has(building.type) &&
      Math.abs(building.x - coord.x) + Math.abs(building.y - coord.y) === 1,
  );
}

export function isActiveBuildableType(value: string): value is ActiveBuildableType {
  return value in ACTIVE_BUILDING_CONFIGS;
}

export function getBuildingCost(buildingType: ActiveBuildableType): ResourceCost {
  return ACTIVE_BUILDING_CONFIGS[buildingType].cost;
}

function cargoHasCost(robot: Robot, cost: ResourceCost): boolean {
  return Object.entries(cost).every(
    ([resource, amount]) =>
      (robot.cargo.used[resource as keyof typeof robot.cargo.used] ?? 0) >=
      (amount ?? 0),
  );
}

function isRobotOn(state: GameState, coord: FieldCoord): boolean {
  return state.robots.some((robot) => robot.x === coord.x && robot.y === coord.y);
}

// Gueltiges Baufeld: visible, plains, frei von Gebaeuden, Ressourcen, Robotern
// und fremden Reservierungen; nicht das aktuelle Roboterfeld.
function isValidBuildSite(state: GameState, robot: Robot, coord: FieldCoord): boolean {
  if (!isInsideMap(state.map, coord)) {
    return false;
  }
  const field = state.map[coord.y][coord.x];
  if (field.visibility !== "visible") {
    return false;
  }
  if (field.terrainType !== "plains") {
    return false;
  }
  if (field.buildingId) {
    return false;
  }
  if (field.resource && field.resource.amount > 0) {
    return false;
  }
  if (coord.x === robot.x && coord.y === robot.y) {
    return false;
  }
  if (isRobotOn(state, coord)) {
    return false;
  }
  const reservation = field.reservedForConstruction;
  if (reservation && !reservation.reservedByRobotIds.includes(robot.id)) {
    return false;
  }

  // Einschluss-Schutz: Ein Baufeld direkt neben dem Roboter ist ungueltig,
  // wenn der Roboter danach keinen passierbaren orthogonalen Nachbarn mehr
  // haette (er wuerde sich selbst einmauern).
  if (manhattanDistance(coord, robot) === 1) {
    const otherPassableNeighbors = getOrthogonalNeighbors({
      x: robot.x,
      y: robot.y,
    }).filter(
      (neighbor) =>
        !(neighbor.x === coord.x && neighbor.y === coord.y) &&
        isInsideMap(state.map, neighbor) &&
        isFieldPassable(state.map[neighbor.y][neighbor.x]) &&
        !isRobotOn(state, neighbor),
    );
    if (otherPassableNeighbors.length === 0) {
      return false;
    }
  }

  return true;
}

type RankedSite = {
  site: FieldCoord;
  buildFrom: FieldCoord;
  path: FieldCoord[];
};

// Bestes erreichbares Bau-Ausfuehrungsfeld eines Bauplatzes (kuerzester Pfad).
function bestBuildFrom(
  state: GameState,
  robot: Robot,
  site: FieldCoord,
): { buildFrom: FieldCoord; path: FieldCoord[] } | null {
  let best: { buildFrom: FieldCoord; path: FieldCoord[] } | null = null;
  for (const neighbor of sortFieldCoords(getOrthogonalNeighbors(site))) {
    if (!isInsideMap(state.map, neighbor)) {
      continue;
    }
    const isRobotHere = neighbor.x === robot.x && neighbor.y === robot.y;
    if (!isRobotHere) {
      if (!isFieldPassable(state.map[neighbor.y][neighbor.x])) {
        continue;
      }
      if (isRobotOn(state, neighbor)) {
        continue;
      }
    }
    const path = isRobotHere
      ? []
      : bfsPath(state.map, { x: robot.x, y: robot.y }, neighbor);
    if (path === null) {
      continue;
    }
    if (!best || path.length < best.path.length) {
      best = { buildFrom: neighbor, path };
    }
  }
  return best;
}

export function selectNewConstructionSite(
  state: GameState,
  robot: Robot,
  buildingType: ActiveBuildableType,
  sourceRowId: ProgramRowId,
): RankedSite | null {
  // Commitment: Ein bereits durch diesen Roboter reserviertes, weiterhin
  // gueltiges Baufeld wird beibehalten (verhindert Ziel-Pendeln bei
  // tick-abhaengigen Tie-Breaks waehrend der Anfahrt).
  for (const row of state.map) {
    for (const field of row) {
      if (!field.reservedForConstruction?.reservedByRobotIds.includes(robot.id)) {
        continue;
      }
      const coord = { x: field.x, y: field.y };
      if (!isValidBuildSite(state, robot, coord)) {
        continue;
      }
      const reach = bestBuildFrom(state, robot, coord);
      if (reach) {
        return { site: coord, buildFrom: reach.buildFrom, path: reach.path };
      }
    }
  }

  const candidates: RankedSite[] = [];
  for (const row of state.map) {
    for (const field of row) {
      const coord = { x: field.x, y: field.y };
      if (!isValidBuildSite(state, robot, coord)) {
        continue;
      }
      if (buildingType === "gridEnergyLine" && !isAdjacentToGridNetwork(state, coord)) {
        continue;
      }
      const reach = bestBuildFrom(state, robot, coord);
      if (!reach) {
        continue;
      }
      candidates.push({ site: coord, buildFrom: reach.buildFrom, path: reach.path });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  let best: RankedSite[];

  if (buildingType === "solarCollector") {
    // nearBuilder: kuerzester Pfad zum Bau-Ausfuehrungsfeld,
    // Tie-Breaker kuerzeste Distanz zum Roboter, dann seeded random.
    const shortest = Math.min(...candidates.map((entry) => entry.path.length));
    const byPath = candidates.filter((entry) => entry.path.length === shortest);
    const minDist = Math.min(
      ...byPath.map((entry) => manhattanDistance(entry.site, robot)),
    );
    best = byPath.filter((entry) => manhattanDistance(entry.site, robot) === minDist);
  } else {
    // nearActiveSolarCollector: kuerzeste Distanz zum active Solar Collector,
    // dann kuerzester Roboterpfad, dann seeded random.
    const collectors = state.buildings.filter(
      (building) => building.type === "solarCollector" && building.status === "active",
    );
    const distToCollector = (site: FieldCoord) =>
      Math.min(...collectors.map((collector) => manhattanDistance(site, collector)));
    const minCollectorDist = Math.min(
      ...candidates.map((entry) => distToCollector(entry.site)),
    );
    const byCollector = candidates.filter(
      (entry) => distToCollector(entry.site) === minCollectorDist,
    );
    const shortest = Math.min(...byCollector.map((entry) => entry.path.length));
    best = byCollector.filter((entry) => entry.path.length === shortest);
  }

  if (best.length === 1) {
    return best[0];
  }

  const sorted = [...best].sort(
    (a, b) => a.site.y - b.site.y || a.site.x - b.site.x,
  );
  const rng = createSeededRng(
    makeRngInput([
      state.randomSeed,
      "tie",
      state.tick,
      "buildSite",
      robot.id,
      sourceRowId,
      buildingType,
    ]),
  );
  return sorted[rng.pickIndex(sorted.length)];
}

function isAdjacent(a: FieldCoord, b: FieldCoord): boolean {
  return manhattanDistance(a, b) === 1;
}

export function isConstructionSiteReserved(
  state: GameState,
  buildingId: string,
  requestingRobotId?: string,
): boolean {
  return state.robots.some(
    (robot) =>
      robot.id !== requestingRobotId &&
      robot.activeTask?.type === "building" &&
      robot.activeTask.status === "running" &&
      robot.activeTask.buildingId === buildingId,
  );
}

function planBuildingTaskAt(
  state: GameState,
  robot: Robot,
  target: BuildTarget,
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): BuildingTask {
  const cost = getBuildingCost(target.buildingType as ActiveBuildableType);
  return {
    id: createRobotTaskId(robot.id, "building", state),
    type: "building",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    mode: target.mode,
    buildingId: target.buildingId ?? createBuildingId(target.buildingType, state),
    buildingType: target.buildingType as ActiveBuildableType,
    site: target.site,
    buildFrom: target.buildFrom,
    totalTicks: MVP_BUILD_TICKS,
    remainingTicks: MVP_BUILD_TICKS,
    costToPay: target.mode === "newConstruction" ? cost : {},
    costPaidByThisTask: false,
    batteryCostOnSuccess: MVP_BUILD_BATTERY_COST,
  };
}

function planMovementTo(
  state: GameState,
  robot: Robot,
  target: FieldCoord,
  path: FieldCoord[],
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): MovementTask {
  return {
    id: createRobotTaskId(robot.id, "movement", state),
    type: "movement",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    path,
    target,
    reason: "building",
    movementState: { blockedByRobotTicks: 0 },
  };
}

export function planBuildBuilding(
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): ActionExecutabilityResult {
  const parameter = action.parameters.buildingType;
  const buildingType =
    typeof parameter === "string"
      ? parameter
      : typeof parameter === "object" && parameter !== null && "value" in parameter
        ? parameter.value
        : undefined;

  if (buildingType === undefined) {
    return { type: "notExecutable", reason: "missingParameter" };
  }
  if (typeof buildingType !== "string" || !isActiveBuildableType(buildingType)) {
    return { type: "notExecutable", reason: "unsupportedMvpTarget" };
  }

  const requiredResearch = ACTIVE_BUILDING_CONFIGS[buildingType].requiredResearch;
  if (requiredResearch && !isProjectCompleted(state, requiredResearch)) {
    return { type: "notExecutable", reason: "unsupportedMvpTarget" };
  }

  // Fall B: bestehende Baustelle fortsetzen (wird vor Fall A geprueft).
  const constructionSite: Building | undefined = state.buildings.find(
    (building) =>
      building.type === buildingType &&
      building.status === "construction" &&
      (building.constructionProgress ?? 0) <
        (building.constructionRequired ?? MVP_BUILDING_CONSTRUCTION_REQUIRED) &&
      building.costPaid !== undefined,
  );

  if (constructionSite) {
    if (isConstructionSiteReserved(state, constructionSite.id, robot.id)) {
      return { type: "notExecutable", reason: "constructionAlreadyReserved" };
    }

    const site = { x: constructionSite.x, y: constructionSite.y };
    const reach = bestBuildFrom(state, robot, site);
    if (!reach) {
      return { type: "notExecutable", reason: "noReachableBuildFromField" };
    }

    const target: BuildTarget = {
      buildingType,
      site,
      buildFrom: reach.buildFrom,
      reason: "continueExistingConstruction",
      mode: "continueConstruction",
      buildingId: constructionSite.id,
    };

    const robotIsAdjacent = isAdjacent({ x: robot.x, y: robot.y }, site);
    const plannedTask = robotIsAdjacent
      ? planBuildingTaskAt(
          state,
          robot,
          { ...target, buildFrom: { x: robot.x, y: robot.y } },
          sourceProgramId,
          sourceRowId,
        )
      : planMovementTo(state, robot, reach.buildFrom, reach.path, sourceProgramId, sourceRowId);

    return { type: "executable", action, plannedTask };
  }

  // Fall A: neue Baustelle.
  // Gridlines duerfen mehrfach gebaut werden (Expansion 2).
  if (buildingType !== "gridEnergyLine") {
    const activeSameType = state.buildings.some(
      (building) => building.type === buildingType && building.status === "active",
    );
    if (activeSameType) {
      return { type: "notExecutable", reason: "noValidBuildSite" };
    }
  }

  if (buildingType === "robotFactory") {
    const hasActiveCollector = state.buildings.some(
      (building) => building.type === "solarCollector" && building.status === "active",
    );
    if (!hasActiveCollector) {
      return { type: "notExecutable", reason: "noActiveSolarCollector" };
    }
  }

  if (!cargoHasCost(robot, getBuildingCost(buildingType))) {
    return { type: "notExecutable", reason: "notEnoughResources" };
  }

  const selected = selectNewConstructionSite(state, robot, buildingType, sourceRowId);
  if (!selected) {
    return { type: "notExecutable", reason: "noValidBuildSite" };
  }

  const target: BuildTarget = {
    buildingType,
    site: selected.site,
    buildFrom: selected.buildFrom,
    reason: buildingType === "solarCollector" ? "nearBuilder" : "nearActiveSolarCollector",
    mode: "newConstruction",
  };

  const robotIsAdjacent = isAdjacent({ x: robot.x, y: robot.y }, selected.site);
  const plannedTask = robotIsAdjacent
    ? planBuildingTaskAt(
        state,
        robot,
        { ...target, buildFrom: { x: robot.x, y: robot.y } },
        sourceProgramId,
        sourceRowId,
      )
    : planMovementTo(
        state,
        robot,
        selected.buildFrom,
        selected.path,
        sourceProgramId,
        sourceRowId,
      );

  return { type: "executable", action, plannedTask };
}
