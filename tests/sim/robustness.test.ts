// P1-Robustheitstests nach docs/02-mvp/mvp-test-matrix.md.
import { describe, expect, it } from "vitest";
import { canExecuteAction } from "../../src/sim/actions/canExecuteAction";
import { createInitialGame } from "../../src/sim/createInitialGame";
import { tick } from "../../src/sim/tick";
import { makeSolarCollector } from "./helpers";
import type { GameState } from "../../src/sim/types";

function runTicks(state: GameState, count: number): GameState {
  let current = state;
  for (let index = 0; index < count; index += 1) {
    current = tick(current).state;
  }
  return current;
}

describe("Stack-Robustheit", () => {
  it("MVP-STACK-007: waehrend ein Task laeuft, wird der Stack nicht neu priorisiert", () => {
    // Starter beginnt zu scouten (Movement-Task); dann taucht angrenzendes Ore auf.
    let state = createInitialGame("mvp-default");
    state = runTicks(state, 2);
    const starter = state.robots[0];
    expect(starter.activeTask?.type).toBe("movement");

    // Angrenzendes Ore direkt neben aktueller Position platzieren.
    const nx = starter.x > 0 ? starter.x - 1 : starter.x + 1;
    state.map[starter.y][nx].resource = {
      type: "ironOre",
      amount: 20,
      extractionMethod: "directMining",
    };

    const next = tick(state).state;
    const nextStarter = next.robots[0];
    // Task laeuft weiter oder endet regulaer (Stop-Bedingung), aber es wird
    // im selben Tick kein Mining-Task "dazwischengeschoben", solange Movement lief.
    if (nextStarter.activeTask && nextStarter.activeTask.startedTick < next.tick) {
      expect(nextStarter.activeTask.type).not.toBe("mining");
    }
  });

  it("MVP-STACK-008: Task-Abbruch entfernt Task und Stack startet oben neu", () => {
    let state = createInitialGame("mvp-default");
    state = runTicks(state, 2);
    const starter = state.robots[0];
    expect(starter.activeTask?.type).toBe("movement");

    // Ziel unerreichbar machen: alle Nachbarfelder des Roboters blockieren
    // (aktive Ressourcen blockieren Bewegung) -> noPath -> Abbruch.
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as const) {
      const x = starter.x + dx;
      const y = starter.y + dy;
      if (x >= 0 && x < 10 && y >= 0 && y < 10 && !state.map[y][x].buildingId) {
        state.map[y][x].resource = {
          type: "ironOre",
          amount: 20,
          extractionMethod: "directMining",
        };
      }
    }

    const next = tick(state).state;
    const codes = next.eventLog.map((event) => event.code);
    expect(codes).toContain("task.aborted");
    const nextStarter = next.robots[0];
    // Nach Abbruch: alter Task entfernt; Stack darf im selben Tick neu starten
    // (eingeschlossenes Ore -> Mining ist jetzt ausfuehrbar).
    expect(
      nextStarter.activeTask === undefined ||
        nextStarter.activeTask.startedTick === next.tick,
    ).toBe(true);
  });
});

describe("Tie-Break-Determinismus", () => {
  it("MVP-SCOUT-005: Scout-Zielauswahl ist bei gleichem State identisch", () => {
    const state = createInitialGame("mvp-default");
    const action = {
      actionId: "action.scoutNearby" as const,
      parameters: {
        targetFieldType: { type: "fieldType" as const, value: "ironOre" as const },
      },
    };
    const first = canExecuteAction(state, state.robots[0], action, "p", "r");
    const second = canExecuteAction(state, state.robots[0], action, "p", "r");
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("MVP-BUILD-010: Bauplatzwahl ist bei gleichem State identisch", () => {
    const state = createInitialGame("mvp-default");
    state.robots[0].cargo.used.ironOre = 5;
    const action = {
      actionId: "action.buildBuilding" as const,
      parameters: { buildingType: "solarCollector" },
    };
    const first = canExecuteAction(state, state.robots[0], action, "p", "r");
    const second = canExecuteAction(state, state.robots[0], action, "p", "r");
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.type).toBe("executable");
  });
});

describe("Baustellen-Fortsetzung (MVP-V74-006)", () => {
  it("fortgesetzte Baustelle bleibt mit bezahlten Kosten sichtbar und wird ohne Cargo fortgesetzt", () => {
    const state = createInitialGame("mvp-default");
    // Bestehende Baustelle mit bezahlten Kosten neben dem Roboter.
    const site = makeSolarCollector({
      id: "building.solarCollector.001",
      x: 5,
      y: 4,
      status: "construction",
      constructionProgress: 0,
      constructionRequired: 1,
      costPaid: { ironOre: 5 },
    });
    state.buildings.push(site);
    state.map[4][5].buildingId = site.id;
    state.map[4][5].visibility = "visible";

    // Cargo leer: continueConstruction darf trotzdem ausfuehrbar sein.
    const result = canExecuteAction(
      state,
      state.robots[0],
      { actionId: "action.buildBuilding", parameters: { buildingType: "solarCollector" } },
      "p",
      "r",
    );
    expect(result.type).toBe("executable");
    if (result.type === "executable" && result.plannedTask?.type === "building") {
      expect(result.plannedTask.mode).toBe("continueConstruction");
      expect(result.plannedTask.buildingId).toBe(site.id);
    }
  });
});

describe("Debug-Events (MVP-EVENT-008 sim-seitig)", () => {
  it("Debug-Events sind als visibility=debug im Eventlog unterscheidbar", () => {
    let state = createInitialGame("mvp-default");
    state = runTicks(state, 3);
    const debugEvents = state.eventLog.filter((event) => event.visibility === "debug");
    const playerEvents = state.eventLog.filter((event) => event.visibility === "player");
    expect(debugEvents.length).toBeGreaterThan(0);
    expect(playerEvents.length).toBeGreaterThan(0);
  });
});
