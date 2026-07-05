// Kanonische Typen nach docs/03-technical/canonical-data-model.md (v110).
// Dieses Modul ist eine 1:1-Übertragung; fachliche Regeln stehen in der Doku.

// ---------------------------------------------------------------------------
// Statusklassen
// ---------------------------------------------------------------------------

export type MvpStatus = "active" | "goalOnly" | "prepared" | "future";

// ---------------------------------------------------------------------------
// IDs und Basistypen
// ---------------------------------------------------------------------------

export type EntityId = string;
export type RobotId = string;
export type BuildingId = string;
export type ProgramInstanceId = string;
export type ProgramRowId = string;
export type ProgramTemplateIdValue = string;
export type ProductionTaskId = string;
export type RobotTaskId = string;
export type MaterialRequestId = string;
export type GameEventId = string;
export type Tick = number;

export type FieldCoord = {
  x: number;
  y: number;
};

export type Direction = "up" | "down" | "left" | "right";

export type Hitpoints = {
  current: number;
  max: number;
};

// ---------------------------------------------------------------------------
// Ressourcen
// ---------------------------------------------------------------------------

export type ResourceType = "ironOre" | "gas" | "silicon" | "steelPlates";
export type NaturalResourceType = "ironOre" | "gas" | "silicon";
export type ProcessedResourceType = "steelPlates";

export type ResourceInventory = Partial<Record<ResourceType, number>>;
export type ResourceCost = Partial<Record<ResourceType, number>>;

export type ExtractionMethod = "directMining" | "refinery" | "specializedMining";

// ---------------------------------------------------------------------------
// Karte und Felder
// ---------------------------------------------------------------------------

export type TerrainType = "plains" | "rubble" | "lavaRiver" | "mercuryRiver";

export type MovementType = "ground" | "flying";

export type VisibilityState =
  | "unknown" // nie sichtbar gewesen
  | "discovered" // bekannt, aber aktuell nicht sichtbar
  | "visible"; // aktuell durch mindestens eine Sichtquelle sichtbar

export type ResourceDeposit = {
  type: NaturalResourceType;
  amount: number;
  extractionMethod: ExtractionMethod;
};

export type ConstructionReservation = {
  buildingId: BuildingId;
  reservedByRobotIds: RobotId[];
};

export type Field = {
  x: number;
  y: number;
  terrainType: TerrainType;
  visibility: VisibilityState;
  resource?: ResourceDeposit;
  buildingId?: BuildingId;
  reservedForConstruction?: ConstructionReservation;
};

// ---------------------------------------------------------------------------
// Map Generation
// ---------------------------------------------------------------------------

export type MapGenerationConfig = {
  width: number;
  height: number;
  seed: string;
  startPosition: FieldCoord;
  starterSightRange: number;
  ironOreFieldCount: number;
  ironOrePerField: number;
  requiredReachableIronOreMinDistance: number;
  requiredReachableIronOreMaxDistance: number;
  minClusterSize: number;
  maxClusterSize: number;
  maxGenerationAttempts: number;
};

// ---------------------------------------------------------------------------
// Roboter
// ---------------------------------------------------------------------------

export type ChargingMode = "selfCharging" | "externalOnly" | "hybrid";

export type CommunicationMode = "gridRequired" | "autonomous" | "scoutLocked";

export type CommunicationStatus =
  | "connected"
  | "disconnected"
  | "offline"
  | "stasis"
  | "locked";

export type UnitTier = 0 | 1 | 2 | 3;

export type RobotType =
  | "starterRobot"
  | "ironMiner"
  | "groundScout"
  | "constructor"
  | "meleeDrone"
  | "resourceMiner"
  | "transportRobot"
  | "rangedDrone";

export type RobotStatus = "active" | "stasis" | "inactive" | "destroyed";

export type RobotActivityState =
  | "idle"
  | "executingProgram"
  | "runningTask"
  | "stasisCharging";

export type RobotRole =
  | "allrounder"
  | "miner"
  | "scout"
  | "builder"
  | "meleeCombat"
  | "resourceMiner"
  | "transport"
  | "rangedCombat";

export type CargoState = {
  used: ResourceInventory;
  capacity: number;
};

export type ActiveProgramState = {
  programId: ProgramInstanceId;
  rowId: ProgramRowId;
  startedTick: Tick;
};

export type Robot = {
  id: RobotId;
  name: string;
  type: RobotType;
  tier: UnitTier;
  role?: RobotRole;
  movementType: MovementType;
  communicationMode: CommunicationMode;
  communicationStatus: CommunicationStatus;
  x: number;
  y: number;
  hp: Hitpoints;
  battery: number;
  batteryMax: number;
  chargingMode: ChargingMode;
  cargo: CargoState;
  sightRange: number;
  status: RobotStatus;
  canRepair?: boolean;
  activeTask?: RobotTask;
  activeProgram?: ActiveProgramState;
  programStack: ProgramInstance[];
};

// ---------------------------------------------------------------------------
// Gebäude
// ---------------------------------------------------------------------------

export type BuildingTier = 1 | 2 | 3;

export type BuildingType =
  | "solarCollector"
  | "robotFactory"
  | "aiResearchCenter"
  | "communicationTower"
  | "gridEnergyLine"
  | "advancedRobotFactory"
  | "droneFactory"
  | "gasExtractor"
  | "steelworks"
  | "energyStorage"
  | "resourceStorage";

export type BuildingStatus =
  | "construction"
  | "active"
  | "inactive"
  | "producing"
  | "disabled"
  | "destroyed";

export type BuildingQuery = {
  buildingType: BuildingType;
  status?: BuildingStatus;
};

export type BuildingFunction =
  | "powerGeneration"
  | "powerDistribution"
  | "powerStorage"
  | "resourceStorage"
  | "robotProduction"
  | "droneProduction"
  | "resourceExtraction"
  | "resourceProcessing"
  | "research"
  | "communication";

export type StoragePolicy =
  | "allResources"
  | "naturalResourcesOnly"
  | "processedResourcesOnly"
  | "custom";

export type BuildingMvpStatus = "active" | "prepared" | "future";

export type BuildingInventory = {
  input?: ResourceInventory;
  output?: ResourceInventory;
  storage?: ResourceInventory;
  construction?: ResourceInventory;
  reserved?: ReservedInventory;
  capacity?: Partial<Record<ResourceType, number>>;
  totalCapacity?: number;
};

export type Building = {
  id: BuildingId;
  type: BuildingType;
  tier: BuildingTier;
  x: number;
  y: number;
  hp: Hitpoints;
  status: BuildingStatus;
  isEnabled: boolean;
  sightRange: number;

  costPaid?: ResourceCost;
  constructionProgress?: number;
  constructionRequired?: number;

  powerProvided?: number;
  powerRequired?: number;
  powerConsumed?: number;

  inventory?: BuildingInventory;
  productionTask?: ProductionTask;
};

// ---------------------------------------------------------------------------
// Programme: Templates, Instanzen, Zeilen
// ---------------------------------------------------------------------------

export type ProgramTemplateId =
  | "template.secureEnergy"
  | "template.exploreNearby"
  | "template.mineIronOre"
  | "template.buildSolarCollector"
  | "template.buildRobotFactory"
  | "template.stasisCharge";

export type ProgramExecutionLimit =
  | { type: "unlimited" }
  | { type: "once" }
  | { type: "count"; maxExecutions: number };

export type ProgramExecutionState = {
  completedExecutions: number;
};

export type ProgramTemplateDefinition = {
  id: ProgramTemplateId;
  name: string;
  description: string;
  defaultEnabled: boolean;
  defaultStackPosition: number;
  rows: ProgramRowDefinition[];
  executionLimit?: ProgramExecutionLimit;
  locked?: boolean;
};

export type ProgramInstance = {
  id: ProgramInstanceId;
  templateId: ProgramTemplateId;
  name: string;
  enabled: boolean;
  rows: ProgramRow[];
  executionLimit?: ProgramExecutionLimit;
  executionState?: ProgramExecutionState;
  locked?: boolean;
};

export type ProgramRow = {
  id: ProgramRowId;
  if: ConditionExpression;
  then: ProgramAction;
  stop: StopConditionGroup;
};

export type ProgramRowDefinition = ProgramRow;

export type StopConditionGroup = {
  operator: "OR";
  conditions: ConditionExpression[];
};

export type ProgramEditField =
  | "name"
  | "enabled"
  | "row.if.value"
  | "row.then.parameters"
  | "row.stop.value";

export type ProgramEditPolicy = {
  templateId: ProgramTemplateId;
  locked: boolean;
  editableFields: ProgramEditField[];
  allowedActionParameterValues?: Partial<Record<string, ActionParameterValue[]>>;
  allowedConditionValues?: ConditionValue[];
};

export type MvpStarterProgramRowId =
  | "row.starter.mineIronOre.main"
  | "row.starter.buildSolarCollector.main"
  | "row.starter.buildRobotFactory.main"
  | "row.starter.exploreNearby.main"
  | "row.starter.stasisCharge.main";

// ---------------------------------------------------------------------------
// Conditions, Sensoren, Operatoren
// ---------------------------------------------------------------------------

export type ConditionExpression =
  | SensorCondition
  | NotCondition
  | LogicalConditionGroup;

export type SensorCondition = {
  type: "sensor";
  sensorId: SensorId;
  operator: OperatorId;
  value: ConditionValue;
};

export type NotCondition = {
  type: "not";
  condition: ConditionExpression;
};

export type LogicalConditionGroup = {
  type: "group";
  operator: "AND" | "OR";
  conditions: ConditionExpression[];
};

export type SensorDefinition = {
  id: SensorId;
  label: string;
  valueType: SensorValueType;
  allowedOperators: OperatorId[];
  valueRange?: {
    min: number;
    max: number;
    unit?: "%" | "hp" | "units" | "tiles";
  };
  allowedValues?: ConditionValue[];
};

export type SensorId =
  | "sensor.battery"
  | "sensor.cargoFill"
  | "sensor.cargoResourceAmount"
  | "sensor.neighborFieldType"
  | "sensor.visibleFieldType"
  | "sensor.buildingExists"
  | "sensor.buildingStatus"
  | "sensor.freePower"
  | "sensor.outputFieldAvailable"
  | "sensor.robotStatus";

export type SensorValueType =
  | "percentage"
  | "number"
  | "boolean"
  | "fieldType"
  | "resourceType"
  | "buildingType"
  | "buildingStatus"
  | "buildingQuery"
  | "robotStatus"
  | "power";

export type OperatorId =
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "eq"
  | "neq"
  | "hasType"
  | "notHasType"
  | "exists"
  | "notExists"
  | "is"
  | "isNot";

export type ConditionValue =
  | { type: "percentage"; value: number }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "fieldType"; value: FieldTypeQuery }
  | { type: "resourceType"; value: ResourceType }
  | { type: "buildingType"; value: BuildingType }
  | { type: "buildingStatus"; value: BuildingStatus }
  | { type: "buildingQuery"; value: BuildingQuery }
  | { type: "robotStatus"; value: RobotStatus }
  | { type: "power"; value: number };

export type FieldTypeQuery =
  | "ironOre"
  | "solarCollector"
  | "robotFactory"
  | "chargingField"
  | "building"
  | "freeField"
  | "blockedField";

// ---------------------------------------------------------------------------
// Aktionen
// ---------------------------------------------------------------------------

export type ActionId =
  | "action.charge"
  | "action.scoutNearby"
  | "action.mineResource"
  | "action.buildBuilding"
  | "action.stasisCharge";

export type ProgramAction = {
  actionId: ActionId;
  parameters: Record<string, ActionParameterValue>;
};

export type ActionEnergyRequirement = {
  minimumBattery: number;
};

export type ActionParameterDefinition = {
  id: string;
  label: string;
  type:
    | "number"
    | "percentage"
    | "resourceType"
    | "buildingType"
    | "fieldType"
    | "fieldCondition"
    | "mode";
  defaultValue?: ActionParameterValue;
  min?: number;
  max?: number;
  allowedValues?: ActionParameterValue[];
};

export type ActionParameterValue =
  | string
  | number
  | boolean
  | { type: "resourceType"; value: ResourceType }
  | { type: "buildingType"; value: BuildingType }
  | { type: "fieldType"; value: FieldTypeQuery }
  | { type: "fieldCondition"; value: FieldCondition };

export type ActionDefinition = {
  id: ActionId;
  label: string;
  energyRequirement: ActionEnergyRequirement;
  parameters: ActionParameterDefinition[];
};

export type FieldCondition =
  | { type: "freeNeighborField" }
  | { type: "adjacentToBuilding"; buildingType: BuildingType }
  | { type: "adjacentToResource"; resourceType: ResourceType }
  | { type: "notOnActiveResource" }
  | { type: "buildableTerrain" }
  | { type: "highSunlightPreferred" };

export type ScoutTargetReason =
  | "visibleTarget"
  | "unknownBorder"
  | "fallbackReachableField";

export type ScoutTarget = {
  target: FieldCoord;
  reason: ScoutTargetReason;
};

export type BuildPlacementReason =
  | "nearBuilder"
  | "nearActiveSolarCollector"
  | "continueExistingConstruction";

export type BuildingTaskMode = "newConstruction" | "continueConstruction";

export type BuildTarget = {
  buildingType: BuildingType;
  site: FieldCoord;
  buildFrom: FieldCoord;
  reason: BuildPlacementReason;
  mode: BuildingTaskMode;
  buildingId?: BuildingId;
};

// ---------------------------------------------------------------------------
// Action Executability
// ---------------------------------------------------------------------------

export type ActionExecutabilityResult =
  | {
      type: "executable";
      action: ProgramAction;
      plannedTask?: RobotTask;
      diagnostic?: GameEvent;
    }
  | {
      type: "notExecutable";
      reason: ActionNotExecutableReason;
      diagnostic?: GameEvent;
    };

export type ActionNotExecutableReason =
  | "missingParameter"
  | "robotNotActive"
  | "batteryTooLow"
  | "robotInStasis"
  | "unsupportedMvpAction"
  | "unsupportedMvpTarget"
  | "cargoFull"
  | "notEnoughResources"
  | "noAdjacentResource"
  | "resourceDepleted"
  | "notAdjacentToTarget"
  | "noValidScoutTarget"
  | "noValidBuildSite"
  | "noReachableBuildFromField"
  | "constructionAlreadyReserved"
  | "noActiveSolarCollector"
  | "taskAlreadyRunning"
  | "noPath";

// ---------------------------------------------------------------------------
// Program Evaluation
// ---------------------------------------------------------------------------

export type ProgramBlockReason =
  | "programDisabled"
  | "executionLimitReached"
  | "conditionFalse"
  | "actionNotExecutable"
  | "insufficientBattery"
  | "noPath"
  | "missingResource"
  | "targetInvalid";

export type ProgramEvaluationResult =
  | {
      type: "startRow";
      programId: ProgramInstanceId;
      rowId: ProgramRowId;
      action: ProgramAction;
    }
  | {
      type: "noExecutableProgram";
      reasons: ProgramEvaluationTrace[];
    };

export type ProgramEvaluationTrace = {
  programId: ProgramInstanceId;
  rowId?: ProgramRowId;
  result:
    | "skipped"
    | "conditionFalse"
    | "actionNotExecutable"
    | "executionLimitReached"
    | "selected";
  reason?: ProgramBlockReason;
};

// ---------------------------------------------------------------------------
// Robot Tasks und Bewegung
// ---------------------------------------------------------------------------

export type MovementState = {
  blockedByRobotTicks: number;
};

export type PathResult =
  | { type: "found"; path: FieldCoord[] }
  | { type: "noPath" };

export type MoveStepResult =
  | { type: "moved"; to: FieldCoord }
  | { type: "blockedByRobot" }
  | { type: "blockedPermanently" }
  | { type: "noPath" };

export type RobotTaskStatus = "running" | "completed" | "aborted";

export type TaskAbortReason =
  | "insufficientBattery"
  | "targetInvalid"
  | "noPath"
  | "blockedByRobot"
  | "cargoFull"
  | "resourceDepleted"
  | "notAdjacentToTarget"
  | "noReachableChargingField"
  | "stopConditionMet";

export type ActiveRobotTaskType =
  | "movement"
  | "mining"
  | "building"
  | "stasisCharging";

export type FutureRobotTaskType = "charging" | "logistics";

export type RobotTaskType = ActiveRobotTaskType | FutureRobotTaskType;

export type BaseRobotTask = {
  id: RobotTaskId;
  status: RobotTaskStatus;
  sourceProgramId: ProgramInstanceId;
  sourceRowId: ProgramRowId;
  startedTick: Tick;
  completedTick?: Tick;
  abortReason?: TaskAbortReason;
};

export type MovementTask = BaseRobotTask & {
  type: "movement";
  path: FieldCoord[];
  target: FieldCoord;
  reason: "scouting" | "building" | "fallback";
  movementState: MovementState;
};

export type MiningTask = BaseRobotTask & {
  type: "mining";
  resourceType: "ironOre";
  target: FieldCoord;
  totalTicks: number;
  remainingTicks: number;
  minedAmount: number;
  batteryCostOnSuccess: number;
};

export type BuildingTask = BaseRobotTask & {
  type: "building";
  mode: BuildingTaskMode;
  buildingId: BuildingId;
  buildingType: "solarCollector" | "robotFactory";
  site: FieldCoord;
  buildFrom: FieldCoord;
  totalTicks: number;
  remainingTicks: number;
  costToPay: ResourceCost;
  costPaidByThisTask: boolean;
  batteryCostOnSuccess: number;
};

export type StasisChargingTask = BaseRobotTask & {
  type: "stasisCharging";
  targetBattery: number;
};

export type RobotTask =
  | MovementTask
  | MiningTask
  | BuildingTask
  | StasisChargingTask;

export type ConstructionTaskReservation = {
  buildingId: BuildingId;
  robotId: RobotId;
  taskId: RobotTaskId;
  mode: BuildingTaskMode;
};

// ---------------------------------------------------------------------------
// ProductionTask
// ---------------------------------------------------------------------------

export type ProductionTaskStatus = "inProgress" | "readyToSpawn" | "spawnBlocked";

export type ProductionBlockedReason =
  | "insufficientPower"
  | "noFreeOutputField"
  | "buildingDisabled";

export type ProductionTask = {
  id: ProductionTaskId;
  buildingId: BuildingId;
  robotType: "ironMiner";
  cost: ResourceCost;
  costPaid: boolean;
  totalTicks: number;
  remainingTicks: number;
  powerRequired: number;
  status: ProductionTaskStatus;
  blockedReason?: ProductionBlockedReason;
  createdTick: Tick;
  startedTick: Tick;
  completedTick?: Tick;
};

// ---------------------------------------------------------------------------
// Energie
// ---------------------------------------------------------------------------

export type EnergySnapshot = {
  tick: Tick;
  powerProvided: number;
  powerRequired: number;
  freePower: number;
};

// ---------------------------------------------------------------------------
// Logistik (Future, vorbereitet)
// ---------------------------------------------------------------------------

export type InventoryRole = "input" | "output" | "storage" | "construction" | "cargo";

export type ReservedInventory = Partial<Record<ResourceType, number>>;

export type MaterialRequestType =
  | "moveToStorage"
  | "supplyBuildingInput"
  | "supplyConstruction"
  | "clearBuildingOutput";

export type MaterialRequestStatus =
  | "open"
  | "reserved"
  | "assigned"
  | "pickupInProgress"
  | "deliveryInProgress"
  | "fulfilled"
  | "blocked"
  | "cancelled";

export type MaterialRequestBlockedReason =
  | "noSourceWithResources"
  | "noReachableSource"
  | "noAvailableTransportRobot"
  | "targetHasNoCapacity"
  | "resourceReservedByOtherRequest"
  | "assignedRobotUnavailable"
  | "pathBlocked"
  | "requestTooLargeForCargo"
  | "targetInvalid"
  | "sourceInvalid";

export type MaterialEndpoint =
  | {
      type: "building";
      buildingId: BuildingId;
      inventoryRole: InventoryRole;
    }
  | {
      type: "constructionSite";
      buildingId: BuildingId;
    }
  | {
      type: "robot";
      robotId: RobotId;
      inventoryRole: "cargo";
    };

export type MaterialRequest = {
  id: MaterialRequestId;
  type: MaterialRequestType;
  resources: ResourceInventory;
  from?: MaterialEndpoint;
  to: MaterialEndpoint;
  status: MaterialRequestStatus;
  assignedRobotId?: RobotId;
  reservedResources?: ResourceInventory;
  createdTick: Tick;
  updatedTick: Tick;
  blockedReason?: MaterialRequestBlockedReason;
};

// ---------------------------------------------------------------------------
// Score und Events
// ---------------------------------------------------------------------------

export type ScoreState = {
  minedIronOre: number;
  builtSolarCollectors: number;
  builtRobotFactories: number;
  builtBuildings: number;
  spawnedRobots: number;
  elapsedTicks: number;
  goalBonusAwarded: boolean;
  totalScore: number;
};

export type GameEventCode =
  | "system.initialLanding"
  | "program.row.conditionFalse"
  | "program.skipped.notExecutable"
  | "program.action.executable"
  | "task.started"
  | "task.completed"
  | "task.aborted"
  | "action.scout.targetVisible"
  | "action.scout.targetSelected"
  | "action.scout.noReachableTarget"
  | "action.mine.started"
  | "action.mine.blocked.noAdjacentResource"
  | "action.mine.blocked.cargoFull"
  | "action.mine.completed"
  | "action.build.targetSelected"
  | "action.build.blocked.notEnoughResources"
  | "action.build.blocked.noValidBuildSite"
  | "action.build.blocked.noReachableBuildFromField"
  | "action.build.blocked.constructionAlreadyReserved"
  | "action.build.started"
  | "action.build.completed"
  | "action.stasis.started"
  | "action.stasis.completed"
  | "action.stasis.blocked.cannotSelfCharge"
  | "production.ironMiner.started"
  | "production.ironMiner.blocked.notEnoughOre"
  | "production.ironMiner.paused.insufficientPower"
  | "production.ironMiner.spawnBlocked"
  | "production.ironMiner.spawned"
  | "goal.mvpReached"
  | "debug.command.rejected"
  | "debug.canExecuteAction.result"
  | "debug.build.targetRejected"
  | "debug.scout.targetRejected"
  | "debug.asset.fallbackUsed"
  | "debug.asset.missingFallback";

export type GameEventVisibility = "player" | "debug";
export type GameEventSeverity = "info" | "success" | "warning" | "error";
export type GameEventPriority = "low" | "normal" | "high" | "critical";

export type GameEventCategory =
  | "system"
  | "program"
  | "action"
  | "task"
  | "resource"
  | "building"
  | "production"
  | "robot"
  | "goal";

export type GameEvent = {
  id: GameEventId;
  tick: Tick;
  visibility: GameEventVisibility;
  severity: GameEventSeverity;
  priority: GameEventPriority;
  category: GameEventCategory;
  code: GameEventCode;
  message: string;
  entityId?: EntityId;
  robotId?: RobotId;
  buildingId?: BuildingId;
  programId?: ProgramInstanceId;
  rowId?: ProgramRowId;
  actionId?: ActionId;
  details?: Record<string, string | number | boolean>;
  repeatCount?: number;
  firstTick?: Tick;
  lastTick?: Tick;
};

export type BuildActionEventDetails = {
  mode: BuildingTaskMode;
  buildingType: "solarCollector" | "robotFactory";
  buildingId: BuildingId;
  siteX: number;
  siteY: number;
};

export type BuildActionGameEvent = GameEvent & {
  code:
    | "action.build.targetSelected"
    | "action.build.started"
    | "action.build.completed";
  details: BuildActionEventDetails;
};

// ---------------------------------------------------------------------------
// UI-State und PlayerCommands
// ---------------------------------------------------------------------------

export type Selection =
  | { type: "robot"; id: RobotId }
  | { type: "building"; id: BuildingId }
  | { type: "field"; x: number; y: number }
  | null;

export type UiState = {
  selected: Selection;
  openEditorProgramId?: ProgramInstanceId;
  editedProgramDraft?: ProgramInstance;
  diagnosticsExpanded: boolean;
};

export type PlayerCommand =
  | { type: "pause" }
  | { type: "resume" }
  | { type: "setSpeed"; speed: 1 | 2 | 4 }
  | { type: "selectRobot"; robotId: RobotId }
  | { type: "selectBuilding"; buildingId: BuildingId }
  | { type: "selectField"; x: number; y: number }
  | { type: "toggleProgramEnabled"; robotId: RobotId; programId: ProgramInstanceId }
  | { type: "moveProgramUp"; robotId: RobotId; programId: ProgramInstanceId }
  | { type: "moveProgramDown"; robotId: RobotId; programId: ProgramInstanceId }
  | { type: "updateProgram"; robotId: RobotId; program: ProgramInstance }
  | { type: "resetProgramToTemplate"; robotId: RobotId; programId: ProgramInstanceId }
  | { type: "startIronMinerProduction"; buildingId: BuildingId }
  | { type: "resetRun"; seed?: string };

export type CommandResult =
  | { type: "accepted" }
  | { type: "rejected"; reason: CommandRejectionReason };

export type CommandRejectionReason =
  // allgemeine Command-Validierung
  | "invalidCommand"
  | "invalidSpeed"
  | "invalidSeed"
  // Auswahl-Commands
  | "robotNotFound"
  | "buildingNotFound"
  | "fieldOutOfBounds"
  // Programmstack- und Programmeditor-Commands
  | "programNotFound"
  | "programLocked"
  | "invalidProgramDefinition"
  | "invalidTemplateParameter"
  | "unknownSensor"
  | "unknownAction"
  | "unknownOperator"
  | "invalidConditionValue"
  | "programAlreadyFirst"
  | "programAlreadyLast"
  // Produktions-Commands
  | "buildingIsNotRobotFactory"
  | "buildingNotActive"
  | "buildingDisabled"
  | "productionAlreadyRunning"
  | "starterRobotMissing"
  | "starterRobotNotConnected"
  | "notEnoughIronOreInStarterCargo";

// ---------------------------------------------------------------------------
// GameState
// ---------------------------------------------------------------------------

export type GameState = {
  tick: Tick;
  randomSeed: string;
  isPaused: boolean;
  speed: 1 | 2 | 4;
  map: Field[][];
  robots: Robot[];
  buildings: Building[];
  selected: Selection;
  eventLog: GameEvent[];
  score: ScoreState;
  mvpGoalReached: boolean;

  // Future-prepared, inactive in MVP:
  materialRequests: MaterialRequest[];
};

// ---------------------------------------------------------------------------
// Asset Registry
// ---------------------------------------------------------------------------

export type AssetKey =
  | "terrain.plains"
  | "terrain.unknown"
  | "fog.unknown"
  | "fog.discovered"
  | "resource.ironOre"
  | "robot.starterRobot"
  | "robot.ironMiner"
  | "building.solarCollector"
  | "building.robotFactory"
  | "building.construction"
  | "ui.selection"
  | "ui.reservation"
  | "ui.productionPaused"
  | "ui.spawnBlocked";

export type RenderAssetKind = "image" | "cssShape" | "textBadge" | "proceduralTile";

export type RenderAsset = {
  key: AssetKey;
  kind: RenderAssetKind;
  source?: string;
  label?: string;
  fallback: boolean;
};

export type AssetRegistry = Partial<Record<AssetKey, RenderAsset>>;

export type FallbackAssetRegistry = Record<AssetKey, RenderAsset>;

export type AssetResolutionResult =
  | { type: "final"; key: AssetKey; asset: RenderAsset }
  | { type: "fallback"; key: AssetKey; asset: RenderAsset; diagnostic?: GameEvent }
  | { type: "missingFallback"; key: AssetKey; error: true; diagnostic: GameEvent };
