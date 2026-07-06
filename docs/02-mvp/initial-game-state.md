# Initial Game State

## Startzustand zentral definiert

Der MVP-Startzustand ist zentral über eine Factory-Funktion definiert.

```ts
function createInitialGame(seed = "mvp-default"): GameState
```

Dieses Dokument ist der verbindliche Einstiegspunkt für die MVP-Initialisierung.
Andere Dokumente dürfen Details erläutern, aber nicht abweichend definieren.

## Problem

Vor v49 waren Startwerte über mehrere Dokumente verteilt:

```text
Map-Generator
MVP-Regeln
Roboterdefinitionen
Gebäude-/Bau-Regeln
Programm-Templates
Score-Regeln
UI-State
Eventlog
Future-Felder
```

Dadurch war nicht zentral klar:

```text
Welche Karte wird initial erzeugt?
Welche Felder sind sichtbar?
Wo steht der Startroboter?
Welche Batterie hat er?
Welches Cargo hat er?
Welche Programme sind im Stack?
Gibt es Startgebäude?
Wie ist der Score?
Welche UI-Auswahl ist aktiv?
Welche Eventlog-Einträge gibt es?
Welche Future-Felder sind leer?
```

## Kanonische Factory

```ts
function createInitialGame(seed = "mvp-default"): GameState {
  const map = generateMvpMap(seed);
  const starterRobot = createStarterRobot();
  applyInitialVisibility(map, starterRobot);

  return {
    tick: 0,
    randomSeed: seed,
    isPaused: false,
    speed: 1,
    map,
    robots: [starterRobot],
    buildings: [],
    selected: { type: "robot", id: "robot.starter" },
    eventLog: createInitialEventLog(),
    score: createInitialScore(),
    mvpGoalReached: false,
    materialRequests: [],
  };
}
```

## Initialer GameState

Verbindlicher Startzustand:

```ts
const INITIAL_GAME_STATE: GameState = {
  tick: 0,
  randomSeed: "mvp-default",
  isPaused: false,
  speed: 1,
  map: generateMvpMap("mvp-default"),
  robots: [starterRobot],
  buildings: [],
  selected: { type: "robot", id: "robot.starter" },
  eventLog: [initialLandingEvent],
  score: initialScore,
  mvpGoalReached: false,
  materialRequests: [],
};
```

## Startkarte

Verbindliche Kartenwerte:

```text
Kartengröße: 10x10
Seed: mvp-default
Startposition: { x: 5, y: 5 }
starterSightRange: 2
Iron-Ore-Felder: 20
Iron Ore pro Feld: 20
```

Map-Erzeugung:

```ts
map = generateMvpMap(seed)
```

Die Referenzwerte fuer `generateMvpMap("mvp-default")` stehen in `docs/03-technical/pathfinding-and-map-generation.md`.

Fallback:

```text
Wenn prozedurale Ore-Platzierung fehlschlägt,
werden MVP_FALLBACK_IRON_ORE_FIELDS verwendet.
```

## Initiale Sicht

Nach Erzeugung der Karte wird Sicht anhand des Startroboters gesetzt.

```text
visible: Felder im Radius 2 um Startroboter
unknown: alle anderen Felder
discovered: keine
```

Zu Spielstart gibt es keine `discovered`-aber-nicht-`visible` Felder.

```ts
function applyInitialVisibility(map: Field[][], starterRobot: Robot): void {
  for each field in map:
    if distance(field, starterRobot) <= starterRobot.sightRange:
      field.visibility = "visible";
    else:
      field.visibility = "unknown";
}
```

Für den MVP ist die Sichtdistanz feldbasiert und deterministisch. Keine Zufallskomponente.

## Startroboter

Kanonischer Startroboter:

```ts
const starterRobot: Robot = {
  id: "robot.starter",
  name: "Starter",
  type: "starterRobot",
  tier: 0,
  role: "allrounder",
  movementType: "ground",
  communicationMode: "autonomous",
  communicationStatus: "connected",
  x: 5,
  y: 5,
  hp: { current: 100, max: 100 },
  battery: 100,
  batteryMax: 100,
  chargingMode: "selfCharging",
  cargo: {
    used: {},
    capacity: 10,
  },
  sightRange: 2,
  status: "active",
  canRepair: false,
  activeTask: undefined,
  activeProgram: undefined,
  programStack: createStarterProgramStack(),
};
```

Wichtig:

```text
Der Startroboter startet ohne Iron Ore im Cargo.
```

Die 5 Iron Ore für den Iron Miner müssen durch Mining im Spielverlauf entstehen.

## Start-Programmstack

Verbindlicher MVP-Startstack :

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

Technische Templates:

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

`Stasis-Laden`:

```text
locked = true
enabled = true
nicht löschbar
nicht deaktivierbar
immer letzter Stack-Eintrag
```

## createStarterProgramStack

```ts
function createStarterProgramStack(): ProgramInstance[] {
  return [
    createProgramInstanceFromTemplate("template.mineIronOre"),
    createProgramInstanceFromTemplate("template.buildSolarCollector"),
    createProgramInstanceFromTemplate("template.buildRobotFactory"),
    createProgramInstanceFromTemplate("template.exploreNearby"),
    createProgramInstanceFromTemplate("template.stasisCharge"),
  ];
}
```

Die erzeugten ProgramInstance-IDs sind stabil und deterministisch.

Empfohlene IDs:

```text
program.starter.mineIronOre
program.starter.buildSolarCollector
program.starter.buildRobotFactory
program.starter.exploreNearby
program.starter.stasisCharge
```

Stabile ProgramRow-IDs v73:

```text
row.starter.mineIronOre.main
row.starter.buildSolarCollector.main
row.starter.buildRobotFactory.main
row.starter.exploreNearby.main
row.starter.stasisCharge.main
```

Regel:

```text
createStarterProgramStack() muss fuer jede initiale MVP-ProgramInstance mindestens die kanonische `.main`-Row mit der oben definierten ProgramRowId erzeugen.
ProgramRowIds muessen deterministisch sein und duerfen nicht per Date.now(), Math.random() oder crypto.randomUUID() erzeugt werden.
```

## Startgebäude

```ts
buildings: []
```

Es gibt keine Startgebäude.

Begründung:

```text
Solar Collector und Roboterfabrik sollen vom Startroboter gebaut werden.
```

## Start-Cargo

```ts
cargo: {
  used: {},
  capacity: 10,
}
```

Nicht erlaubt:

```text
5 Iron Ore im Startcargo
```

Dadurch bleibt Mining ein notwendiger Teil des MVP-Ablaufs.

## Start-Score

```ts
const initialScore: ScoreState = {
  minedIronOre: 0,
  builtSolarCollectors: 0,
  builtRobotFactories: 0,
  builtBuildings: 0,
  spawnedRobots: 0,
  elapsedTicks: 0,
  goalBonusAwarded: false,
  totalScore: 0,
};
```

Regel:

```text
Score startet bei 0.
mvpGoalReached startet false.
```

Gebäudezähler-Regel :

```text
builtSolarCollectors = 0
builtRobotFactories = 0
builtBuildings = builtSolarCollectors + builtRobotFactories = 0
```

## Start-UI

Im MVP enthält `GameState.selected` die aktive Auswahl.

```ts
selected: { type: "robot", id: "robot.starter" }
```

`UiState` ist Frontend-State und wird nicht als kanonischer Spielzustand serialisiert.

Initialer UI-Lokalzustand:

```ts
const initialUiState: UiState = {
  selected: { type: "robot", id: "robot.starter" },
  openEditorProgramId: undefined,
  editedProgramDraft: undefined,
  diagnosticsExpanded: false,
};
```

Regel:

```text
GameState.selected ist die kanonische Spielauswahl.
UiState ist UI-lokal.
Es darf keine zweite konkurrierende kanonische Selektionsquelle geben.
```

## Start-Eventlog

Der Startzustand enthält genau einen initialen Player-Event. Die kanonische Eventform folgt `GameEvent` aus `docs/03-technical/canonical-data-model.md`.

```ts
const initialLandingEvent: GameEvent = {
  id: "event.initialLanding",
  tick: 0,
  visibility: "player",
  severity: "info",
  priority: "normal",
  category: "system",
  code: "system.initialLanding",
  message: "Startroboter gelandet.",
  robotId: "robot.starter"
};
```

Minimalregel:

```text
eventLog enthält bei Tick 0 den initialen Landungs-Event mit id = event.initialLanding und code = system.initialLanding.
```

## Future-Felder

Alle vorbereiteten, nicht aktiven Systeme starten leer.

```ts
materialRequests: []
```

Für den aktuellen MVP gibt es keine initialen:

```text
researchState
enemyState
logisticsState
```

Falls solche Felder später ergänzt werden, müssen sie leer oder nicht vorhanden sein, solange das jeweilige System nicht MVP-aktiv ist.

## Determinismus

```text
Gleicher Seed erzeugt gleichen Startzustand.
```

Das bedeutet:

```text
generateMvpMap(seed) ist deterministisch
Programm-IDs sind deterministisch oder stabil erzeugt
ProgramRow-IDs sind stabil erzeugt
Fallback-Ore-Felder sind fest
Event-ID fuer Start-Event ist stabil
Runtime-IDs folgen `docs/03-technical/deterministic-id-generation.md`
```

Nicht verwenden für initiale MVP-State-Bestandteile:

```ts
Math.random()
Date.now()
crypto.randomUUID()
```

## Zentrale Factory-Funktionen

Verbindlich:

```ts
function createInitialGame(seed = "mvp-default"): GameState
function createStarterRobot(): Robot
function createStarterProgramStack(): ProgramInstance[]
```

Empfohlen:

```ts
function createInitialScore(): ScoreState
function createInitialEventLog(): GameEvent[]
function applyInitialVisibility(map: Field[][], starterRobot: Robot): void
```

## Akzeptanzkriterium

Eine Implementierung erfüllt dieses Kriterium, wenn sie den Startzustand ausschließlich aus diesem Dokument erzeugen kann.

Akzeptanz:

```text
createInitialGame("mvp-default") erzeugt tick = 0.
Karte ist 10x10.
randomSeed = "mvp-default".
Startroboter steht auf { x: 5, y: 5 }.
Startroboter hat battery = 100.
Startroboter hat cargo.used = {}.
Startroboter hat sightRange = 2.
Felder im Radius 2 sind visible.
Alle übrigen Felder sind unknown.
Es gibt keine discovered Felder zu Spielstart.
buildings = [].
selected = { type: "robot", id: "robot.starter" }.
programStack enthält exakt 5 Programme in definierter Reihenfolge.
template.secureEnergy ist nicht enthalten.
Stasis-Laden ist locked, enabled und letzter Stack-Eintrag.
eventLog enthält initialen Landungs-Event bei Tick 0.
score.totalScore = 0.
mvpGoalReached = false.
materialRequests = [].
```

## Designregel

```text
Der MVP-Startzustand wird zentral über createInitialGame(seed) definiert.
Andere Dokumente referenzieren diese Factory und dürfen keine abweichenden Startwerte einführen.
```

## Startposition und initiale Sicht

Die zentrale Startzustandsdefinition verwendet verbindlich:

```ts
const MVP_START_POSITION: FieldCoord = { x: 5, y: 5 };
```

Koordinatenlogik:

```text
0-basierte Koordinaten
gültige x-Werte bei 10x10: 0..9
gültige y-Werte bei 10x10: 0..9
Ursprung oben links
x wächst nach rechts
y wächst nach unten
map[y][x]
```

`{ x: 5, y: 5 }` ist eines der vier zentralen Felder der 0-basierten 10x10-Karte. Es ist das verbindliche MVP-Startfeld, aber nicht als mathematisch exakte Mitte zu bezeichnen.

Initiale Sicht bei `starterSightRange = 2`:

```text
x = 3..7
y = 3..7
```

Zu Spielstart:

```text
visible: Felder im Chebyshev-Radius 2 um { x: 5, y: 5 }
unknown: alle übrigen Felder
discovered: keine
```

Das Startfeld ist immer:

```text
plains
ressourcenfrei
gebäudefrei
durch Startroboter belegt
```

## Initiales Eventlog

`createInitialGame(seed)` erzeugt zu Tick 0 ein Player Event:

```ts
{
  id: "event.initialLanding",
  tick: 0,
  visibility: "player",
  severity: "info",
  priority: "normal",
  category: "system",
  code: "system.initialLanding",
  message: "Startroboter gelandet.",
  robotId: "robot.starter"
}
```

Regel:

```text
Tests prüfen `id = "event.initialLanding"` und `code = "system.initialLanding"`.
```

## Startroboter-Typ

Der initiale MVP-Startzustand verwendet ausschließlich:

```text
robot.type = starterRobot
```

Nicht zulässig:

```text
robot.type = standardRobot
```

Regel:

```text
standardRobot ist kein kanonischer RobotType und darf im Startzustand nicht vorkommen.
```

## Start-Forschungszustand (Expansion 1)

```ts
const initialResearch: ResearchState = {
  activeProjectId: undefined,
  progress: {},
  completedProjects: [],
};
```

Der Startzustand enthaelt kein KI-Forschungszentrum und keinen Forschungsfortschritt.

## Abgrenzung: Iron-Miner-Spawnwerte

Der Iron Miner ist nicht Teil des initialen GameState. Er entsteht erst durch erfolgreichen Spawn nach Produktionsabschluss.

Seine Spawnwerte sind kanonisch definiert in:

```text
docs/03-technical/mvp-constants.md (u. a. battery = 50, batteryMax = 100, hp = 100/100, cargo.capacity = 10, sightRange = 2)
docs/04-systems/production-and-spawn.md (vollstaendige Spawn-Entity)
```

Dieses Dokument definiert dafuer keine eigenen Werte.
