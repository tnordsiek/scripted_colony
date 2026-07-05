# Kommunikationsgrid

## communicationMode

`communicationMode` beschreibt, wie abhängig eine Einheit vom Grid ist.

- `gridRequired`: Einheit bleibt im Grid.
- `autonomous`: Einheit darf außerhalb arbeiten.
- `scoutLocked`: Einheit darf außerhalb arbeiten, Stack ist gelocked.

## Reichweite

- Normale Gebäude: 3 Felder
- Sendeturm: 5 Felder
- Berechnung ohne Diagonalen per Manhattan-Distanz

## Gridpflichtige Einheiten

- bewegen sich nur innerhalb des Grids
- planen keine Ziele außerhalb
- wenn Grid unter ihnen wegfällt: disconnected/stasis/offline
- keine normalen Programme
- keine Reaktion auf Gruppenänderungen

## UI

- connected icon
- disconnected icon
- locked icon
- stasis icon

## Gruppen

- Online-Einheiten übernehmen Gruppenänderungen.
- Disconnected/offline Einheiten reagieren nicht.
- spätere Synchronisation bei Wiederverbindung möglich.

## MVP-Status des Kommunikationsgrids

Das Kommunikationsgrid ist im MVP nicht aktiv.

```text
MVP_COMMUNICATION_GRID_ACTIVE = false
```

Alle MVP-relevanten Einheiten gelten als verbunden.

```text
Starter Roboter: connected
erster Iron Miner: connected
```

Kommunikation blockiert im MVP keine:

- Bewegung
- Programme
- Aktionen
- Produktion
- Roboterfabrik-Aufträge
- UI-Bedienung
- Stack-Änderungen

## Starter Roboter

MVP-Default:

```ts
starterRobot.communicationMode = "autonomous";
starterRobot.communicationStatus = "connected";
```

Der Starter Roboter ist im MVP immer connected. Stasis entsteht beim Starter im MVP nur durch Batterie, nicht durch Kommunikation.

## Erster Iron Miner

MVP-Default:

```ts
ironMiner.communicationMode = "gridRequired";
ironMiner.communicationStatus = "connected";
```

Der erste Iron Miner spawnt connected. `gridRequired` ist nur vorbereitendes Datenmodell und wird im MVP nicht aktiv ausgewertet.

## Keine aktive Grid-Berechnung im MVP

Im MVP gibt es keine aktive Berechnung von:

- Kommunikationsfeldern
- Gebäudereichweiten
- Sendeturmreichweiten
- disconnected-Zonen
- locked Scouts
- Offline-Verhalten
- Kommunikationspfaden

Gebäude erzeugen im MVP kein Kommunikationsgrid.

## UI im MVP

Die UI darf optional einen einfachen Status anzeigen:

```text
Kommunikation: verbunden
```

Nicht MVP:

- Kommunikationsgrid-Overlay
- Warnungen für Kommunikationsverlust
- Sendeturm-UI
- Reichweitenanzeige
- disconnected-Interaktionen

## Future-System

Kommunikationsgrid, Sendeturm, Reichweiten und Offline-Verhalten bleiben Zukunftssysteme.

Spätere Grundtypen bleiben vorbereitet:

```text
communicationMode:
- gridRequired
- autonomous
- scoutLocked

communicationStatus:
- connected
- disconnected
- offline
- stasis
- locked
```

Spätere Reichweiten:

```text
normale Gebäude: 3 Felder
Sendeturm: 5 Felder
Manhattan-Distanz
keine Diagonalen
```

## Kommunikationsanzeige UI-MVP

Im MVP darf die UI nur anzeigen:

```text
Kommunikation: verbunden
```

Nicht MVP:

- Kommunikationsgrid-Overlay
- Sendeturm-Reichweiten
- disconnected-Warnungen
- Kommunikationspfade

## Kommunikations-Forschungsbezug

`research.communication1` aktiviert Sendeturm und Kommunikationsgrid als Future-System. `research.communication2` erweitert Reichweiten und aktiviert gridRequired-Einheiten als echtes System. Im MVP bleibt Kommunikation deaktiviert.

Vollständig dokumentiert in `docs/05-future/research-tree.md`.

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
