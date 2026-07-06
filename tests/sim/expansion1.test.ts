// Expansion-1-Tests nach docs/02-mvp/mvp-test-matrix.md (EXP1-Serie).
import { describe, expect, it } from "vitest";
import { createInitialGame } from "../../src/sim/createInitialGame";
import { tick } from "../../src/sim/tick";
import { makeSolarCollector } from "./helpers";
import type { Building, GameState, PlayerCommand } from "../../src/sim/types";

function makeResearchCenter(overrides: Partial<Building> = {}): Building {
  return {
    id: "building.aiResearchCenter.001",
    type: "aiResearchCenter",
    tier: 1,
    x: 3,
    y: 4,
    hp: { current: 150, max: 150 },
    status: "active",
    isEnabled: true,
    sightRange: 2,
    ...overrides,
  };
}

function makeSteelworks(overrides: Partial<Building> = {}): Building {
  return {
    id: "building.steelworks.001",
    type: "steelworks",
    tier: 2,
    x: 6,
    y: 4,
    hp: { current: 180, max: 180 },
    status: "active",
    isEnabled: true,
    sightRange: 2,
    ...overrides,
  };
}

function makeEnergyStorage(overrides: Partial<Building> = {}): Building {
  return {
    id: "building.energyStorage.001",
    type: "energyStorage",
    tier: 2,
    x: 3,
    y: 6,
    hp: { current: 150, max: 150 },
    status: "active",
    isEnabled: true,
    sightRange: 1,
    storedEnergy: 0,
    ...overrides,
  };
}

// Basiszustand: Solar + Forschungszentrum aktiv, Starter-Programme deaktiviert.
function makeExpansionState(): GameState {
  const state = createInitialGame("mvp-default");
  const solar = makeSolarCollector();
  const center = makeResearchCenter();
  state.buildings.push(solar, center);
  state.map[solar.y][solar.x].buildingId = solar.id;
  state.map[center.y][center.x].buildingId = center.id;
  for (const program of state.robots[0].programStack) {
    program.enabled = false;
  }
  return state;
}

function runTicks(state: GameState, count: number): GameState {
  let current = state;
  for (let index = 0; index < count; index += 1) {
    current = tick(current).state;
  }
  return current;
}

describe("EXP1-RES: Forschung", () => {
  it("EXP1-RES-006/001: ohne Zentrum researchCenterMissing; unbekanntes Projekt abgelehnt", () => {
    const noCenter = createInitialGame("mvp-default");
    expect(
      tick(noCenter, [
        { type: "selectResearchProject", projectId: "research.metalProcessing1" },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "researchCenterMissing" });

    const state = makeExpansionState();
    expect(
      tick(state, [
        { type: "selectResearchProject", projectId: "research.meleeCombat1" },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "unknownResearchProject" });

    expect(
      tick(state, [
        { type: "selectResearchProject", projectId: "research.energyBuffer1" },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "researchPrerequisiteMissing" });
  });

  it("EXP1-RES-002: aktives Projekt erzeugt 1 Punkt/Tick ab Tick N+1", () => {
    const state = makeExpansionState();
    let current = tick(state, [
      { type: "selectResearchProject", projectId: "research.metalProcessing1" },
    ]).state;
    expect(current.research.progress["research.metalProcessing1"] ?? 0).toBe(0);
    current = runTicks(current, 3);
    expect(current.research.progress["research.metalProcessing1"]).toBe(3);
  });

  it("EXP1-RES-003: Energiemangel pausiert Forschung ohne Punktverlust", () => {
    const state = makeExpansionState();
    const solar = state.buildings.find((b) => b.type === "solarCollector");
    let current = tick(state, [
      { type: "selectResearchProject", projectId: "research.metalProcessing1" },
    ]).state;
    current = runTicks(current, 2);
    expect(current.research.progress["research.metalProcessing1"]).toBe(2);

    const currentSolar = current.buildings.find((b) => b.type === "solarCollector");
    if (currentSolar) {
      currentSolar.isEnabled = false;
    }
    current = runTicks(current, 3);
    expect(current.research.progress["research.metalProcessing1"]).toBe(2);
    expect(
      current.eventLog.some((e) => e.code === "research.paused.insufficientPower"),
    ).toBe(true);
    expect(solar).toBeDefined();
  });

  it("EXP1-RES-004: Projektabschluss aktiviert Unlock und erzeugt research.completed", () => {
    const state = makeExpansionState();
    state.research.activeProjectId = "research.metalProcessing1";
    state.research.activeProjectSelectedTick = 0;
    state.research.progress["research.metalProcessing1"] = 299;
    const current = runTicks(state, 1);
    expect(current.research.completedProjects).toContain("research.metalProcessing1");
    expect(current.research.activeProjectId).toBeUndefined();
    expect(current.eventLog.some((e) => e.code === "research.completed")).toBe(true);
  });

  it("EXP1-RES-005: Projektwechsel erhaelt Fortschritt; completed nicht erneut waehlbar", () => {
    const state = makeExpansionState();
    let current = tick(state, [
      { type: "selectResearchProject", projectId: "research.metalProcessing1" },
    ]).state;
    current = runTicks(current, 5);
    current = tick(current, [
      { type: "selectResearchProject", projectId: "research.energyDistribution1" },
    ]).state;
    current = runTicks(current, 3);
    expect(current.research.progress["research.metalProcessing1"]).toBe(5);
    expect(current.research.progress["research.energyDistribution1"]).toBe(3);

    current.research.completedProjects.push("research.energyDistribution1");
    expect(
      tick(current, [
        { type: "selectResearchProject", projectId: "research.energyDistribution1" },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "researchProjectAlreadyCompleted" });
  });
});

describe("EXP1-STEEL: Stahlwerk", () => {
  function steelState(): GameState {
    const state = makeExpansionState();
    const steelworks = makeSteelworks();
    state.buildings.push(steelworks);
    state.map[steelworks.y][steelworks.x].buildingId = steelworks.id;
    state.robots[0].cargo.used.ironOre = 4;
    return state;
  }

  const startSteel: PlayerCommand = {
    type: "startSteelProduction",
    buildingId: "building.steelworks.001",
  };

  it("EXP1-STEEL-001/002: Start zieht 2 Ore ab; Abschluss ohne Pausen in Tick N+10", () => {
    let current = tick(steelState(), [startSteel]).state;
    expect(current.robots[0].cargo.used.ironOre).toBe(2);
    const task = current.buildings.find((b) => b.type === "steelworks")
      ?.steelProductionTask;
    expect(task?.costPaid).toBe(true);
    expect(task?.remainingTicks).toBe(10);

    current = runTicks(current, 9);
    expect(
      current.buildings.find((b) => b.type === "steelworks")?.steelProductionTask
        ?.remainingTicks,
    ).toBe(1);

    current = runTicks(current, 1); // Tick N+10
    expect(current.robots[0].cargo.used.steelPlates).toBe(1);
    expect(
      current.buildings.find((b) => b.type === "steelworks")?.steelProductionTask,
    ).toBeUndefined();
    expect(
      current.eventLog.some((e) => e.code === "production.steelPlates.completed"),
    ).toBe(true);
  });

  it("EXP1-STEEL-003: volles Cargo -> outputBlocked, Nachholen bei Platz", () => {
    const state = steelState();
    state.robots[0].cargo.used.ironOre = 10; // Cargo voll (10/10)
    let current = tick(state, [startSteel]).state; // zieht 2 ab -> 8/10
    // Cargo wieder fuellen, damit es beim Abschluss voll ist.
    current.robots[0].cargo.used.ironOre = 10;
    current = runTicks(current, 10);
    const task = current.buildings.find((b) => b.type === "steelworks")
      ?.steelProductionTask;
    expect(task?.status).toBe("outputBlocked");
    expect(
      current.eventLog.some((e) => e.code === "production.steelPlates.outputBlocked"),
    ).toBe(true);

    // Platz schaffen -> Steel Plate wird nachgeliefert.
    current.robots[0].cargo.used.ironOre = 5;
    current = runTicks(current, 1);
    expect(current.robots[0].cargo.used.steelPlates).toBe(1);
  });

  it("EXP1-STEEL-004: Energiemangel pausiert ohne Kostenerstattung", () => {
    const state = steelState();
    let current = tick(state, [startSteel]).state;
    const solar = current.buildings.find((b) => b.type === "solarCollector");
    if (solar) {
      solar.isEnabled = false;
    }
    current = runTicks(current, 3);
    const task = current.buildings.find((b) => b.type === "steelworks")
      ?.steelProductionTask;
    expect(task?.remainingTicks).toBe(10);
    expect(task?.blockedReason).toBe("insufficientPower");
    expect(current.robots[0].cargo.used.ironOre).toBe(2); // keine Erstattung
  });

  it("EXP1-STEEL-005/006: Doppelauftrag und Ore-Mangel werden abgelehnt", () => {
    let current = tick(steelState(), [startSteel]).state;
    expect(tick(current, [startSteel]).commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "steelProductionAlreadyRunning",
    });

    const poor = steelState();
    poor.robots[0].cargo.used.ironOre = 1;
    const rejected = tick(poor, [startSteel]);
    expect(rejected.commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "notEnoughIronOreInStarterCargo",
    });
    expect(
      rejected.state.eventLog.some(
        (e) => e.code === "production.steelPlates.blocked.notEnoughOre",
      ),
    ).toBe(true);
  });
});

describe("EXP1-ESTOR: Energiespeicher", () => {
  it("EXP1-ESTOR-001: Ueberschuss laedt den Speicher (max 50/Tick)", () => {
    const state = makeExpansionState();
    const storage = makeEnergyStorage();
    state.buildings.push(storage);
    state.map[storage.y][storage.x].buildingId = storage.id;
    // Keine Verbraucher aktiv -> Ueberschuss 50/Tick.
    const current = runTicks(state, 3);
    expect(
      current.buildings.find((b) => b.type === "energyStorage")?.storedEnergy,
    ).toBe(150);
  });

  it("EXP1-ESTOR-002: Defizit wird aus dem Speicher gedeckt", () => {
    const state = makeExpansionState();
    const storage = makeEnergyStorage({ storedEnergy: 100 });
    const steelworks = makeSteelworks();
    state.buildings.push(storage, steelworks);
    state.map[storage.y][storage.x].buildingId = storage.id;
    state.map[steelworks.y][steelworks.x].buildingId = steelworks.id;
    state.robots[0].cargo.used.ironOre = 4;

    // Solar aus: nur Speicher liefert. Forschung aktiv (20) + Stahl (30) = 50.
    const solar = state.buildings.find((b) => b.type === "solarCollector");
    if (solar) {
      solar.isEnabled = false;
    }
    let current = tick(state, [
      { type: "startSteelProduction", buildingId: "building.steelworks.001" },
    ]).state;
    current = runTicks(current, 2);
    const task = current.buildings.find((b) => b.type === "steelworks")
      ?.steelProductionTask;
    // Stahlverarbeitung laeuft dank Speicherentladung weiter.
    expect(task?.remainingTicks).toBe(8);
    const stored = current.buildings.find((b) => b.type === "energyStorage")
      ?.storedEnergy;
    expect(stored).toBe(40); // 100 - 2 Ticks x 30
  });
});

describe("EXP1-BUILD/TPL: Gebaeude und Template-Bibliothek", () => {
  it("EXP1-BUILD-003/EXP1-TPL-001: Steelworks-Template erst nach Forschung; Duplikat abgelehnt", () => {
    const state = makeExpansionState();
    expect(
      tick(state, [
        {
          type: "addProgramFromTemplate",
          robotId: "robot.starter",
          templateId: "template.buildSteelworks",
        },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "templateNotUnlocked" });

    state.research.completedProjects.push("research.metalProcessing1");
    const { state: withTemplate, commandOutcomes } = tick(state, [
      {
        type: "addProgramFromTemplate",
        robotId: "robot.starter",
        templateId: "template.buildSteelworks",
      },
    ]);
    expect(commandOutcomes[0].result).toEqual({ type: "accepted" });
    const stack = withTemplate.robots[0].programStack;
    // Direkt ueber dem Erkundungsprogramm eingefuegt (Bau vor Erkundung).
    const exploreIndex = stack.findIndex(
      (p) => p.templateId === "template.exploreNearby",
    );
    expect(stack[exploreIndex - 1].templateId).toBe("template.buildSteelworks");
    expect(stack[stack.length - 1].templateId).toBe("template.stasisCharge");

    expect(
      tick(withTemplate, [
        {
          type: "addProgramFromTemplate",
          robotId: "robot.starter",
          templateId: "template.buildSteelworks",
        },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "duplicateProgram" });
  });

  it("EXP1-TPL-002: removeProgram entfernt nicht-locked; Stasis-Laden bleibt", () => {
    const state = makeExpansionState();
    const { state: added } = tick(state, [
      {
        type: "addProgramFromTemplate",
        robotId: "robot.starter",
        templateId: "template.buildAiResearchCenter",
      },
    ]);
    const { state: removed, commandOutcomes } = tick(added, [
      {
        type: "removeProgram",
        robotId: "robot.starter",
        programId: "program.starter.buildAiResearchCenter",
      },
    ]);
    expect(commandOutcomes[0].result).toEqual({ type: "accepted" });
    expect(
      removed.robots[0].programStack.some(
        (p) => p.templateId === "template.buildAiResearchCenter",
      ),
    ).toBe(false);

    expect(
      tick(removed, [
        {
          type: "removeProgram",
          robotId: "robot.starter",
          programId: "program.starter.stasisCharge",
        },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "programLocked" });
  });

  it("EXP1-BUILD-001/002: Forschungszentrum baubar (10 Ore, 2 Bauaktionen)", () => {
    const state = createInitialGame("mvp-default");
    // Nur das Forschungszentrum-Template aktiv lassen.
    for (const program of state.robots[0].programStack) {
      if (program.templateId !== "template.stasisCharge") {
        program.enabled = false;
      }
    }
    let current = tick(state, [
      {
        type: "addProgramFromTemplate",
        robotId: "robot.starter",
        templateId: "template.buildAiResearchCenter",
      },
    ]).state;
    current.robots[0].cargo.used.ironOre = 10;

    // Bau laeuft: 2 Bauaktionen a 10 Ticks (+ Task-Starts).
    current = runTicks(current, 26);
    const center = current.buildings.find((b) => b.type === "aiResearchCenter");
    expect(center).toBeDefined();
    expect(center?.status).toBe("active");
    expect(center?.constructionRequired).toBe(2);
    expect(current.robots[0].cargo.used.ironOre).toBe(0);
    expect(center?.hp.max).toBe(150);
  });

  it("EXP1-TPL-003: executionLimit editierbar erst nach basicAutomation1", () => {
    const state = makeExpansionState();
    const program = state.robots[0].programStack[1]; // buildSolarCollector
    const draft = structuredClone(program);
    draft.executionLimit = { type: "count", maxExecutions: 2 };

    expect(
      tick(state, [
        { type: "updateProgram", robotId: "robot.starter", program: draft },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "rejected", reason: "invalidProgramDefinition" });

    state.research.completedProjects.push("research.basicAutomation1");
    expect(
      tick(state, [
        { type: "updateProgram", robotId: "robot.starter", program: draft },
      ]).commandOutcomes[0].result,
    ).toEqual({ type: "accepted" });
  });
});

describe("EXP1-GOAL-001: Abgrenzung", () => {
  it("Expansion 1 vergibt keinen Score", () => {
    const state = makeExpansionState();
    const steelworks = makeSteelworks();
    state.buildings.push(steelworks);
    state.map[steelworks.y][steelworks.x].buildingId = steelworks.id;
    state.robots[0].cargo.used.ironOre = 4;
    let current = tick(state, [
      { type: "startSteelProduction", buildingId: "building.steelworks.001" },
      { type: "selectResearchProject", projectId: "research.metalProcessing1" },
    ]).state;
    current = runTicks(current, 15);
    expect(current.robots[0].cargo.used.steelPlates).toBe(1);
    expect(current.score.totalScore).toBe(0);
    expect(current.mvpGoalReached).toBe(false);
  });
});

describe("EXP1-E2E-001: Forschung -> Stahlwerk -> erste Steel Plate", () => {
  it("kompletter Expansion-1-Durchlauf", () => {
    let state = createInitialGame("mvp-default");
    const commandsUsed: string[] = [];

    for (let index = 0; index < 1600; index += 1) {
      const commands: PlayerCommand[] = [];
      const starter = state.robots.find((r) => r.type === "starterRobot");
      const center = state.buildings.find(
        (b) => b.type === "aiResearchCenter" && b.status === "active",
      );
      const steelworks = state.buildings.find(
        (b) => b.type === "steelworks" && b.status === "active",
      );

      // Spielerlogik: Forschungszentrum-Template hinzufuegen, sobald genug Ore absehbar.
      if (
        !state.robots[0].programStack.some(
          (p) => p.templateId === "template.buildAiResearchCenter",
        )
      ) {
        commands.push({
          type: "addProgramFromTemplate",
          robotId: "robot.starter",
          templateId: "template.buildAiResearchCenter",
        });
        commandsUsed.push("addAiResearchCenterTemplate");
      }

      if (
        center &&
        !state.research.activeProjectId &&
        !state.research.completedProjects.includes("research.metalProcessing1")
      ) {
        commands.push({
          type: "selectResearchProject",
          projectId: "research.metalProcessing1",
        });
        commandsUsed.push("selectMetalProcessing1");
      }

      if (
        state.research.completedProjects.includes("research.metalProcessing1") &&
        !state.robots[0].programStack.some(
          (p) => p.templateId === "template.buildSteelworks",
        )
      ) {
        commands.push({
          type: "addProgramFromTemplate",
          robotId: "robot.starter",
          templateId: "template.buildSteelworks",
        });
        commandsUsed.push("addSteelworksTemplate");
      }

      if (
        steelworks &&
        !steelworks.steelProductionTask &&
        (starter?.cargo.used.ironOre ?? 0) >= 2 &&
        (starter?.cargo.used.steelPlates ?? 0) === 0
      ) {
        commands.push({
          type: "startSteelProduction",
          buildingId: steelworks.id,
        });
        commandsUsed.push("startSteelProduction");
      }

      state = tick(state, commands).state;

      if ((state.robots[0].cargo.used.steelPlates ?? 0) >= 1) {
        break;
      }
    }

    expect(commandsUsed).toContain("selectMetalProcessing1");
    expect(state.research.completedProjects).toContain("research.metalProcessing1");
    expect(
      state.buildings.some(
        (b) => b.type === "aiResearchCenter" && b.status === "active",
      ),
    ).toBe(true);
    expect(
      state.buildings.some((b) => b.type === "steelworks" && b.status === "active"),
    ).toBe(true);
    expect(state.robots[0].cargo.used.steelPlates).toBeGreaterThanOrEqual(1);
    expect(state.eventLog.length).toBeLessThanOrEqual(200);
  });
});
