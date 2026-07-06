// action.buildBuilding: Zielauswahl, Reservierung und Task-Planung nach
// docs/03-technical/action-executability-matrix.md und
// docs/03-technical/pathfinding-and-map-generation.md (Build-Action Bauplatzwahl).
import {
  MVP_BUILDING_CONSTRUCTION_REQUIRED,
  MVP_BUILD_BATTERY_COST,
  MVP_BUILD_TICKS,
  MVP_ROBOT_FACTORY_COST_IRON_ORE,
  MVP_SOLAR_COLLECTOR_COST_IRON_ORE,
} from "../constants";
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

type MvpBuildableType = "solarCollector" | "robotFactory";

export function getBuildingCost(buildingType: MvpBuildableType): ResourceCost {
  return buildingType === "solarCollector"
    ? { ironOre: MVP_SOLAR_COLLECTOR_COST_IRON_ORE }
    : { ironOre: MVP_ROBOT_FACTORY_COST_IRON_ORE };
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
  buildingType: MvpBuildableType,
  sourceRowId: ProgramRowId,
): RankedSite | null {
  const candidates: RankedSite[] = [];
  for (const row of state.map) {
    for (const field of row) {
      const coord = { x: field.x, y: field.y };
      if (!isValidBuildSite(state, robot, coord)) {
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
  const cost = getBuildingCost(target.buildingType as MvpBuildableType);
  return {
    id: createRobotTaskId(robot.id, "building", state),
    type: "building",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    mode: target.mode,
    buildingId: target.buildingId ?? createBuildingId(target.buildingType, state),
    buildingType: target.buildingType as MvpBuildableType,
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
  if (buildingType !== "solarCollector" && buildingType !== "robotFactory") {
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
  const activeSameType = state.buildings.some(
    (building) => building.type === buildingType && building.status === "active",
  );
  if (activeSameType) {
    return { type: "notExecutable", reason: "noValidBuildSite" };
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
