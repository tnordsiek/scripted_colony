# Building und Unit Tiers

Dieses Future-Dokument darf Typauszuege fuer spaetere Systeme enthalten; sie sind nicht MVP-kanonisch. Aktive MVP-Typen stehen in `docs/03-technical/canonical-data-model.md`.
## Gebäudestufen

Level 1:

- Solar Collector
- Roboterfabrik
- KI-Forschungszentrum

Level 2:

- Sendeturm
- Grid Energy Line
- Verbesserte Roboterfabrik
- Drohnenfabrik
- Gasförderanlage
- Stahlwerk

## Einheitenstufen

Level 0:

- Starter Roboter

Level 1:

- Iron Miner
- Boden Scout
- Nahkampfdrohne
- Konstrukteur

Level 2:

- Miner für neue Ressourcen
- Transportroboter
- Fernkampfdrohne

## Freischaltung

Höhere Stufen werden durch Forschung und passende Produktionsgebäude freigeschaltet.

## Forschungs-Unlocks

Der Future-Forschungsbaum definiert Future-Unlocks für Gebäude und Einheiten: Stahlwerk, Grid Energy Line, Sendeturm, Gasförderanlage, Verbesserte Roboterfabrik, Drohnenfabrik, Konstrukteur, Boden Scout, Transportroboter, Silicium-Miner, Nahkampfdrohne und Fernkampfdrohne.

Vollständig dokumentiert in `docs/05-future/research-tree.md`.

## Level-1- und Level-2-Einheitenwerte

besitzen Level-1- und Level-2-Einheiten kanonische Basiswerte.

## MVP-Abgrenzung

MVP aktiv:

```text
Starter Roboter
Iron Miner als erster gespawnter Zielroboter
```

Nicht MVP / Future:

```text
Boden Scout
Konstrukteur
Nahkampfdrohne
Resource Miner
Transportroboter
Fernkampfdrohne
```

Die Werte sind erste Balancing-Werte und dürfen später angepasst werden.

## Grundregeln

```text
HP meist 100 als Standard
Batterie meist 100
Sichtweite 2 als Standard
MovementType ground als Standard
Bewegungskosten grundsätzlich 1 % pro Feld
```

Spezialisierung entsteht über:

```text
Cargo
Sichtweite
ChargingMode
CommunicationMode
erlaubte Aktionen
Produktionskosten
Effizienz bei Spezialaktionen
```

## Level 0: Starter Roboter

```text
RobotType: starterRobot
Tier: 0
Rolle: Allrounder / Rettungseinheit
MVP: aktiv
HP: 100/100
Batterie: 100 max
Startbatterie: 50
Cargo: 10
Sichtweite: 2
MovementType: ground
ChargingMode: hybrid
CommunicationMode: autonomous
CommunicationStatus MVP: connected
```

Erlaubte Aktionen:

```text
Laden
Stasis-Laden
Scouting
Iron Ore abbauen
Gebäude bauen
Produktion auslösen
```

Besonderheiten:

```text
immer connected
kann selbstladen
verhindert funktionelle Sackgassen
```

## Level 1: Iron Miner

```text
RobotType: ironMiner
Tier: 1
Rolle: Iron-Ore-Spezialist
MVP: erster gespawnter Roboter / Ziel
HP: 100/100
Batterie: 100 max
Startbatterie: 50
Cargo: 20 Iron Ore
Sichtweite: 2
MovementType: ground
ChargingMode: externalOnly
CommunicationMode: gridRequired
CommunicationStatus MVP: connected
```

Erlaubte Aktionen:

```text
Iron Ore abbauen
zu Ladefeld bewegen
extern laden
```

Nicht erlaubt:

```text
Gebäude bauen
Scouting als Hauptrolle
Produktion auslösen
andere Ressourcen abbauen
Kampf
```

Effizienz:

```text
Iron-Ore-Mining: 10 Ticks pro 1 Iron Ore
Batteriekosten: 1 %
```

Produktionsdaten:

```text
Gebäude: Roboterfabrik
Kosten: 5 Iron Ore
Produktionsdauer: 10 Ticks
Leistungsbedarf: 40
```

## Level 1: Boden Scout

```text
RobotType: groundScout
Tier: 1
Rolle: Erkundung
MVP: nicht aktiv
Unlock: research.groundScout1
HP: 70/70
Batterie: 120 max
Startbatterie: 80
Cargo: 0
Sichtweite: 4
MovementType: ground
ChargingMode: selfCharging
CommunicationMode: scoutLocked
CommunicationStatus: connected / locked je nach Grid
```

Erlaubte Aktionen:

```text
Scouting
Kartenerkundung
Gefahren markieren
Ressourcen sichtbar machen
Selbstladen
```

Nicht erlaubt:

```text
Mining
Bauen
Produktion auslösen
Transport
Kampf als Hauptrolle
```

Produktionsdaten:

```text
Gebäude: Roboterfabrik oder Verbesserte Roboterfabrik
Kosten: 5 Iron Ore
Produktionsdauer: 15 Ticks
Leistungsbedarf: 40
```

## Level 1: Konstrukteur

```text
RobotType: constructor
Tier: 1
Rolle: Bauen
MVP: nicht aktiv
Unlock: research.construction1
HP: 120/120
Batterie: 100 max
Startbatterie: 70
Cargo: 10
Sichtweite: 2
MovementType: ground
ChargingMode: externalOnly
CommunicationMode: gridRequired
CommunicationStatus: connected
```

Erlaubte Aktionen:

```text
Bauen
Baustellen fortsetzen
Material an Baustelle tragen
extern laden
```

Nicht erlaubt:

```text
Mining als Hauptrolle
Scouting als Hauptrolle
Kampf
Produktion auslösen
```

Effizienz:

```text
Bauaktion: 8 Ticks statt 10
Batteriekosten: 1 %
```

Produktionsdaten:

```text
Gebäude: Roboterfabrik
Kosten: 5 Iron Ore + 2 Steel Plates
Produktionsdauer: 20 Ticks
Leistungsbedarf: 50
```

## Level 1: Nahkampfdrohne

```text
RobotType: meleeDrone
Tier: 1
Rolle: Nahkampf / Verteidigung
MVP: nicht aktiv
Unlock: research.meleeCombat1
HP: 120/120
Batterie: 100 max
Startbatterie: 80
Cargo: 0
Sichtweite: 2
MovementType: ground
ChargingMode: externalOnly
CommunicationMode: gridRequired
CommunicationStatus: connected
```

Erlaubte Aktionen:

```text
Patrouillieren
Nahkampfangriff
Verteidigen
extern laden
```

Nicht erlaubt:

```text
Mining
Bauen
Transport
Scouting als Hauptrolle
Produktion auslösen
```

Kampfwerte Platzhalter:

```text
Angriffsreichweite: 1
Schaden: 10
Angriffsdauer: 5 Ticks
Batteriekosten pro Angriff: 1 %
```

Produktionsdaten:

```text
Gebäude: Roboterfabrik oder Drohnenfabrik
Kosten: 5 Iron Ore + 2 Steel Plates
Produktionsdauer: 20 Ticks
Leistungsbedarf: 50
```

## Level 2: Resource Miner

```text
RobotType: resourceMiner
Tier: 2
Rolle: spezialisierte Ressourcenförderung
MVP: nicht aktiv
Unlock: research.siliconMining1 oder spätere Ressourcenforschung
HP: 100/100
Batterie: 120 max
Startbatterie: 80
Cargo: 20
Sichtweite: 2
MovementType: ground
ChargingMode: externalOnly
CommunicationMode: gridRequired
CommunicationStatus: connected
```

Erlaubte Aktionen:

```text
Silicium abbauen
spezialisierte Ressourcen abbauen
extern laden
```

Nicht erlaubt:

```text
Bauen
Scouting als Hauptrolle
Kampf
Produktion auslösen
```

Effizienz:

```text
Spezialressourcen-Mining: 10 Ticks pro Einheit
Batteriekosten: 1 %
```

Produktionsdaten:

```text
Gebäude: Verbesserte Roboterfabrik
Kosten: 5 Steel Plates + 5 Silicon
Produktionsdauer: 25 Ticks
Leistungsbedarf: 60
```

## Level 2: Transportroboter

```text
RobotType: transportRobot
Tier: 2
Rolle: Logistik / Materialtransport
MVP: nicht aktiv
Unlock: research.transportLogistics1
HP: 90/90
Batterie: 120 max
Startbatterie: 80
Cargo: 30
Sichtweite: 2
MovementType: ground
ChargingMode: externalOnly
CommunicationMode: gridRequired
CommunicationStatus: connected
```

Erlaubte Aktionen:

```text
MaterialRequest erfüllen
Ressourcen zwischen Gebäuden transportieren
Baustellen beliefern
Lager bedienen
extern laden
```

Nicht erlaubt:

```text
Mining
Bauen
Kampf
Scouting als Hauptrolle
Produktion auslösen
```

Produktionsdaten:

```text
Gebäude: Verbesserte Roboterfabrik
Kosten: 4 Steel Plates
Produktionsdauer: 20 Ticks
Leistungsbedarf: 50
```

## Level 2: Fernkampfdrohne

```text
RobotType: rangedDrone
Tier: 2
Rolle: Fernkampf / mobile Verteidigung
MVP: nicht aktiv
Unlock: research.rangedCombat1
HP: 80/80
Batterie: 120 max
Startbatterie: 90
Cargo: 0
Sichtweite: 3
MovementType: flying
ChargingMode: externalOnly
CommunicationMode: gridRequired
CommunicationStatus: connected
```

Erlaubte Aktionen:

```text
Fernkampfangriff
Patrouillieren
Verteidigen
über Hindernisse fliegen
extern laden
```

Nicht erlaubt:

```text
Mining
Bauen
Transport
Produktion auslösen
```

Kampfwerte Platzhalter:

```text
Angriffsreichweite: 3
Schaden: 8
Angriffsdauer: 4 Ticks
Batteriekosten pro Angriff: 1 %
```

Produktionsdaten:

```text
Gebäude: Drohnenfabrik
Kosten: 4 Steel Plates + 4 Silicon
Produktionsdauer: 25 Ticks
Leistungsbedarf: 60
```

## Einheitenübersicht

| Einheit | Tier | HP | Batterie | Start | Cargo | Sicht | Bewegung | Laden | Kommunikation |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| Starter Roboter | 0 | 100 | 100 | 50 | 10 | 2 | ground | hybrid | autonomous |
| Iron Miner | 1 | 100 | 100 | 50 | 20 | 2 | ground | externalOnly | gridRequired |
| Boden Scout | 1 | 70 | 120 | 80 | 0 | 4 | ground | selfCharging | scoutLocked |
| Konstrukteur | 1 | 120 | 100 | 70 | 10 | 2 | ground | externalOnly | gridRequired |
| Nahkampfdrohne | 1 | 120 | 100 | 80 | 0 | 2 | ground | externalOnly | gridRequired |
| Resource Miner | 2 | 100 | 120 | 80 | 20 | 2 | ground | externalOnly | gridRequired |
| Transportroboter | 2 | 90 | 120 | 80 | 30 | 2 | ground | externalOnly | gridRequired |
| Fernkampfdrohne | 2 | 80 | 120 | 90 | 0 | 3 | flying | externalOnly | gridRequired |

## Produktionsübersicht

| Einheit | Gebäude | Kosten | Dauer | Leistung |
|---|---|---:|---:|---:|
| Iron Miner | Roboterfabrik | 5 Iron Ore | 10 Ticks | 40 |
| Boden Scout | Roboterfabrik / Verbesserte Roboterfabrik | 5 Iron Ore | 15 Ticks | 40 |
| Konstrukteur | Roboterfabrik | 5 Iron Ore + 2 Steel Plates | 20 Ticks | 50 |
| Nahkampfdrohne | Roboterfabrik / Drohnenfabrik | 5 Iron Ore + 2 Steel Plates | 20 Ticks | 50 |
| Resource Miner | Verbesserte Roboterfabrik | 5 Steel Plates + 5 Silicon | 25 Ticks | 60 |
| Transportroboter | Verbesserte Roboterfabrik | 4 Steel Plates | 20 Ticks | 50 |
| Fernkampfdrohne | Drohnenfabrik | 4 Steel Plates + 4 Silicon | 25 Ticks | 60 |

## Designregel

```text
MVP aktiv bleiben nur Starter Roboter und Iron Miner als Zielroboter.
Alle anderen Level-1- und Level-2-Einheiten sind Future-Systeme.
Die Werte sind kanonische Startwerte und erste Balancing-Werte.
```

## Level-2-Gebäude-Werte

Level-2-Gebäude besitzen kanonische Basiswerte. Alle Level-2-Gebäude bleiben Future-Systeme.

MVP aktiv bleiben:

```text
Solar Collector
Roboterfabrik
```

Prepared/Future:

```text
KI-Forschungszentrum: prepared
Sendeturm: future
Grid Energy Line: future
Verbesserte Roboterfabrik: future
Drohnenfabrik: future
Gasförderanlage: future
Stahlwerk: future
Energiespeicher: future
Ressourcenspeicher: future
```

## Grundannahmen Level-2-Gebäude

```text
Standardgröße: 1x1
Standard-Sichtweite: 2, falls nicht anders angegeben
Standard-Bauaktion: 10 Ticks pro Fortschritt
Level-2-Gebäude brauchen meistens constructionRequired = 2 oder 3
```

`constructionRequired = 2` bedeutet:

```text
2 abgeschlossene Bauaktionen
mit Starter Roboter: 2 x 10 Ticks
mit Konstrukteur: 2 x 8 Ticks
```

## BuildingType-Erweiterung

```ts
type BuildingType =
  | "solarCollector"
  | "robotFactory"
  | "aiResearchCenter"
  | "communicationTower"
  | "gridEnergyLine"
  | "advancedRobotFactory"
  | "droneFactory"
  | "gasExtractor"
  | "steelworks"
  | "energyStorage"
  | "resourceStorage";
```

## BuildingFunction-Erweiterung

```ts
type BuildingFunction =
  | "powerGeneration"
  | "powerDistribution"
  | "powerStorage"
  | "resourceStorage"
  | "robotProduction"
  | "droneProduction"
  | "resourceExtraction"
  | "resourceProcessing"
  | "research"
  | "communication";
```

## Sendeturm

```text
BuildingType: communicationTower
DisplayName: Sendeturm
Tier: 2
MVP: future
Unlock: research.communication1
HP: 150
Größe: 1x1
Sichtweite: 3
Baukosten: 3 Steel Plates + 2 Silicon
constructionRequired: 2
buildTicksPerProgress: 10
Energieverbrauch aktiv: 10 Leistung
Kommunikationsreichweite: 5 Felder
```

Funktion:

```text
Erzeugt Kommunikationsreichweite 5 per Manhattan-Distanz.
Verbindet gridRequired-Einheiten und Gebäude im Kommunikationsnetz.
```

## Grid Energy Line

```text
BuildingType: gridEnergyLine
DisplayName: Grid Energy Line
Tier: 2
MVP: future
Unlock: research.energyDistribution1
HP: 80
Größe: 1x1
Sichtweite: 0
Baukosten: 1 Steel Plate
constructionRequired: 1
buildTicksPerProgress: 10
Energieverbrauch: 0
```

Funktion:

```text
Verbindet Energiequellen, Verbraucher und Ladepunkte orthogonal.
Bildet ein lokales Energienetz.
```

Platzierungsregel:

```text
Grid Energy Line muss orthogonal an ein anderes Energienetz-Element angrenzen.
```

Energienetz-Elemente:

```text
Solar Collector
Grid Energy Line
Energiespeicher
Roboterfabrik
Verbesserte Roboterfabrik
Drohnenfabrik
Stahlwerk
Gasförderanlage
```

## Verbesserte Roboterfabrik

```text
BuildingType: advancedRobotFactory
DisplayName: Verbesserte Roboterfabrik
Tier: 2
MVP: future
Unlock: research.industrialManufacturing1
HP: 200
Größe: 1x1
Sichtweite: 2
Baukosten: 6 Steel Plates + 4 Silicon
constructionRequired: 3
buildTicksPerProgress: 10
Energiebedarf im Leerlauf: 0
Energiebedarf bei Produktion: je nach Einheit
```

Produzierbare Einheiten:

```text
Boden Scout
Resource Miner
Transportroboter
optional Konstrukteur
```

## Drohnenfabrik

```text
BuildingType: droneFactory
DisplayName: Drohnenfabrik
Tier: 2
MVP: future
Unlock: research.flightMechanics1
HP: 180
Größe: 1x1
Sichtweite: 2
Baukosten: 5 Steel Plates + 6 Silicon
constructionRequired: 3
buildTicksPerProgress: 10
Energiebedarf im Leerlauf: 0
Energiebedarf bei Produktion: je nach Einheit
```

Produzierbare Einheiten:

```text
Nahkampfdrohne
Fernkampfdrohne
spätere Flugdrohnen
```

## Gasförderanlage

```text
BuildingType: gasExtractor
DisplayName: Gasförderanlage
Tier: 2
MVP: future
Unlock: research.gasExtraction1
HP: 160
Größe: 1x1
Sichtweite: 2
Baukosten: 4 Steel Plates + 2 Silicon
constructionRequired: 2
buildTicksPerProgress: 10
Energiebedarf aktiv: 20 Leistung
Förderrate: 1 Gas pro 10 Ticks
```

Platzierungsregel:

```text
muss orthogonal neben einem Gasvorkommen gebaut werden
```

Förderlogik:

```text
Wenn aktiv und mit Energie versorgt:
alle 10 Ticks +1 Gas im Output-Inventar
```

## Stahlwerk

```text
BuildingType: steelworks
DisplayName: Stahlwerk
Tier: 2
MVP: future
Unlock: research.metalProcessing1
HP: 180
Größe: 1x1
Sichtweite: 2
Baukosten: 5 Iron Ore + 3 Steel Plates
constructionRequired: 2
buildTicksPerProgress: 10
Energiebedarf aktiv: 30 Leistung
```

Rezept:

```text
Input: 2 Iron Ore
Output: 1 Steel Plate
Dauer: 10 Ticks
Leistungsbedarf: 30
```

Verarbeitungsregel:

```text
Input wird beim Start des Verarbeitungstasks reserviert/verbraucht.
Output entsteht beim Abschluss.
Wenn Leistung fehlt, pausiert Verarbeitung.
```

## Energiespeicher

```text
BuildingType: energyStorage
DisplayName: Energiespeicher
Tier: 2
MVP: future
Unlock: research.energyBuffer1
HP: 150
Größe: 1x1
Sichtweite: 1
Baukosten: 3 Steel Plates + 3 Silicon
constructionRequired: 2
buildTicksPerProgress: 10
Energieverbrauch: 0
Speicherkapazität: 200 Energie
max. Ladeleistung: 50
max. Entladeleistung: 50
```

Funktion:

```text
Nimmt überschüssige Netzleistung auf.
Gibt gespeicherte Energie ab, wenn Verbraucher mehr Leistung benötigen als aktuell erzeugt wird.
```

Nicht MVP:

```text
Keine Speicherlogik im MVP.
```

## Ressourcenspeicher

```text
BuildingType: resourceStorage
DisplayName: Ressourcenspeicher
Tier: 2
MVP: future
Unlock: research.transportLogistics1
HP: 150
Größe: 1x1
Sichtweite: 1
Baukosten: 3 Steel Plates
constructionRequired: 2
buildTicksPerProgress: 10
Energieverbrauch: 0
Speicherkapazität: 100 Ressourceneinheiten gesamt
StoragePolicy: allResources
```

Rolle:

```text
lagert Rohressourcen und verarbeitete Ressourcen
dient als Quelle für Transportroboter
dient als Quelle für Bauroboter/Konstrukteure
kann Input/Output zwischen Gebäuden puffern
```

Gelagerte Ressourcen:

```text
Iron Ore
Gas
Silicon
Steel Plates
```

Kapazitätsmodell:

```text
Gesamtkapazität: 100
jede Ressourceneinheit belegt 1 Kapazität
```

Beispiel:

```text
40 Iron Ore
20 Steel Plates
10 Silicon
= 70/100 belegt
```

Logistikablauf Future:

```text
Produktionsgebäude erzeugt Output
→ Transportroboter holt Output ab
→ Transportroboter bringt Ressource zum Ressourcenspeicher
→ Bauroboter/Konstrukteur holt benötigte Ressourcen aus Ressourcenspeicher
→ bringt sie zu Baustelle oder Produktionsgebäude
```

## Übersicht Level-2-Gebäude

| Gebäude | Tier | HP | Kosten | Baufortschritt | Energie | Unlock |
|---|---:|---:|---|---:|---:|---|
| Sendeturm | 2 | 150 | 3 Steel Plates + 2 Silicon | 2 | -10 | communication1 |
| Grid Energy Line | 2 | 80 | 1 Steel Plate | 1 | 0 | energyDistribution1 |
| Verbesserte Roboterfabrik | 2 | 200 | 6 Steel Plates + 4 Silicon | 3 | Produktion | industrialManufacturing1 |
| Drohnenfabrik | 2 | 180 | 5 Steel Plates + 6 Silicon | 3 | Produktion | flightMechanics1 |
| Gasförderanlage | 2 | 160 | 4 Steel Plates + 2 Silicon | 2 | -20 | gasExtraction1 |
| Stahlwerk | 2 | 180 | 5 Iron Ore + 3 Steel Plates | 2 | -30 | metalProcessing1 |
| Energiespeicher | 2 | 150 | 3 Steel Plates + 3 Silicon | 2 | Speicher | energyBuffer1 |
| Ressourcenspeicher | 2 | 150 | 3 Steel Plates | 2 | 0 | transportLogistics1 |

## Designregel

```text
Level-2-Gebäude sind Future-Systeme.
MVP aktiv bleiben Solar Collector und Roboterfabrik.
energyStorage und resourceStorage sind kanonische BuildingTypes.
Ressourcenspeicher ist der zentrale Lagerort für Rohstoffe und verarbeitete Ressourcen.
Transportroboter und Bauroboter/Konstrukteure nutzen ihn später als Quelle für MaterialRequests.
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
