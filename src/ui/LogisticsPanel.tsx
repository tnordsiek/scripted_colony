// Logistik-Uebersicht (Expansion 2): offene, laufende und blockierte
// MaterialRequests mit Status/Blockade. Sichtbar, sobald die Logistik
// freigeschaltet ist (docs/02-mvp/expansion-2-scope.md).
import { isLogisticsUnlocked } from "../sim/research";
import type {
  GameState,
  MaterialRequest,
  MaterialRequestStatus,
  MaterialRequestType,
} from "../sim/types";

const TYPE_LABELS: Record<MaterialRequestType, string> = {
  moveToStorage: "Cargo → Speicher",
  supplyBuildingInput: "Input beliefern",
  supplyConstruction: "Baustelle beliefern",
  clearBuildingOutput: "Output räumen",
};

const STATUS_LABELS: Record<MaterialRequestStatus, string> = {
  open: "offen",
  reserved: "reserviert",
  assigned: "zugewiesen",
  pickupInProgress: "Abholung",
  deliveryInProgress: "Lieferung",
  fulfilled: "erledigt",
  blocked: "blockiert",
  cancelled: "storniert",
};

const RESOURCE_LABELS: Record<string, string> = {
  ironOre: "Iron Ore",
  steelPlates: "Steel Plates",
};

function resourceText(request: MaterialRequest): string {
  return Object.entries(request.resources)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([resource, amount]) => `${amount}× ${RESOURCE_LABELS[resource] ?? resource}`)
    .join(", ");
}

type LogisticsPanelProps = {
  state: GameState;
};

export function LogisticsPanel({ state }: LogisticsPanelProps) {
  if (!isLogisticsUnlocked(state)) {
    return null;
  }

  // Nur aktive Vorgaenge; erledigte/stornierte blenden wir aus.
  const active = state.materialRequests.filter(
    (request) => request.status !== "fulfilled" && request.status !== "cancelled",
  );

  return (
    <div className="panel logistics-panel">
      <h3>Logistik ({active.length})</h3>
      {active.length === 0 ? (
        <div className="logistics-empty">Keine offenen Auftraege.</div>
      ) : (
        <ul>
          {active.map((request) => (
            <li key={request.id} className="logistics-entry">
              <span className="logistics-type">{TYPE_LABELS[request.type]}</span>{" "}
              <span className="logistics-resources">{resourceText(request)}</span>
              <span
                className={`status-badge ${
                  request.status === "blocked" ? "warning" : ""
                }`}
              >
                {STATUS_LABELS[request.status]}
                {request.blockedReason ? `: ${request.blockedReason}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
