// Editor fuer freigegebene Action-Parameter nach MVP_PROGRAM_EDIT_POLICIES.
import { MVP_PROGRAM_EDIT_POLICIES } from "../sim/programEditing";
import type {
  ActionParameterValue,
  ProgramInstance,
  ProgramRow,
} from "../sim/types";
import { describeAction } from "./ProgramRowView";

type ActionParameterEditorProps = {
  program: ProgramInstance;
  row: ProgramRow;
  onParameterChange: (
    rowId: string,
    parameterKey: string,
    value: ActionParameterValue,
  ) => void;
};

function valueLabel(value: ActionParameterValue): string {
  if (typeof value === "object" && value !== null && "value" in value) {
    return JSON.stringify(value.value);
  }
  return String(value);
}

export function ActionParameterEditor({
  program,
  row,
  onParameterChange,
}: ActionParameterEditorProps) {
  const policy = MVP_PROGRAM_EDIT_POLICIES.find(
    (entry) => entry.templateId === program.templateId,
  );

  return (
    <div className="action-parameter-editor">
      <div>
        <strong>DANN</strong> {describeAction(row.then.actionId, row.then.parameters)}
      </div>
      {Object.entries(row.then.parameters).map(([key, currentValue]) => {
        const allowed = policy?.allowedActionParameterValues?.[key] ?? [];
        return (
          <label key={key} className="parameter-field">
            {key}
            <select
              value={valueLabel(currentValue)}
              disabled={allowed.length <= 1}
              onChange={(event) => {
                const next = allowed.find(
                  (candidate) => valueLabel(candidate) === event.target.value,
                );
                if (next !== undefined) {
                  onParameterChange(row.id, key, next);
                }
              }}
            >
              {(allowed.length > 0 ? allowed : [currentValue]).map((candidate) => (
                <option key={valueLabel(candidate)} value={valueLabel(candidate)}>
                  {valueLabel(candidate)}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
}
