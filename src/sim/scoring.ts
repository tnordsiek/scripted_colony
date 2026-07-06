// Score- und Zielregeln nach docs/04-systems/scoring-and-win-conditions.md.
// Score und MVP-Ziel fuer den Iron Miner erst nach erfolgreichem Spawn.
import {
  MVP_SCORE_GOAL_BONUS,
  MVP_SCORE_MINED_IRON_ORE,
  MVP_SCORE_ROBOT_FACTORY_BUILT,
  MVP_SCORE_ROBOT_SPAWNED,
  MVP_SCORE_SOLAR_COLLECTOR_BUILT,
} from "./constants";
import type { BuildingType, GameState, ScoreState } from "./types";

export function createInitialScore(): ScoreState {
  return {
    minedIronOre: 0,
    builtSolarCollectors: 0,
    builtRobotFactories: 0,
    builtBuildings: 0,
    spawnedRobots: 0,
    elapsedTicks: 0,
    goalBonusAwarded: false,
    totalScore: 0,
  };
}

export function scoreMinedIronOre(state: GameState, amount: number): void {
  state.score.minedIronOre += amount;
  state.score.totalScore += amount * MVP_SCORE_MINED_IRON_ORE;
}

// Pro buildingId nur einmal aufrufen (erster Wechsel zu active).
export function scoreBuildingActivated(
  state: GameState,
  buildingType: BuildingType,
): void {
  if (buildingType === "solarCollector") {
    state.score.builtSolarCollectors += 1;
    state.score.builtBuildings += 1;
    state.score.totalScore += MVP_SCORE_SOLAR_COLLECTOR_BUILT;
  } else if (buildingType === "robotFactory") {
    state.score.builtRobotFactories += 1;
    state.score.builtBuildings += 1;
    state.score.totalScore += MVP_SCORE_ROBOT_FACTORY_BUILT;
  }
}

// Nach erfolgreichem Einfuegen der Iron-Miner-Entity. Liefert true, wenn das
// MVP-Ziel mit diesem Spawn erstmals erreicht wurde (Zielbonus nur einmal).
export function scoreRobotSpawned(state: GameState): boolean {
  state.score.spawnedRobots += 1;
  state.score.totalScore += MVP_SCORE_ROBOT_SPAWNED;

  if (!state.score.goalBonusAwarded) {
    state.score.goalBonusAwarded = true;
    state.score.totalScore += MVP_SCORE_GOAL_BONUS;
    state.mvpGoalReached = true;
    return true;
  }

  return false;
}
