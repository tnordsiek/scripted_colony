// Globaler MVP-Power-Pool nach docs/04-systems/energy-system.md und tick-pipeline.md.
// Expansion 1: Stahlwerk und Forschung als Verbraucher, Energiespeicher als Puffer
// (docs/02-mvp/expansion-1-scope.md).
import {
  EXP1_ENERGY_STORAGE_CAPACITY,
  EXP1_ENERGY_STORAGE_MAX_CHARGE_RATE,
  EXP1_ENERGY_STORAGE_MAX_DISCHARGE_RATE,
  MVP_SOLAR_COLLECTOR_POWER_PROVIDED,
} from "./constants";
import { isResearchEligible, researchPowerRequired } from "./research";
import type { Building, EnergySnapshot, GameState } from "./types";

type EnergyConsumer = {
  key: string; // production:<id> | steel:<id> | research
  buildingId: string;
  kindOrder: number; // 0 production, 1 steel, 2 research
  powerRequired: number;
};

function solarPowerProvided(state: GameState): number {
  let provided = 0;
  for (const building of state.buildings) {
    if (
      building.type === "solarCollector" &&
      building.status === "active" &&
      building.isEnabled
    ) {
      provided += building.powerProvided ?? MVP_SOLAR_COLLECTOR_POWER_PROVIDED;
    }
  }
  return provided;
}

// Fortschrittsberechtigte Verbraucher in deterministischer Reihenfolge:
// Gebaeude nach BuildingId, je Gebaeude Produktion -> Stahlwerk -> Forschung.
function eligibleConsumers(state: GameState): EnergyConsumer[] {
  const consumers: EnergyConsumer[] = [];

  for (const building of state.buildings) {
    if (building.status !== "active" || !building.isEnabled) {
      continue;
    }
    const production = building.productionTask;
    if (
      production &&
      production.status === "inProgress" &&
      production.startedTick < state.tick
    ) {
      consumers.push({
        key: `production:${production.id}`,
        buildingId: building.id,
        kindOrder: 0,
        powerRequired: production.powerRequired,
      });
    }
    const steel = building.steelProductionTask;
    if (steel && steel.status === "inProgress" && steel.startedTick < state.tick) {
      consumers.push({
        key: `steel:${steel.id}`,
        buildingId: building.id,
        kindOrder: 1,
        powerRequired: steel.powerRequired,
      });
    }
    if (building.type === "aiResearchCenter" && isResearchEligible(state)) {
      consumers.push({
        key: "research",
        buildingId: building.id,
        kindOrder: 2,
        powerRequired: researchPowerRequired(state),
      });
    }
  }

  consumers.sort(
    (a, b) =>
      (a.buildingId < b.buildingId ? -1 : a.buildingId > b.buildingId ? 1 : 0) ||
      a.kindOrder - b.kindOrder,
  );
  return consumers;
}

function activeStorages(state: GameState): Building[] {
  return state.buildings
    .filter(
      (building) =>
        building.type === "energyStorage" &&
        building.status === "active" &&
        building.isEnabled,
    )
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

// Reiner Snapshot fuer UI/Diagnose (ohne Speicher-Mutation).
export function computeEnergySnapshot(state: GameState): EnergySnapshot {
  const powerProvided = solarPowerProvided(state);
  const powerRequired = eligibleConsumers(state).reduce(
    (sum, consumer) => sum + consumer.powerRequired,
    0,
  );
  return {
    tick: state.tick,
    powerProvided,
    powerRequired,
    freePower: powerProvided - powerRequired,
  };
}

export type EnergyAllocation = {
  snapshot: EnergySnapshot;
  granted: Set<string>;
};

// Ein Energie-Tick: Speicher entladen bei Defizit, Verbraucher greedy in
// deterministischer Reihenfolge bedienen, Ueberschuss in Speicher laden.
// Mutiert storedEnergy der aktiven Energiespeicher.
export function allocateEnergyTick(state: GameState): EnergyAllocation {
  const provided = solarPowerProvided(state);
  const consumers = eligibleConsumers(state);
  const required = consumers.reduce((sum, entry) => sum + entry.powerRequired, 0);
  const storages = activeStorages(state);

  // Defizit aus Speichern decken (je Speicher max Entladerate).
  let discharged = 0;
  let deficit = Math.max(0, required - provided);
  for (const storage of storages) {
    if (deficit <= 0) {
      break;
    }
    const stored = storage.storedEnergy ?? 0;
    const discharge = Math.min(EXP1_ENERGY_STORAGE_MAX_DISCHARGE_RATE, stored, deficit);
    if (discharge > 0) {
      storage.storedEnergy = stored - discharge;
      discharged += discharge;
      deficit -= discharge;
    }
  }

  // Verbraucher greedy bedienen.
  const granted = new Set<string>();
  let remaining = provided + discharged;
  for (const consumer of consumers) {
    if (consumer.powerRequired <= remaining) {
      granted.add(consumer.key);
      remaining -= consumer.powerRequired;
    }
  }

  // Ueberschuss laden (je Speicher max Laderate, Kapazitaet 200).
  for (const storage of storages) {
    if (remaining <= 0) {
      break;
    }
    const stored = storage.storedEnergy ?? 0;
    const charge = Math.min(
      EXP1_ENERGY_STORAGE_MAX_CHARGE_RATE,
      EXP1_ENERGY_STORAGE_CAPACITY - stored,
      remaining,
    );
    if (charge > 0) {
      storage.storedEnergy = stored + charge;
      remaining -= charge;
    }
  }

  return {
    snapshot: {
      tick: state.tick,
      powerProvided: provided + discharged,
      powerRequired: required,
      freePower: provided + discharged - required,
    },
    granted,
  };
}
