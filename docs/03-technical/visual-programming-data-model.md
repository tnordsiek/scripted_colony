# Visual Programming Data Model

Dieses Dokument beschreibt die fachliche Verwendung des visuellen Programmiermodells. Vollstaendige kanonische TypeScript-Typdefinitionen stehen in `docs/03-technical/canonical-data-model.md`; Codebloecke in diesem Dokument sind fachliche Auszuege oder Definition-Use-Beispiele.
Dieses Dokument ist die verbindliche technische Brücke zwischen sichtbarer GUI-Programmierung und Simulation.

## Ziel

Die UI zeigt einfache, farbige IF/THEN/STOP-Templates. Die Simulation benötigt dafür ein eindeutiges Datenmodell.

Dieses Modell gilt für den MVP:

```text
ProgramTemplateDefinition
→ ProgramInstance
→ ProgramRow
→ ConditionExpression
→ ProgramAction
→ SensorDefinition / ActionDefinition
```

Der freie Blockgraph-Editor ist nicht Teil des initialen MVP. Die UI-Blöcke sind im MVP eine Projektion dieses Datenmodells.

## Architekturentscheidung MVP

Für den MVP wird kein vollständiger freier Blockgraph gespeichert.

Stattdessen:

```text
TemplateDefinition
→ wird in den Roboterstack kopiert
→ ProgramInstance
→ Spieler darf Parameter/Werte bearbeiten
→ Simulation wertet ProgramInstance aus
```

Das erlaubt editierbare Templates ohne die Komplexität eines komplett freien visuellen Programmiersystems.

## TemplateDefinition

Eine TemplateDefinition ist die unveränderte Vorlage aus der Bibliothek.

```ts
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
```

```ts
type ProgramTemplateId =
  | "template.secureEnergy"
  | "template.exploreNearby"
  | "template.mineIronOre"
  | "template.buildSolarCollector"
  | "template.buildRobotFactory"
  | "template.stasisCharge";
```

Wichtig:

```text
Iron Miner produzieren ist kein Starter-Roboter-Template.
```

Die Iron-Miner-Produktion ist ein Auftrag an die Roboterfabrik.

## ProgramInstance

Eine ProgramInstance ist die konkrete Kopie eines Templates im Stack eines Roboters oder später einer Gruppe.

```ts
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
```

```ts
type ProgramInstanceId = string;
```

Spieleränderungen betreffen die ProgramInstance, nicht die TemplateDefinition.

Beispiele für erlaubte MVP-Änderungen:

- Programm aktivieren/deaktivieren, sofern das Programm nicht locked ist
- Programm im Stack verschieben, sofern das Programm nicht locked ist
- Programm umbenennen
- `template.exploreNearby`: sichtbaren Zielparameter `targetFieldType = Iron Ore` anzeigen; im MVP bleibt nur Iron Ore erlaubt
- `template.mineIronOre`: sichtbaren Resource-Parameter `resourceType = Iron Ore` anzeigen; im MVP bleibt nur Iron Ore erlaubt
- `template.buildSolarCollector`: Gebäudetyp `Solar Collector` anzeigen; der Typ ist im MVP nicht frei austauschbar
- `template.buildRobotFactory`: Gebäudetyp `Roboterfabrik` anzeigen; der Typ ist im MVP nicht frei austauschbar

Nicht als aktive MVP-Beispiele verwenden:

- alte Batteriegrenzwert-Beispiele aus dem frueheren Energie-sichern-Template
- alte Batterie-Mindestbedingungen fuer Erkunden
- alte Scout-Distanzparameterwerte

## ProgramRow

Eine ProgramRow verbindet IF, THEN und STOP.

```ts
type ProgramRow = {
  id: ProgramRowId;
  if: ConditionExpression;
  then: ProgramAction;
  stop: StopConditionGroup;
};
```

```ts
type ProgramRowDefinition = ProgramRow;
type ProgramRowId = string;
```

## Stabile MVP-ProgramRowIds

Die Startroboter-Templates verwenden feste RowIds:

```text
row.starter.mineIronOre.main
row.starter.buildSolarCollector.main
row.starter.buildRobotFactory.main
row.starter.exploreNearby.main
row.starter.stasisCharge.main
```

Diese IDs werden nicht aus Array-Indizes erzeugt. Sie bleiben bei Speichern, Laden, Diagnoseausgabe und Template-Reset stabil.


Ein Programm kann mehrere Zeilen besitzen. Im MVP haben die Starttemplates zunächst jeweils eine Hauptzeile. Das Modell erlaubt mehrere Zeilen, damit spätere Templates erweitert werden können.

## StopConditionGroup

Stop-Bedingungen verwenden dieselbe Condition-Sprache wie IF-Bedingungen.

```ts
type StopConditionGroup = {
  operator: "OR";
  conditions: ConditionExpression[];
};
```

Regel:

```text
Wenn eine Stop-Bedingung erfüllt ist
→ laufendes Programm endet regulär
→ Stack-Prüfung beginnt wieder oben
```

Mehrere Stop-Bedingungen sind erlaubt.

## ConditionExpression

```ts
type ConditionExpression =
  | SensorCondition
  | NotCondition
  | LogicalConditionGroup;
```

### SensorCondition

```ts
type SensorCondition = {
  type: "sensor";
  sensorId: SensorId;
  operator: OperatorId;
  value: ConditionValue;
};
```

### NotCondition

```ts
type NotCondition = {
  type: "not";
  condition: ConditionExpression;
};
```

### LogicalConditionGroup

```ts
type LogicalConditionGroup = {
  type: "group";
  operator: "AND" | "OR";
  conditions: ConditionExpression[];
};
```

## SensorDefinition

```ts
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
```

```ts
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
```

```ts
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
```

## OperatorDefinition

```ts
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
```

Operatoren dürfen in der UI nur angeboten werden, wenn sie zum gewählten Sensor passen.

Beispiele:

```ts
const batterySensor: SensorDefinition = {
  id: "sensor.battery",
  label: "Batterie",
  valueType: "percentage",
  allowedOperators: ["lt", "lte", "gt", "gte", "eq", "neq"],
  valueRange: { min: 0, max: 100, unit: "%" },
};
```

```ts
const neighborFieldTypeSensor: SensorDefinition = {
  id: "sensor.neighborFieldType",
  label: "Nachbarfeld hat Typ",
  valueType: "fieldType",
  allowedOperators: ["hasType", "notHasType"],
};
```

```ts
const visibleFieldTypeSensor: SensorDefinition = {
  id: "sensor.visibleFieldType",
  label: "Sichtfeld hat Typ",
  valueType: "fieldType",
  allowedOperators: ["hasType", "notHasType"],
};
```

```ts
const robotStatusSensor: SensorDefinition = {
  id: "sensor.robotStatus",
  label: "Roboterstatus",
  valueType: "robotStatus",
  allowedOperators: ["eq", "neq", "is", "isNot"],
  allowedValues: [
    { type: "robotStatus", value: "active" },
    { type: "robotStatus", value: "stasis" },
    { type: "robotStatus", value: "inactive" },
    { type: "robotStatus", value: "destroyed" },
  ],
};
```

```ts
const buildingExistsSensor: SensorDefinition = {
  id: "sensor.buildingExists",
  label: "Gebäude existiert",
  valueType: "buildingQuery",
  allowedOperators: ["exists", "notExists"],
};
```

Gebäude-mit-Status-Regeln nutzen immer `BuildingQuery`, damit Gebäudetyp und Status gemeinsam geprüft werden.

```ts
const solarCollectorActive: SensorCondition = {
  type: "sensor",
  sensorId: "sensor.buildingExists",
  operator: "exists",
  value: {
    type: "buildingQuery",
    value: { buildingType: "solarCollector", status: "active" },
  },
};
```

## ConditionValue

```ts
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
  | { type: "power"; value: number };

type BuildingQuery = {
  buildingType: BuildingType;
  status?: BuildingStatus;
};
```

```ts
type FieldTypeQuery =
  | "ironOre"
  | "solarCollector"
  | "robotFactory"
  | "chargingField"
  | "building"
  | "freeField"
  | "blockedField";
```

Validierungsregel:

- Prozentwerte: 0–100
- Ressourcentypen: nur bekannte/freigeschaltete Ressourcen
- Gebäudetypen: nur bekannte/freigeschaltete Gebäudetypen
- Gebäudeabfragen: `BuildingQuery.buildingType` muss bekannt/freigeschaltet sein; `status` ist optional, muss aber bei Angabe ein gültiger `BuildingStatus` sein
- Feldtypen: nur erlaubte `FieldTypeQuery`
- Roboterstatus: nur erlaubte `RobotStatus`-Werte

## ProgramAction

```ts
type ProgramAction = {
  actionId: ActionId;
  parameters: Record<string, ActionParameterValue>;
};
```

```ts
type ActionId =
  | "action.charge"
  | "action.scoutNearby"
  | "action.mineResource"
  | "action.buildBuilding"
  | "action.stasisCharge";
```

Nicht im Starter-Roboter-Stack:

```ts
"action.produceRobot"
```

Produktion ist im MVP eine Gebäudefunktion der Roboterfabrik.

## ActionDefinition

```ts
type ActionDefinition = {
  id: ActionId;
  label: string;
  energyRequirement: ActionEnergyRequirement;
  parameters: ActionParameterDefinition[];
};
```

```ts
type ActionEnergyRequirement = {
  minimumBattery: number;
};
```

```ts
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
```

```ts
type ActionParameterValue =
  | string
  | number
  | boolean
  | { type: "resourceType"; value: ResourceType }
  | { type: "buildingType"; value: BuildingType }
  | { type: "fieldType"; value: FieldTypeQuery }
  | { type: "fieldCondition"; value: FieldCondition };
```

Kanonische Regel:

```text
Action-Parameter mit Feldtyp werden nicht als Freitext gespeichert.
Sie nutzen immer die objektfoermige Variante { type: "fieldType", value: FieldTypeQuery }.
```

## FieldCondition

```ts
type FieldCondition =
  | { type: "freeNeighborField" }
  | { type: "adjacentToBuilding"; buildingType: BuildingType }
  | { type: "adjacentToResource"; resourceType: ResourceType }
  | { type: "notOnActiveResource" }
  | { type: "buildableTerrain" }
  | { type: "highSunlightPreferred" };
```

## MVP ActionDefinitions

Aktive MVP-ActionDefinitions sind ausschließlich:

```text
action.scoutNearby
action.mineResource
action.buildBuilding
action.stasisCharge
```

`action.charge` ist keine MVP-ActionDefinition und darf im MVP-ProgramEditor nicht als auswählbare Aktion angeboten werden. Roboterladung im MVP erfolgt ausschließlich über `action.stasisCharge`; externe Roboterladung bleibt Future/Advanced.

### Scoute Nahfeld

```ts
const scoutNearbyAction: ActionDefinition = {
  id: "action.scoutNearby",
  label: "Scoute Nahfeld",
  energyRequirement: { minimumBattery: 1 },
  parameters: [
    {
      id: "targetFieldType",
      label: "Ziel-Feldtyp",
      type: "fieldType",
      defaultValue: { type: "fieldType", value: "ironOre" },
      allowedValues: [{ type: "fieldType", value: "ironOre" }],
    },
  ],
};
```

### Baue Ressource ab

```ts
const mineResourceAction: ActionDefinition = {
  id: "action.mineResource",
  label: "Baue Ressource ab",
  energyRequirement: { minimumBattery: 1 },
  parameters: [
    {
      id: "resourceType",
      label: "Ressourcentyp",
      type: "resourceType",
      defaultValue: { type: "resourceType", value: "ironOre" },
      allowedValues: [{ type: "resourceType", value: "ironOre" }],
    },
  ],
};
```

### Baue Gebäude

```ts
const buildBuildingAction: ActionDefinition = {
  id: "action.buildBuilding",
  label: "Baue Gebäude",
  energyRequirement: { minimumBattery: 1 },
  parameters: [
    {
      id: "buildingType",
      label: "Art des Gebäudes",
      type: "buildingType",
    },
    {
      id: "fieldCondition",
      label: "Feldbedingung",
      type: "fieldCondition",
    },
  ],
};
```

### Stasis-Laden

```ts
const stasisChargeAction: ActionDefinition = {
  id: "action.stasisCharge",
  label: "Stasis-Laden",
  energyRequirement: { minimumBattery: 0 },
  parameters: [],
};
```

## Future/Advanced ActionDefinitions

Dieser Abschnitt ist nicht MVP-aktiv. Diese Actions dürfen im MVP-Datenmodell vorbereitet bleiben, aber nicht im MVP-Startstack oder als auswählbare MVP-ProgramEditor-Aktion erscheinen.

### Laden / `action.charge`

```ts
const futureChargeAction: ActionDefinition = {
  id: "action.charge",
  label: "Laden",
  energyRequirement: { minimumBattery: 0 },
  parameters: [
    {
      id: "preferredChargeMode",
      label: "bevorzugte Ladeart",
      type: "mode",
      defaultValue: "automatic",
      allowedValues: ["automatic", "self", "external"],
    },
  ],
};
```

Regeln:

```text
action.charge ist Future/Advanced.
action.charge ist keine MVP-ActionDefinition.
action.charge wird im MVP nicht im ProgramEditor angeboten.
action.charge ist nicht Teil des MVP-Startstacks.
action.charge darf nicht für MVP-Sieg, MVP-Abnahme oder RobotTask-Erzeugung vorausgesetzt werden.
```

## Beispiel: Template Erkunden

```ts
const exploreNearbyProgram: ProgramInstance = {
  id: "program.instance.exploreNearby.1",
  templateId: "template.exploreNearby",
  name: "Erkunden",
  enabled: true,
  rows: [
    {
      id: "row.starter.exploreNearby.main",
      if: {
        type: "group",
        operator: "AND",
        conditions: [
          {
            type: "sensor",
            sensorId: "sensor.battery",
            operator: "gte",
            value: { type: "percentage", value: 60 },
          },
          {
            type: "not",
            condition: {
              type: "sensor",
              sensorId: "sensor.neighborFieldType",
              operator: "hasType",
              value: { type: "fieldType", value: "ironOre" },
            },
          },
        ],
      },
      then: {
        actionId: "action.scoutNearby",
        parameters: {
          targetFieldType: { type: "fieldType", value: "ironOre" },
        },
      },
      stop: {
        operator: "OR",
        conditions: [
          {
            type: "sensor",
            sensorId: "sensor.visibleFieldType",
            operator: "hasType",
            value: { type: "fieldType", value: "ironOre" },
          },
        ],
      },
    },
  ],
};
```

## UI-Projektion

Die UI muss dieses Modell nicht roh anzeigen. Sie rendert es als Blöcke.

Beispiel interne Struktur:

```ts
sensorId: "sensor.neighborFieldType"
operator: "notHasType"
value: { type: "fieldType", value: "ironOre" }
```

UI-Anzeige:

```text
Nachbarfeld hat nicht Typ Iron Ore
```

Beispiel interne Struktur:

```ts
actionId: "action.scoutNearby"
parameters: { targetFieldType: { type: "fieldType", value: "ironOre" } }
```

UI-Anzeige:

```text
Scoute Nahfeld
Parameter: Ziel-Feldtyp Iron Ore
```

## MVP-Regel

Für den MVP werden editierbare Template-Instanzen umgesetzt. Ein komplett freier Blockeditor ist nicht erforderlich.

Die UI darf nur erlaubte Änderungen anbieten:

- Werte ändern
- Aktionsparameter ändern
- Programmname ändern
- Programm aktivieren/deaktivieren
- Programme im Stack sortieren
- Template in Stack übernehmen

Nicht MVP:

- beliebige neue Sensoren erstellen
- beliebige neue Operatoren erstellen
- beliebige Blockgraphen verdrahten
- frei programmierbare Gebäude

## updateProgram-Validierungsvertrag

Der MVP-Editor ist ein Formular-/Zeileneditor. Er darf `updateProgram` nur mit Payloads erzeugen, die der Template-Edit-Policy entsprechen.

Erlaubt:

```text
Programmname ändern
enabled ändern, wenn nicht locked
freigegebene Action-Parameter mit erlaubtem Wert setzen
freigegebene Condition-/Stop-Werte mit erlaubtem Wert setzen
```

Nicht erlaubt:

```text
templateId ändern
RowIds ändern
neue Rows einfügen
Rows löschen
actionId austauschen
unbekannte Sensoren, Operatoren oder Actions einfügen
Future-Parameter in MVP-Templates speichern
locked Programme ändern
```

Beispiele:

```text
Erlaubt: program.starter.exploreNearby bleibt template.exploreNearby und targetFieldType bleibt Iron Ore.
Rejected invalidTemplateParameter: targetFieldType = lavaRiver.
Rejected invalidProgramDefinition: action.scoutNearby wird durch action.buildBuilding ersetzt.
Rejected programLocked: Stasis-Laden speichern.
```


## Programmzeilen-Auswertung

`ProgramInstance.rows` wird von oben nach unten geprueft.

```ts
type ProgramEvaluationResult =
  | { type: "startRow"; programId: ProgramInstanceId; rowId: ProgramRowId; action: ProgramAction }
  | { type: "programNotExecutable"; programId: ProgramInstanceId; reasons: ProgramBlockReason[] };
```

Regeln:

- Eine Zeile ist ausfuehrbar, wenn `if` wahr ist und `then` ausfuehrbar ist.
- Wenn `if` falsch ist, wird die naechste Zeile geprueft.
- Wenn `if` wahr ist, aber `then` nicht ausfuehrbar ist, wird ebenfalls die naechste Zeile geprueft.
- Wenn keine Zeile ausfuehrbar ist, gilt das Programm als nicht ausfuehrbar.
- Die erste ausfuehrbare Zeile wird laufende Zeile.
- Waehrend die Zeile laeuft, wird der Stack nicht neu priorisiert.

## UI-Projektion der Programmblöcke

Im MVP ist die Blockdarstellung eine Projektion des typisierten Datenmodells.

UI-Regel:

```text
ProgramTemplateDefinition
→ ProgramInstance
→ ProgramRow
→ ConditionExpression
→ ProgramAction
```

wird angezeigt als:

```text
IF ...
THEN ...
STOP ...
```

Der MVP-Editor erlaubt nur Parameteränderungen vorbereiteter Templates.

Die freie visuelle Blockprogrammierung bleibt Future-System.

## MVP-Startstack

Der Startroboter erhält diesen initialen Stack:

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

`template.secureEnergy` bleibt als TemplateDefinition erlaubt, ist aber kein initiales Startroboter-Programm.

`template.exploreNearby` verwendet für den Startroboter keine Batterie-Mindestbedingung mehr.

Kanonische Startroboter-Erkundungszeile:

```text
IF NOT Nachbarfeld hat Typ Iron Ore
THEN Scoute Nahfeld
STOP Nachbarfeld hat Typ Iron Ore
OR Roboterstatus = Stasis
```

`Roboterstatus = Stasis` wird technisch als `sensor.robotStatus` mit `ConditionValue { type: "robotStatus", value: "stasis" }` gespeichert.

## ScoutNearby Action Parameters

`action.scoutNearby` besitzt einen Zielparameter.

```ts
type ScoutNearbyActionParameters = {
  targetFieldType: { type: "fieldType"; value: FieldTypeQuery };
};
```

MVP-ProgramAction:

```ts
const MVP_EXPLORE_ACTION: ProgramAction = {
  actionId: "action.scoutNearby",
  parameters: {
    targetFieldType: { type: "fieldType", value: "ironOre" },
  },
};
```

Kanonische Startroboter-Erkundungszeile:

```text
IF NOT Nachbarfeld hat Typ "Iron Ore"
THEN Scoute Nahfeld mit Ziel "Iron Ore"
STOP Nachbarfeld hat Typ "Iron Ore"
OR Roboterstatus = Stasis
```


## action.charge aus MVP ActionDefinitions entfernt

`action.charge` bleibt als Future/Advanced-ActionId vorbereitet, ist aber keine aktive MVP-ActionDefinition.

Verbindliche MVP-Regel:

```text
MVP ActionDefinitions = action.scoutNearby, action.mineResource, action.buildBuilding, action.stasisCharge.
```

Nicht erlaubt im MVP:

```text
action.charge im MVP-Startstack
action.charge als auswählbare ProgramEditor-Aktion
action.charge als Voraussetzung für MVP-Sieg oder MVP-Abnahme
externe Roboterladung über Gebäudeenergie
```
