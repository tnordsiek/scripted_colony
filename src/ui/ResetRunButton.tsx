import { useState } from "react";
import type { GameState, PlayerCommand } from "../sim/types";

type ResetRunButtonProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
};

export function ResetRunButton({ state, sendCommand }: ResetRunButtonProps) {
  const [seed, setSeed] = useState(state.randomSeed);

  return (
    <div className="reset-run">
      <input
        value={seed}
        onChange={(event) => setSeed(event.target.value)}
        placeholder="Seed"
        aria-label="Seed"
      />
      <button
        onClick={() =>
          sendCommand({ type: "resetRun", seed: seed.trim() || undefined })
        }
      >
        ↺ Reset
      </button>
    </div>
  );
}
