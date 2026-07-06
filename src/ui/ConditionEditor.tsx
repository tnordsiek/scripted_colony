// Anzeige der IF-/STOP-Bedingungen im Editor. Im MVP sind Bedingungsstrukturen
// nicht editierbar (Edit-Policy erlaubt nur Name, enabled und Action-Parameter).
import type { ConditionExpression, StopConditionGroup } from "../sim/types";
import { describeCondition } from "./ProgramRowView";

type ConditionEditorProps = {
  ifCondition: ConditionExpression;
  stop: StopConditionGroup;
};

export function ConditionEditor({ ifCondition, stop }: ConditionEditorProps) {
  return (
    <div className="condition-editor">
      <div>
        <strong>WENN</strong> {describeCondition(ifCondition)}
      </div>
      <div>
        <strong>STOP</strong> {stop.conditions.map(describeCondition).join(" ODER ")}
      </div>
      <p className="editor-hint">
        Bedingungen sind im MVP templatefest und nicht editierbar.
      </p>
    </div>
  );
}
