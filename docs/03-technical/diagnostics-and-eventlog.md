# Diagnostics and Eventlog

Kanonische TypeScript-Typdefinitionen fuer `GameEvent`, `GameEventCode` und verwandte Enums stehen in `docs/03-technical/canonical-data-model.md`. Dieses Dokument ist Quelleigentuemer fuer Event-/Reason-Mapping und Beispiele.
## Status

Dieses Dokument ist die zentrale Spezifikation für Diagnose und Eventlog im MVP.

Es ist verbindlich für:

```text
GameEvent-Schema
Event-Codes
Player Eventlog
Debug Diagnostics
Severity
Priority
Deduplizierung
Eventlog-Limit
UI-Anzeige
Tests
```

## Grundentscheidung

Es gibt zwei Ebenen:

```text
Player Eventlog
Debug Diagnostics
```

## Player Eventlog

Player Events sind für den Spieler sichtbar.

Zweck:

```text
wichtige Spielereignisse erklären
Blockaden verständlich machen
Fortschritt sichtbar machen
```

Beispiele:

```text
Startroboter gelandet.
Iron Ore gesichtet.
Mining gestartet.
Iron Ore aufgenommen.
Bau blockiert: nicht genug Iron Ore.
Solar Collector gebaut.
Roboterfabrik gebaut.
Iron-Miner-Produktion gestartet.
Spawn blockiert: kein freies Ausgabefeld.
Iron Miner gespawnt.
MVP-Ziel erreicht.
```

## Debug Diagnostics

Debug Events sind für Entwicklung, Tests und optionalen Diagnosemodus.

Zweck:

```text
konkrete technische Gründe prüfen
canExecuteAction nachvollziehen
Stack-Entscheidungen testen
```

Beispiele:

```text
action.scoutNearby notExecutable: noValidScoutTarget
program.template.exploreNearby skipped
build target rejected: field has resource
canExecuteAction result: missingParameter
```

## Kanonisches Eventmodell

```ts
type GameEventVisibility =
  | "player"
  | "debug";

type GameEventSeverity =
  | "info"
  | "success"
  | "warning"
  | "error";

type GameEventPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

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
```

Regel:

```text
message ist UI-Text.
code ist testbarer stabiler Schlüssel.
details enthält technische Zusatzdaten.
Tests prüfen code, nicht message.
```



## Deterministische Event-IDs und Event-Sequenz

Runtime-Events verwenden das zentrale Muster aus `docs/03-technical/deterministic-id-generation.md`:

```text
event.<tick6>.<seq3>.<code>
```

`seq3` folgt der dort definierten deterministischen Event-Sequenz innerhalb eines Ticks. Das initiale Start-Event nutzt weiterhin die feste stabile ID `event.initialLanding`.

Event-Kandidaten werden vor ID-Vergabe sortiert. Die Sortierung folgt:

```text
pipelineStepOrder -> sourceOrder -> entitySortKey -> eventCodeOrder -> localSequence
```

Deduplizierte Player-Events behalten ihre bestehende ID und aktualisieren `repeatCount`, `firstTick` und `lastTick`; sie erzeugen keine neue zufaellige ID und verbrauchen keinen neuen `seq3`-Slot.

## Event-Codes

Stabile Codes ersetzen freie Meldungstexte.

```text
GameEventCode ist kanonisch in `docs/03-technical/canonical-data-model.md` definiert.
Dieses Dokument beschreibt Bedeutung, Sichtbarkeit und Prioritaet der Codes, definiert aber keine eigene TypeScript-Union.

Kanonische Codes:
system.initialLanding
program.row.conditionFalse
program.skipped.notExecutable
program.action.executable
task.started
task.completed
task.aborted
action.scout.targetVisible
action.scout.targetSelected
action.scout.noReachableTarget
action.mine.started
action.mine.blocked.noAdjacentResource
action.mine.blocked.cargoFull
action.mine.completed
action.build.targetSelected
action.build.blocked.notEnoughResources
action.build.blocked.noValidBuildSite
action.build.blocked.noReachableBuildFromField
action.build.blocked.constructionAlreadyReserved
action.build.started
action.build.completed
action.stasis.started
action.stasis.completed
action.stasis.blocked.cannotSelfCharge
production.ironMiner.started
production.ironMiner.blocked.notEnoughOre
production.ironMiner.paused.insufficientPower
production.ironMiner.spawnBlocked
production.ironMiner.spawned
goal.mvpReached
debug.command.rejected
debug.canExecuteAction.result
debug.build.targetRejected
debug.scout.targetRejected
debug.asset.fallbackUsed
debug.asset.missingFallback
```



## Kanonische Event-, Reason- und Command-Rejection-Matrix

Diese Matrix ist die verbindliche fachliche Zuordnung fuer Events, `ActionNotExecutableReason` und `CommandRejectionReason`. Die TypeScript-Unionen bleiben ausschliesslich in `docs/03-technical/canonical-data-model.md` kanonisch.

Vollstaendigkeitsregel:

```text
Jeder GameEventCode muss in der Event-Code-Matrix vorkommen.
Jeder ActionNotExecutableReason muss in der Action-Reason-Matrix vorkommen.
Jeder CommandRejectionReason muss in der Command-Rejection-Matrix vorkommen.
Neue Codes oder Reasons duerfen erst ergaenzt werden, wenn diese Matrizen aktualisiert wurden.
```

### Event-Code-Matrix

| Code | Trigger / Ursprung | Sichtbarkeit | Severity | Priority | Kategorie | Pflichtdetails / Dedupe |
|---|---|---|---|---|---|---|
| `system.initialLanding` | Initialer GameState | player | info | normal | system | feste ID `event.initialLanding`; nicht deduplizieren |
| `program.row.conditionFalse` | ProgramRow-Bedingung nicht erfuellt | debug | info | low | program | `robotId`, `programId`, `rowId`; kein Player-Event |
| `program.skipped.notExecutable` | ProgramRow-Aktion nicht ausfuehrbar | debug | info | low | program | `robotId`, `programId`, `rowId`, `actionId`, `details.reason` |
| `program.action.executable` | ProgramRow-Aktion ausfuehrbar, bevor Task startet | debug | info | low | program | `robotId`, `programId`, `rowId`, `actionId`; optional |
| `task.started` | RobotTask wurde angelegt | debug | info | low | task | `robotId`, `details.taskType`, optional `rowId` |
| `task.completed` | RobotTask wurde erfolgreich abgeschlossen | debug | info | low | task | `robotId`, `details.taskType` |
| `task.aborted` | RobotTask wurde abgebrochen | debug | warning | normal | task | `robotId`, `details.taskType`, `details.reason` |
| `action.scout.targetVisible` | Scouten macht Iron Ore sichtbar | player | info | normal | action | `robotId`, `details.targetFieldX`, `details.targetFieldY`; Player-Dedupe nach Entity/Feld |
| `action.scout.targetSelected` | Scout-Ziel wurde gewaehlt | debug | info | low | action | `robotId`, Zielkoordinaten und Auswahlgrund |
| `action.scout.noReachableTarget` | Scouten findet kein erreichbares Ziel | debug/player nach Blocker-Regel | warning | normal | action | `robotId`, `actionId`, `details.reason` |
| `action.mine.started` | MiningTask startet | player | info | normal | action | `robotId`, Ressourcentyp und Zielkoordinate |
| `action.mine.blocked.noAdjacentResource` | Mining kann kein angrenzendes Iron Ore finden | player/debug nach Blocker-Regel | warning | normal | action | `robotId`, `actionId`, `details.reason = noAdjacentResource` |
| `action.mine.blocked.cargoFull` | Mining blockiert, weil Cargo voll ist | player | warning | high | action | `robotId`, `details.cargoUsed`, `details.cargoCapacity` |
| `action.mine.completed` | MiningTask legt Iron Ore in Cargo | player | success | normal | resource | `robotId`, `details.resourceAmount`; Player-Dedupe erlaubt |
| `action.build.targetSelected` | Build-Ziel oder Baustelle wurde gewaehlt | debug | info | low | building | `details.mode`, `buildingType`, `buildingId`, `siteX`, `siteY` |
| `action.build.blocked.notEnoughResources` | Neubau fehlt Cargo-Ressource | player | warning | high | building | `robotId`, `details.reason = notEnoughResources`, `buildingType` |
| `action.build.blocked.noValidBuildSite` | Kein gueltiges Baufeld gefunden | player | warning | high | building | `robotId`, `details.reason = noValidBuildSite`, `buildingType` |
| `action.build.blocked.noReachableBuildFromField` | Kein erreichbares Bau-Ausfuehrungsfeld | player | warning | high | building | `robotId`, `details.reason = noReachableBuildFromField`, `buildingType` |
| `action.build.blocked.constructionAlreadyReserved` | Bestehende Baustelle wird durch anderen BuildingTask bearbeitet | debug/player nach Blocker-Regel | warning | high | building | `details.reason = constructionAlreadyReserved`, `mode = continueConstruction`, `buildingType`, `buildingId`, `reservedByRobotId` |
| `action.build.started` | BuildingTask startet | player | info | normal | building | `details.mode`, `buildingType`, `buildingId`, `siteX`, `siteY` |
| `action.build.completed` | Gebaeude wird active | player | success | high | building | `details.mode`, `buildingType`, `buildingId`, `siteX`, `siteY` |
| `action.stasis.started` | StasisChargingTask startet | player | warning | high | robot | `robotId`, optional Batterieangaben |
| `action.stasis.completed` | Roboter verlaesst Stasis-Laden | player | success | normal | robot | `robotId`, optional Batterieangaben |
| `action.stasis.blocked.cannotSelfCharge` | Stasis-Laden ist wegen ChargingMode unmoeglich | player | error | critical | robot | `robotId`, `details.reason`, `details.chargingMode` |
| `production.ironMiner.started` | `startIronMinerProduction` akzeptiert | player | info | normal | production | `buildingId`, `details.productionTaskId`, `remainingTicks`; keine Score-Aenderung |
| `production.ironMiner.blocked.notEnoughOre` | Produktionscommand abgelehnt wegen Starter-Cargo | player | warning | high | production | `buildingId`, `details.reason = notEnoughIronOreInStarterCargo`, `requiredOre`, `availableOre` |
| `production.ironMiner.paused.insufficientPower` | Laufender ProductionTask kann in diesem Tick nicht fortschreiten | player | warning | high | production | `buildingId`, `details.productionTaskId`, `powerRequired`, `freePower`, `remainingTicks`; deduplizieren |
| `production.ironMiner.spawnBlocked` | `remainingTicks = 0`, aber kein freies Spawnfeld | player | warning | high | production | `buildingId`, `details.productionTaskId`, optional belegte Spawnfelder; deduplizieren |
| `production.ironMiner.spawned` | Iron-Miner-Entity wurde in `GameState.robots` eingefuegt | player | success | high | robot | `buildingId`, `robotId`, `details.productionTaskId`; vor `goal.mvpReached` |
| `goal.mvpReached` | Erster Iron Miner wurde erfolgreich gespawnt | player | success | critical | goal | `robotId`, `buildingId`; Message exakt `MVP-Ziel erreicht: erster Iron Miner gespawnt.` |
| `debug.command.rejected` | Beliebiger abgelehnter PlayerCommand ohne spezifischen Player-Event-Code | debug | warning | low | system | `details.commandType`, `details.reason`, optional Ziel-ID/Koordinaten; nicht deduplizieren |
| `debug.canExecuteAction.result` | technische Action-Ausfuehrbarkeitsdiagnose | debug | info | low | action | `robotId`, `actionId`, `details.result`, `details.reason`; nicht deduplizieren |
| `debug.build.targetRejected` | Build-Kandidatenfeld wurde intern verworfen | debug | info | low | building | `robotId`, `buildingType`, Feldkoordinaten, `details.reason` |
| `debug.scout.targetRejected` | Scout-Kandidatenfeld wurde intern verworfen | debug | info | low | action | `robotId`, Feldkoordinaten, `details.reason` |
| `debug.asset.fallbackUsed` | Renderer/Asset-Aufloesung nutzt Fallback | debug | info | low | system | `details.assetKey`, `details.fallbackKey` |
| `debug.asset.missingFallback` | Fallback fuer MVP-AssetKey fehlt | debug | error | critical | system | `details.assetKey`; blockiert MVP-Abnahme |

### Action-Reason-Matrix

| ActionNotExecutableReason | Kontext | Kanonischer Event-/Diagnosecode | Player-sichtbar | Pflichtdetails |
|---|---|---|---|---|
| `missingParameter` | jede MVP-ProgramAction | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nein | `reason`, `actionId`, fehlender Parametername |
| `robotNotActive` | jede MVP-ProgramAction | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nur nach Blocker-Regel | `reason`, `robotId`, `robotStatus` |
| `batteryTooLow` | jede MVP-ProgramAction | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nur nach Blocker-Regel | `reason`, `robotId`, `battery` |
| `robotInStasis` | ProgramAction ausser Stasis-Laden | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nein | `reason`, `robotId`, `robotStatus` |
| `unsupportedMvpAction` | Future-/nicht freigegebene Action | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nein | `reason`, `actionId` |
| `unsupportedMvpTarget` | nicht freigegebener Ziel-/Parameterwert | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nein | `reason`, `actionId`, Parameterwert |
| `cargoFull` | `action.mineResource` | `action.mine.blocked.cargoFull` | ja | `reason`, `robotId`, `cargoUsed`, `cargoCapacity` |
| `notEnoughResources` | `action.buildBuilding` Neubau | `action.build.blocked.notEnoughResources` | ja | `reason`, `robotId`, `buildingType`, fehlende Ressource |
| `noAdjacentResource` | `action.mineResource` | `action.mine.blocked.noAdjacentResource` | nach Blocker-Regel | `reason`, `robotId`, `resourceType` |
| `resourceDepleted` | Mining-Start oder Mining-Abbruch | `program.skipped.notExecutable` plus `debug.canExecuteAction.result`; bei laufendem Task zusaetzlich `task.aborted` | nein | `reason`, `robotId`, Zielkoordinate |
| `notAdjacentToTarget` | laufender Mining-/Build-Kontext | `program.skipped.notExecutable` plus `debug.canExecuteAction.result`; bei laufendem Task zusaetzlich `task.aborted` | nein | `reason`, `robotId`, Zielkoordinate |
| `noValidScoutTarget` | `action.scoutNearby` | `action.scout.noReachableTarget` | nach Blocker-Regel | `reason`, `robotId`, `targetFieldType` |
| `noValidBuildSite` | `action.buildBuilding` | `action.build.blocked.noValidBuildSite` | ja | `reason`, `robotId`, `buildingType` |
| `noReachableBuildFromField` | `action.buildBuilding` | `action.build.blocked.noReachableBuildFromField` | ja | `reason`, `robotId`, `buildingType` |
| `constructionAlreadyReserved` | `action.buildBuilding` continueConstruction | `action.build.blocked.constructionAlreadyReserved` | nach Blocker-Regel | `reason`, `mode`, `buildingType`, `buildingId`, `reservedByRobotId` |
| `noActiveSolarCollector` | Roboterfabrik-Bau-Voraussetzung | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nach Blocker-Regel | `reason`, `robotId`, `buildingType = robotFactory` |
| `taskAlreadyRunning` | Roboter hat bereits `activeTask` | `program.skipped.notExecutable` plus `debug.canExecuteAction.result` | nein | `reason`, `robotId`, `taskType` |
| `noPath` | Scout/Build/sonstige Bewegung | Scout: `action.scout.noReachableTarget`; Build: `action.build.blocked.noReachableBuildFromField`; sonst `debug.canExecuteAction.result` | nach jeweiliger Code-Regel | `reason`, `robotId`, Zielkoordinate, optional `pathLength = 0` |

### Command-Rejection-Matrix

Grundregel: Jeder abgelehnte `PlayerCommand` liefert `CommandResult = { type: "rejected", reason }` und erzeugt keine spielrelevante State-Mutation. Die UI zeigt die lokale Rueckmeldung aus `CommandResult.reason`. Persistente kanonische Diagnose nutzt `debug.command.rejected`, ausser ein spezifischer Player-Event-Code ist in der Matrix angegeben.

| CommandRejectionReason | Betroffene Commands | Kanonischer Event-Code | Sichtbarkeit | Pflichtdetails |
|---|---|---|---|---|
| `invalidCommand` | alle Commands | `debug.command.rejected` | debug | `commandType`, `reason` |
| `invalidSpeed` | `setSpeed` | `debug.command.rejected` | debug | `commandType = setSpeed`, `reason`, `speed` |
| `invalidSeed` | `resetRun` | `debug.command.rejected` | debug | `commandType = resetRun`, `reason` |
| `robotNotFound` | `selectRobot`, ProgramCommands | `debug.command.rejected` | debug | `commandType`, `reason`, `robotId` |
| `buildingNotFound` | `selectBuilding`, `startIronMinerProduction` | `debug.command.rejected` | debug | `commandType`, `reason`, `buildingId` |
| `fieldOutOfBounds` | `selectField` | `debug.command.rejected` | debug | `commandType = selectField`, `reason`, `x`, `y` |
| `programNotFound` | ProgramCommands | `debug.command.rejected` | debug | `commandType`, `reason`, `robotId`, `programId` |
| `programLocked` | ProgramCommands | `debug.command.rejected` | debug | `commandType`, `reason`, `robotId`, `programId` |
| `invalidProgramDefinition` | `updateProgram` | `debug.command.rejected` | debug | `commandType = updateProgram`, `reason`, `robotId`, `programId` |
| `invalidTemplateParameter` | `updateProgram` | `debug.command.rejected` | debug | `commandType = updateProgram`, `reason`, `parameterPath` |
| `unknownSensor` | `updateProgram` | `debug.command.rejected` | debug | `commandType = updateProgram`, `reason`, `sensorId` |
| `unknownAction` | `updateProgram` | `debug.command.rejected` | debug | `commandType = updateProgram`, `reason`, `actionId` |
| `unknownOperator` | `updateProgram` | `debug.command.rejected` | debug | `commandType = updateProgram`, `reason`, `operatorId` |
| `invalidConditionValue` | `updateProgram` | `debug.command.rejected` | debug | `commandType = updateProgram`, `reason`, `actual` |
| `programAlreadyFirst` | `moveProgramUp` | `debug.command.rejected` | debug | `commandType = moveProgramUp`, `reason`, `programId` |
| `programAlreadyLast` | `moveProgramDown` | `debug.command.rejected` | debug | `commandType = moveProgramDown`, `reason`, `programId` |
| `buildingIsNotRobotFactory` | `startIronMinerProduction` | `debug.command.rejected` | debug | `commandType = startIronMinerProduction`, `reason`, `buildingId`, `buildingType` |
| `buildingNotActive` | `startIronMinerProduction` | `debug.command.rejected` | debug | `commandType = startIronMinerProduction`, `reason`, `buildingId`, `buildingStatus` |
| `buildingDisabled` | `startIronMinerProduction` | `debug.command.rejected` | debug | `commandType = startIronMinerProduction`, `reason`, `buildingId` |
| `productionAlreadyRunning` | `startIronMinerProduction` | `debug.command.rejected` | debug | `commandType = startIronMinerProduction`, `reason`, `buildingId`, `productionTaskId` |
| `starterRobotMissing` | `startIronMinerProduction` | `debug.command.rejected` | debug | `commandType = startIronMinerProduction`, `reason` |
| `starterRobotNotConnected` | `startIronMinerProduction` | `debug.command.rejected` | debug | `commandType = startIronMinerProduction`, `reason`, `robotId`, `communicationStatus` |
| `notEnoughIronOreInStarterCargo` | `startIronMinerProduction` | `production.ironMiner.blocked.notEnoughOre` | player | `commandType = startIronMinerProduction`, `reason`, `buildingId`, `requiredOre`, `availableOre` |

## Sichtbarkeit

```text
Player Events:
  im Eventlog sichtbar

Debug Events:
  nur sichtbar, wenn diagnosticsExpanded = true
  oder in Tests/Dev-Modus
```

Player Event Beispiel:

```ts
{
  id: "event.000120.001.production.ironMiner.blocked.notEnoughOre",
  tick: 120,
  visibility: "player",
  severity: "warning",
  priority: "high",
  category: "production",
  code: "production.ironMiner.blocked.notEnoughOre",
  message: "Nicht genug Iron Ore im Startroboter-Cargo.",
  buildingId: "building.robotFactory.001",
  details: {
    reason: "notEnoughIronOreInStarterCargo",
    requiredOre: 5,
    availableOre: 3
  }
}
```

Debug Event Beispiel:

```ts
{
  id: "event.000121.001.program.skipped.notExecutable",
  tick: 121,
  visibility: "debug",
  severity: "info",
  priority: "low",
  category: "program",
  code: "program.skipped.notExecutable",
  message: "Programm übersprungen: Aktion nicht ausführbar.",
  robotId: "robot.starter",
  programId: "program.starter.exploreNearby",
  actionId: "action.scoutNearby",
  details: {
    reason: "noValidScoutTarget"
  }
}
```

## Prioritäten

```text
critical:
  MVP-Ziel erreicht
  Roboter zerstört
  permanenter Blocker

high:
  Produktion blockiert
  Spawn blockiert
  Bau blockiert
  Stasis gestartet

normal:
  Bau gestartet
  Produktion gestartet
  Mining abgeschlossen

low:
  Program skipped
  Zielauswahl
  einzelne technische Diagnosen
```

## Deduplizierung

Player Events werden dedupliziert.

Regel:

```text
Gleiche Player Events mit gleichem code und gleicher entityId werden innerhalb von 10 Ticks nicht erneut als neuer Eintrag angezeigt.
```

Stattdessen:

```text
repeatCount += 1
lastTick = aktueller Tick
```

Wenn `entityId` fehlt, wird für die Deduplizierung die beste verfügbare ID genutzt:

```text
robotId
buildingId
programId
actionId
code allein als Fallback
```

Debug Events duerfen vollstaendig geloggt werden, sind aber nur im Diagnosemodus sichtbar.

Die Deduplizierung wird erst nach der deterministischen Sortierung der Event-Kandidaten angewendet. Dadurch ist die Reihenfolge neuer Runtime-Event-IDs reproduzierbar.

## Eventlog-Limit

MVP-Regel:

```text
eventLog maximal 200 Einträge
```

Bei Überschreitung:

```text
älteste Einträge entfernen
```

Deduplizierte Wiederholungen erhöhen nicht die Eintragszahl.

## UI-Anzeige

### Haupt-Eventlog

Zeigt nur:

```text
visibility = player
```

Sortierung:

```text
neueste oben
```

Anzeigen:

```text
Tick
Severity-Icon
Message
optional Entity-Link
repeatCount, wenn > 1
```

### Diagnosebereich

Wenn `diagnosticsExpanded = true`:

```text
zeige zusätzlich visibility = debug
zeige details
zeige programId
zeige rowId
zeige actionId
zeige reason
```

## Keine Event-Flut bei Programmschleifen

Regel:

```text
Nicht jede fehlgeschlagene IF-Zeile erzeugt ein Player Event.
```

IF-Fehlschläge sind Debug:

```text
program.row.conditionFalse -> debug
```

Player-sichtbar werden nur relevante Blockaden:

```text
alle Programme nicht ausführbar
wichtige Aktion blockiert
Ressourcen fehlen
Bau/Produktion blockiert
Stasis
Ziel erreicht
```

## Wann wird ein Blocker zum Player Event?

Eine Blockade wird player-sichtbar, wenn mindestens eine Bedingung zutrifft:

```text
sie betrifft einen aktiven Spielerwunsch, z.B. Iron Miner produzieren
sie verhindert aktuellen Fortschritt
sie besteht länger als 3 Ticks unverändert
sie ist kritisch für das MVP-Ziel
```

Beispiele:

```text
notEnoughIronOreInStarterCargo -> sofort player
noValidScoutTarget -> nach 3 Ticks oder debug-only
program.row.conditionFalse -> debug-only
```


## Stabile ProgramRowIds

Diagnostics und Debug-Events verwenden fuer die MVP-Starttemplates stabile RowIds:

```text
row.starter.mineIronOre.main
row.starter.buildSolarCollector.main
row.starter.buildRobotFactory.main
row.starter.exploreNearby.main
row.starter.stasisCharge.main
```

Regel:

```text
program.row.conditionFalse, program.skipped.notExecutable, program.action.executable, task.started und task.aborted sollen rowId setzen, wenn die Ursache einer konkreten ProgramRow zugeordnet werden kann.
Die RowId darf bei Starttemplates nicht aus der aktuellen Array-Position abgeleitet werden.
```

## MVP-Eventliste

### System

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `system.initialLanding` | player | info | normal | Startroboter gelandet. |

### Program / Debug

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `program.row.conditionFalse` | debug | info | low | Programmzeile nicht erfüllt. |
| `program.skipped.notExecutable` | debug | info | low | Programm übersprungen: Aktion nicht ausführbar. |
| `program.action.executable` | debug | info | low | Aktion ausführbar. |

### Task / Debug

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `task.started` | debug | info | low | Task gestartet. |
| `task.completed` | debug | info | low | Task abgeschlossen. |
| `task.aborted` | debug | warning | normal | Task abgebrochen. |

### Scouting

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `action.scout.targetVisible` | player | info | normal | Iron Ore gesichtet. |
| `action.scout.targetSelected` | debug | info | low | Scout-Ziel gewählt. |
| `action.scout.noReachableTarget` | debug/player nach Regel | warning | normal | Scouting blockiert: kein erreichbares Ziel. |

Nicht jeder Scout-Schritt ist ein Player Event.

### Mining

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `action.mine.started` | player | info | normal | Mining gestartet. |
| `action.mine.completed` | player | success | normal | Iron Ore aufgenommen. |
| `action.mine.blocked.noAdjacentResource` | player/debug nach Regel | warning | normal | Mining blockiert: kein angrenzendes Iron Ore. |
| `action.mine.blocked.cargoFull` | player | warning | high | Mining blockiert: Cargo voll. |

### Building

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `action.build.targetSelected` | debug | info | low | Bauplatz oder Baustelle gewählt; `details.mode` ist verbindlich. |
| `action.build.started` | player | info | normal | Bau gestartet; `details.mode` ist verbindlich. |
| `action.build.completed` | player | success | high | Gebäude gebaut; `details.mode` ist verbindlich. |
| `action.build.blocked.notEnoughResources` | player | warning | high | Bau blockiert: nicht genug Ressourcen. |
| `action.build.blocked.noValidBuildSite` | player | warning | high | Bau blockiert: kein gültiges Baufeld. |
| `action.build.blocked.noReachableBuildFromField` | player | warning | high | Bau blockiert: kein erreichbares Bau-Ausführungsfeld. |
| `action.build.blocked.constructionAlreadyReserved` | player/debug nach Blocker-Regel | warning | high | Bau blockiert: Baustelle wird bereits bearbeitet. |

`action.build.blocked.constructionAlreadyReserved` wird erzeugt, wenn `action.buildBuilding` wegen `constructionAlreadyReserved` nicht ausführbar ist. Der Code wird mindestens als Debug-Diagnose erzeugt; er wird player-sichtbar, wenn der Blocker den aktuellen Fortschritt verhindert oder länger als drei Ticks unverändert bleibt. Verbindliche Details:

```ts
details: {
  reason: "constructionAlreadyReserved";
  mode: "continueConstruction";
  buildingType: "solarCollector" | "robotFactory";
  buildingId: BuildingId;
  reservedByRobotId: RobotId;
}
```

Für Build-Events mit ausgewähltem, gestartetem oder abgeschlossenem Build-Task sind folgende Details verbindlich:

```ts
details: {
  mode: "newConstruction" | "continueConstruction";
  buildingType: "solarCollector" | "robotFactory";
  buildingId: string;
  siteX: number;
  siteY: number;
}
```

`details.mode` muss exakt dem `BuildingTask.mode` entsprechen.

Beispiele:

```text
action.build.started + details.mode = newConstruction
action.build.completed + details.mode = continueConstruction
```

### Stasis

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `action.stasis.started` | player | warning | high | Startroboter geht in Stasis und lädt. |
| `action.stasis.completed` | player | success | normal | Startroboter ist wieder aktiv. |
| `action.stasis.blocked.cannotSelfCharge` | player | error | critical | Stasis-Laden blockiert: Roboter kann nicht selbst laden. |

### Production

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `production.ironMiner.started` | player | info | normal | Iron-Miner-Produktion gestartet. |
| `production.ironMiner.blocked.notEnoughOre` | player | warning | high | Nicht genug Iron Ore im Startroboter-Cargo. |
| `production.ironMiner.paused.insufficientPower` | player | warning | high | Produktion pausiert: nicht genug freie Leistung. |
| `production.ironMiner.spawnBlocked` | player | warning | high | Spawn blockiert: kein freies Ausgabefeld. |
| `production.ironMiner.spawned` | player | success | high | Iron Miner gespawnt. |

### Goal

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `goal.mvpReached` | player | success | critical | MVP-Ziel erreicht: erster Iron Miner gespawnt. |

### Command Diagnostics

| Code | Sichtbarkeit | Severity | Priority | Message |
|---|---|---|---|---|
| `debug.command.rejected` | debug | warning | low | Command abgelehnt. |

## Debug-Details

Debug Events können diese Details verwenden:

```text
reason
commandType
condition
sensorId
operator
expected
actual
candidateFieldX
candidateFieldY
targetFieldX
targetFieldY
pathLength
resourceAmount
battery
cargoUsed
cargoCapacity
programId
rowId
actionId
```

## Event-Erzeugung in canExecuteAction

Bei `notExecutable`:

```text
Debug Event mit program.skipped.notExecutable oder debug.canExecuteAction.result erzeugen.
Player Event nur nach Blocker-Regel erzeugen.
```

Bei `executable`:

```text
Debug Event program.action.executable optional erzeugen.
Player Event nur bei sichtbarem Fortschritt erzeugen.
```

## Event-Erzeugung bei Commands

Bei `startIronMinerProduction`:

```text
accepted:
  production.ironMiner.started

rejected notEnoughIronOreInStarterCargo:
  production.ironMiner.blocked.notEnoughOre

andere rejected Gruende:
  debug.command.rejected
```

Bei allen anderen abgelehnten `PlayerCommand`s:

```text
CommandResult.reason ist die UI-Rueckmeldung.
Persistente Diagnose nutzt debug.command.rejected.
Das Event enthaelt mindestens details.commandType und details.reason.
```

## Tests

Verbindliche Tests:

```text
initial game creates system.initialLanding
accepted startIronMinerProduction creates production.ironMiner.started
rejected production due to ore creates production.ironMiner.blocked.notEnoughOre
notExecutable action creates debug event
conditionFalse does not create player event
repeated same player event within 10 ticks increments repeatCount
same player event after 10 ticks creates or surfaces a new visible event according to UI policy
eventLog capped at 200 entries
debug events hidden unless diagnosticsExpanded
debug events visible when diagnosticsExpanded is true
goal reached creates goal.mvpReached
tests assert event.code, not message
```

## Designregel

```text
Das Eventlog erklärt dem Spieler Fortschritt und relevante Blockaden.
Debug Diagnostics erklären Entwicklern und Tests die genaue interne Entscheidung.
Player Events sind stabil, dedupliziert und nicht zu laut.
Debug Events dürfen detailliert sein, sind aber standardmäßig verborgen.
```

## Testmatrix-Verweis

Relevanter Testbereich: `MVP-EVENT`. Die verbindliche Testmatrix steht in `docs/02-mvp/mvp-test-matrix.md`. Tests prüfen `event.code`, nicht `message`.

## Energie-Events

Relevante Energie-/Produktions-Events:

```text
production.ironMiner.started
production.ironMiner.paused.insufficientPower
production.ironMiner.spawned
```

Regel:

```text
production.ironMiner.paused.insufficientPower wird als Player Event dedupliziert.
Es darf nicht jeden Tick als neuer Player-Eventlog-Eintrag erscheinen.
```

Details:

```text
powerRequired
powerProvided
freePower
remainingTicks
```

## Spawn- und Goal-Events

Events werden exakt an Spawn-Zeitpunkte gebunden.

```text
production.ironMiner.started:
  bei accepted startIronMinerProduction Command
  kein Score
  kein MVP-Ziel

production.ironMiner.spawnBlocked:
  wenn remainingTicks = 0, aber kein freies Spawn-Feld existiert
  kein Score
  kein MVP-Ziel

production.ironMiner.spawned:
  erst nachdem eine ironMiner Robot-Entity in GameState.robots eingefügt wurde

goal.mvpReached:
  direkt nach erstem erfolgreichen Iron-Miner-Spawn
  nicht bei readyToSpawn
  nicht bei spawnBlocked
```

Tests prüfen diese Event-Codes, nicht die Meldungstexte.

## Asset Diagnostics

werden Asset-Fallbacks ueber Debug Events diagnostiziert. sind diese Codes Teil der kanonischen `GameEventCode`-Union im Datenmodell.

Codes:

```text
debug.asset.fallbackUsed
debug.asset.missingFallback
```

`debug.asset.fallbackUsed`:

```text
visibility = debug
severity = info
priority = low
category = system
```

Details:

```ts
{
  assetKey: "robot.ironMiner",
  fallbackKey: "robot.ironMiner.fallback"
}
```

Regeln:

```text
Normaler Fallback-Einsatz erzeugt kein Player Event.
Fehlendes finales Asset ist kein Fehler.
Fehlender Fallback ist ein technischer Fehler und laesst Tests fehlschlagen.
```
