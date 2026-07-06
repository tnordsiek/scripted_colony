// Steuerleiste: Tick, Pause, Speed, Score, Zielstatus, Reset.
import type { GameState, PlayerCommand } from "../sim/types";
import { PauseButton } from "./PauseButton";
import { ResetRunButton } from "./ResetRunButton";
import { SpeedControls } from "./SpeedControls";

type BottomControlBarProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
};

export function BottomControlBar({ state, sendCommand }: BottomControlBarProps) {
  return (
    <div className="bottom-control-bar">
      <span className="tick-display">Tick {state.tick}</span>
      <PauseButton state={state} sendCommand={sendCommand} />
      <SpeedControls state={state} sendCommand={sendCommand} />
      <span className="score-display">Score {state.score.totalScore}</span>
      <span className={state.mvpGoalReached ? "goal-badge reached" : "goal-badge"}>
        {state.mvpGoalReached ? "Ziel erreicht" : "Ziel offen"}
      </span>
      <ResetRunButton state={state} sendCommand={sendCommand} />
    </div>
  );
}
