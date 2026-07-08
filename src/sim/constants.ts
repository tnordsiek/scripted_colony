// Verbindliche MVP-Werte nach docs/03-technical/mvp-constants.md (v110).
import type { FieldCoord, MapGenerationConfig } from "./types";

// Zeit
export const MVP_TICK_SECONDS = 1;
export const MVP_TIME_LIMIT_TICKS = 600; // 10 Minuten bei 1 Tick/Sekunde

// Seeded RNG
export const FNV1A_32_OFFSET = 0x811c9dc5;
export const FNV1A_32_PRIME = 0x01000193;
export const MULBERRY32_INCREMENT = 0x6d2b79f5;
export const UINT32_SIZE = 0x100000000;

// Karte und Startzustand
export const MVP_MAP_WIDTH = 10;
export const MVP_MAP_HEIGHT = 10;
export const MVP_START_POSITION = { x: 5, y: 5 } as const;
export const MVP_STARTER_SIGHT_RANGE = 2;
export const MVP_MAP_MAX_GENERATION_ATTEMPTS = 100;

export const MVP_IRON_ORE_FIELD_COUNT = 20;
export const MVP_IRON_ORE_PER_FIELD = 20;
export const MVP_REQUIRED_REACHABLE_IRON_ORE_MIN_DISTANCE = 4;
export const MVP_REQUIRED_REACHABLE_IRON_ORE_MAX_DISTANCE = 6;
export const MVP_MIN_IRON_ORE_CLUSTER_SIZE = 3;
export const MVP_MAX_IRON_ORE_CLUSTER_SIZE = 8;

// Kanonische Map-Konfiguration (canonical-data-model.md)
export const MVP_MAP_CONFIG: MapGenerationConfig = {
  width: MVP_MAP_WIDTH,
  height: MVP_MAP_HEIGHT,
  seed: "mvp-default",
  startPosition: MVP_START_POSITION,
  starterSightRange: MVP_STARTER_SIGHT_RANGE,
  ironOreFieldCount: MVP_IRON_ORE_FIELD_COUNT,
  ironOrePerField: MVP_IRON_ORE_PER_FIELD,
  requiredReachableIronOreMinDistance: MVP_REQUIRED_REACHABLE_IRON_ORE_MIN_DISTANCE,
  requiredReachableIronOreMaxDistance: MVP_REQUIRED_REACHABLE_IRON_ORE_MAX_DISTANCE,
  minClusterSize: MVP_MIN_IRON_ORE_CLUSTER_SIZE,
  maxClusterSize: MVP_MAX_IRON_ORE_CLUSTER_SIZE,
  maxGenerationAttempts: MVP_MAP_MAX_GENERATION_ATTEMPTS,
};

export const MVP_FALLBACK_IRON_ORE_FIELDS: FieldCoord[] = [
  { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 },
  { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 9, y: 1 }, { x: 9, y: 2 },
  { x: 1, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 8 }, { x: 2, y: 9 },
  { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 8 }, { x: 9, y: 9 },
  { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 2 },
];

// Starter Roboter
export const MVP_STARTER_BATTERY = 100;
export const MVP_STARTER_BATTERY_MAX = 100;
export const MVP_STARTER_HP = 100;
export const MVP_STARTER_HP_MAX = 100;
export const MVP_STARTER_CARGO_CAPACITY = 10;
export const MVP_STARTER_INITIAL_CARGO = {} as const;

// Iron Miner Spawn-Entity
export const MVP_IRON_MINER_HP = 100;
export const MVP_IRON_MINER_HP_MAX = 100;
export const MVP_IRON_MINER_BATTERY = 50;
export const MVP_IRON_MINER_BATTERY_MAX = 100;
export const MVP_IRON_MINER_CARGO_CAPACITY = 10;
export const MVP_IRON_MINER_SIGHT_RANGE = 2;

// Gebäudesicht
export const MVP_BUILDING_SIGHT_RANGE = 2;

// Ressourcen und Kosten
export const MVP_SOLAR_COLLECTOR_COST_IRON_ORE = 5;
export const MVP_ROBOT_FACTORY_COST_IRON_ORE = 5;
export const MVP_IRON_MINER_COST_IRON_ORE = 5;
export const MVP_MINIMUM_IRON_ORE_FOR_GOAL = 15;

// Aktionen und Tasks
export const MVP_MOVE_TICKS = 1;
export const MVP_MOVE_BATTERY_COST = 1;

export const MVP_MINING_TICKS = 10;
export const MVP_MINING_AMOUNT = 1;
export const MVP_MINING_BATTERY_COST = 1;

export const MVP_BUILD_TICKS = 10;
export const MVP_BUILD_BATTERY_COST = 1;
export const MVP_BUILD_CONSTRUCTION_PROGRESS_PER_COMPLETION = 1;
export const MVP_BUILDING_CONSTRUCTION_REQUIRED = 1;

// Stasis-Laden
export const MVP_STASIS_ENTER_BATTERY = 1;
export const MVP_STASIS_TARGET_BATTERY = 50;
export const MVP_SELF_CHARGE_RATE = 1;

// Gebäudeenergie und Produktion
export const MVP_SOLAR_COLLECTOR_POWER_PROVIDED = 50;
export const MVP_ROBOT_FACTORY_IDLE_POWER_REQUIRED = 0;
export const MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED = 40;
export const MVP_IRON_MINER_PRODUCTION_TICKS = 10;

// Score (Regelquelle: docs/04-systems/scoring-and-win-conditions.md)
export const MVP_SCORE_MINED_IRON_ORE = 1;
export const MVP_SCORE_SOLAR_COLLECTOR_BUILT = 25;
export const MVP_SCORE_ROBOT_FACTORY_BUILT = 50;
export const MVP_SCORE_ROBOT_SPAWNED = 100;
export const MVP_SCORE_GOAL_BONUS = 200;

// Eventlog
export const MVP_EVENTLOG_LIMIT = 200;
export const MVP_PLAYER_EVENT_DEDUPE_TICKS = 10;

// Kommunikation
export const MVP_COMMUNICATION_GRID_ACTIVE = false;

// Stabile Initial-IDs (deterministic-id-generation.md)
export const MVP_STARTER_ROBOT_ID = "robot.starter";
export const MVP_INITIAL_LANDING_EVENT_ID = "event.initialLanding";

export const MVP_STARTER_PROGRAM_ROW_IDS = {
  mineIronOre: "row.starter.mineIronOre.main",
  buildSolarCollector: "row.starter.buildSolarCollector.main",
  buildRobotFactory: "row.starter.buildRobotFactory.main",
  exploreNearby: "row.starter.exploreNearby.main",
  stasisCharge: "row.starter.stasisCharge.main",
} as const;

export const MVP_IRON_MINER_PRODUCTION = {
  robotType: "ironMiner",
  cost: { ironOre: 5 },
  totalTicks: 10,
  powerRequired: 40,
} as const;

// Expansion 1 (docs/02-mvp/expansion-1-scope.md)
export const EXP1_AI_RESEARCH_CENTER_COST_IRON_ORE = 10;
export const EXP1_AI_RESEARCH_CENTER_HP = 150;
export const EXP1_AI_RESEARCH_CENTER_CONSTRUCTION_REQUIRED = 2;
export const EXP1_RESEARCH_POINTS_PER_TICK = 1;
export const EXP1_RESEARCH_POWER_REQUIRED = 20;

export const EXP1_STEELWORKS_COST_IRON_ORE = 8;
export const EXP1_STEELWORKS_HP = 180;
export const EXP1_STEELWORKS_CONSTRUCTION_REQUIRED = 2;
export const EXP1_STEEL_RECIPE_INPUT_IRON_ORE = 2;
export const EXP1_STEEL_RECIPE_OUTPUT_STEEL_PLATES = 1;
export const EXP1_STEEL_RECIPE_TICKS = 10;
export const EXP1_STEEL_RECIPE_POWER_REQUIRED = 30;

export const EXP1_ENERGY_STORAGE_COST_STEEL_PLATES = 4;
export const EXP1_ENERGY_STORAGE_HP = 150;
export const EXP1_ENERGY_STORAGE_CONSTRUCTION_REQUIRED = 2;
export const EXP1_ENERGY_STORAGE_CAPACITY = 200;
export const EXP1_ENERGY_STORAGE_MAX_CHARGE_RATE = 50;
export const EXP1_ENERGY_STORAGE_MAX_DISCHARGE_RATE = 50;

// Expansion 2: Logistik und Ladenetz (docs/02-mvp/expansion-2-scope.md)
export const EXP2_EXTERNAL_CHARGE_RATE = 5;
export const EXP2_EXTERNAL_CHARGE_POWER = 5;
export const EXP2_RECHARGE_ENTER_BATTERY = 20;

export const EXP2_TRANSPORT_ROBOT_HP = 90;
export const EXP2_TRANSPORT_ROBOT_BATTERY = 80;
export const EXP2_TRANSPORT_ROBOT_BATTERY_MAX = 120;
export const EXP2_TRANSPORT_ROBOT_CARGO_CAPACITY = 30;
export const EXP2_TRANSPORT_ROBOT_SIGHT_RANGE = 2;
export const EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES = 4;
export const EXP2_TRANSPORT_ROBOT_PRODUCTION_TICKS = 20;
export const EXP2_TRANSPORT_ROBOT_PRODUCTION_POWER = 50;

export const EXP2_RESOURCE_STORAGE_HP = 150;
export const EXP2_RESOURCE_STORAGE_COST_STEEL_PLATES = 3;
export const EXP2_RESOURCE_STORAGE_CONSTRUCTION_REQUIRED = 2;
export const EXP2_RESOURCE_STORAGE_CAPACITY = 100;

export const EXP2_GRID_ENERGY_LINE_HP = 80;
export const EXP2_GRID_ENERGY_LINE_COST_STEEL_PLATES = 1;
export const EXP2_GRID_ENERGY_LINE_CONSTRUCTION_REQUIRED = 1;

export const EXP2_STEELWORKS_INPUT_CAPACITY = 10;
export const EXP2_STEELWORKS_OUTPUT_CAPACITY = 10;
export const EXP2_SUPPLY_INPUT_BATCH = 4;
export const EXP2_MOVE_TO_STORAGE_THRESHOLD_PERCENT = 80;

export const EXP2_RESEARCH_TRANSPORT_LOGISTICS_COST = 500;
