// Gebaeudedetails inkl. Produktions-Button der Roboterfabrik.
import { computeEnergySnapshot } from "../sim/energy";
import { resolveAsset } from "../sim/assets";
import { isLogisticsUnlocked } from "../sim/research";
import {
  EXP2_STEELWORKS_INPUT_CAPACITY,
  EXP2_STEELWORKS_OUTPUT_CAPACITY,
  EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES,
  EXP2_TRANSPORT_ROBOT_PRODUCTION_POWER,
  EXP2_TRANSPORT_ROBOT_PRODUCTION_TICKS,
} from "../sim/constants";
import type {
  Building,
  GameState,
  PlayerCommand,
  ResourceInventory,
} from "../sim/types";
import { ResearchPanel } from "./ResearchPanel";

const BUILDING_LABELS: Record<string, string> = {
  solarCollector: "Solar Collector",
  robotFactory: "Roboterfabrik",
  aiResearchCenter: "KI-Forschungszentrum",
  steelworks: "Stahlwerk",
  energyStorage: "Energiespeicher",
  resourceStorage: "Ressourcenspeicher",
  gridEnergyLine: "Grid Energy Line",
};

const RESOURCE_LABELS: Record<string, string> = {
  ironOre: "Iron Ore",
  steelPlates: "Steel Plates",
};

// Kompakte Inventar-Darstellung (leer -> "leer").
function inventoryText(inventory: ResourceInventory | undefined): string {
  const entries = Object.entries(inventory ?? {}).filter(([, amount]) => (amount ?? 0) > 0);
  if (entries.length === 0) {
    return "leer";
  }
  return entries
    .map(([resource, amount]) => `${RESOURCE_LABELS[resource] ?? resource}: ${amount}`)
    .join(", ");
}

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
  const starterSteel = starter?.cargo.used.steelPlates ?? 0;
  const logisticsUnlocked = isLogisticsUnlocked(state);

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
        {building.type === "steelworks" && (
          <>
            <li>
              Input ({EXP2_STEELWORKS_INPUT_CAPACITY}):{" "}
              {inventoryText(building.inventory?.input)}
            </li>
            <li>
              Output ({EXP2_STEELWORKS_OUTPUT_CAPACITY}):{" "}
              {inventoryText(building.inventory?.output)}
            </li>
          </>
        )}
        {building.type === "resourceStorage" && (
          <li>
            Speicher ({building.inventory?.totalCapacity ?? 100}):{" "}
            {inventoryText(building.inventory?.storage)}
          </li>
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
          {logisticsUnlocked && (
            <div className="production-hint">
              Auto-Modus: verarbeitet selbststaendig, sobald Input ≥ 2 und
              Output Platz hat.
            </div>
          )}
        </div>
      )}

      {building.type === "aiResearchCenter" && building.status === "active" && (
        <ResearchPanel state={state} sendCommand={sendCommand} />
      )}

      {building.type === "robotFactory" && building.status === "active" && (
        <div className="production-section">
          {task ? (
            <div className="production-status">
              <div>
                Produktion:{" "}
                {task.robotType === "transportRobot" ? "Transportroboter" : "Iron Miner"}
              </div>
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
            <div className="production-buttons">
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
              {logisticsUnlocked && (
                <button
                  disabled={starterSteel < EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES}
                  onClick={() =>
                    sendCommand({
                      type: "startTransportRobotProduction",
                      buildingId: building.id,
                    })
                  }
                >
                  Transportroboter produzieren (
                  {EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES} Steel Plates,{" "}
                  {EXP2_TRANSPORT_ROBOT_PRODUCTION_TICKS} Ticks,{" "}
                  {EXP2_TRANSPORT_ROBOT_PRODUCTION_POWER} Leistung)
                </button>
              )}
            </div>
          )}
          <div className="production-hint">
            Startroboter-Cargo: {starterOre} Iron Ore, {starterSteel} Steel Plates
          </div>
        </div>
      )}
    </div>
  );
}
