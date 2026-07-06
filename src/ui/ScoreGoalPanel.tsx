import type { GameState } from "../sim/types";

export function ScoreGoalPanel({ state }: { state: GameState }) {
  const { score } = state;
  return (
    <div className="panel score-goal-panel">
      <h3>Score &amp; Ziel</h3>
      <div className="score-total">{score.totalScore} Punkte</div>
      <ul>
        <li>Iron Ore abgebaut: {score.minedIronOre}</li>
        <li>Solar Collectors: {score.builtSolarCollectors}</li>
        <li>Roboterfabriken: {score.builtRobotFactories}</li>
        <li>Gespawnte Roboter: {score.spawnedRobots}</li>
        <li>Ticks: {score.elapsedTicks}</li>
      </ul>
      <div className={state.mvpGoalReached ? "goal reached" : "goal open"}>
        {state.mvpGoalReached
          ? "✔ MVP-Ziel erreicht: Iron Miner gespawnt!"
          : "Ziel: Ersten Iron Miner produzieren und spawnen"}
      </div>
    </div>
  );
}
