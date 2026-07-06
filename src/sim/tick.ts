// Oeffentliche Tick-Funktion. resetRun erzeugt einen neuen deterministischen
// Startzustand nach docs/03-technical/reset-seed-and-persistence.md.
import { createInitialGame } from "./createInitialGame";
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
