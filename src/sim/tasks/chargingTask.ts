// Externes Laden an einer Ladezone (Expansion 2, docs/02-mvp/expansion-2-scope.md).
// +5 Batterie/Tick, sofern die Energie-Zuteilung den Ladeverbraucher bedient hat.
import { EXP2_EXTERNAL_CHARGE_RATE } from "../constants";
import { isChargingZone } from "../energy";
import type { ChargingTask, GameState, Robot } from "../types";

export function processChargingTask(
  state: GameState,
  robot: Robot,
  task: ChargingTask,
  powerGranted: boolean,
): void {
  if (task.startedTick >= state.tick) {
    return; // erster Fortschritt erst im Folgetick
  }

  if (!isChargingZone(state, { x: robot.x, y: robot.y })) {
    task.status = "aborted";
    task.abortReason = "noReachableChargingField";
    return;
  }

  if (!powerGranted) {
    return; // pausiert ohne Leistung; kein Batterieverlust, kein Abbruch
  }

  robot.battery = Math.min(
    robot.batteryMax,
    robot.battery + EXP2_EXTERNAL_CHARGE_RATE,
  );

  if (robot.battery >= task.targetBattery) {
    task.status = "completed";
    task.completedTick = state.tick;
  }
}
