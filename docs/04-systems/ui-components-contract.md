# UI-Komponentenvertrag MVP

## CommandResult-Vertrag

Jede UI-Aktion, die einen `PlayerCommand` sendet, muss ein `CommandResult` auswerten.

```text
accepted -> UI darf den resultierenden State anzeigen.
rejected -> UI zeigt eine verständliche Rueckmeldung; der vorherige State bleibt unverändert.
```

Die kanonischen Typen stehen in `docs/03-technical/canonical-data-model.md`. Die Command-Matrix steht in `docs/03-technical/player-command-handling.md`.

Pflichtfälle:

```text
Selection-Command rejected -> Selection bleibt unverändert.
Program-Command rejected -> ProgramStack/Draft bleibt unverändert.
Production-Command rejected -> keine Ressourcenänderung, kein ProductionTask.
Reset-Command rejected -> aktueller Run bleibt bestehen.
```

## Status

Dieses Dokument ist der kompakte Implementierungsvertrag fuer die MVP-UI. Die kanonische Datei- und Komponentenstruktur steht in `../03-technical/implementation-module-structure.md`. Dieses Dokument darf UI-Komponenten fachlich beschreiben, aber keine eigene Ordner- oder Modulstruktur vorschlagen.

## Prinzip

```text
UI liest GameState und UiState.
UI sendet PlayerCommands.
UI enthaelt keine Simulationslogik.
```

## Komponenten

### MapCanvas

Liest:

```text
map
robots
buildings
selected
visibility
reservedForConstruction
```

Zeigt:

```text
Terrain
Fog of War
Iron Ore nur bei visible
`fog.unknown` und `fog.discovered` zeigen keine Resource-Fallbacks
Roboter
Gebaeude
Auswahlrahmen
Baureservierungen
Asset-Fallbacks
```

Sendet:

```text
selectRobot
selectBuilding
selectField
```

### BottomControlBar

Zeigt:

```text
Tick
Speed
Pause/Resume
Power Snapshot
MVP-Zielstatus
```

Sendet:

```text
pause
resume
setSpeed
resetRun
```

### SelectionPanel

Zeigt je nach Auswahl:

```text
RobotPanel
BuildingPanel
FieldPanel
```

### RobotPanel

Liest:

```text
selected robot
battery
cargo
status
abgeleiteter RobotActivityState
activeTask
programStack
```

Zeigt:

```text
Name
Typ
Robot.status
Aktivitaet / RobotActivityState
Batterie
Cargo
aktueller Task
Programmstack
```


Regel:

```text
RobotActivityState ist nicht Teil von Robot.status.
Wenn robot.status = active, activeTask fehlt und activeProgram fehlt, zeigt die UI Aktivitaet: idle.
```

### BuildingPanel

Liest:

```text
selected building
status
productionTask
powerRequired
```

Bei Roboterfabrik zeigt:

```text
Button Iron Miner produzieren
Kosten: 5 Iron Ore
Dauer: 10 Ticks
Leistungsbedarf: 40
Produktionsfortschritt
Status insufficientPower
Status spawnBlocked
```

Sendet:

```text
startIronMinerProduction(buildingId)
```

Button wird nicht allein wegen `freePower < 40` deaktiviert.

### ProgramStackPanel

Liest:

```text
selected robot programStack
```

Sendet:

```text
toggleProgramEnabled
moveProgramUp
moveProgramDown
resetProgramToTemplate
```

Stasis-Laden ist locked und nicht deaktivierbar.

### Gebäude-Conditions in der UI

UI-Labels wie `Gebäude existiert Solar Collector mit Status active` werden intern als ein `BuildingQuery` gespeichert. Der Editor darf Gebäudetyp und Status bei diesen Conditions nicht als voneinander unabhängige globale Bedingungen speichern.

```text
Gebäudetyp: Solar Collector
Status: active
=> { type: "buildingQuery", value: { buildingType: "solarCollector", status: "active" } }
```

## ProgramEditorPanel

MVP-Pflicht:

```text
Templates anzeigen
Template-Instanzen editierbar machen
Bausteinparameter anzeigen
```

MVP-Bausteine:

```text
Mine Resource Ziel Iron Ore
Baue Gebaeude Typ Solar Collector / Roboterfabrik
Scoute Nahfeld Ziel Iron Ore
Stasis-Laden
```

Validierung:

```text
Der Editor darf nur freigegebene Template-Parameter editierbar anbieten.
Locked Programme zeigen keine aktiven Speicher-/Editierfelder.
Speichern sendet updateProgram mit stabilen RowIds und unveraenderter actionId/Sensor-/Operatorstruktur.
Bei rejected bleibt der Draft im Editor und der Fehler wird angezeigt.
```

Nicht anbieten:

```text
neue Rows hinzufügen
Rows löschen
actionId ändern
Sensoren/Operatoren frei austauschen
Future-Gebäude oder Future-Feldtypen als Ziel setzen
```

### EventLogPanel

Zeigt:

```text
visibility = player
neueste oben
Tick
Severity
Message
repeatCount
```

### DiagnosticsPanel

Sichtbar, wenn:

```text
diagnosticsExpanded = true
```

Zeigt:

```text
visibility = debug
details
programId
rowId
actionId
reason
```

RowId-Regel:

```text
Fuer Starttemplate-Diagnosen zeigt das Panel stabile IDs wie row.starter.exploreNearby.main.
Die UI darf RowIds nicht aus sichtbaren Listenpositionen ableiten.
```

### ScoreGoalPanel

Zeigt:

```text
minedIronOre
builtSolarCollectors
builtRobotFactories
builtBuildings
spawnedRobots
mvpGoalReached
totalScore
goalBonusAwarded
```

Regel:

```text
builtBuildings = builtSolarCollectors + builtRobotFactories
```

## Testverweise

Relevante Bereiche:

```text
MVP-UI
MVP-EVENT
MVP-ASSET
MVP-GOAL
```


## Build-Fortsetzung

UI-Panels muessen bestehende Baustellen als `construction` anzeigen. Wenn ein Build-Programm eine vorhandene Baustelle fortsetzt, darf die UI keinen neuen Bauauftrag oder zweite Baustelle suggerieren. Mindestanzeige:

```text
Status: Baustelle / construction
Fortschritt: constructionProgress / constructionRequired
Kosten: bezahlt
```

Eine fortgesetzte Baustelle verwendet dieselbe `buildingId`.


## UI-Regel: keine action.charge im MVP-Editor

Der MVP-ProgramEditor bietet nur aktive MVP-Actions an:

```text
action.scoutNearby
action.mineResource
action.buildBuilding
action.stasisCharge
```

`action.charge` darf im MVP-Editor nicht als auswählbare Aktion erscheinen. Stasis-Laden ist ein locked Template und bleibt die einzige aktive MVP-Lademechanik.
