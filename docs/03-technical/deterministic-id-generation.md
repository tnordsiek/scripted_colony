# Deterministische ID-Erzeugung

## Status

Dieses Dokument ist die zentrale Referenz fuer deterministische IDs und fuer die deterministische Runtime-Event-Sequenz im MVP.

## Grundregel

```text
Gleicher vorheriger GameState, gleicher Seed und gleiche PlayerCommands erzeugen dieselben neuen IDs.
```

Nicht erlaubt fuer spielrelevante MVP-IDs:

```text
Math.random()
Date.now()
crypto.randomUUID()
Browser- oder Laufzeit-spezifische Zufallswerte
Array-Index allein als dauerhafte ID
```

Array-Reihenfolgen duerfen nur zur deterministischen Sortierung genutzt werden, nicht als einzige stabile ID-Quelle.

## Betroffene ID-Typen

Diese Regel gilt fuer alle neu erzeugten spielrelevanten IDs:

```text
BuildingId
ProductionTaskId
RobotId fuer gespawnte Roboter
RobotTaskId
GameEventId
ProgramInstanceId und ProgramRowId fuer initiale Templates
```

Prepared/Future-IDs wie `MaterialRequestId` folgen spaeter demselben Prinzip, sind aber nicht MVP-aktiv.

## Kanonische ID-Muster

### Statische Initial-IDs

Diese IDs sind fest und werden nicht aus Sequenzen berechnet:

```text
robot.starter
program.starter.mineIronOre
program.starter.buildSolarCollector
program.starter.buildRobotFactory
program.starter.exploreNearby
program.starter.stasisCharge
row.starter.mineIronOre.main
row.starter.buildSolarCollector.main
row.starter.buildRobotFactory.main
row.starter.exploreNearby.main
row.starter.stasisCharge.main
event.initialLanding
```

`event.initialLanding` ist die stabile feste ID des initialen Start-Events bei Tick 0.

### BuildingId

Muster:

```text
building.<buildingType>.<seq3>
```

Beispiele:

```text
building.solarCollector.001
building.robotFactory.001
```

Sequenzregel:

```text
seq3 = Anzahl bereits im GameState vorhandener Buildings desselben Typs + 1
```

Destroyed Buildings bleiben im MVP im `GameState.buildings` erhalten und zaehlen daher weiter mit. Es gibt im MVP kein Loeschen von Buildings, das ID-Sequenzen wieder freigibt.

### ProductionTaskId

Muster:

```text
production.<robotType>.<buildingId>.<seq3>
```

MVP-Beispiel:

```text
production.ironMiner.building.robotFactory.001.001
```

Sequenzregel fuer den MVP:

```text
seq3 = Anzahl bereits erfolgreich gespawnter Iron Miner + Anzahl aktuell vorhandener Iron-Miner-ProductionTasks + 1
```

Da im MVP pro Roboterfabrik nur ein ProductionTask gleichzeitig laufen darf und ProductionTasks nicht abgebrochen werden, bleibt diese Sequenz deterministisch. Ein spawnBlocked Task bleibt vorhanden und verhindert einen zweiten gleichzeitigen Task.

### SteelProductionTaskId (Expansion 1)

Muster:

```text
production.steelPlates.<buildingId>.<seq3>
```

Sequenzregel: `seq3 = bereits produzierte Steel Plates dieses Gebaeudes + aktive Auftraege + 1`.
Der Lebenszeitzaehler liegt in `building.inventory.output.steelPlates` und erhoeht sich
pro abgeschlossenem Auftrag (in Expansion 1 reiner Zaehler; Logistik-Abholung ist Future).

### RobotId fuer gespawnte Roboter

Muster:

```text
robot.<robotType>.<seq3>
```

MVP-Beispiel:

```text
robot.ironMiner.001
```

Sequenzregel:

```text
seq3 = Anzahl bereits in GameState.robots vorhandener Roboter desselben Typs + 1
```

Der Starter benutzt die feste ID `robot.starter` und zaehlt nicht als gespawnter Iron Miner. Ein Iron Miner erhaelt seine ID erst beim erfolgreichen Spawn, nicht beim ProductionTask-Start und nicht bei `readyToSpawn`.

### RobotTaskId

Muster:

```text
task.<robotId>.<tick6>.<taskType>.<seq2>
```

Beispiele:

```text
task.robot.starter.000012.movement.01
task.robot.starter.000027.building.01
```

Sequenzregel:

```text
seq2 = laufende Nummer der im selben Tick fuer denselben Roboter erzeugten Tasks
```

Im MVP startet ein Roboter hoechstens einen neuen Task pro Tick. Trotzdem ist `seq2` Teil des Musters, damit die Regel future-sicher und testbar bleibt.

### GameEventId

Muster fuer Runtime-Events:

```text
event.<tick6>.<seq3>.<code>
```

Beispiele:

```text
event.000012.001.action.build.started
event.000022.002.production.ironMiner.spawned
```

Sequenzregel:

```text
seq3 = laufende Nummer der neuen, nicht deduplizierten Runtime-Events nach der kanonischen Event-Sequenz innerhalb desselben Ticks
```

Die Event-Sequenz ist in diesem Dokument verbindlich definiert. Debug- und Player-Events nutzen dasselbe ID-Muster. Deduplizierung von Player-Events darf keine nicht-deterministische neue ID erzeugen; bei Deduplizierung wird der bestehende Event-Eintrag aktualisiert und kein neuer `seq3`-Slot verbraucht.


## Deterministische Event-Sequenz innerhalb eines Ticks

Runtime-Events werden waehrend der Tick-Pipeline als Event-Kandidaten erzeugt. Die finale `seq3` wird erst vergeben, nachdem alle Event-Kandidaten des Ticks gesammelt und nach der kanonischen Reihenfolge sortiert wurden.

Grundregel:

```text
Gleicher vorheriger GameState + gleiche PlayerCommands + gleicher Seed = gleiche Event-Kandidaten, gleiche Sortierung, gleiche GameEventIds.
```

### Sortierschluessel

Event-Kandidaten werden vor Deduplizierung und ID-Vergabe nach folgendem Tupel sortiert:

```text
1. pipelineStepOrder
2. sourceOrder innerhalb des Pipeline-Schritts
3. entitySortKey
4. eventCodeOrder
5. localSequence
```

#### 1. pipelineStepOrder

`pipelineStepOrder` entspricht der kanonischen Tick-Pipeline aus `docs/03-technical/tick-pipeline.md`.

```text
1 = PlayerCommands validieren und anwenden
2 = EnergySnapshot berechnen
3 = ProductionTasks verarbeiten
4 = Spawn-Pruefungen ausfuehren
5 = Laufende RobotTasks verarbeiten
6 = abgeschlossene oder abgebrochene RobotTasks anwenden
7 = Sicht und Fog-of-War aktualisieren
8 = ProgramStacks fuer freie aktive Roboter auswerten
9 = Score und MVP-Ziel aktualisieren
10 = Events sammeln, sortieren, normalisieren und deduplizieren
```

Schritt 10 erzeugt normalerweise keine neuen Spielereignisse, sondern sortiert und finalisiert Kandidaten aus den vorherigen Schritten. Falls ein Diagnoseevent direkt beim Normalisieren entsteht, nutzt es `pipelineStepOrder = 10`.

#### 2. sourceOrder innerhalb des Pipeline-Schritts

Innerhalb eines Pipeline-Schritts gilt:

```text
PlayerCommands: Eingabereihenfolge im Command-Batch
Buildings/ProductionTasks: BuildingId, danach ProductionTaskId
Spawn-Pruefungen: ProductionTaskId
RobotTasks: RobotId
ProgramStack-Auswertung: RobotId, dann ProgramStack-Reihenfolge, dann ProgramRow-Reihenfolge
Sicht/Fog: Koordinate nach y, dann x
Score/Ziel: feste Reihenfolge scoreUpdates vor goalEvents
Assets/Rendering-Diagnose: AssetKey lexikografisch
```

Alle Listen muessen vor der Verarbeitung stabil sortiert sein, wenn ihre gespeicherte Array-Reihenfolge nicht bereits kanonisch definiert ist.

#### 3. entitySortKey

Der `entitySortKey` wird aus der stabilen ID der verursachenden Entitaet gebildet:

```text
robot:<robotId>
building:<buildingId>
production:<productionTaskId>
program:<programId>:<rowId>
field:<yyyy>:<xxxx>
command:<commandIndex3>
goal:mvp
system:global
asset:<assetKey>
```

Fuer Felder werden y und x nullgepadded, z. B. `field:0005:0007`.

#### 4. eventCodeOrder

`eventCodeOrder` folgt der Reihenfolge der kanonischen `GameEventCode`-Union in `docs/03-technical/canonical-data-model.md`.

Tests duerfen alternativ pruefen, dass eine Implementierung eine feste explizite Event-Code-Prioritaetsliste verwendet, die dieselbe Reihenfolge abbildet. Freie lexikografische Sortierung von Codes ist nur zulaessig, wenn sie explizit als identisch zur kanonischen Liste getestet wird.

#### 5. localSequence

`localSequence` ist eine laufende Nummer innerhalb desselben deterministischen Handlers, beginnend bei 1. Sie darf nicht aus Zeit, Zufall oder nicht deterministischer Laufzeitreihenfolge abgeleitet werden.

### Deduplizierung und ID-Vergabe

Ablauf in Schritt 10:

```text
1. Event-Kandidaten sammeln.
2. Kandidaten nach dem kanonischen Sortierschluessel sortieren.
3. Player-Event-Deduplizierung anwenden.
4. Fuer jeden verbleibenden neuen Runtime-Event fortlaufend seq3 ab 001 vergeben.
5. GameEvent.id mit createGameEventId(tick, seq3, code) setzen.
6. Eventlog-Limit anwenden.
```

Deduplizierte Player Events behalten ihre vorhandene ID und erhalten keine neue Sequenznummer. Debug Events werden nicht dedupliziert, ausser ein Test oder Dev-Modus definiert ausdruecklich eine zusaetzliche lokale Debug-Filterung ausserhalb des kanonischen `GameState.eventLog`.

### Beispiel

Wenn in Tick 120 zuerst ein `production.ironMiner.spawned`-Event und danach durch die Score-/Zielregel ein `goal.mvpReached`-Event entsteht, ist die kanonische Reihenfolge:

```text
event.000120.001.production.ironMiner.spawned
event.000120.002.goal.mvpReached
```

Der Goal-Event darf nicht vor dem Spawn-Event sequenziert werden, weil das MVP-Ziel erst nach erfolgreichem Einfuegen der `ironMiner`-Robot-Entity erreicht ist.

## Kanonische Factory-Funktionen

Empfohlene Implementierungsfunktionen:

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

Alle Factory-Funktionen muessen pure Funktionen sein. Sie duerfen nur ihre Parameter auswerten und keine versteckten globalen Zaehler, Zeitstempel oder Zufallsquellen verwenden.

## Rejected Commands

```text
Rejected Commands erzeugen keine spielrelevanten Entity-IDs, Task-IDs oder Ressourcen-/State-IDs.
```

Wenn eine abgelehnte Command-Verarbeitung ein kanonisches Diagnose-Event erzeugt, verwendet dieses Event wie alle Runtime-Events ein `GameEventId` nach `event.<tick6>.<seq3>.<code>`. Fuer generische Command-Ablehnungen ist der stabile Code `debug.command.rejected` definiert. Eine UI darf zusaetzlich lokal eine nicht persistierte Fehlermeldung anzeigen; diese gehoert nicht in den kanonischen `GameState`.

## Expansion 2: MaterialRequestId und Transporter-Ids

Muster fuer MaterialRequests (aktiv ab Expansion 2):

```text
request.<typ>.<tick6>.<seq2>
```

Beispiele:

```text
request.supplyBuildingInput.000412.01
request.moveToStorage.000415.01
```

Sequenzregel: `seq2` = laufende Nummer der im selben Tick erzeugten Requests desselben
Typs (deterministische Erzeugungsreihenfolge nach Ausloeser-Sortierung).

Gespawnte Transportroboter folgen dem bestehenden Muster:

```text
robot.transportRobot.<seq3>
```

Die zugehoerigen Produktions-Task-Ids folgen dem bestehenden ProductionTask-Muster mit
`robotType = transportRobot`.

## Reset-Regel

`resetRun(seed?)` erzeugt einen neuen deterministischen Startzustand. Dabei entstehen wieder die statischen Initial-IDs:

```text
robot.starter
program.starter.*
row.starter.*.main
event.initialLanding
```

Gleicher Seed erzeugt denselben Startzustand inklusive identischer Initial-IDs.

## Tests

Die Testmatrix enthaelt Pruefungen fuer:

```text
ID-Muster
Verbot von Zufalls-/Zeitquellen
stabile Initial-IDs
BuildingId-Sequenz
ProductionTaskId-Sequenz
Spawned-RobotId-Sequenz
RobotTaskId-Muster
GameEventId-Muster
Event-Sequenz innerhalb eines Ticks
```


## Build-Events

`details.mode` ist Pflichtinhalt von Build-Events, aber nicht Teil des `GameEventId`-Musters oder der Event-Sequenz. Die Event-ID bleibt:

```text
event.<tick6>.<seq3>.<code>
```

Der Modus wird im Event-Payload unter `details.mode` gespeichert.
