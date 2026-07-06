// Programmstack-Anzeige pro Roboter mit abgeleitetem Status je Eintrag.
import { getProgramDiagnostics } from "../sim/diagnostics";
import type { GameState, PlayerCommand, Robot } from "../sim/types";
import { ProgramCard } from "./ProgramCard";

type ProgramStackPanelProps = {
  state: GameState;
  robot: Robot;
  sendCommand: (command: PlayerCommand) => void;
  onEdit: (programId: string) => void;
};

export function ProgramStackPanel({
  state,
  robot,
  sendCommand,
  onEdit,
}: ProgramStackPanelProps) {
  const diagnostics = getProgramDiagnostics(state, robot);
  const traces =
    diagnostics.type === "noExecutableProgram" ? diagnostics.reasons : [];

  function statusLabel(programId: string): string {
    if (robot.activeProgram?.programId === programId) {
      return "active";
    }
    const program = robot.programStack.find((entry) => entry.id === programId);
    if (program && !program.enabled) {
      return "skipped";
    }
    if (diagnostics.type === "startRow" && diagnostics.programId === programId) {
      return "ready";
    }
    const trace = traces.filter((entry) => entry.programId === programId).pop();
    if (!trace) {
      return "ready";
    }
    if (trace.result === "conditionFalse") {
      return "blocked";
    }
    if (trace.result === "actionNotExecutable") {
      return "blocked";
    }
    if (trace.result === "skipped") {
      return "skipped";
    }
    return "ready";
  }

  return (
    <div className="panel program-stack-panel">
      <h3>Programmstack</h3>
      {robot.programStack.map((program, index) => (
        <ProgramCard
          key={program.id}
          robot={robot}
          program={program}
          index={index}
          stackSize={robot.programStack.length}
          statusLabel={statusLabel(program.id)}
          sendCommand={sendCommand}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
