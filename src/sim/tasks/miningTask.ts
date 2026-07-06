// MiningTask-Fortschritt und Abschluss nach docs/03-technical/simulation-rules.md
// und robot-task-lifecycle.md. Kein Teilfortschritt, Kosten nur bei Erfolg.
import { MVP_MINING_AMOUNT } from "../constants";
import { manhattanDistance } from "../pathfinding";
import { scoreMinedIronOre } from "../scoring";
import type { GameState, MiningTask, Robot } from "../types";

export function processMiningTask(
  state: GameState,
  robot: Robot,
  task: MiningTask,
): void {
  if (task.startedTick >= state.tick) {
    return;
  }

  task.remainingTicks -= 1;
  if (task.remainingTicks > 0) {
    return;
  }

  // Abschlusspruefung.
  const field = state.map[task.target.y]?.[task.target.x];
  const adjacent = manhattanDistance({ x: robot.x, y: robot.y }, task.target) === 1;
  const cargoUsed = Object.values(robot.cargo.used).reduce(
    (sum, amount) => sum + (amount ?? 0),
    0,
  );

  if (!field || !field.resource || field.resource.amount <= 0) {
    task.status = "aborted";
    task.abortReason = "resourceDepleted";
    return;
  }
  if (!adjacent) {
    task.status = "aborted";
    task.abortReason = "notAdjacentToTarget";
    return;
  }
  if (cargoUsed >= robot.cargo.capacity) {
    task.status = "aborted";
    task.abortReason = "cargoFull";
    return;
  }
  if (robot.battery < task.batteryCostOnSuccess) {
    task.status = "aborted";
    task.abortReason = "insufficientBattery";
    return;
  }

  // Erfolgreicher Abschluss.
  robot.cargo.used.ironOre = (robot.cargo.used.ironOre ?? 0) + MVP_MINING_AMOUNT;
  field.resource.amount -= MVP_MINING_AMOUNT;
  if (field.resource.amount <= 0) {
    // Erschoepftes Feld verliert seinen aktiven Ressourcentyp.
    delete field.resource;
  }
  robot.battery -= task.batteryCostOnSuccess;
  task.minedAmount += MVP_MINING_AMOUNT;
  scoreMinedIronOre(state, MVP_MINING_AMOUNT);

  task.status = "completed";
  task.completedTick = state.tick;
}
