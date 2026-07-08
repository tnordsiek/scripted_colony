// ProductionTask-Verarbeitung und Spawn nach docs/04-systems/production-and-spawn.md
// und docs/03-technical/tick-pipeline.md (Schritte 3 und 4).
import {
  EXP1_STEEL_RECIPE_INPUT_IRON_ORE,
  EXP1_STEEL_RECIPE_OUTPUT_STEEL_PLATES,
  EXP1_STEEL_RECIPE_POWER_REQUIRED,
  EXP1_STEEL_RECIPE_TICKS,
  EXP2_STEELWORKS_OUTPUT_CAPACITY,
  EXP2_TRANSPORT_ROBOT_BATTERY,
  EXP2_TRANSPORT_ROBOT_BATTERY_MAX,
  EXP2_TRANSPORT_ROBOT_CARGO_CAPACITY,
  EXP2_TRANSPORT_ROBOT_HP,
  EXP2_TRANSPORT_ROBOT_SIGHT_RANGE,
  MVP_IRON_MINER_BATTERY,
  MVP_IRON_MINER_BATTERY_MAX,
  MVP_IRON_MINER_CARGO_CAPACITY,
  MVP_IRON_MINER_HP,
  MVP_IRON_MINER_HP_MAX,
  MVP_IRON_MINER_SIGHT_RANGE,
} from "./constants";
import { createSpawnedRobotId, createSteelProductionTaskId } from "./ids";
import { inventoryTotal } from "./logistics";
import {
  getOrthogonalNeighbors,
  isFieldPassableInState,
  isInsideMap,
} from "./pathfinding";
import {
  createIronMinerSpawnStack,
  createTransportRobotSpawnStack,
} from "./programs";
import { createSeededRng, makeRngInput, sortFieldCoords } from "./rng";
import type {
  Building,
  FieldCoord,
  GameState,
  ProducibleRobotType,
  Robot,
} from "./types";

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
  autoStartedTaskIds: string[];
};

// Expansion 2: Auto-Modus des Stahlwerks — startet einen Inventar-Task,
// wenn input >= 2 und der Output Platz hat (docs/02-mvp/expansion-2-scope.md).
export function startAutoSteelTasks(state: GameState): string[] {
  const started: string[] = [];
  for (const building of [...state.buildings].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    if (
      building.type !== "steelworks" ||
      building.status !== "active" ||
      !building.isEnabled ||
      building.steelProductionTask
    ) {
      continue;
    }
    const input = building.inventory?.input;
    if ((input?.ironOre ?? 0) < EXP1_STEEL_RECIPE_INPUT_IRON_ORE) {
      continue;
    }
    if (
      inventoryTotal(building.inventory?.output) + EXP1_STEEL_RECIPE_OUTPUT_STEEL_PLATES >
      EXP2_STEELWORKS_OUTPUT_CAPACITY
    ) {
      continue;
    }
    // Input beim Start abziehen (Verarbeitungsregel aus building-and-unit-tiers).
    if (input) {
      input.ironOre = (input.ironOre ?? 0) - EXP1_STEEL_RECIPE_INPUT_IRON_ORE;
      if (input.ironOre === 0) {
        delete input.ironOre;
      }
    }
    building.steelProductionTask = {
      id: createSteelProductionTaskId(building.id, state),
      buildingId: building.id,
      source: "inventory",
      cost: { ironOre: EXP1_STEEL_RECIPE_INPUT_IRON_ORE },
      costPaid: true,
      totalTicks: EXP1_STEEL_RECIPE_TICKS,
      remainingTicks: EXP1_STEEL_RECIPE_TICKS,
      powerRequired: EXP1_STEEL_RECIPE_POWER_REQUIRED,
      status: "inProgress",
      createdTick: state.tick,
      startedTick: state.tick,
    };
    started.push(building.steelProductionTask.id);
  }
  return started;
}

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
    autoStartedTaskIds: [],
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
      if (task.source === "inventory") {
        // Expansion 2: Ergebnis geht in das Output-Inventar.
        if (
          inventoryTotal(building.inventory?.output) +
            EXP1_STEEL_RECIPE_OUTPUT_STEEL_PLATES >
          EXP2_STEELWORKS_OUTPUT_CAPACITY
        ) {
          return false;
        }
        building.inventory = building.inventory ?? {};
        building.inventory.output = building.inventory.output ?? {};
        building.inventory.output.steelPlates =
          (building.inventory.output.steelPlates ?? 0) +
          EXP1_STEEL_RECIPE_OUTPUT_STEEL_PLATES;
        return true;
      }
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
// (deterministic-id-generation.md). Kein Inventar: das Output-Inventar ist
// ab Expansion 2 echte Fracht.
function incrementSteelCounter(building: Building): void {
  building.producedSteelPlates = (building.producedSteelPlates ?? 0) + 1;
}

function createSpawnedRobot(
  state: GameState,
  robotType: ProducibleRobotType,
  spawnField: FieldCoord,
): Robot {
  const id = createSpawnedRobotId(robotType, state);
  if (robotType === "transportRobot") {
    return {
      id,
      name: "Transporter",
      type: "transportRobot",
      tier: 2,
      role: "transport",
      movementType: "ground",
      communicationMode: "gridRequired",
      communicationStatus: "connected",
      x: spawnField.x,
      y: spawnField.y,
      hp: { current: EXP2_TRANSPORT_ROBOT_HP, max: EXP2_TRANSPORT_ROBOT_HP },
      battery: EXP2_TRANSPORT_ROBOT_BATTERY,
      batteryMax: EXP2_TRANSPORT_ROBOT_BATTERY_MAX,
      chargingMode: "externalOnly",
      cargo: { used: {}, capacity: EXP2_TRANSPORT_ROBOT_CARGO_CAPACITY },
      sightRange: EXP2_TRANSPORT_ROBOT_SIGHT_RANGE,
      status: "active",
      activeTask: undefined,
      activeProgram: undefined,
      programStack: createTransportRobotSpawnStack(id),
    };
  }
  return {
    id,
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
    // Expansion 2: Iron Miner wird aktiv (docs/02-mvp/expansion-2-scope.md).
    programStack: createIronMinerSpawnStack(id),
  };
}

// Gueltiges Ausgabefeld: orthogonal angrenzend, frei, passierbar, kein Roboter.
function findSpawnField(
  state: GameState,
  factory: Building,
  taskId: string,
  robotType: ProducibleRobotType,
): FieldCoord | null {
  const candidates = sortFieldCoords(
    getOrthogonalNeighbors({ x: factory.x, y: factory.y }).filter((coord) => {
      if (!isInsideMap(state.map, coord)) {
        return false;
      }
      if (!isFieldPassableInState(state, state.map[coord.y][coord.x])) {
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
    makeRngInput([state.randomSeed, "tie", state.tick, "spawnSite", taskId, robotType]),
  );
  return candidates[rng.pickIndex(candidates.length)];
}

export type SpawnResult = {
  spawned: Array<{
    robotId: string;
    buildingId: string;
    taskId: string;
    robotType: ProducibleRobotType;
  }>;
  blocked: Array<{ buildingId: string; taskId: string; robotType: ProducibleRobotType }>;
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

    const spawnField = findSpawnField(state, factory, task.id, task.robotType);
    if (!spawnField) {
      task.status = "spawnBlocked";
      task.blockedReason = "noFreeOutputField";
      result.blocked.push({
        buildingId: factory.id,
        taskId: task.id,
        robotType: task.robotType,
      });
      continue;
    }

    const spawned = createSpawnedRobot(state, task.robotType, spawnField);
    state.robots.push(spawned);
    factory.productionTask = undefined;
    result.spawned.push({
      robotId: spawned.id,
      buildingId: factory.id,
      taskId: task.id,
      robotType: task.robotType,
    });
  }

  return result;
}
