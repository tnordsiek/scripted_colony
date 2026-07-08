// Zentrale Executability-Pruefung nach docs/03-technical/action-executability-matrix.md.
import { MVP_STASIS_ENTER_BATTERY } from "../constants";
import type {
  ActionExecutabilityResult,
  GameState,
  ProgramAction,
  ProgramInstanceId,
  ProgramRowId,
  Robot,
} from "../types";
import { planBuildBuilding } from "./buildBuilding";
import { planCharge } from "./charge";
import { planMineResource } from "./mineResource";
import { planScoutNearby } from "./scoutNearby";
import { planStasisCharge } from "./stasisCharge";
import { planLogistics } from "../logistics";

export function canExecuteAction(
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  sourceProgramId: ProgramInstanceId = "",
  sourceRowId: ProgramRowId = "",
): ActionExecutabilityResult {
  if (robot.activeTask && robot.activeTask.status === "running") {
    return { type: "notExecutable", reason: "taskAlreadyRunning" };
  }

  // Stasis-Laden hat eigene Status-/Batterieregeln.
  if (action.actionId === "action.stasisCharge") {
    return planStasisCharge(state, robot, action, sourceProgramId, sourceRowId);
  }

  if (robot.status === "stasis") {
    return { type: "notExecutable", reason: "robotInStasis" };
  }
  if (robot.status !== "active") {
    return { type: "notExecutable", reason: "robotNotActive" };
  }
  if (robot.battery <= MVP_STASIS_ENTER_BATTERY) {
    return { type: "notExecutable", reason: "batteryTooLow" };
  }

  switch (action.actionId) {
    case "action.scoutNearby":
      return planScoutNearby(state, robot, action, sourceProgramId, sourceRowId);
    case "action.mineResource":
      return planMineResource(state, robot, action, sourceProgramId, sourceRowId);
    case "action.buildBuilding":
      return planBuildBuilding(state, robot, action, sourceProgramId, sourceRowId);
    case "action.charge":
      // Expansion 2: externes Laden am Ladenetz.
      return planCharge(state, robot, action, sourceProgramId, sourceRowId);
    case "action.logistics":
      // Expansion 2: zugewiesenen MaterialRequest ausfuehren.
      return planLogistics(state, robot, action, sourceProgramId, sourceRowId);
    default:
      return { type: "notExecutable", reason: "unsupportedMvpAction" };
  }
}
