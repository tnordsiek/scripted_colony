# RobotTask-Lifecycle

Dieses Dokument sichert die Detailtiefe zu Long Tasks und präzisiert sie für die Implementierung.

## Grundmodell

RobotTasks sind konkrete Ausführungen von Aktionen. Programme entscheiden, ob eine Aktion gestartet werden darf; Tasks führen sie über Ticks aus.

```text
1. Startprüfung
2. Task anlegen
3. Task pro Tick verarbeiten
4. Abschluss- oder Abbruchprüfung
5. Ergebnis anwenden oder verwerfen
6. Task entfernen
7. Stack-Prüfung beginnt wieder oben
```

Während ein `MiningTask` oder `BuildingTask` läuft, wird der Programmstack nicht neu priorisiert. Ausnahme: Spieler deaktiviert/bricht laufendes Programm ab oder das Ziel wird ungültig.

## MovementTask

- Bewegung um ein Feld dauert 1 Tick.
- Batteriekosten werden nach erfolgreichem Schritt abgezogen.
- Blockade durch Roboter wird bis zu 3 Ticks toleriert.
- Nach 3 blockierten Ticks bricht der Task mit `blockedByRobot` ab.
- Permanente Blockade oder fehlender Pfad bricht mit `noPath` oder `targetInvalid` ab.

## MiningTask

Startbedingungen:

```text
Roboter active
Batterie > 1
Cargo hat Platz
orthogonal angrenzendes Iron-Ore-Feld vorhanden
ResourceDeposit.amount > 0
```

Laufzeit:

```text
remainingTicks = MVP_MINING_TICKS
```

Abschluss:

```text
Wenn Ziel weiterhin gültig ist
AND Cargo hat Platz
AND Batterie reicht für Abschlusskosten
THEN +1 Iron Ore im Cargo
AND ResourceDeposit.amount -= 1
AND Batterie -= 1
```

Vor erfolgreichem Abschluss entsteht kein Iron Ore. Ein abgebrochener MiningTask erzeugt kein Teilresultat und kostet keine Batterie.

Wenn `ResourceDeposit.amount <= 0`, verliert das Feld seinen aktiven Ressourcentyp und wird wieder begehbar/bebaubar, sofern Terrain und andere Blocker dies erlauben.

## BuildingTask

`BuildingTask` kennt zwei Modi:

```text
newConstruction
continueConstruction
```

### newConstruction

Startbedingungen:

```text
Roboter active
Batterie > 1
gültige Build-Site
gültiges Build-From-Feld
Cargo enthält Kosten
kein aktives Gebäude desselben Typs vorhanden
keine bestehende Baustelle desselben Typs vorhanden
Baufeld nicht reserviert
kein aktives ResourceDeposit auf Baufeld
```

Kostenzeitpunkt:

```text
Baukosten werden beim Start des BuildingTask abgezogen.
```

Beim Start wird ein `Building` mit `status = construction` angelegt:

```text
costPaid gesetzt
constructionProgress = 0
constructionRequired = MVP_BUILDING_CONSTRUCTION_REQUIRED
inventory.construction enthält bezahlte Kosten optional zur Nachvollziehbarkeit
```

### continueConstruction

Startbedingungen:

```text
Roboter active
Batterie > 1
Building mit passendem buildingType existiert
Building.status = construction
constructionProgress < constructionRequired
costPaid ist gesetzt
erreichbares Build-From-Feld vorhanden
Baustelle ist nicht durch anderen laufenden BuildingTask reserviert
keine abweichende Feldreservierung auf dem Baustellenfeld vorhanden
```

Kostenregel:

```text
Cargo wird nicht geprüft.
Es werden keine neuen Ressourcen abgezogen.
Es wird kein neues Building angelegt.
Die bestehende buildingId wird weiterverwendet.
```

Wenn eine passende Baustelle existiert, wird `continueConstruction` vor `newConstruction` geprüft.

### Baustellen-Reservierung bei continueConstruction

`continueConstruction` erzeugt keine neue `reservedForConstruction`-Feldstruktur. Die Reservierung wird aus aktiven Tasks abgeleitet:

```text
state.robots.some(robot =>
  robot.id !== requestingRobotId &&
  robot.activeTask?.type === "building" &&
  robot.activeTask.status === "running" &&
  robot.activeTask.buildingId === buildingId
)
```

Wenn diese Prüfung `true` ergibt, ist die Baustelle für den anfragenden Roboter reserviert und `action.buildBuilding` ist nicht ausführbar:

```text
reason = constructionAlreadyReserved
diagnostic.code = action.build.blocked.constructionAlreadyReserved
```

Besitzt derselbe Roboter bereits einen laufenden `BuildingTask`, wird kein zweiter Task erzeugt:

```text
reason = taskAlreadyRunning
```

Die Reservierung endet automatisch, sobald der laufende `BuildingTask` abgeschlossen oder abgebrochen wird, weil sie nicht separat gespeichert wird.

Laufzeit:

```text
remainingTicks = MVP_BUILD_TICKS
```

Abschluss:

```text
Wenn Roboter weiterhin orthogonal angrenzend bauen kann
AND Batterie reicht für Abschlusskosten
THEN constructionProgress += 1
AND Batterie -= 1
```

Wenn `constructionProgress >= constructionRequired`, wird das Gebäude `active`.

Score-Update beim ersten Wechsel zu `active`:

```text
solarCollector: builtSolarCollectors += 1, builtBuildings += 1, totalScore += 25
robotFactory: builtRobotFactories += 1, builtBuildings += 1, totalScore += 50
```

Dieses Score-Update darf pro `buildingId` nur einmal erfolgen.

Abbruch:

```text
Kein constructionProgress.
Keine Batteriekosten.
Baustelle bleibt bestehen.
Bereits bezahlte Baukosten bleiben bezahlt.
Fortsetzen derselben Baustelle kostet nicht erneut Ressourcen.
Kein Score und kein builtBuildings-Zählerupdate.
```

Nach einem Abbruch ist die vorhandene Baustelle ein gültiges `continueConstruction`-Ziel, sofern sie weiterhin erreichbar ist.

## StasisChargingTask

Stasis-Laden ist die aktive MVP-Lademechanik für Roboter.

```text
Start bei battery <= MVP_STASIS_ENTER_BATTERY
lädt mit MVP_SELF_CHARGE_RATE pro Tick
Stop bei battery >= MVP_STASIS_TARGET_BATTERY
```

Stasis-Laden verbraucht keine Gebäudeenergie und keine Power-Pool-Leistung.

## ProductionTask-Abgrenzung

`ProductionTask` ist Gebäudelogik, kein RobotTask. Er folgt denselben Tick-Prinzipien, aber hängt an der Roboterfabrik.

```text
Kosten beim Command-Erfolg.
remainingTicks sinkt nur bei ausreichender Leistung.
Fehlende Leistung pausiert.
Fehlende Leistung bricht nicht ab.
readyToSpawn ist noch kein Spawn.
spawnBlocked erzeugt keinen Score.
Score und MVP-Ziel erst nach erfolgreicher Robot-Entity-Einfügung.
```


## RobotTaskId-Erzeugung

Jeder neu gestartete `RobotTask` erhaelt eine deterministische ID nach `docs/03-technical/deterministic-id-generation.md`:

```text
task.<robotId>.<tick6>.<taskType>.<seq2>
```

Ein abgebrochener oder abgeschlossener Task wird entfernt, aber seine ID wird nicht im selben Tick wiederverwendet. Rejected Actions erzeugen keinen RobotTask und damit keine RobotTaskId.


## Build-Event-Details

Beim Start und Abschluss eines `BuildingTask` muss der erzeugte Event den Modus des Tasks enthalten.

```text
action.build.started.details.mode = buildingTask.mode
action.build.completed.details.mode = buildingTask.mode
```

Zusätzlich müssen `buildingType`, `buildingId`, `siteX` und `siteY` in `details` gesetzt werden. Dadurch können Tests eindeutig unterscheiden, ob ein Event zu einem Neubau (`newConstruction`) oder zur Fortsetzung einer bestehenden Baustelle (`continueConstruction`) gehört.
