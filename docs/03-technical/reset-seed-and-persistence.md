# Reset, Seed und Persistenz

## Status

Dieses Dokument ist die kanonische Quelle fuer Reset-, Seed- und Persistenzregeln im MVP.

## ResetCommand

Kanonisch:

```ts
{ type: "resetRun"; seed?: string }
```

## Reset-Regel

```text
resetRun(seed?) erzeugt einen neuen GameState ueber createInitialGame(seed ?? currentSeed ?? "mvp-default").
```

Dabei gilt:

```text
tick = 0
Score = 0
mvpGoalReached = false
goalBonusAwarded = false
eventLog wird neu initialisiert
system.initialLanding wird erzeugt
selected = Startroboter
UI-Drafts werden verworfen
DiagnosticsPanel wird geschlossen oder auf Default gesetzt
```

## Seed-Regeln

```text
gleicher Seed = gleicher Startzustand
gleicher Seed + gleiche Commands = gleicher Simulationsverlauf
```

Spielrelevanter Zufall folgt ausschliesslich `docs/03-technical/seeded-rng.md`. Der `GameState` speichert keinen fortlaufenden RNG-Zustand; Zufallsentscheidungen bilden jeweils einen stabilen Kontext-Seed aus `GameState.randomSeed` und fachlichen Kontextteilen.

Nicht fuer deterministische Startbestandteile verwenden:

```text
Math.random()
Date.now()
crypto.randomUUID()
```

IDs im Initialzustand sind stabil und deterministisch.

## Persistenz

MVP-Regel:

```text
Keine verpflichtende Persistenz.
Kein automatischer Spielstand notwendig.
```

Optional/recommended:

```text
localStorage fuer letzten Seed oder UI-Einstellungen darf vorbereitet werden.
```

Nicht MVP-blockierend:

```text
Savegames
Cloud-Sync
mehrere Spielstaende
Replay-System
```


## Deterministische IDs bei Reset

`resetRun(seed?)` erzeugt die statischen Initial-IDs erneut. Runtime-IDs nach dem Reset werden nach `docs/03-technical/deterministic-id-generation.md` erzeugt.

Gleicher Seed plus gleiche anschliessende Command-Sequenz fuehrt zu denselben IDs fuer Buildings, ProductionTasks, RobotTasks, gespawnte Roboter und GameEvents.
