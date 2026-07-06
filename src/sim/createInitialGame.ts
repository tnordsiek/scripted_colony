// Kanonischer Startzustand nach docs/02-mvp/initial-game-state.md.
import {
  MVP_INITIAL_LANDING_EVENT_ID,
  MVP_STARTER_BATTERY,
  MVP_STARTER_BATTERY_MAX,
  MVP_STARTER_CARGO_CAPACITY,
  MVP_STARTER_HP,
  MVP_STARTER_HP_MAX,
  MVP_STARTER_ROBOT_ID,
  MVP_STARTER_SIGHT_RANGE,
  MVP_START_POSITION,
} from "./constants";
import { generateMvpMap } from "./map";
import { createStarterProgramStack } from "./programs";
import { createInitialScore } from "./scoring";
import type { GameEvent, GameState, Robot } from "./types";

export function createStarterRobot(): Robot {
  return {
    id: MVP_STARTER_ROBOT_ID,
    name: "Starter",
    type: "starterRobot",
    tier: 0,
    role: "allrounder",
    movementType: "ground",
    communicationMode: "autonomous",
    communicationStatus: "connected",
    x: MVP_START_POSITION.x,
    y: MVP_START_POSITION.y,
    hp: { current: MVP_STARTER_HP, max: MVP_STARTER_HP_MAX },
    battery: MVP_STARTER_BATTERY,
    batteryMax: MVP_STARTER_BATTERY_MAX,
    chargingMode: "selfCharging",
    cargo: {
      used: {},
      capacity: MVP_STARTER_CARGO_CAPACITY,
    },
    sightRange: MVP_STARTER_SIGHT_RANGE,
    status: "active",
    canRepair: false,
    activeTask: undefined,
    activeProgram: undefined,
    programStack: createStarterProgramStack(),
  };
}

export function createInitialLandingEvent(): GameEvent {
  return {
    id: MVP_INITIAL_LANDING_EVENT_ID,
    tick: 0,
    visibility: "player",
    severity: "info",
    priority: "normal",
    category: "system",
    code: "system.initialLanding",
    message: "Startroboter gelandet.",
    robotId: MVP_STARTER_ROBOT_ID,
  };
}

export function createInitialGame(seed = "mvp-default"): GameState {
  return {
    tick: 0,
    randomSeed: seed,
    isPaused: false,
    speed: 1,
    map: generateMvpMap(seed),
    robots: [createStarterRobot()],
    buildings: [],
    selected: { type: "robot", id: MVP_STARTER_ROBOT_ID },
    eventLog: [createInitialLandingEvent()],
    score: createInitialScore(),
    mvpGoalReached: false,
    materialRequests: [],
  };
}
