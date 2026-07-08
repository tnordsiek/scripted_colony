// action.charge (Expansion 2): Weg zur naechsten Ladezone planen und laden.
// Regeln: docs/02-mvp/expansion-2-scope.md (Ladenetz, Commitment bei Zielwahl).
import { createRobotTaskId } from "../ids";
import { isChargingZone } from "../energy";
import { bfsPath, isFieldPassableInState } from "../pathfinding";
import { createSeededRng, makeRngInput, sortFieldCoords } from "../rng";
import type {
  ActionExecutabilityResult,
  ChargingTask,
  FieldCoord,
  GameState,
  MovementTask,
  ProgramAction,
  ProgramInstanceId,
  ProgramRowId,
  Robot,
} from "../types";

function resolveTargetBattery(robot: Robot, action: ProgramAction): number {
  const parameter = action.parameters.targetBattery;
  if (typeof parameter === "number" && parameter >= 1) {
    return Math.min(parameter, robot.batteryMax);
  }
  return robot.batteryMax;
}

// Naechste erreichbare Ladezone (kuerzester Pfad, Gleichstand seeded).
export function selectChargingField(
  state: GameState,
  robot: Robot,
  sourceRowId: ProgramRowId,
): { target: FieldCoord; path: FieldCoord[] } | null {
  const passable = (field: Parameters<typeof isFieldPassableInState>[1]) =>
    isFieldPassableInState(state, field);

  const candidates: Array<{ coord: FieldCoord; path: FieldCoord[] }> = [];
  for (const row of state.map) {
    for (const field of row) {
      const coord = { x: field.x, y: field.y };
      if (!isChargingZone(state, coord)) {
        continue;
      }
      if (!passable(field)) {
        continue;
      }
      const occupied = state.robots.some(
        (other) => other.id !== robot.id && other.x === coord.x && other.y === coord.y,
      );
      if (occupied) {
        continue;
      }
      const path =
        coord.x === robot.x && coord.y === robot.y
          ? []
          : bfsPath(state.map, { x: robot.x, y: robot.y }, coord, passable);
      if (path !== null) {
        candidates.push({ coord, path });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const shortest = Math.min(...candidates.map((entry) => entry.path.length));
  const best = candidates.filter((entry) => entry.path.length === shortest);
  const sorted = sortFieldCoords(best.map((entry) => entry.coord));
  let target = sorted[0];
  if (sorted.length > 1) {
    const rng = createSeededRng(
      makeRngInput([
        state.randomSeed,
        "tie",
        state.tick,
        "chargeTarget",
        robot.id,
        sourceRowId,
      ]),
    );
    target = sorted[rng.pickIndex(sorted.length)];
  }
  const chosen = best.find(
    (entry) => entry.coord.x === target.x && entry.coord.y === target.y,
  ) as { coord: FieldCoord; path: FieldCoord[] };
  return { target: chosen.coord, path: chosen.path };
}

export function planCharge(
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): ActionExecutabilityResult {
  if (robot.status !== "active") {
    return { type: "notExecutable", reason: "robotNotActive" };
  }
  if (robot.chargingMode === "selfCharging") {
    // selfCharging-Roboter nutzen Stasis-Laden, nicht das Ladenetz.
    return { type: "notExecutable", reason: "unsupportedMvpAction" };
  }
  const targetBattery = resolveTargetBattery(robot, action);
  if (robot.battery >= targetBattery) {
    return { type: "notExecutable", reason: "batteryTooLow" };
  }

  // Bereits auf einer Ladezone: direkt laden.
  if (isChargingZone(state, { x: robot.x, y: robot.y })) {
    const plannedTask: ChargingTask = {
      id: createRobotTaskId(robot.id, "charging", state),
      type: "charging",
      status: "running",
      sourceProgramId,
      sourceRowId,
      startedTick: state.tick,
      targetBattery,
    };
    return { type: "executable", action, plannedTask };
  }

  const selected = selectChargingField(state, robot, sourceRowId);
  if (!selected || selected.path.length === 0) {
    return { type: "notExecutable", reason: "noReachableBuildFromField" };
  }

  const plannedTask: MovementTask = {
    id: createRobotTaskId(robot.id, "movement", state),
    type: "movement",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    path: selected.path,
    target: selected.target,
    reason: "fallback",
    movementState: { blockedByRobotTicks: 0 },
  };
  return { type: "executable", action, plannedTask };
}
