# MVP Akzeptanzkriterien

## Kernziel

- Der Spieler kann den Starter Roboter über Programme zum Bau einer Roboterfabrik bringen.
- Die Roboterfabrik schliesst die Iron-Miner-Produktion ab und spawnt einen Iron Miner auf ein freies Ausgabefeld.
- `mvpGoalReached = true` wird erst nach erfolgreichem Spawn einer `ironMiner`-Robot-Entity gesetzt.

## Map

- Gleicher Seed erzeugt gleiche Karte.
- Karte ist 10x10.
- Startroboter sieht am Start kein Iron Ore.
- Mindestens ein Iron-Ore-Feld ist in 4-6 Schritten erreichbar.
- Fog of War funktioniert.
- Aktive und enabled MVP-Gebäude decken Felder im Chebyshev-Radius 2 auf.
- Gebäude in `construction`, `disabled`, `destroyed` oder mit `isEnabled = false` erzeugen keine Sicht.

## Programme

- Stack wird Top-down geprüft.
- Deaktivierte Programme werden übersprungen.
- Nicht ausführbare Programme zeigen Diagnose.
- Templates können hinzugefügt und editiert werden.
- Bauprogramm zählt erst bei fertiggestelltem Gebäude.

## Energie

- Starter Roboter kann durch Stasis-Laden selbst laden.
- Solar Collector lädt im MVP keine Roboter extern.
- Deaktivierte Gebäude verbrauchen keine Leistung.
- Batteriekosten werden nach erfolgreicher Aktion abgezogen.

## Bau

- Gebäude blockieren Bewegung.
- Baustellen blockieren Bewegung.
- Auf aktivem Iron Ore darf nicht gebaut werden.
- Auf erschöpftem Iron Ore darf gebaut werden.
- Solar Collector und Roboterfabrik können gebaut werden.

## Produktion

- Roboterfabrik verbraucht 40 Leistung während Produktion.
- Erster erfolgreich gespawnter Roboter ist `ironMiner`.
- Iron Miner startet mit 100 HP, 50 Batterie, leerem Cargo.

## UI

- Karte sichtbar.
- Roboter auswählbar.
- rechte Seitenleiste zeigt HP, Batterie, Cargo, aktives Programm, Diagnose.
- Programmübersicht sichtbar.
- Templates editierbar.
- Pause und Geschwindigkeit verfügbar.
- Score und Zeitlimit sichtbar.

## Deployment

- MVP kann per `npm run build` statisch gebaut werden.
- MVP kann per `npm run preview` lokal geprüft werden.
- GitHub-Actions-Workflow für Pages ist vorbereitet.
- GitHub Pages kann den MVP ohne Backend hosten.
- Asset-Pfade funktionieren unter einem Repository-Unterpfad.
- Keine Server-API wird benötigt.


### Asset-Aufloesung

```text
loadedAssets ist eine partielle AssetRegistry finaler Assets.
fallbackAssets ist eine vollstaendige FallbackAssetRegistry fuer alle MVP-AssetKeys.
resolveAsset(...) ist der render-sichere Pfad und liefert RenderAsset oder technischen Fehler.
resolveAssetDetailed(...) ist der Diagnose-/Testpfad und liefert AssetResolutionResult.
missingFallback darf nur ueber resolveAssetDetailed(...) als pruefbarer Zustand erscheinen und blockiert MVP-Abnahme.
```

## Aktionen und Produktion

- Jede Aktion besitzt einen automatischen Mindestenergiebedarf.
- Aktionen können Parameter besitzen.
- `Scoute Nahfeld` besitzt den Zielparameter `targetFieldType`; im MVP ist `targetFieldType = ironOre`.
- `Baue Gebäude` besitzt Parameter für Gebäudetyp und Feldbedingung.
- `Iron Miner produzieren` ist kein Starter-Roboter-Programm.
- Roboterfabrik kann einen Auftrag `Iron Miner bauen` ausführen.
- Iron Miner kostet 5 Iron Ore.
- Produktionskosten werden beim Start abgezogen.
- Baukosten von Gebäuden werden beim Start des Bauauftrags abgezogen.
- Wenn kein freies Ausgabefeld verfügbar ist, bleibt die Produktion fertig, aber blockiert beim Spawn.
- Solange Spawn blockiert ist, nimmt die Roboterfabrik keine neuen Aufträge an.

## Visual Programming Data Model

- MVP-Templates sind als `ProgramTemplateDefinition` definiert.
- Roboterstacks enthalten `ProgramInstance`-Objekte.
- Spieleränderungen betreffen nur die Programminstanz.
- IF-Bedingungen verwenden `ConditionExpression`.
- STOP-Bedingungen verwenden `StopConditionGroup`.
- Aktionen verwenden `ProgramAction`.
- Sensoren definieren erlaubte Operatoren und Werte.
- Die UI zeigt Blöcke als Projektion des Datenmodells.
- Ein vollständig freier Blockgraph-Editor ist nicht Teil des MVP.

## ProductionTask

- Roboterfabrik kann maximal einen aktiven `ProductionTask` haben.
- Iron Miner kostet 5 Iron Ore.
- Kosten werden beim Produktionsstart abgezogen.
- Fehlende Leistung pausiert Produktion, bricht sie aber nicht ab.
- Nach 10 Ticks mit ausreichender Leistung wird `readyToSpawn` gesetzt.
- Wenn kein gültiges Ausgabefeld verfügbar ist, wird `spawnBlocked` gesetzt.
- Bei `spawnBlocked` nimmt die Roboterfabrik keine neuen Aufträge an.
- Sobald ein Ausgabefeld frei wird, spawnt der Iron Miner.
- Nach erfolgreichem Spawn wird `productionTask` entfernt.
- MVP-Ziel wird erst nach tatsächlichem Spawn gesetzt.

## Iron Miner Kosten

- Iron Miner kostet im MVP 5 Iron Ore.
- Diese Kosten werden beim Produktionsstart abgezogen.
- Produktion darf nur starten, wenn 5 Iron Ore verfügbar sind.
- Mindestens 15 Iron Ore sind nötig, um Solar Collector, Roboterfabrik und Iron Miner zu bauen/produzieren.

## Ressourcenverbrauch beim Bauen

- Baukosten werden beim Start des Bauauftrags abgezogen.
- Solar Collector kostet 5 Iron Ore.
- Roboterfabrik kostet 5 Iron Ore.
- Nach Kostenabzug entsteht ein `Building` mit `status = construction`.
- Baustelle speichert `costPaid`, `constructionProgress` und `constructionRequired`.
- Baustellen blockieren Bewegung.
- Baustellen können im MVP nicht manuell abgebrochen werden.
- Es gibt keine Rückerstattung im MVP.
- Bauunterbrechungen zerstören die Baustelle nicht.
- Fortsetzen einer Baustelle kostet keine erneuten Ressourcen.
- Eine erfolgreiche Bauaktion dauert 10 Ticks und erhöht `constructionProgress` um 1.
- Bei `constructionProgress >= constructionRequired` wird das Gebäude aktiv.

## Roboterladung im MVP

- Stasis-Laden ist die einzige aktive Roboter-Lademechanik.
- Stasis-Laden verbraucht keine Netzleistung.
- Starter Roboter lädt in Stasis mit 1 Batterie pro Tick bis mindestens 50.
- Externes Roboterladen über Solar Collector ist Future und nicht MVP-aktiv.
- Gebäudeenergie beeinflusst ausschließlich ProductionTasks.
- Roboterfabrik-Produktion konkurriert im MVP nicht mit Roboterladung um Leistung.

## Akzeptanzkriterium zu externer Roboterladung

- Externe Roboterladung ist im MVP nicht aktiv.
- Externe Roboterladung wird in der Tick-Pipeline nicht verarbeitet.
- Solar Collector lädt im MVP keine Roboter extern.
- Gebäudeenergie wird im MVP ausschließlich für `ProductionTask`-Fortschritt verwendet.
- Es gibt im MVP keine Priorisierung zwischen Roboterfabrik-Produktion und externer Roboterladung, weil externe Roboterladung nicht Teil der Simulation ist.
- Akzeptanztests dürfen nicht erwarten, dass Produktion vor externer Roboterladung versorgt wird.
- Akzeptanztests müssen erwarten, dass externe Roboterladung keinen State-Effekt erzeugt.

## Kommunikationsgrid im MVP

- Kommunikationsgrid ist im MVP deaktiviert.
- `MVP_COMMUNICATION_GRID_ACTIVE = false`.
- Starter Roboter ist immer connected.
- Erster Iron Miner spawnt connected.
- Kommunikation blockiert keine Bewegung.
- Kommunikation blockiert keine Programme.
- Kommunikation blockiert keine Aktionen.
- Kommunikation blockiert keine Produktion.
- Kommunikation blockiert keine Stack-Änderungen.
- Gebäude erzeugen im MVP kein Kommunikationsgrid.
- Keine Grid-Berechnung im MVP.
- Keine disconnected/offline-Mechanik im MVP.
- Keine locked Scouts im MVP.
- UI darf optional `Kommunikation: verbunden` anzeigen.
- Kein Kommunikations-Overlay im MVP.

## MVP-Map-Generator

- `generateMvpMap(seed, config)` ist deterministisch.
- Gleicher Seed erzeugt gleiche Karte.
- Spielrelevanter Zufall verwendet `docs/03-technical/seeded-rng.md`.
- Karte ist 10x10.
- Startposition ist `{ x: 5, y: 5 }`.
- Initiale Sicht ist quadratischer Radius 2.
- Nach Fertigstellung eines Solar Collectors oder einer Roboterfabrik wird der Fog-of-War um das aktive Gebäude im Radius 2 aktualisiert.
- Kein Iron Ore liegt im initial sichtbaren Bereich.
- Genau 20 Iron-Ore-Felder existieren.
- Jedes Iron-Ore-Feld enthält 20 Iron Ore.
- Mindestens ein Iron-Ore-Feld ist in BFS-Distanz 4-6 erreichbar.
- Iron Ore wächst in orthogonalen Clustern.
- Clustergröße liegt zwischen 3 und 8.
- Nach maximal 100 Fehlschlägen wird die Fallback-Karte verwendet.
- Die Fallback-Karte erfüllt alle Fairness-Regeln.

## Pfadfindung und Kollisionen

- Roboter bewegen sich nur orthogonal.
- Diagonale Bewegung ist nicht moeglich.
- Bewegung kostet 1 Tick und 1 Batterie.
- BFS findet Pfade ueber begehbare Felder.
- Gebaeude blockieren Bewegung.
- Baustellen blockieren Bewegung.
- aktive Ressourcenfelder blockieren Bewegung.
- erschoepfte Ressourcenfelder blockieren nicht mehr.
- auf einem Feld steht maximal ein Roboter.
- direkter Platztausch ist nicht erlaubt.
- keine Pfadreservierungen im MVP.
- Bewegungen werden deterministisch nach Robot-ID verarbeitet.
- Roboterblockade darf bis zu 3 Ticks dauern.
- nach 3 blockierten Ticks bricht die Aktion mit Diagnose ab.
- Mining sucht ein erreichbares Nachbarfeld der Ressource.
- Bauen sucht ein erreichbares Nachbarfeld der Baustelle.
- Externe Ladequellen-Suche ist nicht MVP-aktiv; Stasis-Laden benötigt kein Nachbarfeld.

## Long-Task-Timing

- Mining startet mit `remainingTicks = 10`.
- Mining erzeugt vor Abschluss kein Iron Ore.
- Mining nach 10 Fortschrittsticks erzeugt +1 Iron Ore.
- Mining zieht Batterie erst bei erfolgreichem Abschluss ab.
- Mining-Abbruch vor Abschluss erzeugt kein Iron Ore und kostet keine Batterie.
- Bauaktion startet mit `remainingTicks = 10`.
- Bauaktion erzeugt vor Abschluss keinen `constructionProgress`.
- Bauaktion nach 10 Fortschrittsticks erhöht `constructionProgress` um 1.
- Bauaktion zieht Batterie erst bei erfolgreichem Abschluss ab.
- Bauabbruch lässt Baustelle bestehen.
- Bauabbruch kostet keine Batterie.
- Fortsetzen einer Baustelle kostet keine Ressourcen erneut.
- Produktion zählt nur bei mindestens 40 Leistung herunter.
- Produktion pausiert bei fehlender Leistung.
- Stasis-Laden erhöht Batterie pro Tick.
- Stasis-Laden überschreitet `batteryMax` nicht.
- Stop-Bedingung bei Stasis-Laden wird pro Tick geprüft.
- Externe Roboterladung wird im MVP nicht verarbeitet.
- Gebäudeenergie beeinflusst ausschließlich ProductionTask-Fortschritt.
- Es gibt keine Priorisierung zwischen Produktion und externer Roboterladung.

## Stack-und-Zeilen-Logik

- Stack prueft Programme in Stack-Reihenfolge.
- Programm prueft Zeilen in Zeilen-Reihenfolge.
- IF false fuehrt zur naechsten Zeile.
- IF true und THEN nicht ausfuehrbar fuehrt zur naechsten Zeile.
- Erste ausfuehrbare Zeile wird aktiv.
- Wenn keine Zeile ausfuehrbar ist, wird naechstes Programm geprueft.
- Waehrend laufendem Task gibt es keine Stack-Neupriorisierung.
- Nach Task-Abschluss beginnt Stack-Pruefung wieder oben.
- Nach Task-Abbruch beginnt Stack-Pruefung wieder oben.
- Stop-Bedingung beendet laufende Zeile und startet Stack-Pruefung oben.
- Wenn kein Programm ausfuehrbar ist, bleibt `robot.status = active`; `idle` wird nur fuer UI/Diagnose abgeleitet.
- Diagnose enthaelt Programm- und Zeilenebene.
- Kanonisches Beispiel kann als Simulationstest nachgestellt werden.

## UI-MVP

- Karte zeigt 10x10 Grid.
- Unknown/visible/Fog sind unterscheidbar.
- Roboter ist sichtbar und auswählbar.
- Iron Ore wird nur sichtbar angezeigt, wenn entdeckt/sichtbar.
- Gebäude und Baustellen sind sichtbar und auswählbar.
- Auswahl zeigt passende Detailinfos.
- Roboterpanel zeigt HP, Batterie, Cargo, Position, aktives Programm, aktive Zeile und Task.
- Roboterpanel zeigt Programmstack und Diagnose.
- Gebäudeinfo zeigt Status, HP und relevante Energie-/Produktionswerte.
- Programmstack ist sichtbar.
- Programme können aktiviert/deaktiviert werden.
- Programme können nach oben/unten verschoben werden.
- Templatewerte können im MVP-Editor geändert werden.
- Änderungen können gespeichert/abgebrochen werden.
- Programme können auf Template zurückgesetzt werden.
- Diagnose zeigt Gründe für active, skipped, blocked, disabled, completed, locked und den abgeleiteten Zustand idle.
- Eventlog zeigt wichtige Ereignisse.
- Pause, 1x, 2x und 4x funktionieren.
- Tick, Score, Seed und MVP-Zielstatus sind sichtbar.
- Reset Run funktioniert.
- Keine direkten Bewegungs-/Bau-/Angriffsbefehle existieren.

## Forschungsbaum als Future-System

Forschung bleibt nicht MVP.

Der kanonische Future-Forschungsbaum ist dokumentiert:

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
docs/06-reference/assets.md
```

Regel:

```text
Das Spiel muss ohne echte Bilddateien über Canvas-Fallbacks lauffähig sein.
```

## MVP-Sackgasse im Programmablauf

Die MVP-Sackgasse im Programmablauf wird durch die aktuelle Stack-Regel vermieden.

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

## Akzeptanzkriterium: keine Idle-Sackgasse

Diese Situation darf nicht mehr zu Idle führen:

```text
Batterie: 58/100
Iron Ore sichtbar, aber nicht angrenzend
Cargo: leer
keine Gebäude
```

Erwartetes Verhalten:

```text
Erkunden ist ausführbar.
Roboter bewegt sich Richtung sichtbares Iron Ore.
Sobald Iron Ore angrenzend ist, stoppt Erkunden.
Stack-Prüfung beginnt oben.
Iron Ore abbauen startet.
```

`Energie sichern` darf im initialen MVP-Startstack nicht enthalten sein.

## Akzeptanzkriterium: Parametrisiertes Scouting

Das MVP-Erkundungsprogramm muss sichtbar und technisch denselben Zieltyp verwenden:

```text
IF NOT Nachbarfeld hat Typ "Iron Ore"
THEN Scoute Nahfeld mit Ziel "Iron Ore"
STOP Nachbarfeld hat Typ "Iron Ore"
OR Roboterstatus = Stasis
```

Akzeptanz:

```text
Scoute Nahfeld darf nicht fest auf Iron Ore codiert sein.
Der Zieltyp muss aus dem Action-Parameter targetFieldType gelesen werden.
Im MVP ist targetFieldType = ironOre.
Wenn sichtbares Iron Ore existiert, aber nicht angrenzend ist, bewegt sich der Roboter zu einem erreichbaren Nachbarfeld davon.
Wenn Iron Ore noch nicht sichtbar ist, erkundet der Roboter unknown Randfelder.
```

## Produktionskosten des Iron Miner

Die Kostenquelle für den Iron Miner ist eindeutig.

MVP-Regel:

```text
Die Produktionskosten des ersten Iron Miner werden aus dem Cargo des Startroboters bezahlt.
```

Details:

```text
Kosten: 5 Iron Ore
Quelle: Startroboter-Cargo
Zeitpunkt: Start des ProductionTask
Startroboter muss connected sein
Startroboter muss nicht neben der Roboterfabrik stehen
keine Gebäudeinput-Inventare
keine MaterialRequests
keine Transportroboter
kein globaler Ressourcenpool
```

Score und MVP-Ziel werden erst nach erfolgreichem Spawn vergeben.

## Akzeptanzkriterium: Iron-Miner-Produktionskosten

Gegeben:

```text
Roboterfabrik status = active
Roboterfabrik isEnabled = true
Roboterfabrik hat keinen ProductionTask
Startroboter connected
Startroboter-Cargo enthält 5 Iron Ore
```

Wenn der Spieler `Iron Miner produzieren` startet:

```text
startIronMinerProduction wird angenommen.
5 Iron Ore werden aus dem Startroboter-Cargo abgezogen.
ProductionTask wird an der Roboterfabrik angelegt.
productionTask.costPaid = true.
```

Wenn der Startroboter weniger als 5 Iron Ore hat:

```text
kein ProductionTask
kein Kostenabzug
Diagnose: Produktion blockiert: Nicht genug Iron Ore im Startroboter-Cargo
```

Score und `mvpGoalReached` dürfen erst nach erfolgreichem Spawn gesetzt werden.

## UI-Command für Iron-Miner-Produktion

Der UI-Command für die Iron-Miner-Produktion ist vollständig spezifiziert.

Kernregel:

```text
Roboterfabrik-Auswahl zeigt Button "Iron Miner produzieren".
Button sendet startIronMinerProduction(buildingId).
Simulation validiert alle Voraussetzungen.
Bei Erfolg wird ProductionTask erstellt.
Bei Fehler gibt es keinen Kostenabzug und eine klare Diagnose.
```

Command:

```ts
{ type: "startIronMinerProduction"; buildingId: BuildingId }
```

Nicht genug freie Leistung deaktiviert den Button nicht. Der ProductionTask pausiert nur, wenn während der Produktion weniger als 40 freie Leistung verfügbar ist.

## Akzeptanzkriterium: startIronMinerProduction UI und Command

Wenn eine Roboterfabrik ausgewählt ist:

```text
Button "Iron Miner produzieren" wird im Building Panel angezeigt.
Kosten: 5 Iron Ore
Dauer: 10 Ticks
Leistungsbedarf: 40
```

Wenn alle Voraussetzungen erfüllt sind:

```text
Button ist enabled.
Klick sendet startIronMinerProduction(buildingId).
CommandResult = accepted.
5 Iron Ore werden aus Startroboter-Cargo abgezogen.
ProductionTask wird angelegt.
productionTask.costPaid = true.
```

Wenn eine Voraussetzung fehlt:

```text
Button ist disabled oder Command wird rejected.
kein Kostenabzug.
kein ProductionTask.
konkreter RejectionReason wird angezeigt/geloggt.
```

Nicht genug freie Leistung:

```text
darf den Button nicht deaktivieren.
darf den Command nicht ablehnen.
pausiert nur den Produktionsfortschritt.
```

Score und `mvpGoalReached` dürfen beim Produktionsstart nicht gesetzt werden.

## Akzeptanzkriterium: CommandResult fuer alle PlayerCommands

`CommandResult` gilt fuer alle `PlayerCommand`-Varianten, nicht nur fuer `startIronMinerProduction`.

Kanonische Regeln:

```text
accepted: Command wurde validiert und angewendet.
rejected: Command wurde nicht angewendet und liefert einen konkreten CommandRejectionReason.
```

Bei `rejected` gilt:

```text
keine spielrelevante State-Mutation
keine Ressourcenänderung
kein Task-Start
keine ProgramStack-Änderung
keine Selection-Änderung
Diagnose/UI-Rückmeldung ist erlaubt
```

Abgedeckt sein müssen mindestens:

```text
Selection-Commands: robotNotFound, buildingNotFound, fieldOutOfBounds
Program-Commands: programNotFound, programLocked, invalidProgramDefinition, invalidTemplateParameter
Program-Reihenfolge: programAlreadyFirst, programAlreadyLast
Runtime-Validierung: invalidCommand, invalidSpeed, invalidSeed
Production-Commands: bisherige Iron-Miner-RejectionReasons
```

Die vollständige Command-Matrix steht in `docs/03-technical/player-command-handling.md`.

## Akzeptanzkriterium: updateProgram-Validierung

`updateProgram` ist nur akzeptiert, wenn die übergebene ProgramInstance zur bestehenden Template-Instanz passt.

Akzeptiert werden nur:

```text
Name ändern
enabled ändern, falls Programm nicht locked ist
freigegebene Action-Parameter mit erlaubten MVP-Werten
freigegebene Condition-/Stop-Werte mit erlaubten MVP-Werten
```

Abgelehnt werden mindestens:

```text
locked Programm ändern -> programLocked
Programm nicht im Stack -> programNotFound
RowId ändern -> invalidProgramDefinition
Row hinzufügen/löschen -> invalidProgramDefinition
actionId austauschen -> invalidProgramDefinition oder unknownAction
unbekannte sensorId -> unknownSensor
unbekannte operatorId -> unknownOperator
ConditionValue passt nicht -> invalidConditionValue
nicht erlaubter Parameterwert -> invalidTemplateParameter
```

Bei Ablehnung bleibt der ProgramStack unverändert.

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

## Akzeptanzkriterium: createInitialGame

`createInitialGame("mvp-default")` muss erfüllen:

```text
tick = 0
randomSeed = "mvp-default"
isPaused = false
speed = 1
map ist 10x10
Startroboter steht auf { x: 5, y: 5 }
Startroboter type = starterRobot
Startroboter battery = 100
Startroboter batteryMax = 100
Startroboter cargo.used = {}
Startroboter cargo.capacity = 10
Startroboter sightRange = 2
Startroboter communicationStatus = connected
Startroboter status = active
buildings = []
selected = { type: "robot", id: "robot.starter" }
programStack enthält exakt 5 Programme in definierter Reihenfolge
template.secureEnergy ist nicht enthalten
template.stasisCharge ist letzter Stack-Eintrag, enabled und locked
eventLog enthält initialen Landungs-Event bei Tick 0
score.totalScore = 0
mvpGoalReached = false
materialRequests = []
```

Sichtzustand:

```text
Felder im Sichtbereich Radius 2 um den Startroboter sind visible.
Alle übrigen Felder sind unknown.
Zu Spielstart gibt es keine discovered Felder.
```

Determinismus:

```text
Zwei Aufrufe mit gleichem Seed erzeugen denselben GameState.
Initialisierung nutzt kein Math.random(), Date.now() oder crypto.randomUUID().
```

## Startposition ist widersprüchlich dokumentiert

Die Startposition ist eindeutig definiert.

Kanonische Regeln:

```text
0-basierte Koordinaten
10x10-Karte mit x = 0..9 und y = 0..9
Ursprung oben links
x wächst nach rechts
y wächst nach unten
map[y][x]
Startposition { x: 5, y: 5 }
```

`{ x: 5, y: 5 }` ist eines der vier zentralen Felder der 0-basierten 10x10-Karte und das verbindliche MVP-Startfeld. Es ist nicht als mathematisch exakte Mitte zu beschreiben.

Initiale Sicht bei Sichtweite 2:

```text
x = 3..7
y = 3..7
```

## Akzeptanzkriterium: Startposition

`createInitialGame("mvp-default")` muss erfüllen:

```text
map ist 10x10.
gültige Koordinaten sind x = 0..9 und y = 0..9.
Startroboter steht auf { x: 5, y: 5 }.
map[5][5] ist das Startfeld.
map[5][5].x = 5.
map[5][5].y = 5.
Startfeld ist plains.
Startfeld enthält keine Ressource.
Startfeld enthält kein Gebäude.
```

Initiale Sicht:

```text
visible für x = 3..7 und y = 3..7.
unknown für alle anderen Felder.
discovered ist zu Spielstart nicht gesetzt.
```

Nicht zulässig:

```text
map[x][y] als kanonischer Zugriff
1-basierte Koordinaten
abweichende Startposition
Beschreibung von { x: 5, y: 5 } als exakte Kartenmitte
```

## Build-Action-Zielauswahl

`Build Building` ist eine parametrisierte autonome Aktion.

Kanonische Bausteine:

```text
[Baue Gebäude] [Typ: Solar Collector]
[Baue Gebäude] [Typ: Roboterfabrik]
```

Regeln:

```text
Der Spieler wählt den Gebäudetyp, aber kein konkretes Feld.
Solar Collector wird nahe dem bauenden Roboter platziert.
Roboterfabrik wird nahe einem active Solar Collector platziert.
Baufeld muss visible, plains und frei sein.
Der Roboter baut von einem erreichbaren orthogonal angrenzenden Bau-Ausführungsfeld.
Bauziele werden reserviert.
Ressourcen werden erst beim Start des Bau-Tasks abgezogen.
Gleichstände werden seeded deterministic nach `docs/03-technical/seeded-rng.md` gelöst.
```

## Akzeptanzkriterium: Build-Action

Die Build-Action muss erfüllen:

```text
action.buildBuilding besitzt parameters.buildingType.
Solar Collector nutzt buildingType = solarCollector.
Roboterfabrik nutzt buildingType = robotFactory.
Solar Collector wird nahe dem bauenden Roboter platziert.
Roboterfabrik wird nahe einem active Solar Collector platziert.
Baufeld ist visible.
Baufeld ist plains.
Baufeld enthält keine Ressource.
Baufeld enthält kein Gebäude.
Baufeld enthält keinen Roboter.
Baufeld ist nicht reservedForConstruction.
Baufeld ist nicht das aktuelle Roboterfeld.
Bau-Ausführungsfeld ist orthogonal angrenzend und erreichbar.
```

Bei Fehler:

```text
kein Ressourcenabzug
kein Gebäude
Reservierung wird freigegeben
Diagnosegrund wird geschrieben
```

Ressourcen dürfen erst beim Start des Bau-Tasks abgezogen werden.

## Action-Executability-Matrix

Die zentrale Action-Executability-Matrix ist:

```text
docs/03-technical/action-executability-matrix.md
```

Sie definiert verbindlich:

```text
Pflichtparameter jeder Aktion
Ausführbarkeitsregeln
Nicht-ausführbar-Gründe
Task-Typen
Ressourcenzeitpunkte
Abbruchregeln
Diagnosegründe
Stack-Fortsetzung
PlayerCommand-Anhang für startIronMinerProduction
```

Zusätzlich wurde `action.mineResource` parametrisiert:

```text
Mine Resource mit Ziel "Iron Ore"
action.mineResource(resourceType = ironOre)
```

## Akzeptanzkriterium: Action Executability

Die Implementierung muss erfüllen:

```text
canExecuteAction nutzt docs/03-technical/action-executability-matrix.md als Grundlage.
action.scoutNearby prüft targetFieldType.
action.mineResource prüft resourceType.
action.buildBuilding prüft buildingType.
action.stasisCharge prüft Status, Batterie und chargingMode.
action.charge ist weder Teil des MVP-Startstacks noch Teil der aktiven MVP-ActionDefinitions.
startIronMinerProduction wird separat als PlayerCommand validiert.
```

Für jede nicht ausführbare ProgramAction gilt:

```text
kein State-Mutations-Effekt außer Diagnose
aktuelles Programm wird übersprungen
nächstes Programm im Stack wird geprüft
```

Für jede ausführbare ProgramAction gilt:

```text
Task oder Soforteffekt wird gestartet
Stack pausiert, solange Task läuft
```

Ressourcenzeitpunkte:

```text
Mining: Ressource bei erfolgreichem Mining-Task-Abschluss
Build: Ressourcen bei Start des Bau-Tasks
Iron-Miner-Produktion: 5 Iron Ore bei Command-Erfolg
Scouting/Stasis: keine Ressourcen
```

## Diagnose/Eventlog

Die zentrale Diagnose-/Eventlog-Spezifikation ist:

```text
docs/03-technical/diagnostics-and-eventlog.md
```

Definiert wurden:

```text
GameEvent-Schema
GameEventCode
Player Eventlog vs Debug Diagnostics
Severity
Priority
Deduplizierung
Eventlog-Limit 200
UI-Anzeige
MVP-Eventliste
Debug-Details
Event-Erzeugung für Actions und Commands
Tests
```

Regel:

```text
Player Events erklären relevante Fortschritte und Blockaden.
Debug Events erklären interne Entscheidungen und sind standardmäßig verborgen.
Tests prüfen event.code, nicht message.
```

## Akzeptanzkriterium: Diagnose/Eventlog

Die Implementierung muss erfüllen:

```text
GameEvent enthält visibility, severity, priority, category, code und message.
Player Events sind im Haupt-Eventlog sichtbar.
Debug Events sind nur bei diagnosticsExpanded oder in Tests/Dev-Modus sichtbar.
Tests prüfen event.code, nicht message.
Player Events werden bei gleichem code und gleicher Entity innerhalb von 10 Ticks dedupliziert.
repeatCount wird bei deduplizierten Events erhöht.
eventLog ist auf 200 Einträge begrenzt.
conditionFalse erzeugt kein Player Event.
system.initialLanding wird bei createInitialGame erzeugt.
goal.mvpReached wird beim MVP-Ziel erzeugt.
```

## Verbindliche Testmatrix

Es gilt:

```text
docs/02-mvp/mvp-test-matrix.md ist das verbindliche Teststeuerungsdokument für den MVP.
```

Akzeptanzkriterien beschreiben, was erreicht werden muss.

Die Testmatrix definiert, wie dies technisch geprüft wird:

```text
stabile Test-IDs
Prioritäten
Statuswerte
Kategorien
P0-required Mindestabnahme
```

MVP-Abnahme:

```text
Alle Tests mit Priorität P0 und Status required müssen bestehen.
```

Dieses Dokument verweist auf die Testmatrix, ersetzt sie aber nicht.

## Akzeptanzkriterium: MVP-Energie

Die Implementierung muss erfuellen:

```text
MVP-Energie ist ein globaler Power-Pool.
Ein active enabled Solar Collector erzeugt 50 Leistung.
Ein Solar Collector in construction erzeugt 0 Leistung.
Ein disabled Solar Collector erzeugt 0 Leistung.
Roboterfabrik idle benoetigt 0 Leistung.
Iron-Miner-Produktion benoetigt 40 Leistung.
startIronMinerProduction prueft nicht freePower.
Ein in Tick N gestarteter ProductionTask bleibt in Tick N bei remainingTicks = 10.
Erster moeglicher Fortschritt ist Tick N+1.
Ab Tick N+1 sinkt remainingTicks bei ausreichender Produktionsleistung.
Ab Tick N+1 bleibt remainingTicks bei Energiemangel unveraendert.
Ab Tick N+1 wird bei Energiemangel blockedReason = insufficientPower gesetzt.
Fehlende Leistung bricht Produktion nicht ab.
Fehlende Leistung erstattet keine Produktionskosten.
Roboterfabrik muss nicht angrenzend an Solar Collector stehen.
Es gibt im MVP keine Leitungen, keine Reichweite und keine Speicher.
Roboterbatterie ist getrennt vom Power-Pool.
```

## Akzeptanzkriterium: Spawn statt Produktion

MVP-Ziel und Score dürfen nur durch erfolgreichen Spawn entstehen.

```text
accepted startIronMinerProduction setzt keinen Score.
accepted startIronMinerProduction setzt mvpGoalReached nicht true.
ProductionTask.remainingTicks = 0 setzt keinen Score.
ProductionTask.readyToSpawn setzt mvpGoalReached nicht true.
ProductionTask.spawnBlocked setzt keinen Score.
ProductionTask.spawnBlocked setzt mvpGoalReached nicht true.
Nur erfolgreicher Spawn einer Robot-Entity vom Typ ironMiner erhöht score.spawnedRobots.
Nur erfolgreicher Spawn einer Robot-Entity vom Typ ironMiner kann goal.mvpReached erzeugen.
goalBonusAwarded verhindert mehrfachen Zielbonus.
```

Mindestabnahme über Testmatrix:

```text
MVP-GOAL-002 bis MVP-GOAL-010
MVP-PROD-006 bis MVP-PROD-009
```

## Akzeptanzkriterium: standardRobot

Die Implementierung muss erfüllen:

```text
standardRobot ist nicht Teil von RobotType.
standardRobot kommt nicht im MVP-Startzustand vor.
standardRobot kommt nicht in ProgramTemplates vor.
standardRobot kommt nicht in ProductionTasks vor.
standardRobot wird nicht als gültiger RobotType akzeptiert.
createInitialGame erzeugt starterRobot.
Iron-Miner-Produktion erzeugt ironMiner.
Alle aktiven Roboter verwenden konkrete RobotType-Werte.
```

## Akzeptanzkriterium: Asset-Fallbacks

Die Implementierung muss erfuellen:

```text
jeder MVP AssetKey loest zu einem RenderAsset auf
finale Assets werden vor Fallbacks verwendet
fehlende finale Assets blockieren den MVP nicht
fehlende Fallbacks lassen Tests fehlschlagen
starterRobot und ironMiner haben unterscheidbare Fallbacks
solarCollector und robotFactory haben unterscheidbare Fallbacks
unknown Felder zeigen keine Resource-Fallbacks
construction sieht anders aus als active building
spawnBlocked ist im UI sichtbar
Fallback-Nutzung erzeugt hoechstens Debug Events, keine Player Events
```

## ScoreState-Gebäudezähler

Akzeptanzkriterien:

```text
ScoreState enthält builtSolarCollectors, builtRobotFactories und builtBuildings.
builtBuildings entspricht builtSolarCollectors + builtRobotFactories.
Ein fertiggestellter Solar Collector erhöht builtSolarCollectors und builtBuildings genau einmal.
Eine fertiggestellte Roboterfabrik erhöht builtRobotFactories und builtBuildings genau einmal.
Die Ergebnisübersicht kann gebaute Solar Collectors und gebaute Roboterfabriken direkt aus ScoreState anzeigen.
```


## Stabile ProgramRowIds

Akzeptanzkriterien:

```text
Alle fuenf MVP-Startprogramme besitzen stabile ProgramRowIds.
Diagnostics/Eventlog koennen rowId eindeutig ausgeben.
Template-Reset stellt die kanonische RowId wieder her.
RowIds werden nicht aus Array-Indizes, Zufall oder Zeitstempeln erzeugt.
```


## Build-Fortsetzung

Akzeptanzkriterien:

```text
Eine abgebrochene Baustelle bleibt als Building mit status = construction erhalten.
Ein erneuter Build-Aufruf desselben buildingType setzt diese Baustelle fort, bevor ein neuer Bauplatz gesucht wird.
Fortsetzen zieht keine neuen Ressourcen aus dem Cargo ab.
Fortsetzen erzeugt kein neues Building und keine neue buildingId.
Erst der Wechsel der bestehenden Baustelle zu active zählt Score und builtBuildings.
```


## Gebäude-mit-Status-Conditions

Akzeptiert, wenn sichtbare Bedingungen wie `Gebäude existiert Solar Collector mit Status active` und `Baustelle existiert Roboterfabrik mit Status construction` technisch als `BuildingQuery` modelliert werden. Gebäudetyp und Status müssen gemeinsam geprüft werden; eine lose Kombination aus separater Gebäudetyp- und Statusprüfung reicht nicht.


## Deterministische ID-Erzeugung

Akzeptanzkriterien:

```text
Alle spielrelevanten Runtime-IDs werden deterministisch erzeugt.
Gleicher State, gleicher Seed und gleiche Commands erzeugen dieselben IDs.
Math.random(), Date.now() und crypto.randomUUID() duerfen fuer MVP-State-IDs nicht verwendet werden.
Rejected Commands erzeugen keine spielrelevanten IDs.
```

Verbindliche Quelle: `docs/03-technical/deterministic-id-generation.md`.


## Akzeptanz: continueConstruction-Reservierung

```text
Eine bestehende Baustelle darf im MVP nur von einem BuildingTask gleichzeitig bearbeitet werden.
continueConstruction erzeugt keine neue Feldreservierung.
Die Reservierung einer bestehenden Baustelle wird aus laufenden BuildingTasks mit gleicher buildingId abgeleitet.
Ein zweiter Roboter erhält constructionAlreadyReserved, wenn ein anderer Roboter dieselbe Baustelle bereits baut.
Der zugehörige stabile Event-/Diagnosecode ist action.build.blocked.constructionAlreadyReserved.
Nach Abschluss oder Abbruch des BuildingTask ist die Baustelle wieder fortsetzbar.
```


## Build-Event-Details

Der MVP gilt nur als akzeptiert, wenn Build-Events den Modus verbindlich ausgeben:

```text
action.build.targetSelected.details.mode
action.build.started.details.mode
action.build.completed.details.mode
```

Der Wert muss `newConstruction` oder `continueConstruction` sein und exakt zum erzeugten bzw. fortgesetzten `BuildingTask.mode` passen.


## Akzeptanz: action.charge nicht MVP-aktiv

Die MVP-Abnahme verlangt:

```text
action.charge ist keine aktive MVP-ActionDefinition.
action.charge wird im MVP-ProgramEditor nicht als auswählbare Aktion angeboten.
action.charge erzeugt im MVP keinen RobotTask.
Stasis-Laden bleibt die einzige aktive MVP-Roboter-Lademechanik.
```

`action.charge` darf als Future/Advanced-Typ vorbereitet bleiben, darf aber nicht für MVP-Sieg, MVP-Abnahme oder Startstack-Funktion vorausgesetzt werden.
