# Scoring und Siegbedingungen

Kanonische TypeScript-Typdefinitionen stehen in `docs/03-technical/canonical-data-model.md`. Dieses Dokument beschreibt die Score- und Zielregeln.
## MVP-Ziel

```text
Erster Iron Miner erfolgreich gespawnt
→ MVP-Ziel erreicht
```

## Zeitlimit

- 600 Ticks
- 10 Minuten bei 1 Tick/Sekunde

## Score

```text
+1 Punkt pro abgebauter Iron-Ore-Einheit
+25 Punkte pro gebautem Solar Collector
+50 Punkte pro gebauter Roboterfabrik
+100 Punkte pro gespawntem Roboter
+200 Punkte Zielbonus, wenn der erste Iron Miner erfolgreich gespawnt wurde
```

## Ergebnisübersicht

- Score
- abgebautes Iron Ore
- gebaute Solar Collectors
- gebaute Roboterfabriken
- gespawnte Roboter
- MVP-Ziel erreicht: Ja/Nein

## MVP-Sackgasse im Programmablauf

Die MVP-Sackgasse im Programmablauf wird durch die aktuelle Stack-Regel vermieden.

Kernentscheidungen:

```text
Energie sichern ist nicht mehr Teil des MVP-Startroboter-Stacks.
Stasis-Laden ist die einzige harte Energiesicherung.
Erkunden hat für den Startroboter keine Batterie-Mindestbedingung.
Erkunden stoppt erst, wenn Iron Ore angrenzend ist oder der Roboter in Stasis fällt.
scoutNearby steuert sichtbares, aber nicht angrenzendes Iron Ore intern an.
```

Neuer MVP-Startroboter-Stack:

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

Hauptdokumente:

```text
docs/03-technical/program-stack-rules.md
docs/02-mvp/mvp-template-spec.md
```

## Iron-Miner-Score und Zielzeitpunkt

Für den Iron Miner gilt:

```text
Produktionsstart allein gibt keine Punkte.
readyToSpawn gibt keine Punkte.
Spawn blockiert gibt keine Punkte.
```

Score und MVP-Ziel werden erst nach erfolgreichem Spawn ausgelöst:

```text
+100 für gespawnten Iron Miner
+200 Zielbonus, wenn erster zusätzlicher Roboter erfolgreich gespawnt wurde
mvpGoalReached = true
```

Damit ist der MVP erst erfüllt, wenn der Iron Miner tatsächlich auf einem freien Ausgabefeld erscheint.

## UI-Command und Zielwertung

`startIronMinerProduction` startet nur den ProductionTask.

Keine dieser Aktionen vergibt Score:

```text
Button-Klick
Command accepted
ProductionTask erstellt
ProductionTask readyToSpawn
```

Score und MVP-Ziel werden erst nach erfolgreichem Spawn gesetzt.

## Startzustand zentral definiert

Der MVP-Startzustand ist zentral definiert in:

```text
docs/02-mvp/initial-game-state.md
```

Kanonische Factory:

```ts
function createInitialGame(seed = "mvp-default"): GameState
```

Startzustand:

```text
tick = 0
randomSeed = "mvp-default"
map = generateMvpMap(seed)
Startroboter bei { x: 5, y: 5 }
Startroboter battery = 100
Startroboter cargo.used = {}
Startroboter sightRange = 2
buildings = []
selected = { type: "robot", id: "robot.starter" }
Score = 0
mvpGoalReached = false
materialRequests = []
```

Startstack:

```text
1. template.mineIronOre
2. template.buildSolarCollector
3. template.buildRobotFactory
4. template.exploreNearby
5. template.stasisCharge
```

Nicht enthalten:

```text
template.secureEnergy
```

## Score-Regeln Spawn vs. Produktion

Score und MVP-Ziel sind ausschließlich an den erfolgreichen Spawn einer `ironMiner`-Robot-Entity gebunden.

## Kanonische Entscheidung

```text
Ein Iron Miner zählt für Score und MVP-Ziel erst, wenn eine Robot-Entity vom Typ ironMiner erfolgreich in GameState.robots eingefügt wurde.
```

Nicht ausreichend:

```text
startIronMinerProduction accepted
Produktionskosten bezahlt
ProductionTask gestartet
ProductionTask remainingTicks = 0
ProductionTask readyToSpawn
ProductionTask spawnBlocked
```

Nur der erfolgreiche Spawn zählt.

## Zustandskette

```text
1. startIronMinerProduction accepted
2. 5 Iron Ore werden aus Startroboter-Cargo abgezogen
3. ProductionTask wird erstellt
4. ProductionTask läuft bei ausreichender Leistung
5. remainingTicks erreicht 0
6. ProductionTask wird readyToSpawn
7. Spawn-Feld wird geprüft
8a. freies Spawn-Feld vorhanden:
    Iron Miner wird in GameState.robots eingefügt
    ProductionTask wird entfernt
    Score wird aktualisiert
    mvpGoalReached wird gesetzt
8b. kein freies Spawn-Feld:
    ProductionTask bleibt spawnBlocked
    kein Score
    mvpGoalReached bleibt false
```

## Score-Zeitpunkte

| Ereignis | Score? | MVP-Ziel? | Event |
|---|---:|---:|---|
| `startIronMinerProduction` accepted | nein | nein | `production.ironMiner.started` |
| Produktionskosten abgezogen | nein | nein | optional/debug |
| `ProductionTask` läuft | nein | nein | optional/debug |
| Produktion pausiert wegen Energie | nein | nein | `production.ironMiner.paused.insufficientPower` |
| `remainingTicks = 0` | nein | nein | optional/debug |
| `readyToSpawn` | nein | nein | optional/debug |
| `spawnBlocked` | nein | nein | `production.ironMiner.spawnBlocked` |
| Iron Miner erfolgreich gespawnt | ja | ja | `production.ironMiner.spawned`, `goal.mvpReached` |

## ScoreState-Präzisierung

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
```

Regeln:

```text
minedIronOre zählt erfolgreich aufgenommene Iron-Ore-Einheiten.
builtSolarCollectors zählt erfolgreich fertiggestellte Gebäude mit type = solarCollector.
builtRobotFactories zählt erfolgreich fertiggestellte Gebäude mit type = robotFactory.
builtBuildings ist der aggregierte Gebäudezähler und entspricht builtSolarCollectors + builtRobotFactories.
spawnedRobots zählt erfolgreich gespawnte Roboter.
Nicht gestartete Produktionen.
Nicht abgeschlossene ProductionTasks.
Nicht spawnBlocked ProductionTasks.
```

Gebäude zählen erst, wenn ein `BuildingTask` erfolgreich abgeschlossen wird und das Gebäude von `status = construction` zu `status = active` wechselt. Fortgesetzte Baustellen, bereits aktive Gebäude, deaktivierte Gebäude, Sichtupdates oder Produktionsstatusänderungen dürfen die Gebäudezähler nicht erneut erhöhen.

Punktevergabe für Gebäude:

```text
solarCollector active geworden: builtSolarCollectors += 1, builtBuildings += 1, totalScore += 25
robotFactory active geworden: builtRobotFactories += 1, builtBuildings += 1, totalScore += 50
```

Der kanonische Begriff für Roboterwertung ist `spawnedRobots`. Begriffe wie `producedRobots` sind für den MVP nicht kanonisch.

## Spawn-Erfolg

Ein Spawn gilt als erfolgreich, wenn alle Bedingungen erfüllt sind:

```text
ProductionTask.status = readyToSpawn oder spawnBlocked
robotType = ironMiner
freies orthogonal angrenzendes Spawn-Feld existiert
Robot-Entity wird erstellt
Robot-Entity wird in GameState.robots eingefügt
ProductionTask wird entfernt
```

Erst danach:

```text
score.spawnedRobots += 1
mvpGoalReached = true
goalBonusAwarded = true, falls vorher false
production.ironMiner.spawned erzeugen
goal.mvpReached erzeugen, falls vorher false
```

## SpawnBlocked ist kein Erfolg

```text
spawnBlocked ist kein Erfolg.
```

```text
Wenn kein freies Ausgabefeld existiert:
  ProductionTask.status = spawnBlocked
  blockedReason = noFreeOutputField
  remainingTicks bleibt 0
  ProductionTask bleibt erhalten
  kein Score
  mvpGoalReached bleibt false
```

Wenn später ein Feld frei wird:

```text
Spawn-Prüfung erneut ausführen.
Bei Erfolg erst dann Score und MVP-Ziel vergeben.
```

## Zielbonus nur einmal

Beim ersten erfolgreichen Iron-Miner-Spawn:

```text
mvpGoalReached = true
goalBonusAwarded = true
Zielbonus vergeben
goal.mvpReached erzeugen
```

Bei weiteren Iron-Miner-Spawns:

```text
spawnedRobots erhöhen
kein erneuter Zielbonus
goal.mvpReached nicht erneut erzeugen
```

## Invariante

```ts
const hasSpawnedIronMiner = state.robots.some(
  robot => robot.type === "ironMiner"
);
```

Für den MVP gilt:

```text
mvpGoalReached darf erst true werden, nachdem mindestens ein Iron Miner gespawnt wurde.
```

Nach Zielerreichung darf `mvpGoalReached` historisch true bleiben, selbst wenn der Iron Miner später zerstört würde. Für den MVP ist der erfolgreiche Spawn der Zielmoment.

## Akzeptanzkriterium

```text
accepted startIronMinerProduction setzt keinen Score.
accepted startIronMinerProduction setzt mvpGoalReached nicht true.
ProductionTask.remainingTicks = 0 setzt keinen Score.
ProductionTask.readyToSpawn setzt mvpGoalReached nicht true.
ProductionTask.spawnBlocked setzt keinen Score.
ProductionTask.spawnBlocked setzt mvpGoalReached nicht true.
Nur erfolgreicher Spawn einer Robot-Entity vom Typ ironMiner erhöht spawnedRobots.
Nur erfolgreicher Spawn einer Robot-Entity vom Typ ironMiner kann goal.mvpReached erzeugen.
goalBonusAwarded verhindert mehrfachen Zielbonus.
```

## Score-RobotType

Für Score und MVP-Ziel zählt nur der erfolgreiche Spawn einer Robot-Entity mit:

```text
robot.type = ironMiner
```

Nicht gültig:

```text
robot.type = standardRobot
```

Regel:

```text
standardRobot kann keinen MVP-Zielstatus auslösen, weil es kein kanonischer RobotType ist.
```
