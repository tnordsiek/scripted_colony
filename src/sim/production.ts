// ProductionTask-Verarbeitung und Spawn nach docs/04-systems/production-and-spawn.md
// und docs/03-technical/tick-pipeline.md (Schritte 3 und 4).
import {
  MVP_IRON_MINER_BATTERY,
  MVP_IRON_MINER_BATTERY_MAX,
  MVP_IRON_MINER_CARGO_CAPACITY,
  MVP_IRON_MINER_HP,
  MVP_IRON_MINER_HP_MAX,
  MVP_IRON_MINER_SIGHT_RANGE,
} from "./constants";
import { computeEnergySnapshot } from "./energy";
import { createSpawnedRobotId } from "./ids";
import { getOrthogonalNeighbors, isFieldPassable, isInsideMap } from "./pathfinding";
import { createSeededRng, makeRngInput, sortFieldCoords } from "./rng";
import type { Building, FieldCoord, GameState, Robot } from "./types";

export type ProductionTickResult = {
  pausedTaskIds: string[];
  readyTaskIds: string[];
};

// Schritt 3: nur fortschrittsberechtigte Tasks (inProgress, startedTick < currentTick).
export function processProductionTasks(state: GameState): ProductionTickResult {
  const result: ProductionTickResult = { pausedTaskIds: [], readyTaskIds: [] };
  const snapshot = computeEnergySnapshot(state);

  const factories = [...state.buildings]
    .filter((building) => building.productionTask)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  for (const factory of factories) {
    const task = factory.productionTask;
    if (!task || task.status !== "inProgress" || task.startedTick >= state.tick) {
      continue;
    }

    const enoughPower =
      factory.status === "active" &&
      factory.isEnabled &&
      snapshot.powerProvided >= snapshot.powerRequired &&
      task.powerRequired <= snapshot.powerProvided - (snapshot.powerRequired - task.powerRequired);

    if (enoughPower) {
      task.remainingTicks -= 1;
      task.blockedReason = undefined;
      if (task.remainingTicks <= 0) {
        task.status = "readyToSpawn";
        task.completedTick = state.tick;
        result.readyTaskIds.push(task.id);
      }
    } else {
      task.blockedReason = "insufficientPower";
      result.pausedTaskIds.push(task.id);
    }
  }

  return result;
}

function createSpawnedIronMiner(state: GameState, spawnField: FieldCoord): Robot {
  return {
    id: createSpawnedRobotId("ironMiner", state),
    name: "Iron Miner",
    type: "ironMiner",
    tier: 1,
    role: "miner",
    movementType: "ground",
    communicationMode: "gridRequired",
    communicationStatus: "connected",
    x: spawnField.x,
    y: spawnField.y,
    hp: { current: MVP_IRON_MINER_HP, max: MVP_IRON_MINER_HP_MAX },
    battery: MVP_IRON_MINER_BATTERY,
    batteryMax: MVP_IRON_MINER_BATTERY_MAX,
    chargingMode: "externalOnly",
    cargo: { used: {}, capacity: MVP_IRON_MINER_CARGO_CAPACITY },
    sightRange: MVP_IRON_MINER_SIGHT_RANGE,
    status: "active",
    activeTask: undefined,
    activeProgram: undefined,
    programStack: [],
  };
}

// Gueltiges Ausgabefeld: orthogonal angrenzend, frei, passierbar, kein Roboter.
function findSpawnField(state: GameState, factory: Building, taskId: string): FieldCoord | null {
  const candidates = sortFieldCoords(
    getOrthogonalNeighbors({ x: factory.x, y: factory.y }).filter((coord) => {
      if (!isInsideMap(state.map, coord)) {
        return false;
      }
      if (!isFieldPassable(state.map[coord.y][coord.x])) {
        return false;
      }
      if (state.robots.some((robot) => robot.x === coord.x && robot.y === coord.y)) {
        return false;
      }
      return true;
    }),
  );

  if (candidates.length === 0) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  // Tie-Break: seeded random, Kontext spawnSite (docs/03-technical/seeded-rng.md).
  const rng = createSeededRng(
    makeRngInput([state.randomSeed, "tie", state.tick, "spawnSite", taskId, "ironMiner"]),
  );
  return candidates[rng.pickIndex(candidates.length)];
}

export type SpawnResult = {
  spawned: Array<{ robotId: string; buildingId: string; taskId: string }>;
  blocked: Array<{ buildingId: string; taskId: string }>;
};

// Schritt 4: Spawn-Pruefungen fuer readyToSpawn/spawnBlocked-Tasks.
export function processSpawnChecks(state: GameState): SpawnResult {
  const result: SpawnResult = { spawned: [], blocked: [] };

  const factories = [...state.buildings]
    .filter(
      (building) =>
        building.productionTask &&
        (building.productionTask.status === "readyToSpawn" ||
          building.productionTask.status === "spawnBlocked") &&
        building.productionTask.remainingTicks <= 0,
    )
    .sort((a, b) => {
      const taskA = a.productionTask?.id ?? "";
      const taskB = b.productionTask?.id ?? "";
      return taskA < taskB ? -1 : taskA > taskB ? 1 : 0;
    });

  for (const factory of factories) {
    const task = factory.productionTask;
    if (!task) {
      continue;
    }

    const spawnField = findSpawnField(state, factory, task.id);
    if (!spawnField) {
      task.status = "spawnBlocked";
      task.blockedReason = "noFreeOutputField";
      result.blocked.push({ buildingId: factory.id, taskId: task.id });
      continue;
    }

    const ironMiner = createSpawnedIronMiner(state, spawnField);
    state.robots.push(ironMiner);
    factory.productionTask = undefined;
    result.spawned.push({
      robotId: ironMiner.id,
      buildingId: factory.id,
      taskId: task.id,
    });
  }

  return result;
}
