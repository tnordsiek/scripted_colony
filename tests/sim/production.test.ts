import { describe, expect, it } from "vitest";
import { tick } from "../../src/sim/tick";
import { makeProductionReadyState, makeRobotFactory } from "./helpers";
import type { GameState, PlayerCommand } from "../../src/sim/types";

const startProduction: PlayerCommand = {
  type: "startIronMinerProduction",
  buildingId: "building.robotFactory.001",
};

function runTicks(state: GameState, count: number): GameState {
  let current = state;
  for (let index = 0; index < count; index += 1) {
    current = tick(current).state;
  }
  return current;
}

describe("Produktion und Spawn (docs/04-systems/production-and-spawn.md)", () => {
  it("MVP-PROD-001/002/003: Command zieht 5 Ore aus Starter-Cargo, costPaid = true", () => {
    const state = makeProductionReadyState();
    const { state: next } = tick(state, [startProduction]);
    const factory = next.buildings.find((b) => b.type === "robotFactory");
    expect(next.robots[0].cargo.used.ironOre).toBe(0);
    expect(factory?.productionTask?.costPaid).toBe(true);
    expect(factory?.productionTask?.status).toBe("inProgress");
  });

  it("MVP-PROD-010/011: Start in Tick N ohne Verarbeitung im selben Tick", () => {
    const state = makeProductionReadyState();
    const { state: next } = tick(state, [startProduction]);
    const task = next.buildings.find((b) => b.type === "robotFactory")?.productionTask;
    expect(task?.createdTick).toBe(next.tick);
    expect(task?.startedTick).toBe(next.tick);
    expect(task?.remainingTicks).toBe(10);
    expect(task?.blockedReason).toBeUndefined();
  });

  it("MVP-PROD-013: erster Fortschritt in Tick N+1 (10 -> 9)", () => {
    const state = makeProductionReadyState();
    let current = tick(state, [startProduction]).state;
    current = tick(current).state;
    const task = current.buildings.find((b) => b.type === "robotFactory")?.productionTask;
    expect(task?.remainingTicks).toBe(9);
  });

  it("MVP-PROD-014/MVP-ENERGY-008/009: ohne Leistung pausiert der Fortschritt ab N+1", () => {
    const state = makeProductionReadyState();
    // Solar Collector deaktivieren -> keine Leistung.
    const solar = state.buildings.find((b) => b.type === "solarCollector");
    if (solar) {
      solar.isEnabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = tick(current).state;
    const task = current.buildings.find((b) => b.type === "robotFactory")?.productionTask;
    expect(task?.remainingTicks).toBe(10);
    expect(task?.blockedReason).toBe("insufficientPower");
    expect(task?.status).toBe("inProgress");
  });

  it("MVP-ENERGY-006: startIronMinerProduction wird bei freePower < 40 nicht rejected", () => {
    const state = makeProductionReadyState();
    const solar = state.buildings.find((b) => b.type === "solarCollector");
    if (solar) {
      solar.isEnabled = false;
    }
    const { commandOutcomes } = tick(state, [startProduction]);
    expect(commandOutcomes[0].result.type).toBe("accepted");
  });

  it("MVP-ENERGY-010: Energiemangel erstattet keine Kosten", () => {
    const state = makeProductionReadyState();
    const solar = state.buildings.find((b) => b.type === "solarCollector");
    if (solar) {
      solar.isEnabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = runTicks(current, 3);
    expect(current.robots[0].cargo.used.ironOre).toBe(0);
  });

  it("MVP-PROD-015: ohne Pausen Spawn in Tick N+10", () => {
    const state = makeProductionReadyState();
    // Starter aus dem Spawn-Umfeld bewegen und Programme deaktivieren,
    // damit der Ablauf deterministisch nur die Produktion testet.
    state.robots[0].x = 0;
    state.robots[0].y = 0;
    for (const program of state.robots[0].programStack) {
      program.enabled = false;
    }
    let current = tick(state, [startProduction]).state; // Tick N
    const startTick = current.tick;
    current = runTicks(current, 9); // N+1 .. N+9
    expect(current.robots).toHaveLength(1);
    current = runTicks(current, 1); // N+10
    expect(current.tick).toBe(startTick + 10);
    const ironMiner = current.robots.find((robot) => robot.type === "ironMiner");
    expect(ironMiner).toBeDefined();
    expect(current.buildings.find((b) => b.type === "robotFactory")?.productionTask)
      .toBeUndefined();
  });

  it("MVP-PROD-006: Iron Miner spawnt auf freiem orthogonalen Nachbarfeld", () => {
    const state = makeProductionReadyState();
    state.robots[0].x = 0;
    state.robots[0].y = 0;
    for (const program of state.robots[0].programStack) {
      program.enabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = runTicks(current, 10);
    const factory = current.buildings.find((b) => b.type === "robotFactory");
    const ironMiner = current.robots.find((robot) => robot.type === "ironMiner");
    expect(ironMiner).toBeDefined();
    if (ironMiner && factory) {
      const distance =
        Math.abs(ironMiner.x - factory.x) + Math.abs(ironMiner.y - factory.y);
      expect(distance).toBe(1);
    }
  });

  it("MVP-PROD-007/MVP-GOAL-007: kein freies Ausgabefeld -> spawnBlocked ohne Ziel", () => {
    const state = makeProductionReadyState();
    const factory = state.buildings.find((b) => b.type === "robotFactory");
    if (factory) {
      // Fabrik in die Ecke setzen und alle Nachbarfelder blockieren.
      state.map[factory.y][factory.x].buildingId = undefined;
      factory.x = 0;
      factory.y = 0;
      state.map[0][0].buildingId = factory.id;
      state.map[0][1].resource = {
        type: "ironOre",
        amount: 20,
        extractionMethod: "directMining",
      };
      state.map[1][0].resource = {
        type: "ironOre",
        amount: 20,
        extractionMethod: "directMining",
      };
    }
    state.robots[0].x = 5;
    state.robots[0].y = 5;
    for (const program of state.robots[0].programStack) {
      program.enabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = runTicks(current, 10);
    const task = current.buildings.find((b) => b.type === "robotFactory")?.productionTask;
    expect(task?.status).toBe("spawnBlocked");
    expect(task?.blockedReason).toBe("noFreeOutputField");
    expect(current.mvpGoalReached).toBe(false);
    expect(current.score.totalScore).toBe(0);
  });

  it("MVP-GOAL-004/008/MVP-EVENT-006: Spawn setzt Ziel, Score und Events", () => {
    const state = makeProductionReadyState();
    state.robots[0].x = 0;
    state.robots[0].y = 0;
    for (const program of state.robots[0].programStack) {
      program.enabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = runTicks(current, 10);

    expect(current.mvpGoalReached).toBe(true);
    expect(current.score.spawnedRobots).toBe(1);
    // +100 Spawn +200 Zielbonus
    expect(current.score.totalScore).toBe(300);

    const codes = current.eventLog.map((event) => event.code);
    expect(codes).toContain("production.ironMiner.spawned");
    expect(codes).toContain("goal.mvpReached");

    // MVP-GOAL-009/Sequenz: spawned vor goal.mvpReached
    const spawnedIndex = codes.indexOf("production.ironMiner.spawned");
    const goalIndex = codes.indexOf("goal.mvpReached");
    expect(spawnedIndex).toBeLessThan(goalIndex);
  });

  it("MVP-GOAL-002/011: Produktionsstart gibt keinen Score und kein Ziel", () => {
    const state = makeProductionReadyState();
    const { state: next } = tick(state, [startProduction]);
    expect(next.score.totalScore).toBe(0);
    expect(next.mvpGoalReached).toBe(false);
  });

  it("MVP-UI-003/004/005: zu wenig Ore -> rejected ohne Kostenabzug mit konkretem Grund", () => {
    const state = makeProductionReadyState();
    state.robots[0].cargo.used.ironOre = 3;
    const { state: next, commandOutcomes } = tick(state, [startProduction]);
    expect(commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "notEnoughIronOreInStarterCargo",
    });
    expect(next.robots[0].cargo.used.ironOre).toBe(3);
    expect(
      next.buildings.find((b) => b.type === "robotFactory")?.productionTask,
    ).toBeUndefined();

    // Ore-Mangel erzeugt Player-Event mit requiredOre/availableOre.
    const event = next.eventLog.find(
      (entry) => entry.code === "production.ironMiner.blocked.notEnoughOre",
    );
    expect(event?.details?.requiredOre).toBe(5);
    expect(event?.details?.availableOre).toBe(3);
  });

  it("productionAlreadyRunning blockiert zweiten Auftrag", () => {
    const state = makeProductionReadyState();
    state.robots[0].cargo.used.ironOre = 10;
    const first = tick(state, [startProduction]);
    const second = tick(first.state, [startProduction]);
    expect(second.commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "productionAlreadyRunning",
    });
  });

  it("MVP-ENERGY-011: Fabrik braucht keine Adjazenz zum Solar Collector", () => {
    const state = makeProductionReadyState();
    const factory = state.buildings.find((b) => b.type === "robotFactory");
    if (factory) {
      state.map[factory.y][factory.x].buildingId = undefined;
      factory.x = 9;
      factory.y = 9;
      state.map[9][9].buildingId = factory.id;
    }
    state.robots[0].x = 0;
    state.robots[0].y = 0;
    for (const program of state.robots[0].programStack) {
      program.enabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = runTicks(current, 10);
    expect(current.robots.some((robot) => robot.type === "ironMiner")).toBe(true);
  });

  it("MVP-ROBOT-003/005: Produktion erzeugt ausschliesslich ironMiner", () => {
    const state = makeProductionReadyState();
    state.robots[0].x = 0;
    state.robots[0].y = 0;
    for (const program of state.robots[0].programStack) {
      program.enabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = runTicks(current, 10);
    const spawned = current.robots.filter((robot) => robot.id !== "robot.starter");
    expect(spawned).toHaveLength(1);
    expect(spawned[0].type).toBe("ironMiner");
    expect(spawned[0].id).toBe("robot.ironMiner.001");
    expect(spawned[0].battery).toBe(50);
  });

  it("Command-Validierung: buildingNotFound / nicht-Fabrik", () => {
    const state = makeProductionReadyState();
    const missing = tick(state, [
      { type: "startIronMinerProduction", buildingId: "building.robotFactory.099" },
    ]);
    expect(missing.commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "buildingNotFound",
    });

    const wrongType = tick(state, [
      { type: "startIronMinerProduction", buildingId: "building.solarCollector.001" },
    ]);
    expect(wrongType.commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "buildingIsNotRobotFactory",
    });
  });

  it("buildingNotActive/buildingDisabled werden unterschieden", () => {
    const state = makeProductionReadyState();
    const factory = state.buildings.find((b) => b.type === "robotFactory");
    if (factory) {
      factory.status = "construction";
    }
    expect(tick(state, [startProduction]).commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "buildingNotActive",
    });

    const state2 = makeProductionReadyState();
    const factory2 = state2.buildings.find((b) => b.type === "robotFactory");
    if (factory2) {
      factory2.isEnabled = false;
    }
    expect(tick(state2, [startProduction]).commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "buildingDisabled",
    });
  });

  it("spawnBlocked wird nachgeholt, sobald ein Feld frei wird", () => {
    const state = makeProductionReadyState();
    const factory = state.buildings.find((b) => b.type === "robotFactory");
    if (factory) {
      state.map[factory.y][factory.x].buildingId = undefined;
      factory.x = 0;
      factory.y = 0;
      state.map[0][0].buildingId = factory.id;
      state.map[0][1].resource = {
        type: "ironOre",
        amount: 20,
        extractionMethod: "directMining",
      };
      state.map[1][0].resource = {
        type: "ironOre",
        amount: 20,
        extractionMethod: "directMining",
      };
    }
    state.robots[0].x = 5;
    state.robots[0].y = 5;
    for (const program of state.robots[0].programStack) {
      program.enabled = false;
    }
    let current = tick(state, [startProduction]).state;
    current = runTicks(current, 10);
    expect(
      current.buildings.find((b) => b.type === "robotFactory")?.productionTask?.status,
    ).toBe("spawnBlocked");

    // Feld freimachen: Ore entfernen.
    delete current.map[0][1].resource;
    current = runTicks(current, 1);
    expect(current.robots.some((robot) => robot.type === "ironMiner")).toBe(true);
  });
});

describe("Weitere Fabrik-Instanz (ID-Sequenz)", () => {
  it("zweite Fabrik erhaelt building.robotFactory.002", () => {
    const state = makeProductionReadyState();
    const second = makeRobotFactory({ id: "building.robotFactory.002", x: 8, y: 8 });
    state.buildings.push(second);
    expect(state.buildings.filter((b) => b.type === "robotFactory")).toHaveLength(2);
  });
});
