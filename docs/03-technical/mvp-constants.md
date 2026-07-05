# MVP-Konstanten

Diese Datei sammelt die aktuell verbindlichen MVP-Werte. Fachsysteme dürfen diese Werte erklären, aber nicht abweichend definieren.

## Zeit

```ts
const MVP_TICK_SECONDS = 1;
const MVP_TIME_LIMIT_TICKS = 600; // 10 Minuten bei 1 Tick/Sekunde
```

Das Zeitlimit ist für Scoring und Vergleichbarkeit relevant. Es blockiert die technische Simulation nicht, solange kein expliziter Abbruchmodus implementiert wird.


## Seeded RNG

```ts
const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;
const MULBERRY32_INCREMENT = 0x6d2b79f5;
const UINT32_SIZE = 0x100000000;
```

Der Algorithmus und die Implementierungsdetails stehen kanonisch in `docs/03-technical/seeded-rng.md`.

## Karte und Startzustand

```ts
const MVP_MAP_WIDTH = 10;
const MVP_MAP_HEIGHT = 10;
const MVP_START_POSITION = { x: 5, y: 5 } as const;
const MVP_STARTER_SIGHT_RANGE = 2;
const MVP_MAP_MAX_GENERATION_ATTEMPTS = 100;
```

```ts
const MVP_IRON_ORE_FIELD_COUNT = 20;
const MVP_IRON_ORE_PER_FIELD = 20;
const MVP_REQUIRED_REACHABLE_IRON_ORE_MIN_DISTANCE = 4;
const MVP_REQUIRED_REACHABLE_IRON_ORE_MAX_DISTANCE = 6;
const MVP_MIN_IRON_ORE_CLUSTER_SIZE = 3;
const MVP_MAX_IRON_ORE_CLUSTER_SIZE = 8;
```

Die beiden Reachable-Distanzkonstanten beschreiben das verpflichtende Zielband fuer mindestens ein erreichbares Iron-Ore-Feld. Sie verbieten nicht jedes naeher liegende Iron-Ore-Feld ausserhalb der initial sichtbaren No-Ore-Zone.

## Starter Roboter

```ts
const MVP_STARTER_BATTERY = 100;
const MVP_STARTER_BATTERY_MAX = 100;
const MVP_STARTER_HP = 100;
const MVP_STARTER_HP_MAX = 100;
const MVP_STARTER_CARGO_CAPACITY = 10;
```

Start-Cargo:

```ts
const MVP_STARTER_INITIAL_CARGO = {} as const;
```

## Iron Miner Spawn-Entity

```ts
const MVP_IRON_MINER_HP = 100;
const MVP_IRON_MINER_HP_MAX = 100;
const MVP_IRON_MINER_BATTERY = 50;
const MVP_IRON_MINER_BATTERY_MAX = 100;
const MVP_IRON_MINER_CARGO_CAPACITY = 10;
const MVP_IRON_MINER_SIGHT_RANGE = 2;
```

Der Iron Miner ist `goalOnly`: Er muss nach Spawn als `Robot`-Entity existieren, muss im MVP aber keine eigene produktive Programmlogik erhalten.

## Gebäudesicht

```ts
const MVP_BUILDING_SIGHT_RANGE = 2;
```

MVP-Gebäude erhalten `sightRange = MVP_BUILDING_SIGHT_RANGE`. Sicht wird nur durch Gebäude erzeugt, wenn `status = active` und `isEnabled = true`. Gebäude in `construction`, `disabled`, `destroyed` oder mit `isEnabled = false` erzeugen keine Sicht.

## Ressourcen und Kosten

```ts
const MVP_SOLAR_COLLECTOR_COST_IRON_ORE = 5;
const MVP_ROBOT_FACTORY_COST_IRON_ORE = 5;
const MVP_IRON_MINER_COST_IRON_ORE = 5;
const MVP_MINIMUM_IRON_ORE_FOR_GOAL = 15;
```

## Aktionen und Tasks

```ts
const MVP_MOVE_TICKS = 1;
const MVP_MOVE_BATTERY_COST = 1;

const MVP_MINING_TICKS = 10;
const MVP_MINING_AMOUNT = 1;
const MVP_MINING_BATTERY_COST = 1;

const MVP_BUILD_TICKS = 10;
const MVP_BUILD_BATTERY_COST = 1;
const MVP_BUILD_CONSTRUCTION_PROGRESS_PER_COMPLETION = 1;
const MVP_BUILDING_CONSTRUCTION_REQUIRED = 1;
```

Batteriekosten werden nur bei erfolgreicher Ausführung abgezogen:

```text
Bewegung: nach erfolgreichem Schritt.
Mining: bei erfolgreichem MiningTask-Abschluss.
Bauen: bei erfolgreichem BuildingTask-Abschluss.
Abbruch: keine Batteriekosten.
```

## Stasis-Laden

```ts
const MVP_STASIS_ENTER_BATTERY = 1;
const MVP_STASIS_TARGET_BATTERY = 50;
const MVP_SELF_CHARGE_RATE = 1;
```

Stasis-Laden ist die einzige aktive Roboter-Lademechanik im MVP. Externe Roboterladung über Gebäudeenergie ist Future.

## Gebäudeenergie und Produktion

```ts
const MVP_SOLAR_COLLECTOR_POWER_PROVIDED = 50;
const MVP_ROBOT_FACTORY_IDLE_POWER_REQUIRED = 0;
const MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED = 40;
const MVP_IRON_MINER_PRODUCTION_TICKS = 10;
```

MVP-Energie ist ein globaler Power-Pool. Sie beeinflusst nur `ProductionTask`-Fortschritt.

## Score

Die fachlichen Score-Regeln sind kanonisch in `docs/04-systems/scoring-and-win-conditions.md` definiert. Diese Konstanten spiegeln die dort festgelegten Werte:

```ts
const MVP_SCORE_MINED_IRON_ORE = 1;
const MVP_SCORE_SOLAR_COLLECTOR_BUILT = 25;
const MVP_SCORE_ROBOT_FACTORY_BUILT = 50;
const MVP_SCORE_ROBOT_SPAWNED = 100;
const MVP_SCORE_GOAL_BONUS = 200;
```

Score und Zielbonus fuer den Iron Miner werden erst nach erfolgreichem Spawn vergeben, nicht bei Produktionsstart, `readyToSpawn` oder `spawnBlocked`.

## Eventlog

```ts
const MVP_EVENTLOG_LIMIT = 200;
const MVP_PLAYER_EVENT_DEDUPE_TICKS = 10;
```

## Kommunikation

```ts
const MVP_COMMUNICATION_GRID_ACTIVE = false;
```
