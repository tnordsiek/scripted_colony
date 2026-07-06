// Feldinfo-Tooltip beim Hover (docs/04-systems/ui-components-contract.md).
import type { GameState } from "../sim/types";

export type TooltipInfo = {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
};

type MapTileTooltipProps = {
  state: GameState;
  info: TooltipInfo;
};

export function MapTileTooltip({ state, info }: MapTileTooltipProps) {
  const field = state.map[info.y]?.[info.x];
  if (!field) {
    return null;
  }

  const lines: string[] = [`Feld [${info.x}, ${info.y}]`, `Sicht: ${field.visibility}`];

  if (field.visibility !== "unknown") {
    lines.push(`Terrain: ${field.terrainType}`);
    if (field.visibility === "visible" && field.resource) {
      lines.push(`Iron Ore: ${field.resource.amount}`);
    }
    if (field.buildingId) {
      const building = state.buildings.find((entry) => entry.id === field.buildingId);
      if (building) {
        lines.push(`Gebaeude: ${building.type} (${building.status})`);
      }
    }
    const robot = state.robots.find(
      (entry) => entry.x === info.x && entry.y === info.y,
    );
    if (robot && field.visibility === "visible") {
      lines.push(`Roboter: ${robot.name}`);
    }
  }

  return (
    <div
      className="map-tooltip"
      style={{ left: info.screenX + 14, top: info.screenY + 14 }}
    >
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
