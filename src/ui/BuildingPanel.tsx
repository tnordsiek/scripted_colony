// Gebaeudedetails inkl. Produktions-Button der Roboterfabrik.
import { computeEnergySnapshot } from "../sim/energy";
import { resolveAsset } from "../sim/assets";
import type { Building, GameState, PlayerCommand } from "../sim/types";

type BuildingPanelProps = {
  state: GameState;
  building: Building;
  sendCommand: (command: PlayerCommand) => void;
};

export function BuildingPanel({ state, building, sendCommand }: BuildingPanelProps) {
  const energy = computeEnergySnapshot(state);
  const task = building.productionTask;
  const starter = state.robots.find((robot) => robot.type === "starterRobot");
  const starterOre = starter?.cargo.used.ironOre ?? 0;

  return (
    <div className="panel building-panel">
      <h3>
        {building.type === "solarCollector" ? "Solar Collector" : "Roboterfabrik"}
      </h3>
      <ul>
        <li>Status: {building.status}</li>
        <li>Aktiviert: {building.isEnabled ? "ja" : "nein"}</li>
        <li>
          HP: {building.hp.current}/{building.hp.max}
        </li>
        <li>
          Position: [{building.x}, {building.y}]
        </li>
        {building.type === "solarCollector" && (
          <li>Leistung: {building.powerProvided ?? 0}</li>
        )}
        {building.status === "construction" && (
          <li>
            Baufortschritt: {building.constructionProgress ?? 0}/
            {building.constructionRequired ?? 1}
          </li>
        )}
      </ul>
      <div className="energy-summary">
        Leistung global: {energy.powerProvided} erzeugt, {energy.powerRequired}{" "}
        benoetigt, {energy.freePower} frei
      </div>

      {building.type === "robotFactory" && building.status === "active" && (
        <div className="production-section">
          {task ? (
            <div className="production-status">
              <div>Produktion: Iron Miner</div>
              <div>
                Fortschritt: {task.totalTicks - task.remainingTicks}/{task.totalTicks}
              </div>
              <div>Leistungsbedarf: {task.powerRequired}</div>
              {task.blockedReason === "insufficientPower" && (
                <div className="status-badge warning">
                  {resolveAsset("ui.productionPaused").label}
                </div>
              )}
              {task.status === "spawnBlocked" && (
                <div className="status-badge error">
                  {resolveAsset("ui.spawnBlocked").label}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() =>
                sendCommand({
                  type: "startIronMinerProduction",
                  buildingId: building.id,
                })
              }
            >
              Iron Miner produzieren (5 Iron Ore, 10 Ticks, 40 Leistung)
            </button>
          )}
          <div className="production-hint">
            Startroboter-Cargo: {starterOre} Iron Ore
          </div>
        </div>
      )}
    </div>
  );
}
