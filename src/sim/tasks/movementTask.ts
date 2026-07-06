// MovementTask-Fortschritt nach docs/03-technical/simulation-rules.md
// (Bewegung, Pfadfindung und Kollisionen) und robot-task-lifecycle.md.
import { MVP_MOVE_BATTERY_COST } from "../constants";
import { bfsPath, isFieldPassable, isInsideMap } from "../pathfinding";
import { evaluateStopConditions } from "../programs";
import { selectScoutTarget } from "../actions/scoutNearby";
import type {
  FieldCoord,
  FieldTypeQuery,
  GameState,
  MovementTask,
  Robot,
} from "../types";

function robotBlocks(state: GameState, robot: Robot, coord: FieldCoord): boolean {
  return state.robots.some(
    (other) => other.id !== robot.id && other.x === coord.x && other.y === coord.y,
  );
}

function findSourceRow(robot: Robot, task: MovementTask) {
  const program = robot.programStack.find((entry) => entry.id === task.sourceProgramId);
  return program?.rows.find((row) => row.id === task.sourceRowId);
}

function scoutTargetFieldType(robot: Robot, task: MovementTask): FieldTypeQuery {
  const row = findSourceRow(robot, task);
  const parameter = row?.then.parameters.targetFieldType;
  if (
    parameter &&
    typeof parameter === "object" &&
    "type" in parameter &&
    parameter.type === "fieldType"
  ) {
    return parameter.value;
  }
  return "ironOre";
}

// Verarbeitet einen Bewegungs-Tick. Maximal ein erfolgreicher Schritt pro Tick.
export function processMovementTask(
  state: GameState,
  robot: Robot,
  task: MovementTask,
): void {
  if (task.startedTick >= state.tick) {
    return; // erster Fortschritt erst im Folgetick
  }

  if (robot.battery < MVP_MOVE_BATTERY_COST) {
    task.status = "aborted";
    task.abortReason = "insufficientBattery";
    return;
  }

  // Ziel erreicht?
  if (robot.x === task.target.x && robot.y === task.target.y) {
    task.status = "completed";
    task.completedTick = state.tick;
    return;
  }

  // Pfad validieren bzw. neu berechnen.
  let next = task.path[0];
  const nextInvalid =
    !next ||
    !isInsideMap(state.map, next) ||
    !isFieldPassable(state.map[next.y][next.x]);
  if (nextInvalid) {
    const newPath = bfsPath(state.map, { x: robot.x, y: robot.y }, task.target);
    if (newPath === null || newPath.length === 0) {
      task.status = "aborted";
      task.abortReason = "noPath";
      return;
    }
    task.path = newPath;
    next = newPath[0];
  }

  if (robotBlocks(state, robot, next)) {
    task.movementState.blockedByRobotTicks += 1;
    if (task.movementState.blockedByRobotTicks >= 3) {
      task.status = "aborted";
      task.abortReason = "blockedByRobot";
    }
    return;
  }

  // Erfolgreicher Schritt.
  robot.x = next.x;
  robot.y = next.y;
  robot.battery -= MVP_MOVE_BATTERY_COST;
  task.movementState.blockedByRobotTicks = 0;
  task.path.shift();

  // Scouting: Stop-Bedingung nach jedem Schritt pruefen, dann Ziel neu bewerten.
  if (task.reason === "scouting") {
    const row = findSourceRow(robot, task);
    if (row && evaluateStopConditions(state, robot, row)) {
      task.status = "completed";
      task.completedTick = state.tick;
      task.abortReason = "stopConditionMet";
      return;
    }

    const reevaluated = selectScoutTarget(
      state,
      robot,
      scoutTargetFieldType(robot, task),
      task.sourceRowId,
    );
    if (!reevaluated) {
      task.status = "aborted";
      task.abortReason = "targetInvalid";
      return;
    }
    task.target = reevaluated.target;
    task.path = reevaluated.path;
  }

  if (robot.x === task.target.x && robot.y === task.target.y) {
    task.status = "completed";
    task.completedTick = state.tick;
  }
}
