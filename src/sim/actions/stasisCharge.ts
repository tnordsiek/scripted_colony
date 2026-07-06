// action.stasisCharge nach docs/03-technical/action-executability-matrix.md.
import { MVP_STASIS_ENTER_BATTERY, MVP_STASIS_TARGET_BATTERY } from "../constants";
import { createRobotTaskId } from "../ids";
import type {
  ActionExecutabilityResult,
  GameState,
  ProgramAction,
  ProgramInstanceId,
  ProgramRowId,
  Robot,
  StasisChargingTask,
} from "../types";

export function planStasisCharge(
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): ActionExecutabilityResult {
  if (robot.status === "destroyed" || robot.status === "inactive") {
    return { type: "notExecutable", reason: "robotNotActive" };
  }

  if (robot.chargingMode === "externalOnly") {
    return { type: "notExecutable", reason: "unsupportedMvpTarget" };
  }

  if (robot.battery > MVP_STASIS_ENTER_BATTERY) {
    return { type: "notExecutable", reason: "batteryTooLow" };
  }

  const plannedTask: StasisChargingTask = {
    id: createRobotTaskId(robot.id, "stasisCharging", state),
    type: "stasisCharging",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    targetBattery: MVP_STASIS_TARGET_BATTERY,
  };

  return { type: "executable", action, plannedTask };
}
