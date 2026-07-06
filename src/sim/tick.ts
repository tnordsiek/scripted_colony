// Oeffentliche Tick-Funktion. resetRun erzeugt einen neuen deterministischen
// Startzustand nach docs/03-technical/reset-seed-and-persistence.md.
import { applyPlayerCommands, type CommandOutcome } from "./commands";
import { createInitialGame } from "./createInitialGame";
import { finalizeTickEvents, type GameEventCandidate } from "./events";
import { advanceTick, type TickResult } from "./tickPipeline";
import type { GameState, PlayerCommand } from "./types";

export function tick(
  state: GameState,
  commands: PlayerCommand[] = [],
): TickResult {
  const resetCommand = commands.find(
    (command): command is Extract<PlayerCommand, { type: "resetRun" }> =>
      command.type === "resetRun",
  );

  if (resetCommand) {
    if (resetCommand.seed !== undefined && resetCommand.seed.trim() === "") {
      // Ungueltiger Seed: Command rejected, Tick laeuft ohne Reset weiter.
      return advanceTick(
        state,
        commands.filter((command) => command.type !== "resetRun"),
      );
    }
    const seed = resetCommand.seed ?? state.randomSeed;
    return {
      state: createInitialGame(seed),
      commandOutcomes: [{ command: resetCommand, result: { type: "accepted" } }],
    };
  }

  return advanceTick(state, commands);
}

// Verarbeitet Commands waehrend der Pause, ohne die Simulation fortzuschreiben.
// Die UI nutzt dies fuer pause/resume/Auswahl/Programm-Editing im Pausenmodus.
export function applyCommandsWhilePaused(
  state: GameState,
  commands: PlayerCommand[],
): { state: GameState; commandOutcomes: CommandOutcome[] } {
  const resetCommand = commands.find(
    (command): command is Extract<PlayerCommand, { type: "resetRun" }> =>
      command.type === "resetRun" &&
      (command.seed === undefined || command.seed.trim() !== ""),
  );
  if (resetCommand) {
    return {
      state: createInitialGame(resetCommand.seed ?? state.randomSeed),
      commandOutcomes: [{ command: resetCommand, result: { type: "accepted" } }],
    };
  }

  const next = structuredClone(state);
  const events: GameEventCandidate[] = [];
  const commandOutcomes = applyPlayerCommands(next, commands, events);
  finalizeTickEvents(next, events);
  return { state: next, commandOutcomes };
}
