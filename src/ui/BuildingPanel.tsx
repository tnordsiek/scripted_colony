// Gebaeudedetails inkl. Produktions-Button der Roboterfabrik.
import { computeEnergySnapshot } from "../sim/energy";
import { resolveAsset } from "../sim/assets";
import type { Building, GameState, PlayerCommand } from "../sim/types";
import { ResearchPanel } from "./ResearchPanel";

const BUILDING_LABELS: Record<string, string> = {
  solarCollector: "Solar Collector",
  robotFactory: "Roboterfabrik",
  aiResearchCenter: "KI-Forschungszentrum",
  steelworks: "Stahlwerk",
  energyStorage: "Energiespeicher",
};

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
      <h3>{BUILDING_LABELS[building.type] ?? building.type}</h3>
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
        {building.type === "energyStorage" && (
          <li>Gespeichert: {building.storedEnergy ?? 0}/200</li>
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

      {building.type === "steelworks" && building.status === "active" && (
        <div className="production-section">
          {building.steelProductionTask ? (
            <div className="production-status">
              <div>Verarbeitung: 2 Iron Ore → 1 Steel Plate</div>
              <div>
                Fortschritt:{" "}
                {building.steelProductionTask.totalTicks -
                  building.steelProductionTask.remainingTicks}
                /{building.steelProductionTask.totalTicks}
              </div>
              {building.steelProductionTask.blockedReason === "insufficientPower" && (
                <div className="status-badge warning">Pausiert: keine Leistung</div>
              )}
              {building.steelProductionTask.status === "outputBlocked" && (
                <div className="status-badge warning">Wartet: Cargo voll</div>
              )}
            </div>
          ) : (
            <button
              onClick={() =>
                sendCommand({ type: "startSteelProduction", buildingId: building.id })
              }
            >
              Steel Plate produzieren (2 Iron Ore, 10 Ticks, 30 Leistung)
            </button>
          )}
          <div className="production-hint">
            Startroboter-Cargo: {starterOre} Iron Ore
          </div>
        </div>
      )}

      {building.type === "aiResearchCenter" && building.status === "active" && (
        <ResearchPanel state={state} sendCommand={sendCommand} />
      )}

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
