// Karten-Rendering per Canvas 2D mit Fallback-Assets nach
// docs/05-assets/asset-fallbacks.md und docs/04-systems/ui-components-contract.md.
import { useEffect, useRef, useState } from "react";
import { resolveAsset } from "../sim/assets";
import type { GameState, PlayerCommand } from "../sim/types";
import { MapTileTooltip, type TooltipInfo } from "./MapTileTooltip";

const TILE = 48;

type MapCanvasProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
};

function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
}

export function MapCanvas({ state, sendCommand }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const width = state.map[0]?.length ?? 10;
  const height = state.map.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const plains = resolveAsset("terrain.plains").source ?? "#c2a36b";
    const fogUnknown = resolveAsset("fog.unknown").source ?? "#181512";
    const fogDiscovered = resolveAsset("fog.discovered").source ?? "rgba(0,0,0,0.5)";
    const oreColor = resolveAsset("resource.ironOre").source ?? "#b0622a";
    const selectionColor = resolveAsset("ui.selection").source ?? "#f2e14c";
    const reservationColor = resolveAsset("ui.reservation").source ?? "#4cf2a5";
    const constructionOverlay =
      resolveAsset("building.construction").source ?? "rgba(255,255,255,0.35)";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const row of state.map) {
      for (const field of row) {
        // Layer 1: Terrain / Fog.
        if (field.visibility === "unknown") {
          drawTile(ctx, field.x, field.y, fogUnknown);
          continue; // keine Inhalte auf unbekannten Feldern
        }

        drawTile(ctx, field.x, field.y, plains);

        // Layer 2: Ressourcen nur bei visible (kein Resource-Leak).
        if (field.visibility === "visible" && field.resource) {
          ctx.fillStyle = oreColor;
          const inset = TILE * 0.22;
          ctx.fillRect(
            field.x * TILE + inset,
            field.y * TILE + inset,
            TILE - inset * 2,
            TILE - inset * 2,
          );
        }

        // Layer: Reservierung (gestrichelt).
        if (field.reservedForConstruction) {
          ctx.strokeStyle = reservationColor;
          ctx.setLineDash([4, 3]);
          ctx.lineWidth = 2;
          ctx.strokeRect(field.x * TILE + 3, field.y * TILE + 3, TILE - 6, TILE - 6);
          ctx.setLineDash([]);
        }

        // Fog-Abdunklung fuer discovered zuletzt pro Feld (Gebaeudeform bleibt sichtbar).
        if (field.visibility === "discovered") {
          drawTile(ctx, field.x, field.y, fogDiscovered);
        }
      }
    }

    // Layer 3: Gebaeude (statische Form auch auf discovered sichtbar).
    for (const building of state.buildings) {
      const field = state.map[building.y][building.x];
      if (field.visibility === "unknown") {
        continue;
      }
      const assetKey =
        building.type === "solarCollector"
          ? "building.solarCollector"
          : building.type === "robotFactory"
            ? "building.robotFactory"
            : building.type === "aiResearchCenter"
              ? "building.aiResearchCenter"
              : building.type === "steelworks"
                ? "building.steelworks"
                : "building.energyStorage";
      const color = resolveAsset(assetKey).source ?? "#888";
      ctx.fillStyle = color;
      const inset = TILE * 0.12;
      ctx.fillRect(
        building.x * TILE + inset,
        building.y * TILE + inset,
        TILE - inset * 2,
        TILE - inset * 2,
      );
      ctx.fillStyle = "#111";
      ctx.font = "bold 16px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const letters: Record<string, string> = {
        solarCollector: "S",
        robotFactory: "F",
        aiResearchCenter: "Z",
        steelworks: "W",
        energyStorage: "E",
      };
      ctx.fillText(
        letters[building.type] ?? "?",
        building.x * TILE + TILE / 2,
        building.y * TILE + TILE / 2,
      );
      if (building.status === "construction") {
        ctx.fillStyle = constructionOverlay;
        ctx.fillRect(
          building.x * TILE + inset,
          building.y * TILE + inset,
          TILE - inset * 2,
          TILE - inset * 2,
        );
        ctx.strokeStyle = "#f2e14c";
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(
          building.x * TILE + inset,
          building.y * TILE + inset,
          TILE - inset * 2,
          TILE - inset * 2,
        );
        ctx.setLineDash([]);
      }
    }

    // Layer 4: Roboter (nur auf aktuell sichtbaren Feldern).
    for (const robot of state.robots) {
      const field = state.map[robot.y][robot.x];
      if (field.visibility !== "visible") {
        continue;
      }
      const assetKey =
        robot.type === "starterRobot" ? "robot.starterRobot" : "robot.ironMiner";
      ctx.fillStyle = resolveAsset(assetKey).source ?? "#3f7fd1";
      ctx.beginPath();
      ctx.arc(
        robot.x * TILE + TILE / 2,
        robot.y * TILE + TILE / 2,
        TILE * 0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      if (robot.status === "stasis") {
        ctx.strokeStyle = "#9fe8ff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Layer 5: Auswahl.
    const selected = state.selected;
    if (selected) {
      let sx = -1;
      let sy = -1;
      if (selected.type === "field") {
        sx = selected.x;
        sy = selected.y;
      } else if (selected.type === "robot") {
        const robot = state.robots.find((entry) => entry.id === selected.id);
        if (robot) {
          sx = robot.x;
          sy = robot.y;
        }
      } else {
        const building = state.buildings.find((entry) => entry.id === selected.id);
        if (building) {
          sx = building.x;
          sy = building.y;
        }
      }
      if (sx >= 0) {
        ctx.strokeStyle = selectionColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(sx * TILE + 1.5, sy * TILE + 1.5, TILE - 3, TILE - 3);
      }
    }

    // Raster.
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * TILE, 0);
      ctx.lineTo(x * TILE, height * TILE);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE);
      ctx.lineTo(width * TILE, y * TILE);
      ctx.stroke();
    }
  }, [state, width, height]);

  function coordsFromEvent(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * height);
    return { x: Math.min(width - 1, Math.max(0, x)), y: Math.min(height - 1, Math.max(0, y)) };
  }

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = coordsFromEvent(event);
    const robot = state.robots.find(
      (entry) =>
        entry.x === x && entry.y === y && state.map[y][x].visibility === "visible",
    );
    if (robot) {
      sendCommand({ type: "selectRobot", robotId: robot.id });
      return;
    }
    const buildingId = state.map[y][x].buildingId;
    if (buildingId && state.map[y][x].visibility !== "unknown") {
      sendCommand({ type: "selectBuilding", buildingId });
      return;
    }
    sendCommand({ type: "selectField", x, y });
  }

  function handleMove(event: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = coordsFromEvent(event);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      x,
      y,
      screenX: event.clientX - rect.left,
      screenY: event.clientY - rect.top,
    });
  }

  return (
    <div className="map-canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={width * TILE}
        height={height * TILE}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && <MapTileTooltip state={state} info={tooltip} />}
    </div>
  );
}
