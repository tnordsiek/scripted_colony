import type { GameState, PlayerCommand } from "../sim/types";

type SpeedControlsProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
};

export function SpeedControls({ state, sendCommand }: SpeedControlsProps) {
  return (
    <div className="speed-controls">
      {([1, 2, 4] as const).map((speed) => (
        <button
          key={speed}
          className={state.speed === speed ? "active" : ""}
          onClick={() => sendCommand({ type: "setSpeed", speed })}
        >
          {speed}x
        </button>
      ))}
    </div>
  );
}
