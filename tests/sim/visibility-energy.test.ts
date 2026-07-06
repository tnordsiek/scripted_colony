import { describe, expect, it } from "vitest";
import { createInitialGame } from "../../src/sim/createInitialGame";
import { computeEnergySnapshot } from "../../src/sim/energy";
import { updateVisibility } from "../../src/sim/visibility";
import type { Building, GameState, ProductionTask } from "../../src/sim/types";

function makeBuilding(overrides: Partial<Building>): Building {
  return {
    id: "building.solarCollector.001",
    type: "solarCollector",
    tier: 1,
    x: 1,
    y: 1,
    hp: { current: 100, max: 100 },
    status: "active",
    isEnabled: true,
    sightRange: 2,
    powerProvided: 50,
    ...overrides,
  };
}

function makeProductionTask(overrides: Partial<ProductionTask> = {}): ProductionTask {
  return {
    id: "production.ironMiner.building.robotFactory.001.001",
    buildingId: "building.robotFactory.001",
    robotType: "ironMiner",
    cost: { ironOre: 5 },
    costPaid: true,
    totalTicks: 10,
    remainingTicks: 10,
    powerRequired: 40,
    status: "inProgress",
    createdTick: 0,
    startedTick: 0,
    ...overrides,
  };
}

describe("Sicht und Fog-of-War", () => {
  it("MVP-VIS-001: active+enabled Solar Collector deckt Chebyshev-Radius 2 auf", () => {
    const state = createInitialGame("mvp-default");
    state.buildings.push(makeBuilding({ x: 0, y: 0 }));
    updateVisibility(state);
    expect(state.map[0][0].visibility).toBe("visible");
    expect(state.map[2][2].visibility).toBe("visible");
    expect(state.map[0][3].visibility).not.toBe("visible");
  });

  it("MVP-VIS-003: Gebaeude in construction erzeugt keine Sicht", () => {
    const state = createInitialGame("mvp-default");
    state.buildings.push(makeBuilding({ x: 0, y: 0, status: "construction" }));
    updateVisibility(state);
    expect(state.map[0][0].visibility).toBe("unknown");
  });

  it("MVP-V71: unknown -> visible -> discovered Uebergaenge", () => {
    const state = createInitialGame("mvp-default");
    const starter = state.robots[0];

    expect(state.map[1][5].visibility).toBe("unknown");

    starter.y = 3; // Feld (5,1) kommt in Sichtweite 2
    updateVisibility(state);
    expect(state.map[1][5].visibility).toBe("visible");

    starter.y = 7;
    updateVisibility(state);
    expect(state.map[1][5].visibility).toBe("discovered");

    starter.y = 3;
    updateVisibility(state);
    expect(state.map[1][5].visibility).toBe("visible");
  });
});

describe("MVP-Energie (globaler Power-Pool)", () => {
  function baseState(): GameState {
    return createInitialGame("mvp-default");
  }

  it("MVP-ENERGY-001: active enabled Solar Collector erzeugt 50 Leistung", () => {
    const state = baseState();
    state.buildings.push(makeBuilding({}));
    expect(computeEnergySnapshot(state).powerProvided).toBe(50);
  });

  it("MVP-ENERGY-002/003: construction oder disabled Solar Collector erzeugt 0", () => {
    const state = baseState();
    state.buildings.push(makeBuilding({ status: "construction" }));
    expect(computeEnergySnapshot(state).powerProvided).toBe(0);

    const state2 = baseState();
    state2.buildings.push(makeBuilding({ isEnabled: false }));
    expect(computeEnergySnapshot(state2).powerProvided).toBe(0);
  });

  it("MVP-ENERGY-004/005: Fabrik idle benoetigt 0, laufender ProductionTask 40", () => {
    const state = baseState();
    state.tick = 5;
    const factory = makeBuilding({
      id: "building.robotFactory.001",
      type: "robotFactory",
      x: 2,
      y: 2,
      powerProvided: undefined,
    });
    state.buildings.push(factory);
    expect(computeEnergySnapshot(state).powerRequired).toBe(0);

    factory.productionTask = makeProductionTask({ startedTick: 4 });
    expect(computeEnergySnapshot(state).powerRequired).toBe(40);
  });

  it("MVP-PROD-012: neu gestarteter ProductionTask zaehlt im Starttick nicht in powerRequired", () => {
    const state = baseState();
    state.tick = 5;
    const factory = makeBuilding({
      id: "building.robotFactory.001",
      type: "robotFactory",
      x: 2,
      y: 2,
      powerProvided: undefined,
    });
    factory.productionTask = makeProductionTask({ createdTick: 5, startedTick: 5 });
    state.buildings.push(factory);
    expect(computeEnergySnapshot(state).powerRequired).toBe(0);
  });
});
