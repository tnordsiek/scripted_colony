// Eventlog: neueste Player-Events oben; Debug-Events nur im Diagnosemodus.
import type { GameState } from "../sim/types";

type EventLogPanelProps = {
  state: GameState;
  showDebug: boolean;
};

export function EventLogPanel({ state, showDebug }: EventLogPanelProps) {
  const events = [...state.eventLog]
    .filter((event) => showDebug || event.visibility === "player")
    .reverse()
    .slice(0, 8);

  return (
    <div className="panel event-log-panel">
      <h3>Ereignisse</h3>
      <ul>
        {events.map((event) => (
          <li key={event.id} className={`event severity-${event.severity}`}>
            <span className="event-tick">[{event.tick}]</span> {event.message}
            {(event.repeatCount ?? 1) > 1 && (
              <span className="event-repeat"> ×{event.repeatCount}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
