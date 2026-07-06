// Ergebnisuebersicht nach Erreichen des MVP-Ziels
// (docs/04-systems/scoring-and-win-conditions.md: vollstaendiger ScoreState).
import type { GameState, PlayerCommand } from "../sim/types";

type RunResultOverlayProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
  onClose: () => void;
};

export function RunResultOverlay({
  state,
  sendCommand,
  onClose,
}: RunResultOverlayProps) {
  const { score } = state;

  return (
    <div className="overlay-backdrop">
      <div className="panel run-result-overlay">
        <h2>MVP-Ziel erreicht!</h2>
        <p>Der erste Iron Miner wurde erfolgreich gespawnt.</p>
        <table className="result-table">
          <tbody>
            <tr>
              <td>Iron Ore abgebaut</td>
              <td>{score.minedIronOre}</td>
            </tr>
            <tr>
              <td>Solar Collectors gebaut</td>
              <td>{score.builtSolarCollectors}</td>
            </tr>
            <tr>
              <td>Roboterfabriken gebaut</td>
              <td>{score.builtRobotFactories}</td>
            </tr>
            <tr>
              <td>Gebaeude gesamt</td>
              <td>{score.builtBuildings}</td>
            </tr>
            <tr>
              <td>Gespawnte Roboter</td>
              <td>{score.spawnedRobots}</td>
            </tr>
            <tr>
              <td>Zielbonus vergeben</td>
              <td>{score.goalBonusAwarded ? "ja (+200)" : "nein"}</td>
            </tr>
            <tr>
              <td>Benoetigte Ticks</td>
              <td>{score.elapsedTicks}</td>
            </tr>
            <tr className="result-total">
              <td>Gesamtscore</td>
              <td>{score.totalScore}</td>
            </tr>
          </tbody>
        </table>
        <div className="editor-actions">
          <button onClick={onClose}>Weiterspielen</button>
          <button
            onClick={() => {
              sendCommand({ type: "resetRun" });
              onClose();
            }}
          >
            Neuer Run
          </button>
        </div>
      </div>
    </div>
  );
}
