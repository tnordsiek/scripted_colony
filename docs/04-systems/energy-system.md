# Energy System

## Status

Dieses Dokument ist die zentrale Spezifikation fuer die MVP-Energie-Topologie.

Es ist verbindlich fuer:

```text
Energie-Topologie
Power-Pool-Berechnung
Solar-Collector-Leistung
ProductionTask-Fortschritt
ProductionTask-Pausierung
UI-Anzeige
Events
Tests
```

## Grundentscheidung

```text
MVP-Energie ist ein globaler Leistungs-Pool.
```

Das bedeutet:

```text
Alle active + enabled Solar Collector speisen in einen globalen MVP-Power-Pool ein.
Alle aktiven ProductionTasks verbrauchen daraus Leistung.
Es gibt im MVP keine lokalen Energienetze.
Es gibt im MVP keine Leitungen.
Es gibt im MVP keine Reichweite.
Es gibt im MVP keine Batteriespeicher.
Es gibt im MVP keine Energieuebertragung durch Roboter.
```

## Kanonische MVP-Regel

```text
Im MVP ist Energie global verfuegbar, sobald mindestens ein Solar Collector active und enabled ist.
```

Nahe Platzierung ist keine Energiebedingung:

```text
Naehe zum Solar Collector = Bauplatzlogik
Energieversorgung = globaler Pool
```

Die Roboterfabrik muss im MVP nicht angrenzend an einen Solar Collector stehen, um Leistung zu erhalten.

## Zentrale Typen

```ts
type EnergySnapshot = {
  tick: Tick;
  powerProvided: number;
  powerRequired: number;
  freePower: number;
};
```

MVP-Konstanten:

```ts
const MVP_SOLAR_COLLECTOR_POWER_PROVIDED = 50;
const MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED = 40;
```

Damit kann ein einzelner Solar Collector die erste Iron-Miner-Produktion tragen.

## Berechnung pro Tick

```text
powerProvided = Summe aller active + enabled Solar Collector
powerRequired = Summe aller fortschrittsberechtigten laufenden ProductionTasks mit Leistungsbedarf
freePower = powerProvided - powerRequired
```

Ein Solar Collector zaehlt nur, wenn:

```text
building.type = solarCollector
building.status = active
building.isEnabled = true
```

Ein Solar Collector zaehlt nicht, wenn:

```text
status = construction
status = disabled
status = destroyed
isEnabled = false
```

## Solar Collector

MVP-Solar-Collector:

```ts
const MVP_SOLAR_COLLECTOR: BuildingDefinition = {
  type: 'solarCollector',
  powerProvided: 50,
  powerRequired: 0,
};
```

Regel:

```text
active + enabled Solar Collector => +50 Leistung
```

## Roboterfabrik

MVP-Roboterfabrik:

```ts
const MVP_ROBOT_FACTORY: BuildingDefinition = {
  type: 'robotFactory',
  powerProvided: 0,
  powerRequired: 0,
};
```

Idle-Verbrauch:

```text
robotFactory.powerRequired idle = 0
```

Bei Produktion:

```text
productionTask.powerRequired = 40
```

Regel:

```text
Die Roboterfabrik verbraucht im MVP nur waehrend aktiver Produktion Leistung.
```

## Was Energie im MVP beeinflusst

Energie beeinflusst im MVP nur:

```text
Fortschritt von ProductionTasks
```

Konkret:

```text
Iron-Miner-Produktion laeuft nur, wenn der `ProductionTask` fortschrittsberechtigt ist und ausreichend Leistung fuer Produktion verfuegbar ist.
```

Energie beeinflusst nicht:

```text
Roboterbewegung
Mining
Scouting
Bau von Gebaeuden
Start des ProductionCommands
Button-Aktivierung allein wegen freier Leistung
Kommunikation
Sichtweite
Stasis-Laden
```

Roboterbatterie bleibt ein eigenes System und ist vom globalen Power-Pool getrennt.

## ProductionTask-Regel

Beim Tick:

```text
Wenn ProductionTask.startedTick < currentTick
AND ProductionTask.powerRequired <= freie Leistung fuer Produktion:
  remainingTicks -= 1
  status = inProgress
  blockedReason = undefined

Wenn ProductionTask.startedTick < currentTick
AND ProductionTask.powerRequired > freie Leistung fuer Produktion:
  remainingTicks bleibt gleich
  status = inProgress
  blockedReason = insufficientPower
  Event: production.ironMiner.paused.insufficientPower

Wenn ProductionTask.startedTick = currentTick:
  remainingTicks bleibt gleich
  kein insufficientPower-Event fuer diesen Task
```

Wichtig:

```text
Fehlende Leistung pausiert Produktion.
Fehlende Leistung bricht Produktion nicht ab.
Kosten werden nicht erstattet.
```

## Command-Regel

`startIronMinerProduction` prueft weiterhin nicht freie Leistung.

Ausfuehrbar, wenn:

```text
Roboterfabrik active
Roboterfabrik enabled
kein ProductionTask laeuft
Startroboter connected
Startroboter-Cargo enthaelt 5 Iron Ore
```

Nicht pruefen:

```text
freePower >= 40
```

Regel:

```text
Der Spieler darf Produktion starten, auch wenn sie wegen Energiemangel zunaechst pausiert.
```

## Tick-Reihenfolge

Die Energie wird pro Tick vor dem Produktionsfortschritt berechnet:

```text
1. Spielerbefehle uebernehmen
2. EnergySnapshot aus active + enabled Gebaeuden und fortschrittsberechtigten ProductionTasks berechnen
3. Gebaeudeproduktion anhand des EnergySnapshot verarbeiten
4. Spawnpruefungen ausfuehren
5. Roboterprogramme und Tasks verarbeiten
6. Eventlog/Score/UI-State aktualisieren
```

## Eventlog

Relevante Events:

```text
production.ironMiner.started
production.ironMiner.paused.insufficientPower
production.ironMiner.spawned
```

`production.ironMiner.paused.insufficientPower` ist ein Player Event mit Deduplizierung nach den Regeln aus `diagnostics-and-eventlog.md`.

## UI-Anzeige

Globale Energieanzeige:

```text
Leistung: 50 erzeugt / 40 benoetigt / 10 frei
```

Roboterfabrik-Panel:

```text
Produktionsbedarf: 40 Leistung
Status: laeuft
Status: pausiert - nicht genug freie Leistung
```

Button-Regel:

```text
Nicht genug freie Leistung deaktiviert den Button Iron Miner produzieren nicht.
```

## Nicht-MVP

Nicht Teil des MVP:

```text
lokale Energienetze
Energieleitungen
Energie-Reichweite
Batteriespeicher
Power-Routing
Priorisierung mehrerer Verbraucher
Gebaeude-Idle-Verbrauch
Roboterladung aus Power-Pool
```

`MVP-FUT-005` ist damit eindeutig als Future-Thema definiert: Lokale Energienetze sind nicht ungeklärt, sondern bewusst nicht MVP-aktiv. Die MVP-Topologie ist der globale Power-Pool.

## Expansion-1-Erweiterungen

Expansion 1 (`docs/02-mvp/expansion-1-scope.md`) erweitert den globalen Power-Pool,
ohne lokale Netze einzufuehren:

```text
Neue Verbraucher: Stahlwerk-Verarbeitung (30) und aktive Forschung (20),
beide mit ProductionTask-analogem Timing und Pausierung bei Energiemangel.
Energiespeicher puffern den globalen Pool: Entladen bei Defizit, Laden bei
Ueberschuss, je Tick maximal 50 pro Speicher, Kapazitaet 200,
Reihenfolge deterministisch nach BuildingId.
```

## Akzeptanzkriterium

Das Akzeptanzkriterium ist erfüllt, wenn:

```text
Ein active enabled Solar Collector erzeugt 50 Leistung.
Ein Solar Collector in construction erzeugt 0 Leistung.
Ein disabled Solar Collector erzeugt 0 Leistung.
Iron-Miner-Produktion benoetigt 40 Leistung.
startIronMinerProduction prueft nicht freePower.
Im Starttick sinkt remainingTicks nicht.
Ab dem Folgetick sinkt remainingTicks nur bei ausreichender Leistung fuer Produktion.
Ab dem Folgetick bleibt remainingTicks bei Energiemangel unveraendert und blockedReason = insufficientPower wird gesetzt.
Fehlende Leistung bricht Produktion nicht ab.
Fehlende Leistung erstattet keine Produktionskosten.
Roboterfabrik muss nicht angrenzend an Solar Collector stehen.
Es gibt im MVP keine Leitungen, keine Reichweite und keine Speicher.
Roboterbatterie ist getrennt vom Power-Pool.
```
