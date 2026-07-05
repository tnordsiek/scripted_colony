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
  robotType: "ironMiner",
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
  robotType: "ironMiner",
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

export function createGameEventId(
  tick: Tick,
  sequenceInTick: number,
  code: GameEventCode,
): GameEventId {
  return `event.${pad(tick, 6)}.${pad(sequenceInTick, 3)}.${code}`;
}
