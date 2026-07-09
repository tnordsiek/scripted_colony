# MVP Testmatrix

## Status

Dieses Dokument ist das verbindliche Teststeuerungsdokument für den MVP.

Es ist die zentrale Quelle für:

```text
Test-IDs
Testprioritäten
MVP-blockierende Tests
Teststatus
Testkategorien
Definition of Done
Regressionstest-Abdeckung
```

Andere Dokumente dürfen Testideen und Akzeptanzkriterien enthalten. Die verbindliche technische Testliste für den MVP steht hier.

## Verhältnis zu anderen Dokumenten

```text
docs/00-documentation-guideline.md:
  Quellenprioritaet aktiver Dokumente und Dokumentationsregeln.

acceptance-criteria.md:
  Produkt- und Feature-Akzeptanz auf hoher Ebene.

mvp-test-matrix.md:
  testbare technische Umsetzung der Akzeptanz.

implementation-plan.md:
  Umsetzungsphasen und Verweise auf Test-IDs.

action-executability-matrix.md:
  Quelle für Aktionstests.

diagnostics-and-eventlog.md:
  Quelle für Event-/Diagnosetests.
```

## Test-ID-Konvention

Format:

```text
MVP-<BEREICH>-<NUMMER>
```

Beispiele:

```text
MVP-INIT-001
MVP-MAP-004
MVP-ACTION-002
MVP-EVENT-006
```

Regeln:

```text
IDs sind stabil.
IDs werden nicht wiederverwendet.
Entfernte Tests werden als future/deprecated markiert, nicht umnummeriert.
Neue Tests werden hinten angefügt.
```

## Prioritäten

```text
P0:
  MVP-blockierend.
  Muss für einen akzeptierten MVP bestehen.

P1:
  wichtig für Robustheit und Implementierungsqualität.
  Sollte bestehen, bevor der MVP als stabil gilt.

P2:
  Regression, Randfall oder vorbereitete Future-Abdeckung.
  Nicht MVP-blockierend.
```

## Statuswerte

```text
required:
  Muss für MVP bestehen.

recommended:
  Soll bestehen, ist aber nicht hart MVP-blockierend.

future:
  Vorbereitet, aber nicht Teil des MVP-Abnahmekriteriums.

deprecated:
  Historisch vorhanden, nicht mehr gültig.
```

## Testkategorien

```text
Initialisierung
Koordinaten / Karte
Programmstack
Action Executability
Scouting
Mining
Building
Stasis
Produktion / Spawn
UI Commands
Diagnose / Eventlog
Score / Ziel
Regression
Assets / Fallbacks
```

## Definition of Done

Der MVP gilt technisch als implementierbar abgeschlossen, wenn:

```text
alle P0 required Tests bestehen
keine P0 required Tests fehlen
alle bekannten Review-Punkte entweder gelöst oder explizit als future markiert sind
Eventlog und Diagnosen testbare Event-Codes liefern
createInitialGame deterministisch ist
Build-, Mining-, Scout-, Energie- und Produktionspfade durch P0-Tests abgedeckt sind
```

P1-Tests sollten vor einer stabilen MVP-Demo bestehen.

P2-Tests dürfen vorbereitet sein und sind nicht MVP-blockierend.

## Initialisierung

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-INIT-001 | P0 | required | `createInitialGame("mvp-default")` | `tick = 0` | `initial-game-state.md` |
| MVP-INIT-002 | P0 | required | initiale Karte | Karte ist `10x10` | `initial-game-state.md` |
| MVP-INIT-003 | P0 | required | Startroboter | Position `{ x: 5, y: 5 }` | `initial-game-state.md` |
| MVP-INIT-004 | P0 | required | Startroboter | `battery = 100`, `batteryMax = 100` | `initial-game-state.md` |
| MVP-INIT-005 | P0 | required | Startroboter-Cargo | `cargo.used = {}` | `initial-game-state.md` |
| MVP-INIT-006 | P0 | required | Startgebäude | `buildings = []` | `initial-game-state.md` |
| MVP-INIT-007 | P0 | required | Future-Feld | `materialRequests = []` | `initial-game-state.md` |
| MVP-INIT-008 | P0 | required | Auswahl | `selected` zeigt auf `robot.starter` | `initial-game-state.md` |
| MVP-INIT-009 | P0 | required | Eventlog | `system.initialLanding` existiert | `diagnostics-and-eventlog.md` |
| MVP-INIT-010 | P1 | recommended | Determinismus | gleicher Seed erzeugt gleichen Startzustand | `initial-game-state.md` |

## Koordinaten / Karte

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-MAP-001 | P0 | required | gültige Koordinaten | `x = 0..9`, `y = 0..9` | `pathfinding-and-map-generation.md` |
| MVP-MAP-002 | P0 | required | Kartenarray-Zugriff | `map[y][x]` ist kanonisch | `pathfinding-and-map-generation.md` |
| MVP-MAP-003 | P0 | required | Startfeld | `map[5][5]` ist Startfeld | `initial-game-state.md` |
| MVP-MAP-004 | P0 | required | initiale Sicht | sichtbare Felder `x = 3..7`, `y = 3..7` | `initial-game-state.md` |
| MVP-MAP-005 | P0 | required | Startfeld-Terrain | Startfeld ist `plains` | `initial-game-state.md` |
| MVP-MAP-006 | P0 | required | Startfeld-Ressource | Startfeld enthält keine Ressource | `initial-game-state.md` |
| MVP-MAP-007 | P0 | required | Startfeld-Gebäude | Startfeld enthält kein Gebäude | `initial-game-state.md` |
| MVP-MAP-008 | P1 | recommended | Fallback-Ore | Fallback-Ore-Feld `{ x: 9, y: 9 }` ist gültig | `pathfinding-and-map-generation.md` |
| MVP-MAP-009 | P1 | recommended | Sichtzustand | nicht sichtbare Felder sind `unknown` | `initial-game-state.md` |
| MVP-MAP-010 | P1 | recommended | Sichtzustand | zu Spielstart gibt es keine `discovered`-only Felder | `initial-game-state.md` |

## Sicht / Fog of War

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-VIS-001 | P0 | required | Gebäudesicht Solar Collector | `status = active` und `isEnabled = true` deckt Felder im Chebyshev-Radius 2 auf | `buildings-and-construction.md` |
| MVP-VIS-002 | P0 | required | Gebäudesicht Roboterfabrik | `status = active` und `isEnabled = true` deckt Felder im Chebyshev-Radius 2 auf | `buildings-and-construction.md` |
| MVP-VIS-003 | P0 | required | Baustelle ohne Sicht | `status = construction` erzeugt keine Gebäudesicht | `buildings-and-construction.md` |
| MVP-VIS-004 | P1 | recommended | deaktiviertes Gebäude | `isEnabled = false` erzeugt keine Gebäudesicht | `buildings-and-construction.md` |
| MVP-VIS-005 | P1 | recommended | Sichtaktualisierung | Gebäude-Fertigstellung aktualisiert Fog/Visibility ohne lokale Energiezone | `simulation-rules.md` |
| MVP-V71-001 | P0 | required | unknown zu visible | Feld wird `visible`, wenn es erstmals in aktueller Sichtquelle liegt | `pathfinding-and-map-generation.md` |
| MVP-V71-002 | P0 | required | visible zu discovered | zuvor sichtbares Feld wird `discovered`, wenn es nicht mehr in aktueller Sicht liegt | `pathfinding-and-map-generation.md` |
| MVP-V71-003 | P0 | required | discovered zu visible | discovered Feld wird wieder `visible`, wenn es erneut in aktueller Sicht liegt | `pathfinding-and-map-generation.md` |
| MVP-V71-004 | P0 | required | unknown bleibt unknown | nie sichtbares Feld bleibt `unknown`, solange keine Sichtquelle es abdeckt | `pathfinding-and-map-generation.md` |
| MVP-V71-005 | P0 | required | Ressourcenanzeige | Iron Ore wird nur bei `visibility = visible` gerendert; `unknown` und `discovered` verraten keine Ressourcen | `asset-fallbacks.md` |
| MVP-V71-006 | P1 | recommended | Tick-Pipeline | Sichtzustände werden in Schritt 7 der kanonischen Tick-Pipeline aktualisiert | `tick-pipeline.md` |

## Programmstack

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-STACK-001 | P0 | required | Startstack | enthält exakt 5 Programme | `initial-game-state.md` |
| MVP-STACK-002 | P0 | required | Reihenfolge | Mining, Solarbau, Fabrikbau, Erkunden, Stasis | `program-stack-rules.md` |
| MVP-STACK-003 | P0 | required | Secure Energy | `template.secureEnergy` ist nicht im Startstack | `program-stack-rules.md` |
| MVP-STACK-004 | P0 | required | Stasis-Laden | ist `locked`, `enabled` und letzter Stack-Eintrag | `program-stack-rules.md` |
| MVP-STACK-005 | P0 | required | Nicht ausführbar | Aktion führt zum nächsten Programm | `action-executability-matrix.md` |
| MVP-STACK-006 | P0 | required | Task-Ende | Stack-Prüfung beginnt wieder oben | `program-stack-rules.md` |
| MVP-STACK-007 | P1 | recommended | Task läuft | Stack wird während laufendem Task nicht weiter geprüft | `program-stack-rules.md` |
| MVP-STACK-008 | P1 | recommended | Task-Abbruch | Task wird entfernt, Diagnose geschrieben, Stack oben neu geprüft | `program-stack-rules.md` |

## Action Executability

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-ACTION-001 | P0 | required | `scoutNearby` ohne Parameter | `notExecutable: missingParameter` | `action-executability-matrix.md` |
| MVP-ACTION-002 | P0 | required | `mineResource` ohne Parameter | `notExecutable: missingParameter` | `action-executability-matrix.md` |
| MVP-ACTION-003 | P0 | required | `buildBuilding` ohne Parameter | `notExecutable: missingParameter` | `action-executability-matrix.md` |
| MVP-ACTION-004 | P0 | required | `notExecutable` | keine State-Mutation außer Diagnose | `action-executability-matrix.md` |
| MVP-ACTION-005 | P0 | required | `taskAlreadyRunning` | verhindert neue Aktion | `action-executability-matrix.md` |
| MVP-ACTION-006 | P1 | recommended | unsupported MVP target | erzeugt `unsupportedMvpTarget` | `action-executability-matrix.md` |
| MVP-ACTION-007 | P1 | recommended | Roboter in Stasis | normale Aktionen nicht ausführbar | `action-executability-matrix.md` |
| MVP-ACTION-008 | P1 | recommended | Batterie zu niedrig | nicht-Stasis-Aktionen blockieren bei `battery <= 1` | `action-executability-matrix.md` |

## Scouting

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-SCOUT-001 | P0 | required | Scout-Action | `targetFieldType = ironOre` ist gesetzt | `action-executability-matrix.md` |
| MVP-SCOUT-002 | P0 | required | sichtbares, nicht angrenzendes Iron Ore | wird angesteuert | `pathfinding-and-map-generation.md` |
| MVP-SCOUT-003 | P0 | required | kein sichtbares Ziel | unknown Randfeld wird erkundet | `pathfinding-and-map-generation.md` |
| MVP-SCOUT-004 | P0 | required | Ziel-Neubewertung | nach Bewegung neu bewertet | `pathfinding-and-map-generation.md` |
| MVP-SCOUT-005 | P1 | recommended | Gleichstand | seeded deterministic nach `seeded-rng.md` | `pathfinding-and-map-generation.md`, `seeded-rng.md` |
| MVP-SCOUT-006 | P1 | recommended | kein erreichbares Ziel | `notExecutable: noValidScoutTarget` | `action-executability-matrix.md` |
| MVP-SCOUT-007 | P1 | recommended | kein Pfad | Task bricht mit Diagnose ab | `action-executability-matrix.md` |

## Mining

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-MINE-001 | P0 | required | Mining-Action | `resourceType = ironOre` ist gesetzt | `action-executability-matrix.md` |
| MVP-MINE-002 | P0 | required | kein angrenzendes Iron Ore | Mining nicht ausführbar | `action-executability-matrix.md` |
| MVP-MINE-003 | P0 | required | volles Cargo | Mining blockiert | `action-executability-matrix.md` |
| MVP-MINE-004 | P0 | required | Task-Abschluss | Cargo erhält Iron Ore erst bei Abschluss | `resources-and-logistics.md` |
| MVP-MINE-005 | P0 | required | Task-Abbruch | kein Ore-Gewinn | `resources-and-logistics.md` |
| MVP-MINE-006 | P0 | required | erfolgreicher Abbau | `ResourceDeposit.amount` sinkt | `resources-and-logistics.md` |
| MVP-MINE-007 | P1 | recommended | mehrere angrenzende Vorkommen | größtes Deposit, dann seeded random nach `seeded-rng.md` | `action-executability-matrix.md`, `seeded-rng.md` |

## Building

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-BUILD-001 | P0 | required | Solar Collector | wird nahe bauendem Roboter platziert | `buildings-and-construction.md` |
| MVP-BUILD-002 | P0 | required | Roboterfabrik | wird nahe active Solar Collector platziert | `buildings-and-construction.md` |
| MVP-BUILD-003 | P0 | required | Ressourcenfeld | darf nicht bebaut werden | `buildings-and-construction.md` |
| MVP-BUILD-004 | P0 | required | vorhandenes Gebäude | Feld darf nicht bebaut werden | `buildings-and-construction.md` |
| MVP-BUILD-005 | P0 | required | Roboterfeld | darf nicht bebaut werden | `buildings-and-construction.md` |
| MVP-BUILD-006 | P0 | required | Bau-Ausführungsfeld | erreichbar und orthogonal angrenzend | `buildings-and-construction.md` |
| MVP-BUILD-007 | P0 | required | Ressourcenabzug | erst bei Bau-Task-Start | `buildings-and-construction.md` |
| MVP-BUILD-008 | P0 | required | Reservierung | wird bei Zielinvalidierung freigegeben | `buildings-and-construction.md` |
| MVP-BUILD-009 | P1 | recommended | Zielinvalidierung | Zielauswahl wird einmal neu versucht | `buildings-and-construction.md` |
| MVP-BUILD-010 | P1 | recommended | Gleichstand | seeded deterministic nach `seeded-rng.md` | `buildings-and-construction.md`, `seeded-rng.md` |

## Stasis

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-STASIS-001 | P0 | required | Batterie niedrig | Stasis startet bei `battery <= 1` | `action-executability-matrix.md` |
| MVP-STASIS-002 | P0 | required | Stasis aktiv | normale Programme laufen nicht | `simulation-rules.md` |
| MVP-STASIS-003 | P0 | required | Laden | Batterie steigt bis `battery >= 50` | `simulation-rules.md` |
| MVP-STASIS-004 | P0 | required | Abschluss | Roboter wird wieder `active` | `simulation-rules.md` |
| MVP-STASIS-005 | P0 | required | Abschluss | Stack-Prüfung beginnt oben | `program-stack-rules.md` |
| MVP-STASIS-006 | P1 | recommended | `externalOnly` | Stasis-Laden blockiert | `action-executability-matrix.md` |

## Produktion / Spawn

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-PROD-001 | P0 | required | Iron-Miner-Produktion | bezahlt aus Startroboter-Cargo | `production-and-spawn.md` |
| MVP-PROD-002 | P0 | required | Command-Erfolg | 5 Iron Ore werden abgezogen | `production-and-spawn.md` |
| MVP-PROD-003 | P0 | required | ProductionTask | `costPaid = true` | `production-and-spawn.md` |
| MVP-PROD-004 | P0 | required | freie Leistung < 40 | blockiert Command nicht | `production-and-spawn.md` |
| MVP-PROD-005 | P0 | required | freie Leistung fehlt während Produktion | Fortschritt pausiert | `production-and-spawn.md` |
| MVP-PROD-006 | P0 | required | Spawn | Iron Miner spawnt auf freiem orthogonalen Nachbarfeld | `production-and-spawn.md` |
| MVP-PROD-007 | P0 | required | kein freies Ausgabefeld | `spawnBlocked` | `production-and-spawn.md` |
| MVP-PROD-008 | P1 | recommended | Spawn-Erfolg | `ProductionTask` wird entfernt | `production-and-spawn.md` |
| MVP-PROD-009 | P1 | recommended | Spawn-Erfolg | Event `production.ironMiner.spawned` | `diagnostics-and-eventlog.md` |
| MVP-PROD-010 | P0 | required | ProductionTask-Start | `startIronMinerProduction` in Tick N erzeugt `createdTick = N`, `startedTick = N`, `remainingTicks = 10` und `status = inProgress` | `tick-pipeline.md`, `simulation-rules.md`, `production-and-spawn.md` |
| MVP-PROD-011 | P0 | required | Starttick-Ausschluss | Ein in Tick N gestarteter `ProductionTask` wird in Tick N nicht verarbeitet; kein Fortschritt, kein Pause-Event, kein readyToSpawn, kein Spawnversuch | `tick-pipeline.md`, `simulation-rules.md`, `production-and-spawn.md` |
| MVP-PROD-012 | P0 | required | EnergySnapshot im Starttick | Ein in Tick N neu erzeugter `ProductionTask` zaehlt in Tick N nicht in `powerRequired` | `tick-pipeline.md`, `production-and-spawn.md` |
| MVP-PROD-013 | P0 | required | Erster Fortschritt | Bei ausreichender Produktionsleistung sinkt `remainingTicks` erstmals in Tick N+1 von 10 auf 9 | `tick-pipeline.md`, `simulation-rules.md`, `production-and-spawn.md` |
| MVP-PROD-014 | P0 | required | Erste moegliche Pause | Bei Energiemangel entsteht der erste moegliche Pauseeffekt fruehestens in Tick N+1; `remainingTicks` bleibt 10 und `blockedReason = insufficientPower` | `tick-pipeline.md`, `simulation-rules.md`, `production-and-spawn.md` |
| MVP-PROD-015 | P0 | required | Abschlusszeitpunkt ohne Pause | Ohne Pausen sinkt `remainingTicks` in Tick N+10 auf 0; `readyToSpawn` und Spawn-Pruefung erfolgen in Tick N+10 | `tick-pipeline.md`, `simulation-rules.md`, `production-and-spawn.md` |

## Energie

| ID | Prioritaet | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-ENERGY-001 | P0 | required | active enabled Solar Collector | erzeugt 50 Leistung | `energy-system.md` |
| MVP-ENERGY-002 | P0 | required | Solar Collector in construction | erzeugt 0 Leistung | `energy-system.md` |
| MVP-ENERGY-003 | P0 | required | disabled Solar Collector | erzeugt 0 Leistung | `energy-system.md` |
| MVP-ENERGY-004 | P0 | required | Roboterfabrik idle | benoetigt 0 Leistung | `energy-system.md` |
| MVP-ENERGY-005 | P0 | required | Iron-Miner-ProductionTask | benoetigt 40 Leistung | `energy-system.md` |
| MVP-ENERGY-006 | P0 | required | `startIronMinerProduction` bei `freePower < 40` | Command wird nicht wegen freier Leistung rejected | `energy-system.md` |
| MVP-ENERGY-007 | P0 | required | fortschrittsberechtigter ProductionTask bei ausreichender Produktionsleistung | `remainingTicks` sinkt | `energy-system.md`, `tick-pipeline.md` |
| MVP-ENERGY-008 | P0 | required | fortschrittsberechtigter ProductionTask bei Energiemangel | `remainingTicks` bleibt unveraendert | `energy-system.md`, `tick-pipeline.md` |
| MVP-ENERGY-009 | P0 | required | Energiemangel | `blockedReason = insufficientPower` | `energy-system.md` |
| MVP-ENERGY-010 | P0 | required | Energiemangel | Produktionskosten werden nicht erstattet | `energy-system.md` |
| MVP-ENERGY-011 | P0 | required | Roboterfabrik und Solar Collector | keine Adjazenz fuer Energieversorgung erforderlich | `energy-system.md` |
| MVP-ENERGY-012 | P1 | recommended | Energieanzeige | zeigt erzeugt / benoetigt / frei | `visual-programming-ui.md` |
| MVP-ENERGY-013 | P1 | recommended | insufficientPower Event | wird dedupliziert | `diagnostics-and-eventlog.md` |

## UI Commands

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-UI-001 | P0 | required | Roboterfabrik-Auswahl | Button `Iron Miner produzieren` sichtbar | `visual-programming-ui.md` |
| MVP-UI-002 | P0 | required | Button-Klick | sendet `startIronMinerProduction(buildingId)` | `visual-programming-ui.md` |
| MVP-UI-003 | P0 | required | zu wenig Iron Ore | Command rejected | `production-and-spawn.md` |
| MVP-UI-004 | P0 | required | rejected Command | zieht keine Ressourcen ab | `production-and-spawn.md` |
| MVP-UI-005 | P0 | required | rejected Command | konkreter `CommandRejectionReason` | `production-and-spawn.md` |
| MVP-UI-006 | P1 | recommended | freie Leistung fehlt | Button wird nicht nur deswegen deaktiviert | `visual-programming-ui.md` |

## Diagnose / Eventlog

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-EVENT-001 | P0 | required | Initialisierung | `system.initialLanding` wird erzeugt | `diagnostics-and-eventlog.md` |
| MVP-EVENT-002 | P0 | required | Tests | prüfen `event.code`, nicht `message` | `diagnostics-and-eventlog.md` |
| MVP-EVENT-003 | P0 | required | Debug Events | ohne `diagnosticsExpanded` verborgen | `diagnostics-and-eventlog.md` |
| MVP-EVENT-004 | P0 | required | Deduplizierung | gleiche Player Events innerhalb 10 Ticks erhöhen `repeatCount` | `diagnostics-and-eventlog.md` |
| MVP-EVENT-005 | P0 | required | Eventlog-Limit | maximal 200 Einträge | `diagnostics-and-eventlog.md` |
| MVP-EVENT-006 | P0 | required | Ziel erreicht | `goal.mvpReached` wird erzeugt | `diagnostics-and-eventlog.md` |
| MVP-EVENT-007 | P0 | required | `conditionFalse` | erzeugt kein Player Event | `diagnostics-and-eventlog.md` |
| MVP-EVENT-008 | P1 | recommended | Debug UI | zeigt Details bei `diagnosticsExpanded = true` | `visual-programming-ui.md` |
| MVP-EVENT-009 | P1 | recommended | Event-Prioritaet | jedes Event enthaelt `priority` | `diagnostics-and-eventlog.md` |
| MVP-EVENT-010 | P0 | required | Event-Code-Matrix | jeder `GameEventCode` aus `canonical-data-model.md` kommt in der Event-Code-Matrix vor | `diagnostics-and-eventlog.md`, `canonical-data-model.md` |
| MVP-EVENT-011 | P0 | required | Action-Reason-Matrix | jeder `ActionNotExecutableReason` aus `canonical-data-model.md` kommt in der Action-Reason-Matrix vor | `diagnostics-and-eventlog.md`, `action-executability-matrix.md`, `canonical-data-model.md` |
| MVP-EVENT-012 | P0 | required | Command-Rejection-Matrix | jeder `CommandRejectionReason` aus `canonical-data-model.md` kommt in der Command-Rejection-Matrix vor; generische Ablehnungen nutzen `debug.command.rejected`, Ore-Mangel nutzt `production.ironMiner.blocked.notEnoughOre` | `diagnostics-and-eventlog.md`, `player-command-handling.md`, `canonical-data-model.md` |

## Score / Ziel

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-GOAL-001 | P0 | required | Startscore | Score startet bei 0 | `initial-game-state.md` |
| MVP-GOAL-002 | P0 | required | Produktionsstart | gibt keinen Score | `scoring-and-win-conditions.md` |
| MVP-GOAL-003 | P0 | required | `readyToSpawn` | gibt keinen Score | `scoring-and-win-conditions.md` |
| MVP-GOAL-004 | P0 | required | Iron-Miner-Spawn | setzt `mvpGoalReached = true` | `scoring-and-win-conditions.md` |
| MVP-GOAL-005 | P0 | required | Zielbonus | wird nur einmal vergeben | `scoring-and-win-conditions.md` |
| MVP-GOAL-006 | P1 | recommended | Event | `goal.mvpReached` wird nur einmal erzeugt | `diagnostics-and-eventlog.md` |

## RobotTypes

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-ROBOT-001 | P0 | required | RobotType-Liste | enthält nicht `standardRobot` | `canonical-data-model.md` |
| MVP-ROBOT-002 | P0 | required | Startzustand | Startroboter hat `type = starterRobot` | `initial-game-state.md` |
| MVP-ROBOT-003 | P0 | required | Iron-Miner-Produktion | erzeugt `robot.type = ironMiner` | `production-and-spawn.md` |
| MVP-ROBOT-004 | P0 | required | ProgramTemplates | kein Template referenziert `standardRobot` | `mvp-template-spec.md` |
| MVP-ROBOT-005 | P0 | required | ProductionTask | `standardRobot` ist kein gültiger Produktionszieltyp | `production-and-spawn.md` |
| MVP-ROBOT-006 | P1 | recommended | Legacy-Daten | `standardRobot` wird migriert oder abgelehnt | `simulation-rules.md` |


## Tick Pipeline

| ID | Prioritaet | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V68-001 | P0 | required | kanonische Tick-Quelle | `tick-pipeline.md` ist einzige Quelle fuer die Simulationsreihenfolge | `tick-pipeline.md` |
| MVP-V68-002 | P0 | required | Simulation Rules | `simulation-rules.md` verweist auf `tick-pipeline.md` und fuehrt keine eigene abweichende Schrittfolge | `simulation-rules.md` |
| MVP-V68-003 | P0 | required | Implementation Plan | `implementation-plan.md` verweist auf `tick-pipeline.md` und fuehrt keine eigene abweichende Schrittfolge | `implementation-plan.md` |
| MVP-V68-004 | P0 | required | Production/Spawn-Reihenfolge | ProductionTasks werden vor Spawn-Pruefungen verarbeitet | `tick-pipeline.md` |
| MVP-V68-005 | P0 | required | ProgramStack-Reihenfolge | laufende RobotTasks werden vor neuer ProgramStack-Auswertung verarbeitet | `tick-pipeline.md` |
| MVP-V68-006 | P1 | recommended | nicht MVP-aktive externe Ladung | Tick-Pipeline enthaelt keine Priorisierung zwischen Produktion und externer Roboterladung | `tick-pipeline.md` |


## Externe Roboterladung Akzeptanz

| ID | Prioritaet | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V69-001 | P0 | required | Akzeptanzkriterium externe Ladung | Akzeptanzkriterien verlangen keine Priorisierung zwischen Produktion und externer Roboterladung | `acceptance-criteria.md` |
| MVP-V69-002 | P0 | required | keine externe Ladung im Tick | externe Roboterladung wird in der MVP-Tick-Pipeline nicht verarbeitet | `tick-pipeline.md` |
| MVP-V69-003 | P0 | required | Energieverbrauch | Gebaeudeenergie beeinflusst nur `ProductionTask`-Fortschritt | `energy-system.md` |
| MVP-V69-004 | P1 | recommended | Regression historische Regeln | alte externe Ladeprioritaetsregeln sind als historisch/Future markiert und nicht MVP-aktiv | `CHANGELOG.md`, `AGENTS.md` |


## Energie-Topologie Future-Pruefungen

| ID | Prioritaet | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V70-001 | P0 | required | MVP-FUT-005 | lokale Energienetze sind als Future-System markiert, nicht als ungeklärt | `mvp-test-matrix.md` |
| MVP-V70-002 | P0 | required | MVP-Energie-Topologie | MVP nutzt globalen Power-Pool, keine lokalen Energienetze | `energy-system.md` |
| MVP-V70-003 | P1 | recommended | Regression Energie-Doku | aktive Dokumente formulieren lokale Energienetze nicht als offene MVP-Entscheidung | `energy-system.md`, `tick-pipeline.md` |

## Regression

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-REG-001 | P0 | required | Startstack | enthält nicht `template.secureEnergy` | `program-stack-rules.md` |
| MVP-REG-002 | P0 | required | Scouting | sichtbares, nicht angrenzendes Iron Ore führt nicht zu Idle | `pathfinding-and-map-generation.md` |
| MVP-REG-003 | P0 | required | Produktionskosten | werden nicht aus globalem Pool bezahlt | `production-and-spawn.md` |
| MVP-REG-004 | P0 | required | Startposition | keine 1-basierte Koordinatenannahme | `pathfinding-and-map-generation.md` |
| MVP-REG-005 | P0 | required | Build | Spieler wählt kein konkretes Baufeld | `buildings-and-construction.md` |
| MVP-REG-006 | P0 | required | Eventlog | keine Player-Event-Flut durch IF-Fehlschläge | `diagnostics-and-eventlog.md` |
| MVP-REG-007 | P1 | recommended | Determinismus | gleiche Seeds ergeben gleiche Bau-/Scout-Tie-Breaks nach `seeded-rng.md` | `pathfinding-and-map-generation.md`, `seeded-rng.md` |

| MVP-REG-008 | P0 | required | RobotType | `standardRobot` wird nicht als gültiger RobotType akzeptiert | `canonical-data-model.md` |

## Assets / Fallbacks

| ID | Prioritaet | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-ASSET-001 | P0 | required | jeder MVP AssetKey | loest zu einem RenderAsset auf | `asset-fallbacks.md` |
| MVP-ASSET-002 | P0 | required | fehlendes finales Asset | nutzt Fallback | `asset-fallbacks.md` |
| MVP-ASSET-003 | P0 | required | fehlender Fallback | Test schlaegt fehl | `asset-fallbacks.md` |
| MVP-ASSET-004 | P0 | required | Roboter-Fallbacks | starterRobot und ironMiner sind unterscheidbar | `asset-fallbacks.md` |
| MVP-ASSET-005 | P0 | required | Gebaeude-Fallbacks | solarCollector und robotFactory sind unterscheidbar | `asset-fallbacks.md` |
| MVP-ASSET-006 | P0 | required | unknown Felder | zeigen keine Resource-Fallbacks | `asset-fallbacks.md` |
| MVP-ASSET-007 | P0 | required | construction fallback | unterscheidet sich von active building | `asset-fallbacks.md` |
| MVP-ASSET-008 | P0 | required | spawnBlocked | hat sichtbaren UI-Status-Fallback | `asset-fallbacks.md` |
| MVP-ASSET-009 | P1 | recommended | Fallback-Nutzung | erzeugt hoechstens Debug Event, kein Player Event | `diagnostics-and-eventlog.md` |
| MVP-ASSET-010 | P1 | recommended | finales Asset vorhanden | finales Asset wird vor Fallback genutzt | `asset-fallbacks.md` |

## Offene / Future Tests

Diese Tests sind bewusst nicht MVP-blockierend.

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-FUT-001 | P2 | future | `action.charge` | Future/Advanced, nicht Startstack und keine aktive MVP-ActionDefinition | `action-executability-matrix.md`, `visual-programming-data-model.md` |
| MVP-FUT-002 | P2 | future | `materialRequests` | bleibt im MVP leer | `canonical-data-model.md` |
| MVP-FUT-003 | P2 | future | Transportroboter | keine MVP-Pflicht | `resources-and-logistics.md` |
| MVP-FUT-004 | P2 | future | Gebäudeprogramme | nicht MVP-aktiv | `visual-programming-ui.md` |
| MVP-FUT-005 | P2 | future | lokale Energienetze | Future-System, nicht MVP-aktiv; MVP nutzt globalen Power-Pool | `energy-system.md` |

## Mindestabnahme

Für die technische MVP-Abnahme müssen mindestens alle Tests mit folgender Kombination bestehen:

```text
Priorität = P0
Status = required
```

P0 required Tests sind MVP-blockierend.

P0 required Tests dürfen nicht mit Todo-Kommentaren oder Platzhaltern als erfüllt markiert werden.

## Pflegehinweis

Wenn ein neues Systemdokument verbindliche Regeln ergänzt, muss diese Testmatrix aktualisiert werden.

Pflicht bei Änderungen:

```text
neue Testfälle mit stabiler ID ergänzen
Quelle angeben
Priorität setzen
Status setzen
Definition of Done prüfen
```

## Score / Ziel Ergänzungen

Diese Tests präzisieren die Grenze zwischen Produktion und tatsächlichem Spawn.

| ID | Priorität | Status | Test | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-GOAL-007 | P0 | required | `spawnBlocked` | setzt `mvpGoalReached` nicht true | `scoring-and-win-conditions.md` |
| MVP-GOAL-008 | P0 | required | erfolgreicher Spawn | `spawnedRobots` erhöht sich erst nach Einfügen der Robot-Entity | `scoring-and-win-conditions.md` |
| MVP-GOAL-009 | P0 | required | Spawn-Event | `production.ironMiner.spawned` entsteht erst nach erfolgreichem Spawn | `diagnostics-and-eventlog.md` |
| MVP-GOAL-010 | P0 | required | `readyToSpawn` | erzeugt nicht `goal.mvpReached` | `scoring-and-win-conditions.md` |
| MVP-GOAL-011 | P0 | required | accepted ProductionCommand | setzt keinen Score und nicht `mvpGoalReached` | `production-and-spawn.md` |
| MVP-GOAL-012 | P0 | required | mehrfacher Spawn | Zielbonus wird nur einmal vergeben | `scoring-and-win-conditions.md` |

P0 required Tests sind MVP-blockierend.


## Konsolidierungs- und Regressionsprüfungen

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V59-001 | P0 | required | Primärquellen | Kein aktives Dokument definiert zufällige Startposition als MVP-Regel | `mvp-and-tech-stack.md`, `initial-game-state.md` |
| MVP-V59-002 | P0 | required | Energie | Kein aktives Dokument definiert Solar Collector = 100 Leistung als MVP-Regel | `energy-system.md`, `mvp-constants.md` |
| MVP-V59-003 | P0 | required | Roboterladung | Externe Roboterladung wird im MVP nicht verarbeitet | `units-and-energy.md` |
| MVP-V59-004 | P0 | required | Zielbedingung | MVP-Ziel erst nach erfolgreichem `ironMiner`-Spawn | `scoring-and-win-conditions.md` |
| MVP-V59-005 | P0 | required | Programmzeilen | IF wahr, THEN nicht ausführbar prüft nächste Row im selben Programm | `program-stack-rules.md` |
| MVP-V59-006 | P0 | required | Long Tasks | Mining/Bau-Abbruch erzeugt kein Teilresultat und kostet keine Batterie | `robot-task-lifecycle.md` |
| MVP-V59-007 | P0 | required | Bau | Fortsetzen einer vorhandenen Baustelle kostet nicht erneut Ressourcen | `robot-task-lifecycle.md` |
| MVP-V59-008 | P0 | required | Iron Miner Entity | Spawn erzeugt vollständige `Robot`-Entity vom Typ `ironMiner` | `production-and-spawn.md` |
| MVP-V59-009 | P1 | recommended | UI | ProgramStackPanel kennt `active`, `ready`, `skipped`, `blocked`, `disabled`, `completed`, `locked` | `visual-programming-ui.md` |
| MVP-V59-010 | P1 | recommended | Konstanten | Tickdauer und Zeitlimit stehen zentral in `mvp-constants.md` | `mvp-constants.md` |

## RobotStatus-Sensor-Prüfungen

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V64-001 | P0 | required | Datenmodell | `SensorId` enthält `sensor.robotStatus` | `canonical-data-model.md` |
| MVP-V64-002 | P0 | required | Datenmodell | `ConditionValue` enthält `{ type: "robotStatus"; value: RobotStatus }` | `canonical-data-model.md` |
| MVP-V64-003 | P0 | required | Templates | `Roboterstatus = Stasis` ist technisch als `sensor.robotStatus` + `robotStatus: stasis` modellierbar | `mvp-template-spec.md` |



## FieldType-ActionParameterValue-Prüfungen

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V65-001 | P0 | required | Datenmodell | `ActionParameterValue` enthaelt `{ type: "fieldType"; value: FieldTypeQuery }` | `canonical-data-model.md` |
| MVP-V65-002 | P0 | required | Datenmodell | `ActionParameterDefinition.type` erlaubt `fieldType` | `canonical-data-model.md` |
| MVP-V65-003 | P0 | required | Scouting | `action.scoutNearby.parameters.targetFieldType` nutzt `{ type: "fieldType", value: "ironOre" }` | `visual-programming-data-model.md`, `mvp-template-spec.md` |

## Scout-Parameter-Beispiel-Prüfungen

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V66-001 | P0 | required | Scouting | Aktive MVP-Dokumente verwenden kein `maxDistanceFromBuilding` als Scout-Parameter | `visual-programming-ui.md`, `pathfinding-and-map-generation.md` |
| MVP-V66-002 | P0 | required | Scouting | `Scoute Nahfeld` wird mit `targetFieldType = ironOre` bzw. `[Ziel: Iron Ore]` beschrieben | `mvp-template-spec.md`, `visual-programming-ui.md` |
| MVP-V66-003 | P1 | recommended | Dokumentation | Future-/Balancing-Distanzgrenzen sind nicht als MVP-Parameter formuliert | `pathfinding-and-map-generation.md` |

## Aktuelle ProgramStack-/UI-Beispiele-Prüfungen

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V67-001 | P0 | required | ProgramStack | Kanonische ProgramStack-Beispiele enthalten kein `Energie sichern` als MVP-Startprogramm | `program-stack-rules.md` |
| MVP-V67-002 | P0 | required | ProgramStack | Kanonische Erkundungsbeispiele enthalten keine `Batterie >= 60 %`-Startbedingung | `program-stack-rules.md` |
| MVP-V67-003 | P0 | required | UI | ProgramStackPanel- und ProgramEditorPanel-Beispiele verwenden den aktuellen 5er-Startstack | `visual-programming-ui.md` |
| MVP-V67-004 | P1 | recommended | Datenmodell-UI-Projektion | UI-Projektionsbeispiele zeigen `scoutNearby.targetFieldType` und kein altes Batterie-60-Beispiel | `visual-programming-data-model.md` |

## ScoreState-Gebäudezähler

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V72-001 | P0 | required | ScoreState | enthält `builtSolarCollectors`, `builtRobotFactories` und `builtBuildings` | `scoring-and-win-conditions.md` |
| MVP-V72-002 | P0 | required | Solar Collector Score | erster erfolgreicher Wechsel eines Solar Collectors zu `active` erhöht `builtSolarCollectors` und `builtBuildings` genau einmal | `scoring-and-win-conditions.md` |
| MVP-V72-003 | P0 | required | Roboterfabrik Score | erster erfolgreicher Wechsel einer Roboterfabrik zu `active` erhöht `builtRobotFactories` und `builtBuildings` genau einmal | `scoring-and-win-conditions.md` |
| MVP-V72-004 | P0 | required | Aggregat | `builtBuildings = builtSolarCollectors + builtRobotFactories` | `canonical-data-model.md` |
| MVP-V72-005 | P1 | recommended | Ergebnisübersicht | zeigt getrennte Zähler für Solar Collectors und Roboterfabriken aus `ScoreState` | `ui-components-contract.md` |


## Stabile ProgramRowIds

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V73-001 | P0 | required | Initial State | `createStarterProgramStack()` erzeugt die fuenf kanonischen ProgramRowIds | `initial-game-state.md` |
| MVP-V73-002 | P0 | required | Templates | jede MVP-Starttemplate-Instanz besitzt eine stabile `.main`-RowId | `mvp-template-spec.md` |
| MVP-V73-003 | P0 | required | Determinismus | ProgramRowIds werden nicht aus Array-Index, Zufall oder Zeitstempel erzeugt | `program-stack-rules.md` |
| MVP-V73-004 | P1 | recommended | Diagnostics | Debug-Events setzen die stabile `rowId`, wenn sie einer Starttemplate-Row zugeordnet werden koennen | `diagnostics-and-eventlog.md` |
| MVP-V73-005 | P1 | recommended | Template Reset | `resetProgramToTemplate` stellt die kanonische RowId wieder her | `visual-programming-data-model.md` |


## Build-Fortsetzung

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V74-001 | P0 | required | Build | Build-Action prueft vorhandene passende `construction`-Baustelle vor neuem Bauplatz | `buildings-and-construction.md` |
| MVP-V74-002 | P0 | required | Ressourcen | Fortsetzen einer Baustelle zieht keine neuen Ressourcen aus Cargo ab | `robot-task-lifecycle.md` |
| MVP-V74-003 | P0 | required | Identitaet | Fortsetzen verwendet dieselbe `buildingId` und legt kein neues Building an | `robot-task-payloads.md` |
| MVP-V74-004 | P0 | required | Templates | Build-STOP-Bedingungen zaehlen erst `status = active`, nicht `construction` | `mvp-template-spec.md` |
| MVP-V74-005 | P0 | required | Duplikate | `construction` blockiert neue Baustellen desselben Typs, dient aber als Fortsetzungsziel | `buildings-and-construction.md` |
| MVP-V74-006 | P1 | recommended | UI | UI zeigt fortgesetzte Baustelle als vorhandene `construction` mit bezahlten Kosten | `ui-components-contract.md` |


## Idle als abgeleiteter UI-/Diagnosezustand

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V75-001 | P0 | required | Datenmodell | `RobotStatus` enthaelt kein `idle`; `RobotActivityState` enthaelt `idle` als abgeleiteten Zustand | `canonical-data-model.md` |
| MVP-V75-002 | P0 | required | ProgramStack | Wenn kein Programm ausfuehrbar ist, bleibt `robot.status = active` und `activeTask`/`activeProgram` sind leer | `program-stack-rules.md` |
| MVP-V75-003 | P0 | required | Simulation | Die Simulation schreibt nie `idle` in `robot.status` | `simulation-rules.md` |
| MVP-V75-004 | P1 | recommended | UI | RobotPanel zeigt `Robot.status` und abgeleitete Aktivitaet getrennt; `idle` erscheint nur als Aktivitaet/Diagnose | `ui-components-contract.md`, `visual-programming-ui.md` |
| MVP-V75-005 | P1 | recommended | Akzeptanz | Akzeptanzkriterien behandeln `idle` nicht als gespeicherten `RobotStatus` | `acceptance-criteria.md` |


## RobotTask-Union

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V76-001 | P0 | required | Datenmodell | `RobotTask` ist eine diskriminierte Union aus `MovementTask`, `MiningTask`, `BuildingTask` und `StasisChargingTask` | `canonical-data-model.md` |
| MVP-V76-002 | P0 | required | Datenmodell | Der alte generische `RobotTask` mit optionalen Feldern wie `targetX`, `targetY`, `resourceDeltaOnSuccess`, `buildMode` oder `logisticTask` ist nicht kanonisch | `canonical-data-model.md` |
| MVP-V76-003 | P0 | required | BuildingTask | `BuildingTask.mode` nutzt `BuildingTaskMode = newConstruction | continueConstruction` | `canonical-data-model.md`, `robot-task-payloads.md` |
| MVP-V76-004 | P0 | required | MVP-Grenze | `charging` und `logistics` werden im MVP nicht als aktive `RobotTask`-Instanzen erzeugt | `robot-task-payloads.md`, `resources-and-logistics.md` |
| MVP-V76-005 | P1 | recommended | Dokumentation | `robot-task-payloads.md` beschreibt Payloads fachlich und definiert `RobotTask` nicht erneut als TypeScript-Typ | `robot-task-payloads.md` |
| MVP-V76-006 | P1 | recommended | Konsistenz | Aktive Dokumente verwenden `BuildingTaskMode`, nicht `BuildTaskMode` | `canonical-data-model.md` |

### BuildingQuery / Gebäude-mit-Status-Condition

| MVP-V77-001 | P0 | required | BuildingQuery | `ConditionValue` unterstützt `{ type: "buildingQuery"; value: BuildingQuery }` | `canonical-data-model.md` |
| MVP-V77-002 | P0 | required | Gebäudetyp + Status | `Gebäude existiert Solar Collector mit Status active` prüft buildingType und status gemeinsam | `mvp-template-spec.md` |
| MVP-V77-003 | P0 | required | Baustelle mit Status | `Baustelle existiert Roboterfabrik mit Status construction` wird als `BuildingQuery` modelliert | `mvp-template-spec.md` |
| MVP-V77-004 | P0 | required | NOT existiert | `NOT Gebäude oder Baustelle existiert X` nutzt `BuildingQuery` ohne status und zählt construction + active als existent | `program-stack-rules.md` |
| MVP-V77-005 | P1 | recommended | UI | ProgramEditor speichert Gebäudetyp+Status-Conditions als eine Query, nicht als lose Teilbedingungen | `ui-components-contract.md` |

### activeProgram als kanonischer aktiver Programmzustand

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V78-001 | P0 | required | Datenmodell | `Robot.activeProgram?: ActiveProgramState` ist die einzige kanonische Speicherung der aktuell ausgefuehrten Programmzeile | `canonical-data-model.md` |
| MVP-V78-002 | P0 | required | Stack-Auswertung | Beim Start einer ausfuehrbaren Row wird `robot.activeProgram = { programId, rowId, startedTick }` gesetzt | `simulation-rules.md`, `implementation-plan.md` |
| MVP-V78-003 | P0 | required | Task-Ende | Nach Abschluss, Abbruch, Stop-Bedingung, Spielerabbruch oder Deaktivierung wird `robot.activeProgram` auf `undefined` gesetzt | `simulation-rules.md` |
| MVP-V78-004 | P0 | required | Konsistenz | Aktive Dokumente fuehren keine separaten gespeicherten Programm-/Row-ID-Felder am Robot-Objekt | `canonical-data-model.md` |


## CommandResult / CommandRejectionReason

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V79-001 | P0 | required | Datenmodell | `CommandResult` und `CommandRejectionReason` sind nur in `canonical-data-model.md` als TypeScript-Typen definiert | `canonical-data-model.md` |
| MVP-V79-002 | P0 | required | Command-Abdeckung | `CommandRejectionReason` enthält Gründe für Selection-, Program-, Production-, Reset- und Runtime-Validation-Commands | `player-command-handling.md` |
| MVP-V79-003 | P0 | required | Rejected Commands | Ein `rejected` Command mutiert keinen spielrelevanten State | `player-command-handling.md`, `acceptance-criteria.md` |
| MVP-V79-004 | P0 | required | Selection Commands | Ungültige `selectRobot`, `selectBuilding` und `selectField` Commands liefern `robotNotFound`, `buildingNotFound` oder `fieldOutOfBounds` | `player-command-handling.md` |
| MVP-V79-005 | P0 | required | Program Commands | Locked/ungültige Programm-Commands liefern konkrete Gründe wie `programLocked`, `programNotFound`, `invalidProgramDefinition` oder `invalidTemplateParameter` | `player-command-handling.md` |
| MVP-V79-006 | P0 | required | Production Command | `startIronMinerProduction` behält die bekannten Produktions-RejectionReasons und prüft weiterhin nicht `freePower` | `production-and-spawn.md`, `player-command-handling.md` |
| MVP-V79-007 | P1 | recommended | UI | UI zeigt bei `rejected` eine verständliche Rückmeldung und ändert Selection/ProgramStack/Resources nicht eigenständig | `ui-components-contract.md` |


## updateProgram-Validierung

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V80-001 | P0 | required | updateProgram | `updateProgram` akzeptiert nur templatekonforme Änderungen an freigegebenen Feldern | `player-command-handling.md` |
| MVP-V80-002 | P0 | required | updateProgram | Änderung von `templateId`, RowId, Row-Anzahl oder `actionId` wird mit `invalidProgramDefinition` abgelehnt | `player-command-handling.md` |
| MVP-V80-003 | P0 | required | updateProgram | unbekannte `sensorId`, `operatorId` oder `actionId` erzeugen `unknownSensor`, `unknownOperator` oder `unknownAction` | `player-command-handling.md` |
| MVP-V80-004 | P0 | required | updateProgram | nicht erlaubte Parameterwerte erzeugen `invalidTemplateParameter` | `player-command-handling.md` |
| MVP-V80-005 | P0 | required | updateProgram | `program.starter.stasisCharge` kann per `updateProgram` nicht geändert werden und liefert `programLocked` | `mvp-template-spec.md` |
| MVP-V80-006 | P0 | required | updateProgram | bei rejected bleibt der ProgramStack unverändert | `acceptance-criteria.md` |
| MVP-V80-007 | P1 | recommended | UI | ProgramEditor bietet keine Controls für nicht freigegebene Strukturänderungen an | `visual-programming-ui.md` |

## Visual-Programming-Beispielwerte

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-V81-001 | P0 | required | Visual Programming | Aktive Visual-Programming-Beispiele enthalten keine Batterie-20/25- oder Batterie-80/90-Werte aus dem alten Energie-sichern-Template | `visual-programming-data-model.md` |
| MVP-V81-002 | P0 | required | Visual Programming | Aktive Visual-Programming-Beispiele enthalten keine Scouting-Distanzwerte wie 15 oder 12 Tiles | `visual-programming-data-model.md` |
| MVP-V81-003 | P0 | required | ProgramEditor | Erlaubte Beispieländerungen beziehen sich auf aktuelle MVP-Templates und freigegebene Parameter | `visual-programming-data-model.md`, `visual-programming-ui.md` |
| MVP-V81-004 | P1 | recommended | Build-UI | Build-Beispiele zeigen `construction` als Fortsetzungsziel und `active` als Stop-Status | `visual-programming-ui.md` |



## Deterministische ID-Erzeugung

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V82-001 | P0 | required | ID-Regel | `docs/03-technical/deterministic-id-generation.md` ist die zentrale Quelle fuer Runtime-ID-Erzeugung | `deterministic-id-generation.md` |
| MVP-V82-002 | P0 | required | Verbotene Quellen | spielrelevante IDs nutzen kein `Math.random()`, `Date.now()` oder `crypto.randomUUID()` | `deterministic-id-generation.md` |
| MVP-V82-003 | P0 | required | BuildingId | erste MVP-Gebaeude-IDs folgen `building.solarCollector.001` und `building.robotFactory.001` | `deterministic-id-generation.md`, `buildings-and-construction.md` |
| MVP-V82-004 | P0 | required | ProductionTaskId | Iron-Miner-ProductionTask-IDs folgen `production.ironMiner.<buildingId>.<seq3>` | `deterministic-id-generation.md`, `production-and-spawn.md` |
| MVP-V82-005 | P0 | required | Spawned RobotId | erster erfolgreich gespawnter Iron Miner erhaelt `robot.ironMiner.001` | `deterministic-id-generation.md`, `production-and-spawn.md` |
| MVP-V82-006 | P0 | required | RobotTaskId | RobotTasks folgen `task.<robotId>.<tick6>.<taskType>.<seq2>` | `deterministic-id-generation.md`, `robot-task-lifecycle.md` |
| MVP-V82-007 | P1 | recommended | GameEventId | Runtime-Events folgen `event.<tick6>.<seq3>.<code>`, initiales Start-Event bleibt `event.initialLanding` | `deterministic-id-generation.md`, `diagnostics-and-eventlog.md` |
| MVP-V82-008 | P1 | recommended | Rejected Commands | rejected Commands erzeugen keine spielrelevanten IDs | `player-command-handling.md` |


## continueConstruction-Reservierung

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V83-001 | P0 | required | Reservierung | Eine bestehende Baustelle gilt als reserviert, wenn ein anderer Roboter einen laufenden `BuildingTask` mit derselben `buildingId` hat | `buildings-and-construction.md`, `robot-task-lifecycle.md` |
| MVP-V83-002 | P0 | required | Doppelbearbeitung | Ein zweiter `continueConstruction`-Task auf derselben `buildingId` wird mit `constructionAlreadyReserved` abgelehnt | `action-executability-matrix.md` |
| MVP-V83-003 | P0 | required | Keine Building-Reservation | `continueConstruction` erzeugt keine neue `reservedForConstruction`-Struktur und kein neues Building | `buildings-and-construction.md` |
| MVP-V83-004 | P0 | required | Freigabe | Nach Abschluss oder Abbruch des laufenden `BuildingTask` ist die Baustelle wieder fortsetzbar | `robot-task-lifecycle.md` |
| MVP-V83-005 | P1 | recommended | Konsistenz | Im MVP existiert höchstens ein laufender `BuildingTask` pro `buildingId` | `canonical-data-model.md`, `robot-task-payloads.md` |


## Build-Event-details.mode

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V84-001 | P0 | required | Eventlog | `action.build.started` enthält `details.mode` | `diagnostics-and-eventlog.md`, `simulation-rules.md` |
| MVP-V84-002 | P0 | required | Eventlog | `action.build.completed` enthält `details.mode` | `diagnostics-and-eventlog.md`, `robot-task-lifecycle.md` |
| MVP-V84-003 | P0 | required | Neubau | Bei einem neuen Bau gilt `details.mode = newConstruction` | `buildings-and-construction.md` |
| MVP-V84-004 | P0 | required | Fortsetzung | Bei fortgesetzter Baustelle gilt `details.mode = continueConstruction` | `buildings-and-construction.md` |
| MVP-V84-005 | P1 | recommended | Target Selected | `action.build.targetSelected` enthält `details.mode`, sobald BuildTarget.mode feststeht | `action-executability-matrix.md` |
| MVP-V84-006 | P1 | recommended | Testbarkeit | Tests prüfen `details.mode`, nicht freie Meldungstexte | `diagnostics-and-eventlog.md` |

## README- und Archiv-Hinweise

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V85-001 | P1 | recommended | README | `README.md` ist ein aktueller Einstieg und enthält keine lange aktive Versionshistorie mit `Neue Ergänzung vXX`-Abschnitten | `README.md` |
| MVP-V85-002 | P1 | recommended | Archiv | `docs/archive/**` ist ausdrücklich nicht implementierungsverbindlich | `README.md`, `AGENTS.md`, `docs/archive/README.md` |
| MVP-V85-003 | P1 | recommended | Agenten | `AGENTS.md` verweist auf aktive Quellen und schließt Archivdateien als Regelquelle aus | `AGENTS.md` |
| MVP-V85-004 | P2 | future | Historie | Alte README-Historie ist in `docs/archive/readme-history-v84.md` erhalten und darf nur zur Historienprüfung verwendet werden | `docs/archive/readme-history-v84.md` |



## MVP_MAP_CONFIG Konsistenz

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V86-001 | P0 | required | Datenmodell | `MVP_MAP_CONFIG` enthaelt `requiredReachableIronOreMaxDistance` genau einmal | `canonical-data-model.md` |
| MVP-V86-002 | P0 | required | Datenmodell | `MVP_MAP_CONFIG.requiredReachableIronOreMaxDistance` hat den Wert `6` | `canonical-data-model.md` |
| MVP-V86-003 | P1 | recommended | Dokumentation | Kanonische Config-Codeblocks enthalten keine doppelten Property-Namen | `canonical-data-model.md` |

## GameEventCode kanonisch im Datenmodell

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V87-001 | P0 | required | Datenmodell | `GameEventCode` ist in `canonical-data-model.md` als TypeScript-Union definiert | `canonical-data-model.md` |
| MVP-V87-002 | P0 | required | Diagnose | `diagnostics-and-eventlog.md` definiert keine konkurrierende `type GameEventCode = ...`-Union | `diagnostics-and-eventlog.md` |
| MVP-V87-003 | P0 | required | Asset-Diagnose | `debug.asset.fallbackUsed` und `debug.asset.missingFallback` sind Teil der kanonischen `GameEventCode`-Union | `canonical-data-model.md`, `asset-fallbacks.md` |
| MVP-V87-004 | P1 | recommended | Event-IDs | `createGameEventId(..., code: GameEventCode)` verwendet den kanonischen Typ | `canonical-data-model.md`, `deterministic-id-generation.md` |


## action.charge aus MVP ActionDefinitions entfernt

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V88-001 | P0 | required | ActionDefinitions | Aktive MVP-ActionDefinitions enthalten `action.scoutNearby`, `action.mineResource`, `action.buildBuilding` und `action.stasisCharge`, aber nicht `action.charge` | `visual-programming-data-model.md` |
| MVP-V88-002 | P0 | required | ProgramEditor | `action.charge` wird im MVP-ProgramEditor nicht als auswählbare Aktion angeboten | `visual-programming-ui.md`, `ui-components-contract.md` |
| MVP-V88-003 | P0 | required | Executability | `action.charge` erzeugt im MVP keinen `charging`-Task und wird nicht für MVP-Sieg oder MVP-Abnahme benötigt | `action-executability-matrix.md` |
| MVP-V88-004 | P1 | recommended | Future | `action.charge` ist höchstens in klar markierten Future/Advanced-Abschnitten dokumentiert | `visual-programming-data-model.md` |

## Build-Blocked-Event fuer constructionAlreadyReserved

| ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V89-001 | P0 | required | Datenmodell | `action.build.blocked.constructionAlreadyReserved` ist Teil der kanonischen `GameEventCode`-Union | `canonical-data-model.md` |
| MVP-V89-002 | P0 | required | Diagnose | `constructionAlreadyReserved` erzeugt den stabilen Code `action.build.blocked.constructionAlreadyReserved`, wenn dazu ein Build-Blocker-Event oder eine Diagnose erzeugt wird | `diagnostics-and-eventlog.md`, `action-executability-matrix.md` |
| MVP-V89-003 | P0 | required | Details | Das Event enthält `details.reason = constructionAlreadyReserved` und `details.mode = continueConstruction` | `diagnostics-and-eventlog.md`, `buildings-and-construction.md` |
| MVP-V89-004 | P1 | recommended | Sichtbarkeit | Der Code ist mindestens debug-sichtbar und wird nach den allgemeinen Blocker-Regeln player-sichtbar | `diagnostics-and-eventlog.md` |

## Deterministische Event-Sequenz innerhalb eines Ticks

| ID | Prioritaet | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V90-001 | P0 | required | Event-Sequenz | Event-Kandidaten eines Ticks werden vor ID-Vergabe nach `pipelineStepOrder -> sourceOrder -> entitySortKey -> eventCodeOrder -> localSequence` sortiert | `deterministic-id-generation.md` |
| MVP-V90-002 | P0 | required | GameEventId | `seq3` wird erst nach Sortierung und Deduplizierung an neue Runtime-Events vergeben | `deterministic-id-generation.md`, `diagnostics-and-eventlog.md` |
| MVP-V90-003 | P0 | required | Robot-Reihenfolge | Events aus RobotTasks und ProgramStack-Auswertung folgen stabiler `RobotId`-Reihenfolge | `tick-pipeline.md`, `deterministic-id-generation.md` |
| MVP-V90-004 | P0 | required | Production/Spawn | Bei Spawn und Zielerreichung im selben Tick kommt `production.ironMiner.spawned` vor `goal.mvpReached` | `deterministic-id-generation.md`, `tick-pipeline.md` |
| MVP-V90-005 | P1 | recommended | Deduplizierung | Deduplizierte Player-Events behalten ihre bestehende ID und verbrauchen keinen neuen `seq3`-Slot | `diagnostics-and-eventlog.md` |
| MVP-V90-006 | P1 | recommended | Verbotene Quellen | Event-Sequenzen nutzen keine Array-/Framework-Reihenfolge, die nicht vorher stabil sortiert wurde | `deterministic-id-generation.md` |

## AssetRegistry und resolveAssetDetailed

| ID | Prioritaet | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V91-001 | P0 | required | Datenmodell | `AssetRegistry` ist als partielle Registry finaler Assets definiert | `canonical-data-model.md` |
| MVP-V91-002 | P0 | required | Datenmodell | `FallbackAssetRegistry` ist als vollstaendige Registry fuer alle MVP-AssetKeys definiert | `canonical-data-model.md`, `asset-fallbacks.md` |
| MVP-V91-003 | P0 | required | Rendering | `resolveAsset(...)` liefert fuer gueltige MVP-AssetKeys ein `RenderAsset` oder wirft bei fehlendem Fallback einen technischen Fehler, aber nie `undefined` | `canonical-data-model.md`, `asset-fallbacks.md` |
| MVP-V91-004 | P0 | required | Diagnose | `resolveAssetDetailed(...)` liefert `final`, `fallback` oder `missingFallback` als `AssetResolutionResult` | `canonical-data-model.md` |
| MVP-V91-005 | P0 | required | Asset-Fehler | `missingFallback` erzeugt `debug.asset.missingFallback` und blockiert MVP-Abnahme | `asset-fallbacks.md`, `diagnostics-and-eventlog.md` |
| MVP-V91-006 | P1 | recommended | Implementierung | Renderer verwenden `resolveAsset(...)`; Tests und Diagnose verwenden `resolveAssetDetailed(...)` | `implementation-plan.md`, `implementation-module-structure.md` |

## Initial-State-Verweis im Datenmodell

| ID | Prioritaet | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V92-001 | P0 | required | Datenmodell | `canonical-data-model.md` enthaelt keinen Hinweis mehr, dass der Initial-State erst spaeter zentralisiert wird | `canonical-data-model.md` |
| MVP-V92-002 | P0 | required | Initialisierung | `canonical-data-model.md` verweist fuer den exakten initialen GameState auf `docs/02-mvp/initial-game-state.md` | `canonical-data-model.md`, `initial-game-state.md` |
| MVP-V92-003 | P1 | recommended | Dokumentation | Das kanonische Datenmodell enthaelt keine konkurrierende vereinfachte Initial-State-Tabelle neben der verbindlichen Initial-State-Datei | `canonical-data-model.md` |

## Event-Beispiele und Goal-Message auf Spawn/ID-Muster

| ID | Prioritaet | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V93-001 | P0 | required | Event-Beispiele | Player-Event-Beispiele verwenden Runtime-IDs im Muster `event.<tick6>.<seq3>.<code>` | `diagnostics-and-eventlog.md`, `deterministic-id-generation.md` |
| MVP-V93-002 | P0 | required | Debug-Event-Beispiele | Debug-Event-Beispiele verwenden Runtime-IDs im Muster `event.<tick6>.<seq3>.<code>` | `diagnostics-and-eventlog.md` |
| MVP-V93-003 | P0 | required | Entity-IDs | Event-Beispiele verwenden kanonische Entity-IDs wie `building.robotFactory.001` und keine alten Suffixe wie `.1` | `diagnostics-and-eventlog.md`, `deterministic-id-generation.md` |
| MVP-V93-004 | P0 | required | Goal-Message | `goal.mvpReached` verwendet die Message `MVP-Ziel erreicht: erster Iron Miner gespawnt.` | `diagnostics-and-eventlog.md`, `scoring-and-win-conditions.md` |
| MVP-V93-005 | P1 | recommended | Zielterminologie | Aktive MVP-Zieltexte unterscheiden Produktionsabschluss von erfolgreichem Spawn | `mvp-and-tech-stack.md`, `acceptance-criteria.md` |

## Seeded-RNG-Algorithmus

| ID | Prioritaet | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V97-001 | P0 | required | RNG | `makeRngInput(["mvp-default", "map", 0])` ergibt `11:mvp-default|3:map|1:0` | `seeded-rng.md` |
| MVP-V97-002 | P0 | required | RNG | `fnv1a32Utf8("mvp-default")` ergibt `2236944682` | `seeded-rng.md` |
| MVP-V97-003 | P0 | required | RNG | `createSeededRng("mvp-default")` erzeugt bei fortlaufenden `nextUint32`-Aufrufen desselben RNG-Objekts als erste drei Werte `2072433787`, `2977076701`, `185255773` | `seeded-rng.md` |
| MVP-V97-004 | P0 | required | Map-Generator | `generateMvpMap` verwendet pro Versuch `createSeededRng(makeRngInput([seed, "map", attempt]))` | `seeded-rng.md`, `pathfinding-and-map-generation.md` |
| MVP-V97-005 | P1 | recommended | Tie-Breaker | Kandidatenlisten werden vor seeded Auswahl stabil sortiert | `seeded-rng.md` |


## `mvp-default`-Map-Referenzwerte

| ID | Prioritaet | Status | Bereich | Erwartung | Quelle |
|---|---|---|---|---|---|
| MVP-V98-001 | P0 | required | Map-Generator | `generateMvpMap("mvp-default")` akzeptiert `attempt = 0` und verwendet nicht die Fallback-Karte | `pathfinding-and-map-generation.md`, `seeded-rng.md` |
| MVP-V98-002 | P0 | required | Map-Generator | Die Iron-Ore-Koordinaten fuer `mvp-default` entsprechen exakt `MVP_DEFAULT_IRON_ORE_FIELDS` aus der Kartenreferenz | `pathfinding-and-map-generation.md` |
| MVP-V98-003 | P0 | required | Map-Generator | Die Koordinaten-Signatur fuer `mvp-default` ist `40375871` | `pathfinding-and-map-generation.md`, `seeded-rng.md` |
| MVP-V98-004 | P0 | required | Initiale Sicht | `mvp-default` hat 25 initial sichtbare Felder und 0 initial sichtbare Iron-Ore-Felder | `initial-game-state.md`, `pathfinding-and-map-generation.md` |
| MVP-V98-005 | P1 | recommended | Map-Generator | Die Selektions-Checkpoints fuer garantiertes Cluster und Zusatzcluster entsprechen der Referenztabelle | `pathfinding-and-map-generation.md` |

## Dokumentationshygiene aktiver Dokumente

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| MVP-DOC-001 | P1 | recommended | Dokumentationshygiene | Aktive Fach- und Technikdokumente ausserhalb `CHANGELOG.md` und `docs/archive/**` enthalten keine Arbeitschronik-Abschnitte mit versionsartigen Abschnittstiteln wie `vXX-Hinweis` oder `vXX-Klarstellung` | `docs/00-documentation-guideline.md`, `README.md`, `AGENTS.md` |
| MVP-DOC-002 | P1 | recommended | Quellenprioritaet | `docs/00-documentation-guideline.md` definiert Quelleigentuemer je Themenbereich, und `README.md` sowie `AGENTS.md` verweisen darauf | `docs/00-documentation-guideline.md`, `README.md`, `AGENTS.md` |
| MVP-DOC-003 | P1 | recommended | Dateiverweise | Aktive Markdown-Dateiverweise ausserhalb historischer Bereiche loesen auf existierende Dateien und, bei Ankern, auf existierende Ueberschriften auf | `docs/00-documentation-guideline.md` |
| MVP-DOC-004 | P1 | recommended | Tech-Stack | Aktive MVP-Dokumente verwenden `npm` als einzigen Package Manager, `package-lock.json` als einziges Lockfile und enthalten keine aktive duale npm/pnpm-Freigabe | `docs/02-mvp/mvp-and-tech-stack.md`, `docs/00-documentation-guideline.md`, `AGENTS.md` |
| MVP-DOC-005 | P1 | recommended | Tech-Stack | Aktive MVP-Dokumente dokumentieren Node.js 22.x (`>=22 <23`) als verbindliche Runtime, verwenden in GitHub Actions `node-version: 22` und schreiben `package-lock.json` plus `npm ci` als Lockfile-/Installationsregel vor | `docs/02-mvp/mvp-and-tech-stack.md`, `docs/03-technical/github-pages-deployment.md`, `docs/00-documentation-guideline.md`, `AGENTS.md` |
| MVP-DOC-006 | P1 | recommended | Projektstruktur | `docs/03-technical/implementation-module-structure.md` ist die kanonische Projekt-/Modulstruktur; aktive Strukturbeispiele in Tech-Stack-, Implementierungs- und UI-Dokumenten widersprechen ihr nicht | `docs/03-technical/implementation-module-structure.md`, `docs/02-mvp/mvp-and-tech-stack.md`, `docs/02-mvp/implementation-plan.md`, `docs/04-systems/visual-programming-ui.md` |
| MVP-DOC-007 | P1 | recommended | Architekturvorschlaege | Aktive Dokumente enthalten keine neutral formulierten abweichenden Architekturvorschlaege; verworfene Ordner-/Modulvarianten sind entfernt oder eindeutig als nicht kanonisch beziehungsweise nicht zu verwenden markiert | `docs/03-technical/implementation-module-structure.md`, `docs/00-documentation-guideline.md`, `docs/02-mvp/mvp-and-tech-stack.md`, `docs/02-mvp/implementation-plan.md`, `docs/04-systems/visual-programming-ui.md` |
| MVP-DOC-008 | P1 | recommended | Markdown-Codebloecke | Aktive Markdown-Dateien enthalten nur geschlossene Codebloecke; TypeScript-Codebloecke enthalten keine erklaerende Prosa ausserhalb von TypeScript-Kommentaren | `docs/00-documentation-guideline.md`, `docs/02-mvp/mvp-template-spec.md` |
| MVP-DOC-009 | P1 | recommended | Initiales GameEvent | Aktive Dokumente verwenden fuer das initiale Landungs-Event ausschliesslich `id = event.initialLanding` und `code = system.initialLanding` | `docs/03-technical/diagnostics-and-eventlog.md`, `docs/02-mvp/initial-game-state.md` |
| MVP-DOC-010 | P1 | recommended | Kanonische Typquelle | Vollstaendige TypeScript-Typdefinitionen stehen nur in `canonical-data-model.md`; andere aktive Dokumente fuehren Typbloecke nur als Auszug oder Beispiel | `docs/03-technical/canonical-data-model.md`, `docs/00-documentation-guideline.md` |
| MVP-DOC-011 | P1 | recommended | Batterie-Einheit | Aktive MVP-Regeltexte verwenden Batteriewerte als absolute Punkte (`Batterie <= 1`, `Batterie >= 50`, `-1 Batterie`); Prozentschreibweisen sind nur als UI-Darstellung oder in Future-Dokumenten zulaessig | `docs/04-systems/units-and-energy.md`, `docs/03-technical/simulation-rules.md`, `docs/03-technical/program-stack-rules.md`, `docs/03-technical/action-executability-matrix.md` |

## Expansion 1: Forschung, Stahlwerk, Energiespeicher, Template-Bibliothek

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| EXP1-RES-001 | P0 | required | Forschung | selectResearchProject akzeptiert nur aktivierte Projekte mit erfuellten Voraussetzungen; sonst unknownResearchProject/researchPrerequisiteMissing | `expansion-1-scope.md` |
| EXP1-RES-002 | P0 | required | Forschung | Aktives Zentrum + Projekt erzeugt 1 Punkt/Tick ab Tick N+1 und verbraucht 20 Leistung | `expansion-1-scope.md` |
| EXP1-RES-003 | P0 | required | Forschung | Bei Energiemangel pausiert Forschung ohne Punktverlust (research.paused.insufficientPower) | `expansion-1-scope.md` |
| EXP1-RES-004 | P0 | required | Forschung | Erreichen der Projektkosten setzt completedProjects, Unlock aktiv, Event research.completed | `expansion-1-scope.md` |
| EXP1-RES-005 | P0 | required | Forschung | Projektwechsel erhaelt Fortschritt je Projekt; abgeschlossene Projekte nicht erneut waehlbar | `expansion-1-scope.md` |
| EXP1-RES-006 | P0 | required | Forschung | Ohne aktives Zentrum wird selectResearchProject mit researchCenterMissing abgelehnt | `expansion-1-scope.md` |
| EXP1-STEEL-001 | P0 | required | Stahlwerk | startSteelProduction zieht 2 Iron Ore aus Starter-Cargo beim Start ab (costPaid = true) | `expansion-1-scope.md` |
| EXP1-STEEL-002 | P0 | required | Stahlwerk | Timing-Vertrag: Start Tick N, erster Fortschritt N+1, Abschluss ohne Pausen N+10 | `expansion-1-scope.md` |
| EXP1-STEEL-003 | P0 | required | Stahlwerk | Abschluss legt 1 Steel Plate in Starter-Cargo; bei vollem Cargo Status outputBlocked und Nachholen | `expansion-1-scope.md` |
| EXP1-STEEL-004 | P0 | required | Stahlwerk | Energiemangel pausiert Verarbeitung ohne Kostenerstattung | `expansion-1-scope.md` |
| EXP1-STEEL-005 | P0 | required | Stahlwerk | Zweiter Auftrag waehrend laufendem Auftrag wird mit steelProductionAlreadyRunning abgelehnt | `expansion-1-scope.md` |
| EXP1-STEEL-006 | P0 | required | Stahlwerk | Zu wenig Iron Ore: Ablehnung notEnoughIronOreInStarterCargo ohne Abzug, Event production.steelPlates.blocked.notEnoughOre | `expansion-1-scope.md` |
| EXP1-ESTOR-001 | P0 | required | Energiespeicher | Ueberschuss laedt Speicher (max 50/Tick, Kapazitaet 200) | `expansion-1-scope.md`, `energy-system.md` |
| EXP1-ESTOR-002 | P0 | required | Energiespeicher | Defizit entlaedt Speicher (max 50/Tick) und haelt Verbraucher am Laufen | `expansion-1-scope.md`, `energy-system.md` |
| EXP1-ESTOR-003 | P1 | recommended | Energiespeicher | Mehrere Speicher laden/entladen deterministisch nach BuildingId | `expansion-1-scope.md` |
| EXP1-BUILD-001 | P0 | required | Gebaeude | Expansion-1-Gebaeude sind mit Expansion-1-Kosten baubar (Forschungszentrum 10 Ore, Stahlwerk 8 Ore, Energiespeicher 4 Steel Plates) | `expansion-1-scope.md` |
| EXP1-BUILD-002 | P0 | required | Gebaeude | constructionRequired = 2: Gebaeude wird erst nach zwei abgeschlossenen Bauaktionen active | `expansion-1-scope.md` |
| EXP1-BUILD-003 | P0 | required | Gebaeude | Stahlwerk/Energiespeicher sind erst nach zugehoeriger Forschung baubar (Template locked/nicht verfuegbar) | `expansion-1-scope.md` |
| EXP1-TPL-001 | P0 | required | Template-Bibliothek | addProgramFromTemplate fuegt freigeschaltetes Template ueber Stasis-Laden ein; templateNotUnlocked/duplicateProgram werden abgelehnt | `expansion-1-scope.md` |
| EXP1-TPL-002 | P0 | required | Template-Bibliothek | removeProgram entfernt nicht-locked Programme; Stasis-Laden nicht entfernbar (programLocked) | `expansion-1-scope.md` |
| EXP1-TPL-003 | P1 | recommended | Ausfuehrungslimits | Nach basicAutomation1 ist executionLimit editierbar; Programme mit erreichtem Limit werden uebersprungen | `expansion-1-scope.md` |
| EXP1-GOAL-001 | P0 | required | Abgrenzung | Expansion 1 vergibt keinen Score und aendert goal.mvpReached nicht | `expansion-1-scope.md` |
| EXP1-E2E-001 | P0 | required | End-to-End | Ein Run erreicht: Forschungszentrum aktiv -> metalProcessing1 erforscht -> Stahlwerk gebaut -> erste Steel Plate im Cargo | `expansion-1-scope.md` |
| EXP1-DOC-001 | P1 | recommended | Doku | expansion-1-scope.md ist Quelleigentuemer des Expansion-1-Umfangs und in der Guideline-Tabelle eingetragen | `docs/00-documentation-guideline.md` |

## Expansion 2: Logistik und Ladenetz

Regelquelle: `docs/02-mvp/expansion-2-scope.md`.

| Test-ID | Priorität | Status | Bereich | Erwartung | Quelle |
|---|---:|---|---|---|---|
| EXP2-RES-001 | P0 | required | Forschung | `research.transportLogistics1` erfordert `metalProcessing1`, kostet 500 und schaltet Speicher/Gridline/Transporter/Logistik frei | `expansion-2-scope.md` |
| EXP2-BUILD-001 | P0 | required | Gebaeude | Ressourcenspeicher ist nach Unlock baubar (3 Steel Plates, 2 Bauaktionen) und hat storage-Inventar Kapazitaet 100 | `expansion-2-scope.md` |
| EXP2-BUILD-002 | P0 | required | Gebaeude | Gridline ist baubar (1 Steel Plate, 1 Bauaktion) nur orthogonal an ein Energienetz-Element | `expansion-2-scope.md` |
| EXP2-BUILD-003 | P0 | required | Bewegung | Gridline-Felder sind begehbar; Roboter koennen sie durchqueren | `expansion-2-scope.md` |
| EXP2-CHG-001 | P0 | required | Ladenetz | Ladezonen: neben Solar/Energiespeicher, auf und neben Gridline | `expansion-2-scope.md` |
| EXP2-CHG-002 | P0 | required | Ladenetz | charging-Task laedt +5/Tick und verbraucht 5 Leistung; pausiert ohne Leistung ohne Batterieverlust | `expansion-2-scope.md` |
| EXP2-CHG-003 | P0 | required | Ladenetz | action.charge plant Weg zur naechsten Ladezone (Commitment) und endet bei targetBattery | `expansion-2-scope.md` |
| EXP2-CHG-004 | P0 | required | Ladenetz | Ladeverbraucher kommen nach Gebaeudeverbrauchern, Reihenfolge nach RobotId | `expansion-2-scope.md` |
| EXP2-TRANS-001 | P0 | required | Produktion | startTransportRobotProduction zieht 4 Steel Plates aus Starter-Cargo; Timing-/Spawnregeln wie Iron Miner | `expansion-2-scope.md` |
| EXP2-TRANS-002 | P0 | required | Produktion | Transporter spawnt mit Batterie 80/120, Cargo 30 und Stack logistics + rechargeAtGrid | `expansion-2-scope.md` |
| EXP2-MINER-001 | P0 | required | Iron Miner | Neu gespawnte Iron Miner erhalten Stack mineIronOre + exploreNearby + rechargeAtGrid und minen autonom | `expansion-2-scope.md` |
| EXP2-INV-001 | P0 | required | Stahlwerk | Auto-Modus startet Verarbeitung bei input >= 2 und freiem Output; Ergebnis landet im output-Inventar | `expansion-2-scope.md` |
| EXP2-REQ-001 | P0 | required | Requests | supplyBuildingInput entsteht bei Stahlwerk-Input < 2; Menge min(4, freie Kapazitaet) | `expansion-2-scope.md` |
| EXP2-REQ-002 | P0 | required | Requests | clearBuildingOutput entsteht bei Stahlwerk-Output > 0 mit Ziel Speicher | `expansion-2-scope.md` |
| EXP2-REQ-003 | P0 | required | Requests | moveToStorage entsteht bei Arbeitsroboter-Cargo >= 80 % | `expansion-2-scope.md` |
| EXP2-REQ-004 | P0 | required | Requests | Quellenprioritaet Speicher > Gebaeude-Output > Roboter-Cargo; Quelle und Menge werden gebunden und reserviert | `expansion-2-scope.md` |
| EXP2-REQ-005 | P0 | required | Requests | Keine Teillieferungen: fehlende Menge/Zielkapazitaet fuehrt zu blocked mit konkretem Grund, Reservierung freigegeben | `expansion-2-scope.md` |
| EXP2-REQ-006 | P0 | required | Requests | Zuweisung: freie Transporter nach RobotId, Requests nach Prioritaet/createdTick/RequestId; Commitment bis fulfilled/blocked | `expansion-2-scope.md` |
| EXP2-REQ-007 | P0 | required | Requests | Request-Ids folgen request.<typ>.<tick6>.<seq2> | `deterministic-id-generation.md` |
| EXP2-LOG-001 | P0 | required | LogisticsTask | Phasen moveToPickup -> pickup (1 Tick) -> moveToDelivery -> delivery (1 Tick); Pickup/Delivery ohne Batteriekosten | `expansion-2-scope.md` |
| EXP2-LOG-002 | P0 | required | LogisticsTask | Blockade beim Ziel: Request blocked, Ressourcen bleiben im Roboter-Cargo, Neubewertung im Folgetick | `expansion-2-scope.md` |
| EXP2-E2E-001 | P0 | required | End-to-End | Nach Setup (Forschung, Speicher, Gridline, 1 Transporter) produziert die Kette ohne weitere Commands mindestens 3 Steel Plates; kein Roboter faellt dauerhaft aus | `expansion-2-scope.md` |
| EXP2-E2E-002 | P0 | required | Determinismus | Zwei identische Laeufe liefern identische Endzustaende (Snapshot) | `expansion-2-scope.md` |
| EXP2-E2E-003 | P1 | recommended | Livelock-Waechter | 3000-Tick-Langlauf ohne Deadlock: Steel-Plate-Bestand waechst weiter | `expansion-2-scope.md` |
| EXP2-DOC-001 | P1 | recommended | Doku | tick-pipeline.md dokumentiert die Schritt-3-Erweiterung 3a-3d | `tick-pipeline.md` |
