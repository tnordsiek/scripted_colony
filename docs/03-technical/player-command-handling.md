# PlayerCommand Handling und CommandResult

Status: MVP-verbindlich.

Dieses Dokument beschreibt die Validierung aller `PlayerCommand`-Varianten. Die kanonischen TypeScript-Typen stehen ausschließlich in `docs/03-technical/canonical-data-model.md`.

## Grundregel

Jeder `PlayerCommand` wird in Phase 1 der kanonischen Tick-Pipeline validiert und angewendet.

```text
CommandResult = accepted:
  Command wurde validiert und angewendet.

CommandResult = rejected:
  Command wurde nicht angewendet.
  reason enthält einen konkreten CommandRejectionReason.
```

Bei `rejected` gilt:

```text
keine spielrelevante State-Mutation
keine Ressourcenänderung
kein Task-Start
keine ProgramStack-Änderung
keine Selection-Änderung
nur UI-Rückmeldung und Diagnose/Eventlog sind erlaubt
```

## Kanonische CommandResult-Quelle

`CommandResult` und `CommandRejectionReason` werden nur in `canonical-data-model.md` als TypeScript-Typen definiert.

Andere Dokumente dürfen RejectionReasons tabellarisch beschreiben, aber keine zweite TypeScript-Union definieren.

## Command-Matrix

| Command | Akzeptanz | Mögliche RejectionReasons |
|---|---|---|
| `pause` | immer akzeptiert, wenn Command syntaktisch gültig ist | `invalidCommand` |
| `resume` | immer akzeptiert, wenn Command syntaktisch gültig ist | `invalidCommand` |
| `setSpeed` | `speed` ist `1`, `2` oder `4` | `invalidCommand`, `invalidSpeed` |
| `selectRobot` | `robotId` existiert | `invalidCommand`, `robotNotFound` |
| `selectBuilding` | `buildingId` existiert | `invalidCommand`, `buildingNotFound` |
| `selectField` | Koordinate liegt innerhalb der Karte | `invalidCommand`, `fieldOutOfBounds` |
| `toggleProgramEnabled` | Robot und Programm existieren; Programm ist nicht locked | `invalidCommand`, `robotNotFound`, `programNotFound`, `programLocked` |
| `moveProgramUp` | Robot und Programm existieren; Programm ist nicht locked; Programm ist nicht erstes verschiebbares Programm | `invalidCommand`, `robotNotFound`, `programNotFound`, `programLocked`, `programAlreadyFirst` |
| `moveProgramDown` | Robot und Programm existieren; Programm ist nicht locked; Programm ist nicht letztes verschiebbares Programm | `invalidCommand`, `robotNotFound`, `programNotFound`, `programLocked`, `programAlreadyLast` |
| `updateProgram` | Robot existiert; Programm ist nicht locked; Update ist templatekonform und validiert | `invalidCommand`, `robotNotFound`, `programNotFound`, `programLocked`, `invalidProgramDefinition`, `invalidTemplateParameter`, `unknownSensor`, `unknownAction`, `unknownOperator`, `invalidConditionValue` |
| `resetProgramToTemplate` | Robot und Programm existieren; Programm ist nicht locked | `invalidCommand`, `robotNotFound`, `programNotFound`, `programLocked` |
| `startIronMinerProduction` | Roboterfabrik und Startroboter erfüllen Produktionsbedingungen | `invalidCommand`, `buildingNotFound`, `buildingIsNotRobotFactory`, `buildingNotActive`, `buildingDisabled`, `productionAlreadyRunning`, `starterRobotMissing`, `starterRobotNotConnected`, `notEnoughIronOreInStarterCargo` |
| `resetRun` | Seed fehlt oder ist ein gültiger nichtleerer String | `invalidCommand`, `invalidSeed` |



## Command-Rejection-Event-Mapping

Die vollstaendige Event-, Reason- und Command-Rejection-Matrix steht in `docs/03-technical/diagnostics-and-eventlog.md`.

Verbindliche Kurzregel:

```text
Alle rejected PlayerCommands liefern CommandResult.reason fuer die UI.
Alle rejected PlayerCommands duerfen als persistente Diagnose ein GameEvent erzeugen.
Generischer Diagnosecode: debug.command.rejected.
Spezifischer Player-Code: notEnoughIronOreInStarterCargo -> production.ironMiner.blocked.notEnoughOre.
```

| Rejection-Gruppe | Event-Code | Sichtbarkeit | State-Mutation |
|---|---|---|---|
| Runtime-/Syntaxfehler wie `invalidCommand`, `invalidSpeed`, `invalidSeed` | `debug.command.rejected` | debug | keine |
| Selection-Rejections wie `robotNotFound`, `buildingNotFound`, `fieldOutOfBounds` | `debug.command.rejected` | debug | keine Selection-Aenderung |
| Program-Rejections wie `programLocked`, `unknownAction`, `invalidProgramDefinition` | `debug.command.rejected` | debug | keine ProgramStack-Aenderung |
| Production-Rejections ausser Ore-Mangel | `debug.command.rejected` | debug | kein Kostenabzug, kein ProductionTask |
| `notEnoughIronOreInStarterCargo` | `production.ironMiner.blocked.notEnoughOre` | player | kein Kostenabzug, kein ProductionTask |

`debug.command.rejected` enthaelt mindestens:

```text
details.commandType
details.reason
```

Weitere Zielinformationen wie `robotId`, `buildingId`, `programId`, `x`, `y`, `speed` oder konkrete unbekannte IDs werden aufgenommen, wenn sie aus dem Command-Payload sicher bekannt sind.

## ProgramCommand-Regeln

Locked Programme dürfen nicht verändert, deaktiviert, gelöscht oder verschoben werden.

Im MVP betrifft das verbindlich:

```text
program.starter.stasisCharge
```

`resetProgramToTemplate` ist ein ProgramCommand. Es darf ein locked Programm nicht ändern. Wenn ein UI-Button für locked Programme sichtbar ist, muss er disabled sein; ein trotzdem eintreffender Command wird mit `programLocked` abgelehnt.

## updateProgram-Validierung

`updateProgram` ist kein freier Code-Upload, kein JSON-Import beliebiger Programmlogik und kein Node-Editor-Import. Der Command darf nur ProgramInstances akzeptieren, die aus einer bestehenden Template-Instanz hervorgehen und deren Änderungen durch die MVP-Edit-Policy freigegeben sind.

### Validierungsreihenfolge

`updateProgram` wird in dieser Reihenfolge geprüft:

```text
1. Command-Form prüfen.
2. Robot anhand robotId finden.
3. ProgramInstance im Stack des Roboters anhand program.id finden.
4. locked prüfen.
5. templateId gegen bestehende ProgramInstance prüfen.
6. Row-Anzahl und RowIds gegen Template/Edit-Policy prüfen.
7. actionId, sensorId, operatorId und ConditionValue-Typen validieren.
8. Parameterwerte gegen erlaubte Werte prüfen.
9. ProgramInstance übernehmen.
```

Bei Ablehnung gilt weiterhin: keine spielrelevante State-Mutation.

### Unveränderliche Felder

Diese Felder dürfen durch `updateProgram` im MVP nicht verändert werden:

```text
templateId
locked
executionLimit-Typ
rows[].id
rows[].then.actionId
Struktur der IF/THEN/STOP-Zeilen
SensorIds
OperatorIds
ConditionValue-Typen
```

Ausnahme: Werte innerhalb bereits vorhandener und freigegebener Parameter dürfen geändert werden, sofern sie in der Edit-Policy erlaubt sind.

### Freigegebene Änderungen

MVP-erlaubt sind nur:

```text
Programmname ändern
enabled ändern, wenn Programm nicht locked ist
freigegebene Action-Parameter ändern
freigegebene Condition-/Stop-Werte ändern, sofern in der Template-Policy erlaubt
```

Im aktuellen MVP sind die fachlichen Zielparameter bewusst eng:

| Template | freigegebene Action-Parameter | erlaubte Werte im MVP |
|---|---|---|
| `template.mineIronOre` | `resourceType` | `ironOre` |
| `template.buildSolarCollector` | `buildingType` | `solarCollector` |
| `template.buildRobotFactory` | `buildingType` | `robotFactory` |
| `template.exploreNearby` | `targetFieldType` | `{ type: "fieldType", value: "ironOre" }` |
| `template.stasisCharge` | keine | locked |

Damit kann die UI die vorbereiteten Templateparameter anzeigen, ohne im MVP neue freie Programmlogik zu erlauben.

### Ablehnungsgründe

`updateProgram` verwendet diese RejectionReasons:

| Fall | reason |
|---|---|
| Command ist syntaktisch ungültig | `invalidCommand` |
| Robot existiert nicht | `robotNotFound` |
| Programm existiert nicht im Stack des Roboters | `programNotFound` |
| Programm ist locked | `programLocked` |
| `templateId`, Row-Struktur, RowIds oder actionId weichen unzulässig ab | `invalidProgramDefinition` |
| Parameterpfad ist nicht freigegeben oder Parameterwert ist nicht erlaubt | `invalidTemplateParameter` |
| unbekannte SensorId | `unknownSensor` |
| unbekannte ActionId | `unknownAction` |
| unbekannte OperatorId | `unknownOperator` |
| ConditionValue passt nicht zum Sensor/Operator oder hat ungültigen Typ | `invalidConditionValue` |

### Spezielle locked-Regel

`template.stasisCharge` ist locked. Ein `updateProgram` für `program.starter.stasisCharge` wird immer mit `programLocked` abgelehnt, auch wenn der Payload inhaltlich identisch wirkt.

### RowId-Regel

Für Starttemplates müssen die stabilen RowIds aus `MVP_STARTER_PROGRAM_ROW_IDS` erhalten bleiben. Eine Änderung von `row.starter.exploreNearby.main` zu einem anderen Wert ist `invalidProgramDefinition`.

### Struktur-Injektionsschutz

Diese Payloads müssen abgelehnt werden:

```text
neue zusätzliche Rows in einem MVP-Starttemplate
Entfernen der Haupt-Row
Austausch von action.mineResource gegen action.buildBuilding
Austausch von sensor.robotStatus gegen unbekannten Sensor
Änderung von targetFieldType auf nicht unterstützten Feldtyp
Änderung von buildingType auf ein Future-Gebäude
```

## Selection-Commands

Selection-Commands ändern nur `GameState.selected`.

Bei Ablehnung bleibt die bisherige Selection unverändert.

## Produktions-Command

`startIronMinerProduction` bleibt der einzige aktive Produktionscommand des MVP.

Nicht prüfen:

```text
freie Leistung >= 40
Startroboter steht neben Roboterfabrik
Roboterfabrik hat Input-Inventar
MaterialRequest vorhanden
Transportroboter verfügbar
```

Freie Leistung wird erst während des `ProductionTask` geprüft. Zu wenig freie Leistung lehnt den Command nicht ab.

## Reset-Command

`resetRun(seed?)` erzeugt einen neuen deterministischen Startzustand.

```text
seed fehlt -> aktueller Seed oder mvp-default
seed ist gültiger nichtleerer String -> dieser Seed wird verwendet
ungültiger Seed -> rejected invalidSeed
```

## Tests

Die Testmatrix enthält Tests für:

```text
CommandResult gilt für alle PlayerCommands
RejectionReasons decken Selection-, Program-, Production- und Reset-Commands ab
rejected Commands mutieren keinen spielrelevanten State
Command-Rejections sind auf `debug.command.rejected` oder einen spezifischen Player-Code gemappt
startIronMinerProduction behaelt seine Produktions-RejectionReasons
updateProgram validiert unbekannte Sensoren/Aktionen/Operatoren/Werte
```


## ID-Erzeugung bei Commands

Akzeptierte Commands, die neue Entities erzeugen, verwenden die Factory-Funktionen aus `docs/03-technical/deterministic-id-generation.md`.

```text
startIronMinerProduction -> createProductionTaskId(...)
resetRun -> statische Initial-IDs
```

Rejected Commands erzeugen keine spielrelevanten IDs und mutieren keinen spielrelevanten State.
