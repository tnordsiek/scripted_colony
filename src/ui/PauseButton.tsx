import type { GameState, PlayerCommand } from "../sim/types";

type PauseButtonProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
};

export function PauseButton({ state, sendCommand }: PauseButtonProps) {
  return (
    <button
      onClick={() => sendCommand({ type: state.isPaused ? "resume" : "pause" })}
    >
      {state.isPaused ? "▶ Weiter" : "⏸ Pause"}
    </button>
  );
}
