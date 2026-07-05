# Roboterbatterie und Laden

## Status

Dieses Dokument ist die kanonische Quelle fuer das Stasis-Ladeverhalten der Roboter im MVP.

Abgrenzung:

```text
Einheitenwerte, Batterie-Einheit und Batterieverbrauch bei Aktionen: docs/04-systems/units-and-energy.md
Gebaeudeenergie und globaler Power-Pool: docs/04-systems/energy-system.md
Dieses Dokument: Ladezustandsuebergaenge und Stasis-Ladeverhalten
```

## Grundentscheidung

```text
Roboterbatterie und Gebaeudeenergie sind im MVP getrennte Systeme.
```

Gebaeudeenergie:

```text
globaler Power-Pool
relevant fuer ProductionTasks
```

Roboterbatterie:

```text
relevant fuer Roboteraktionen
wird ueber Stasis-Laden wiederhergestellt
```

## MVP-aktive Ladelogik

```text
Stasis-Laden ist die einzige aktive MVP-Lademechanik.
```

Stasis startet, wenn:

```text
battery <= 1
```

Stasis endet, wenn:

```text
battery >= 50
```

Waehrend Stasis:

```text
Roboterstatus = stasis
normale Programme laufen nicht
Batterie steigt pro Tick gemaess MVP-Konstante
Stack-Pruefung beginnt nach Abschluss wieder oben
```

## Nicht MVP-aktiv

Diese Regeln sind Future/Advanced und duerfen den MVP nicht beeinflussen:

```text
externe Roboterladung
Laden neben Solar Collector
Solar Collector laedt Roboter
Laden waehrend Arbeit oder Bewegung
Roboterladung verbraucht Netzleistung
Ladestationen
Energiespeicher fuer Roboter
```

## ChargingMode

MVP-Startroboter:

```text
chargingMode = selfCharging
```

Iron Miner:

```text
chargingMode darf vorbereitet sein, ist aber nicht siegkritisch.
```

Fuer den MVP darf kein Fortschritt davon abhaengen, dass der Iron Miner nach Spawn laden kann.

## Batterieverbrauch

Batterieverbrauch ist fuer MVP-Aktionen vorbereitet.

Verbindlich:

```text
Nicht-Stasis-Aktionen sind bei battery <= 1 nicht ausfuehrbar.
StasisCharge ist bei battery <= 1 ausfuehrbar, wenn chargingMode selfCharging oder hybrid erlaubt.
```

Optional fuer erste Implementierung:

```text
Batterieverbrauch pro Bewegung/Task kann ueber MVP-Konstanten gesteuert werden.
```

## Abgrenzung zu Energie-System

```text
Solar Collector erzeugt globale Leistung fuer ProductionTasks.
Solar Collector laedt im MVP keine Roboter.
Roboterfabrik braucht keine Naehe zum Solar Collector, um Leistung zu erhalten.
```
