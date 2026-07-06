// Stasis-Laden: kontinuierlicher Tick-Effekt nach docs/03-technical/simulation-rules.md.
import { MVP_SELF_CHARGE_RATE } from "../constants";
import type { GameState, Robot, StasisChargingTask } from "../types";

export function processStasisChargingTask(
  state: GameState,
  robot: Robot,
  task: StasisChargingTask,
): void {
  if (task.startedTick >= state.tick) {
    return;
  }

  robot.battery = Math.min(robot.batteryMax, robot.battery + MVP_SELF_CHARGE_RATE);

  // Stop-Bedingung pro Tick pruefen.
  if (robot.battery >= task.targetBattery) {
    task.status = "completed";
    task.completedTick = state.tick;
  }
}
