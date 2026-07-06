import { describe, expect, it } from "vitest";
import { createInitialGame } from "../../src/sim/createInitialGame";

describe("Initialer GameState (docs/02-mvp/initial-game-state.md)", () => {
  const state = createInitialGame("mvp-default");

  it("MVP-INIT-001: tick startet bei 0", () => {
    expect(state.tick).toBe(0);
  });

  it("MVP-INIT-002: Karte ist 10x10", () => {
    expect(state.map).toHaveLength(10);
    for (const row of state.map) {
      expect(row).toHaveLength(10);
    }
  });

  it("MVP-INIT-003: Startroboter steht bei { x: 5, y: 5 }", () => {
    const starter = state.robots[0];
    expect(starter.id).toBe("robot.starter");
    expect(starter.x).toBe(5);
    expect(starter.y).toBe(5);
  });

  it("MVP-INIT-004: Startroboter hat battery 100/100", () => {
    const starter = state.robots[0];
    expect(starter.battery).toBe(100);
    expect(starter.batteryMax).toBe(100);
  });

  it("MVP-INIT-005: Startroboter-Cargo ist leer", () => {
    expect(state.robots[0].cargo.used).toEqual({});
    expect(state.robots[0].cargo.capacity).toBe(10);
  });

  it("MVP-INIT-006: keine Startgebaeude", () => {
    expect(state.buildings).toEqual([]);
  });

  it("MVP-INIT-007: keine materialRequests", () => {
    expect(state.materialRequests).toEqual([]);
  });

  it("MVP-INIT-008: selected zeigt auf robot.starter", () => {
    expect(state.selected).toEqual({ type: "robot", id: "robot.starter" });
  });

  it("MVP-MAP-003/004: Startfeld map[5][5], initiale Sicht x/y 3..7", () => {
    expect(state.map[5][5].x).toBe(5);
    expect(state.map[5][5].y).toBe(5);
    for (let y = 0; y < 10; y += 1) {
      for (let x = 0; x < 10; x += 1) {
        const expected = x >= 3 && x <= 7 && y >= 3 && y <= 7 ? "visible" : "unknown";
        expect(state.map[y][x].visibility).toBe(expected);
      }
    }
  });

  it("MVP-STACK-001/002: Startstack enthaelt exakt 5 Programme in kanonischer Reihenfolge", () => {
    const stack = state.robots[0].programStack;
    expect(stack).toHaveLength(5);
    expect(stack.map((program) => program.templateId)).toEqual([
      "template.mineIronOre",
      "template.buildSolarCollector",
      "template.buildRobotFactory",
      "template.exploreNearby",
      "template.stasisCharge",
    ]);
  });

  it("MVP-STACK-003: template.secureEnergy ist nicht im Startstack", () => {
    const stack = state.robots[0].programStack;
    expect(stack.some((program) => program.templateId === "template.secureEnergy")).toBe(
      false,
    );
  });

  it("MVP-STACK-004: Stasis-Laden ist locked, enabled und letzter Eintrag", () => {
    const stack = state.robots[0].programStack;
    const last = stack[stack.length - 1];
    expect(last.templateId).toBe("template.stasisCharge");
    expect(last.locked).toBe(true);
    expect(last.enabled).toBe(true);
  });

  it("MVP-V73-001/002: Startstack nutzt die kanonischen stabilen RowIds", () => {
    const stack = state.robots[0].programStack;
    expect(stack.map((program) => program.rows[0].id)).toEqual([
      "row.starter.mineIronOre.main",
      "row.starter.buildSolarCollector.main",
      "row.starter.buildRobotFactory.main",
      "row.starter.exploreNearby.main",
      "row.starter.stasisCharge.main",
    ]);
    expect(stack.map((program) => program.id)).toEqual([
      "program.starter.mineIronOre",
      "program.starter.buildSolarCollector",
      "program.starter.buildRobotFactory",
      "program.starter.exploreNearby",
      "program.starter.stasisCharge",
    ]);
  });

  it("MVP-EVENT-001: initiales Landungs-Event mit stabiler ID und Code", () => {
    expect(state.eventLog).toHaveLength(1);
    const event = state.eventLog[0];
    expect(event.id).toBe("event.initialLanding");
    expect(event.code).toBe("system.initialLanding");
    expect(event.visibility).toBe("player");
    expect(event.severity).toBe("info");
    expect(event.priority).toBe("normal");
    expect(event.category).toBe("system");
  });

  it("MVP-GOAL-001: Score startet bei 0, mvpGoalReached false", () => {
    expect(state.score.totalScore).toBe(0);
    expect(state.score.goalBonusAwarded).toBe(false);
    expect(state.mvpGoalReached).toBe(false);
  });

  it("MVP-ROBOT-001/002: Startroboter ist starterRobot, kein standardRobot", () => {
    expect(state.robots[0].type).toBe("starterRobot");
    expect(state.robots.some((robot) => (robot.type as string) === "standardRobot")).toBe(
      false,
    );
  });

  it("Determinismus: gleicher Seed erzeugt identischen Startzustand", () => {
    const a = createInitialGame("mvp-default");
    const b = createInitialGame("mvp-default");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
