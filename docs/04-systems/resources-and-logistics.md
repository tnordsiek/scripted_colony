# Ressourcen und Logistik

Kanonische TypeScript-Typdefinitionen fuer aktive MVP-State-Felder stehen in `docs/03-technical/canonical-data-model.md`. Future-Logistiktypen in diesem Dokument sind nicht MVP-aktiv.
## Ressourcen-Kategorien

Natürliche Rohstoffe:

- Iron Ore
- Gas
- Silicium

Verarbeitete Materialien:

- Steel Plates

MVP aktiv:

- Iron Ore

## Iron Ore

- direkt abbaubar
- 20 Einheiten pro Feld
- Grundlage für Solar Collector und Roboterfabrik

## Gas

Später:

- Vorkommen auf Karte
- nur über Gasförderanlage nutzbar
- benötigt Forschung

## Silicium

Später:

- technische Ressource
- benötigt für Sensorik, KI, Drohnen, fortgeschrittene Gebäude

## Steel Plates

Später:

```text
2 Iron Ore + 10 Energie + 10 Ticks
→ 1 Steel Plate
```

Kein natürliches Vorkommen.

## Spätere Logistik

Nicht MVP:

- Gebäudeinventare
- Lagerdepots
- Input-/Output-Inventare
- MaterialRequests
- Transportroboter

Grundregel später:

```text
Baustelle benötigt Material
→ MaterialRequest
→ Transportroboter liefert
```

## Ressourcenverbrauch im MVP

Gebäude- und Produktionskosten werden beim Start des jeweiligen Auftrags abgezogen.

```text
Solar Collector: 5 Iron Ore
Roboterfabrik: 5 Iron Ore
Iron Miner: 5 Iron Ore
```

Für das vollständige MVP-Ziel benötigt der Spieler mindestens 15 Iron Ore.

## Iron Miner Produktionskosten

Der Iron Miner kostet im MVP 5 Iron Ore.

MVP-Mindestbedarf:

```text
Solar Collector: 5 Iron Ore
Roboterfabrik: 5 Iron Ore
Iron Miner: 5 Iron Ore
Gesamt: 15 Iron Ore
```

Damit muss der Startroboter nach der ersten Füllung mit 10 Iron Ore zusätzliche 5 Iron Ore abbauen, bevor der Iron-Miner-ProductionTask gestartet und der Iron Miner später gespawnt werden kann.

## Baukosten-Zeitpunkt

Baukosten werden beim Start des Bauauftrags bezahlt.

MVP:

```text
Solar Collector: 5 Iron Ore
Roboterfabrik: 5 Iron Ore
```

Die Ressourcen werden aus dem Cargo des bauenden Roboters abgezogen. Die entstehende Baustelle speichert die bezahlten Kosten in `costPaid`.

Beim Fortsetzen einer bestehenden Baustelle werden keine Ressourcen erneut bezahlt.

## Roboterladung und Gebäudeenergie

Externes Roboterladen ist im MVP nicht aktiv.

```text
Solar Collector lädt keine Roboter.
Roboterladung verbraucht keine Netzleistung.
Gebäudeenergie beeinflusst nur ProductionTasks.
Stasis-Laden ist die einzige aktive MVP-Lademechanik.
```

Die früheren Detailregeln zu externer Roboterladung bleiben Future/Advanced und werden nicht im MVP verarbeitet.

## Mining-Long-Task-Timing

Mining ist ein 10-Tick-Long-Task.

```text
Dauer: 10 Ticks
Batteriekosten: 1 Batterie
Kostenzeitpunkt: erfolgreicher Abschluss
Ergebnis: +1 Iron Ore im Cargo, -1 amount auf Ore-Feld
```

Vor Abschluss entsteht kein Iron Ore.

Abbruch vor Abschluss:

```text
kein Iron Ore
keine Batteriekosten
Task endet
Stack-Prüfung beginnt wieder oben
```

Abschlussprüfung:

```text
Roboter steht neben Iron Ore
Iron Ore amount > 0
Cargo hat Platz
Batterie reicht für Abschlusskosten
```

## Ressourcen-Forschungsbezug

`research.metalProcessing1` schaltet Steel Plates frei. `research.gasExtraction1` macht Gas verwertbar. `research.siliconDetection1` macht Silicium sichtbar/scannbar. `research.siliconMining1` macht Silicium nutzbar.

Vollständig dokumentiert in `docs/05-future/research-tree.md`.

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

## MaterialRequest und Ressourcenspeicher

Der Ressourcenspeicher ist der zentrale Future-Lagerort für Rohstoffe und verarbeitete Ressourcen.

```text
resourceStorage
capacity: 100 Ressourceneinheiten
policy: allResources
```

MaterialRequest-Bezug:

```text
fromBuildingId kann ein Ressourcenspeicher sein.
toBuildingId kann ein Produktionsgebäude sein.
toConstructionSiteId kann eine Baustelle sein.
```

Beispiele:

```text
Stahlwerk erzeugt Steel Plates
→ Transportroboter bringt Steel Plates in Ressourcenspeicher

Baustelle benötigt 3 Steel Plates
→ Konstrukteur oder Transportroboter holt Steel Plates aus Ressourcenspeicher
→ liefert sie zur Baustelle

Gasförderanlage erzeugt Gas
→ Transportroboter bringt Gas in Ressourcenspeicher
```

## Logistiksystem als Future-System

Logistik ist als implementierbares Future-System definiert.

## MVP-Abgrenzung

Logistik ist nicht MVP.

MVP:

```text
Starter Roboter trägt Ressourcen direkt.
Baukosten werden beim Start des Bauauftrags aus Starter-Cargo/globalem MVP-Bestand bezahlt.
Keine Transportroboter.
Keine MaterialRequests.
Keine aktiven Gebäudeinventare.
Keine Ressourcenspeicher-Nutzung.
```

Future:

```text
Gebäude haben Input-/Output-/Storage-/Construction-Inventare.
Transportroboter erfüllen MaterialRequests.
Ressourcenspeicher lagern Roh- und verarbeitete Ressourcen.
Baustellen erhalten Materialanforderungen.
Produktionsgebäude benötigen echte Input-Lieferungen.
```

## Grundprinzip

Ressourcen sind nicht mehr global sofort verfügbar, sondern liegen in:

```text
Gebäudeinventaren
Ressourcenspeichern
Roboter-Cargo
Baustellen
```

Materialfluss:

```text
Quelle → MaterialRequest → Transportroboter → Ziel
```

Beispiele:

```text
Stahlwerk erzeugt Steel Plates
→ Output-Inventar des Stahlwerks
→ Transportroboter bringt Steel Plates zum Ressourcenspeicher
```

```text
Baustelle braucht 3 Steel Plates
→ MaterialRequest entsteht
→ Transportroboter holt Steel Plates aus Ressourcenspeicher
→ liefert sie zur Baustelle
```

```text
Gasförderanlage erzeugt Gas
→ Transportroboter bringt Gas zum Ressourcenspeicher
→ später verbraucht ein Kraftwerk Gas
```

## Inventarrollen

```ts
type InventoryRole =
  | "input"
  | "output"
  | "storage"
  | "construction"
  | "cargo";
```

Bedeutung:

```text
input:
Ressourcen, die ein Gebäude für Verarbeitung/Produktion verbraucht.

output:
Ressourcen, die ein Gebäude erzeugt hat und die abgeholt werden sollen.

storage:
Lagerinventar, z. B. Ressourcenspeicher.

construction:
Material, das bereits an eine Baustelle geliefert wurde.

cargo:
Inventar eines Roboters.
```

Beispiele:

```text
Stahlwerk:
input: Iron Ore
output: Steel Plates
```

```text
Ressourcenspeicher:
storage: Iron Ore, Gas, Silicon, Steel Plates
```

```text
Baustelle:
construction: bereits gelieferte Materialien
required: noch benötigte Materialien
```

## Gebäudeinventar

```ts
type ReservedInventory = Partial<Record<ResourceType, number>>;

type BuildingInventory = {
  input?: ResourceInventory;
  output?: ResourceInventory;
  storage?: ResourceInventory;
  construction?: ResourceInventory;
  reserved?: ReservedInventory;
  capacity?: Partial<Record<ResourceType, number>>;
  totalCapacity?: number;
};
```

Regel:

```text
reserved zählt gegen verfügbare Ressourcen,
damit zwei Transportroboter nicht dieselben Ressourcen abholen.
```

Beispiel:

```text
Ressourcenspeicher enthält 10 Steel Plates.
Baustelle A reserviert 4.
verfügbar = 6.
```

## MaterialRequest-Typen

```ts
type MaterialRequestType =
  | "moveToStorage"
  | "supplyBuildingInput"
  | "supplyConstruction"
  | "clearBuildingOutput";
```

Bedeutung:

```text
moveToStorage:
Ressourcen von Gebäude/Roboter zu Ressourcenspeicher bringen.

clearBuildingOutput:
Output eines Produktionsgebäudes abholen.

supplyBuildingInput:
Input für Produktionsgebäude liefern.

supplyConstruction:
Baumaterial zu Baustelle liefern.
```

## MaterialRequest-Status

```ts
type MaterialRequestStatus =
  | "open"
  | "reserved"
  | "assigned"
  | "pickupInProgress"
  | "deliveryInProgress"
  | "fulfilled"
  | "blocked"
  | "cancelled";
```

Bedeutung:

```text
open:
Auftrag existiert, keine Ressource/kein Roboter reserviert.

reserved:
Quelle und Ressourcen sind reserviert.

assigned:
Transportroboter wurde zugewiesen.

pickupInProgress:
Roboter fährt zur Quelle.

deliveryInProgress:
Roboter hat Ressourcen geladen und fährt zum Ziel.

fulfilled:
Ressourcen wurden geliefert.

blocked:
Auftrag kann gerade nicht erfüllt werden.

cancelled:
Auftrag wurde dauerhaft ungültig.
```

## Endpunkte

```ts
type MaterialEndpoint =
  | {
      type: "building";
      buildingId: string;
      inventoryRole: InventoryRole;
    }
  | {
      type: "constructionSite";
      buildingId: string;
    }
  | {
      type: "robot";
      robotId: string;
      inventoryRole: "cargo";
    };
```

`from` ist bei offenen Requests optional, weil eine Quelle eventuell erst gesucht werden muss.

## MaterialRequest-Datenmodell

```ts
type MaterialRequest = {
  id: string;
  type: MaterialRequestType;
  resources: ResourceInventory;
  from?: MaterialEndpoint;
  to: MaterialEndpoint;
  status: MaterialRequestStatus;
  assignedRobotId?: string;
  reservedResources?: ResourceInventory;
  createdTick: number;
  updatedTick: number;
  blockedReason?: MaterialRequestBlockedReason;
};
```

## Blockadegründe

```ts
type MaterialRequestBlockedReason =
  | "noSourceWithResources"
  | "noReachableSource"
  | "noAvailableTransportRobot"
  | "targetHasNoCapacity"
  | "resourceReservedByOtherRequest"
  | "assignedRobotUnavailable"
  | "pathBlocked"
  | "requestTooLargeForCargo"
  | "targetInvalid"
  | "sourceInvalid";
```

Regeln:

```text
blocked:
Request bleibt bestehen und wird später erneut geprüft.

cancelled:
Request ist dauerhaft ungültig.
```

Beispiele:

```text
Baustelle zerstört → cancelled
Ressourcenspeicher voll → blocked
Transportroboter nicht verfügbar → blocked
Quelle leer/reserviert → blocked oder neue Quelle suchen
```

## Quellenwahl

Wenn ein Request entsteht, sucht das System eine Quelle mit verfügbaren Ressourcen.

Priorität:

```text
1. nächster Ressourcenspeicher mit verfügbarer Menge
2. nächstes Gebäude-Output-Inventar
3. nächster Roboter-Cargo mit passender Ressource
```

Tie-Breaker:

```text
1. kürzester BFS-Pfad
2. bei Gleichstand seeded random nach `docs/03-technical/seeded-rng.md`
```

Nur tatsächlich erreichbare Quellen zählen.

## Zielprüfung

Das Ziel muss genug freie Kapazität haben.

Regel:

```text
Request wird nur gestartet, wenn Ziel genug freie Kapazität für die vollständige Lieferung hat.
```

Keine Teillieferungen in der ersten Logistik-Version.

Beispiel:

```text
Ressourcenspeicher 98/100
Transport bringt 5 Iron Ore
→ Request blockiert: targetHasNoCapacity
```

## Transportroboter-Verhalten

Der Transportroboter erfüllt genau einen MaterialRequest gleichzeitig.

Ablauf:

```text
1. freien Transportroboter suchen
2. Request zuweisen
3. Roboter fährt zur Quelle
4. Roboter lädt Ressourcen
5. Roboter fährt zum Ziel
6. Roboter entlädt Ressourcen
7. Request fulfilled
8. Roboter sucht nächsten Request
```

Regeln:

```text
Transportroboter nutzt normale Pfadfindung.
Transportroboter hat Cargo-Kapazität 30.
Transportroboter kann nur Requests übernehmen, die vollständig in seinen Cargo passen.
Keine automatische Split-Logik in erster Logistik-Version.
```

Wenn Request größer als Cargo:

```text
status = blocked
blockedReason = requestTooLargeForCargo
```

## LogisticTask

Logistik ist Future. Eine spätere Logistik-Erweiterung darf einen eigenen `LogisticsTask` bzw. `type = logistics` definieren. Im MVP ist `logistics` nicht Teil der aktiven `RobotTask`-Union.

```ts
type LogisticTaskPhase =
  | "moveToPickup"
  | "pickup"
  | "moveToDelivery"
  | "delivery";

type LogisticTaskState = {
  requestId: string;
  phase: LogisticTaskPhase;
  pickupEndpoint: MaterialEndpoint;
  deliveryEndpoint: MaterialEndpoint;
  resources: ResourceInventory;
};
```

Future-Erweiterung der Tasktypen:

```ts
type FutureRobotTaskType =
  | "charging"
  | "logistics";
```

Pickup/Delivery:

```text
Pickup: 1 Tick
Delivery: 1 Tick
Batteriekosten: 0 %
```

Normale Bewegungskosten für Transportwege bleiben aktiv.

## Request-Erzeugung

### Gebäude-Output leeren

```text
Wenn output-Inventar Ressourcen enthält:
clearBuildingOutput Request erzeugen.
```

Beispiel:

```text
Stahlwerk output: 1 Steel Plate
→ clearBuildingOutput nach Ressourcenspeicher
```

### Gebäude-Input beliefern

```text
Wenn Produktionsgebäude Input für Rezept nicht hat:
supplyBuildingInput Request erzeugen.
```

Beispiel:

```text
Stahlwerk braucht 2 Iron Ore
→ supplyBuildingInput aus Ressourcenspeicher
```

### Baustelle beliefern

```text
Wenn Baustelle Materialanforderung offen hat:
supplyConstruction Request erzeugen.
```

Beispiel:

```text
Drohnenfabrik-Baustelle braucht 5 Steel Plates + 6 Silicon
→ MaterialRequests entstehen.
```

### Ressourcenspeicher

```text
Ressourcenspeicher erzeugt keine Requests aus sich selbst.
Er ist Quelle oder Ziel.
```

## Baustellen im Future-Logistiksystem

MVP-Regel bleibt:

```text
Baukosten beim Start abziehen.
Baustelle speichert costPaid.
```

Future-Regel:

```text
Bauauftrag erzeugt Baustelle.
Baustelle erzeugt Materialanforderungen.
Baufortschritt ist erst möglich, wenn benötigte Materialien geliefert wurden.
```

Beispiel:

```text
Drohnenfabrik kostet 5 Steel Plates + 6 Silicon.
Baustelle entsteht.
construction.requiredResources = { steelPlates: 5, silicon: 6 }
construction.deliveredResources = {}
MaterialRequests entstehen.
Wenn alles geliefert:
Bauaktionen können Fortschritt erzeugen.
```

## Gebäudeverarbeitung mit Logistik

Beispiel Stahlwerk:

```text
1. Stahlwerk sieht input < 2 Iron Ore.
2. supplyBuildingInput Request entsteht.
3. Transportroboter bringt 2 Iron Ore.
4. Stahlwerk startet Verarbeitung.
5. Input wird beim Start reserviert/verbraucht.
6. Nach 10 Ticks entsteht 1 Steel Plate im output.
7. clearBuildingOutput Request entsteht.
8. Transportroboter bringt Steel Plate zum Ressourcenspeicher.
```

## Priorisierung von Requests

Priorität:

```text
1. supplyConstruction
2. supplyBuildingInput
3. clearBuildingOutput
4. moveToStorage
```

Innerhalb gleicher Priorität:

```text
ältester Request zuerst
```

Wenn mehrere Transportroboter frei sind:

```text
Roboter mit kürzestem Pfad zur Quelle gewinnt.
Bei Gleichstand entscheidet Robot-ID.
```

## GameState-Erweiterung

```ts
type GameState = {
  materialRequests: MaterialRequest[];
};
```

## Designregel

```text
Logistik ist Future.
Sie basiert auf MaterialRequests, Ressourcenspeicher, Gebäudeinventaren und Transportrobotern.
Es gibt keine Teillieferungen in der ersten Logistik-Version.
Ein Transportroboter erfüllt genau einen Request gleichzeitig.
Ressourcen werden reserviert, sobald ein Request einer Quelle zugeordnet wird.
MVP bleibt unverändert ohne aktive Logistik.
```

## MVP-Sonderregel: Produktionskosten aus Startroboter-Cargo

Logistik bleibt im MVP inaktiv.

Trotzdem muss die Roboterfabrik den Iron Miner produzieren können. Deshalb gilt:

```text
Die Produktionskosten des ersten Iron Miner werden im MVP direkt aus dem Cargo des Startroboters bezahlt.
```

Regel:

```text
Kosten: 5 Iron Ore
Quelle: Cargo des Startroboters
Zeitpunkt: Start des ProductionTask
```

Nicht verwendet:

```text
kein globaler Ressourcenbestand
kein Gebäudeinput-Inventar
kein MaterialRequest
kein Ressourcenspeicher
kein Transportroboter
```

Future-Logistik ersetzt diese Sonderregel später durch Gebäudeinput-Inventare und MaterialRequests.

## Mining Executability

`action.mineResource` besitzt einen Ressourcenparameter.

```text
Mine Resource mit Ziel "Iron Ore"
```

Technisch:

```ts
parameters.resourceType = "ironOre"
```

Ausführbar, wenn:

```text
Roboterstatus = active
Batterie > 1
resourceType = ironOre
Cargo hat freie Kapazität
orthogonal angrenzendes Feld enthält aktives Iron Ore
kein aktiver Task läuft
```

Ressourcengewinn:

```text
Iron Ore wird erst bei erfolgreichem Mining-Task-Abschluss in den Roboter-Cargo gelegt.
Kein Ore-Gewinn bei abgebrochenem Mining-Task.
```
