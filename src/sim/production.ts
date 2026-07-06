// ProductionTask-Verarbeitung und Spawn nach docs/04-systems/production-and-spawn.md
// und docs/03-technical/tick-pipeline.md (Schritte 3 und 4).
import {
  EXP1_STEEL_RECIPE_OUTPUT_STEEL_PLATES,
  MVP_IRON_MINER_BATTERY,
  MVP_IRON_MINER_BATTERY_MAX,
  MVP_IRON_MINER_CARGO_CAPACITY,
  MVP_IRON_MINER_HP,
  MVP_IRON_MINER_HP_MAX,
  MVP_IRON_MINER_SIGHT_RANGE,
} from "./constants";
import { createSpawnedRobotId } from "./ids";
import { getOrthogonalNeighbors, isFieldPassable, isInsideMap } from "./pathfinding";
import { createSeededRng, makeRngInput, sortFieldCoords } from "./rng";
import type { Building, FieldCoord, GameState, Robot } from "./types";

export type ProductionTickResult = {
  pausedTaskIds: string[];
  readyTaskIds: string[];
};

// Schritt 3: nur fortschrittsberechtigte Tasks (inProgress, startedTick < currentTick).
// grantedPower kommt aus der Energie-Zuteilung (allocateEnergyTick).
export function processProductionTasks(
  state: GameState,
  grantedPower: Set<string>,
): ProductionTickResult {
  const result: ProductionTickResult = { pausedTaskIds: [], readyTaskIds: [] };

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
      grantedPower.has(`production:${task.id}`);

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

export type SteelTickResult = {
  pausedTaskIds: string[];
  outputBlockedTaskIds: string[];
  completed: Array<{ taskId: string; buildingId: string }>;
};

// Expansion 1: Stahlwerk-Verarbeitung (docs/02-mvp/expansion-1-scope.md).
// Output geht in das Startroboter-Cargo; bei vollem Cargo outputBlocked.
export function processSteelTasks(
  state: GameState,
  grantedPower: Set<string>,
): SteelTickResult {
  const result: SteelTickResult = {
    pausedTaskIds: [],
    outputBlockedTaskIds: [],
    completed: [],
  };

  const steelworks = [...state.buildings]
    .filter((building) => building.steelProductionTask)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const starter = state.robots.find((robot) => robot.type === "starterRobot");

  for (const building of steelworks) {
    const task = building.steelProductionTask;
    if (!task || task.startedTick >= state.tick) {
      continue;
    }

    const tryDeliverOutput = (): boolean => {
      if (!starter) {
        return false;
      }
      const cargoUsed = Object.values(starter.cargo.used).reduce(
        (sum, amount) => sum + (amount ?? 0),
        0,
      );
      if (cargoUsed >= starter.cargo.capacity) {
        return false;
      }
      starter.cargo.used.steelPlates =
        (starter.cargo.used.steelPlates ?? 0) + EXP1_STEEL_RECIPE_OUTPUT_STEEL_PLATES;
      return true;
    };

    if (task.status === "outputBlocked") {
      // Nachholen, sobald Cargo-Platz frei ist.
      if (tryDeliverOutput()) {
        task.completedTick = state.tick;
        building.steelProductionTask = undefined;
        incrementSteelCounter(building);
        result.completed.push({ taskId: task.id, buildingId: building.id });
      } else {
        result.outputBlockedTaskIds.push(task.id);
      }
      continue;
    }

    const enoughPower =
      building.status === "active" &&
      building.isEnabled &&
      grantedPower.has(`steel:${task.id}`);

    if (!enoughPower) {
      task.blockedReason = "insufficientPower";
      result.pausedTaskIds.push(task.id);
      continue;
    }

    task.blockedReason = undefined;
    task.remainingTicks -= 1;
    if (task.remainingTicks > 0) {
      continue;
    }

    if (tryDeliverOutput()) {
      task.completedTick = state.tick;
      building.steelProductionTask = undefined;
      incrementSteelCounter(building);
      result.completed.push({ taskId: task.id, buildingId: building.id });
    } else {
      task.status = "outputBlocked";
      task.blockedReason = "cargoFull";
      result.outputBlockedTaskIds.push(task.id);
    }
  }

  return result;
}

// Lebenszeitzaehler fuer die SteelProductionTaskId-Sequenz
// (deterministic-id-generation.md).
function incrementSteelCounter(building: Building): void {
  if (!building.inventory) {
    building.inventory = {};
  }
  if (!building.inventory.output) {
    building.inventory.output = {};
  }
  building.inventory.output.steelPlates =
    (building.inventory.output.steelPlates ?? 0) + 1;
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
