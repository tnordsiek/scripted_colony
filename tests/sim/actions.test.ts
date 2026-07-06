import { describe, expect, it } from "vitest";
import { canExecuteAction } from "../../src/sim/actions/canExecuteAction";
import { createInitialGame } from "../../src/sim/createInitialGame";
import { makeSolarCollector } from "./helpers";
import type { GameState, MiningTask, ProgramAction } from "../../src/sim/types";

function state(): GameState {
  return createInitialGame("mvp-default");
}

function starter(gameState: GameState) {
  return gameState.robots[0];
}

const scoutAction: ProgramAction = {
  actionId: "action.scoutNearby",
  parameters: { targetFieldType: { type: "fieldType", value: "ironOre" } },
};

const mineAction: ProgramAction = {
  actionId: "action.mineResource",
  parameters: { resourceType: "ironOre" },
};

const buildSolarAction: ProgramAction = {
  actionId: "action.buildBuilding",
  parameters: { buildingType: "solarCollector" },
};

describe("canExecuteAction (docs/03-technical/action-executability-matrix.md)", () => {
  it("MVP-ACTION-001: scoutNearby ohne Parameter -> missingParameter", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), {
      actionId: "action.scoutNearby",
      parameters: {},
    });
    expect(result).toMatchObject({ type: "notExecutable", reason: "missingParameter" });
  });

  it("MVP-ACTION-002: mineResource ohne Parameter -> missingParameter", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), {
      actionId: "action.mineResource",
      parameters: {},
    });
    expect(result).toMatchObject({ type: "notExecutable", reason: "missingParameter" });
  });

  it("MVP-ACTION-003: buildBuilding ohne Parameter -> missingParameter", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), {
      actionId: "action.buildBuilding",
      parameters: {},
    });
    expect(result).toMatchObject({ type: "notExecutable", reason: "missingParameter" });
  });

  it("MVP-ACTION-004: notExecutable mutiert keinen State", () => {
    const s = state();
    const before = JSON.stringify(s);
    canExecuteAction(s, starter(s), { actionId: "action.mineResource", parameters: {} });
    expect(JSON.stringify(s)).toBe(before);
  });

  it("MVP-ACTION-005: taskAlreadyRunning verhindert neue Aktion", () => {
    const s = state();
    const robot = starter(s);
    const runningTask: MiningTask = {
      id: "task.robot.starter.000000.mining.01",
      type: "mining",
      status: "running",
      sourceProgramId: "program.starter.mineIronOre",
      sourceRowId: "row.starter.mineIronOre.main",
      startedTick: 0,
      resourceType: "ironOre",
      target: { x: 5, y: 4 },
      totalTicks: 10,
      remainingTicks: 10,
      minedAmount: 0,
      batteryCostOnSuccess: 1,
    };
    robot.activeTask = runningTask;
    const result = canExecuteAction(s, robot, scoutAction);
    expect(result).toMatchObject({ type: "notExecutable", reason: "taskAlreadyRunning" });
  });

  it("MVP-ACTION-006: nicht unterstuetzter MVP-Zieltyp -> unsupportedMvpTarget", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), {
      actionId: "action.mineResource",
      parameters: { resourceType: "gas" },
    });
    expect(result).toMatchObject({ type: "notExecutable", reason: "unsupportedMvpTarget" });
  });

  it("MVP-ACTION-007: Roboter in Stasis -> normale Aktionen nicht ausfuehrbar", () => {
    const s = state();
    const robot = starter(s);
    robot.status = "stasis";
    const result = canExecuteAction(s, robot, scoutAction);
    expect(result).toMatchObject({ type: "notExecutable", reason: "robotInStasis" });
  });

  it("MVP-ACTION-008: battery <= 1 blockiert Nicht-Stasis-Aktionen", () => {
    const s = state();
    const robot = starter(s);
    robot.battery = 1;
    const result = canExecuteAction(s, robot, scoutAction);
    expect(result).toMatchObject({ type: "notExecutable", reason: "batteryTooLow" });
  });

  it("MVP-V88-003: action.charge erzeugt keinen Task", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), {
      actionId: "action.charge",
      parameters: {},
    });
    expect(result).toMatchObject({ type: "notExecutable", reason: "unsupportedMvpAction" });
  });

  it("MVP-SCOUT-001/003: scoutNearby ist mit ironOre-Ziel ausfuehrbar und plant Movement", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), scoutAction, "p", "r");
    expect(result.type).toBe("executable");
    if (result.type === "executable") {
      expect(result.plannedTask?.type).toBe("movement");
    }
  });

  it("MVP-MINE-002: kein angrenzendes Ore -> noAdjacentResource", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), mineAction);
    expect(result).toMatchObject({ type: "notExecutable", reason: "noAdjacentResource" });
  });

  it("MVP-MINE-003: volles Cargo -> cargoFull", () => {
    const s = state();
    const robot = starter(s);
    robot.cargo.used.ironOre = 10;
    // angrenzendes Ore vorhanden machen
    s.map[4][5].resource = { type: "ironOre", amount: 20, extractionMethod: "directMining" };
    const result = canExecuteAction(s, robot, mineAction);
    expect(result).toMatchObject({ type: "notExecutable", reason: "cargoFull" });
  });

  it("MVP-MINE-001: mit angrenzendem Ore ausfuehrbar, plant MiningTask", () => {
    const s = state();
    s.map[4][5].resource = { type: "ironOre", amount: 20, extractionMethod: "directMining" };
    const result = canExecuteAction(s, starter(s), mineAction, "p", "r");
    expect(result.type).toBe("executable");
    if (result.type === "executable") {
      expect(result.plannedTask?.type).toBe("mining");
    }
  });

  it("MVP-BUILD: newConstruction erfordert Cargo-Ressourcen", () => {
    const s = state();
    const result = canExecuteAction(s, starter(s), buildSolarAction);
    expect(result).toMatchObject({ type: "notExecutable", reason: "notEnoughResources" });
  });

  it("MVP-BUILD-002: Roboterfabrik erfordert aktiven Solar Collector", () => {
    const s = state();
    starter(s).cargo.used.ironOre = 5;
    const result = canExecuteAction(s, starter(s), {
      actionId: "action.buildBuilding",
      parameters: { buildingType: "robotFactory" },
    });
    expect(result).toMatchObject({
      type: "notExecutable",
      reason: "noActiveSolarCollector",
    });
  });

  it("MVP-BUILD-001: Solar Collector mit Cargo ausfuehrbar (nearBuilder)", () => {
    const s = state();
    starter(s).cargo.used.ironOre = 5;
    const result = canExecuteAction(s, starter(s), buildSolarAction, "p", "r");
    expect(result.type).toBe("executable");
  });

  it("MVP-BUILD-003/004: Ressourcenfeld und Gebaeudefeld sind keine Bauplaetze", () => {
    const s = state();
    starter(s).cargo.used.ironOre = 5;
    const solar = makeSolarCollector({ x: 4, y: 5 });
    s.buildings.push(solar);
    s.map[5][4].buildingId = solar.id;
    s.map[5][6].resource = { type: "ironOre", amount: 20, extractionMethod: "directMining" };
    const result = canExecuteAction(s, starter(s), {
      actionId: "action.buildBuilding",
      parameters: { buildingType: "robotFactory" },
    }, "p", "r");
    expect(result.type).toBe("executable");
    if (result.type === "executable" && result.plannedTask?.type === "building") {
      const site = result.plannedTask.site;
      expect(site).not.toEqual({ x: 4, y: 5 });
      expect(site).not.toEqual({ x: 6, y: 5 });
    }
  });

  it("MVP-STASIS-001: Stasis-Laden startet nur bei battery <= 1", () => {
    const s = state();
    const robot = starter(s);
    const stasisAction: ProgramAction = { actionId: "action.stasisCharge", parameters: {} };

    expect(canExecuteAction(s, robot, stasisAction)).toMatchObject({
      type: "notExecutable",
      reason: "batteryTooLow",
    });

    robot.battery = 1;
    const result = canExecuteAction(s, robot, stasisAction, "p", "r");
    expect(result.type).toBe("executable");
    if (result.type === "executable") {
      expect(result.plannedTask?.type).toBe("stasisCharging");
    }
  });

  it("Stasis-Laden blockiert bei chargingMode externalOnly", () => {
    const s = state();
    const robot = starter(s);
    robot.battery = 1;
    robot.chargingMode = "externalOnly";
    const result = canExecuteAction(s, robot, {
      actionId: "action.stasisCharge",
      parameters: {},
    });
    expect(result.type).toBe("notExecutable");
  });
});
