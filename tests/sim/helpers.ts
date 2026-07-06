import { createInitialGame } from "../../src/sim/createInitialGame";
import type { Building, GameState } from "../../src/sim/types";

export function makeSolarCollector(overrides: Partial<Building> = {}): Building {
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
    powerProvided: 50,
    constructionProgress: 1,
    constructionRequired: 1,
    ...overrides,
  };
}

export function makeRobotFactory(overrides: Partial<Building> = {}): Building {
  return {
    id: "building.robotFactory.001",
    type: "robotFactory",
    tier: 1,
    x: 6,
    y: 4,
    hp: { current: 100, max: 100 },
    status: "active",
    isEnabled: true,
    sightRange: 2,
    powerRequired: 40,
    constructionProgress: 1,
    constructionRequired: 1,
    ...overrides,
  };
}

// Startzustand mit aktivem Solar Collector + Roboterfabrik und befuelltem Cargo.
export function makeProductionReadyState(): GameState {
  const state = createInitialGame("mvp-default");
  const solar = makeSolarCollector();
  const factory = makeRobotFactory();
  state.buildings.push(solar, factory);
  state.map[solar.y][solar.x].buildingId = solar.id;
  state.map[factory.y][factory.x].buildingId = factory.id;
  state.robots[0].cargo.used.ironOre = 5;
  return state;
}
