// Deterministische Runtime-ID-Erzeugung nach docs/03-technical/deterministic-id-generation.md.
// Alle Funktionen sind pure: sie werten nur ihre Parameter aus.
import type {
  ActiveRobotTaskType,
  BuildingId,
  BuildingType,
  GameEventCode,
  GameEventId,
  GameState,
  ProductionTaskId,
  RobotId,
  RobotTaskId,
  Tick,
} from "./types";

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

export function createBuildingId(
  buildingType: BuildingType,
  state: GameState,
): BuildingId {
  const sameTypeCount = state.buildings.filter(
    (building) => building.type === buildingType,
  ).length;
  return `building.${buildingType}.${pad(sameTypeCount + 1, 3)}`;
}

export function createProductionTaskId(
  buildingId: BuildingId,
  robotType: "ironMiner" | "transportRobot",
  state: GameState,
): ProductionTaskId {
  const spawnedIronMiners = state.robots.filter(
    (robot) => robot.type === robotType,
  ).length;
  const activeIronMinerTasks = state.buildings.filter(
    (building) => building.productionTask?.robotType === robotType,
  ).length;
  return `production.${robotType}.${buildingId}.${pad(spawnedIronMiners + activeIronMinerTasks + 1, 3)}`;
}

export function createSpawnedRobotId(
  robotType: "ironMiner" | "transportRobot",
  state: GameState,
): RobotId {
  const sameTypeCount = state.robots.filter(
    (robot) => robot.type === robotType,
  ).length;
  return `robot.${robotType}.${pad(sameTypeCount + 1, 3)}`;
}

export function createRobotTaskId(
  robotId: RobotId,
  taskType: ActiveRobotTaskType,
  state: GameState,
  sequenceInTick = 1,
): RobotTaskId {
  return `task.${robotId}.${pad(state.tick, 6)}.${taskType}.${pad(sequenceInTick, 2)}`;
}

// Expansion 1: production.steelPlates.<buildingId>.<seq3>
// seq3 = bisher produzierte Steel Plates des Gebaeudes (Lebenszeitzaehler
// producedSteelPlates) + aktive Auftraege + 1.
export function createSteelProductionTaskId(
  buildingId: BuildingId,
  state: GameState,
): string {
  const building = state.buildings.find((entry) => entry.id === buildingId);
  const produced = building?.producedSteelPlates ?? 0;
  const activeTasks = building?.steelProductionTask ? 1 : 0;
  return `production.steelPlates.${buildingId}.${pad(produced + activeTasks + 1, 3)}`;
}

export function createGameEventId(
  tick: Tick,
  sequenceInTick: number,
  code: GameEventCode,
): GameEventId {
  return `event.${pad(tick, 6)}.${pad(sequenceInTick, 3)}.${code}`;
}

// Expansion 2: MaterialRequestId nach request.<typ>.<tick6>.<seq2>.
export function createMaterialRequestId(
  requestType: string,
  tick: Tick,
  sequenceInTick: number,
): string {
  return `request.${requestType}.${pad(tick, 6)}.${pad(sequenceInTick, 2)}`;
}
