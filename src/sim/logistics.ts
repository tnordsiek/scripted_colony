// MaterialRequest-Engine (Expansion 2) nach docs/02-mvp/expansion-2-scope.md
// und docs/04-systems/resources-and-logistics.md. Commitment: Quelle, Menge und
// Roboter werden einmal gebunden; Neubewertung nur bei Blockade.
import {
  EXP2_MOVE_TO_STORAGE_THRESHOLD_PERCENT,
  EXP2_RESOURCE_STORAGE_CAPACITY,
  EXP2_STEELWORKS_INPUT_CAPACITY,
  EXP2_SUPPLY_INPUT_BATCH,
} from "./constants";
import { createMaterialRequestId, createRobotTaskId } from "./ids";
import { bfsPath, isFieldPassableInState } from "./pathfinding";
import { isLogisticsUnlocked } from "./research";
import { sortEntityIds } from "./rng";
import type {
  ActionExecutabilityResult,
  Building,
  FieldCoord,
  GameState,
  LogisticsTask,
  MaterialEndpoint,
  MaterialRequest,
  ProgramAction,
  ProgramInstanceId,
  ProgramRowId,
  ResourceInventory,
  ResourceType,
  Robot,
} from "./types";

// ---------------------------------------------------------------------------
// Inventar-Helfer
// ---------------------------------------------------------------------------

export function inventoryTotal(inventory: ResourceInventory | undefined): number {
  if (!inventory) {
    return 0;
  }
  return Object.values(inventory).reduce((sum, amount) => sum + (amount ?? 0), 0);
}

function addToInventory(
  inventory: ResourceInventory,
  resources: ResourceInventory,
): void {
  for (const [resource, amount] of Object.entries(resources)) {
    const key = resource as ResourceType;
    inventory[key] = (inventory[key] ?? 0) + (amount ?? 0);
  }
}

function removeFromInventory(
  inventory: ResourceInventory,
  resources: ResourceInventory,
): boolean {
  for (const [resource, amount] of Object.entries(resources)) {
    if ((inventory[resource as ResourceType] ?? 0) < (amount ?? 0)) {
      return false;
    }
  }
  for (const [resource, amount] of Object.entries(resources)) {
    const key = resource as ResourceType;
    inventory[key] = (inventory[key] ?? 0) - (amount ?? 0);
    if (inventory[key] === 0) {
      delete inventory[key];
    }
  }
  return true;
}

function findBuilding(state: GameState, buildingId: string): Building | undefined {
  return state.buildings.find((building) => building.id === buildingId);
}

function activeResourceStorage(state: GameState): Building | undefined {
  return [...state.buildings]
    .filter(
      (building) =>
        building.type === "resourceStorage" &&
        building.status === "active" &&
        building.isEnabled,
    )
    .sort((a, b) => (a.id < b.id ? -1 : 1))[0];
}

function storageFreeCapacity(storage: Building): number {
  return (
    (storage.inventory?.totalCapacity ?? EXP2_RESOURCE_STORAGE_CAPACITY) -
    inventoryTotal(storage.inventory?.storage)
  );
}

// ---------------------------------------------------------------------------
// Endpoint-Zugriff (Bestand, Kapazitaet, Position, Reservierung)
// ---------------------------------------------------------------------------

function endpointCoord(state: GameState, endpoint: MaterialEndpoint): FieldCoord | null {
  if (endpoint.type === "robot") {
    const robot = state.robots.find((entry) => entry.id === endpoint.robotId);
    return robot ? { x: robot.x, y: robot.y } : null;
  }
  const building = findBuilding(state, endpoint.buildingId);
  return building ? { x: building.x, y: building.y } : null;
}

function endpointAvailable(
  state: GameState,
  endpoint: MaterialEndpoint,
  resources: ResourceInventory,
): boolean {
  if (endpoint.type === "robot") {
    const robot = state.robots.find((entry) => entry.id === endpoint.robotId);
    if (!robot) {
      return false;
    }
    return Object.entries(resources).every(
      ([resource, amount]) =>
        (robot.cargo.used[resource as ResourceType] ?? 0) >= (amount ?? 0),
    );
  }
  const building = findBuilding(state, endpoint.buildingId);
  if (!building || building.status === "destroyed") {
    return false;
  }
  const role = endpoint.type === "building" ? endpoint.inventoryRole : "construction";
  const inventory =
    role === "storage"
      ? building.inventory?.storage
      : role === "output"
        ? building.inventory?.output
        : building.inventory?.input;
  return Object.entries(resources).every(
    ([resource, amount]) =>
      (inventory?.[resource as ResourceType] ?? 0) >= (amount ?? 0),
  );
}

function endpointHasCapacity(
  state: GameState,
  endpoint: MaterialEndpoint,
  amount: number,
): boolean {
  if (endpoint.type !== "building") {
    return false;
  }
  const building = findBuilding(state, endpoint.buildingId);
  if (!building || building.status !== "active" || !building.isEnabled) {
    return false;
  }
  if (endpoint.inventoryRole === "storage") {
    return storageFreeCapacity(building) >= amount;
  }
  if (endpoint.inventoryRole === "input") {
    return (
      EXP2_STEELWORKS_INPUT_CAPACITY - inventoryTotal(building.inventory?.input) >=
      amount
    );
  }
  return false;
}

function takeFromEndpoint(
  state: GameState,
  endpoint: MaterialEndpoint,
  resources: ResourceInventory,
): boolean {
  if (endpoint.type === "robot") {
    const robot = state.robots.find((entry) => entry.id === endpoint.robotId);
    return robot ? removeFromInventory(robot.cargo.used, resources) : false;
  }
  const building = findBuilding(state, endpoint.buildingId);
  if (!building) {
    return false;
  }
  const role = endpoint.type === "building" ? endpoint.inventoryRole : "construction";
  const inventory =
    role === "storage"
      ? building.inventory?.storage
      : role === "output"
        ? building.inventory?.output
        : building.inventory?.input;
  return inventory ? removeFromInventory(inventory, resources) : false;
}

function deliverToEndpoint(
  state: GameState,
  endpoint: MaterialEndpoint,
  resources: ResourceInventory,
): boolean {
  if (endpoint.type !== "building") {
    return false;
  }
  const building = findBuilding(state, endpoint.buildingId);
  if (!building || building.status !== "active" || !building.isEnabled) {
    return false;
  }
  if (!endpointHasCapacity(state, endpoint, inventoryTotal(resources))) {
    return false;
  }
  building.inventory = building.inventory ?? {};
  if (endpoint.inventoryRole === "storage") {
    building.inventory.storage = building.inventory.storage ?? {};
    addToInventory(building.inventory.storage, resources);
    return true;
  }
  if (endpoint.inventoryRole === "input") {
    building.inventory.input = building.inventory.input ?? {};
    addToInventory(building.inventory.input, resources);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Quellenwahl (bei Erzeugung, mit Commitment)
// ---------------------------------------------------------------------------

type SourceCandidate = {
  endpoint: MaterialEndpoint;
  coord: FieldCoord;
  priority: number; // 0 Speicher, 1 Gebaeude-Output, 2 Roboter-Cargo
};

function findSource(
  state: GameState,
  target: FieldCoord,
  resources: ResourceInventory,
  excludeRobotIds: Set<string>,
): MaterialEndpoint | null {
  const candidates: SourceCandidate[] = [];

  for (const building of [...state.buildings].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    if (building.status !== "active" || !building.isEnabled) {
      continue;
    }
    if (building.type === "resourceStorage") {
      candidates.push({
        endpoint: { type: "building", buildingId: building.id, inventoryRole: "storage" },
        coord: { x: building.x, y: building.y },
        priority: 0,
      });
    }
    if (inventoryTotal(building.inventory?.output) > 0) {
      candidates.push({
        endpoint: { type: "building", buildingId: building.id, inventoryRole: "output" },
        coord: { x: building.x, y: building.y },
        priority: 1,
      });
    }
  }

  for (const robotId of sortEntityIds(state.robots.map((robot) => robot.id))) {
    const robot = state.robots.find((entry) => entry.id === robotId) as Robot;
    if (robot.type === "starterRobot" || robot.type === "transportRobot") {
      continue;
    }
    if (excludeRobotIds.has(robot.id)) {
      continue;
    }
    candidates.push({
      endpoint: { type: "robot", robotId: robot.id, inventoryRole: "cargo" },
      coord: { x: robot.x, y: robot.y },
      priority: 2,
    });
  }

  const passable = (field: Parameters<typeof isFieldPassableInState>[1]) =>
    isFieldPassableInState(state, field);

  let best: { candidate: SourceCandidate; distance: number } | null = null;
  for (const candidate of candidates) {
    if (!endpointAvailable(state, candidate.endpoint, resources)) {
      continue;
    }
    const path = bfsPath(state.map, target, candidate.coord, passable);
    if (path === null) {
      continue;
    }
    const distance = path.length;
    if (
      !best ||
      candidate.priority < best.candidate.priority ||
      (candidate.priority === best.candidate.priority && distance < best.distance)
    ) {
      best = { candidate, distance };
    }
  }

  return best ? best.candidate.endpoint : null;
}

// ---------------------------------------------------------------------------
// Request-Erzeugung und Zuweisung (Pipeline-Schritt 3d)
// ---------------------------------------------------------------------------

export type LogisticsTickResult = {
  created: MaterialRequest[];
  assigned: Array<{ requestId: string; robotId: string }>;
  blocked: Array<{ requestId: string; reason: string }>;
};

function hasOpenRequestFor(state: GameState, key: string): boolean {
  return state.materialRequests.some(
    (request) =>
      request.status !== "fulfilled" &&
      request.status !== "cancelled" &&
      requestTriggerKey(request) === key,
  );
}

function requestTriggerKey(request: MaterialRequest): string {
  if (request.type === "supplyBuildingInput" && request.to.type === "building") {
    return `input:${request.to.buildingId}`;
  }
  if (request.type === "clearBuildingOutput" && request.from?.type === "building") {
    return `output:${request.from.buildingId}`;
  }
  if (request.type === "moveToStorage" && request.from?.type === "robot") {
    return `robot:${request.from.robotId}`;
  }
  return `request:${request.id}`;
}

export function processLogisticsTick(state: GameState): LogisticsTickResult {
  const result: LogisticsTickResult = { created: [], assigned: [], blocked: [] };

  if (!isLogisticsUnlocked(state)) {
    return result;
  }
  const storage = activeResourceStorage(state);
  if (!storage) {
    return result;
  }
  const storageEndpoint: MaterialEndpoint = {
    type: "building",
    buildingId: storage.id,
    inventoryRole: "storage",
  };

  let sequence = 0;

  function createRequest(
    type: MaterialRequest["type"],
    resources: ResourceInventory,
    to: MaterialEndpoint,
    fixedSource?: MaterialEndpoint,
  ): void {
    sequence += 1;
    const targetCoord = endpointCoord(state, to);
    if (!targetCoord) {
      return;
    }
    const source =
      fixedSource ??
      findSource(state, targetCoord, resources, new Set());
    const request: MaterialRequest = {
      id: createMaterialRequestId(type, state.tick, sequence),
      type,
      resources,
      from: source ?? undefined,
      to,
      status: source ? "reserved" : "blocked",
      createdTick: state.tick,
      updatedTick: state.tick,
      ...(source ? {} : { blockedReason: "noSourceWithResources" as const }),
    };
    state.materialRequests.push(request);
    result.created.push(request);
    if (!source) {
      result.blocked.push({ requestId: request.id, reason: "noSourceWithResources" });
    }
  }

  // Ausloeser 1: Stahlwerk-Input < 2 (supplyBuildingInput).
  for (const building of [...state.buildings].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    if (
      building.type !== "steelworks" ||
      building.status !== "active" ||
      !building.isEnabled
    ) {
      continue;
    }
    const inputAmount = building.inventory?.input?.ironOre ?? 0;
    if (inputAmount >= 2) {
      continue;
    }
    if (hasOpenRequestFor(state, `input:${building.id}`)) {
      continue;
    }
    const freeCapacity =
      EXP2_STEELWORKS_INPUT_CAPACITY - inventoryTotal(building.inventory?.input);
    const amount = Math.min(EXP2_SUPPLY_INPUT_BATCH, freeCapacity);
    if (amount <= 0) {
      continue;
    }
    createRequest(
      "supplyBuildingInput",
      { ironOre: amount },
      { type: "building", buildingId: building.id, inventoryRole: "input" },
    );
  }

  // Ausloeser 2: Stahlwerk-Output > 0 (clearBuildingOutput).
  for (const building of [...state.buildings].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    if (
      building.type !== "steelworks" ||
      building.status !== "active" ||
      !building.isEnabled
    ) {
      continue;
    }
    const output = building.inventory?.output ?? {};
    const total = inventoryTotal(output);
    if (total <= 0) {
      continue;
    }
    if (hasOpenRequestFor(state, `output:${building.id}`)) {
      continue;
    }
    createRequest(
      "clearBuildingOutput",
      { ...output },
      storageEndpoint,
      { type: "building", buildingId: building.id, inventoryRole: "output" },
    );
  }

  // Ausloeser 3: Arbeitsroboter-Cargo >= 80 % (moveToStorage).
  for (const robotId of sortEntityIds(state.robots.map((robot) => robot.id))) {
    const robot = state.robots.find((entry) => entry.id === robotId) as Robot;
    if (robot.type === "starterRobot" || robot.type === "transportRobot") {
      continue;
    }
    if (robot.status === "destroyed" || robot.status === "inactive") {
      continue;
    }
    const used = inventoryTotal(robot.cargo.used);
    if ((used / robot.cargo.capacity) * 100 < EXP2_MOVE_TO_STORAGE_THRESHOLD_PERCENT) {
      continue;
    }
    if (hasOpenRequestFor(state, `robot:${robot.id}`)) {
      continue;
    }
    createRequest(
      "moveToStorage",
      { ...robot.cargo.used },
      storageEndpoint,
      { type: "robot", robotId: robot.id, inventoryRole: "cargo" },
    );
  }

  // Zuweisung: freie Transporter nach RobotId; Requests nach Prioritaet,
  // createdTick, RequestId.
  const priorityOrder: Record<MaterialRequest["type"], number> = {
    supplyConstruction: 0,
    supplyBuildingInput: 1,
    clearBuildingOutput: 2,
    moveToStorage: 3,
  };
  const assignable = state.materialRequests
    .filter(
      (request) =>
        (request.status === "reserved" || request.status === "blocked") &&
        request.from !== undefined &&
        !request.assignedRobotId,
    )
    .sort(
      (a, b) =>
        priorityOrder[a.type] - priorityOrder[b.type] ||
        a.createdTick - b.createdTick ||
        (a.id < b.id ? -1 : 1),
    );

  const freeTransporters = sortEntityIds(
    state.robots
      .filter(
        (robot) =>
          robot.type === "transportRobot" &&
          robot.status === "active" &&
          !robot.activeTask &&
          !state.materialRequests.some(
            (request) =>
              request.assignedRobotId === robot.id &&
              request.status !== "fulfilled" &&
              request.status !== "cancelled" &&
              request.status !== "blocked",
          ),
      )
      .map((robot) => robot.id),
  );

  for (const request of assignable) {
    const robotId = freeTransporters.shift();
    if (!robotId) {
      if (request.status === "reserved") {
        request.status = "blocked";
        request.blockedReason = "noAvailableTransportRobot";
        request.updatedTick = state.tick;
        result.blocked.push({
          requestId: request.id,
          reason: "noAvailableTransportRobot",
        });
      }
      continue;
    }
    request.assignedRobotId = robotId;
    request.status = "assigned";
    request.blockedReason = undefined;
    request.updatedTick = state.tick;
    result.assigned.push({ requestId: request.id, robotId });
  }

  return result;
}

// ---------------------------------------------------------------------------
// action.logistics: zugewiesenen Request als LogisticsTask starten
// ---------------------------------------------------------------------------

export function getAssignedRequest(
  state: GameState,
  robotId: string,
): MaterialRequest | undefined {
  return state.materialRequests.find(
    (request) =>
      request.assignedRobotId === robotId &&
      (request.status === "assigned" ||
        request.status === "pickupInProgress" ||
        request.status === "deliveryInProgress"),
  );
}

export function planLogistics(
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): ActionExecutabilityResult {
  if (robot.type !== "transportRobot") {
    return { type: "notExecutable", reason: "unsupportedMvpAction" };
  }
  const request = getAssignedRequest(state, robot.id);
  if (!request || !request.from) {
    return { type: "notExecutable", reason: "unsupportedMvpTarget" };
  }

  const plannedTask: LogisticsTask = {
    id: createRobotTaskId(robot.id, "logistics", state),
    type: "logistics",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    requestId: request.id,
    phase: "moveToPickup",
    path: [],
    movementState: { blockedByRobotTicks: 0 },
  };
  return { type: "executable", action, plannedTask };
}

// Von logisticsTask.ts genutzte Helfer:
export {
  endpointCoord,
  endpointAvailable,
  endpointHasCapacity,
  takeFromEndpoint,
  deliverToEndpoint,
};
