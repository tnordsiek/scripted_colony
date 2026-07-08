# Expansion 2: Logistik und Ladenetz

## Status

Dieses Dokument ist der Quelleigentuemer fuer den Umfang von Expansion 2. Es aktiviert
Future-Systeme aus `docs/05-future/**` und `docs/04-systems/resources-and-logistics.md`
und definiert die dafuer noetigen aktiven Regeln. Bei Konflikten mit Future-Dokumenten
gilt fuer den Expansion-2-Umfang dieses Dokument; kanonische Typen bleiben in
`docs/03-technical/canonical-data-model.md`.

Expansion 2 setzt Expansion 1 (`docs/02-mvp/expansion-1-scope.md`) voraus und aendert
keine MVP- oder Expansion-1-Siegregel.

## Ziel

Der erste vollautomatische Materialkreislauf:

```text
Iron Miner mined Ore -> Transportroboter bringt Ore zum Ressourcenspeicher
-> Transportroboter beliefert Stahlwerk-Input -> Stahlwerk verarbeitet automatisch
-> Transportroboter bringt Steel Plates zum Ressourcenspeicher
```

Nach dem Spieler-Setup (Forschung, Gebaeude, Transporter) laeuft die Kette ohne
weitere PlayerCommands.

## Aktivierte Systeme

### 1. Forschung (Erweiterung)

```text
research.transportLogistics1 wird aktives Projekt Nummer 5.
Kosten: 500 Forschung.
Voraussetzung in Expansion 2: research.metalProcessing1
  (Scope-Override; die Future-Kette ueber industrialManufacturing1 wuerde Silicon
   erfordern und bleibt Future).
Unlocks: Ressourcenspeicher, Grid Energy Line, Transportroboter, MaterialRequests.
```

### 2. Neue aktive Gebaeude

Werte aus `docs/05-future/building-and-unit-tiers.md`, Kosten teils Scope-angepasst
(Bootstrap ohne Silicon):

```text
Ressourcenspeicher (resourceStorage):
  Tier 2, HP 150, Sichtweite 1
  Baukosten: 3 Steel Plates (aus Roboter-Cargo, MVP-Baumodell)
  constructionRequired: 2, buildTicksPerProgress: 10
  Energieverbrauch: 0
  inventory.storage aktiv, Gesamtkapazitaet 100 (1 Einheit = 1 Kapazitaet)
  StoragePolicy: allResources (aktiv: ironOre, steelPlates)
  Template: template.buildResourceStorage
  AssetKey: building.resourceStorage

Grid Energy Line (gridEnergyLine):
  Tier 2, HP 80, Sichtweite 0
  Baukosten: 1 Steel Plate
  constructionRequired: 1, buildTicksPerProgress: 10
  Energieverbrauch: 0
  Template: template.buildGridEnergyLine
  AssetKey: building.gridEnergyLine
```

Gridline-Sonderregeln (Abweichungen von MVP-Grundregeln, hier verbindlich):

```text
1. Begehbarkeit: Felder mit aktiver oder im Bau befindlicher Grid Energy Line sind
   BEGEHBAR (Ausnahme von "Gebaeude blockieren Bewegung"). Roboter duerfen auf
   Gridline-Feldern stehen und sie durchqueren.
2. Platzierung: Eine neue Gridline muss orthogonal an ein Energienetz-Element
   angrenzen: Solar Collector, Energiespeicher, Roboterfabrik, Stahlwerk,
   KI-Forschungszentrum oder eine bestehende Gridline (jeweils status != destroyed).
3. Gridlines erzeugen keine Sicht und keine Leistung; sie erweitern ausschliesslich
   die Ladezone (siehe Ladenetz).
```

### 3. Ladenetz (aktiviert externes Laden)

Die Future-Regel "externes Laden verbraucht freie Leistung" wird aktiv:

```text
Ladezone ist jedes Feld, das mindestens eine Bedingung erfuellt:
  a) orthogonal angrenzend an einen aktiven+enabled Solar Collector
  b) orthogonal angrenzend an einen aktiven+enabled Energiespeicher
  c) AUF einer aktiven Grid Energy Line
  d) orthogonal angrenzend an eine aktive Grid Energy Line

Laderegel:
  Ein Roboter mit chargingMode externalOnly oder hybrid, der auf einem Ladezonen-Feld
  steht und einen laufenden charging-Task hat, laedt EXP2_EXTERNAL_CHARGE_RATE = 5
  Batterie pro Tick und verbraucht dafuer 5 Leistung aus dem globalen Pool.
  Ladeverbraucher kommen in der deterministischen Energie-Zuteilung NACH allen
  Gebaeudeverbrauchern, untereinander nach RobotId aufsteigend.
  Reicht die Leistung (inkl. Energiespeicher-Entladung) nicht, pausiert das Laden
  in diesem Tick (kein Batterieverlust, kein Abbruch).

action.charge wird aktive ActionDefinition:
  Label: Laden
  Mindestbatterie: 0
  Parameter: targetBattery (number, Default = batteryMax des Roboters)
  Ausfuehrbar wenn: Roboter active, chargingMode externalOnly/hybrid,
    battery < targetBattery, eine erreichbare Ladezone existiert, kein Task laeuft.
  Zielauswahl: naechstes erreichbares Ladezonen-Feld (kuerzester BFS-Pfad,
    Gleichstand seeded, Kontext chargeTarget); Commitment wie bei der Bauplatzwahl.
  Task: movement (reason fallback) zum Ladefeld, dann charging-Task.
  Stop: battery >= targetBattery -> Task completed, Stack-Pruefung oben.

Der Tasktyp charging wird aktiver RobotTask (ChargingTask mit targetBattery).
Stasis-Laden bleibt unveraendert die einzige Lademechanik fuer selfCharging-Roboter
und weiterhin harte Sicherung des Startroboters.
```

### 4. Transportroboter (aktiv)

```text
type = transportRobot, Tier 2, role = transport
HP 90/90, Batterie 80/120, Cargo 30, Sichtweite 2
movementType ground, chargingMode externalOnly
communicationMode gridRequired (im MVP/Exp2 ohne Wirkung, connected)
Produktion (Scope-Abweichung: normale Roboterfabrik, Verbesserte Fabrik bleibt Future):
  Command startTransportRobotProduction(buildingId)
  Kosten: 4 Steel Plates aus dem Startroboter-Cargo (analog Iron-Miner-Regel)
  Dauer: 20 Ticks, Leistungsbedarf: 50
  Gleiche Timing-/Spawn-/Blocked-Regeln wie die Iron-Miner-Produktion
  RobotId: robot.transportRobot.<seq3>
Spawn-Stack:
  1. template.logistics (locked-frei, enabled)
  2. template.rechargeAtGrid
AssetKey: robot.transportRobot
```

`template.logistics` (nur fuer Transportroboter):

```text
IF ein MaterialRequest ist diesem Roboter zugewiesen
THEN fuehre Logistikauftrag aus (action.logistics, keine Parameter)
STOP nie (Programm laeuft dauerhaft) OR Roboterstatus = Stasis
Row-Id: row.transport.logistics.main (pro Instanz identisch, Instanz-Id
  program.<robotId>.logistics)
```

`template.rechargeAtGrid` (fuer alle externalOnly/hybrid-Arbeitsroboter):

```text
IF Batterie <= 20
THEN Laden (action.charge, targetBattery = batteryMax)
STOP Batterie >= batteryMax
Row-Id-Muster: row.<robotKurzname>.rechargeAtGrid.main,
  Instanz-Id program.<robotId>.rechargeAtGrid
```

### 5. Iron Miner wird aktiv (goalOnly -> active)

```text
Neu gespawnte Iron Miner erhalten den Spawn-Stack:
  1. template.mineIronOre (Instanz program.<robotId>.mineIronOre)
  2. template.rechargeAtGrid
Der Iron Miner mined autonom, bis sein Cargo voll ist; die Logistik holt das Ore ab
(moveToStorage). Score-/Zielregeln aendern sich nicht: der erste erfolgreiche Spawn
bleibt das MVP-Ziel, weitere Spawns geben +100 wie bisher.
Bestehende Spielstaende betrifft das nicht (kein Savegame-System).
```

### 6. Gebaeudeinventare und Stahlwerk-Auto-Modus

```text
Aktivierte Inventar-Rollen:
  steelworks.inventory.input  (nur ironOre, Kapazitaet 10)
  steelworks.inventory.output (nur steelPlates, Kapazitaet 10)
  resourceStorage.inventory.storage (Kapazitaet 100 gesamt)

Stahlwerk-Auto-Modus (ersetzt nicht den manuellen Weg):
  Wenn kein steelProductionTask laeuft
  AND inventory.input.ironOre >= 2
  AND inventory.output hat Platz fuer 1 Steel Plate
  THEN startet automatisch ein steelProductionTask
    (Input -2 ironOre beim Start, sonst identische Regeln: 10 Ticks, 30 Leistung,
     Pause bei Energiemangel).
  Abschluss: +1 steelPlates in inventory.output (nicht ins Roboter-Cargo).
Der manuelle Command startSteelProduction (2 Ore aus Startroboter-Cargo, Ergebnis in
Startroboter-Cargo) bleibt unveraendert als Direktweg erhalten; Auto-Tasks und
manuelle Tasks nutzen denselben Task-Slot (max. einer gleichzeitig).
```

### 7. MaterialRequest-Engine

Aktive Request-Typen, Erzeugungsregeln (deterministisch, pro Tick geprueft):

```text
supplyBuildingInput (Prioritaet 2):
  Ausloeser: aktives Stahlwerk mit inventory.input.ironOre < 2
  Menge: min(4, freie Input-Kapazitaet)
  Ziel: steelworks.input

clearBuildingOutput (Prioritaet 3):
  Ausloeser: aktives Stahlwerk mit inventory.output-Bestand > 0
  Menge: gesamter Output-Bestand (max Cargo 30)
  Ziel: resourceStorage.storage

moveToStorage (Prioritaet 4):
  Ausloeser: aktiver Arbeitsroboter (nicht starterRobot, nicht transportRobot)
  mit Cargo-Fuellstand >= 80 %
  Menge: gesamtes Cargo
  Ziel: resourceStorage.storage

supplyConstruction (Prioritaet 1) bleibt Future und wird NICHT erzeugt.
Pro Ausloeser existiert maximal ein offener/laufender Request gleichzeitig.
Requests entstehen nur, wenn ein aktiver Ressourcenspeicher existiert (fuer
Ziele/Quellen mit storage) und research.transportLogistics1 abgeschlossen ist.
```

Quellenwahl (bei Request-Erzeugung, mit Commitment):

```text
Prioritaet: resourceStorage.storage > steelworks.output > Roboter-Cargo
  (nur Arbeitsroboter, nicht der Starter).
Innerhalb einer Prioritaet: kuerzester BFS-Pfad vom Ziel; Gleichstand seeded
  (Kontext requestSource). Die gewaehlte Quelle wird im Request gebunden
  (from) und die Menge in reservedResources der Quelle reserviert.
Keine Teillieferungen: Quelle muss die volle Menge liefern koennen, Ziel muss die
  volle Menge aufnehmen koennen, sonst blocked (Gruende aus
  resources-and-logistics.md: noSourceWithResources, targetHasNoCapacity, ...).
```

Zuweisung und Ausfuehrung:

```text
Zuweisung: freie Transportroboter (active, kein Task, kein zugewiesener Request)
  nach RobotId aufsteigend; Requests nach Prioritaet, dann createdTick, dann
  RequestId. Ein Roboter bearbeitet genau einen Request (assignedRobotId,
  Commitment bis fulfilled/blocked/cancelled).
Ausfuehrung als logistics-RobotTask mit Phasen
  moveToPickup -> pickup (1 Tick) -> moveToDelivery -> delivery (1 Tick).
Pickup/Delivery: 0 Batteriekosten; Bewegung kostet normal 1 Batterie/Schritt.
Pickup-/Delivery-Feld: orthogonal angrenzend an Quelle/Ziel (bei Roboter-Quelle:
  angrenzend an den Roboter); Blockade-Handling wie MovementTask (3-Tick-Regel).
Blockierte Requests: Reservierung freigeben, status = blocked mit Grund; im
  naechsten Tick Neubewertung (neue Quelle erlaubt). cancelled bei targetInvalid.
Request-Id-Muster: request.<typ>.<tick6>.<seq2> (deterministic-id-generation.md).
```

Pipeline-Position (schliesst die dokumentierte Luecke; tick-pipeline.md verweist
hierauf):

```text
Schritt 3 (Gebaeudetasks) wird erweitert um, in dieser Reihenfolge:
  3a ProductionTasks (wie bisher)
  3b Stahlwerk-Tasks inkl. Auto-Start (wie bisher + Auto-Modus)
  3c Forschung (wie bisher)
  3d MaterialRequests: Ausloeser pruefen, Requests erzeugen, Quellen binden,
     freie Transporter zuweisen
Die Ausfuehrung (logistics- und charging-Tasks) laeuft in Schritt 5 als RobotTasks.
Energie-Zuteilung (Schritt 2) behandelt Ladeverbraucher nach Gebaeudeverbrauchern.
```

## Neue Konstanten (mvp-constants.md, EXP2_*)

```text
EXP2_EXTERNAL_CHARGE_RATE = 5
EXP2_EXTERNAL_CHARGE_POWER = 5
EXP2_RECHARGE_ENTER_BATTERY = 20
EXP2_TRANSPORT_ROBOT_* (HP 90, BATTERY 80, BATTERY_MAX 120, CARGO 30, SIGHT 2,
  COST_STEEL_PLATES 4, PRODUCTION_TICKS 20, PRODUCTION_POWER 50)
EXP2_RESOURCE_STORAGE_* (HP 150, COST_STEEL_PLATES 3, CONSTRUCTION_REQUIRED 2,
  CAPACITY 100)
EXP2_GRID_ENERGY_LINE_* (HP 80, COST_STEEL_PLATES 1, CONSTRUCTION_REQUIRED 1)
EXP2_STEELWORKS_INPUT_CAPACITY = 10
EXP2_STEELWORKS_OUTPUT_CAPACITY = 10
EXP2_SUPPLY_INPUT_BATCH = 4
EXP2_MOVE_TO_STORAGE_THRESHOLD_PERCENT = 80
EXP2_RESEARCH_TRANSPORT_LOGISTICS_COST = 500
```

## Explizit NICHT aktiv (bleibt Future)

```text
supplyConstruction und Material-Anlieferung fuer Baustellen (MVP-Baumodell bleibt)
lokale Energienetz-Bilanzierung (Pool bleibt global; Gridline = nur Ladezone)
Silicon, Gas, Verbesserte Roboterfabrik, Drohnenfabrik, Sendeturm, Gasfoerderanlage
Kommunikationsgrid-Wirkung, Combat/Hazards, Teillieferungen, Mehrfach-Requests
pro Roboter
```

## Testbezug

Verbindliche Tests: EXP2-Serie in `docs/02-mvp/mvp-test-matrix.md`
(Request-Lebenszyklus, Blockadegruende, Commitment, Ladenetz, Gridline,
Transporter-Produktion, Miner-Aktivierung, Auto-Modus, E2E-Automatisierungskette,
Determinismus-Doppellauf, Langlauf-Livelock-Waechter).
