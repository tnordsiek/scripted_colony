// Abgeleitete Diagnoseansichten nach docs/03-technical/diagnostics-and-eventlog.md.
// idle ist kein RobotStatus, sondern ein abgeleiteter RobotActivityState.
import { canExecuteAction } from "./actions/canExecuteAction";
import { evaluateProgramStack } from "./programs";
import type {
  GameState,
  ProgramEvaluationResult,
  Robot,
  RobotActivityState,
} from "./types";

export function deriveRobotActivityState(robot: Robot): RobotActivityState {
  if (robot.activeTask?.type === "stasisCharging") {
    return "stasisCharging";
  }
  if (robot.activeTask && robot.activeTask.status === "running") {
    return "runningTask";
  }
  if (robot.activeProgram) {
    return "executingProgram";
  }
  return "idle";
}

// Dry-Run der Stack-Auswertung fuer das DiagnosticsPanel (keine State-Mutation).
export function getProgramDiagnostics(
  state: GameState,
  robot: Robot,
): ProgramEvaluationResult {
  return evaluateProgramStack(state, robot, (evalState, evalRobot, action, rowId) =>
    canExecuteAction(evalState, evalRobot, action, "", rowId ?? ""),
  );
}
