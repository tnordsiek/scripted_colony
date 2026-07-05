# Forschungsbaum

Dieses Future-Dokument darf Typauszuege fuer spaetere Systeme enthalten; sie sind nicht MVP-kanonisch. Aktive MVP-Typen stehen in `docs/03-technical/canonical-data-model.md`.
## Kanonischer Future-Forschungsbaum

Forschung bleibt kein aktives MVP-System. Der kanonische Future-Forschungsbaum ist dokumentiert.

## MVP-Abgrenzung

Nicht MVP:

- aktive Forschung
- Forschungs-UI
- Forschungskosten im laufenden MVP-Spiel
- aktive Research-Unlocks
- Forschungsfortschritt im Simulationsloop

Im MVP vorbereitet:

- Gebäudetyp `aiResearchCenter`
- Research-Datenmodell
- Forschungsbaum als Future-Blueprint

## KI-Forschungszentrum

Spielname: `KI-Forschungszentrum`

Technische ID: `aiResearchCenter`

Nicht verwenden: `KI-Rechenzentrum`, `Forschungszentrum`, `aiComputeCenter`

Future-Regeln:

- Tier 1
- erzeugt Forschungskapazität
- 1 KI-Forschungszentrum = 100 Forschungskapazität
- ein Projekt pro Zentrum
- mehrere Zentren können später parallelisieren oder beschleunigen

## Forschungsstruktur

Zweige:

- `infrastructure`
- `energy`
- `industry`
- `resourceExtraction`
- `units`
- `communication`
- `programDesign`
- `combatDefense`

Tiers:

- Tier 1: Basis-Expansion nach MVP
- Tier 2: Industrie, Kommunikation, Spezialisten
- Tier 3: Spezialisierung und Kampf
- Tier 4: fortgeschrittene Systeme

Forschung kostet Forschungskapazität und optional später Ressourcen. Die Kosten sind erste Balancing-Werte.
## Datenmodell

```ts
type ResearchBranch =
  | "infrastructure"
  | "energy"
  | "industry"
  | "resourceExtraction"
  | "units"
  | "communication"
  | "programDesign"
  | "combatDefense";

type ResearchTier = 1 | 2 | 3 | 4;

type ResearchUnlock =
  | { type: "building"; buildingType: BuildingType }
  | { type: "robot"; robotType: RobotType }
  | { type: "resource"; resourceType: ResourceType }
  | { type: "recipe"; recipeId: string }
  | { type: "programFeature"; featureId: string }
  | { type: "system"; systemId: string };

type ResearchProject = {
  id: ResearchProjectId;
  name: string;
  branch: ResearchBranch;
  tier: ResearchTier;
  prerequisites: ResearchProjectId[];
  researchCost: number;
  resourceCost?: ResourceCost;
  unlocks: ResearchUnlock[];
  description: string;
};
```
## Kanonische Projekte
### Tier 1
#### research.basicAutomation1
- Name: Basisautomatisierung I
- Zweig: `programDesign`
- Tier: 1
- Voraussetzungen: KI-Forschungszentrum aktiv
- Kosten: 200 Forschung
- Unlocks:
  - Programmausführungslimits sichtbar/editierbar
  - maxExecutions für Bauprogramme frei nutzbar

#### research.metalProcessing1
- Name: Metallverarbeitung I
- Zweig: `industry`
- Tier: 1
- Voraussetzungen: KI-Forschungszentrum aktiv
- Kosten: 300 Forschung
- Unlocks:
  - Stahlwerk
  - Steel Plates
  - Rezept: 2 Iron Ore + 10 Energie + 10 Ticks -> 1 Steel Plate

#### research.construction1
- Name: Konstruktion I
- Zweig: `infrastructure`
- Tier: 1
- Voraussetzungen: KI-Forschungszentrum aktiv
- Kosten: 250 Forschung
- Unlocks:
  - Konstrukteur
  - Bau-Spezialisierung

#### research.energyDistribution1
- Name: Energieverteilung I
- Zweig: `energy`
- Tier: 1
- Voraussetzungen: KI-Forschungszentrum aktiv
- Kosten: 250 Forschung
- Unlocks:
  - Grid Energy Line
  - einfache Energieübertragung

#### research.communication1
- Name: Kommunikation I
- Zweig: `communication`
- Tier: 1
- Voraussetzungen: KI-Forschungszentrum aktiv
- Kosten: 250 Forschung
- Unlocks:
  - Sendeturm
  - aktives Kommunikationsgrid

#### research.groundScout1
- Name: Boden-Scout I
- Zweig: `units`
- Tier: 1
- Voraussetzungen: KI-Forschungszentrum aktiv
- Kosten: 250 Forschung
- Unlocks:
  - Boden Scout
  - scoutLocked-Kommunikationsmodus

### Tier 2
#### research.gasExtraction1
- Name: Gasextraktion I
- Zweig: `resourceExtraction`
- Tier: 2
- Voraussetzungen: research.metalProcessing1
- Kosten: 500 Forschung
- Unlocks:
  - Gasförderanlage
  - Ressource Gas verwertbar

#### research.siliconDetection1
- Name: Siliciumsensorik I
- Zweig: `resourceExtraction`
- Tier: 2
- Voraussetzungen: research.groundScout1
- Kosten: 500 Forschung
- Unlocks:
  - Silicium sichtbar/scannbar
  - Voraussetzung für spezialisierte Siliciumförderung

#### research.industrialManufacturing1
- Name: Industrielle Fertigung I
- Zweig: `industry`
- Tier: 2
- Voraussetzungen: research.metalProcessing1
- Kosten: 600 Forschung
- Unlocks:
  - Verbesserte Roboterfabrik
  - komplexere Einheitenproduktion

#### research.transportLogistics1
- Name: Transportlogistik I
- Zweig: `infrastructure`
- Tier: 2
- Voraussetzungen: research.metalProcessing1
- Kosten: 500 Forschung
- Unlocks:
  - Transportroboter
  - MaterialRequest-System aktiv
  - einfache Gebäudeinventare

#### research.programDesign2
- Name: Programm-Gestaltungsoptionen II
- Zweig: `programDesign`
- Tier: 2
- Voraussetzungen: research.basicAutomation1
- Kosten: 500 Forschung
- Unlocks:
  - Bau-Schemata
  - Linien-/Block-/Ring-Schemata

#### research.energyBuffer1
- Name: Energiepuffer I
- Zweig: `energy`
- Tier: 2
- Voraussetzungen: research.energyDistribution1
- Kosten: 500 Forschung
- Unlocks:
  - Energiespeicher
  - Netzleistung kann gepuffert werden

### Tier 3
#### research.siliconMining1
- Name: Siliciumförderung I
- Zweig: `resourceExtraction`
- Tier: 3
- Voraussetzungen: research.siliconDetection1, research.industrialManufacturing1
- Kosten: 800 Forschung
- Unlocks:
  - spezialisierter Silicium-Miner
  - Silicium als nutzbare Ressource

#### research.flightMechanics1
- Name: Flugmechanik I
- Zweig: `units`
- Tier: 3
- Voraussetzungen: research.industrialManufacturing1, research.energyBuffer1
- Kosten: 800 Forschung
- Unlocks:
  - Drohnenfabrik
  - fliegende Bewegung vorbereitet

#### research.meleeCombat1
- Name: Nahkampfprotokolle I
- Zweig: `combatDefense`
- Tier: 3
- Voraussetzungen: research.construction1
- Kosten: 600 Forschung
- Unlocks:
  - Nahkampfdrohne
  - einfache Gegnerinteraktion

#### research.defenseRoutines1
- Name: Verteidigungsroutinen I
- Zweig: `combatDefense`
- Tier: 3
- Voraussetzungen: research.meleeCombat1
- Kosten: 700 Forschung
- Unlocks:
  - Verteidigungsprogramme
  - Bedrohungssensoren

#### research.programDesign3
- Name: Programm-Gestaltungsoptionen III
- Zweig: `programDesign`
- Tier: 3
- Voraussetzungen: research.programDesign2, research.transportLogistics1
- Kosten: 800 Forschung
- Unlocks:
  - komplexe Baupläne
  - Gebäudelisten
  - Materialanforderungen für Baupläne

#### research.communication2
- Name: Kommunikationsnetz II
- Zweig: `communication`
- Tier: 3
- Voraussetzungen: research.communication1, research.energyDistribution1
- Kosten: 700 Forschung
- Unlocks:
  - größere Kommunikationsreichweiten
  - gridRequired-Einheiten aktiv

### Tier 4
#### research.autonomyModules1
- Name: Autonomie-Module I
- Zweig: `units`
- Tier: 4
- Voraussetzungen: research.communication2, research.programDesign3
- Kosten: 1000 Forschung
- Unlocks:
  - Autonomie-Modul
  - ausgewählte Roboter können außerhalb Grid arbeiten

#### research.advancedEnergy1
- Name: Fortgeschrittene Energie I
- Zweig: `energy`
- Tier: 4
- Voraussetzungen: research.energyBuffer1, research.gasExtraction1
- Kosten: 1000 Forschung
- Unlocks:
  - verbesserte Energieproduktion
  - Gas als Energiequelle

#### research.rangedCombat1
- Name: Fernkampfprotokolle I
- Zweig: `combatDefense`
- Tier: 4
- Voraussetzungen: research.flightMechanics1, research.defenseRoutines1
- Kosten: 1000 Forschung
- Unlocks:
  - Fernkampfdrohne
  - Fernkampfangriffe

#### research.fleetCoordination1
- Name: Roboterflotten-Koordination I
- Zweig: `programDesign`
- Tier: 4
- Voraussetzungen: research.autonomyModules1, research.communication2
- Kosten: 1200 Forschung
- Unlocks:
  - Gruppenprogramme
  - rollenbasierte Stack-Verteilung

## Designregel

Der Forschungsbaum ist kein MVP-System. Er ist ein kanonischer Future-Blueprint für Progression, Unlocks und spätere Systemtiefe. Projekt-IDs, Namen, Zweige, Tiers, Voraussetzungen und Unlocks sind verbindlich. Forschungskosten sind erste Balancing-Werte und dürfen später angepasst werden.

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
