# Kanonisches Datenmodell

Dieses Dokument ist die verbindliche technische Referenz für Typen, IDs und Datenstrukturen.

## Zweck

v44 bereinigt `canonical-data-model.md`.

Dieses Dokument ist die kanonische TypeScript-Quelle fuer das aktive Datenmodell. Es gilt:

```text
Eine Typdefinition pro Typ.
Keine konkurrierenden Altdefinitionen.
Future-Erweiterungen sind im Typ enthalten, aber als nicht MVP markiert.
Verweise auf Spezialdokumente bleiben erlaubt, aber nicht als Ersatz für widersprüchliche Typen.
```

## Kanonische Regeln

```text
1. Dieses Dokument definiert die finalen Typnamen.
2. Ältere einfache Typen gelten nicht mehr, wenn sie hier nicht vorkommen.
3. Der alte einfache Program-Typ wird nicht verwendet.
4. Die visuelle Programmierung nutzt ProgramTemplateDefinition, ProgramInstance und ProgramRow.
5. RobotTask ist eine diskriminierte Union aus MovementTask, MiningTask, BuildingTask, StasisChargingTask sowie (ab Expansion 2) ChargingTask und LogisticsTask.
6. BuildingType enthält energyStorage und resourceStorage.
7. BuildingStatus enthält construction.
8. standardRobot ist kein kanonischer RobotType.
9. Logistik ist vorbereitet, aber nicht MVP-aktiv.
10. Forschung ist vorbereitet, aber nicht MVP-aktiv.
11. Deterministische ID-Erzeugung folgt `docs/03-technical/deterministic-id-generation.md`.
12. Bestehende Baustellen werden fuer `continueConstruction` nicht am Building gespeichert oder reserviert; die Reservierung wird aus laufenden `BuildingTask`s mit gleicher `buildingId` abgeleitet.
13. `GameEventCode` ist hier kanonisch definiert; andere Dokumente duerfen Event-Codes fachlich beschreiben, aber keine konkurrierende TypeScript-Union definieren.
14. Spielrelevanter Zufall folgt `docs/03-technical/seeded-rng.md`.
```

## Statusklassen

```ts
type MvpStatus =
  | "active"
  | "goalOnly"
  | "prepared"
  | "future";
```

Bedeutung:

```text
active:
Im MVP aktiv implementiert.

goalOnly:
Für das MVP-Ziel relevant, aber nicht vollständig als aktives System nötig.

prepared:
Typ/Datenmodell existiert im MVP, aber keine aktive Simulation.

future:
Nicht MVP.
```

## IDs und Basistypen

```ts
type EntityId = string;
type RobotId = string;
type BuildingId = string;
type ProgramInstanceId = string;
type ProgramRowId = string;
type ProgramTemplateIdValue = string;
type ProductionTaskId = string;
type RobotTaskId = string;
type MaterialRequestId = string;
type GameEventId = string;
type Tick = number;

type FieldCoord = {
  x: number;
  y: number;
};

type Direction =
  | "up"
  | "down"
  | "left"
  | "right";

type Hitpoints = {
  current: number;
  max: number;
};
```

## Deterministische ID-Erzeugung

Die ID-Typen bleiben string-basierte Aliase. Die Erzeugung neuer spielrelevanter IDs ist jedoch zentral geregelt in:

```text
docs/03-technical/deterministic-id-generation.md
```

Kanonische Factory-Signaturen:

```ts
function createBuildingId(
  buildingType: BuildingType,
  state: GameState,
): BuildingId;

function createProductionTaskId(
  buildingId: BuildingId,
  robotType: "ironMiner",
  state: GameState,
): ProductionTaskId;

function createSpawnedRobotId(
  robotType: "ironMiner",
  state: GameState,
): RobotId;

function createRobotTaskId(
  robotId: RobotId,
  taskType: ActiveRobotTaskType,
  state: GameState,
  sequenceInTick?: number,
): RobotTaskId;

function createGameEventId(
  tick: Tick,
  sequenceInTick: number,
  code: GameEventCode,
): GameEventId;
```

`sequenceInTick` fuer `createGameEventId` wird nicht spontan beim Event-Aufruf vergeben. Es entsteht aus der kanonischen Event-Sequenz in `docs/03-technical/deterministic-id-generation.md`: `pipelineStepOrder -> sourceOrder -> entitySortKey -> eventCodeOrder -> localSequence`.

Nicht erlaubt fuer spielrelevante IDs:

```text
Math.random()
Date.now()
crypto.randomUUID()
versteckte globale Zaehler außerhalb des GameState
```

## Ressourcen

```ts
type ResourceType =
  | "ironOre"
  | "gas"
  | "silicon"
  | "steelPlates";

type NaturalResourceType =
  | "ironOre"
  | "gas"
  | "silicon";

type ProcessedResourceType =
  | "steelPlates";

type ResourceInventory = Partial<Record<ResourceType, number>>;
type ResourceCost = Partial<Record<ResourceType, number>>;

type ExtractionMethod =
  | "directMining"
  | "refinery"
  | "specializedMining";
```

MVP aktiv:

```text
ironOre
```

Future:

```text
gas
silicon
steelPlates
```

## Karte und Felder

```ts
type TerrainType =
  | "plains"
  | "rubble"
  | "lavaRiver"
  | "mercuryRiver";

type MovementType =
  | "ground"
  | "flying";

type VisibilityState =
  | "unknown"    // nie sichtbar gewesen
  | "discovered" // bekannt, aber aktuell nicht sichtbar
  | "visible";   // aktuell durch mindestens eine Sichtquelle sichtbar

type ResourceDeposit = {
  type: NaturalResourceType;
  amount: number;
  extractionMethod: ExtractionMethod;
};

type ConstructionReservation = {
  buildingId: BuildingId;
  reservedByRobotIds: RobotId[];
};

type Field = {
  x: number;
  y: number;
  terrainType: TerrainType;
  visibility: VisibilityState;
  resource?: ResourceDeposit;
  buildingId?: BuildingId;
  reservedForConstruction?: ConstructionReservation;
};
```

MVP-Regeln:

```text
terrainType ist im MVP immer plains.
Aktive Ressourcenfelder blockieren Bewegung.
Erschöpfte Ressourcenfelder blockieren nicht mehr.
```

## Map Generation

```ts
type MapGenerationConfig = {
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
```

```ts
const MVP_MAP_CONFIG: MapGenerationConfig = {
  width: 10,
  height: 10,
  seed: "mvp-default",
  startPosition: { x: 5, y: 5 },
  starterSightRange: 2,
  ironOreFieldCount: 20,
  ironOrePerField: 20,
  requiredReachableIronOreMinDistance: 4,
  requiredReachableIronOreMaxDistance: 6,
  minClusterSize: 3,
  maxClusterSize: 8,
  maxGenerationAttempts: 100,
};
```

Konsistenzregel:

```text
`MVP_MAP_CONFIG` darf jeden Property-Namen genau einmal enthalten.
`requiredReachableIronOreMaxDistance` ist genau einmal mit dem Wert `6` definiert.
Doppelte Property-Eintraege in kanonischen Config-Objekten sind ungueltig.
```

```ts
const MVP_FALLBACK_IRON_ORE_FIELDS: FieldCoord[] = [
  { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 },
  { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 9, y: 1 }, { x: 9, y: 2 },
  { x: 1, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 8 }, { x: 2, y: 9 },
  { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 8 }, { x: 9, y: 9 },
  { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 2 },
];
```

Die Algorithmen stehen in:

```text
docs/03-technical/pathfinding-and-map-generation.md
```

## Roboter

```ts
type ChargingMode =
  | "selfCharging"
  | "externalOnly"
  | "hybrid";

type CommunicationMode =
  | "gridRequired"
  | "autonomous"
  | "scoutLocked";

type CommunicationStatus =
  | "connected"
  | "disconnected"
  | "offline"
  | "stasis"
  | "locked";

type UnitTier = 0 | 1 | 2 | 3;

type RobotType =
  | "starterRobot"
  | "ironMiner"
  | "groundScout"
  | "constructor"
  | "meleeDrone"
  | "resourceMiner"
  | "transportRobot"
  | "rangedDrone";

type RobotStatus =
  | "active"
  | "stasis"
  | "inactive"
  | "destroyed";

type RobotActivityState =
  | "idle"
  | "executingProgram"
  | "runningTask"
  | "stasisCharging";

type RobotRole =
  | "allrounder"
  | "miner"
  | "scout"
  | "builder"
  | "meleeCombat"
  | "resourceMiner"
  | "transport"
  | "rangedCombat";

type CargoState = {
  used: ResourceInventory;
  capacity: number;
};

type ActiveProgramState = {
  programId: ProgramInstanceId;
  rowId: ProgramRowId;
  startedTick: Tick;
};

type Robot = {
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
```

Regel:

```text
ActiveProgramState ist die einzige kanonische Speicherung fuer die aktuell ausgefuehrte Programmzeile eines Roboters.
Separate Program-/Row-ID-Felder am Robot-Objekt sind nicht kanonisch.
```

Aktivitätszustand:

```text
RobotActivityState ist ein abgeleiteter UI-/Diagnosezustand.
Er wird nicht als Robot.status gespeichert.

Wenn ein Roboter kein ausfuehrbares Programm, keinen aktiven Task und kein activeProgram besitzt, gilt:
robot.status = "active"
robot.activeTask = undefined
robot.activeProgram = undefined
der abgeleitete RobotActivityState ist "idle".
```

MVP-Roboter:

```text
starterRobot: active
ironMiner: goalOnly
```

Future-Roboter:

```text
groundScout
constructor
meleeDrone
resourceMiner
transportRobot
rangedDrone
```

Nicht kanonisch:

```text
standardRobot
```

## Robot Definitions

```ts
type RobotMvpStatus =
  | "active"
  | "goalOnly"
  | "future";

type RobotDefinition = {
  type: RobotType;
  displayName: string;
  tier: UnitTier;
  role: RobotRole;
  maxHp: number;
  maxBattery: number;
  startBattery: number;
  cargoCapacity: number;
  sightRange: number;
  movementType: MovementType;
  chargingMode: ChargingMode;
  communicationMode: CommunicationMode;
  allowedActions: ActionId[];
  production?: RobotProductionDefinition;
  mvpStatus: RobotMvpStatus;
};

type RobotProductionDefinition = {
  buildingType: BuildingType;
  alternativeBuildingTypes?: BuildingType[];
  cost: ResourceCost;
  totalTicks: number;
  powerRequired: number;
  requiredResearch?: ResearchProjectId;
};
```

Die Werte stehen in:

```text
docs/05-future/building-and-unit-tiers.md
```

## Gebäude

```ts
type BuildingTier = 1 | 2 | 3;

type BuildingType =
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

type BuildingStatus =
  | "construction"
  | "active"
  | "inactive"
  | "producing"
  | "disabled"
  | "destroyed";

type BuildingQuery = {
  buildingType: BuildingType;
  status?: BuildingStatus;
};

type BuildingFunction =
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

type StoragePolicy =
  | "allResources"
  | "naturalResourcesOnly"
  | "processedResourcesOnly"
  | "custom";

type BuildingMvpStatus =
  | "active"
  | "prepared"
  | "future";

type BuildingInventory = {
  input?: ResourceInventory;
  output?: ResourceInventory;
  storage?: ResourceInventory;
  construction?: ResourceInventory;
  reserved?: ReservedInventory;
  capacity?: Partial<Record<ResourceType, number>>;
  totalCapacity?: number;
};

type Building = {
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

  // Expansion 1:
  steelProductionTask?: SteelProductionTask;
  storedEnergy?: number; // nur energyStorage, 0..Kapazitaet
};
```

MVP-Regel v60:

```text
Solar Collector und Roboterfabrik verwenden sightRange = MVP_BUILDING_SIGHT_RANGE = 2.
Gebäudesicht ist nur aktiv bei status = active und isEnabled = true.
Gebäude in construction, disabled, destroyed oder mit isEnabled = false erzeugen keine Sicht.
```

MVP-Gebäude:

```text
solarCollector
robotFactory
```

Prepared/Future:

```text
aiResearchCenter
communicationTower
gridEnergyLine
advancedRobotFactory
droneFactory
gasExtractor
steelworks
energyStorage
resourceStorage
```

## Building Definitions und Rezepte

```ts
type BuildingDefinition = {
  type: BuildingType;
  displayName: string;
  tier: BuildingTier;
  mvpStatus: BuildingMvpStatus;
  functions: BuildingFunction[];
  maxHp: number;
  size: { width: number; height: number };
  sightRange: number;
  cost: ResourceCost;
  constructionRequired: number;
  buildTicksPerProgress: number;
  powerProvided?: number;
  idlePowerRequired?: number;
  activePowerRequired?: number;
  powerStorage?: {
    capacity: number;
    maxChargeRate: number;
    maxDischargeRate: number;
  };
  resourceStorage?: {
    capacity: number;
    policy: StoragePolicy;
    allowedResources?: ResourceType[];
  };
  communicationRange?: number;
  unlockResearch?: ResearchProjectId;
};

type BuildingRecipe = {
  id: string;
  buildingType: BuildingType;
  input: ResourceCost;
  output: ResourceInventory;
  totalTicks: number;
  powerRequired: number;
  requiredResearch?: ResearchProjectId;
};
```

## Programme: Templates, Instanzen, Zeilen

Der alte einfache `Program`-Typ ist nicht kanonisch.

```ts
type ProgramTemplateId =
  | "template.secureEnergy"
  | "template.exploreNearby"
  | "template.mineIronOre"
  | "template.buildSolarCollector"
  | "template.buildRobotFactory"
  | "template.stasisCharge"
  // Expansion 1 (docs/02-mvp/expansion-1-scope.md):
  | "template.buildAiResearchCenter"
  | "template.buildSteelworks"
  | "template.buildEnergyStorage"
  // Expansion 2 (docs/02-mvp/expansion-2-scope.md):
  | "template.buildResourceStorage"
  | "template.buildGridEnergyLine"
  | "template.logistics"
  | "template.rechargeAtGrid";

type ProgramExecutionLimit =
  | { type: "unlimited" }
  | { type: "once" }
  | { type: "count"; maxExecutions: number };

type ProgramExecutionState = {
  completedExecutions: number;
};

type ProgramTemplateDefinition = {
  id: ProgramTemplateId;
  name: string;
  description: string;
  defaultEnabled: boolean;
  defaultStackPosition: number;
  rows: ProgramRowDefinition[];
  executionLimit?: ProgramExecutionLimit;
  locked?: boolean;
};

type ProgramInstance = {
  id: ProgramInstanceId;
  templateId: ProgramTemplateId;
  name: string;
  enabled: boolean;
  rows: ProgramRow[];
  executionLimit?: ProgramExecutionLimit;
  executionState?: ProgramExecutionState;
  locked?: boolean;
};

type ProgramRow = {
  id: ProgramRowId;
  if: ConditionExpression;
  then: ProgramAction;
  stop: StopConditionGroup;
};

type ProgramRowDefinition = ProgramRow;

type StopConditionGroup = {
  operator: "OR";
  conditions: ConditionExpression[];
};
```

### MVP-UpdateProgram-Editierbarkeit

`updateProgram` darf im MVP keine freie Programmstruktur importieren. Es darf nur Änderungen akzeptieren, die der MVP-Formular-/Zeileneditor erzeugen kann.

Kanonische Strukturregel:

```text
templateId, row.id, row.then.actionId, SensorIds, OperatorIds und die Grundform der IF/THEN/STOP-Struktur bleiben templatekonform.
```

Technische Edit-Policy:

```ts
type ProgramEditField =
  | "name"
  | "enabled"
  | "row.if.value"
  | "row.then.parameters"
  | "row.stop.value";

type ProgramEditPolicy = {
  templateId: ProgramTemplateId;
  locked: boolean;
  editableFields: ProgramEditField[];
  allowedActionParameterValues?: Partial<Record<string, ActionParameterValue[]>>;
  allowedConditionValues?: ConditionValue[];
};

const MVP_PROGRAM_EDIT_POLICIES: ProgramEditPolicy[] = [
  {
    templateId: "template.mineIronOre",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      resourceType: [{ type: "resourceType", value: "ironOre" }],
    },
  },
  {
    templateId: "template.buildSolarCollector",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      buildingType: [{ type: "buildingType", value: "solarCollector" }],
    },
  },
  {
    templateId: "template.buildRobotFactory",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      buildingType: [{ type: "buildingType", value: "robotFactory" }],
    },
  },
  {
    templateId: "template.exploreNearby",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      targetFieldType: [{ type: "fieldType", value: "ironOre" }],
    },
  },
  {
    templateId: "template.stasisCharge",
    locked: true,
    editableFields: [],
  },
];
```

MVP-Regeln:

```text
Eine ProgramInstance muss zu ihrer ProgramTemplateDefinition passen.
Unbekannte actionId, sensorId, operatorId oder ConditionValue-Typen werden rejected.
Nicht freigegebene Strukturänderungen werden rejected invalidProgramDefinition.
Nicht erlaubte Parameterwerte werden rejected invalidTemplateParameter.
Locked Programme werden immer rejected programLocked.
```

### Stabile MVP-ProgramRowIds

`ProgramRowId` ist weiterhin ein String-Typ, aber die Startroboter-Zeilen erhalten stabile, deterministische IDs. Diese IDs sind verbindlich fuer `createStarterProgramStack()`, Diagnostics, Eventlog und Tests.

```ts
const MVP_STARTER_PROGRAM_ROW_IDS = {
  mineIronOre: "row.starter.mineIronOre.main",
  buildSolarCollector: "row.starter.buildSolarCollector.main",
  buildRobotFactory: "row.starter.buildRobotFactory.main",
  exploreNearby: "row.starter.exploreNearby.main",
  stasisCharge: "row.starter.stasisCharge.main",
} as const;

type MvpStarterProgramRowId =
  | "row.starter.mineIronOre.main"
  | "row.starter.buildSolarCollector.main"
  | "row.starter.buildRobotFactory.main"
  | "row.starter.exploreNearby.main"
  | "row.starter.stasisCharge.main";
```

## Conditions, Sensoren, Operatoren

```ts
type ConditionExpression =
  | SensorCondition
  | NotCondition
  | LogicalConditionGroup;

type SensorCondition = {
  type: "sensor";
  sensorId: SensorId;
  operator: OperatorId;
  value: ConditionValue;
};

type NotCondition = {
  type: "not";
  condition: ConditionExpression;
};

type LogicalConditionGroup = {
  type: "group";
  operator: "AND" | "OR";
  conditions: ConditionExpression[];
};

type SensorDefinition = {
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

type SensorId =
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

type SensorValueType =
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

type OperatorId =
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

type ConditionValue =
  | { type: "percentage"; value: number }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "fieldType"; value: FieldTypeQuery }
  | { type: "resourceType"; value: ResourceType }
  | { type: "buildingType"; value: BuildingType }
  | { type: "buildingStatus"; value: BuildingStatus }
  | { type: "buildingQuery"; value: BuildingQuery }
  | { type: "robotStatus"; value: RobotStatus }
  | { type: "power"; value: number }
  // Expansion 1: Cargo-Menge einer konkreten Ressource (sensor.cargoResourceAmount)
  | { type: "resourceAmount"; value: { resourceType: ResourceType; amount: number } };

type FieldTypeQuery =
  | "ironOre"
  | "solarCollector"
  | "robotFactory"
  | "chargingField"
  | "building"
  | "freeField"
  | "blockedField";
```

### Kanonischer Roboterstatus-Sensor

`Roboterstatus = Stasis` in sichtbaren Template-Regeln wird technisch als SensorCondition modelliert.

```ts
const ROBOT_STATUS_STASIS_CONDITION: SensorCondition = {
  type: "sensor",
  sensorId: "sensor.robotStatus",
  operator: "eq",
  value: { type: "robotStatus", value: "stasis" },
};
```

Regel:

```text
Jede Template-Bedingung mit Roboterstatus muss sensor.robotStatus verwenden.
Freitext wie "Roboterstatus = Stasis" ist nur UI-Label, nicht Datenmodell.
```

### Kanonische Gebäude-mit-Status-Bedingungen

Sichtbare Regeln wie `Gebäude existiert Solar Collector mit Status active` oder `Baustelle existiert Roboterfabrik mit Status construction` werden nicht als lose Kombination aus `buildingType` und `buildingStatus` modelliert. Sie nutzen einen `BuildingQuery` in einer einzigen SensorCondition.

```ts
const SOLAR_COLLECTOR_ACTIVE_CONDITION: SensorCondition = {
  type: "sensor",
  sensorId: "sensor.buildingExists",
  operator: "exists",
  value: {
    type: "buildingQuery",
    value: { buildingType: "solarCollector", status: "active" },
  },
};

const SOLAR_COLLECTOR_CONSTRUCTION_CONDITION: SensorCondition = {
  type: "sensor",
  sensorId: "sensor.buildingExists",
  operator: "exists",
  value: {
    type: "buildingQuery",
    value: { buildingType: "solarCollector", status: "construction" },
  },
};

const ROBOT_FACTORY_ACTIVE_CONDITION: SensorCondition = {
  type: "sensor",
  sensorId: "sensor.buildingExists",
  operator: "exists",
  value: {
    type: "buildingQuery",
    value: { buildingType: "robotFactory", status: "active" },
  },
};

const ROBOT_FACTORY_CONSTRUCTION_CONDITION: SensorCondition = {
  type: "sensor",
  sensorId: "sensor.buildingExists",
  operator: "exists",
  value: {
    type: "buildingQuery",
    value: { buildingType: "robotFactory", status: "construction" },
  },
};
```

Regeln:

```text
BuildingQuery.status ist optional.
Ohne status prüft BuildingQuery nur den Gebäudetyp unabhängig vom Status.
Mit status prüft BuildingQuery Gebäudetyp und Status gemeinsam.
NOT Gebäude oder Baustelle existiert X wird als NOT sensor.buildingExists mit BuildingQuery ohne status modelliert, wobei construction und active gleichermaßen als existierend zählen.
```

## Aktionen

```ts
type ActionId =
  | "action.charge"
  | "action.scoutNearby"
  | "action.mineResource"
  | "action.buildBuilding"
  | "action.stasisCharge";

type ProgramAction = {
  actionId: ActionId;
  parameters: Record<string, ActionParameterValue>;
};

type ActionEnergyRequirement = {
  minimumBattery: number;
};

type ActionParameterDefinition = {
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

type ActionParameterValue =
  | string
  | number
  | boolean
  | { type: "resourceType"; value: ResourceType }
  | { type: "buildingType"; value: BuildingType }
  | { type: "fieldType"; value: FieldTypeQuery }
  | { type: "fieldCondition"; value: FieldCondition };

type ActionDefinition = {
  id: ActionId;
  label: string;
  energyRequirement: ActionEnergyRequirement;
  parameters: ActionParameterDefinition[];
};

type FieldCondition =
  | { type: "freeNeighborField" }
  | { type: "adjacentToBuilding"; buildingType: BuildingType }
  | { type: "adjacentToResource"; resourceType: ResourceType }
  | { type: "notOnActiveResource" }
  | { type: "buildableTerrain" }
  | { type: "highSunlightPreferred" };

type ScoutTargetReason =
  | "visibleTarget"
  | "unknownBorder"
  | "fallbackReachableField";

type ScoutTarget = {
  target: FieldCoord;
  reason: ScoutTargetReason;
};

type ScoutNearbyActionParameters = {
  targetFieldType: { type: "fieldType"; value: FieldTypeQuery };
};

type MineResourceActionParameters = {
  resourceType: NaturalResourceType;
};

type BuildPlacementReason =
  | "nearBuilder"
  | "nearActiveSolarCollector"
  | "continueExistingConstruction";

type BuildingTaskMode =
  | "newConstruction"
  | "continueConstruction";

type BuildTarget = {
  buildingType: BuildingType;
  site: FieldCoord;
  buildFrom: FieldCoord;
  reason: BuildPlacementReason;
  mode: BuildingTaskMode;
  buildingId?: BuildingId;
};

type BuildBuildingActionParameters = {
  buildingType: BuildingType;
};

const MVP_EXPLORE_ACTION: ProgramAction = {
  actionId: "action.scoutNearby",
  parameters: {
    targetFieldType: { type: "fieldType", value: "ironOre" },
  },
};

const MVP_MINE_IRON_ORE_ACTION: ProgramAction = {
  actionId: "action.mineResource",
  parameters: {
    resourceType: "ironOre",
  },
};

const MVP_BUILD_SOLAR_COLLECTOR_ACTION: ProgramAction = {
  actionId: "action.buildBuilding",
  parameters: {
    buildingType: "solarCollector",
  },
};

const MVP_BUILD_ROBOT_FACTORY_ACTION: ProgramAction = {
  actionId: "action.buildBuilding",
  parameters: {
    buildingType: "robotFactory",
  },
};
```

Nicht Teil des Starter-Roboter-Stacks:

```text
action.produceRobot
```

Produktion ist im MVP eine Gebaeudefunktion.

## Action Executability

Die Ausfuehrbarkeitsregeln stehen in `docs/03-technical/action-executability-matrix.md`.

```ts
type ActionExecutabilityResult =
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

type ActionNotExecutableReason =
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
```

## Program Evaluation

```ts
type ProgramBlockReason =
  | "programDisabled"
  | "executionLimitReached"
  | "conditionFalse"
  | "actionNotExecutable"
  | "insufficientBattery"
  | "noPath"
  | "missingResource"
  | "targetInvalid";

type ProgramEvaluationResult =
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

type ProgramEvaluationTrace = {
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
```

## Robot Tasks und Bewegung

RobotTask ist eine kanonische diskriminierte Union. Die Simulation speichert in `robot.activeTask` immer eine konkrete Task-Variante. Der alte generische Task mit optionalen Feldern wie `targetX`, `targetY`, `resourceDeltaOnSuccess`, `buildMode` oder `logisticTask` ist nicht mehr kanonisch.

```ts
type MovementState = {
  blockedByRobotTicks: number;
};

type PathResult =
  | { type: "found"; path: FieldCoord[] }
  | { type: "noPath" };

type MoveStepResult =
  | { type: "moved"; to: FieldCoord }
  | { type: "blockedByRobot" }
  | { type: "blockedPermanently" }
  | { type: "noPath" };

type RobotTaskStatus =
  | "running"
  | "completed"
  | "aborted";

type TaskAbortReason =
  | "insufficientBattery"
  | "targetInvalid"
  | "noPath"
  | "blockedByRobot"
  | "cargoFull"
  | "resourceDepleted"
  | "notAdjacentToTarget"
  | "noReachableChargingField"
  | "stopConditionMet";

type ActiveRobotTaskType =
  | "movement"
  | "mining"
  | "building"
  | "stasisCharging"
  // Expansion 2 (docs/02-mvp/expansion-2-scope.md):
  | "charging"
  | "logistics";

type RobotTaskType = ActiveRobotTaskType;

type BaseRobotTask = {
  id: RobotTaskId;
  status: RobotTaskStatus;
  sourceProgramId: ProgramInstanceId;
  sourceRowId: ProgramRowId;
  startedTick: Tick;
  completedTick?: Tick;
  abortReason?: TaskAbortReason;
};

type MovementTask = BaseRobotTask & {
  type: "movement";
  path: FieldCoord[];
  target: FieldCoord;
  reason: "scouting" | "building" | "fallback";
  movementState: MovementState;
};

type MiningTask = BaseRobotTask & {
  type: "mining";
  resourceType: "ironOre";
  target: FieldCoord;
  totalTicks: number;
  remainingTicks: number;
  minedAmount: number;
  batteryCostOnSuccess: number;
};

type ActiveBuildableType =
  | "solarCollector"
  | "robotFactory"
  // Expansion 1:
  | "aiResearchCenter"
  | "steelworks"
  | "energyStorage";

type BuildingTask = BaseRobotTask & {
  type: "building";
  mode: BuildingTaskMode;
  buildingId: BuildingId;
  buildingType: ActiveBuildableType;
  site: FieldCoord;
  buildFrom: FieldCoord;
  totalTicks: number;
  remainingTicks: number;
  costToPay: ResourceCost;
  costPaidByThisTask: boolean;
  batteryCostOnSuccess: number;
};

type StasisChargingTask = BaseRobotTask & {
  type: "stasisCharging";
  targetBattery: number;
};

// Expansion 2: externes Laden an einer Ladezone (docs/02-mvp/expansion-2-scope.md).
type ChargingTask = BaseRobotTask & {
  type: "charging";
  targetBattery: number;
};

// Expansion 2: Ausfuehrung eines zugewiesenen MaterialRequests.
type LogisticTaskPhaseActive =
  | "moveToPickup"
  | "pickup"
  | "moveToDelivery"
  | "delivery";

type LogisticsTask = BaseRobotTask & {
  type: "logistics";
  requestId: MaterialRequestId;
  phase: LogisticTaskPhaseActive;
  path: FieldCoord[];
  carried?: ResourceInventory;
  movementState: MovementState;
};

type RobotTask =
  | MovementTask
  | MiningTask
  | BuildingTask
  | StasisChargingTask
  | ChargingTask
  | LogisticsTask;

type ConstructionTaskReservation = {
  buildingId: BuildingId;
  robotId: RobotId;
  taskId: RobotTaskId;
  mode: BuildingTaskMode;
};

function getActiveConstructionTaskReservation(
  state: GameState,
  buildingId: BuildingId
): ConstructionTaskReservation | undefined;

function isConstructionSiteReserved(
  state: GameState,
  buildingId: BuildingId,
  requestingRobotId?: RobotId
): boolean;
```

Regeln für Baustellen-Reservierung:

```text
`ConstructionReservation` am Field reserviert nur geplante/neue Bauplätze.
Für bestehende Baustellen wird keine zusätzliche Reservation am Building gespeichert.
Eine bestehende Baustelle gilt als reserviert, wenn ein laufender BuildingTask dieselbe buildingId besitzt.
Im MVP darf es höchstens einen laufenden BuildingTask pro buildingId geben.
Die Reservierung endet automatisch mit Abschluss oder Abbruch des BuildingTask.
```

Regeln:

```text
`robot.activeTask` enthaelt nur diese Union.
MVP-aktive Tasks sind movement, mining, building und stasisCharging.
`charging` und `logistics` bleiben Future/Prepared und duerfen im MVP nicht als aktive RobotTask-Instanz erzeugt werden.
Task-spezifische Felder stehen in der jeweiligen Variante, nicht als optionale Felder auf einem generischen RobotTask.
```

## ProductionTask

```ts
type ProductionTaskStatus =
  | "inProgress"
  | "readyToSpawn"
  | "spawnBlocked";

type ProductionBlockedReason =
  | "insufficientPower"
  | "noFreeOutputField"
  | "buildingDisabled";

type ProductionTask = {
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
```

```ts
const MVP_IRON_MINER_PRODUCTION = {
  robotType: "ironMiner",
  cost: { ironOre: 5 },
  totalTicks: 10,
  powerRequired: 40,
} as const;
```

Regeln:

```text
Eine Roboterfabrik hat im MVP maximal einen ProductionTask.
Es gibt keinen dauerhaft gespeicherten completed-Status.
Nach erfolgreichem Spawn wird productionTask entfernt.
Das MVP-Ziel wird erst nach erfolgreichem Spawn gesetzt.
```

Timing-Regel:

```text
Bei Start in Tick N gilt createdTick = startedTick = N und remainingTicks = 10.
ProductionTask-Fortschritt ist nur zulaessig, wenn startedTick < currentTick.
Der erste moegliche Fortschritt ist daher Tick N+1.
```

## Stahlwerk-Verarbeitung (Expansion 1)

Aktiver Umfang und Materialfluss stehen in `docs/02-mvp/expansion-1-scope.md`.

```ts
type SteelProductionStatus =
  | "inProgress"
  | "outputBlocked";

type SteelProductionBlockedReason =
  | "insufficientPower"
  | "cargoFull";

type SteelProductionTask = {
  id: string;
  buildingId: BuildingId;
  cost: ResourceCost; // { ironOre: 2 }
  costPaid: boolean;
  totalTicks: number;
  remainingTicks: number;
  powerRequired: number;
  status: SteelProductionStatus;
  blockedReason?: SteelProductionBlockedReason;
  createdTick: Tick;
  startedTick: Tick;
  completedTick?: Tick;
};
```

`Building.steelProductionTask?: SteelProductionTask` gilt nur fuer `steelworks`.
ID-Muster: `production.steelPlates.<buildingId>.<seq3>` mit
`seq3 = bereits produzierte Steel Plates dieses Gebaeudes + aktive Auftraege + 1`.

## Forschung (Expansion 1 aktiv)

Der aktive Forschungsumfang steht in `docs/02-mvp/expansion-1-scope.md`; die
Projektwerte stammen aus `docs/05-future/research-tree.md`.

```ts
type ResearchState = {
  activeProjectId?: ResearchProjectId;
  activeProjectSelectedTick?: Tick; // Punkte/Leistungsbedarf erst ab Folgetick
  progress: Partial<Record<ResearchProjectId, number>>;
  completedProjects: ResearchProjectId[];
};
```

Regeln:

```text
GameState.research ist der kanonische Forschungszustand.
Fortschritt wird pro Projekt gespeichert; Projektwechsel verwirft nichts.
Ein Unlock gilt als aktiv, sobald die Projekt-ID in completedProjects steht.
```

## Energie und Laden

Die vollständigen Konstanten stehen in `docs/03-technical/mvp-constants.md`.

```ts
type EnergySnapshot = {
  tick: Tick;
  powerProvided: number;
  powerRequired: number;
  freePower: number;
};
```

Aktive MVP-Regel:

```text
Stasis-Laden ist die einzige aktive Roboter-Lademechanik.
Gebäudeenergie ist separat und beeinflusst nur ProductionTasks.
Externe Roboterladung ist Future/Advanced.
```

```ts
const MVP_SELF_CHARGE_RATE = 1;
```

`StasisChargingTask` ist Teil der kanonischen `RobotTask`-Union im Abschnitt "Robot Tasks und Bewegung". Nicht aktive Legacy-Konstanten wie `MVP_EXTERNAL_CHARGE_RATE_MAX` oder `MVP_EXTERNAL_CHARGE_POWER_MAX` duerfen im MVP nicht als aktive Regel verwendet werden.

## Kommunikation

```ts
const MVP_COMMUNICATION_GRID_ACTIVE = false;

const MVP_STARTER_COMMUNICATION = {
  communicationMode: "autonomous",
  communicationStatus: "connected",
} as const;

const MVP_IRON_MINER_COMMUNICATION = {
  communicationMode: "gridRequired",
  communicationStatus: "connected",
} as const;
```

Regeln:

```text
Alle MVP-relevanten Einheiten gelten als connected.
Kommunikation blockiert im MVP keine Programme, Aktionen, Bewegung, Produktion oder UI-Änderungen.
```

## Logistik

Logistik ist Future, aber das Datenmodell ist vorbereitet.

```ts
type InventoryRole =
  | "input"
  | "output"
  | "storage"
  | "construction"
  | "cargo";

type ReservedInventory = Partial<Record<ResourceType, number>>;

type MaterialRequestType =
  | "moveToStorage"
  | "supplyBuildingInput"
  | "supplyConstruction"
  | "clearBuildingOutput";

type MaterialRequestStatus =
  | "open"
  | "reserved"
  | "assigned"
  | "pickupInProgress"
  | "deliveryInProgress"
  | "fulfilled"
  | "blocked"
  | "cancelled";

type MaterialRequestBlockedReason =
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

type MaterialEndpoint =
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

type MaterialRequest = {
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

type LogisticTaskPhase =
  | "moveToPickup"
  | "pickup"
  | "moveToDelivery"
  | "delivery";

type LogisticTaskState = {
  requestId: MaterialRequestId;
  phase: LogisticTaskPhase;
  pickupEndpoint: MaterialEndpoint;
  deliveryEndpoint: MaterialEndpoint;
  resources: ResourceInventory;
};
```

MVP-Regel:

```text
materialRequests existiert im GameState als vorbereitetes Feld und bleibt im MVP leer.
Ab Expansion 2 (docs/02-mvp/expansion-2-scope.md) sind die Request-Typen
supplyBuildingInput, clearBuildingOutput und moveToStorage aktiv; supplyConstruction
bleibt Future. Der Startzustand bleibt unveraendert leer.
```

## Forschung

Forschung ist Future.

```ts
type ResearchBranch =
  | "infrastructure"
  | "energy"
  | "industry"
  | "resourceExtraction"
  | "units"
  | "communication"
  | "programDesign"
  | "combatDefense";

type ResearchTier = 1 | 2 | 3 | 4;

type ResearchProjectId =
  | "research.basicAutomation1"
  | "research.metalProcessing1"
  | "research.construction1"
  | "research.energyDistribution1"
  | "research.communication1"
  | "research.groundScout1"
  | "research.gasExtraction1"
  | "research.siliconDetection1"
  | "research.industrialManufacturing1"
  | "research.transportLogistics1"
  | "research.programDesign2"
  | "research.energyBuffer1"
  | "research.siliconMining1"
  | "research.flightMechanics1"
  | "research.meleeCombat1"
  | "research.defenseRoutines1"
  | "research.programDesign3"
  | "research.communication2"
  | "research.autonomyModules1"
  | "research.advancedEnergy1"
  | "research.rangedCombat1"
  | "research.fleetCoordination1";

type ResearchUnlock =
  | { type: "building"; buildingType: BuildingType }
  | { type: "robot"; robotType: RobotType }
  | { type: "resource"; resourceType: ResourceType }
  | { type: "recipe"; recipeId: string }
  | { type: "programFeature"; featureId: string }
  | { type: "system"; systemId: string };

type ResearchProject = {
  id: ResearchProjectId;
  name: string;
  branch: ResearchBranch;
  tier: ResearchTier;
  prerequisites: ResearchProjectId[];
  researchCost: number;
  resourceCost?: ResourceCost;
  unlocks: ResearchUnlock[];
  description: string;
};
```

## Score und Events

Der kanonische Event-Typ ist `GameEvent` mit stabilem `code`. Tests prüfen `code`, nicht `message`.

```ts
type ScoreState = {
  minedIronOre: number;
  builtSolarCollectors: number;
  builtRobotFactories: number;
  builtBuildings: number;
  spawnedRobots: number;
  elapsedTicks: number;
  goalBonusAwarded: boolean;
  totalScore: number;
};

type GameEventCode =
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

  | "research.projectSelected"
  | "research.paused.insufficientPower"
  | "research.completed"

  | "production.steelPlates.started"
  | "production.steelPlates.blocked.notEnoughOre"
  | "production.steelPlates.paused.insufficientPower"
  | "production.steelPlates.outputBlocked"
  | "production.steelPlates.completed"

  | "production.transportRobot.started"
  | "production.transportRobot.blocked.notEnoughSteel"
  | "production.transportRobot.paused.insufficientPower"
  | "production.transportRobot.spawnBlocked"
  | "production.transportRobot.spawned"

  | "logistics.request.created"
  | "logistics.request.assigned"
  | "logistics.request.blocked"
  | "logistics.request.fulfilled"
  | "logistics.request.cancelled"

  | "action.charge.started"
  | "action.charge.paused.insufficientPower"
  | "action.charge.completed"
  | "action.charge.blocked.noReachableChargingField"

  | "debug.command.rejected"
  | "debug.canExecuteAction.result"
  | "debug.build.targetRejected"
  | "debug.scout.targetRejected"
  | "debug.asset.fallbackUsed"
  | "debug.asset.missingFallback";

type GameEventVisibility = "player" | "debug";
type GameEventSeverity = "info" | "success" | "warning" | "error";
type GameEventPriority = "low" | "normal" | "high" | "critical";

type GameEventCategory =
  | "system"
  | "program"
  | "action"
  | "task"
  | "resource"
  | "building"
  | "production"
  | "robot"
  | "goal";

type GameEvent = {
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


type BuildActionEventDetails = {
  mode: BuildingTaskMode;
  buildingType: "solarCollector" | "robotFactory";
  buildingId: BuildingId;
  siteX: number;
  siteY: number;
};

type BuildActionGameEvent = GameEvent & {
  code:
    | "action.build.targetSelected"
    | "action.build.started"
    | "action.build.completed";
  details: BuildActionEventDetails;
};
```



Build-Event-Details:

```text
Für `action.build.targetSelected`, `action.build.started` und `action.build.completed` ist `details.mode` verbindlich.
Der Wert muss exakt dem `BuildingTask.mode` entsprechen: `newConstruction` oder `continueConstruction`.
Diese Events muessen außerdem `details.buildingType`, `details.buildingId`, `details.siteX` und `details.siteY` enthalten.
```

Legacy-`GameEventType`-Listen sind nicht kanonisch.

Score-Regel:

```text
Roboter-Score und MVP-Zielbonus werden erst nach erfolgreichem Spawn vergeben.
```

## UI-State und PlayerCommands

```ts
type Selection =
  | { type: "robot"; id: RobotId }
  | { type: "building"; id: BuildingId }
  | { type: "field"; x: number; y: number }
  | null;

type UiState = {
  selected: Selection;
  openEditorProgramId?: ProgramInstanceId;
  editedProgramDraft?: ProgramInstance;
  diagnosticsExpanded: boolean;
};

type PlayerCommand =
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
  | { type: "resetRun"; seed?: string }
  // Expansion 1:
  | { type: "selectResearchProject"; projectId: ResearchProjectId }
  | { type: "startSteelProduction"; buildingId: BuildingId }
  | { type: "addProgramFromTemplate"; robotId: RobotId; templateId: ProgramTemplateId }
  | { type: "removeProgram"; robotId: RobotId; programId: ProgramInstanceId }
  // Expansion 2 (docs/02-mvp/expansion-2-scope.md):
  | { type: "startTransportRobotProduction"; buildingId: BuildingId };

type CommandResult =
  | { type: "accepted" }
  | { type: "rejected"; reason: CommandRejectionReason };

type CommandRejectionReason =
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
  | "notEnoughIronOreInStarterCargo"

  // Expansion 1: Forschung, Stahlwerk, Template-Bibliothek
  | "researchCenterMissing"
  | "unknownResearchProject"
  | "researchPrerequisiteMissing"
  | "researchProjectAlreadyCompleted"
  | "buildingIsNotSteelworks"
  | "steelProductionAlreadyRunning"
  | "templateNotUnlocked"
  | "duplicateProgram"

  // Expansion 2: Transporter-Produktion
  | "notEnoughSteelPlatesInStarterCargo";
```


### CommandResult-Regeln

`CommandResult` gilt fuer alle `PlayerCommand`-Varianten, nicht nur fuer `startIronMinerProduction`.

Kanonische Regeln:

```text
accepted = Command wurde validiert und angewendet.
rejected = Command wurde nicht angewendet; Grund steht in reason.
```

Bei `rejected` darf der Command keine spielrelevante State-Mutation ausloesen. Zulässig sind nur UI-lokale Rueckmeldung sowie Diagnose-/Eventlog-Eintraege.

`pause`, `resume` und korrekt typisierte `resetRun`-Commands werden im MVP normalerweise akzeptiert. Runtime-seitig fehlerhafte oder unbekannte Commands werden mit `invalidCommand` abgelehnt.

Die ausfuehrliche Command-Matrix steht in `docs/03-technical/player-command-handling.md`.

Nicht MVP:

```ts
type NonMvpCommand =
  | { type: "directMove" }
  | { type: "directBuild" }
  | { type: "directAttack" };
```

## GameState

```ts
type GameState = {
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

  // Expansion 1:
  research: ResearchState;

  // Future-prepared, inactive in MVP:
  materialRequests: MaterialRequest[];
};
```

Der exakte initiale GameState ist verbindlich in `docs/02-mvp/initial-game-state.md` definiert. Dieses Datenmodell enthält nur die kanonischen State-Typen, Signaturen und Querverweise. Es darf keine alternative oder vereinfachte Initial-State-Definition enthalten.

## Initialisierung

Der initiale GameState wird in `docs/02-mvp/initial-game-state.md` vollstaendig beschrieben. Dieses Dokument definiert nur die kanonischen Signaturen und verweist auf die dortige Initial-State-Quelle.

```ts
function createInitialGame(seed = "mvp-default"): GameState
function createStarterRobot(): Robot
function createStarterProgramStack(): ProgramInstance[]
```

Kanonische Startwerte: Seed `mvp-default`, Startposition `{ x: 5, y: 5 }`, Startbatterie `100`, leerer Cargo, keine Startgebaeude, `mvpGoalReached = false`.

## Asset Registry

Assets verwenden `AssetKey`. Dieser Abschnitt ist die einzige kanonische TypeScript-Quelle fuer `AssetKey`, `RenderAssetKind`, `RenderAsset`, `AssetRegistry`, `FallbackAssetRegistry`, `AssetResolutionResult`, `resolveAsset` und `resolveAssetDetailed`. Vollstaendige Fallback-Regeln stehen in `docs/05-assets/asset-fallbacks.md`.

```ts
type AssetKey =
  | "terrain.plains"
  | "terrain.unknown"
  | "fog.unknown"
  | "fog.discovered"
  | "resource.ironOre"
  | "robot.starterRobot"
  | "robot.ironMiner"
  | "building.solarCollector"
  | "building.robotFactory"
  | "building.aiResearchCenter"
  | "building.steelworks"
  | "building.energyStorage"
  | "building.construction"
  | "ui.selection"
  | "ui.reservation"
  | "ui.productionPaused"
  | "ui.spawnBlocked"
  // Expansion 2:
  | "building.resourceStorage"
  | "building.gridEnergyLine"
  | "robot.transportRobot";

type RenderAssetKind =
  | "image"
  | "cssShape"
  | "textBadge"
  | "proceduralTile";

type RenderAsset = {
  key: AssetKey;
  kind: RenderAssetKind;
  source?: string;
  label?: string;
  fallback: boolean;
};

type AssetRegistry = Partial<Record<AssetKey, RenderAsset>>;

type FallbackAssetRegistry = Record<AssetKey, RenderAsset>;

type AssetResolutionResult =
  | { type: "final"; key: AssetKey; asset: RenderAsset }
  | { type: "fallback"; key: AssetKey; asset: RenderAsset; diagnostic?: GameEvent }
  | { type: "missingFallback"; key: AssetKey; error: true; diagnostic: GameEvent };

function createDebugAssetFallbackUsedEvent(
  key: AssetKey,
  fallbackAsset: RenderAsset
): GameEvent;

function createDebugAssetMissingFallbackEvent(key: AssetKey): GameEvent;

function resolveAssetDetailed(
  key: AssetKey,
  loadedAssets: AssetRegistry,
  fallbackAssets: FallbackAssetRegistry
): AssetResolutionResult {
  const finalAsset = loadedAssets[key];
  if (finalAsset) {
    return { type: "final", key, asset: finalAsset };
  }

  const fallbackAsset = fallbackAssets[key];
  if (fallbackAsset) {
    return {
      type: "fallback",
      key,
      asset: fallbackAsset,
      diagnostic: createDebugAssetFallbackUsedEvent(key, fallbackAsset),
    };
  }

  return {
    type: "missingFallback",
    key,
    error: true,
    diagnostic: createDebugAssetMissingFallbackEvent(key),
  };
}

function resolveAsset(
  key: AssetKey,
  loadedAssets: AssetRegistry,
  fallbackAssets: FallbackAssetRegistry
): RenderAsset {
  const result = resolveAssetDetailed(key, loadedAssets, fallbackAssets);

  if (result.type === "missingFallback") {
    throw new Error(`Missing fallback asset for ${key}`);
  }

  return result.asset;
}
```

Kanonische Trennung:

```text
resolveAsset(key, loadedAssets, fallbackAssets)
  Render-sicherer Pfad fuer UI/Map-Rendering.
  Gibt fuer MVP-AssetKeys immer ein RenderAsset zurueck oder wirft bei fehlendem Fallback einen technischen Fehler.

resolveAssetDetailed(key, loadedAssets, fallbackAssets)
  Diagnose- und Testpfad.
  Unterscheidet final, fallback und missingFallback.
  Darf debug.asset.fallbackUsed oder debug.asset.missingFallback vorbereiten.
```

`loadedAssets` ist eine partielle Registry, weil finale Assets fehlen duerfen. `fallbackAssets` ist eine vollstaendige Registry, weil jeder MVP-`AssetKey` einen Fallback besitzen muss.

`resolveAsset(key, ...)` darf fuer MVP-AssetKeys niemals `undefined` liefern. Legacy-`AssetId`-Listen sind nicht kanonisch.

## MVP-Konstanten

Die zentrale Konstantenliste steht in:

```text
docs/03-technical/mvp-constants.md
```

Dieses Datenmodell darf Konstanten referenzieren, aber nicht abweichend definieren.

## Konsolidierte Hinweise aus

Die frueher angehaengten Abschnitte `v45` bis `v58` wurden in v61 dedupliziert. Ihre weiterhin gueltigen Typen und Regeln wurden in die passenden Fachabschnitte dieses Dokuments oder in die jeweiligen Spezialdokumente uebernommen.

Gueltige Quellendokumente fuer Detailregeln:

```text
docs/02-mvp/initial-game-state.md
docs/02-mvp/mvp-template-spec.md
docs/03-technical/action-executability-matrix.md
docs/03-technical/diagnostics-and-eventlog.md
docs/03-technical/mvp-constants.md
docs/03-technical/robot-task-lifecycle.md
docs/04-systems/energy-system.md
docs/04-systems/production-and-spawn.md
docs/05-assets/asset-fallbacks.md
```

Keine Typdefinition darf in diesem Dokument ein zweites Mal auftreten. Neue Versionsergaenzungen muessen in die bestehende Typdefinition eingearbeitet werden, statt als neuer historischer Codeblock angehaengt zu werden.
