import { describe, expect, it } from "vitest";
import { createInitialGame } from "../../src/sim/createInitialGame";
import { tick } from "../../src/sim/tick";
import type { GameState, PlayerCommand } from "../../src/sim/types";

// Spielt einen kompletten Run: Der Startroboter arbeitet seinen Stack autonom ab;
// sobald die Roboterfabrik aktiv ist und 5 Ore im Cargo liegen, startet der
// "Spieler" die Produktion. Erwartung: MVP-Ziel innerhalb des Zeitlimits.
function playRun(seed: string, maxTicks = 600): { state: GameState; history: string[] } {
  let state = createInitialGame(seed);
  const history: string[] = [];

  for (let index = 0; index < maxTicks; index += 1) {
    const commands: PlayerCommand[] = [];
    const factory = state.buildings.find(
      (building) => building.type === "robotFactory" && building.status === "active",
    );
    const starter = state.robots.find((robot) => robot.type === "starterRobot");
    if (
      factory &&
      !factory.productionTask &&
      (starter?.cargo.used.ironOre ?? 0) >= 5 &&
      !state.mvpGoalReached
    ) {
      commands.push({ type: "startIronMinerProduction", buildingId: factory.id });
      history.push(`tick ${state.tick + 1}: startIronMinerProduction`);
    }

    state = tick(state, commands).state;

    if (state.mvpGoalReached) {
      break;
    }
  }

  return { state, history };
}

describe("End-to-End: kompletter MVP-Durchlauf", () => {
  it("mvp-default erreicht das MVP-Ziel innerhalb von 600 Ticks", () => {
    const { state } = playRun("mvp-default");

    expect(state.mvpGoalReached).toBe(true);
    expect(state.tick).toBeLessThanOrEqual(600);

    // Kompletter Aufbau fand statt.
    expect(
      state.buildings.some(
        (building) => building.type === "solarCollector" && building.status === "active",
      ),
    ).toBe(true);
    expect(
      state.buildings.some(
        (building) => building.type === "robotFactory" && building.status === "active",
      ),
    ).toBe(true);

    const ironMiner = state.robots.find((robot) => robot.type === "ironMiner");
    expect(ironMiner).toBeDefined();
    expect(ironMiner?.id).toBe("robot.ironMiner.001");

    // Score: >= 10 Ore (2 Bauten + 5 Produktion) + 25 + 50 + 100 + 200.
    expect(state.score.minedIronOre).toBeGreaterThanOrEqual(10);
    expect(state.score.builtSolarCollectors).toBe(1);
    expect(state.score.builtRobotFactories).toBe(1);
    expect(state.score.spawnedRobots).toBe(1);
    expect(state.score.goalBonusAwarded).toBe(true);
    expect(state.score.totalScore).toBe(
      state.score.minedIronOre + 25 + 50 + 100 + 200,
    );

    // Kanonische Zielereignisse vorhanden.
    const codes = state.eventLog.map((event) => event.code);
    expect(codes).toContain("production.ironMiner.spawned");
    expect(codes).toContain("goal.mvpReached");
  });

  it("Determinismus: gleicher Seed + gleiche Commands = gleicher Verlauf", () => {
    const runA = playRun("mvp-default");
    const runB = playRun("mvp-default");
    expect(runB.history).toEqual(runA.history);
    expect(JSON.stringify(runB.state)).toBe(JSON.stringify(runA.state));
  });

  it("anderer Seed erreicht das Ziel ebenfalls (Fairness-Validator)", () => {
    const { state } = playRun("zweiter-lauf");
    expect(state.mvpGoalReached).toBe(true);
  });

  it("MVP-EVENT-005: Eventlog ueberschreitet nie 200 Eintraege", () => {
    const { state } = playRun("mvp-default");
    expect(state.eventLog.length).toBeLessThanOrEqual(200);
  });

  it("MVP-V75: kein ausfuehrbares Programm laesst status active (idle nur abgeleitet)", () => {
    const { state } = playRun("mvp-default");
    for (const robot of state.robots) {
      expect(["active", "stasis"]).toContain(robot.status);
      expect((robot.status as string) === "idle").toBe(false);
    }
  });
});
