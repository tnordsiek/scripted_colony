// BuildingTask-Fortschritt, Abschluss und Baustellenfreigabe nach
// docs/03-technical/robot-task-lifecycle.md und simulation-rules.md.
import { manhattanDistance } from "../pathfinding";
import { scoreBuildingActivated } from "../scoring";
import type { BuildingTask, GameState, Robot } from "../types";

export type BuildingTaskCompletion =
  | { type: "none" }
  | { type: "progress"; buildingId: string }
  | { type: "activated"; buildingId: string };

export function processBuildingTask(
  state: GameState,
  robot: Robot,
  task: BuildingTask,
): BuildingTaskCompletion {
  if (task.startedTick >= state.tick) {
    return { type: "none" };
  }

  task.remainingTicks -= 1;
  if (task.remainingTicks > 0) {
    return { type: "none" };
  }

  // Abschlusspruefung.
  const building = state.buildings.find((entry) => entry.id === task.buildingId);
  const adjacent = manhattanDistance({ x: robot.x, y: robot.y }, task.site) === 1;

  if (!building || building.status !== "construction") {
    task.status = "aborted";
    task.abortReason = "targetInvalid";
    return { type: "none" };
  }
  if (!adjacent) {
    task.status = "aborted";
    task.abortReason = "notAdjacentToTarget";
    return { type: "none" };
  }
  if (robot.battery < task.batteryCostOnSuccess) {
    task.status = "aborted";
    task.abortReason = "insufficientBattery";
    return { type: "none" };
  }

  // Erfolgreiche Bauaktion.
  building.constructionProgress = (building.constructionProgress ?? 0) + 1;
  robot.battery -= task.batteryCostOnSuccess;
  task.status = "completed";
  task.completedTick = state.tick;

  if (
    (building.constructionProgress ?? 0) >= (building.constructionRequired ?? 1)
  ) {
    building.status = "active";
    // Score-Update nur beim ersten Wechsel zu active (pro buildingId einmal).
    scoreBuildingActivated(state, building.type);
    return { type: "activated", buildingId: building.id };
  }

  return { type: "progress", buildingId: building.id };
}
