// LogisticsTask (Expansion 2): fuehrt einen zugewiesenen MaterialRequest aus.
// Phasen: moveToPickup -> pickup (1 Tick) -> moveToDelivery -> delivery (1 Tick).
// Pickup/Delivery kosten keine Batterie; Bewegung kostet 1 Batterie/Schritt.
import { MVP_MOVE_BATTERY_COST } from "../constants";
import {
  deliverToEndpoint,
  endpointAvailable,
  endpointCoord,
  endpointHasCapacity,
  inventoryTotal,
  takeFromEndpoint,
} from "../logistics";
import {
  bfsPath,
  getOrthogonalNeighbors,
  isFieldPassableInState,
  isInsideMap,
  manhattanDistance,
} from "../pathfinding";
import { sortFieldCoords } from "../rng";
import type {
  FieldCoord,
  GameState,
  LogisticsTask,
  MaterialRequest,
  Robot,
} from "../types";

function findRequest(state: GameState, task: LogisticsTask): MaterialRequest | undefined {
  return state.materialRequests.find((request) => request.id === task.requestId);
}

// Zielfeld einer Phase: orthogonal angrenzend an den Endpoint (oder das Feld
// selbst, wenn es begehbar ist, z. B. bei Roboter-Quellen daneben stehen).
function approachTarget(
  state: GameState,
  robot: Robot,
  endpoint: FieldCoord,
): { target: FieldCoord; path: FieldCoord[] } | null {
  const passable = (field: Parameters<typeof isFieldPassableInState>[1]) =>
    isFieldPassableInState(state, field);

  if (manhattanDistance({ x: robot.x, y: robot.y }, endpoint) <= 1) {
    return { target: { x: robot.x, y: robot.y }, path: [] };
  }

  let best: { target: FieldCoord; path: FieldCoord[] } | null = null;
  for (const neighbor of sortFieldCoords(getOrthogonalNeighbors(endpoint))) {
    if (!isInsideMap(state.map, neighbor)) {
      continue;
    }
    if (!passable(state.map[neighbor.y][neighbor.x])) {
      continue;
    }
    const occupied = state.robots.some(
      (other) => other.id !== robot.id && other.x === neighbor.x && other.y === neighbor.y,
    );
    if (occupied) {
      continue;
    }
    const path = bfsPath(state.map, { x: robot.x, y: robot.y }, neighbor, passable);
    if (path !== null && (!best || path.length < best.path.length)) {
      best = { target: neighbor, path };
    }
  }
  return best;
}

function blockRequest(
  state: GameState,
  request: MaterialRequest,
  reason: MaterialRequest["blockedReason"],
  task: LogisticsTask,
): void {
  request.status = "blocked";
  request.blockedReason = reason;
  request.assignedRobotId = undefined;
  request.from = undefined; // Neubewertung der Quelle im Folgetick
  request.updatedTick = state.tick;
  task.status = "aborted";
  task.abortReason = "targetInvalid";
}

// Ein Bewegungs-Schritt entlang task.path (mit Neuberechnung bei Blockade).
function stepAlongPath(
  state: GameState,
  robot: Robot,
  task: LogisticsTask,
  destination: FieldCoord,
): "moving" | "arrived" | "failed" {
  if (robot.x === destination.x && robot.y === destination.y) {
    return "arrived";
  }
  if (robot.battery < MVP_MOVE_BATTERY_COST) {
    return "failed";
  }

  const passable = (field: Parameters<typeof isFieldPassableInState>[1]) =>
    isFieldPassableInState(state, field);

  let next = task.path[0];
  const nextInvalid =
    !next ||
    !isInsideMap(state.map, next) ||
    !passable(state.map[next.y][next.x]);
  if (nextInvalid) {
    const newPath = bfsPath(state.map, { x: robot.x, y: robot.y }, destination, passable);
    if (newPath === null || newPath.length === 0) {
      return "failed";
    }
    task.path = newPath;
    next = newPath[0];
  }

  const blockedByRobot = state.robots.some(
    (other) => other.id !== robot.id && other.x === next.x && other.y === next.y,
  );
  if (blockedByRobot) {
    task.movementState.blockedByRobotTicks += 1;
    if (task.movementState.blockedByRobotTicks >= 3) {
      return "failed";
    }
    return "moving";
  }

  robot.x = next.x;
  robot.y = next.y;
  robot.battery -= MVP_MOVE_BATTERY_COST;
  task.movementState.blockedByRobotTicks = 0;
  task.path.shift();

  return robot.x === destination.x && robot.y === destination.y ? "arrived" : "moving";
}

export type LogisticsTaskResult =
  | { type: "none" }
  | { type: "fulfilled"; requestId: string }
  | { type: "blocked"; requestId: string; reason: string };

export function processLogisticsTask(
  state: GameState,
  robot: Robot,
  task: LogisticsTask,
): LogisticsTaskResult {
  if (task.startedTick >= state.tick) {
    return { type: "none" };
  }

  const request = findRequest(state, task);
  if (!request || !request.from) {
    task.status = "aborted";
    task.abortReason = "targetInvalid";
    return { type: "none" };
  }

  // Phase 1: zur Quelle fahren.
  if (task.phase === "moveToPickup") {
    request.status = "pickupInProgress";
    request.updatedTick = state.tick;
    const sourceCoord = endpointCoord(state, request.from);
    if (!sourceCoord) {
      blockRequest(state, request, "sourceInvalid", task);
      return { type: "blocked", requestId: request.id, reason: "sourceInvalid" };
    }
    const approach = approachTarget(state, robot, sourceCoord);
    if (!approach) {
      blockRequest(state, request, "noReachableSource", task);
      return { type: "blocked", requestId: request.id, reason: "noReachableSource" };
    }
    const step = stepAlongPath(state, robot, task, approach.target);
    if (step === "failed") {
      blockRequest(state, request, "pathBlocked", task);
      return { type: "blocked", requestId: request.id, reason: "pathBlocked" };
    }
    if (step === "arrived") {
      task.phase = "pickup";
    }
    return { type: "none" };
  }

  // Phase 2: Pickup (1 Tick).
  if (task.phase === "pickup") {
    if (!endpointAvailable(state, request.from, request.resources)) {
      blockRequest(state, request, "noSourceWithResources", task);
      return { type: "blocked", requestId: request.id, reason: "noSourceWithResources" };
    }
    if (!takeFromEndpoint(state, request.from, request.resources)) {
      blockRequest(state, request, "sourceInvalid", task);
      return { type: "blocked", requestId: request.id, reason: "sourceInvalid" };
    }
    task.carried = { ...request.resources };
    task.phase = "moveToDelivery";
    task.path = [];
    request.status = "deliveryInProgress";
    request.updatedTick = state.tick;
    return { type: "none" };
  }

  // Phase 3: zum Ziel fahren.
  if (task.phase === "moveToDelivery") {
    const targetCoord = endpointCoord(state, request.to);
    if (!targetCoord) {
      returnCarried(state, robot, task);
      blockRequest(state, request, "targetInvalid", task);
      return { type: "blocked", requestId: request.id, reason: "targetInvalid" };
    }
    const approach = approachTarget(state, robot, targetCoord);
    if (!approach) {
      returnCarried(state, robot, task);
      blockRequest(state, request, "pathBlocked", task);
      return { type: "blocked", requestId: request.id, reason: "pathBlocked" };
    }
    const step = stepAlongPath(state, robot, task, approach.target);
    if (step === "failed") {
      returnCarried(state, robot, task);
      blockRequest(state, request, "pathBlocked", task);
      return { type: "blocked", requestId: request.id, reason: "pathBlocked" };
    }
    if (step === "arrived") {
      task.phase = "delivery";
    }
    return { type: "none" };
  }

  // Phase 4: Delivery (1 Tick).
  if (!endpointHasCapacity(state, request.to, inventoryTotal(task.carried))) {
    returnCarried(state, robot, task);
    blockRequest(state, request, "targetHasNoCapacity", task);
    return { type: "blocked", requestId: request.id, reason: "targetHasNoCapacity" };
  }
  if (!deliverToEndpoint(state, request.to, task.carried ?? {})) {
    returnCarried(state, robot, task);
    blockRequest(state, request, "targetInvalid", task);
    return { type: "blocked", requestId: request.id, reason: "targetInvalid" };
  }

  task.carried = undefined;
  task.status = "completed";
  task.completedTick = state.tick;
  request.status = "fulfilled";
  request.updatedTick = state.tick;
  return { type: "fulfilled", requestId: request.id };
}

// Blockade nach Pickup: getragene Ressourcen bleiben im Transporter-Cargo
// (docs/02-mvp/expansion-2-scope.md: keine Teillieferungen, kein Verlust).
function returnCarried(state: GameState, robot: Robot, task: LogisticsTask): void {
  if (!task.carried) {
    return;
  }
  for (const [resource, amount] of Object.entries(task.carried)) {
    const key = resource as keyof typeof robot.cargo.used;
    robot.cargo.used[key] = (robot.cargo.used[key] ?? 0) + (amount ?? 0);
  }
  task.carried = undefined;
  void state;
}
