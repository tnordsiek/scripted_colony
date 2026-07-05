# Technical Guidelines – Roboter-Logikspiel MVP

## 1. Ziel

Dieses Dokument beschreibt technische Leitplanken für die erste spielbare MVP-Version des Roboter-Logikspiels.

Das MVP soll beweisen, dass der Kern funktioniert:

> Ein Startroboter wird nicht direkt gesteuert, sondern über Programm-Templates und einen priorisierten Stack automatisiert. Er erkundet eine 10x10-Sektorkarte, findet Iron Ore, baut Iron Ore ab, errichtet einen Solarkollektor und eine Roboterfabrik und produziert den ersten zusätzlichen Roboter.

Dieses Dokument beschreibt nicht das vollständige spätere Spiel. Es ist bewusst auf den ersten Prototyp beschränkt.

## 2. Empfohlener Techstack

Für den MVP wird ein browserbasiertes TypeScript-Projekt empfohlen.

### Basis

- Sprache: TypeScript
- Build-Tool: Vite
- UI: React
- Rendering Karte: HTML Canvas 2D
- Styling: CSS Modules oder einfache CSS-Dateien
- Tests: Vitest
- Package Manager: npm oder pnpm

### Begründung

Dieser Stack ist für Codex/Claude Code gut geeignet, weil er:

- schnell aufsetzbar ist
- ohne Backend auskommt
- gute Testbarkeit für Simulationslogik bietet
- einfache UI-Komponenten für Seitenleiste, Programmstack und Log ermöglicht
- Canvas-Rendering für die MVP-Sektorkarte ausreichend performant und übersichtlich hält

### Nicht im MVP verwenden

Für den MVP nicht nötig:

- Backend
- Datenbank
- Multiplayer
- komplexe Game Engine
- ECS-Framework
- Asset Pipeline
- WebGL
- Phaser/Pixi als Pflichtabhängigkeit
- Savegame-System

Eine spätere Migration auf eine 2D-Engine bleibt möglich. Für den MVP ist eine einfache Canvas-Darstellung ausreichend.

## 3. Zentrale Architekturregel

Simulation, Rendering und UI müssen getrennt bleiben.

```text
Simulation State
→ reine TypeScript-Logik
→ deterministisch testbar
→ keine React- oder Canvas-Abhängigkeit

UI / React
→ zeigt State an
→ sendet Spieleraktionen an Simulation
→ enthält keine Spielregeln

Canvas Renderer
→ zeichnet Karte aus State
→ enthält keine Simulationsentscheidungen
```

## 4. Vorgeschlagene Projektstruktur

```text
src/
  main.tsx
  App.tsx

  sim/
    constants.ts
    types.ts
    createInitialGame.ts
    tick.ts

    map/
      generateMap.ts
      visibility.ts
      selectors.ts

    robot/
      robotActions.ts
      robotState.ts

    programs/
      templates.ts
      evaluateProgramStack.ts
      programTypes.ts

    buildings/
      buildingRules.ts

    production/
      productionRules.ts

    log/
      eventLog.ts

  ui/
    layout/
      GameLayout.tsx
      BottomBar.tsx
      RightPanel.tsx

    map/
      MapCanvas.tsx

    panels/
      RobotPanel.tsx
      BuildingPanel.tsx
      FieldPanel.tsx
      ProgramStackPanel.tsx
      DiagnosticsPanel.tsx

    controls/
      TimeControls.tsx
      ZoomControls.tsx

  tests/
    mapGeneration.test.ts
    visibility.test.ts
    tick.test.ts
    programStack.test.ts
    mvpFlow.test.ts
```

## 5. MVP-Konstanten zentral halten

Alle Balancingwerte müssen zentral in `src/sim/constants.ts` liegen.

Beispiel:

```ts
export const MVP_CONFIG = {
  mapWidth: 10,
  mapHeight: 10,
  ironOreFields: 20,
  ironOrePerField: 20,

  startRobotBatteryMax: 100,
  startRobotInitialBattery: 50,
  startRobotCargoMax: 10,
  startRobotSightRange: 2,

  movementBatteryCost: 1,
  movementTicks: 1,

  miningBatteryCost: 1,
  miningTicks: 10,
  miningYield: 1,

  buildingBatteryCost: 1,
  buildingTicks: 10,

  productionTicks: 10,

  solarCollectorIronCost: 5,
  solarCollectorPower: 100,
  solarCollectorSightRange: 2,
  solarCollectorChargeRate: 10,

  robotFactoryIronCost: 5,
  robotFactoryPowerDemand: 40,
  robotFactorySightRange: 2,

  passiveChargeRate: 1,
  stasisThreshold: 1,
  stasisChargeTarget: 50,
} as const;
```

Keine Spielwerte direkt in React-Komponenten oder Rendering-Code verstecken.

## 6. Datenmodell

### GameState

Der gesamte Spielzustand soll in einem serialisierbaren Objekt liegen.

```ts
type GameState = {
  tick: number;
  isPaused: boolean;
  speed: 1 | 2 | 4;
  map: GameMap;
  robots: Robot[];
  buildings: Building[];
  selected: Selection | null;
  eventLog: GameEvent[];
  mvpGoalReached: boolean;
  score: ScoreState;
};
```

### Field

```ts
type Field = {
  x: number;
  y: number;
  terrain: TerrainType;
  resource: ResourceDeposit | null;
  buildingId: string | null;
  visibility: "unknown" | "fog" | "visible";
};
```

### ResourceDeposit

```ts
type ResourceDeposit = {
  type: ResourceType;
  amount: number;
  extractionMethod: ExtractionMethod;
};
```

### Robot

```ts
type Robot = {
  id: string;
  name: string;
  model: "start" | "standard";
  movementType: MovementType;
  x: number;
  y: number;
  battery: number;
  batteryMax: number;
  cargo: {
    ironOre: number;
    max: number;
  };
  sightRange: number;
  status: "active" | "stasis" | "inactive";
  activeTask: RobotTask | null;
  programStack: Program[];
};
```

### Building

```ts
type Building = {
  id: string;
  type: "solarCollector" | "robotFactory";
  x: number;
  y: number;
  status: "active" | "inactive" | "producing";
  sightRange: number;
};
```

## 7. Tick-System

Ein Tick entspricht 1 Spielsekunde.

MVP-Dauern:

- Bewegung um 1 Feld: 1 Tick
- Abbauaktion: 10 Ticks
- Bauaktion: 10 Ticks
- Produktionsaktion: 10 Ticks

Die Simulation soll über eine zentrale Funktion laufen:

```ts
function advanceGameByOneTick(state: GameState): GameState
```

Diese Funktion darf keine UI-Effekte auslösen. Sie gibt nur einen neuen State zurück.

Für Geschwindigkeit 2x oder 4x ruft die UI diese Funktion entsprechend mehrfach pro realem Intervall auf.

## 8. Task-Modell

Längere Aktionen sollen als `activeTask` am Roboter gespeichert werden.

Beispiel:

```ts
type RobotTask =
  | { type: "move"; targetX: number; targetY: number; remainingTicks: number }
  | { type: "mineIronOre"; x: number; y: number; remainingTicks: number }
  | { type: "build"; buildingType: "solarCollector" | "robotFactory"; x: number; y: number; remainingTicks: number }
  | { type: "charge"; targetBattery: number }
  | { type: "produceRobot"; factoryId: string; remainingTicks: number };
```

Regel:

- Wenn ein Roboter `activeTask` hat, wird zuerst diese Task weitergeführt.
- Wenn keine Task aktiv ist, wird der Programmstack neu evaluiert.
- Nach Abschluss einer Task wird ein Event ins Log geschrieben und der Stack kann im nächsten Tick neu bewertet werden.

## 9. Programmstack

Programme sind Datenobjekte. Die UI bearbeitet diese Datenobjekte, die Simulation wertet sie aus.

```ts
type Program = {
  id: string;
  title: string;
  type:
    | "secureEnergy"
    | "explore"
    | "mineIronOre"
    | "buildSolarCollector"
    | "buildRobotFactory"
    | "produceRobot"
    | "stasisCharge";
  enabled: boolean;
  params: Record<string, number | string | boolean>;
  locked?: boolean;
};
```

Stack-Regel:

- Programme werden von oben nach unten geprüft.
- Deaktivierte Programme werden übersprungen.
- Das erste ausführbare Programm startet eine Task oder führt eine Sofortaktion aus.
- Blockierte/übersprungene Programme sollen Diagnoseinformationen liefern.

## 10. Templates

Die MVP-Templates werden in `src/sim/programs/templates.ts` definiert.

Pflicht-Templates:

1. Energie sichern
2. Erkunden
3. Iron Ore abbauen
4. Solarkollektor bauen
5. Roboterfabrik bauen
6. Roboter produzieren
7. Stasis-Laden

Stasis-Laden ist nicht löschbar, nicht deaktivierbar und immer vorhanden.

## 11. Karte und Sicht

### Karte

- 10 x 10 Felder
- 20 Felder mit Iron Ore
- Iron Ore tritt als Cluster auf
- Clustergröße: 3 bis 8 Felder
- Startposition zufällig auf freiem Feld
- Startfeld darf kein Iron Ore enthalten

### Sichtzustände

Jedes Feld hat einen Sichtzustand:

- `unknown`: noch nie gesehen
- `fog`: bekannt, aber aktuell nicht sichtbar
- `visible`: aktuell sichtbar

### Sichtregeln

- Startroboter-Sichtweite: 2 Felder
- Sichtbereich als quadratischer Radius
- Sichtweite 2 entspricht einem 5x5-Bereich
- Kartenränder schneiden Sichtbereiche ab
- Gebäude haben im MVP Sichtweite 2
- Gebäudesicht hebt Nebel des Krieges im Wirkbereich auf

## 12. Ressourcen und Gebäude

### Iron Ore

- Ein Iron-Ore-Feld enthält 20 Einheiten
- Eine Abbauaktion erzeugt 1 Iron Ore
- Eine Abbauaktion kostet 1 % Batterie
- Eine Abbauaktion dauert 10 Ticks
- Startroboter trägt maximal 10 Iron Ore

### Solarkollektor

- Kosten: 5 Iron Ore
- Platzbedarf: 1 Feld
- Leistung: 100 Energie
- Beschleunigt Laden im Wirkbereich auf 10 % pro Sekunde
- Muss orthogonal neben Roboterfabrik stehen, damit diese versorgt wird

Der Solarkollektor ist kein Energiespeicher. Er stellt Leistung bereit.

### Roboterfabrik

- Kosten: 5 Iron Ore
- Platzbedarf: 1 Feld
- Leistungsbedarf: 40 Energie
- Muss orthogonal neben Solarkollektor stehen
- Nimmt während aktiver Produktion dauerhaft 40 Energie ab
- Produktion im MVP: 1 Standardroboter
- Produktionsdauer: 10 Ticks

## Terrain-System und Bewegungsarten

Für den MVP wird nur Plains aktiv genutzt. Das Datenmodell soll aber bereits Terrain-Typen und Bewegungsarten unterstützen, damit spätere Hindernisse, Flussfelder und fliegende Einheiten ohne grundlegendes Refactoring ergänzt werden können.

### Terrain-Typen

```ts
type TerrainType =
  | "plains"
  | "rubble"
  | "lavaRiver"
  | "mercuryRiver";
```

### Bewegungsarten

```ts
type MovementType = "ground" | "flying";
```

Der Startroboter ist im MVP:

```ts
movementType: "ground"
```

### Field-Modell

Ein Feld soll einen Terrain-Typ besitzen:

```ts
type Field = {
  x: number;
  y: number;
  terrain: TerrainType;
  resource: ResourceDeposit | null;
  buildingId: string | null;
  visibility: "unknown" | "fog" | "visible";
};
```

### Passierbarkeit

```ts
function canEnterTerrain(
  terrain: TerrainType,
  movementType: MovementType
): boolean {
  if (terrain === "plains") return true;

  if (terrain === "rubble") {
    return movementType === "flying";
  }

  if (terrain === "lavaRiver" || terrain === "mercuryRiver") {
    return movementType === "flying";
  }

  return false;
}
```

### Bebaubarkeit

```ts
function canBuildOnTerrain(terrain: TerrainType): boolean {
  return terrain === "plains";
}
```

### Terrain-Schaden

Gefährliche Flussfelder sind:

- `lavaRiver`
- `mercuryRiver`

Spätere Schadensregel:

```ts
environmentalHazardDamagePerTick: 1
```

Regeln:

- Bodeneinheiten können Lava-/Quecksilberfelder nicht betreten.
- Bodeneinheiten auf orthogonal benachbarten Feldern erhalten -1 HP pro Tick.
- Fliegende Einheiten können Lava-/Quecksilberfelder betreten oder überqueren.
- Fliegende Einheiten erhalten auf Lava-/Quecksilberfeldern -1 HP pro Tick.
- Fliegende Einheiten erhalten auf orthogonal benachbarten Feldern ebenfalls -1 HP pro Tick.
- Gebäude erhalten in der ersten Terrain-Schadensversion keinen automatischen Flussschaden.

### Nachbarschaft

Für Terrain-Schaden zählt nur orthogonale Nachbarschaft:

- oben
- unten
- links
- rechts

Diagonalen zählen nicht.

### MVP-Umfang

Im MVP umzusetzen:

- `TerrainType` im Datenmodell
- jedes Feld startet als `plains`
- `MovementType` im Robotermodell
- Startroboter ist `ground`
- `canEnterTerrain` und `canBuildOnTerrain` als reine Hilfsfunktionen
- Tests für Plains-Passierbarkeit und Plains-Bebaubarkeit

Im MVP noch nicht aktiv umzusetzen:

- Karten-Generierung mit Geröll, Lava oder Quecksilber
- fliegende Einheiten
- aktiver Umweltschaden
- Terrain-Schadens-Tick
- Terrain-spezifische Assets außer `plain.png`

## Hitpoints, Schaden und Reparatur

Alle Einheiten und Gebäude erhalten ein HP-Modell. Für den MVP wird das System im Datenmodell und in der UI vorbereitet, aktive Schadensquellen bleiben außerhalb des MVP.

### Standardwerte

```ts
defaultMaxHp: 100
defaultStartHp: 100
```

### Datenmodell

```ts
type Hitpoints = {
  current: number;
  max: number;
};
```

Roboter und Gebäude erhalten jeweils:

```ts
hp: Hitpoints;
```

MVP-Initialwerte:

```ts
hp: {
  current: 100,
  max: 100,
}
```

### Spätere Schadensquellen

Das Datenmodell soll spätere Schadensquellen unterstützen:

- Kampfschaden
- negative Umweltfelder
- Damage over Time
- spätere Ereignisse wie Sandsturm, Strahlung oder Säure

Für den MVP müssen diese Schadensquellen nicht aktiv implementiert werden.

### Zerstörungsregel

Spätere Regel:

```ts
if (entity.hp.current <= 0) {
  entity.status = "destroyed";
}
```

Für den MVP ist es ausreichend, den Status vorzubereiten oder HP anzuzeigen. Es müssen keine aktiven Schadensquellen eingebaut werden.

### Reparatur

Reparaturfähige Einheiten können HP bis zum Maximum auffüllen.

Konzeptionell reparaturfähig:

- Startroboter
- spätere Reparaturdrohnen
- spätere Wartungsroboter

MVP-Regel:

- Startroboter kann als `canRepair: true` markiert werden.
- Es muss noch kein Reparaturprogramm umgesetzt werden.
- Reparatur darf HP nie über `max` erhöhen.

### UI

Die rechte Seitenleiste zeigt bei Robotern und Gebäuden:

```text
HP: 100 / 100
```

### Tests

Pflichttests für das vorbereitete HP-System:

- Startroboter startet mit 100/100 HP.
- neu produzierte Roboter starten mit 100/100 HP.
- Solarkollektor startet mit 100/100 HP.
- Roboterfabrik startet mit 100/100 HP.
- HP können nicht über `max` steigen, falls eine Reparatur-Hilfsfunktion implementiert wird.

## Gebaeudestufen und spaetere Gebaeudetypen

Das technische Modell soll spaetere Gebaeudestufen unterstuetzen. Fuer den MVP sind nur Solar Collector und Roboterfabrik aktiv, weitere Gebaeudetypen bleiben konzeptionell vorbereitet.

### Building Tier

```ts
type BuildingTier = 1 | 2 | 3;
```

### BuildingType

Langfristige Gebaeudetypen:

```ts
type BuildingType =
  | "solarCollector"
  | "robotFactory"
  | "aiResearchCenter"
  | "communicationTower"
  | "gridEnergyLine"
  | "advancedRobotFactory"
  | "droneFactory"
  | "gasExtractor"
  | "steelworks";
```

MVP-aktive Gebaeudetypen:

```ts
type MvpBuildingType =
  | "solarCollector"
  | "robotFactory";
```

### Level-1-Gebaeude

```ts
const LEVEL_1_BUILDINGS = [
  "solarCollector",
  "robotFactory",
  "aiResearchCenter",
] as const;
```

Level 1:

- `solarCollector`: Basis-Energieversorgung
- `robotFactory`: erste Roboterproduktion
- `aiResearchCenter`: erste Forschung / Forschungskapazitaet, nicht MVP-aktiv

### Level-2-Gebaeude

```ts
const LEVEL_2_BUILDINGS = [
  "communicationTower",
  "gridEnergyLine",
  "advancedRobotFactory",
  "droneFactory",
  "gasExtractor",
  "steelworks",
] as const;
```

Level 2:

- `communicationTower`: erweitert Kommunikationsgrid und Handlungsradius normaler Roboter
- `gridEnergyLine`: erweitert Energieversorgung ueber direkte Nachbarschaft hinaus
- `advancedRobotFactory`: fortgeschrittene Produktion
- `droneFactory`: Produktion flugfaehiger Einheiten
- `gasExtractor`: foerdert Gas aus Gasvorkommen
- `steelworks`: verarbeitet Iron Ore und Energie zu Steel Plates

### Verarbeitete Ressource: Steel Plates

`steelPlates` wird als spaetere verarbeitete Ressource vorgesehen.

```ts
type ResourceType =
  | "ironOre"
  | "gas"
  | "silicon"
  | "steelPlates";
```

Steel Plates sind kein natuerliches Vorkommen, sondern werden produziert.

Beispielrezept:

```ts
type ProductionRecipe = {
  id: string;
  inputs: ResourceCost;
  energyCost?: number;
  durationTicks: number;
  outputs: ResourceInventory;
};

const steelPlateRecipe: ProductionRecipe = {
  id: "steelPlatesFromIronOre",
  inputs: {
    ironOre: 2,
  },
  energyCost: 10,
  durationTicks: 10,
  outputs: {
    steelPlates: 1,
  },
};
```

### Forschung als Freischaltung

Level-2-Gebaeude werden durch Forschung freigeschaltet.

Beispiele:

```text
Kommunikationsinfrastruktur I
-> communicationTower
```

```text
Energienetz I
-> gridEnergyLine
```

```text
Industrielle Fertigung I
-> advancedRobotFactory
```

```text
Flugmechanik I
-> droneFactory
```

```text
Gasextraktion
-> gasExtractor
```

```text
Metallverarbeitung I
-> steelworks
```

### MVP-Regel

Im MVP implementieren:

- `BuildingTier` optional vorbereiten
- Gebaeudetypen weiterhin nur aktiv fuer `solarCollector` und `robotFactory`
- keine Level-2-Gebaeude erzeugen
- keine Steel-Plates-Produktion aktivieren

Nicht im MVP implementieren:

- KI-Forschungszentrum als baubares Gebaeude
- Sendeturm
- Grid Energy Line
- Verbesserte Roboterfabrik
- Drohnenfabrik
- Gasfoerderanlage
- Stahlwerk
- Steel Plates als aktive Ressource
- Produktionsrezepte
- Gebaeudefreischaltung durch Forschung

## Technisches GUI-Programmiermodell v21

### Block-Typen

```ts
type ProgramBlockKind =
  | "condition"
  | "action"
  | "operator"
  | "sensor"
  | "value"
  | "programControl"
  | "group";
```

```ts
type ProgramBlockColorRole =
  | "conditionYellow"
  | "actionRed"
  | "operatorBlue"
  | "sensorGreen"
  | "valueNeutral"
  | "programControlPurple"
  | "groupDark";
```

```ts
type ProgramBlock = {
  id: string;
  kind: ProgramBlockKind;
  label: string;
  colorRole: ProgramBlockColorRole;
  children?: ProgramBlock[];
  value?: unknown;
  validation?: BlockValidationRule;
};
```

### Programmstruktur

```ts
type VisualProgram = {
  id: string;
  name: string;
  enabled: boolean;
  rows: ProgramRow[];
  executionLimit?: ProgramExecutionLimit;
  executionState?: ProgramExecutionState;
};
```

```ts
type ProgramRow = {
  id: string;
  condition: ConditionExpression;
  action: ActionExpression;
};
```

Ein Programm kann beliebig viele `ProgramRow` besitzen.

### Auswertung von Programmzeilen

```ts
type ProgramRowEvaluationResult =
  | { status: "conditionFalse" }
  | { status: "actionExecutable"; action: ActionExpression }
  | { status: "actionNotExecutable"; reason: string };
```

Regeln:

1. Zeilen werden von oben nach unten geprüft.
2. Wenn `conditionFalse`, nächste Zeile prüfen.
3. Wenn `actionExecutable`, Aktion starten.
4. Wenn `actionNotExecutable`, nächstes Programm im Stack prüfen.
5. Wenn keine Zeile zutrifft, nächstes Programm im Stack prüfen.

### Conditions

```ts
type ConditionExpression =
  | SensorComparisonCondition
  | LogicalConditionGroup
  | PresenceCondition;

type SensorComparisonCondition = {
  type: "sensorComparison";
  sensor: SensorDefinition;
  operator: ComparisonOperator;
  value: ConditionValue;
};

type LogicalConditionGroup = {
  type: "logicalGroup";
  operator: "AND" | "OR";
  children: ConditionExpression[];
};

type PresenceCondition = {
  type: "presence";
  sensor: SensorDefinition;
  operator: "exists" | "notExists";
};
```

### Sensoren

```ts
type SensorValueType =
  | "percentage"
  | "number"
  | "boolean"
  | "presence"
  | "resourceType"
  | "buildingType"
  | "communicationStatus";

type SensorDefinition = {
  id: string;
  label: string;
  valueType: SensorValueType;
  allowedOperators: OperatorId[];
  valueRange?: {
    min: number;
    max: number;
    unit?: "%" | "hp" | "units";
  };
};
```

Beispiele:

```ts
const batterySensor: SensorDefinition = {
  id: "sensor.batteryPercent",
  label: "Batteriestand",
  valueType: "percentage",
  allowedOperators: ["lt", "lte", "gt", "gte", "eq", "neq"],
  valueRange: { min: 0, max: 100, unit: "%" },
};
```

```ts
const visibleIronOreSensor: SensorDefinition = {
  id: "sensor.visibleIronOre",
  label: "sichtbares Iron Ore",
  valueType: "presence",
  allowedOperators: ["exists", "notExists"],
};
```

### Operatoren

```ts
type OperatorId =
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "eq"
  | "neq"
  | "exists"
  | "notExists"
  | "is"
  | "isNot"
  | "and"
  | "or"
  | "not";
```

Die UI darf nur Operatoren anbieten, die im Sensor als `allowedOperators` hinterlegt sind.

### Wertevalidierung

```ts
type BlockValidationRule = {
  valueType: SensorValueType;
  min?: number;
  max?: number;
  allowedValues?: string[];
  required?: boolean;
};
```

```ts
type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };
```

Regeln:

- Prozentwerte müssen z. B. 0 bis 100 sein.
- Batteriestand darf nicht 101 % sein.
- Ressourcentypen müssen gültig/freigeschaltet sein.
- Gebäudetypen müssen gültig/freigeschaltet sein.
- Operator muss zum Sensor passen.

### Aktionen

```ts
type ActionExpression = {
  id: string;
  actionType: ActionType;
  params: Record<string, unknown>;
};
```

```ts
type ActionType =
  | "charge"
  | "moveTo"
  | "explore"
  | "mineIronOre"
  | "buildBuilding"
  | "produceRobot"
  | "attack"
  | "wait"
  | "stackReset";
```

### Programmsteuerung

```ts
type ProgramControlAction =
  | { type: "stackReset" }
  | { type: "endProgram" }
  | { type: "checkNextProgram" }
  | { type: "wait"; ticks: number };
```

`stackReset` beendet die aktuelle Programmausführung und startet die Stack-Prüfung wieder oben.

### Programmübersicht

```ts
type ProgramStackUiState = {
  selectedProgramId?: string;
  draggedProgramId?: string;
  editingProgramId?: string;
};
```

MVP-Funktionen:

- Programme im Stack anzeigen.
- Drag-and-drop-Umsortierung oder einfache Hoch-/Runter-Fallback-Buttons.
- Aktivieren/Deaktivieren per Button.
- deaktivierte Programme mit Skip-Icon markieren.
- aktives Programm hervorheben.
- blockierte Programme mit Diagnosegrund anzeigen.
- Templates hinzufügen.
- Templates editieren.
- Programmnamen bearbeiten.

### Bausteinbibliothek

```ts
type BlockLibrarySection =
  | "sensors"
  | "operators"
  | "values"
  | "conditions"
  | "actions"
  | "programControl"
  | "templates";
```

```ts
type BlockLibraryItem = {
  id: string;
  section: BlockLibrarySection;
  block: ProgramBlock;
  requiredResearchId?: string;
};
```

MVP-Regel:

- Template-Editing muss verfügbar sein.
- Vollständiger freier Block-Editor kann in einfacher Form vorbereitet werden.
- Die Programmübersicht ist Pflicht.

## Technisches Kommunikationsgrid v20

### communicationMode

```ts
type CommunicationMode =
  | "gridRequired"
  | "autonomous"
  | "scoutLocked";
```

Bedeutung:

- `gridRequired`: Einheit darf nur innerhalb des Kommunikationsgrids arbeiten und bewegen.
- `autonomous`: Einheit darf außerhalb des Grids weiterarbeiten.
- `scoutLocked`: Einheit darf außerhalb des Grids weiterarbeiten, aber ihr Stack ist gelocked.

Robot-Erweiterung:

```ts
type Robot = {
  communicationMode: CommunicationMode;
  communicationStatus: CommunicationStatus;
};
```

```ts
type CommunicationStatus =
  | "connected"
  | "disconnected"
  | "offline"
  | "stasis"
  | "locked";
```

### Kommunikationsquellen

```ts
type CommunicationSourceType =
  | "building"
  | "communicationTower";

type CommunicationSource = {
  id: string;
  x: number;
  y: number;
  range: number;
  sourceType: CommunicationSourceType;
  isActive: boolean;
};
```

Reichweiten:

```ts
const DEFAULT_BUILDING_COMMUNICATION_RANGE = 3;
const COMMUNICATION_TOWER_RANGE = 5;
```

### Reichweitenberechnung

Kommunikationsreichweite wird per Manhattan-Distanz berechnet.

```ts
function isInCommunicationRange(
  source: { x: number; y: number; range: number },
  field: { x: number; y: number }
): boolean {
  return Math.abs(source.x - field.x) + Math.abs(source.y - field.y) <= source.range;
}
```

Diagonale Ausbreitung zählt nicht.

### Grid-Berechnung

```ts
type CommunicationGrid = {
  connectedFieldKeys: Set<string>;
};
```

Alle aktiven Kommunikationsquellen tragen Felder in das Grid ein.

Nur aktive Gebäude/Sendetürme zählen. Deaktivierte oder zerstörte Quellen tragen nichts bei.

### Bewegung gridpflichtiger Einheiten

Für `gridRequired`-Einheiten gilt:

```text
path field must be inside communication grid
target field must be inside communication grid
```

Wenn kein Pfad innerhalb des Grids möglich ist:

```text
Programm nicht ausführbar
Diagnose: Ziel außerhalb Kommunikationsgrid oder kein Grid-Pfad
```

### Einheit außerhalb des Grids

Wenn eine `gridRequired`-Einheit außerhalb des Grids steht:

```text
communicationStatus = disconnected
status = stasis oder offline
normale Programme werden nicht ausgeführt
Gruppenänderungen werden nicht übernommen
```

Diese Situation soll normalerweise nur entstehen, wenn das Grid schrumpft, z. B. durch:

- Gebäude deaktiviert
- Gebäude zerstört
- Energieausfall
- Sendeturm deaktiviert

### Gruppen

```ts
type RobotGroup = {
  id: string;
  name: string;
  robotIds: string[];
  programStack: Program[];
};
```

Regeln:

- Gruppenstack-Änderungen gelten für verbundene/online Einheiten.
- Disconnected/offline/stasis Einheiten reagieren nicht auf Gruppenänderungen.
- Beim Wiederverbinden kann Synchronisation später implementiert werden.
- MVP benötigt nur Statusanzeige und klare Nicht-Reaktion.

UI:

```text
connected icon
disconnected icon
locked icon
stasis icon
```

## Technisches Forschungsmodell v20

Forschung ist nicht Teil des initialen MVP, wird aber als Datenmodell vorbereitet.

```ts
type ResearchBranch =
  | "infrastructure"
  | "energy"
  | "industry"
  | "resourceExtraction"
  | "units"
  | "communication"
  | "programDesign"
  | "combat";

type ResearchStatus =
  | "locked"
  | "available"
  | "inProgress"
  | "completed";

type ResearchUnlock =
  | { type: "building"; buildingType: BuildingType }
  | { type: "unit"; robotType: RobotType }
  | { type: "resource"; resourceType: ResourceType }
  | { type: "programFeature"; featureId: ProgramFeatureId }
  | { type: "system"; systemId: string };

type ResearchProject = {
  id: string;
  name: string;
  branch: ResearchBranch;
  prerequisites: string[];
  cost: ResourceCost;
  durationTicks: number;
  requiredResearchCapacity: number;
  status: ResearchStatus;
  unlocks: ResearchUnlock[];
};
```

Beispiel:

```ts
const metallurgy1: ResearchProject = {
  id: "research.metallurgy1",
  name: "Metallverarbeitung I",
  branch: "industry",
  prerequisites: ["building.aiResearchCenter"],
  cost: { ironOre: 20 },
  durationTicks: 300,
  requiredResearchCapacity: 100,
  status: "locked",
  unlocks: [
    { type: "building", buildingType: "steelworks" },
    { type: "resource", resourceType: "steelPlates" },
  ],
};
```

Programm-Gestaltungsoptionen:

```ts
type ProgramFeatureId =
  | "executionLimits"
  | "buildSchemas"
  | "buildingLists"
  | "placementScoring"
  | "fieldReservations";
```

MVP-Regel:

- Forschung nicht aktiv implementieren.
- Typen dürfen vorbereitet werden.
- Keine Forschungs-UI im initialen MVP.

## Technische Map-Generierung, erster Miner und Logistik v19

### Map-Generator

```ts
type MapGenerationConfig = {
  width: number;
  height: number;
  seed: string;
  ironOreFieldCount: number;
  ironOrePerField: number;
  minNearestIronOreDistance: number;
  maxNearestIronOreDistance: number;
  maxGenerationAttempts: number;
};
```

MVP-Werte:

```ts
const MAP_GENERATION_CONFIG: MapGenerationConfig = {
  width: 10,
  height: 10,
  seed: gameState.randomSeed,
  ironOreFieldCount: 20,
  ironOrePerField: 20,
  minNearestIronOreDistance: 4,
  maxNearestIronOreDistance: 6,
  maxGenerationAttempts: 100,
};
```

### Initiale Sicht ohne Iron Ore

Der Startroboter darf an seiner Startposition kein Iron Ore sehen.

```ts
function isInInitialVision(
  start: { x: number; y: number },
  field: { x: number; y: number },
  sightRange: number
): boolean {
  return (
    Math.abs(start.x - field.x) <= sightRange &&
    Math.abs(start.y - field.y) <= sightRange
  );
}
```

Regel:

```ts
for each ironOreField:
  assert(!isInInitialVision(startPosition, ironOreField, startRobotSightRange))
```

### Fairness-Check

Mindestens ein Iron-Ore-Feld muss in 4–6 Bewegungsschritten erreichbar sein.

```ts
type MapValidationResult =
  | { valid: true }
  | { valid: false; reason: string };
```

Prüfungen:

- Startposition frei.
- Startposition nicht auf Ressource.
- Kein Iron Ore im initial sichtbaren Bereich.
- Mindestens ein Iron-Ore-Feld per Pfad in 4–6 Schritten erreichbar.
- Iron-Ore-Felder entsprechen Cluster-Regeln.
- Kartenrand ist Barriere.

Wenn ungültig:

```text
bis zu 100 neue Generierungsversuche
danach feste Fallback-Karte
```

### Erster produzierter Roboter

Der erste im MVP produzierte Roboter ist ein Iron Miner.

```ts
const firstProducedRobot: Partial<Robot> = {
  type: "ironMiner",
  tier: 1,
  movementType: "ground",
  chargingMode: "externalOnly",
  batteryMax: 100,
  battery: 50,
  hp: { current: 100, max: 100 },
  cargo: {
    used: {},
    capacity: 10,
  },
  sightRange: 2,
  status: "active",
  programStack: [],
};
```

Das MVP-Ziel wird bei Abschluss der Produktion erfüllt.

### Logistikmodell, später

Nicht im MVP aktiv, aber vorbereitete Typen:

```ts
type InventoryRole =
  | "input"
  | "output"
  | "storage";

type BuildingInventory = {
  input?: ResourceInventory;
  output?: ResourceInventory;
  storage?: ResourceInventory;
  capacity?: Partial<Record<ResourceType, number>>;
};

type MaterialRequestStatus =
  | "open"
  | "assigned"
  | "inProgress"
  | "fulfilled"
  | "cancelled";

type MaterialRequest = {
  id: string;
  fromBuildingId?: string;
  toBuildingId?: string;
  toConstructionSiteId?: string;
  resources: ResourceInventory;
  status: MaterialRequestStatus;
  assignedRobotId?: string;
};
```

Spätere Regeln:

- Produktionsgebäude können Input- und Output-Inventare haben.
- Lagerdepots können mehrere Ressourcen speichern.
- Baustellen können Materialanforderungen erzeugen.
- Transportroboter erfüllen `MaterialRequest`.
- Keine globalen Sofortressourcen für komplexe Produktionsketten.

## Technische Zielauswahl und Pfadfindung v18

### Manhattan-Distanz

Manhattan-Distanz misst Grid-Entfernung ohne diagonale Schritte.

```ts
function manhattanDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
```

Sie ist eine einfache Heuristik. Für tatsächliche Erreichbarkeit soll Pfadfindung genutzt werden.

### Zielauswahl

Zielauswahl nutzt Kandidatenlisten.

```ts
type TargetCandidate = {
  x: number;
  y: number;
  kind: "resource" | "buildSite" | "chargingField" | "unknownField" | "enemy";
  score?: number;
};
```

Wenn mehrere Kandidaten gleichwertig sind:

```text
Tie-break per seeded random
```

Der Seed kommt aus `GameState.randomSeed`, damit Tests reproduzierbar bleiben.

### Pfadfindung

Für den MVP reicht BFS über passierbare Felder.

```ts
type PathResult =
  | { reachable: true; path: Array<{ x: number; y: number }> }
  | { reachable: false; reason: string };
```

Blockiert sind:

- Gebäude
- Baustellenreservierungen
- nicht passierbares Terrain
- optional Roboterpositionen, wenn sie den Weg vollständig blockieren

### Miner-Programmablauf

Top-Programm:

```text
IF adjacent Iron Ore
AND cargo not full
AND battery >= miningCost
THEN mine
```

Wenn das Ressourcenziel erschöpft ist:

```text
end active task with targetInvalid/resourceDepleted
restart stack check from top
```

Zweites Programm:

```text
IF battery enough
THEN find visible Iron Ore
AND move to nearest reachable adjacent field
```

Wenn Zielnachbarfeld erreicht ist:

```text
movement task ends
restart stack check from top
```

Dann kann das Mining-Programm wieder ausführbar sein.

### Sicht und unbekannte Felder

```ts
type ExplorationPermission =
  | "knownOnly"
  | "canEnterFog"
  | "canEnterUnknown";
```

Normale Programme:

```text
knownOnly
```

Autonome Scouts oder freigeschaltete Spezialisten:

```text
canEnterFog oder canEnterUnknown
```

Regel:

```text
Ein Roboter mit Sichtweite deckt Felder vor dem Betreten auf.
```

Technisch bedeutet das:

1. Vor Bewegung wird Sichtbereich aus aktueller Position aktualisiert.
2. Kandidaten im neu sichtbaren Bereich können bewertet werden.
3. Bewegung in ein bisher unbekanntes Gebiet ist nur für erlaubte Robotertypen zulässig.

### Ladefelder

Ladefelder innerhalb des Kommunikationsbereichs um Gebäude gelten als bekannt.

```ts
type ChargingFieldKnowledge = {
  x: number;
  y: number;
  sourceBuildingId: string;
  isKnownViaCommunication: boolean;
};
```

Diese Ladefelder können direkt als Pfadziel genutzt werden, sofern ein Pfad existiert.

### Kein Pfad möglich

Wenn kein Pfad existiert:

```text
program not executable
```

oder bei laufendem Programm:

```text
active task ends with reason noPath
stack check restarts from top
```

Neue Diagnosegründe:

```text
Kein Pfad zum Ziel
Ziel durch Roboter blockiert
Ziel außerhalb erlaubter Kommunikationsreichweite
Kein bekanntes Ladefeld erreichbar
Kein erreichbares Iron-Ore-Feld im Sichtbereich
```

## Technische Programmstack- und Task-Regeln v17

### Stack-Auswertung

Programme werden deterministisch von oben nach unten geprüft.

```ts
type ProgramCheckResult =
  | { status: "executable"; program: Program }
  | { status: "skipped"; program: Program; reason: string }
  | { status: "blocked"; program: Program; reason: string };
```

Grundalgorithmus:

```ts
function selectNextExecutableProgram(programs: Program[], context: RobotContext): Program | null {
  for (const program of programs) {
    if (!program.enabled) continue;
    if (hasReachedExecutionLimit(program)) continue;

    const result = checkProgramConditions(program, context);
    if (result.executable) return program;
  }

  return null;
}
```

### Ausführungsphasen

```ts
type ProgramRunEndReason =
  | "stopConditionMet"
  | "playerAborted"
  | "programDisabled"
  | "targetInvalid"
  | "robotDestroyed";
```

Ein Programm läuft, bis eine dieser Endbedingungen eintritt. Danach wird der Stack wieder von oben geprüft.

### Keine automatische Änderung am Programm

Erfolgreiche Ausführung oder Abbruch ändern nicht:

- Programmposition
- Programmparameter
- `enabled`
- Programmtitel
- Bedingungen

Nur Ausführungslimits und Diagnose-/Eventdaten dürfen aktualisiert werden.

### Deaktivierte Programme

Deaktivierte Programme werden bei der Top-down-Prüfung übersprungen.

```ts
if (!program.enabled) {
  continue;
}
```

Wenn ein laufendes Programm deaktiviert wird:

```text
activeTask endet
program.enabled = false
Stack-Prüfung startet erneut von oben
```

### Abbruch durch Spieler

Ein Abbruch beendet nur die aktuelle Ausführung.

```text
activeTask endet
program.enabled bleibt true
Stack-Prüfung startet erneut von oben
```

Wenn das Programm weiterhin ausführbar ist, kann es beim nächsten Check erneut ausgewählt werden.

### Ungültige Ziele

Ein laufender Task muss prüfen können, ob sein Ziel noch gültig ist.

```ts
type TargetValidationResult =
  | { valid: true }
  | { valid: false; reason: string };
```

Beispiele für ungültige Ziele:

- Gegner nicht mehr vorhanden
- Ressource erschöpft
- Baufeld blockiert
- Gebäude nicht mehr vorhanden
- Ziel nicht mehr erreichbar

Wenn Ziel ungültig:

```text
activeTask endet mit reason targetInvalid
Event/Diagnose wird geschrieben
Stack wird erneut von oben geprüft
```

### Bauprogramm-Abschluss

Ein Bauprogramm zählt erst dann als erfolgreiche Ausführung, wenn das Gebäude fertiggestellt wurde.

```ts
function isBuildProgramExecutionComplete(task: RobotTask, building: Building): boolean {
  return task.type === "build" && building.status === "active";
}
```

Nicht ausreichend:

- Reservierung des Baufelds
- Start der Baustelle
- Teilfortschritt
- Materiallieferung

Ausführungslimits werden erst beim Abschluss erhöht.

```ts
if (isBuildProgramExecutionComplete(task, building)) {
  incrementCompletedExecutions(program);
}
```

### Stop-Bedingungen

Stop-Bedingungen sind Teil der Programmlogik.

```ts
type StopCondition =
  | { type: "batteryAtLeast"; value: number }
  | { type: "cargoFull" }
  | { type: "resourceFound"; resourceType: ResourceType }
  | { type: "buildingCompleted"; buildingType: BuildingType }
  | { type: "robotProduced"; robotType: RobotType };
```

MVP darf Stop-Bedingungen zunächst implizit in den Template-Handlern abbilden. Sie sollen aber konzeptionell als eigene Regel erhalten bleiben.

### Diagnosegründe

```text
Programm deaktiviert
Ausführungslimit erreicht
Bedingung nicht erfüllt
Programmziel ungültig
Stop-Bedingung erfüllt
Spielerabbruch
```

## Kanonisches MVP-Datenmodell v16

Dieser Abschnitt ist die verbindliche technische Referenz. Ältere vereinfachte Snippets gelten als überholt, wenn sie diesem Abschnitt widersprechen.

### Ressourcen

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

`steelPlates` sind ein verarbeitetes Material und kein `ResourceDeposit` auf der Karte.

### Karte

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
  | "unknown"
  | "discovered"
  | "visible";

type ResourceDeposit = {
  type: NaturalResourceType;
  amount: number;
  extractionMethod: ExtractionMethod;
};

type ConstructionReservation = {
  buildingId: string;
  reservedByRobotIds: string[];
};

type Field = {
  x: number;
  y: number;
  terrainType: TerrainType;
  visibility: VisibilityState;
  resource?: ResourceDeposit;
  buildingId?: string;
  reservedForConstruction?: ConstructionReservation;
};
```

### Einheiten

```ts
type ChargingMode =
  | "selfCharging"
  | "externalOnly"
  | "hybrid";

type UnitTier = 0 | 1 | 2 | 3;

type RobotType =
  | "starterRobot"
  | "standardRobot"
  | "ironMiner"
  | "groundScout"
  | "meleeDrone"
  | "constructor"
  | "resourceMiner"
  | "transportRobot"
  | "rangedDrone";

type RobotStatus =
  | "active"
  | "stasis"
  | "inactive"
  | "destroyed";

type Hitpoints = {
  current: number;
  max: number;
};

type CargoState = {
  used: ResourceInventory;
  capacity: number;
};

type Robot = {
  id: string;
  name: string;
  type: RobotType;
  tier: UnitTier;
  movementType: MovementType;
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
  programStack: Program[];
};
```

MVP-Starter-Roboter:

```ts
type: "starterRobot";
tier: 0;
movementType: "ground";
chargingMode: "hybrid";
batteryMax: 100;
battery: 50;
hp: { current: 100, max: 100 };
cargo: { used: {}, capacity: 10 };
sightRange: 2;
```

Der erste produzierte Roboter ist im MVP ein `ironMiner` mit 100 HP, 50 % Batterie, leerem Cargo und leerem Programmstack. Das MVP-Ziel gilt bei Produktionsabschluss sofort als erfüllt.

### Gebäude

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
  | "steelworks";

type BuildingStatus =
  | "active"
  | "inactive"
  | "producing"
  | "disabled"
  | "destroyed";

type Building = {
  id: string;
  type: BuildingType;
  tier: BuildingTier;
  x: number;
  y: number;
  hp: Hitpoints;
  status: BuildingStatus;
  isEnabled: boolean;
  sightRange: number;
  powerProvided?: number;
  powerRequired?: number;
  powerConsumed?: number;
  inventory?: ResourceInventory;
  productionTask?: ProductionTask;
};
```

Gebäude können deaktiviert werden. Ein deaktiviertes Gebäude nimmt keine Netzleistung ab.

### Programme und Tasks

```ts
type ProgramType =
  | "charge"
  | "explore"
  | "mine"
  | "build"
  | "produce"
  | "stasisCharge";

type ProgramExecutionLimit =
  | { type: "unlimited" }
  | { type: "once" }
  | { type: "count"; maxExecutions: number };

type ProgramExecutionState = {
  completedExecutions: number;
};

type Program = {
  id: string;
  title: string;
  type: ProgramType;
  enabled: boolean;
  params: Record<string, number | string | boolean>;
  executionLimit?: ProgramExecutionLimit;
  executionState?: ProgramExecutionState;
  locked?: boolean;
};

type RobotTaskType =
  | "move"
  | "charge"
  | "mine"
  | "build"
  | "produce"
  | "wait"
  | "stasisCharge";

type RobotTask = {
  type: RobotTaskType;
  sourceProgramId: string;
  targetX?: number;
  targetY?: number;
  remainingTicks: number;
  totalTicks: number;
  batteryCostOnSuccess?: number;
  resourceDeltaOnSuccess?: ResourceInventory;
  buildingId?: string;
};
```

### Game State

```ts
type ScoreState = {
  minedIronOre: number;
  builtSolarCollectors: number;
  builtRobotFactories: number;
  producedRobots: number;
  goalBonusAwarded: boolean;
  total: number;
};

type GameEvent = {
  tick: number;
  type:
    | "programChanged"
    | "programBlocked"
    | "resourceDiscovered"
    | "cargoFull"
    | "buildingStarted"
    | "buildingCompleted"
    | "productionStarted"
    | "productionCompleted"
    | "stasisEntered"
    | "stasisExited"
    | "energyShortage";
  message: string;
  entityId?: string;
};

type GameState = {
  tick: number;
  randomSeed: string;
  isPaused: boolean;
  speed: 1 | 2 | 4;
  map: Field[][];
  robots: Robot[];
  buildings: Building[];
  selected:
    | { type: "robot"; id: string }
    | { type: "building"; id: string }
    | { type: "field"; x: number; y: number }
    | null;
  eventLog: GameEvent[];
  score: ScoreState;
  mvpGoalReached: boolean;
};
```

### Technische Regelvorschläge

```ts
function isOrthogonallyAdjacent(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

function hasActiveResource(field: Field): boolean {
  return Boolean(field.resource && field.resource.amount > 0);
}

function isMovementBlocked(field: Field): boolean {
  return Boolean(field.buildingId || field.reservedForConstruction);
}

function canPayBatteryCost(robot: Robot, cost: number): boolean {
  return robot.battery >= cost;
}
```

## Energiemanagement und Charging Modes

Das technische Modell soll zwischen selbstladefähigen und extern versorgten Robotern unterscheiden. Für den MVP ist nur der Starter Roboter aktiv selbstladefähig; das Modell wird für spätere Robotertypen vorbereitet.

### ChargingMode

```ts
type ChargingMode =
  | "selfCharging"
  | "externalOnly"
  | "hybrid";
```

Bedeutung:

- `selfCharging`: Roboter kann ohne externe Infrastruktur laden.
- `externalOnly`: Roboter kann nur an aktiven Lade-/Versorgungsfeldern laden.
- `hybrid`: Roboter kann langsam selbst laden und schneller am Energienetz laden.

Beispiele:

```ts
const starterRobotChargingMode: ChargingMode = "hybrid";
const groundScoutChargingMode: ChargingMode = "selfCharging";
const ironMinerChargingMode: ChargingMode = "externalOnly";
const transportRobotChargingMode: ChargingMode = "externalOnly";
```

### Robot-Erweiterung

```ts
type Robot = {
  id: string;
  type: RobotType;
  battery: number;
  batteryMax: number;
  chargingMode: ChargingMode;
};
```

Für den MVP:

```ts
starterRobot.chargingMode = "hybrid";
```

Der erste produzierte Standardroboter kann vorläufig ebenfalls einfach behandelt werden, bis spezialisierte Roboter aktiv sind.

### Energiezugang von Feldern

Später können Felder Energiezugang erhalten.

```ts
type EnergyAccess = "unpowered" | "powered";

type Field = {
  x: number;
  y: number;
  energyAccess?: EnergyAccess;
};
```

Für den MVP kann Energiezugang aus aktiven Solar Collectoren abgeleitet werden, ohne dauerhaft im Feld gespeichert zu werden.

### Ladequellen

Ladequellen sind aktive Energie-Infrastruktur.

```ts
type ChargingSourceType =
  | "solarCollector"
  | "gridEnergyLine";
```

Regel:

```text
Ein aktiver Solar Collector oder eine aktive Grid Energy Line lädt Roboter auf orthogonal angrenzenden Feldern automatisch.
```

Diagonale Nachbarschaft zählt nicht.

### Automatische Ladung

Automatische Ladung findet statt, wenn ein Roboter auf einem gültigen Ladefeld steht.

```ts
type ChargingContext = {
  isAdjacentToActiveChargingSource: boolean;
  hasFieldEnergyAccess: boolean;
};
```

MVP-Regel:

```text
Roboter orthogonal neben aktivem Solar Collector:
+10 % Batterie pro Tick/Sekunde
```

Starter-Roboter ohne externe Quelle:

```text
+1 % Batterie pro Tick/Sekunde
```

### Ladeprogramm vs. Ladevorgang

Technisch soll unterschieden werden:

- Das Ladeprogramm entscheidet, wann der Roboter eine Ladequelle aufsucht.
- Die automatische Ladefunktion erhöht die Batterie, wenn der Roboter an einer gültigen Ladeposition steht.

### Extern versorgte Roboter

Für spätere `externalOnly`-Roboter:

```text
IF Batterie < threshold
THEN suche nächstes erreichbares Ladefeld
AND bewege dich dorthin
AND lade bis target
```

Wenn kein Ladefeld erreichbar ist:

```text
blockedReason = "Keine externe Stromversorgung erreichbar"
```

### Netzleistung vs. Roboter-Batterie

Es gibt zwei Energieebenen:

- Roboter-Batterie: individueller Speicher.
- Netzleistung: Leistung von Gebäuden, z. B. Solar Collector mit 100 Leistung.

MVP:

- Solar Collector erzeugt 100 Leistung.
- Roboterfabrik verbraucht während Produktion 40 Leistung.
- Solar Collector lädt angrenzende Roboter mit +10 % pro Sekunde.
- Keine komplexe Netzleistungsverteilung.
- Keine begrenzte Ladeleistung pro Netz.

Später:

- Grid Energy Lines verteilen Leistung.
- Energiezugang kann über Leitungen berechnet werden.
- Ladeleistung kann durch freie Netzleistung begrenzt werden.
- Gebäude fernab von Solar Collectoren können über Grid Energy Lines versorgt werden.

### MVP-Regel

Im MVP implementieren:

- `ChargingMode` vorbereiten
- Starter Roboter als `hybrid` oder `selfCharging`
- automatische Ladung neben Solar Collector
- Ladeprogramm bewegt Roboter bei Bedarf zur Ladequelle oder lädt selbst
- Diagnosegrund für fehlende Ladequelle vorbereiten

Nicht im MVP implementieren:

- Grid Energy Lines
- externe-only Spezialroboter
- komplexe Energienetze
- begrenzte Ladeleistung pro Netz
- Stromleitungspfadfindung
- Energielogistik für ganze Flotten

## Einheitenstufen und spätere Einheitentypen

Das technische Modell soll spätere Einheitenstufen unterstützen. Für den MVP sind nur der Starter Roboter und ein einfacher zusätzlicher Standardroboter aktiv.

### Unit Tier

```ts
type UnitTier = 0 | 1 | 2 | 3;
```

### RobotType

Langfristige Einheitentypen:

```ts
type RobotType =
  | "starterRobot"
  | "standardRobot"
  | "ironMiner"
  | "groundScout"
  | "meleeDrone"
  | "constructor"
  | "resourceMiner"
  | "transportRobot"
  | "rangedDrone";
```

MVP-aktive Einheitentypen:

```ts
type MvpRobotType =
  | "starterRobot"
  | "standardRobot";
```

### Level-0-Einheit

```ts
const LEVEL_0_UNITS = [
  "starterRobot",
] as const;
```

Der Starter Roboter:

- startet die Partie
- kann Grundfunktionen ausführen
- kann Iron Ore abbauen
- kann Level-1-Basisgebäude bauen
- ist dauerhaft erreichbar
- verhindert frühe Sackgassen

### Level-1-Einheiten

```ts
const LEVEL_1_UNITS = [
  "ironMiner",
  "groundScout",
  "meleeDrone",
  "constructor",
] as const;
```

Level 1:

- `ironMiner`: spezialisierter Iron-Ore-Abbau
- `groundScout`: Bodenerkundung, höhere Sichtweite, ggf. Grid-Ausnahme
- `meleeDrone`: frühe Nahkampf-/Verteidigungseinheit
- `constructor`: fortgeschrittener Bauroboter, kann Gebäude über Level 1 bauen

### Level-2-Einheiten

```ts
const LEVEL_2_UNITS = [
  "resourceMiner",
  "transportRobot",
  "rangedDrone",
] as const;
```

Level 2:

- `resourceMiner`: Miner für neue Ressourcen wie Gas oder Silicium
- `transportRobot`: Materiallogistik zwischen Abbau, Lager, Fabriken und Baustellen
- `rangedDrone`: Fernkampf-/Verteidigungseinheit

### Robot-Modell

Roboter sollen perspektivisch Tier und Typ besitzen.

```ts
type Robot = {
  id: string;
  type: RobotType;
  tier: UnitTier;
  movementType: MovementType;
  hp: Hitpoints;
  canRepair?: boolean;
};
```

MVP:

- Starter Roboter: `type: "starterRobot"`, `tier: 0`
- erster zusätzlicher Roboter: `type: "standardRobot"`, vorläufige generische MVP-Einheit

### Freischaltungen

Spätere Freischaltungen:

```text
Roboterfabrik Level 1
→ ironMiner
→ groundScout
→ meleeDrone
→ constructor
```

```text
Verbesserte Roboterfabrik / Spezialforschung
→ resourceMiner
→ transportRobot
→ rangedDrone
```

```text
Drohnenfabrik
→ flugfähige Drohnenvarianten
```

### MVP-Regel

Im MVP implementieren:

- Starter Roboter als Level 0
- erster zusätzlicher Standardroboter als einfache MVP-Einheit
- Datenmodell optional mit `type` und `tier` vorbereiten

Nicht im MVP implementieren:

- Iron Miner
- Boden Scout
- Nahkampfdrohne
- Konstrukteur
- Miner für neue Ressourcen
- Transportroboter
- Fernkampfdrohne
- Einheitenfreischaltung durch Forschung
- spezialisierte Produktionsgebäude

## Ressourcenmodell und Rohstoffprogression

Für den MVP ist nur Iron Ore aktiv. Das Datenmodell soll aber generisch genug sein, um spätere Ressourcen wie Gas und Silicium ohne grundlegendes Refactoring zu unterstützen.

### Ressourcentypen

```ts
type ResourceType =
  | "ironOre"
  | "gas"
  | "silicon";
```

MVP-Regel:

```ts
activeResourceTypes: ["ironOre"]
```

Gas und Silicium werden nicht im initialen MVP generiert oder genutzt.

### Inventare

Inventare sollen nicht hart auf `ironOre` beschränkt werden.

```ts
type ResourceInventory = Partial<Record<ResourceType, number>>;
```

### Kosten

Gebäude, Einheiten und Forschung sollen generische Ressourcenkosten unterstützen.

```ts
type ResourceCost = Partial<Record<ResourceType, number>>;
```

Beispiele:

```ts
const robotFactoryCost: ResourceCost = {
  ironOre: 5,
};

const aiResearchCenterCost: ResourceCost = {
  ironOre: 20,
  silicon: 10,
};

const gasRefineryCost: ResourceCost = {
  ironOre: 15,
  silicon: 5,
};
```

### Vorkommen und Fördermethoden

Ressourcenvorkommen sollen einen Typ und eine Fördermethode besitzen.

```ts
type ExtractionMethod =
  | "directMining"
  | "refinery"
  | "specializedMining";

type ResourceDeposit = {
  type: ResourceType;
  amount: number;
  extractionMethod: ExtractionMethod;
};
```

MVP:

```ts
{
  type: "ironOre",
  amount: 20,
  extractionMethod: "directMining",
}
```

Später:

```ts
{
  type: "gas",
  amount: 100,
  extractionMethod: "refinery",
}
```

```ts
{
  type: "silicon",
  amount: 50,
  extractionMethod: "specializedMining",
}
```

### Fördergebäude

Spätere Gebäudetypen:

```ts
type BuildingType =
  | "solarCollector"
  | "robotFactory"
  | "aiResearchCenter"
  | "communicationTower"
  | "gridEnergyLine"
  | "advancedRobotFactory"
  | "droneFactory"
  | "gasExtractor"
  | "steelworks";
```

Für den MVP aktiv bleiben:

- `solarCollector`
- `robotFactory`

### Forschung und Ressourcen

Forschung kann später:

- neue Ressourcen sichtbar oder verwertbar machen
- neue Fördergebäude freischalten
- spezialisierte Einheiten für neue Ressourcen freischalten
- höhere Gebäude- und Einheitentiers ermöglichen

Beispiel:

```text
Forschung "Gasextraktion"
→ Gasraffinerie verfügbar
→ Gas kann gefördert werden
```

```text
Forschung "Mineralanalyse"
→ Siliciumförderung verfügbar
→ Silicium kann verarbeitet werden
```

### MVP-Regel

Im MVP implementieren:

- generisches Ressourcenmodell
- `ResourceType`
- `ResourceInventory`
- `ResourceCost`
- `ResourceDeposit.extractionMethod`
- aktive Nutzung nur von Iron Ore
- bestehende Kosten weiterhin als Iron-Ore-Kosten

Nicht im MVP implementieren:

- Gas
- Silicium
- Gasraffinerie
- Siliciumförderung
- Ressourcenfreischaltung durch Forschung
- mehrere aktive Ressourcenketten

## Bauprogramme, Ausführungslimits und Bau-Schemata

Bauprogramme sollen Ausführungslimits unterstützen. Spätere Versionen sollen außerdem Bau-Schemata und Gebäudelisten für komplexere Bauabsichten unterstützen.

### Ausführungslimits

Programme erhalten optionale Ausführungsdaten:

```ts
type ProgramExecutionLimit =
  | { type: "unlimited" }
  | { type: "once" }
  | { type: "count"; maxExecutions: number };

type ProgramExecutionState = {
  completedExecutions: number;
};
```

Erweiterung für `Program`:

```ts
type Program = {
  id: string;
  title: string;
  type: ProgramType;
  enabled: boolean;
  params: Record<string, number | string | boolean>;
  executionLimit?: ProgramExecutionLimit;
  executionState?: ProgramExecutionState;
  locked?: boolean;
};
```

Regel:

- `unlimited`: Programm darf beliebig oft laufen, solange Bedingungen erfüllt sind
- `once`: Programm ist nach einer erfolgreichen Ausführung abgeschlossen
- `count`: Programm ist nach `maxExecutions` erfolgreichen Ausführungen abgeschlossen

Eine Ausführung zählt erst dann als abgeschlossen, wenn der zugehörige Bauauftrag erfolgreich beendet wurde.

### Bau-Schemata

Später können Bauprogramme ein relatives Schema enthalten.

```ts
type BuildSchemaCell = {
  dx: number;
  dy: number;
  slotId: string;
  required?: boolean;
};

type BuildSchema = {
  id: string;
  title: string;
  cells: BuildSchemaCell[];
};
```

Beispiele:

- Linie
- L-Form
- 3x3-Block
- Ring
- freie Form

### Gebäudelisten für Schemata

Gebäude können später Schema-Slots zugewiesen werden.

```ts
type PlannedBuilding = {
  slotId: string;
  buildingType: BuildingType;
  optional?: boolean;
};

type BuildPlan = {
  schema: BuildSchema;
  buildings: PlannedBuilding[];
};
```

Ein Bauprogramm kann später einen `BuildPlan` enthalten:

```ts
type BuildProgramParams = {
  buildingType?: BuildingType;
  buildPlan?: BuildPlan;
};
```

### Forschungsfreischaltung

Bau-Schemata und Gebäudelisten gehören zum späteren Forschungszweig:

```text
Programm-Gestaltungsoptionen
```

Mögliche `programFeature`-Freischaltungen:

```ts
type ProgramFeatureId =
  | "executionLimits"
  | "buildSchemas"
  | "buildingLists"
  | "placementScoring"
  | "fieldReservations";
```

### MVP-Regel

Im MVP umsetzen:

- Ausführungslimits für Bauprogramme vorbereiten
- Solarkollektor- und Roboterfabrik-Bauprogramme können `once` oder `count: 1` nutzen
- erfolgreiche Ausführungen werden gezählt

Nicht im MVP umsetzen:

- Bau-Schema-Editor
- L-Formen
- 3x3-Blöcke
- Gebäudelisten für Schemata
- automatische Bauplanplatzierung
- Forschungszweig Programm-Gestaltungsoptionen

## Forschung und Technologie

Forschung ist ein späteres System und nicht Teil des initialen MVP. Die technische Dokumentation soll dennoch die grundlegenden Konzepte festhalten, damit das MVP nicht in eine Struktur gebaut wird, die Forschung später unnötig erschwert.

### Grundmodell

Forschung wird durch ein Gebäude freigeschaltet:

```ts
type BuildingType =
  | "solarCollector"
  | "robotFactory"
  | "aiResearchCenter";
```

`aiResearchCenter` ist nicht Teil des MVP, wird aber als späteres Gebäude vorgesehen.

### Forschungskapazität

Jedes KI-Forschungszentrum stellt Forschungskapazität bereit.

Vorläufiger Konzeptwert:

```ts
aiResearchCenterResearchCapacity: 100
```

### Forschungsprojekte

Spätere Datenstruktur:

```ts
type ResearchProject = {
  id: string;
  title: string;
  status: "locked" | "available" | "active" | "completed";
  cost: {
    ironOre?: number;
    energy?: number;
  };
  baseDurationTicks: number;
  assignedComputeCenterIds: string[];
  progressTicks: number;
  unlocks: ResearchUnlock[];
};
```

### Freischaltungen

```ts
type ResearchUnlock =
  | { type: "unitUpgrade"; upgradeId: string }
  | { type: "building"; buildingType: string }
  | { type: "unit"; robotType: string }
  | { type: "programFeature"; featureId: string };
```

### Zuweisungsregel

Jedes KI-Forschungszentrum kann genau einem aktiven Forschungsprojekt zugewiesen werden.

Regeln:

- ein Rechenzentrum kann nicht gleichzeitig an mehreren Projekten arbeiten
- mehrere Rechenzentren können demselben Projekt zugewiesen werden
- mehrere Rechenzentren an einem Projekt beschleunigen Forschung
- mehrere Projekte können parallel laufen, wenn ihnen jeweils mindestens ein Rechenzentrum zugewiesen ist

### Fortschrittsregel

Erste lineare Konzeptregel:

```ts
effectiveResearchSpeed = assignedComputeCenters.length;
```

Beispiel:

```text
Basisdauer 300 Ticks

1 Rechenzentrum → 300 Ticks
2 Rechenzentren → 150 Ticks
3 Rechenzentren → 100 Ticks
```

Diminishing Returns können später ergänzt werden, sind aber nicht Teil der ersten Konzeption.

### Mögliche Forschungswirkungen

Forschung kann später:

- maximale HP erhöhen
- Laderaum erhöhen
- Ressourcenabbau beschleunigen
- Batteriekapazität erhöhen
- Bewegung effizienter machen
- Kampfschaden erhöhen
- Reparaturfähigkeit freischalten
- neue Gebäude freischalten
- neue Einheiten freischalten
- neue Programm-/Diagnosefunktionen freischalten

### MVP-Regel

Nicht im MVP implementieren:

- `aiResearchCenter`
- Forschungsmenü
- Forschungsprojekte
- Forschungskapazität
- parallele Forschung
- Upgrades
- Forschungssieg

Coding-Agenten sollen Forschung nicht aktiv bauen, solange sie nicht ausdrücklich dazu aufgefordert werden.

## Siegbedingungen und MVP-Scoring

Langfristig soll das Spiel mehrere Siegbedingungen unterstützen:

- Kampfsieg gegen andere Fraktionen
- Forschungssieg durch Erreichen eines bestimmten Forschungsschritts
- Punktesieg nach Ablauf eines Zeitlimits

Für den MVP wird nur der Punktesieg umgesetzt.

### MVP-Zeitlimit

```ts
scoreLimitTicks: 600
```

Ein Tick entspricht einer Spielsekunde. Das MVP-Zeitlimit beträgt damit 10 Minuten.

### MVP-Punktewertung

```ts
scoring: {
  ironOreMined: 1,
  solarCollectorBuilt: 25,
  robotFactoryBuilt: 50,
  robotProduced: 100,
  mvpGoalBonus: 200,
}
```

Punkte für Ressourcen werden beim Abbau vergeben, nicht anhand des aktuellen Frachtspeicher- oder Lagerbestands. Ausgegebene Ressourcen bleiben also historisch im Score berücksichtigt.

### Score-Daten im State

Der GameState soll Score- und Statistikdaten enthalten:

```ts
type ScoreState = {
  totalScore: number;
  ironOreMined: number;
  solarCollectorsBuilt: number;
  robotFactoriesBuilt: number;
  robotsProduced: number;
  mvpGoalBonusAwarded: boolean;
  timeLimitReached: boolean;
};
```

Diese Werte werden durch Simulationsereignisse aktualisiert:

- Iron Ore erfolgreich abgebaut
- Solarkollektor gebaut
- Roboterfabrik gebaut
- Roboter produziert
- MVP-Zielbonus vergeben
- 600-Tick-Zeitlimit erreicht

### Ergebnisanzeige

Nach Tick 600 zeigt das Spiel eine Ergebnisübersicht mit:

- Score
- abgebautem Iron Ore
- gebauten Solarkollektoren
- gebauten Roboterfabriken
- produzierten Robotern
- MVP-Ziel erreicht: ja/nein

Die Simulation kann nach Ablauf des Zeitlimits pausieren oder weiterlaufen. Für den MVP wird empfohlen, bei Tick 600 automatisch zu pausieren und die Ergebnisübersicht anzuzeigen.

## PNG-Assets für den MVP

Für den MVP stellt der Nutzer folgende PNG-Assets bereit:

```text
public/assets/tiles/plain.png
public/assets/resources/iron-ore.png

public/assets/units/start-robot.png

public/assets/buildings/solar-collector.png
public/assets/buildings/robot-factory.png
```

### Rollen der Assets

- `plain.png`: normales begehbares/bebaubares Terrain als Basistile
- `iron-ore.png`: transparentes Ressourcen-Overlay für Felder mit Iron Ore
- `start-robot.png`: Sprite für den Startroboter
- `solar-collector.png`: Sprite für den Solarkollektor
- `robot-factory.png`: Sprite für die Roboterfabrik

### Allgemeine Anforderungen

Alle Assets sollen:

- PNG-Dateien sein
- quadratisch sein
- dieselbe Pixelgröße besitzen oder zumindest auf dieselbe logische Tilegröße skalierbar sein
- im gleichen Stil und in derselben Perspektive gehalten sein
- bei 50 %, 100 % und 200 % Zoom erkennbar bleiben

### Spezifische Anforderungen

#### Terrain

`plain.png` ist ein vollflächiges Bodentile.

Empfehlung:

- quadratisch, z. B. 64x64 px
- nahtlos oder gut wiederholbar
- keine UI-Elemente, kein Text

#### Iron Ore als Overlay

`iron-ore.png` ist **kein eigenes Bodentile**, sondern ein transparentes Overlay, das auf `plain.png` gelegt wird.

Empfehlung:

- gleicher Canvas-Rahmen wie `plain.png`, z. B. 64x64 px
- transparenter Hintergrund
- nur Ressourcendarstellung, kein Boden
- Boden muss darunter sichtbar bleiben
- keine harte quadratische Erzfläche
- eher Adern, Brocken oder Flecken innerhalb des Feldes

Renderregel:

- jedes Feld zeichnet zuerst `plain.png`
- wenn das Feld Iron Ore enthält und `amount > 0`, wird `iron-ore.png` darüber gezeichnet
- wenn das Feld erschöpft ist, wird nur `plain.png` gezeichnet

#### Roboter und Gebäude

Die Objekt-Assets sollen **keinen Boden** enthalten. Der Boden kommt immer vom Terrain-Tile darunter.

Empfehlung:

- transparenter Hintergrund
- zentriert im PNG
- kleiner Innenabstand zum Rand
- keine weißen oder schwarzen Hintergrundflächen
- keine unnötigen harten Halos an den Rändern

Empfohlene Startgröße bei einem 64x64-Tile:

- `start-robot.png`: 64x64 px, Objekt innerhalb des Bildes etwas kleiner
- `solar-collector.png`: 64x64 px
- `robot-factory.png`: 64x64 px

### Rendering-Reihenfolge

Der Renderer soll im MVP diese Reihenfolge nutzen:

1. Terrain-Basistile (`plain.png`)
2. Ressourcen-Overlay (`iron-ore.png`, falls Iron Ore vorhanden)
3. Gridlinien
4. Fog-of-War / Unknown-Overlay
5. Gebäude
6. Roboter
7. Auswahlrahmen
8. Debug-Overlays

### Sicht und Fog

Die PNG-Assets ändern keine Spielregeln.

- `unknown`: Feld wird verdeckt dargestellt
- `fog`: Terrain und Ressourcen können sichtbar bleiben, werden aber mit Nebel-Overlay überlagert
- `visible`: Terrain, Ressourcen, Roboter und Gebäude werden normal dargestellt

### Fallback-Verhalten

Falls die PNG-Dateien fehlen oder noch nicht geladen werden können, muss der Renderer mit einfachen Platzhalterdarstellungen weiter funktionieren.

Fallbacks:

- Terrain: sandfarbene Fläche
- Iron Ore: kleines kontrastierendes Overlay/Muster
- Startroboter: einfacher Marker, Kreis oder Dreieck
- Solarkollektor: helles Rechteck
- Roboterfabrik: dunkleres Rechteck


## 13. Rendering

Canvas zeichnet aus dem aktuellen State:

- PNG-Terrain-Basistile
- PNG-Ressourcen-Overlays
- PNG-Objekt-Sprites für Roboter und Gebäude
- Raster
- unbekannte Felder
- Fog-of-War-Felder
- sichtbare Felder
- Iron Ore
- Roboter
- Solarkollektor
- Roboterfabrik
- Auswahlrahmen
- optional: Sichtbereiche und Energieverbindungen als Debug-Overlay

Canvas darf keine Spielregeln enthalten.

## 14. UI

MVP-Layout:

- links: Karte/Spielfeld
- rechts: kontextsensitive Seitenleiste
- unten: Zeitsteuerung, Zoom, Ereignislog

Pflicht im MVP:

- Start/Pause
- Geschwindigkeit 1x / 2x / 4x
- Tick-/Zeitanzeige
- Zoom: 50 %, 75 %, 100 %, 150 %, 200 %
- Mausrad-Zoom
- Ereignislog mit letzten 5 bis 8 Meldungen
- Roboterstatus
- Programmstack anzeigen
- Programme aktiv/inaktiv schalten
- Template hinzufügen
- einfache Diagnose

## 15. Eingabe

Primär per Maus:

- Felder auswählen
- Roboter auswählen
- Gebäude auswählen
- Programme anklicken/aktivieren/deaktivieren
- Stack sortieren
- Zoom per Mausrad
- UI-Buttons bedienen

Tastatur ergänzend:

- Leertaste: Pause/Fortsetzen
- 1/2/3: Geschwindigkeit
- D: Diagnose
- P: Programmstack
- Esc: Dialog schließen/Auswahl aufheben
- Texteingaben für Namen/Labels
- numerische Eingaben für Templatewerte

Regel:

> Maus zuerst, Tastatur optional.

## 16. Tests

Simulationslogik muss testbar sein.

Pflichttests:

- Map ist 10x10
- ResourceInventory kann Iron Ore enthalten
- ResourceCost kann mehrere Ressourcen abbilden
- Iron Ore Deposits nutzen extractionMethod `directMining`
- Plains ist für Bodeneinheiten passierbar
- Plains ist bebaubar
- Geröll ist für Bodeneinheiten nicht passierbar, für fliegende Einheiten aber passierbar
- Lava-/Quecksilberfelder sind für Bodeneinheiten nicht passierbar, für fliegende Einheiten aber passierbar
- exakt 20 Iron-Ore-Felder werden erzeugt
- Clustergrößen liegen zwischen 3 und 8
- Startposition liegt auf freiem Feld ohne Iron Ore
- Sichtweite 2 deckt korrekt auf
- Bewegung kostet 1 Batterie und dauert 1 Tick
- Abbau dauert 10 Ticks und erzeugt 1 Iron Ore
- Frachtspeicher endet bei 10 Iron Ore
- Solarkollektor kostet 5 Iron Ore
- Roboterfabrik kostet 5 Iron Ore
- Roboterfabrik benötigt benachbarten Solarkollektor mit mindestens 40 freier Leistung
- MVP-Flow kann vom Start bis zur Produktion eines zweiten Roboters durchlaufen werden
- Score erhöht sich beim Abbau von Iron Ore
- Score erhöht sich beim Bau eines Solarkollektors
- Score erhöht sich beim Bau einer Roboterfabrik
- Score erhöht sich bei Produktion eines Roboters
- MVP-Zielbonus wird genau einmal vergeben
- Nach 600 Ticks wird `timeLimitReached = true`

## 17. Agent-Regeln

Für Codex/Claude Code:

- Kein großes Refactoring ohne Notwendigkeit.
- Erst Simulationslogik bauen und testen, dann UI.
- Keine Spielregeln in React-Komponenten verstecken.
- Keine Hardcoded-Balancingwerte außerhalb von `constants.ts`.
- Bei jeder neuen Regel einen Test ergänzen.
- Kleine, überprüfbare Schritte.
- Nach jedem Arbeitspaket `npm test` und `npm run build` ausführen.
- Bei Unsicherheit die Konzeptdokumente priorisieren.
- MVP nicht mit späteren Features überladen.
- Kein Backend implementieren.
- Keine Fraktionen, kein Kampf, keine Forschung im MVP.