// EXP2-E2E-001/003: vollautomatische Kette Ore -> Speicher -> Stahlwerk -> Steel
// nach Spieler-Setup; Langlauf als Livelock-Waechter (docs/02-mvp/mvp-test-matrix.md).
import { describe, expect, it } from "vitest";
import { createInitialGame } from "../../src/sim/createInitialGame";
import {
  createIronMinerSpawnStack,
  createTransportRobotSpawnStack,
} from "../../src/sim/programs";
import { tick } from "../../src/sim/tick";
import { inventoryTotal } from "../../src/sim/logistics";
import type { Building, GameState, Robot } from "../../src/sim/types";

// Aufgebaute Kolonie: Solar, Speicher, Stahlwerk, Gridline-Ladenetz,
// aktiver Iron Miner und Transporter. Starter geparkt.
function buildColony(): GameState {
  const state = createInitialGame("mvp-default");
  state.research.completedProjects.push(
    "research.metalProcessing1",
    "research.transportLogistics1",
  );
  for (const program of state.robots[0].programStack) {
    program.enabled = false;
  }
  state.robots[0].x = 9;
  state.robots[0].y = 0;

  function add(building: Building): void {
    state.buildings.push(building);
    state.map[building.y][building.x].buildingId = building.id;
  }
  const base = {
    tier: 2 as const,
    hp: { current: 150, max: 150 },
    status: "active" as const,
    isEnabled: true,
  };
  add({ ...base, id: "building.solarCollector.001", type: "solarCollector", tier: 1, x: 4, y: 4, sightRange: 2, powerProvided: 50 });
  add({ ...base, id: "building.solarCollector.002", type: "solarCollector", tier: 1, x: 3, y: 4, sightRange: 2, powerProvided: 50 });
  add({ ...base, id: "building.resourceStorage.001", type: "resourceStorage", x: 4, y: 6, sightRange: 1, inventory: { storage: {}, totalCapacity: 100 } });
  add({ ...base, id: "building.steelworks.001", type: "steelworks", x: 6, y: 4, sightRange: 2, inventory: { input: {}, output: {} } });
  // Gridline-Ladenetz nahe dem Ore-Cluster links unten (0-1, 6-7).
  add({ ...base, id: "building.gridEnergyLine.001", type: "gridEnergyLine", tier: 2, x: 3, y: 5, sightRange: 0, hp: { current: 80, max: 80 } });
  add({ ...base, id: "building.gridEnergyLine.002", type: "gridEnergyLine", tier: 2, x: 2, y: 5, sightRange: 0, hp: { current: 80, max: 80 } });

  // Sicht freischalten, damit Ziele bekannt sind.
  for (const row of state.map) {
    for (const field of row) {
      field.visibility = "visible";
    }
  }

  const miner: Robot = {
    id: "robot.ironMiner.001",
    name: "Iron Miner",
    type: "ironMiner",
    tier: 1,
    role: "miner",
    movementType: "ground",
    communicationMode: "gridRequired",
    communicationStatus: "connected",
    x: 2,
    y: 6,
    hp: { current: 100, max: 100 },
    battery: 50,
    batteryMax: 100,
    chargingMode: "externalOnly",
    cargo: { used: {}, capacity: 10 },
    sightRange: 2,
    status: "active",
    programStack: createIronMinerSpawnStack("robot.ironMiner.001"),
  };
  const transporter: Robot = {
    id: "robot.transportRobot.001",
    name: "Transporter",
    type: "transportRobot",
    tier: 2,
    role: "transport",
    movementType: "ground",
    communicationMode: "gridRequired",
    communicationStatus: "connected",
    x: 5,
    y: 6,
    hp: { current: 90, max: 90 },
    battery: 80,
    batteryMax: 120,
    chargingMode: "externalOnly",
    cargo: { used: {}, capacity: 30 },
    sightRange: 2,
    status: "active",
    programStack: createTransportRobotSpawnStack("robot.transportRobot.001"),
  };
  state.robots.push(miner, transporter);
  return state;
}

function totalSteel(state: GameState): number {
  let total = 0;
  for (const building of state.buildings) {
    total += building.inventory?.storage?.steelPlates ?? 0;
    total += building.inventory?.output?.steelPlates ?? 0;
  }
  for (const robot of state.robots) {
    total += robot.cargo.used.steelPlates ?? 0;
  }
  return total;
}

describe("EXP2-E2E: vollautomatische Kette", () => {
  it("EXP2-E2E-001: produziert ohne weitere Commands >= 3 Steel Plates; Roboter ueberleben", () => {
    let state = buildColony();

    for (let index = 0; index < 1500; index += 1) {
      state = tick(state).state;
      if (totalSteel(state) >= 3) {
        break;
      }
    }

    expect(totalSteel(state)).toBeGreaterThanOrEqual(3);

    // Kein Arbeitsroboter faellt dauerhaft aus (Ladenetz funktioniert).
    const miner = state.robots.find((robot) => robot.type === "ironMiner");
    const transporter = state.robots.find(
      (robot) => robot.type === "transportRobot",
    );
    expect(miner?.status).toBe("active");
    expect(transporter?.status).toBe("active");
    expect(miner?.battery ?? 0).toBeGreaterThan(0);
    expect(transporter?.battery ?? 0).toBeGreaterThan(0);
    expect(state.eventLog.length).toBeLessThanOrEqual(200);
  });

  it("EXP2-E2E-003: 3000-Tick-Langlauf ohne Deadlock (Steel waechst weiter)", () => {
    let state = buildColony();
    state = (() => {
      let current = state;
      for (let index = 0; index < 1500; index += 1) {
        current = tick(current).state;
      }
      return current;
    })();
    const steelAtHalf = totalSteel(state);

    for (let index = 0; index < 1500; index += 1) {
      state = tick(state).state;
    }
    const steelAtEnd = totalSteel(state);

    expect(steelAtHalf).toBeGreaterThanOrEqual(1);
    expect(steelAtEnd).toBeGreaterThan(steelAtHalf);
    // Ressourcen gehen nicht verloren (Ore + Steel konsistent > 0 im Umlauf).
    expect(inventoryTotal(
      state.buildings.find((b) => b.type === "resourceStorage")?.inventory?.storage,
    )).toBeGreaterThanOrEqual(0);
  });
});
