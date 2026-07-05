# Glossar und Namenskonventionen

## Verbindliche Namen

```text
Spielname: KI-Forschungszentrum
Technische ID: aiResearchCenter
```

Nicht verwenden:

- KI-Rechenzentrum
- aiComputeCenter

## Ressourcen

- Iron Ore: Startressource
- Gas: spätere natürliche Ressource
- Silicium: spätere natürliche Ressource
- Steel Plates: spätere verarbeitete Ressource

## Gebäude-IDs

- `solarCollector`
- `robotFactory`
- `aiResearchCenter`
- `communicationTower`
- `gridEnergyLine`
- `advancedRobotFactory`
- `droneFactory`
- `gasExtractor`
- `steelworks`

## Einheit-IDs

- `starterRobot`
- `ironMiner`
- `groundScout`
- `meleeDrone`
- `constructor`
- `resourceMiner`
- `transportRobot`
- `rangedDrone`

## Begriffe

- Stack: priorisierte Programmliste
- Condition: Bedingung
- Action: Aktion
- Stop-Bedingung: beendet laufendes Programm
- Stasis: Sicherheitszustand bei Energie-/Kommunikationsproblem
- Fog: entdeckt, aber aktuell nicht sichtbar

## Produktionsbegriffe

### Mindestenergiebedarf

Interne Energieanforderung einer Aktion. Wird automatisch geprüft und muss vom Spieler nicht als Condition eingebaut werden.

### Aktionsparameter

Konfigurierbare Eigenschaften einer Aktion, z. B. Gebäudetyp, Feldbedingung oder maximale Erkundungsdistanz.

### Ready to Spawn

Zustand einer abgeschlossenen Produktion, bei der die Einheit fertig ist, aber noch kein freies Ausgabefeld gefunden wurde.

## Visual-Programming-Datenmodell

### TemplateDefinition

Unveränderte Vorlage aus der Programmbibliothek.

### ProgramInstance

Konkrete Kopie eines Templates im Roboterstack. Spieleränderungen betreffen diese Instanz.

### ProgramRow

Eine IF/THEN/STOP-Zeile eines Programms.

### ConditionExpression

Technische Struktur für eine Bedingung. Kann SensorCondition, NotCondition oder LogicalConditionGroup sein.

### ProgramAction

Technische Struktur einer Aktion inklusive Aktionsparametern.

### UI-Projektion

Darstellung des technischen Modells als lesbare grafische Blöcke.

## ProductionTask

Produktionsauftrag in einem Gebäude.

MVP-Zustände:

```text
inProgress
readyToSpawn
spawnBlocked
```

`inProgress`: Produktion läuft. Fortschritt entsteht nur, wenn genug Leistung verfügbar ist.

`readyToSpawn`: Produktion ist fertig, Einheit wartet auf Spawn.

`spawnBlocked`: Produktion ist fertig, aber kein gültiges Ausgabefeld ist frei. Die Fabrik nimmt keine neuen Aufträge an.

Es gibt keinen dauerhaft gespeicherten `completed`-Status. Nach erfolgreichem Spawn wird `productionTask` entfernt.

## Iron Miner Produktionskosten

MVP-Regel:

```text
Iron Miner = 5 Iron Ore
```

Die Kosten werden beim Start des Produktionsauftrags in der Roboterfabrik abgezogen.

## Baustelle

Eine Baustelle ist im MVP ein `Building` mit `status = construction`.

Sie enthält:

```text
costPaid
constructionProgress
constructionRequired
```

Baustellen blockieren Bewegung, können im MVP nicht manuell abgebrochen werden und behalten bereits bezahlte Ressourcen.

## Roboterladung und Gebäudeenergie

MVP-Regel:

```text
Roboterbatterie und Gebäudeenergie sind getrennte Systeme.
```

Stasis-Laden ist die einzige aktive MVP-Lademechanik. Es verbraucht keine Netzleistung.

Gebäudeenergie ist ein globaler Power-Pool und beeinflusst im MVP ausschließlich `ProductionTask`-Fortschritt.

Nicht MVP-aktiv:

```text
Solar Collector lädt angrenzende Roboter.
Externes Laden verbraucht Netzleistung.
Gebäudeproduktion konkurriert mit Roboterladung um freie Leistung.
```

Diese Regeln sind Future/Advanced.

## Kommunikationsgrid MVP

Im MVP ist das Kommunikationsgrid deaktiviert.

```text
MVP_COMMUNICATION_GRID_ACTIVE = false
```

Alle MVP-Einheiten gelten als connected. Kommunikation blockiert keine Aktionen. Das vollständige Kommunikationsgrid ist ein Zukunftssystem.

## MVP-Map-Generator

Deterministischer Generator für die 10x10-MVP-Karte.

Wichtige Regeln:

- Seed-basiert
- 20 Iron-Ore-Felder
- kein Iron Ore im initial sichtbaren Bereich
- mindestens ein erreichbares Ore-Feld in BFS-Distanz 4-6
- orthogonale Cluster
- feste Fallback-Karte nach 100 Fehlversuchen

### No-Ore-Zone

Initial sichtbarer Bereich um den Startroboter. Dort darf kein Iron Ore liegen.

### Zielring

Felder außerhalb der initial sichtbaren No-Ore-Zone; mindestens ein erreichbares Feld liegt in BFS-Distanz 4-6 vom Start.

### Fallback-Karte

Fest definierte Karte, die verwendet wird, wenn der Generator nach 100 Versuchen keine valide Karte erzeugt.

## Pfadfindung und Kollisionen

MVP-Pfadfindung verwendet BFS ueber orthogonale Nachbarn.

### Begehbares Feld

Feld innerhalb der Karte, passierbares Terrain, kein Gebaeude, keine Baustelle, keine aktive Ressource und kein anderer Roboter.

### Temporaere Blockade

Blockade durch einen anderen Roboter. Der Roboter wartet bis zu 3 Ticks, danach bricht die Aktion ab.

### Permanente Blockade

Blockade durch Gebaeude, Baustelle, aktive Ressource, nicht passierbares Terrain oder Kartenrand.

### Zielnachbarfeld

Begehbares Feld neben einem Zielobjekt, z. B. Iron Ore, Baustelle oder Ladequelle.

## Long Task

Eine Aktion mit Laufzeit über mehrere Ticks.

MVP-Long-Tasks:

- MiningTask
- BuildTask
- ProductionTask

Laden ist ein kontinuierlicher Tick-Effekt. Bewegung ist ein Ein-Tick-Schritt.

Long-Task-Lebenszyklus:

```text
Startprüfung
→ remainingTicks herunterzählen
→ Abschlussprüfung
→ Ergebnis oder Abbruch
```

Mining und Bau erzeugen nur bei erfolgreichem Abschluss ein Ergebnis. Abbruch erzeugt keinen Teilfortschritt und kostet keine Batterie.

## Stack-und-Zeilen-Auswertung

Zweistufige Entscheidung eines Roboters:

```text
Programmstack:
Programme von oben nach unten pruefen.

Programmzeilen:
Zeilen innerhalb eines Programms von oben nach unten pruefen.
```

Die erste ausfuehrbare Zeile des ersten ausfuehrbaren Programms wird aktiv.

Eine Zeile ist ausfuehrbar, wenn IF erfuellt ist und THEN ausfuehrbar ist.

Wenn keine Zeile ausfuehrbar ist, wird das naechste Programm geprueft. Wenn kein Programm ausfuehrbar ist, bleibt `robot.status = active`; die UI/Diagnose leitet `idle` als Aktivitaetszustand ab.

## UI-MVP

Der UI-MVP ist ein debug-spielbarer Main Game Screen.

Er besteht aus:

- MapCanvas-Bereich
- SelectionPanel
- ProgramStackPanel
- ProgramEditorPanel
- DiagnosticsPanel
- BottomControlBar
- EventLogPanel

Er zeigt Simulation, Programmstack, editierbare Templatewerte, Diagnose und Eventlog. Er erlaubt keine direkte Einheitensteuerung.

## Forschungsbaum als Future-System

Forschung bleibt nicht MVP.

Der vorbereitete Future-Forschungsbaum umfasst:

- 8 Forschungszweige
- 4 Tiers
- 22 Forschungsprojekte
- eindeutige ResearchProjectIds
- Voraussetzungen
- Forschungskosten als erste Balancing-Werte
- Unlocks für Gebäude, Roboter, Ressourcen, Rezepte, Programmsysteme und Future-Systeme

Hauptdokument:

```text
docs/05-future/research-tree.md
```

KI-Forschungszentrum bleibt kanonischer Spielname. Technische ID bleibt `aiResearchCenter`. `aiComputeCenter` wird nicht verwendet.

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

Fuer diese Future-Einheiten sind Startwerte fuer HP, Batterie, Startbatterie, Cargo, Sichtweite, MovementType, ChargingMode, CommunicationMode, Rollen, erlaubte Aktionen und Produktionsdaten dokumentiert.

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

## Asset-Spezifikation

Assets sind implementierungsscharf dokumentiert.

Festgelegt:

- MVP-required Assets
- MVP-optional Assets
- Future-Assets
- Dateipfade
- Assetgrößen
- Render-Layer
- Namenskonvention
- Canvas-Fallbacks
- Asset Registry
- BASE_URL-kompatibles Asset-Loading

Hauptdokument:

```text
docs/05-assets/asset-fallbacks.md
docs/05-assets/asset-inventory.md
docs/06-reference/assets.md
```

Regel:

```text
Das Spiel muss ohne echte Bilddateien über Canvas-Fallbacks lauffähig sein.
```

## MVP-Sackgasse im Programmablauf

Die MVP-Sackgasse im Programmablauf ist geloest.

Kernentscheidungen:

```text
Energie sichern ist nicht mehr Teil des MVP-Startroboter-Stacks.
Stasis-Laden ist die einzige harte Energiesicherung.
Erkunden hat für den Startroboter keine Batterie-Mindestbedingung.
Erkunden stoppt erst, wenn Iron Ore angrenzend ist oder der Roboter in Stasis fällt.
scoutNearby steuert sichtbares, aber nicht angrenzendes Iron Ore intern an.
```

Neuer MVP-Startroboter-Stack:

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

Hauptdokumente:

```text
docs/03-technical/program-stack-rules.md
docs/02-mvp/mvp-template-spec.md
```

## Scoute Nahfeld

Kanonische Schreibweise:

```text
Scoute Nahfeld mit Ziel "Iron Ore"
```

Technische Aktion:

```text
action.scoutNearby
```

Kanonischer MVP-Parameter:

```text
targetFieldType = ironOre
```

Regel:

```text
Scoute Nahfeld ist keine Iron-Ore-spezifische Aktion.
Die Aktion reagiert auf den konfigurierten Zieltyp.
```

## startIronMinerProduction

Kanonischer MVP-PlayerCommand:

```ts
{ type: "startIronMinerProduction"; buildingId: BuildingId }
```

UI-Label:

```text
Iron Miner produzieren
```

Gültig nur für:

```text
building.type = robotFactory
```

Der Command produziert keinen Roboter sofort, sondern legt einen ProductionTask an.

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

## Koordinaten und Startposition

Kanonische Begriffe:

```text
0-basierte Koordinaten
Ursprung oben links
map[y][x]
MVP-Startfeld { x: 5, y: 5 }
```

Formulierung:

```text
{ x: 5, y: 5 } ist eines der vier zentralen Felder der 0-basierten 10x10-Karte.
```

Zu vermeiden:

```text
exakte Mitte
Kartenmitte
map[x][y]
1-basierte Koordinaten
```

## Build-Action

Kanonische UI-Form:

```text
Baue Gebäude mit Typ "Solar Collector"
Baue Gebäude mit Typ "Roboterfabrik"
```

Technische Aktion:

```text
action.buildBuilding
```

Kanonischer Parameter:

```text
buildingType
```

Regel:

```text
Der Spieler wählt den Gebäudetyp, nicht den Bauplatz.
Die Simulation wählt `site` und `buildFrom` intern.
```

## Action Executability Matrix

Kanonische Datei:

```text
docs/03-technical/action-executability-matrix.md
```

Zweck:

```text
zentrale Ausführbarkeitsregeln für ProgramActions
Pflichtparameter
Task-Typen
Ressourcenzeitpunkte
Diagnosegründe
Stack-Fortsetzung
```

Kanonische Begriffe:

```text
executable
notExecutable
ActionNotExecutableReason
CommandRejectionReason
```

## Diagnose und Eventlog

Kanonische Datei:

```text
docs/03-technical/diagnostics-and-eventlog.md
```

Kanonische Begriffe:

```text
Player Eventlog
Debug Diagnostics
GameEventCode
visibility = player
visibility = debug
severity
priority
repeatCount
```

Regel:

```text
Tests prüfen event.code, nicht message.
Player Events erklären Spielzustände.
Debug Events erklären interne Entscheidungen.
```

## MVP Testmatrix

Kanonische Datei:

```text
docs/02-mvp/mvp-test-matrix.md
```

Kanonische Begriffe:

```text
Test-ID
P0
P1
P2
required
recommended
future
deprecated
Definition of Done
```

Regel:

```text
P0 required Tests sind MVP-blockierend.
```

## MVP-Energie

Kanonische Datei:

```text
docs/04-systems/energy-system.md
```

Kanonische Begriffe:

```text
globaler Power-Pool
EnergySnapshot
powerProvided
powerRequired
freePower
insufficientPower
```

Regel:

```text
MVP-Energie ist global.
Roboterbatterie ist getrennt vom Power-Pool.
```

## Spawn vs. Produktion

Kanonische Begriffe:

```text
Produktion gestartet:
  ProductionTask wurde erstellt.

readyToSpawn:
  ProductionTask ist fertig, aber Robot-Entity existiert noch nicht zwingend.

spawnBlocked:
  ProductionTask ist fertig, aber kein freies Ausgabefeld existiert.

Spawn erfolgreich:
  Robot-Entity wurde erstellt und in GameState.robots eingefügt.
```

Regel:

```text
Score und MVP-Ziel hängen am erfolgreichen Spawn, nicht am Produktionsstart.
```

## standardRobot

Status:

```text
nicht-kanonischer Legacy-Begriff
kein gültiger RobotType
nicht im MVP erlaubt
nicht als Future-Typ spezifiziert
```

Nicht verwenden:

```text
robot.type = standardRobot
```

Korrekte Alternativen:

```text
starterRobot für den MVP-Startroboter
ironMiner für den ersten gespawnten Zielroboter
constructor für spätere Bauroboter / future
resourceMiner für spätere spezialisierte Ressourcenroboter / future
```

Regel:

```text
Alle Roboter verwenden konkrete RobotType-Werte.
```

## Asset-Fallback

Kanonische Datei:

```text
docs/05-assets/asset-fallbacks.md
```

Begriff:

```text
Fallback = verbindliche Ersatzdarstellung fuer ein fehlendes finales Asset.
```

Regel:

```text
Fehlende finale Assets blockieren den MVP nicht.
Fehlende Fallbacks sind MVP-blockierend.
```
