# Tick Pipeline

## Status

Dieses Dokument ist die einzige kanonische Quelle fuer die Simulationsreihenfolge pro Tick.

Andere Dokumente duerfen Tick-Details beschreiben, aber keine eigene abweichende Schrittfolge fuehren. Wenn ein Widerspruch entsteht, gilt dieses Dokument.

## Grundregel

Ein Tick ist deterministisch. Gleicher State, gleicher Seed und gleiche PlayerCommands erzeugen denselben Folgestate.

Ein Tick entspricht im MVP einer Spielsekunde.

## Kanonische Pipeline

```text
1. PlayerCommands validieren und anwenden
2. EnergySnapshot berechnen
3. ProductionTasks verarbeiten
4. Spawn-Pruefungen ausfuehren
5. Laufende RobotTasks verarbeiten
6. abgeschlossene oder abgebrochene RobotTasks anwenden
7. Sicht und Fog-of-War aktualisieren
8. ProgramStacks fuer freie aktive Roboter auswerten
9. Score und MVP-Ziel aktualisieren
10. Events sammeln, deterministisch sortieren, normalisieren und deduplizieren
11. UI-State ableiten oder aktualisieren
```

Diese Reihenfolge ist verbindlich fuer Simulation, Tests und Implementierungsplanung.

## 1. PlayerCommands validieren und anwenden

Commands werden vor Simulationseffekten verarbeitet. Jeder Command liefert ein `CommandResult`; die vollständige Validierungsmatrix steht in `docs/03-technical/player-command-handling.md`.

Beispiele:

```text
pause/resume/setSpeed
selectRobot/selectBuilding/selectField
toggleProgramEnabled/moveProgramUp/moveProgramDown/updateProgram
startIronMinerProduction
resetRun
```

`startIronMinerProduction`:

```text
prueft nicht freePower
zieht bei Erfolg 5 Iron Ore aus Startroboter-Cargo ab
erzeugt ProductionTask mit remainingTicks = 10
setzt createdTick = currentTick
setzt startedTick = currentTick
```

ProductionTask-Timing-Vertrag:

```text
Starttick N:
  Command wird in Schritt 1 akzeptiert.
  createdTick = N.
  startedTick = N.
  remainingTicks = 10.
  status = inProgress.
  Der neue Task wird im selben Tick nicht in Schritt 3 verarbeitet.
  Kein Fortschritt.
  Kein Pause-Event wegen Energiemangel.
  Kein readyToSpawn.
  Kein Spawnversuch.

Tick N+1:
  erster moeglicher Fortschrittstick.
  Bei ausreichender Produktionsleistung: remainingTicks 10 -> 9.
  Bei unzureichender Produktionsleistung: remainingTicks bleibt 10, blockedReason = insufficientPower.

Tick N+10 ohne Pausen:
  zehnter Fortschrittstick.
  remainingTicks 1 -> 0.
  status wird readyToSpawn.
  Spawn-Pruefung erfolgt in Schritt 4 desselben Ticks.
```

Implementierungsregel:

```text
Ein ProductionTask ist in Schritt 3 nur fortschrittsberechtigt, wenn productionTask.status = inProgress und productionTask.startedTick < currentTick.
```

## 2. EnergySnapshot berechnen

```text
powerProvided = Summe active + enabled Solar Collector
powerRequired = Summe fortschrittsberechtigter laufender ProductionTasks mit Leistungsbedarf
freePower = powerProvided - powerRequired
```

Nur Tasks mit `status = inProgress` und `startedTick < currentTick` zaehlen in `powerRequired`. Ein in Schritt 1 desselben Ticks neu erzeugter `ProductionTask` ist fuer diesen EnergySnapshot noch nicht fortschrittsberechtigt und erzeugt noch keinen aktuellen Tick-Bedarf.

Gebaeudeenergie ist im MVP nur fuer ProductionTasks relevant. In Expansion 1 zaehlen
zusaetzlich fortschrittsberechtigte Stahlwerk-Auftraege und aktive Forschung in
`powerRequired`; aktive Energiespeicher gleichen Defizit/Ueberschuss nach der
Speicherregel in `docs/02-mvp/expansion-1-scope.md` aus.

Externe Roboterladung wird im MVP nicht verarbeitet. Es gibt daher keine Priorisierung zwischen Produktion und Roboterladung.

## 3. ProductionTasks verarbeiten

Expansion-1-Erweiterung: Schritt 3 verarbeitet alle Gebaeudetasks in fester Reihenfolge —
pro Gebaeude nach BuildingId sortiert, je Gebaeude erst `ProductionTask`, dann
`SteelProductionTask`, dann Forschungsfortschritt. Der Timing-Vertrag
(`startedTick < currentTick`) gilt fuer alle drei gleichermassen; die Fachregeln stehen
in `docs/02-mvp/expansion-1-scope.md`.

Verarbeitet werden nur fortschrittsberechtigte `ProductionTask`s:

```text
productionTask.status = inProgress
AND productionTask.startedTick < currentTick
```

Bei ausreichender Leistung:

```text
remainingTicks -= 1
status = inProgress
blockedReason = undefined
```

Bei unzureichender Leistung:

```text
remainingTicks bleibt gleich
status = inProgress
blockedReason = insufficientPower
Event production.ironMiner.paused.insufficientPower kann erzeugt und spaeter dedupliziert werden
```

Ein in Tick N gestarteter `ProductionTask` kann daher fruehestens in Tick N+1 pausieren oder Fortschritt erhalten. ProductionTasks pausieren bei Energiemangel. Sie brechen dadurch nicht ab und erstatten keine Kosten.

## 4. Spawn-Pruefungen ausfuehren

Wenn ein ProductionTask in Schritt 3 `remainingTicks <= 0` erreicht, wird der Spawn in Schritt 4 desselben Ticks geprueft.

```text
freies orthogonales Spawn-Feld suchen
wenn vorhanden: ironMiner Robot-Entity einfuegen und ProductionTask entfernen
wenn nicht vorhanden: status = spawnBlocked, blockedReason = noFreeOutputField
```

Bei `spawnBlocked` wird in spaeteren Ticks erneut ein Spawn-Feld geprueft.

Zeitachse ohne Pause fuer einen Start in Tick N:

```text
Tick N:    ProductionTask angelegt, remainingTicks = 10, keine Verarbeitung
Tick N+1:  erster Fortschritt, remainingTicks = 9
Tick N+2:  zweiter Fortschritt, remainingTicks = 8
...
Tick N+9:  neunter Fortschritt, remainingTicks = 1
Tick N+10: zehnter Fortschritt, remainingTicks = 0, status wird readyToSpawn, Spawn-Pruefung erfolgt
```

Wichtig:

```text
readyToSpawn und spawnBlocked geben keinen Score.
Score und MVP-Ziel erst nach erfolgreichem Einfuegen der ironMiner-Robot-Entity.
```

## 5. Laufende RobotTasks verarbeiten

Laufende RobotTasks werden in stabiler Reihenfolge nach Robot-ID verarbeitet.

MVP-Tasktypen:

```text
movement
mining
building
stasisCharging
```

Regeln:

```text
Bewegung: maximal ein erfolgreicher Schritt pro Tick
Mining: remainingTicks herunterzaehlen, Abschluss pruefen
Building: remainingTicks herunterzaehlen, Abschluss pruefen
StasisCharging: Batterie pro Tick erhoehen, Stop-Bedingung pruefen
```

Ein in Schritt 8 neu gestarteter RobotTask erhaelt seinen ersten Fortschritt erst in einem spaeteren Tick.

## 6. abgeschlossene oder abgebrochene RobotTasks anwenden

In diesem Schritt werden Task-Enden wirksam:

```text
MovementTask: Position/Batterie/Blockadezustand finalisieren
MiningTask: bei Erfolg Cargo +1 und Ore amount -1; bei Abbruch kein Ergebnis
BuildingTask: bei Erfolg constructionProgress +1; bei Abbruch kein Teilfortschritt
StasisChargingTask: bei Zielbatterie Roboterstatus auf active setzen
```

Nach Abschluss oder Abbruch wird der Task entfernt. Der Roboter kann in Schritt 8 wieder den ProgramStack pruefen, wenn er active und frei ist.

## 7. Sicht und Fog-of-War aktualisieren

Sicht wird nach Positions-, Spawn- und Gebaeudezustandsaenderungen aktualisiert.

Sichtquellen im MVP:

```text
aktive Roboter
active + enabled MVP-Gebaeude
```

Die Distanzregel und die detaillierten Sichtzustands-Übergänge stehen in `pathfinding-and-map-generation.md`.

In diesem Schritt gilt verbindlich:

```text
currentVisibleFields berechnen
Felder in currentVisibleFields -> visible
Felder außerhalb currentVisibleFields, die vorher visible/discovered waren -> discovered
Felder, die nie sichtbar waren -> unknown
```

`visible` ist der aktuelle Sichtzustand dieses Ticks. `discovered` ist der bekannte, aber aktuell nicht sichtbare Zustand. `unknown` bedeutet: nie sichtbar gewesen.

## 8. ProgramStacks fuer freie aktive Roboter auswerten

Nur Roboter mit:

```text
status = active
kein laufender RobotTask
```

pruefen ihren Stack.

Reihenfolge:

```text
Roboter nach Robot-ID
Programme von oben nach unten
ProgramRows innerhalb eines Programms von oben nach unten
```

Nicht ausfuehrbare Aktionen:

```text
kein State-Effekt ausser Diagnose
naechste Row bzw. naechstes Programm pruefen
```

Ausfuehrbare Aktionen:

```text
Task oder Soforteffekt starten
Stack-Auswertung stoppt fuer diesen Roboter
```

## 9. Score und MVP-Ziel aktualisieren

Score/Ziel-Regeln folgen `scoring-and-win-conditions.md`.

MVP-Ziel:

```text
erster erfolgreicher Spawn von robot.type = ironMiner
```

Das Ziel darf nicht bei `ProductionTask.remainingTicks = 0`, `readyToSpawn` oder `spawnBlocked` gesetzt werden.

Wenn in diesem Schritt ein Goal-Event erzeugt wird, bleibt seine Event-Sequenz nach den eigentlichen Spawn-/Produktionsereignissen desselben Ticks. Beispiel:

```text
production.ironMiner.spawned vor goal.mvpReached
```

## 10. Events sammeln, deterministisch sortieren, normalisieren und deduplizieren

Events werden waehrend der Schritte 1-9 als Event-Kandidaten erzeugt. In diesem Schritt werden sie nach `docs/03-technical/deterministic-id-generation.md` sortiert, dedupliziert und mit stabilen Runtime-IDs versehen.

Verbindliche Regel:

```text
Event-IDs werden erst nach der kanonischen Event-Sequenz vergeben.
seq3 folgt nicht der zufaelligen Laufzeitreihenfolge eines Arrays oder Frameworks.
```

Player Events werden dedupliziert. Debug Events bleiben fuer Diagnosezwecke einzeln sichtbar, sofern sie in den kanonischen Eventlog geschrieben werden.

Tests pruefen stabile `event.code`-Werte und bei Sequenztests stabile `event.id`-Reihenfolgen, nicht UI-Text.

## 11. UI-State ableiten oder aktualisieren

UI-State ist aus GameState und UiState ableitbar.

Die UI darf keine Spielregeln ausloesen, sondern nur PlayerCommands senden.

## Expansion-2-Erweiterung von Schritt 3

Ab Expansion 2 (`docs/02-mvp/expansion-2-scope.md`) gliedert sich Schritt 3 verbindlich in:

```text
3a ProductionTasks (Roboterfabrik: ironMiner, transportRobot)
3b Stahlwerk-Tasks inklusive Auto-Start aus dem Input-Inventar
3c Forschung
3d MaterialRequests: Ausloeser pruefen, Requests erzeugen, Quellen binden,
   freie Transportroboter zuweisen
```

Die Ausfuehrung der zugewiesenen Requests (logistics-Tasks) und des externen Ladens
(charging-Tasks) laeuft als RobotTasks in Schritt 5. Die Energie-Zuteilung in Schritt 2
behandelt Ladeverbraucher nach allen Gebaeudeverbrauchern (Reihenfolge nach RobotId).

## Nicht Teil der Tick-Pipeline

Nicht MVP-aktiv:

```text
externe Roboterladung ueber Netzleistung
Priorisierung zwischen Produktion und externer Roboterladung
Kommunikationsgrid-Berechnung
lokale Energienetze
Transport-/Logistiksystem
Kampf-/Schadenssimulation
```
