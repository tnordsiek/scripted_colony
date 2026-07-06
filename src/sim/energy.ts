// Globaler MVP-Power-Pool nach docs/04-systems/energy-system.md und tick-pipeline.md.
import { MVP_SOLAR_COLLECTOR_POWER_PROVIDED } from "./constants";
import type { EnergySnapshot, GameState } from "./types";

// Nur ProductionTasks mit status = inProgress und startedTick < currentTick
// zaehlen in powerRequired (Starttick-Ausschluss).
export function computeEnergySnapshot(state: GameState): EnergySnapshot {
  let powerProvided = 0;
  let powerRequired = 0;

  for (const building of state.buildings) {
    if (
      building.type === "solarCollector" &&
      building.status === "active" &&
      building.isEnabled
    ) {
      powerProvided += building.powerProvided ?? MVP_SOLAR_COLLECTOR_POWER_PROVIDED;
    }

    const task = building.productionTask;
    if (task && task.status === "inProgress" && task.startedTick < state.tick) {
      powerRequired += task.powerRequired;
    }
  }

  return {
    tick: state.tick,
    powerProvided,
    powerRequired,
    freePower: powerProvided - powerRequired,
  };
}
