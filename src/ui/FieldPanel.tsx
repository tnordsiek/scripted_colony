// Felddetails: Koordinaten, Sichtstatus, Terrain, Inhalt, Bebaubarkeit.
import { isFieldPassable } from "../sim/pathfinding";
import type { GameState } from "../sim/types";

type FieldPanelProps = {
  state: GameState;
  x: number;
  y: number;
};

export function FieldPanel({ state, x, y }: FieldPanelProps) {
  const field = state.map[y]?.[x];
  if (!field) {
    return null;
  }

  const robot = state.robots.find((entry) => entry.x === x && entry.y === y);
  const building = field.buildingId
    ? state.buildings.find((entry) => entry.id === field.buildingId)
    : undefined;
  const known = field.visibility !== "unknown";

  return (
    <div className="panel field-panel">
      <h3>
        Feld [{x}, {y}]
      </h3>
      <ul>
        <li>Sicht: {field.visibility}</li>
        {known && <li>Terrain: {field.terrainType}</li>}
        {field.visibility === "visible" && field.resource && (
          <li>
            Ressource: Iron Ore ({field.resource.amount})
          </li>
        )}
        {known && building && (
          <li>
            Gebaeude: {building.type} ({building.status})
          </li>
        )}
        {field.visibility === "visible" && robot && <li>Roboter: {robot.name}</li>}
        {known && (
          <>
            <li>Begehbar: {isFieldPassable(field) && !robot ? "ja" : "nein"}</li>
            <li>
              Bebaubar:{" "}
              {isFieldPassable(field) && !robot && field.visibility === "visible"
                ? "ja"
                : "nein"}
            </li>
          </>
        )}
        {field.reservedForConstruction && <li>Reserviert fuer Bau</li>}
      </ul>
    </div>
  );
}
