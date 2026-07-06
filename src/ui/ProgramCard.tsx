// Einzelner Programmstack-Eintrag mit Status und Steuerbuttons.
import type { PlayerCommand, ProgramInstance, Robot } from "../sim/types";
import { ProgramRowView } from "./ProgramRowView";

type ProgramCardProps = {
  robot: Robot;
  program: ProgramInstance;
  index: number;
  stackSize: number;
  statusLabel: string;
  sendCommand: (command: PlayerCommand) => void;
  onEdit: (programId: string) => void;
};

export function ProgramCard({
  robot,
  program,
  index,
  stackSize,
  statusLabel,
  sendCommand,
  onEdit,
}: ProgramCardProps) {
  const locked = program.locked === true;
  const isActive = robot.activeProgram?.programId === program.id;

  return (
    <div
      className={`program-card status-${statusLabel}${isActive ? " running" : ""}${
        program.enabled ? "" : " disabled"
      }`}
    >
      <div className="program-card-header">
        <span className="program-position">{index + 1}.</span>
        <span className="program-name">{program.name}</span>
        <span className="program-status">{locked ? "locked" : statusLabel}</span>
      </div>
      {program.rows.map((row) => (
        <ProgramRowView key={row.id} row={row} />
      ))}
      <div className="program-card-actions">
        <button
          disabled={locked}
          onClick={() =>
            sendCommand({
              type: "toggleProgramEnabled",
              robotId: robot.id,
              programId: program.id,
            })
          }
        >
          {program.enabled ? "Deaktivieren" : "Aktivieren"}
        </button>
        <button
          disabled={locked || index === 0}
          onClick={() =>
            sendCommand({
              type: "moveProgramUp",
              robotId: robot.id,
              programId: program.id,
            })
          }
        >
          ↑
        </button>
        <button
          disabled={locked || index >= stackSize - 2}
          onClick={() =>
            sendCommand({
              type: "moveProgramDown",
              robotId: robot.id,
              programId: program.id,
            })
          }
        >
          ↓
        </button>
        <button disabled={locked} onClick={() => onEdit(program.id)}>
          Bearbeiten
        </button>
        <button
          disabled={locked}
          onClick={() =>
            sendCommand({
              type: "resetProgramToTemplate",
              robotId: robot.id,
              programId: program.id,
            })
          }
        >
          Reset
        </button>
        <button
          disabled={locked}
          onClick={() =>
            sendCommand({
              type: "removeProgram",
              robotId: robot.id,
              programId: program.id,
            })
          }
        >
          ✕
        </button>
      </div>
    </div>
  );
}
