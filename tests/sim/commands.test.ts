import { describe, expect, it } from "vitest";
import { createInitialGame } from "../../src/sim/createInitialGame";
import { tick } from "../../src/sim/tick";
import type { PlayerCommand, ProgramInstance } from "../../src/sim/types";

describe("PlayerCommands (docs/03-technical/player-command-handling.md)", () => {
  it("pause/resume/setSpeed werden angewendet", () => {
    const state = createInitialGame("mvp-default");
    let result = tick(state, [{ type: "pause" }]);
    expect(result.state.isPaused).toBe(true);
    result = tick(result.state, [{ type: "resume" }, { type: "setSpeed", speed: 4 }]);
    expect(result.state.isPaused).toBe(false);
    expect(result.state.speed).toBe(4);
  });

  it("setSpeed mit ungueltigem Wert -> invalidSpeed", () => {
    const state = createInitialGame("mvp-default");
    const command = { type: "setSpeed", speed: 3 } as unknown as PlayerCommand;
    const { commandOutcomes } = tick(state, [command]);
    expect(commandOutcomes[0].result).toEqual({ type: "rejected", reason: "invalidSpeed" });
  });

  it("MVP-V79-003: rejected Command mutiert keinen spielrelevanten State", () => {
    const state = createInitialGame("mvp-default");
    const { state: next, commandOutcomes } = tick(state, [
      { type: "selectRobot", robotId: "robot.unbekannt" },
    ]);
    expect(commandOutcomes[0].result).toEqual({ type: "rejected", reason: "robotNotFound" });
    expect(next.selected).toEqual({ type: "robot", id: "robot.starter" });
  });

  it("selectField mit Out-of-Bounds -> fieldOutOfBounds", () => {
    const state = createInitialGame("mvp-default");
    const { commandOutcomes } = tick(state, [{ type: "selectField", x: 10, y: 0 }]);
    expect(commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "fieldOutOfBounds",
    });
  });

  it("toggleProgramEnabled: locked Programm -> programLocked", () => {
    const state = createInitialGame("mvp-default");
    const { commandOutcomes } = tick(state, [
      {
        type: "toggleProgramEnabled",
        robotId: "robot.starter",
        programId: "program.starter.stasisCharge",
      },
    ]);
    expect(commandOutcomes[0].result).toEqual({ type: "rejected", reason: "programLocked" });
  });

  it("moveProgramUp: erstes Programm -> programAlreadyFirst", () => {
    const state = createInitialGame("mvp-default");
    const { commandOutcomes } = tick(state, [
      {
        type: "moveProgramUp",
        robotId: "robot.starter",
        programId: "program.starter.mineIronOre",
      },
    ]);
    expect(commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "programAlreadyFirst",
    });
  });

  it("moveProgramDown haelt Stasis-Laden als letzten Eintrag", () => {
    const state = createInitialGame("mvp-default");
    const { state: next, commandOutcomes } = tick(state, [
      {
        type: "moveProgramDown",
        robotId: "robot.starter",
        programId: "program.starter.exploreNearby",
      },
    ]);
    expect(commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "programAlreadyLast",
    });
    const stack = next.robots[0].programStack;
    expect(stack[stack.length - 1].templateId).toBe("template.stasisCharge");
  });

  it("moveProgramDown/Up verschieben nicht-locked Programme", () => {
    const state = createInitialGame("mvp-default");
    const { state: next } = tick(state, [
      {
        type: "moveProgramDown",
        robotId: "robot.starter",
        programId: "program.starter.mineIronOre",
      },
    ]);
    expect(next.robots[0].programStack.map((p) => p.templateId).slice(0, 2)).toEqual([
      "template.buildSolarCollector",
      "template.mineIronOre",
    ]);
  });

  it("MVP-V80-001: updateProgram akzeptiert templatekonforme Namensaenderung", () => {
    const state = createInitialGame("mvp-default");
    const program = state.robots[0].programStack[0];
    const draft: ProgramInstance = structuredClone(program);
    draft.name = "Mein Mining";
    const { state: next, commandOutcomes } = tick(state, [
      { type: "updateProgram", robotId: "robot.starter", program: draft },
    ]);
    expect(commandOutcomes[0].result).toEqual({ type: "accepted" });
    expect(next.robots[0].programStack[0].name).toBe("Mein Mining");
  });

  it("MVP-V80-002: templateId-/actionId-Aenderung -> invalidProgramDefinition", () => {
    const state = createInitialGame("mvp-default");
    const program = state.robots[0].programStack[3]; // exploreNearby
    const draft: ProgramInstance = structuredClone(program);
    draft.rows[0].then = { actionId: "action.buildBuilding", parameters: {} };
    const { commandOutcomes } = tick(state, [
      { type: "updateProgram", robotId: "robot.starter", program: draft },
    ]);
    expect(commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "invalidProgramDefinition",
    });
  });

  it("MVP-V80-004: nicht erlaubter Parameterwert -> invalidTemplateParameter", () => {
    const state = createInitialGame("mvp-default");
    const program = state.robots[0].programStack[3]; // exploreNearby
    const draft: ProgramInstance = structuredClone(program);
    draft.rows[0].then.parameters.targetFieldType = {
      type: "fieldType",
      value: "solarCollector",
    };
    const { commandOutcomes } = tick(state, [
      { type: "updateProgram", robotId: "robot.starter", program: draft },
    ]);
    expect(commandOutcomes[0].result).toEqual({
      type: "rejected",
      reason: "invalidTemplateParameter",
    });
  });

  it("MVP-V80-005: Stasis-Laden aendern -> programLocked", () => {
    const state = createInitialGame("mvp-default");
    const program = state.robots[0].programStack[4];
    const draft: ProgramInstance = structuredClone(program);
    draft.name = "Anders";
    const { commandOutcomes } = tick(state, [
      { type: "updateProgram", robotId: "robot.starter", program: draft },
    ]);
    expect(commandOutcomes[0].result).toEqual({ type: "rejected", reason: "programLocked" });
  });

  it("MVP-V80-006: bei rejected bleibt der ProgramStack unveraendert", () => {
    const state = createInitialGame("mvp-default");
    const before = JSON.stringify(state.robots[0].programStack);
    const program = state.robots[0].programStack[3];
    const draft: ProgramInstance = structuredClone(program);
    draft.rows[0].id = "row.starter.andere.main";
    const { state: next, commandOutcomes } = tick(state, [
      { type: "updateProgram", robotId: "robot.starter", program: draft },
    ]);
    expect(commandOutcomes[0].result.type).toBe("rejected");
    expect(JSON.stringify(next.robots[0].programStack)).toBe(before);
  });

  it("resetProgramToTemplate stellt kanonische Template-Instanz wieder her", () => {
    const state = createInitialGame("mvp-default");
    state.robots[0].programStack[0].name = "Umbenannt";
    state.robots[0].programStack[0].enabled = false;
    const { state: next } = tick(state, [
      {
        type: "resetProgramToTemplate",
        robotId: "robot.starter",
        programId: "program.starter.mineIronOre",
      },
    ]);
    const program = next.robots[0].programStack[0];
    expect(program.name).toBe("Iron Ore abbauen");
    expect(program.enabled).toBe(true);
    expect(program.rows[0].id).toBe("row.starter.mineIronOre.main");
  });

  it("resetRun erzeugt neuen deterministischen Startzustand", () => {
    const state = createInitialGame("mvp-default");
    let current = tick(state).state;
    current = tick(current).state;
    expect(current.tick).toBe(2);

    const { state: fresh } = tick(current, [{ type: "resetRun" }]);
    expect(fresh.tick).toBe(0);
    expect(fresh.randomSeed).toBe("mvp-default");
    expect(JSON.stringify(fresh)).toBe(JSON.stringify(createInitialGame("mvp-default")));

    const { state: other } = tick(current, [{ type: "resetRun", seed: "seed-2" }]);
    expect(other.randomSeed).toBe("seed-2");
  });
});
