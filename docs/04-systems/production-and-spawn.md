# Produktion und Spawn-Regeln

## Grundregel

Im MVP ist Produktion keine Starter-Roboter-Programmzeile. Produktion ist eine einfache Gebäudefunktion der Roboterfabrik.

Der Spieler gibt der Roboterfabrik den Auftrag:

```text
Baue Iron Miner
```

Später können Gebäude eigene Steuerlogiken/Programme erhalten. Das ist ein Zukunftssystem und nicht Teil des initialen MVP.

## Eine Aufgabe pro Roboterfabrik

Im MVP hat eine Roboterfabrik maximal einen aktiven `ProductionTask`.

```text
productionTask?: ProductionTask
```

Eine neue Produktion kann nur gestartet werden, wenn kein `productionTask` vorhanden ist.

Wenn eine fertige Produktion noch nicht gespawnt ist, bleibt `productionTask` vorhanden und blockiert neue Aufträge.

## ProductionTask-Zustände

Für den MVP gibt es drei aktive Zustände:

```text
inProgress
readyToSpawn
spawnBlocked
```

Es gibt keinen dauerhaft gespeicherten `completed`-Status.

Nach erfolgreichem Spawn wird `productionTask` entfernt. Abschluss, Spawn und Score werden über Eventlog und GameState dokumentiert.

### inProgress

Die Produktion läuft.

- `remainingTicks` zählt herunter.
- Roboterfabrik verbraucht während Fortschritt 40 Leistung.
- Wenn Leistung fehlt, pausiert der Fortschritt.
- Kosten bleiben bezahlt.
- Auftrag wird nicht automatisch abgebrochen.

### readyToSpawn

Die Produktionsdauer ist abgeschlossen. Die Einheit ist fertig, aber noch nicht auf der Karte.

- Simulation versucht, ein freies Ausgabefeld zu finden.
- Wenn ein Ausgabefeld verfügbar ist, spawnt die Einheit.
- Wenn kein Ausgabefeld verfügbar ist, wechselt der Task zu `spawnBlocked`.

### spawnBlocked

Die Produktion ist fertig, aber kein gültiges Ausgabefeld ist frei.

- Roboterfabrik nimmt keine neuen Aufträge an.
- Diagnose: `Kein freies Ausgabefeld`.
- Simulation prüft weiter, ob ein Ausgabefeld frei wird.
- Sobald ein Feld frei ist, spawnt die Einheit.
- Danach wird `productionTask` entfernt.

## Iron Miner produzieren

Kosten:

```text
5 Iron Ore
```

Produktionsstart:

```text
Roboterfabrik vorhanden
AND Roboterfabrik betriebsbereit
AND productionTask nicht vorhanden
AND 5 Iron Ore verfügbar
```

Bei Start in Tick N:

```text
5 Iron Ore werden abgezogen
ProductionTask wird erstellt
status = inProgress
remainingTicks = 10
createdTick = N
startedTick = N
```

Freie Leistung >= 40 muss beim Start nicht dauerhaft garantiert sein. Der Task erhaelt in Tick N selbst keinen Fortschritt und keinen Pauseffekt. Fuer diesen neu gestarteten Task zaehlt in Tick N kein Leistungsbedarf in den EnergySnapshot. Wenn spaeter waehrend der Produktion nicht genug Leistung verfuegbar ist, pausiert die Produktion.

## Leistungsregel

Waehrend `status = inProgress`:

```text
Wenn Roboterfabrik aktiv
AND productionTask.startedTick < currentTick
AND freie Leistung fuer Produktion >= 40
THEN remainingTicks -= 1
```

Wenn Leistung fehlt:

```text
remainingTicks bleibt unverändert
status bleibt inProgress
Diagnose: Nicht genug freie Leistung
```

Leistungsfehler pausiert Produktion, bricht sie aber nicht ab.

## Produktionsabschluss

Wenn:

```text
remainingTicks <= 0
```

Dann:

```text
status = readyToSpawn
completedTick = currentTick
```

## Spawn-Regeln

Nach Abschluss spawnt der Iron Miner auf einem freien orthogonalen Nachbarfeld der Roboterfabrik.

Gültiges Ausgabefeld:

- orthogonal angrenzend
- frei
- kein Gebäude
- keine Baustelle
- kein aktives Ressourcenfeld
- kein Roboter auf dem Feld
- passierbares Terrain

Diagonal zählt nicht.

Bei mehreren gültigen Feldern entscheidet seeded random nach `docs/03-technical/seeded-rng.md`.

## Kein freies Ausgabefeld

Wenn kein freies Feld verfügbar ist:

```text
status = spawnBlocked
blockedReason = noFreeOutputField
Diagnose: Kein freies Ausgabefeld
Roboterfabrik nimmt keine neuen Aufträge an
```

Sobald ein gültiges Feld frei wird:

```text
Iron Miner spawnt
productionTask wird entfernt
Roboterfabrik wird wieder frei
Event production.ironMiner.spawned wird geschrieben
Score wird aktualisiert
mvpGoalReached wird gesetzt
```

## MVP-Ziel

Das MVP-Ziel gilt erst als erreicht, wenn der Iron Miner tatsächlich gespawnt ist.

Nicht ausreichend:

```text
ProductionTask readyToSpawn
ProductionTask spawnBlocked
```

Ausreichend:

```text
Iron Miner existiert im GameState
AND productionTask wurde nach Spawn entfernt
```

## Produktionsablauf kompakt

```text
Spieler startet Auftrag
→ Ressourcen prüfen
→ 5 Iron Ore abziehen
→ ProductionTask inProgress
→ bei freier Leistung Fortschritt pro Tick
→ remainingTicks = 0
→ readyToSpawn
→ Ausgabefeld suchen
→ wenn frei: Iron Miner spawnt, Task entfernen, MVP-Ziel erreicht
→ wenn blockiert: spawnBlocked, Fabrik blockiert, später erneut prüfen
```

## Zukunft: Gebäudeprogramme

Später können Gebäude eigene Steuerlogik erhalten.

Beispiel:

```text
IF freie Leistung >= 40
AND Iron Ore >= 5
THEN produziere Iron Miner
```

Nicht MVP.

## Produktionskosten entschieden

Der Iron Miner kostet im MVP verbindlich:

```text
5 Iron Ore
```

Kostenzeitpunkt:

```text
beim Start des Produktionsauftrags
```

Nicht erst bei Produktionsabschluss und nicht erst beim Spawn.

## Energieabgrenzung

Gebäudeenergie beeinflusst im MVP ausschließlich ProductionTask-Fortschritt.

```text
Roboterladung verbraucht im MVP keine Netzleistung.
Externe Roboterladung ist Future und wird nicht verarbeitet.
Die Roboterfabrik konkurriert daher im MVP nicht mit Roboterladung um Leistung.
```

## ProductionTask-Timing

Produktion ist ein Gebäudetask. Die Tick-Reihenfolge selbst ist in `docs/03-technical/tick-pipeline.md` kanonisch; dieses Dokument beschreibt die fachliche Produktionswirkung dazu.

```text
Iron Miner Produktion:
Dauer: 10 Fortschrittsticks
Leistungsbedarf: 40
Kosten: 5 Iron Ore
Kostenzeitpunkt: Start des ProductionTask
```

Start in Tick N:

```text
createdTick = N
startedTick = N
remainingTicks = 10
status = inProgress
```

Starttick-Ausschluss:

```text
Tick N verarbeitet den neuen Task nicht.
Tick N zaehlt den neuen Task nicht in den Produktionsleistungsbedarf.
Tick N erzeugt fuer den neuen Task keinen Fortschritt.
Tick N erzeugt fuer den neuen Task kein insufficientPower-Pause-Event.
Tick N erzeugt fuer den neuen Task kein readyToSpawn.
Tick N fuehrt fuer den neuen Task keinen Spawnversuch aus.
```

Fortschritt ab Tick N+1:

```text
Nur wenn status = inProgress und startedTick < currentTick:
  Wenn verfügbare Leistung für Produktion >= 40:
    remainingTicks -= 1
    blockedReason = undefined

  Wenn verfügbare Leistung < 40:
    remainingTicks bleibt unverändert
    blockedReason = insufficientPower
    Produktion pausiert
```

Zeitachse ohne Pause:

```text
Tick N:    Auftrag akzeptiert, remainingTicks = 10, keine Verarbeitung
Tick N+1:  erster Fortschritt, remainingTicks = 9
Tick N+2:  zweiter Fortschritt, remainingTicks = 8
...
Tick N+9:  neunter Fortschritt, remainingTicks = 1
Tick N+10: zehnter Fortschritt, remainingTicks = 0, status = readyToSpawn, Spawn-Pruefung
```

Danach greifen im selben Tick die Spawn-Regeln. Fehlende Leistung bricht Produktion nicht ab und erstattet keine Kosten.

## Produktionsanzeige UI-MVP

Produktion wird im Gebäudeauswahlpanel angezeigt.

Roboterfabrik-Anzeige:

```text
Status
Produktion
Fortschritt / remainingTicks
Leistungsbedarf
Spawnstatus
```

Es gibt im MVP keinen separaten Production Screen.

## Einheitenwerte

MVP aktiv bleiben:

- Starter Roboter
- Iron Miner als erster gespawnter Zielroboter

Nicht MVP / Future:

- Boden Scout
- Konstrukteur
- Nahkampfdrohne
- Resource Miner
- Transportroboter
- Fernkampfdrohne

Alle diese Einheiten besitzen kanonische Startwerte für HP, Batterie, Startbatterie, Cargo, Sichtweite, MovementType, ChargingMode, CommunicationMode, Rollen, erlaubte Aktionen und Produktionsdaten.

Hauptdokument:

```text
docs/05-future/building-and-unit-tiers.md
```

## Level-2-Gebäude-Werte

Level-2-Gebäude sind als Future-Systeme mit kanonischen Basiswerten dokumentiert.

Erfasst:

- Sendeturm
- Grid Energy Line
- Verbesserte Roboterfabrik
- Drohnenfabrik
- Gasförderanlage
- Stahlwerk
- Energiespeicher
- Ressourcenspeicher

MVP aktiv bleiben nur:

- Solar Collector
- Roboterfabrik

`BuildingType` wird um `energyStorage` und `resourceStorage` erweitert.

Der Ressourcenspeicher lagert Rohressourcen und verarbeitete Ressourcen. Transportroboter und Bauroboter/Konstrukteure nutzen ihn später als Quelle für MaterialRequests.

Hauptdokument:

```text
docs/05-future/building-and-unit-tiers.md
```

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

## Produktionskosten des Iron Miner

Die Produktionskosten des Iron Miner im MVP sind eindeutig definiert.

## MVP Production Cost Rule

```text
Im MVP bezahlt die Roboterfabrik die Produktion des ersten Iron Miner aus dem Cargo des Startroboters.
```

## Voraussetzungen für Produktionsstart

Der Command `startIronMinerProduction` ist gültig, wenn alle Bedingungen erfüllt sind:

```text
Roboterfabrik existiert
Roboterfabrik status = active
Roboterfabrik isEnabled = true
Roboterfabrik hat keinen laufenden ProductionTask
Startroboter existiert
Startroboter status ist active oder stasis
Startroboter communicationStatus = connected
Startroboter-Cargo enthält mindestens 5 Iron Ore
```

Nicht erforderlich:

```text
Startroboter muss nicht neben der Roboterfabrik stehen
keine MaterialRequest
kein Gebäudeinput-Inventar
kein Transportroboter
keine manuelle Übergabe
kein globaler Ressourcenpool
```

## Kostenzeitpunkt

```text
5 Iron Ore werden beim Start des ProductionTask aus dem Cargo des Startroboters abgezogen.
```

Nicht beim Spawn. Nicht bei Abschluss der Produktionszeit. Nicht aus einem globalen Bestand.

## Produktionsstart-Ablauf

```text
Spieler wählt Roboterfabrik.
Spieler klickt "Iron Miner produzieren".
UI sendet startIronMinerProduction.
Simulation prüft Voraussetzungen.

Wenn gültig:
  5 Iron Ore aus Starter-Cargo abziehen.
  ProductionTask an Roboterfabrik anlegen.
  productionTask.costPaid = true
  Eventlog: Produktion gestartet.

Wenn ungültig:
  kein Task.
  kein Kostenabzug.
  Diagnose/Eventlog schreiben.
```

## ProductionTask beim Start

```ts
productionTask = {
  id: "...",
  buildingId: "...",
  robotType: "ironMiner",
  cost: { ironOre: 5 },
  costPaid: true,
  totalTicks: 10,
  remainingTicks: 10,
  powerRequired: 40,
  status: "inProgress",
  createdTick,
  startedTick
};
```

## Produktionsfortschritt

Nach Produktionsstart sind die Kosten bezahlt.

```text
Nur wenn status = inProgress und startedTick < currentTick:
  Wenn verfügbare Leistung >= 40:
    remainingTicks -= 1
    blockedReason = undefined

  Wenn verfügbare Leistung < 40:
    remainingTicks bleibt unverändert
    status bleibt inProgress
    blockedReason = insufficientPower
    Diagnose: Produktion pausiert: Nicht genug freie Leistung
```

Wenn `startedTick = currentTick`, wird der Task in diesem Tick uebersprungen. Es gibt dann keinen Fortschritt, keinen Pauseeffekt, kein readyToSpawn und keinen Spawnversuch.

Wenn `remainingTicks <= 0`:

```text
status = readyToSpawn
Spawnprüfung im selben Tick ausführen
```

## Spawn, Score und MVP-Ziel

```text
Iron Miner spawnt auf freiem orthogonalen Nachbarfeld der Roboterfabrik.
Bei mehreren gültigen Feldern: seeded random nach `docs/03-technical/seeded-rng.md`.
Wenn kein Feld frei: status = spawnBlocked.
Wenn später ein Feld frei wird: Spawn nachholen.
```

Score und MVP-Ziel werden erst nach erfolgreichem Spawn vergeben:

```text
+100 für gespawnten Iron Miner
+200 Zielbonus, wenn erster zusätzlicher Roboter erfolgreich gespawnt wurde
mvpGoalReached = true
```

Nicht beim Produktionsstart. Nicht bei `readyToSpawn`.

## Fehlerfälle und Diagnosen

```text
Produktion blockiert: Roboterfabrik nicht aktiv
Produktion blockiert: Roboterfabrik deaktiviert
Produktion blockiert: Produktion läuft bereits
Produktion blockiert: Startroboter fehlt
Produktion blockiert: Startroboter nicht verbunden
Produktion blockiert: Nicht genug Iron Ore im Startroboter-Cargo
Produktion pausiert: Nicht genug freie Leistung
Spawn blockiert: Kein freies Ausgabefeld
Iron Miner gespawnt
MVP-Ziel erreicht
```

## Keine Logistik durch die Hintertür

Im MVP gilt weiterhin:

```text
keine Gebäudeinput-Inventare für Produktion
keine MaterialRequests
keine Transportroboter
keine Ressourcenspeicher-Nutzung
kein globaler Ressourcenpool
```

Der Startroboter-Cargo ist die konkrete Ressourcenquelle.

## Future-Abgrenzung

Future-Regel:

```text
Produktionsgebäude verbrauchen Inputs aus ihrem input-Inventar.
Transportroboter oder Logistiksystem liefern Ressourcen.
MaterialRequests versorgen Gebäude.
Ressourcenspeicher dient als zentrale Quelle.
```

MVP-Regel:

```text
Roboterfabrik bezahlt den ersten Iron Miner direkt aus Startroboter-Cargo.
```

## Designregel

```text
Im MVP werden die Produktionskosten des Iron Miner aus dem Cargo des Startroboters bezahlt.
Der Startroboter muss nicht neben der Roboterfabrik stehen.
Die Kosten werden beim Start des ProductionTask abgezogen.
Score und MVP-Ziel werden erst nach erfolgreichem Spawn vergeben.
```

## UI-Command startIronMinerProduction

Die Iron-Miner-Produktion wird im MVP ausschließlich über den Gebäude-Button der Roboterfabrik gestartet.

```text
Roboterfabrik auswählen
Button "Iron Miner produzieren" klicken
UI sendet startIronMinerProduction(buildingId)
```

Command:

```ts
{ type: "startIronMinerProduction"; buildingId: BuildingId }
```

Validierung:

```text
buildingId existiert
building.type = robotFactory
building.status = active
building.isEnabled = true
building.productionTask ist leer
Startroboter existiert
Startroboter.status ist active oder stasis
Startroboter.communicationStatus = connected
Startroboter-Cargo enthält mindestens 5 Iron Ore
```

Bei Erfolg:

```text
5 Iron Ore aus Startroboter-Cargo abziehen
ProductionTask mit costPaid = true anlegen
Eventlog: production.ironMiner.started
```

Bei Fehler:

```text
kein Kostenabzug
kein ProductionTask
CommandResult rejected mit RejectionReason
```

Nicht genug freie Leistung verhindert den Produktionsstart nicht. Der Fortschritt pausiert, wenn im Produktionstick weniger als 40 freie Leistung verfügbar ist.

## MVP-Energie fuer Produktion

Iron-Miner-Produktion nutzt den globalen MVP-Power-Pool aus `docs/04-systems/energy-system.md`.

Regeln:

```text
startIronMinerProduction prueft nicht freePower.
ProductionTask.powerRequired = 40.
Ein neu gestarteter ProductionTask wird erst ab Tick N+1 verarbeitet.
Der Starttick N zaehlt den neuen Task nicht in den Produktionsleistungsbedarf.
Tick N erzeugt fuer den neuen Task kein insufficientPower-Pause-Event.
Ab Tick N+1 laeuft die Produktion bei ausreichender Produktionsleistung weiter.
Ab Tick N+1 pausiert die Produktion bei Energiemangel.
Fehlende Leistung bricht Produktion nicht ab.
Fehlende Leistung erstattet keine Kosten.
Ohne Pausen erfolgt der zehnte Fortschrittstick in Tick N+10; readyToSpawn und Spawn-Pruefung liegen ebenfalls in Tick N+10.
```

Tick-Regel:

```text
Wenn startedTick < currentTick AND powerRequired <= freie Leistung fuer Produktion:
  remainingTicks -= 1
  blockedReason = undefined

Wenn startedTick < currentTick AND powerRequired > freie Leistung fuer Produktion:
  remainingTicks bleibt gleich
  blockedReason = insufficientPower
  Event production.ironMiner.paused.insufficientPower

Wenn startedTick = currentTick:
  kein Fortschritt und kein Pauseffekt
```

Wichtig:

```text
Die Roboterfabrik muss im MVP nicht angrenzend an einen Solar Collector stehen, um Leistung zu erhalten.
```

## Spawn-vs-Produktion-Regel

Es gilt:

```text
Produktion gestartet ist kein Spawn.
ProductionTask readyToSpawn ist kein Spawn.
spawnBlocked ist kein Spawn.
Nur eine erfolgreich in GameState.robots eingefügte ironMiner-Entity zählt als Spawn.
```

Spawn-Ablauf:

```text
1. ProductionTask.remainingTicks erreicht 0.
2. status wird readyToSpawn.
3. freies orthogonal angrenzendes Spawn-Feld wird gesucht.
4. falls kein Feld frei ist:
   status = spawnBlocked
   blockedReason = noFreeOutputField
   kein Score
   mvpGoalReached bleibt false
5. falls Feld frei ist:
   Robot-Entity type = ironMiner erstellen
   Robot-Entity in GameState.robots einfügen
   ProductionTask entfernen
   Score aktualisieren
   production.ironMiner.spawned erzeugen
   goal.mvpReached erzeugen, falls erster Iron Miner
```

`startIronMinerProduction` erzeugt nur `ProductionTask` und zieht Kosten ab. Es setzt keinen Score und erreicht nicht das MVP-Ziel.


## Iron-Miner-Spawn-Entity

Bei erfolgreichem Spawn wird eine vollständige `Robot`-Entity angelegt. Die ID folgt `docs/03-technical/deterministic-id-generation.md` und wird erst beim erfolgreichen Spawn erzeugt:

```ts
const spawnedIronMiner: Robot = {
  id: createSpawnedRobotId("ironMiner", state),
  name: "Iron Miner",
  type: "ironMiner",
  tier: 1,
  role: "miner",
  movementType: "ground",
  communicationMode: "gridRequired",
  communicationStatus: "connected",
  x: spawnField.x,
  y: spawnField.y,
  hp: { current: 100, max: 100 },
  battery: 50,
  batteryMax: 100,
  chargingMode: "externalOnly",
  cargo: { used: {}, capacity: 10 },
  sightRange: 2,
  status: "active",
  activeTask: undefined,
  activeProgram: undefined,
  programStack: [],
};
```

Der Iron Miner ist im MVP `goalOnly`: Seine Existenz erfüllt Score-/Zielregeln, aber er benötigt noch keine produktive Eigenlogik.

## Produktions-RobotType

Die MVP-Roboterproduktion erzeugt ausschließlich:

```text
robot.type = ironMiner
```

Nicht zulässig:

```text
robot.type = standardRobot
```

Ein Spawn gilt nur dann als MVP-relevant, wenn eine Robot-Entity mit folgendem Typ in `GameState.robots` eingefügt wurde:

```text
ironMiner
```

`standardRobot` ist kein gültiger Produktionszieltyp.
