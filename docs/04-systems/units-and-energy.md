# Einheiten, Batterie und Laden

Dieses Dokument beschreibt die aktiven MVP-Regeln zu Einheitenbatterie und Laden. Gebäudeenergie ist separat in `docs/04-systems/energy-system.md` geregelt.

## Grundentscheidung

```text
Roboterbatterie und Gebäudeenergie sind im MVP getrennte Systeme.
```

Gebäudeenergie:

```text
globaler Power-Pool
nur relevant für ProductionTasks
```

Roboterbatterie:

```text
relevant für Roboteraktionen
Stasis-Laden ist die einzige aktive MVP-Lademechanik
```

Externe Roboterladung über Solar Collector, Grid Energy Lines oder andere Energiegebäude ist Future und wird im MVP nicht verarbeitet.

## Batterie-Einheit

Batteriewerte werden kanonisch in absoluten Batteriepunkten geführt.

```text
battery und batteryMax sind absolute Punktwerte.
Alle MVP-Robotertypen verwenden batteryMax = 100.
1 Batteriepunkt entspricht dadurch genau 1 %.
Regeltexte, Bedingungen und Konstanten verwenden absolute Punkte, z. B. Batterie <= 1 oder Batterie >= 50.
Die UI darf den Batteriestand als Prozentwert anzeigen; das ist reine Darstellung und keine Regelgroesse.
```

Historische Prozentformulierungen wie `1 % Batterie` in aktiven MVP-Regeltexten gelten als Legacy und wurden auf absolute Punkte umgestellt. Future-Dokumente duerfen Prozentwerte verwenden, wenn dort andere `batteryMax`-Werte geplant sind.

## Quellenabgrenzung Roboterbatterie

```text
Dieses Dokument (units-and-energy.md): Einheitenwerte der MVP-Robotertypen, Batterie-Einheit, Batterieverbrauch bei Aktionen, ChargingMode-Zuordnung.
docs/04-systems/robot-battery-and-charging.md: Stasis-Ladeverhalten und Ladezustandsuebergaenge.
docs/04-systems/energy-system.md: Gebaeudeenergie und globaler Power-Pool.
Bei Detailkonflikten gilt fuer Einheitenwerte, Batterie-Einheit und Verbrauch dieses Dokument; fuer das Ladeverhalten gilt robot-battery-and-charging.md.
```

## MVP-aktive Robotertypen

### Starter Roboter

```text
type = starterRobot
tier = 0
role = allrounder
movementType = ground
communicationMode = autonomous
communicationStatus = connected
chargingMode = selfCharging
hp = 100/100
battery = 100/100
cargo.capacity = 10
cargo.used = {}
sightRange = 2
status = active
```

Fähigkeiten im MVP:

- bewegen
- scouten
- Iron Ore abbauen
- Solar Collector bauen
- Roboterfabrik bauen
- Stasis-Laden ausführen

### Iron Miner

Der Iron Miner ist der erste erfolgreich gespawnte Zielroboter des MVP.

```text
type = ironMiner
tier = 1
role = miner
movementType = ground
communicationMode = gridRequired
communicationStatus = connected
chargingMode = externalOnly
hp = 100/100
battery = 50/100
cargo.capacity = 10
cargo.used = {}
sightRange = 2
status = active
programStack = []
activeTask = undefined
activeProgram = undefined
```

MVP-Status:

```text
goalOnly
```

Das bedeutet: Der Iron Miner muss nach Spawn als vollständige `Robot`-Entity in `GameState.robots` existieren. Er muss für das MVP-Ziel aber noch keine produktive Eigenlogik ausführen.

## ChargingMode

```text
selfCharging: kann Stasis-Laden ohne externe Infrastruktur ausführen.
externalOnly: kann im MVP nicht selbst Stasis-Laden; externe Ladung ist Future.
hybrid: vorbereitet, aber nicht MVP-aktiv.
```

Für den MVP gilt:

```text
starterRobot.chargingMode = selfCharging
ironMiner.chargingMode = externalOnly
```

`externalOnly` blockiert nicht den MVP-Erfolg, weil der Iron Miner nach Spawn nur Ziel-Entity ist.

## Aktive MVP-Laderegel

Stasis-Laden:

```text
Start bei battery <= 1
Laderate: +1 Batterie pro Tick
Stop bei battery >= 50
Netzverbrauch: 0
Power-Pool-Verbrauch: 0
```

Stasis-Laden ist ein kontinuierlicher Tick-Effekt, kein 10-Tick-Task.

```ts
battery = Math.min(batteryMax, battery + MVP_SELF_CHARGE_RATE);
```

## Nicht MVP-aktiv

Diese Regeln sind ausdrücklich Future/Advanced und dürfen im MVP nicht aktiv verarbeitet werden:

```text
Solar Collector lädt angrenzende Roboter.
Externes Laden verbraucht Netzleistung.
1 Leistung = 1 % Batterie/Sekunde für Roboterladung.
Historische Ladepriorisierung zwischen Gebäudeproduktion und Roboterladung ist nicht MVP-aktiv.
Mehrere externe Ladequellen werden verteilt.
Selbstladung und externe Ladung werden kombiniert.
```

Falls alte Dokumentstellen diese Regeln als aktiv beschreiben, gelten sie als Legacy/Future.

## Batterieverbrauch bei Aktionen

Batterieverbrauch ist im MVP aktiv und testbar:

```text
Bewegung: -1 Batterie nach erfolgreichem Schritt.
Mining: -1 Batterie bei erfolgreichem MiningTask-Abschluss.
Bauen: -1 Batterie bei erfolgreichem BuildingTask-Abschluss.
Abbruch: keine Batteriekosten.
```

Eine nicht ausführbare Aktion kostet keine Batterie.

## Kommunikationsstatus im MVP

```text
MVP_COMMUNICATION_GRID_ACTIVE = false
```

Regeln:

- Starter Roboter ist immer `connected`.
- Erster Iron Miner spawnt `connected`.
- `gridRequired` wird beim Iron Miner im MVP nicht aktiv ausgewertet.
- Kommunikation blockiert im MVP keine Roboteraktionen.

## Future-Abgrenzung

Spätere Systeme dürfen externe Ladung, lokale Energienetze, Grid Energy Lines, Batteriespeicher und Ladeprioritäten einführen. Diese Systeme müssen dann eigene Konstanten und Tests erhalten und dürfen die MVP-Regeln nicht rückwirkend verändern.
