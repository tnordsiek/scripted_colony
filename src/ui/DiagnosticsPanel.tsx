// Diagnoseansicht: Programm-Auswertungs-Trace und Debug-Events.
import { getProgramDiagnostics } from "../sim/diagnostics";
import type { GameState } from "../sim/types";

type DiagnosticsPanelProps = {
  state: GameState;
  expanded: boolean;
  onToggle: () => void;
};

export function DiagnosticsPanel({ state, expanded, onToggle }: DiagnosticsPanelProps) {
  const starter = state.robots.find((robot) => robot.type === "starterRobot");

  return (
    <div className="panel diagnostics-panel">
      <button onClick={onToggle}>
        {expanded ? "Diagnose ausblenden" : "Diagnose anzeigen"}
      </button>
      {expanded && starter && (
        <div className="diagnostics-content">
          <h4>Programm-Auswertung ({starter.name})</h4>
          {(() => {
            const result = getProgramDiagnostics(state, starter);
            if (result.type === "startRow") {
              return (
                <div>
                  Naechste ausfuehrbare Zeile: {result.programId} / {result.rowId}
                </div>
              );
            }
            return (
              <ul>
                {result.reasons.map((trace, index) => (
                  <li key={`${trace.programId}-${trace.rowId ?? index}`}>
                    {trace.programId}
                    {trace.rowId ? ` / ${trace.rowId}` : ""}: {trace.result}
                  </li>
                ))}
              </ul>
            );
          })()}
          <h4>Debug-Events</h4>
          <ul>
            {[...state.eventLog]
              .filter((event) => event.visibility === "debug")
              .reverse()
              .slice(0, 10)
              .map((event) => (
                <li key={event.id}>
                  [{event.tick}] {event.code}
                  {event.details?.reason ? ` (${event.details.reason})` : ""}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
