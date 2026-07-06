// action.scoutNearby: interne Zielprioritaet nach docs/03-technical/pathfinding-and-map-generation.md
// und program-stack-rules.md (sichtbares Ziel -> unknown Randfeld -> Fallback).
import { createRobotTaskId } from "../ids";
import {
  bfsPath,
  getOrthogonalNeighbors,
  isFieldPassable,
  isInsideMap,
} from "../pathfinding";
import { createSeededRng, makeRngInput, sortFieldCoords } from "../rng";
import type {
  ActionExecutabilityResult,
  Field,
  FieldCoord,
  FieldTypeQuery,
  GameState,
  MovementTask,
  ProgramAction,
  ProgramInstanceId,
  ProgramRowId,
  Robot,
  ScoutTarget,
} from "../types";

function isRobotOn(state: GameState, coord: FieldCoord): boolean {
  return state.robots.some((robot) => robot.x === coord.x && robot.y === coord.y);
}

// Begehbarkeit fuer Scout-Pfade: Feldregeln; unknown Felder gelten als begehbar
// (im MVP ist alles plains, Scouts duerfen unbekannte Felder betreten).
function scoutPassable(field: Field): boolean {
  return isFieldPassable(field);
}

function fieldHasQueryType(state: GameState, field: Field, query: FieldTypeQuery): boolean {
  if (query === "ironOre") {
    return field.resource?.type === "ironOre" && field.resource.amount > 0;
  }
  if (query === "solarCollector" || query === "robotFactory") {
    const building = field.buildingId
      ? state.buildings.find((entry) => entry.id === field.buildingId)
      : undefined;
    return building?.type === query;
  }
  return false;
}

type RankedTarget = {
  coord: FieldCoord;
  path: FieldCoord[];
};

function rankCandidates(
  state: GameState,
  robot: Robot,
  candidates: FieldCoord[],
): RankedTarget[] {
  const ranked: RankedTarget[] = [];
  for (const coord of sortFieldCoords(candidates)) {
    if (coord.x === robot.x && coord.y === robot.y) {
      continue;
    }
    if (isRobotOn(state, coord)) {
      continue;
    }
    const path = bfsPath(state.map, { x: robot.x, y: robot.y }, coord, scoutPassable);
    if (path !== null && path.length > 0) {
      ranked.push({ coord, path });
    }
  }
  return ranked;
}

function pickShortest(
  state: GameState,
  robot: Robot,
  sourceRowId: ProgramRowId,
  ranked: RankedTarget[],
): RankedTarget | null {
  if (ranked.length === 0) {
    return null;
  }
  const shortest = Math.min(...ranked.map((entry) => entry.path.length));
  const best = ranked.filter((entry) => entry.path.length === shortest);
  if (best.length === 1) {
    return best[0];
  }
  const rng = createSeededRng(
    makeRngInput([
      state.randomSeed,
      "tie",
      state.tick,
      "scoutTarget",
      robot.id,
      sourceRowId,
    ]),
  );
  return best[rng.pickIndex(best.length)];
}

// Interne Zielauswahl mit fester Prioritaet.
export function selectScoutTarget(
  state: GameState,
  robot: Robot,
  targetFieldType: FieldTypeQuery,
  sourceRowId: ProgramRowId,
): (ScoutTarget & { path: FieldCoord[] }) | null {
  // Prioritaet 1: sichtbares Ziel, nicht angrenzend -> erreichbares Nachbarfeld.
  const neighborCandidates: FieldCoord[] = [];
  for (const row of state.map) {
    for (const field of row) {
      if (field.visibility !== "visible") {
        continue;
      }
      if (!fieldHasQueryType(state, field, targetFieldType)) {
        continue;
      }
      for (const neighbor of getOrthogonalNeighbors(field)) {
        if (
          isInsideMap(state.map, neighbor) &&
          scoutPassable(state.map[neighbor.y][neighbor.x])
        ) {
          neighborCandidates.push(neighbor);
        }
      }
    }
  }
  const visibleTarget = pickShortest(
    state,
    robot,
    sourceRowId,
    rankCandidates(state, robot, neighborCandidates),
  );
  if (visibleTarget) {
    return {
      target: visibleTarget.coord,
      reason: "visibleTarget",
      path: visibleTarget.path,
    };
  }

  // Prioritaet 2: unknown Randfeld (unknown mit mindestens einem bekannten Nachbarn).
  const borderCandidates: FieldCoord[] = [];
  for (const row of state.map) {
    for (const field of row) {
      if (field.visibility !== "unknown") {
        continue;
      }
      const touchesKnown = getOrthogonalNeighbors(field).some(
        (neighbor) =>
          isInsideMap(state.map, neighbor) &&
          state.map[neighbor.y][neighbor.x].visibility !== "unknown",
      );
      if (touchesKnown && scoutPassable(field)) {
        borderCandidates.push({ x: field.x, y: field.y });
      }
    }
  }
  const borderTarget = pickShortest(
    state,
    robot,
    sourceRowId,
    rankCandidates(state, robot, borderCandidates),
  );
  if (borderTarget) {
    return {
      target: borderTarget.coord,
      reason: "unknownBorder",
      path: borderTarget.path,
    };
  }

  // Prioritaet 3: erreichbares Fallback-Feld.
  const fallbackCandidates: FieldCoord[] = [];
  for (const row of state.map) {
    for (const field of row) {
      if (scoutPassable(field)) {
        fallbackCandidates.push({ x: field.x, y: field.y });
      }
    }
  }
  const fallbackTarget = pickShortest(
    state,
    robot,
    sourceRowId,
    rankCandidates(state, robot, fallbackCandidates),
  );
  if (fallbackTarget) {
    return {
      target: fallbackTarget.coord,
      reason: "fallbackReachableField",
      path: fallbackTarget.path,
    };
  }

  return null;
}

export function planScoutNearby(
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): ActionExecutabilityResult {
  const parameter = action.parameters.targetFieldType;
  if (
    parameter === undefined ||
    typeof parameter !== "object" ||
    !("type" in parameter) ||
    parameter.type !== "fieldType"
  ) {
    return { type: "notExecutable", reason: "missingParameter" };
  }

  const target = selectScoutTarget(state, robot, parameter.value, sourceRowId);
  if (!target) {
    return { type: "notExecutable", reason: "noValidScoutTarget" };
  }

  const plannedTask: MovementTask = {
    id: createRobotTaskId(robot.id, "movement", state),
    type: "movement",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    path: target.path,
    target: target.target,
    reason: "scouting",
    movementState: { blockedByRobotTicks: 0 },
  };

  return { type: "executable", action, plannedTask };
}
