# Simulationsregeln

## Tick

- 1 Tick = 1 Spielsekunde.
- Simulation ist deterministisch.
- UI löst keine Spielregeln aus, sondern sendet nur Spieleraktionen.

## Batterie

Batteriewerte sind absolute Batteriepunkte. Die kanonische Einheitendefinition steht in `docs/04-systems/units-and-energy.md`. Alle MVP-Robotertypen verwenden `batteryMax = 100`; 1 Batteriepunkt entspricht damit 1 %.

- Bewegung: Kosten nach erfolgreichem Schritt.
- Mining: Kosten nach erfolgreicher Abbauaktion.
- Bau: Kosten nach erfolgreichem Baufortschritt.
- Wenn Batterie vorab nicht reicht, startet die Aktion nicht.

## Energie

- Solar Collector liefert 50 Leistung, wenn `active` und `isEnabled = true`.
- Roboterfabrik verbraucht 40 Leistung während ProductionTask-Fortschritt.
- Deaktivierte Gebäude liefern/verbrauchen keine Leistung.
- MVP-Energie ist ein globaler Power-Pool.
- Gebäudeenergie beeinflusst nur ProductionTasks.
- Externe Roboterladung ist nicht MVP-aktiv.
- Stasis-Laden verbraucht keine Gebäudeenergie.

## Bau

- Gebäude blockieren Bewegung.
- Baustellen blockieren Bewegung.
- Bauen nur auf orthogonal angrenzendem Feld.
- Kein Bau auf aktivem Ressourcenfeld.
- Bau auf erschöpftem Iron Ore ist erlaubt, wenn Terrain bebaubar ist.
- Mehrere Roboter können später Baufortschritt addieren.

## Terrain

MVP aktiv:

- `plains`

Vorbereitet:

- `rubble`
- `lavaRiver`
- `mercuryRiver`
- `flying`

## HP

- Standard MaxHP 100.
- MVP hat keine aktiven Schadensquellen.
- HP wird aber in Datenmodell und UI angezeigt.

## Produktionssimulation

Roboterfabriken verarbeiten im MVP maximal einen `ProductionTask`.

Tick-Regeln:

```text
Wenn productionTask.status = inProgress
AND productionTask.startedTick < currentTick
AND Roboterfabrik aktiv
AND freie Leistung fuer Produktion >= productionTask.powerRequired
THEN productionTask.remainingTicks -= 1
```

Wenn der Task fortschrittsberechtigt ist und Leistung fehlt:

```text
remainingTicks bleibt gleich
status bleibt inProgress
blockedReason = insufficientPower
Diagnose: Nicht genug freie Leistung
```

Wenn `productionTask.startedTick = currentTick`, wird der Task in diesem Tick nicht verarbeitet. Er erzeugt in diesem Tick auch kein Pause-Event und keinen Leistungsbedarf im EnergySnapshot.

Kanonischer Timing-Vertrag:

```text
Starttick N:
  createdTick = N
  startedTick = N
  remainingTicks = 10
  keine Verarbeitung in diesem Tick
  kein Leistungsbedarf im EnergySnapshot
  kein Fortschritt
  kein insufficientPower-Pause-Event
  kein readyToSpawn
  kein Spawnversuch

Tick N+1:
  erster moeglicher Fortschritt oder erste moegliche Pause

Tick N+10 ohne Pausen:
  remainingTicks erreicht 0
  status wird readyToSpawn
  Spawn-Pruefung erfolgt im selben Tick nach der ProductionTask-Verarbeitung
```

Wenn `remainingTicks <= 0`:

```text
status = readyToSpawn
completedTick = currentTick
```

Danach prüft die Simulation ein freies orthogonales Ausgabefeld. Bei mehreren gültigen Ausgabefeldern entscheidet seeded random nach `docs/03-technical/seeded-rng.md` mit dem Kontext-Seed `spawnSite` über stabil sortierten Kandidaten.

Wenn Feld frei:

```text
Iron Miner erzeugen
productionTask entfernen
Score aktualisieren
mvpGoalReached = true erst nach erfolgreichem Spawn
```

Wenn kein Feld frei:

```text
status = spawnBlocked
blockedReason = noFreeOutputField
```

Bei `spawnBlocked` wird in späteren Ticks erneut geprüft, ob ein Ausgabefeld frei geworden ist.

## Bausimulation

Baukosten werden beim Start des Bauauftrags abgezogen.

Start eines Bauauftrags:

```text
Ressourcen im Cargo prüfen
Baufeld prüfen
Kosten abziehen
Building mit status = construction erzeugen
constructionProgress = 0
constructionRequired = 1
```

Eine Bauaktion:

```text
Dauer: 10 Ticks
bei erfolgreichem Abschluss:
constructionProgress += 1
Batteriekosten abziehen
```

Wenn `constructionProgress >= constructionRequired`:

```text
status = active
Event `action.build.completed` mit `details.mode = buildingTask.mode` schreiben
Score aktualisieren
```

Wenn die Bauaktion unterbrochen wird:

```text
Baustelle bleibt bestehen
keine Rückerstattung
keine erneute Kostenzahlung beim Fortsetzen
Stack-Prüfung beginnt wieder oben
```

Im MVP können Baustellen nicht manuell abgebrochen werden.

## Energiesimulation: Roboterladung

Externe Roboterladung ist im MVP nicht aktiv.

Aktiv:

```text
Stasis-Laden lädt mit +1 Batterie pro Tick.
Stasis-Laden verbraucht keine Netzleistung.
Stasis-Laden stoppt bei battery >= 50.
```

Nicht aktiv:

```text
Solar Collector lädt angrenzende Roboter.
Externes Laden verbraucht freie Leistung.
Mehrere externe Ladequellen werden verteilt.
Roboterfabrik-Produktion konkurriert mit Roboterladung um Leistung.
```

Gebäudeenergie wird separat als globaler Power-Pool berechnet und nur für ProductionTasks verwendet.

## Kommunikationssimulation

Das Kommunikationsgrid ist im MVP deaktiviert.

```text
MVP_COMMUNICATION_GRID_ACTIVE = false
```

Die Simulation führt im MVP keine Kommunikationsgrid-Berechnung aus.

Nicht ausgeführt im MVP:

- Reichweitenberechnung für Gebäude
- Sendeturmreichweiten
- Grid-Abdeckung
- disconnected/offline durch fehlendes Grid
- scoutLocked-Verhalten
- Blockieren von Bewegung wegen Kommunikation
- Blockieren von Programmänderungen wegen Kommunikation

Alle MVP-Einheiten gelten als `connected`.

MVP-Defaults:

```text
Starter Roboter: autonomous + connected
Iron Miner: gridRequired + connected
```

`gridRequired` ist beim Iron Miner nur vorbereitende Typisierung und hat im MVP keine Gameplay-Wirkung.

## Map-Generierung

Die MVP-Karte wird durch `generateMvpMap(seed, config)` erzeugt.

Regeln:

- bis zu 100 Generierungsversuche
- pro Versuch deterministischer RNG aus `createSeededRng(makeRngInput([seed, "map", attempt]))` nach `seeded-rng.md`
- nach jedem Versuch Fairness-Validierung
- bei Erfolg Karte zurückgeben
- bei 100 Fehlschlägen Fallback-Karte verwenden

Fairness-Validierung:

```text
10x10
Startposition { x: 5, y: 5 }
20 Iron-Ore-Felder
20 Iron Ore pro Feld
kein Iron Ore im initial sichtbaren Bereich
mindestens ein Iron-Ore-Feld in BFS-Distanz 4-6
alle Felder plains
```

Initiale Sicht:

```text
quadratischer Radius 2 um Start = visible
alle anderen Felder = unknown
```

## Bewegung, Pfadfindung und Kollisionen

Tick-Regel fuer Roboterbewegung:

```text
1. Roboter nach Robot-ID sortieren.
2. Pro Roboter aktuellen Pfad per BFS berechnen oder validieren.
3. naechsten Schritt pruefen.
4. wenn Zielfeld frei ist: bewegen, Batterie abziehen, blockedByRobotTicks = 0
5. wenn Zielfeld durch Roboter blockiert ist: blockedByRobotTicks += 1
6. wenn blockedByRobotTicks >= 3: Aktion abbrechen, Diagnose schreiben, Stack neu pruefen
7. wenn permanent blockiert oder kein Pfad: Aktion abbrechen
```

Bewegung:

```text
nur orthogonal
1 Feld pro Tick
1 Batterie pro erfolgreichem Schritt
```

Begehbarkeit:

```text
plains = begehbar
Gebaeude = blockiert
Baustelle = blockiert
aktive Ressource = blockiert
anderer Roboter = temporaer blockiert
Kartenrand/ausserhalb = blockiert
```

Nicht MVP:

- diagonale Bewegung
- Platztausch
- Pfadreservierungen
- Ausweichlogik
- Pushen
- Traffic-System

## Long-Task-Timing

Long-Task-Timing ist präzisiert.

## Grundprinzip

Long Tasks verwenden einen festen Lebenszyklus:

```text
Startprüfung
→ Task anlegen
→ remainingTicks herunterzählen
→ Abschlussprüfung
→ Ergebnis anwenden oder Abbruch
→ Stack neu prüfen
```

Long Tasks sind Aktionen, die länger als einen Tick dauern oder über mehrere Ticks Fortschritt speichern.

MVP-Long-Task-Typen:

```text
MiningTask
BuildTask
ProductionTask
StasisChargingTick
```

Bewegung ist kein Long Task, sondern ein Ein-Tick-Schritt.

## Tick-Grundlage

```text
1 Tick = 1 Sekunde
```

MVP-Dauern:

```text
Bewegung: 1 Tick
Mining: 10 Ticks
Bauaktion: 10 Ticks
Produktion Iron Miner: 10 Fortschrittsticks
Laden: kontinuierlich pro Tick
```

## Start und erster Fortschritt

Ein Long Task startet in Tick N.

Regel:

```text
Task startet in Tick N.
Erster Fortschritt wird in Tick N+1 verarbeitet.
```

Start und erster Fortschritt sind getrennte Simulationsschritte. Das gilt auch fuer `ProductionTask`s, obwohl `startIronMinerProduction` in Schritt 1 und `ProductionTasks verarbeiten` in Schritt 3 derselben Tick-Pipeline liegen. Ein in Tick N erzeugter `ProductionTask` ist in Tick N nicht fortschrittsberechtigt.

Kanonische Eligibility-Regel:

```text
productionTaskProgressEligible = productionTask.status = inProgress AND productionTask.startedTick < currentTick
```

Diese Regel ist identisch mit `tick-pipeline.md` und `production-and-spawn.md`. Tests muessen Starttick, Folgetick und Abschlusszeitpunkt gegen diese Bedingung pruefen.

## Startprüfung

Beim Start eines Long Tasks müssen geprüft werden:

```text
Bedingungen erfüllt
Ziel gültig
Ziel erreichbar oder Roboter korrekt positioniert
Aktion ausführbar
Mindestenergie vorhanden
Cargo-/Ressourcenbedingungen erfüllt
```

Wenn eine Startprüfung fehlschlägt:

```text
kein Task wird angelegt
Diagnose schreiben
Stack-Prüfung beginnt wieder oben
```

## Fortschritt

Ein laufender RobotTask enthält:

```text
totalTicks
remainingTicks
```

Pro erfolgreichem Fortschrittstick:

```text
remainingTicks -= 1
```

Wenn:

```text
remainingTicks <= 0
```

Dann wird die Abschlussprüfung ausgeführt.

## Abschlussprüfung

Beim Abschluss eines Long Tasks wird erneut geprüft, ob das Ziel noch gültig ist.

Beispiele:

```text
Mining:
- Roboter steht noch neben Iron Ore
- Ore amount > 0
- Cargo hat Platz

Bauen:
- Roboter steht noch neben Baustelle
- Baustelle existiert
- Baustelle ist noch status = construction
```

Wenn die Abschlussprüfung fehlschlägt:

```text
kein Ergebnis
keine Batteriekosten
Task endet
Diagnose schreiben
Stack-Prüfung beginnt wieder oben
```

## Batteriekosten

Batteriekosten für Long Tasks werden erst bei erfolgreichem Abschluss abgezogen.

MVP-Regeln:

```text
Mining: -1 Batterie bei erfolgreichem Abschluss
Bauaktion: -1 Batterie bei erfolgreichem Abschluss
Bewegung: -1 Batterie nach erfolgreichem Bewegungsschritt
```

Wenn ein Mining- oder Bau-Task vor Abschluss abbricht:

```text
keine Batteriekosten
kein Ergebnis
```

## Teilfortschritt

Mining- und Bauaktionen speichern innerhalb ihrer 10-Tick-Aktion keinen Teilfortschritt.

Mining bei Abbruch nach 5/10 Ticks:

```text
kein Iron Ore
keine Batteriekosten
Task endet
```

Bauaktion bei Abbruch nach 5/10 Ticks:

```text
constructionProgress bleibt unverändert
Baustelle bleibt bestehen
keine Batteriekosten
keine erneuten Baukosten beim Fortsetzen
```

Wichtig: Die Baustelle selbst speichert Fortschritt nur in abgeschlossenen Bauaktionen.

```text
Eine abgeschlossene Bauaktion:
constructionProgress += 1
```

## MiningTask

```text
Dauer: 10 Ticks
Batteriekosten: 1 Batterie
Kostenzeitpunkt: erfolgreicher Abschluss
Ergebnis: +1 Iron Ore im Cargo, -1 amount auf Ore-Feld
```

Startprüfung:

```text
Roboter steht neben Iron Ore oder kann dorthin gelangen
Iron Ore amount > 0
Cargo nicht voll
Mindestenergie vorhanden
```

Abschlussprüfung:

```text
Roboter steht neben Iron Ore
Iron Ore amount > 0
Cargo hat Platz
Batterie reicht für Abschlusskosten
```

Erfolgreicher Abschluss:

```text
Cargo +1 Iron Ore
Ore-Feld amount -= 1
Batterie -= 1
Score +1 minedIronOre
```

Abbruchgründe:

```text
targetInvalid
resourceDepleted
cargoFull
notAdjacentToTarget
insufficientBattery
```

## BuildTask

```text
Dauer: 10 Ticks pro Bauaktion
Batteriekosten: 1 Batterie
Kostenzeitpunkt: erfolgreicher Abschluss der Bauaktion
Ergebnis: constructionProgress += 1
```

Baukosten:

```text
werden beim Start des Bauauftrags abgezogen
nicht beim Abschluss der Bauaktion
```

Startprüfung:

```text
Baustelle existiert oder Bauauftrag kann gestartet werden
Roboter steht neben Baufeld/Baustelle oder kann dorthin gelangen
Mindestenergie vorhanden
```

Abschlussprüfung:

```text
Roboter steht neben Baustelle
Baustelle existiert
Baustelle status = construction
Batterie reicht für Abschlusskosten
```

Erfolgreicher Abschluss:

```text
constructionProgress += 1
Batterie -= 1
```

Wenn:

```text
constructionProgress >= constructionRequired
```

Dann:

```text
status = active
Event `action.build.completed` mit `details.mode = buildingTask.mode` schreiben
Score aktualisieren
Stack neu prüfen
```

Abbruch:

```text
kein constructionProgress
keine Batteriekosten
Baustelle bleibt bestehen
bereits gezahlte Baukosten bleiben gezahlt
Fortsetzen kostet keine Ressourcen erneut
```

## ProductionTask

Produktion ist ein Gebäudetask, kein Roboterprogramm.

```text
Dauer: 10 Fortschrittsticks
Kosten: 5 Iron Ore
Kostenzeitpunkt: Start des ProductionTask
Leistungsbedarf: 40
```

Start-Timing:

```text
Wenn startIronMinerProduction in Tick N akzeptiert wird:
  createdTick = N
  startedTick = N
  remainingTicks = 10
  status = inProgress
  Fortschritt in Tick N = ausgeschlossen
  Pause-Event in Tick N = ausgeschlossen
  readyToSpawn in Tick N = ausgeschlossen
  Spawnversuch in Tick N = ausgeschlossen
```

Fortschritt:

```text
Nur wenn startedTick < currentTick:
  Wenn verfügbare Leistung für Produktion >= 40:
    remainingTicks -= 1

  Wenn verfügbare Leistung < 40:
    remainingTicks bleibt unverändert
    Produktion pausiert
```

In Tick N selbst bleibt ein neu gestarteter `ProductionTask` bei `remainingTicks = 10`. Fehlende Leistung bricht Produktion nicht ab und erzeugt fuer diesen neuen Task erst ab Tick N+1 einen Pauseeffekt.

Zeitachse ohne Pause:

```text
Tick N:    remainingTicks = 10, keine Verarbeitung
Tick N+1:  remainingTicks = 9
Tick N+2:  remainingTicks = 8
...
Tick N+9:  remainingTicks = 1
Tick N+10: remainingTicks = 0, readyToSpawn, Spawn-Pruefung
```

Wenn:

```text
remainingTicks <= 0
```

Dann:

```text
status = readyToSpawn
```

Spawn-Regeln werden separat in `production-and-spawn.md` beschrieben.

## StasisChargingTick

Stasis-Laden ist kein 10-Tick-Task, sondern ein kontinuierlicher Tick-Effekt.

MVP-Regeln:

```text
Stasis-Laden: +1 Batterie/Tick
externes Laden: Future, nicht MVP-aktiv
Netzverbrauch: 0
```

Anwendung:

```text
Batterie wird am Ende jedes Lade-Ticks erhöht.
Batterie kann nie über batteryMax steigen.
```

Technisch:

```ts
battery = Math.min(batteryMax, battery + chargeAmount);
```

Stop-Bedingungen bei Laden werden pro Tick geprüft.

## Stop-Bedingungen

Laden:

```text
Stop-Bedingung pro Tick prüfen.
```

Mining und Bauen:

```text
Stop-Bedingungen werden beim Abschluss oder Abbruch geprüft.
Kein permanenter Stop mitten im 10-Tick-Task.
```

Produktion:

```text
kein Roboterprogramm
eigener ProductionTask-Status
```

## Pausieren vs. Abbrechen

MVP-Regeln:

```text
MiningTask:
bricht ab, wenn Ziel ungültig wird, Roboter nicht mehr korrekt steht oder Abschlussprüfung fehlschlägt.

BuildTask:
bricht aktuelle Bauaktion ab, aber Baustelle bleibt bestehen.

ProductionTask:
pausiert bei fehlender Leistung, bricht nicht ab.

StasisChargingTick:
läuft kontinuierlich pro Tick, solange der Roboter in Stasis lädt. Externe Ladepositionen sind Future und nicht MVP-aktiv.
```

## Tick-Reihenfolge MVP

Die einzige kanonische Tick-Reihenfolge steht in:

```text
docs/03-technical/tick-pipeline.md
```

Dieses Dokument beschreibt nur Detailregeln fuer einzelne Simulationsschritte. Es darf keine abweichende Schrittfolge definieren.

Wichtige Abgrenzung:

```text
Externe Roboterladung wird im MVP nicht verarbeitet.
Produktion konkurriert daher nicht mit Roboterladung um Leistung.
Stasis-Laden wird als RobotTask/ChargingTick innerhalb der kanonischen Pipeline verarbeitet.
```

## Diagnosegründe

Neue bzw. präzisierte Task-Diagnosen:

```text
Task gestartet
Task abgeschlossen
Task abgebrochen: Ziel ungültig
Task abgebrochen: Batterie reicht nicht
Task abgebrochen: Cargo voll
Task abgebrochen: Ressource erschöpft
Task abgebrochen: Roboter nicht mehr angrenzend
Produktion pausiert: Nicht genug freie Leistung
Laden gestoppt: Stop-Bedingung erfüllt
```

## Testfälle

MVP-Testfälle:

```text
1. Mining startet mit remainingTicks = 10.
2. Mining erzeugt vor Abschluss kein Iron Ore.
3. Mining nach 10 Fortschrittsticks erzeugt +1 Iron Ore.
4. Mining zieht Batterie erst bei erfolgreichem Abschluss ab.
5. Mining-Abbruch nach 5 Ticks erzeugt kein Iron Ore und kostet keine Batterie.
6. Bauaktion startet mit remainingTicks = 10.
7. Bauaktion erzeugt vor Abschluss keinen constructionProgress.
8. Bauaktion nach 10 Fortschrittsticks erhöht constructionProgress um 1.
9. Bauabbruch lässt Baustelle bestehen.
10. Bauabbruch kostet keine Batterie.
11. Fortsetzen einer Baustelle kostet keine Ressourcen erneut.
12. Produktion zählt nur bei mindestens 40 Leistung herunter.
13. Produktion pausiert bei fehlender Leistung.
14. Stasis-Laden erhöht Batterie pro Tick.
15. Stasis-Laden überschreitet batteryMax nicht.
16. Stop-Bedingung bei Stasis-Laden wird pro Tick geprüft.
17. Externe Roboterladung wird im MVP nicht verarbeitet.
18. Es gibt keine Priorisierung zwischen Produktion und externer Roboterladung.
```

## Programmstack-Auswertung

Die Simulation verwendet ein zweistufiges Auswertungsmodell:

```text
1. Stack von oben nach unten pruefen.
2. Innerhalb jedes Programms Zeilen von oben nach unten pruefen.
```

Ablauf:

```text
for program in enabledProgramsByStackOrder:
  if program execution limit reached:
    continue

  for row in program.rows:
    if row.if is false:
      continue

    if row.then is not executable:
      continue

    start row
    return
```

Wenn keine Zeile gefunden wird:

Regel:

```text
idle darf in der Simulation nicht in robot.status geschrieben werden.
robot.status bleibt active, solange der Roboter nicht in stasis, inactive oder destroyed wechselt.
```

```text
robot.status bleibt active
robot.activeTask = undefined
robot.activeProgram = undefined
RobotActivityState wird fuer UI/Diagnose als idle abgeleitet
Diagnose: Kein Programm ausfuehrbar
```

Wenn eine Zeile startet:

```ts
robot.activeProgram = {
  programId: program.id,
  rowId: row.id,
  startedTick: currentTick,
};
```

Regel:

```text
Die Simulation speichert die aktive Programm-/Zeilen-Zuordnung ausschliesslich in robot.activeProgram.
```

Waehrend ein RobotTask laeuft:

```text
keine Stack-Neupriorisierung
```

Nach Abschluss, Abbruch, Stop-Bedingung, Spielerabbruch oder Deaktivierung:

```ts
robot.activeProgram = undefined;
```

```text
Stack-Pruefung beginnt wieder oben
```

## UI-Commands in der Simulation

Die UI mutiert `GameState` nicht direkt, sondern sendet `PlayerCommand`.

MVP-Commands:

```text
pause
resume
setSpeed
selectRobot
selectBuilding
selectField
toggleProgramEnabled
moveProgramUp
moveProgramDown
updateProgram
resetProgramToTemplate
resetRun
```

Nicht MVP:

```text
directMove
directBuild
directAttack
```

Die Simulation verarbeitet Commands deterministisch und schreibt relevante Events/Diagnosen.

## Logistik als Future-System

Logistik ist als Future-System implementierungsscharf dokumentiert.

Kernelemente:

- Gebäudeinventare mit input, output, storage, construction und reserved
- Ressourcenspeicher als zentrales Lager
- MaterialRequests als Transportaufträge
- Transportroboter als ausführende Einheit
- Ressourcenreservierung gegen Doppelbuchung
- keine Teillieferungen in erster Logistik-Version
- ein Request pro Transportroboter
- Pickup 1 Tick
- Delivery 1 Tick
- keine Batteriekosten für Pickup/Delivery
- normale Bewegungskosten für Transportwege
- priorisierte Requests

Priorität:

```text
1. supplyConstruction
2. supplyBuildingInput
3. clearBuildingOutput
4. moveToStorage
```

MVP bleibt unverändert:

```text
keine Transportroboter
keine MaterialRequests
keine aktiven Gebäudeinventare
keine aktive Ressourcenspeicher-Nutzung
```

Hauptdokument:

```text
docs/04-systems/resources-and-logistics.md
```

## Stasis als Energiesicherung

`Stasis-Laden` ist die einzige harte Energiesicherung des Startroboters im MVP.

Regeln:

```text
Bewegung benötigt mindestens 1 Batterie.
Nach erfolgreichem Bewegungsschritt: -1 Batterie.
Wenn Batterie <= 1, wechselt der Startroboter in Stasis.
In Stasis werden keine normalen Programme ausgeführt.
Nur Stasis-Laden läuft.
Stasis-Laden endet bei Batterie >= 50.
Danach beginnt die Stack-Prüfung wieder oben.
```

Für Long Tasks:

```text
Wenn Mining oder Bau wegen Batterie nicht mehr abgeschlossen werden kann:
→ Task bricht ab
→ kein Ergebnis
→ keine Batteriekosten
→ Stasis-Laden greift
```

`Energie sichern` ist kein MVP-Startprogramm mehr.

## scoutNearby-Timing

`Scoute Nahfeld mit Ziel X` läuft als autonome Movement-Action.

Ablauf:

```text
1. Startprüfung
2. Zielauswahl mit targetFieldType
3. MovementTask anlegen
4. pro Tick maximal ein Bewegungsschritt
5. vor jedem Schritt Pfad neu validieren
6. nach erfolgreichem Schritt Sicht aktualisieren
7. Stop-Bedingung prüfen
8. falls Stop nicht erfüllt: Ziel mit demselben targetFieldType neu bewerten
9. nach Ende Stack-Prüfung wieder oben
```

Bewegungskosten bleiben:

```text
1 Tick pro Feld
1 Batterie pro erfolgreichem Bewegungsschritt
```

Ziel-Neubewertung ist MVP-Regel, weil die Karte klein ist und der Roboter dadurch sofort auf den konfigurierten Zieltyp reagiert.

## Produktionskosten des Iron Miner

Die Kostenquelle für den Iron Miner ist eindeutig.

MVP-Regel:

```text
Die Produktionskosten des ersten Iron Miner werden aus dem Cargo des Startroboters bezahlt.
```

Details:

```text
Kosten: 5 Iron Ore
Quelle: Startroboter-Cargo
Zeitpunkt: Start des ProductionTask
Startroboter muss connected sein
Startroboter muss nicht neben der Roboterfabrik stehen
keine Gebäudeinput-Inventare
keine MaterialRequests
keine Transportroboter
kein globaler Ressourcenpool
```

Score und MVP-Ziel werden erst nach erfolgreichem Spawn vergeben.

## Iron-Miner-Produktionscommand

`startIronMinerProduction` wird in der PlayerCommand-Phase der kanonischen Pipeline verarbeitet.

Kanonische Quelle fuer die Tick-Reihenfolge:

```text
docs/03-technical/tick-pipeline.md
```

Produktionsstart:

```text
ProductionTask startet in Tick N.
createdTick = startedTick = N.
remainingTicks = 10.
Der Task wird in Tick N nicht verarbeitet.
In Tick N gibt es keinen Fortschritt, kein Pause-Event, kein readyToSpawn und keinen Spawnversuch.
Erster moeglicher Fortschrittstick oder Pause-Tick ist Tick N+1.
Ohne Pausen erreicht der Task in Tick N+10 remainingTicks = 0; readyToSpawn und Spawn-Pruefung erfolgen in Tick N+10.
```

Wenn der Command abgelehnt wird:

```text
kein Kostenabzug
kein ProductionTask
Diagnose/Eventlog mit RejectionReason
```

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

## Koordinaten- und Sichtregeln

Simulation und Rendering verwenden dieselbe Koordinatenlogik:

```text
0-basierte Koordinaten
Ursprung oben links
x nach rechts
y nach unten
map[y][x]
```

Initiale Sicht wird per Chebyshev-Distanz berechnet:

```text
max(abs(field.x - robot.x), abs(field.y - robot.y)) <= sightRange
```

Bei Startposition `{ x: 5, y: 5 }` und Sichtweite 2 sind initial sichtbar:

```text
x = 3..7
y = 3..7
```

Nach Bewegung oder Spawn darf die Sichtberechnung dieselbe Distanzregel weiterverwenden.

## Sichtquellen nach Spielstart

Sichtquellen im MVP:

```text
aktive Roboter
aktive und enabled Gebäude
```

Gebäudesicht:

```text
MVP_BUILDING_SIGHT_RANGE = 2
max(abs(field.x - building.x), abs(field.y - building.y)) <= building.sightRange
```

Ein Gebäude erzeugt nur Sicht, wenn gilt:

```text
building.status = active
building.isEnabled = true
```

Keine Gebäudesicht bei:

```text
construction
disabled
destroyed
isEnabled = false
```

Sichtaktualisierung erfolgt nach relevanten Zustandsänderungen:

```text
Roboterbewegung
Roboter-Spawn
Gebäude-Fertigstellung
Gebäude-Aktivierung/-Deaktivierung
Reset/Initialisierung
```

Kanonische Übergangsregel pro Sichtupdate:

```text
1. currentVisibleFields aus allen aktiven Robotern und active+enabled Gebäuden berechnen.
2. Feld in currentVisibleFields -> visibility = visible.
3. Feld nicht in currentVisibleFields und vorher visible/discovered -> visibility = discovered.
4. Feld nie sichtbar gewesen -> visibility = unknown.
```

Ressourcenanzeige im MVP:

```text
Iron Ore wird nur bei visibility = visible angezeigt.
unknown und discovered dürfen keine versteckten Ressourcen durch Fallbacks verraten.
```

Gebäudesicht ist unabhängig von der Energieversorgung. Die Nähe einer Roboterfabrik zu einem Solar Collector bleibt nur Placement-Policy.

## Build-Action-Ablauf

`Baue Gebäude mit Typ X` läuft als kombinierte Movement-/Building-Action.

Ablauf:

```text
1. Startprüfung
2. Bauplatz auswählen
3. Baufeld reservieren
4. MovementTask zum Bau-Ausführungsfeld, falls nötig
5. Bau-Task starten, wenn Roboter orthogonal angrenzend steht
6. Ressourcen beim Start des Bau-Tasks abziehen
7. Gebäude mit status = construction anlegen
8. Baufortschritt ausführen
9. nach Abschluss Gebäude status = active
10. Stack-Prüfung beginnt wieder oben
```

Ressourcenregel:

```text
Kein Ressourcenabzug bei reiner Zielauswahl.
Kein Ressourcenabzug bei gescheitertem Weg zum Bau-Ausführungsfeld.
Ressourcenabzug erst bei Start des Bau-Tasks.
```

Ungültiges Ziel:

```text
Reservierung freigeben.
Zielauswahl einmal neu versuchen.
Wenn kein neues Ziel existiert: Task abbrechen.
```

## canExecuteAction

Die Simulation verwendet eine zentrale Executability-Prüfung.

Empfohlene Funktion:

```ts
function canExecuteAction(
  state: GameState,
  robot: Robot,
  action: ProgramAction
): ActionExecutabilityResult
```

Verbindliche Grundlage:

```text
docs/03-technical/action-executability-matrix.md
```

Regel:

```text
Bei notExecutable:
  keine State-Mutation außer Diagnose
  Stack-Prüfung geht weiter

Bei executable:
  Task starten oder Soforteffekt anwenden
```

`startIronMinerProduction` bleibt separat als PlayerCommand und wird nicht über `canExecuteAction` geprüft.

## Diagnose- und Eventlog-Regeln

Es gilt:

```text
docs/03-technical/diagnostics-and-eventlog.md ist die zentrale Quelle fuer GameEvent-Erzeugung.
`docs/03-technical/deterministic-id-generation.md` ist die zentrale Quelle fuer die deterministische Event-Sequenz und `seq3`-Vergabe innerhalb eines Ticks.
```

Simulation erzeugt Events bei:

```text
Initialisierung
ProgramAction executable / notExecutable
Task start / complete / abort
Ressourcengewinn
Bau gestartet / abgeschlossen / blockiert
Produktion gestartet / pausiert / blockiert / gespawnt
Stasis gestartet / abgeschlossen
MVP-Ziel erreicht
```

Regeln:

```text
Player Events erklären relevante Fortschritte und Blockaden.
Debug Events erklären interne Entscheidungen.
Nicht jede fehlgeschlagene IF-Zeile erzeugt ein Player Event.
Deduplizierung gilt für Player Events.
eventLog max 200 Einträge.
```

## Testmatrix-Verweis

Simulationsregeln müssen gegen `docs/02-mvp/mvp-test-matrix.md` geprüft werden. Relevante Bereiche: `MVP-STACK`, `MVP-ACTION`, `MVP-MINE`, `MVP-BUILD`, `MVP-STASIS`, `MVP-PROD`, `MVP-GOAL`.

## MVP-Energie-Tick

Die Simulation berechnet pro Tick einen globalen `EnergySnapshot`.

```text
powerProvided = Summe active + enabled Solar Collector
powerRequired = Summe fortschrittsberechtigter laufender ProductionTasks
freePower = powerProvided - powerRequired
```

Tick-Reihenfolge:

```text
1. Spielerbefehle uebernehmen
2. EnergySnapshot berechnen
3. Gebaeudeproduktion anhand EnergySnapshot verarbeiten
4. Spawnpruefungen ausfuehren
5. Roboterprogramme und Tasks verarbeiten
6. Eventlog/Score/UI-State aktualisieren
```

Regel:

```text
Energie beeinflusst im MVP nur ProductionTask-Fortschritt.
```

## Spawn-Score-Reihenfolge

Beim Tick gilt für Iron-Miner-Produktion:

```text
1. Nur ProductionTasks mit status = inProgress und startedTick < currentTick verarbeiten.
2. Wenn remainingTicks = 0, status readyToSpawn setzen.
3. Spawn-Pruefung im selben Tick ausfuehren.
4. Bei freiem Spawn-Feld Robot-Entity erstellen und in GameState.robots einfügen.
5. Erst nach erfolgreichem Einfügen Score und MVP-Ziel aktualisieren.
6. Danach Events production.ironMiner.spawned und ggf. goal.mvpReached erzeugen.
```

Nicht score-relevant:

```text
accepted Command
costPaid = true
remainingTicks = 0
readyToSpawn
spawnBlocked
```

## RobotType-Validierung

Simulation und Tests validieren RobotTypes gegen die kanonische Liste aus `canonical-data-model.md`.

Regeln:

```text
standardRobot ist nicht zulässig.
createInitialGame erzeugt starterRobot.
startIronMinerProduction / Spawn erzeugt ironMiner.
ProductionTask.robotType darf im MVP nur ironMiner sein.
```

Wenn alte Daten `standardRobot` enthalten:

```text
als Legacy-Daten behandeln
nicht als gültigen MVP-State akzeptieren
konkreten RobotType migrieren oder State ablehnen
```


## Build-Event-Details

Die Simulation schreibt Build-Events nur mit verbindlichen Details.

```text
action.build.started:
  details.mode = buildingTask.mode
  details.buildingType = buildingTask.buildingType
  details.buildingId = buildingTask.buildingId
  details.siteX = buildingTask.site.x
  details.siteY = buildingTask.site.y

action.build.completed:
  details.mode = buildingTask.mode
  details.buildingType = buildingTask.buildingType
  details.buildingId = buildingTask.buildingId
  details.siteX = buildingTask.site.x
  details.siteY = buildingTask.site.y
```

`details.mode` ist kein freier Text. Er wird direkt aus `BuildingTask.mode` übernommen.
