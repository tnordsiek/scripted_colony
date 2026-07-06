// Formular-/Zeileneditor fuer Template-Instanzen. Erzeugt nur updateProgram-Payloads,
// die der Template-Edit-Policy entsprechen (docs/03-technical/visual-programming-data-model.md).
import { useEffect, useState } from "react";
import { areExecutionLimitsUnlocked } from "../sim/research";
import type {
  ActionParameterValue,
  GameState,
  PlayerCommand,
  ProgramInstance,
  Robot,
} from "../sim/types";
import { ActionParameterEditor } from "./ActionParameterEditor";
import { ConditionEditor } from "./ConditionEditor";

type ProgramEditorPanelProps = {
  state: GameState;
  robot: Robot;
  programId: string;
  sendCommand: (command: PlayerCommand) => void;
  onClose: () => void;
};

export function ProgramEditorPanel({
  state,
  robot,
  programId,
  sendCommand,
  onClose,
}: ProgramEditorPanelProps) {
  const limitsUnlocked = areExecutionLimitsUnlocked(state);
  const program = robot.programStack.find((entry) => entry.id === programId);
  const [draft, setDraft] = useState<ProgramInstance | null>(
    program ? structuredClone(program) : null,
  );

  useEffect(() => {
    const current = robot.programStack.find((entry) => entry.id === programId);
    setDraft(current ? structuredClone(current) : null);
  }, [programId, robot]);

  if (!program || !draft) {
    return null;
  }

  if (program.locked) {
    return (
      <div className="panel program-editor-panel">
        <h3>Programm bearbeiten</h3>
        <p>Dieses Programm ist gesperrt und kann nicht bearbeitet werden.</p>
        <button onClick={onClose}>Schliessen</button>
      </div>
    );
  }

  function handleParameterChange(
    rowId: string,
    parameterKey: string,
    value: ActionParameterValue,
  ) {
    setDraft((previous) => {
      if (!previous) {
        return previous;
      }
      const next = structuredClone(previous);
      const row = next.rows.find((entry) => entry.id === rowId);
      if (row) {
        row.then.parameters[parameterKey] = value;
      }
      return next;
    });
  }

  return (
    <div className="panel program-editor-panel">
      <h3>Programm bearbeiten</h3>
      <label className="parameter-field">
        Name
        <input
          value={draft.name}
          onChange={(event) =>
            setDraft({ ...draft, name: event.target.value })
          }
        />
      </label>
      <label className="parameter-field">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
        />
        aktiviert
      </label>
      {limitsUnlocked && draft.rows[0]?.then.actionId === "action.buildBuilding" && (
        <label className="parameter-field">
          Ausfuehrungslimit
          <select
            value={
              draft.executionLimit?.type === "count"
                ? String(draft.executionLimit.maxExecutions)
                : (draft.executionLimit?.type ?? "unlimited")
            }
            onChange={(event) => {
              const value = event.target.value;
              const next = structuredClone(draft);
              if (value === "unlimited") {
                delete next.executionLimit;
              } else if (value === "once") {
                next.executionLimit = { type: "once" };
              } else {
                next.executionLimit = {
                  type: "count",
                  maxExecutions: Number(value),
                };
              }
              setDraft(next);
            }}
          >
            <option value="unlimited">unbegrenzt</option>
            <option value="once">einmal</option>
            {[2, 3, 5, 10].map((count) => (
              <option key={count} value={count}>
                {count}x
              </option>
            ))}
          </select>
        </label>
      )}
      {draft.rows.map((row) => (
        <div key={row.id} className="editor-row">
          <ConditionEditor ifCondition={row.if} stop={row.stop} />
          <ActionParameterEditor
            program={draft}
            row={row}
            onParameterChange={handleParameterChange}
          />
        </div>
      ))}
      <div className="editor-actions">
        <button
          onClick={() => {
            sendCommand({ type: "updateProgram", robotId: robot.id, program: draft });
            onClose();
          }}
        >
          Speichern
        </button>
        <button onClick={onClose}>Abbrechen</button>
      </div>
    </div>
  );
}
