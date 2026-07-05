import { describe, expect, it } from "vitest";
import {
  createBuildingId,
  createGameEventId,
  createProductionTaskId,
  createRobotTaskId,
  createSpawnedRobotId,
} from "../../src/sim/ids";
import type { Building, GameState, Robot } from "../../src/sim/types";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    tick: 0,
    randomSeed: "mvp-default",
    isPaused: false,
    speed: 1,
    map: [],
    robots: [],
    buildings: [],
    selected: null,
    eventLog: [],
    score: {
      minedIronOre: 0,
      builtSolarCollectors: 0,
      builtRobotFactories: 0,
      builtBuildings: 0,
      spawnedRobots: 0,
      elapsedTicks: 0,
      goalBonusAwarded: false,
      totalScore: 0,
    },
    mvpGoalReached: false,
    materialRequests: [],
    ...overrides,
  };
}

function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: "building.solarCollector.001",
    type: "solarCollector",
    tier: 1,
    x: 4,
    y: 4,
    hp: { current: 100, max: 100 },
    status: "active",
    isEnabled: true,
    sightRange: 2,
    ...overrides,
  };
}

function makeRobot(overrides: Partial<Robot> = {}): Robot {
  return {
    id: "robot.starter",
    name: "Starter",
    type: "starterRobot",
    tier: 0,
    role: "allrounder",
    movementType: "ground",
    communicationMode: "autonomous",
    communicationStatus: "connected",
    x: 5,
    y: 5,
    hp: { current: 100, max: 100 },
    battery: 100,
    batteryMax: 100,
    chargingMode: "selfCharging",
    cargo: { used: {}, capacity: 10 },
    sightRange: 2,
    status: "active",
    programStack: [],
    ...overrides,
  };
}

describe("Deterministische IDs (docs/03-technical/deterministic-id-generation.md)", () => {
  it("MVP-V82-003: BuildingIds folgen building.<type>.<seq3>", () => {
    const empty = makeState();
    expect(createBuildingId("solarCollector", empty)).toBe("building.solarCollector.001");
    expect(createBuildingId("robotFactory", empty)).toBe("building.robotFactory.001");

    const withSolar = makeState({ buildings: [makeBuilding()] });
    expect(createBuildingId("solarCollector", withSolar)).toBe("building.solarCollector.002");
    expect(createBuildingId("robotFactory", withSolar)).toBe("building.robotFactory.001");
  });

  it("MVP-V82-004: ProductionTaskIds folgen production.ironMiner.<buildingId>.<seq3>", () => {
    const state = makeState();
    expect(
      createProductionTaskId("building.robotFactory.001", "ironMiner", state),
    ).toBe("production.ironMiner.building.robotFactory.001.001");

    const withSpawned = makeState({
      robots: [makeRobot({ id: "robot.ironMiner.001", type: "ironMiner", tier: 1 })],
    });
    expect(
      createProductionTaskId("building.robotFactory.001", "ironMiner", withSpawned),
    ).toBe("production.ironMiner.building.robotFactory.001.002");
  });

  it("MVP-V82-005: gespawnte RobotIds folgen robot.ironMiner.<seq3>", () => {
    const state = makeState({ robots: [makeRobot()] });
    expect(createSpawnedRobotId("ironMiner", state)).toBe("robot.ironMiner.001");

    const withOne = makeState({
      robots: [
        makeRobot(),
        makeRobot({ id: "robot.ironMiner.001", type: "ironMiner", tier: 1 }),
      ],
    });
    expect(createSpawnedRobotId("ironMiner", withOne)).toBe("robot.ironMiner.002");
  });

  it("MVP-V82-006: RobotTaskIds folgen task.<robotId>.<tick6>.<taskType>.<seq2>", () => {
    const state = makeState({ tick: 12 });
    expect(createRobotTaskId("robot.starter", "movement", state)).toBe(
      "task.robot.starter.000012.movement.01",
    );
    expect(createRobotTaskId("robot.starter", "building", makeState({ tick: 27 }))).toBe(
      "task.robot.starter.000027.building.01",
    );
  });

  it("GameEventIds folgen event.<tick6>.<seq3>.<code>", () => {
    expect(createGameEventId(12, 1, "action.build.started")).toBe(
      "event.000012.001.action.build.started",
    );
    expect(createGameEventId(22, 2, "production.ironMiner.spawned")).toBe(
      "event.000022.002.production.ironMiner.spawned",
    );
  });
});
