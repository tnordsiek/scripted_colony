# Archivierter README-Stand v84

Diese Datei ist nur historische Nachverfolgung. Sie ist nicht implementierungsverbindlich.

Aktuelle Einstiegspunkte stehen im README.md im Paketwurzelverzeichnis.

---

# Roboter-Logikspiel

## Aktueller Stand v84

v84 basiert auf dem aktuellen gueltigen v83-Paket aus der v58-v84-Quellenkette und macht `details.mode` fuer Build-Events verbindlich.

Wichtigste Korrekturen:

```text
MVP-Ziel: erster Iron Miner erfolgreich gespawnt, nicht nur produziert.
Startposition: { x: 5, y: 5 }.
Starterbatterie: 100/100.
Solar Collector: 50 Leistung.
Gebäudeenergie: globaler Power-Pool nur für ProductionTasks.
Externe Roboterladung: Future, nicht MVP-aktiv.
Stasis-Laden: einzige aktive MVP-Roboterladung.
Startstack: mineIronOre, buildSolarCollector, buildRobotFactory, exploreNearby, stasisCharge.
Aktive ProgramStack-/UI-Beispiele verwenden keinen Energie-sichern-Startstack mehr.
Erkunden nutzt keine Batterie-60-Startbedingung mehr.
Scoute Nahfeld nutzt targetFieldType = Iron Ore und stoppt bei angrenzendem Iron Ore oder Stasis.
standardRobot: nicht kanonisch.
MVP_BUILDING_SIGHT_RANGE = 2 fuer aktive und enabled Gebaeude.
canonical-data-model.md enthaelt jede Typdefinition nur noch einmal.
AssetKey, RenderAsset und AssetResolutionResult werden nur noch dort als TypeScript-Typen definiert.
PlayerCommand wird nur noch in `canonical-data-model.md` als TypeScript-Union definiert.
sensor.robotStatus und `ConditionValue { type: "robotStatus"; value: RobotStatus }` sind kanonisch, damit `Roboterstatus = Stasis` aus Templates technisch modellierbar ist.
`fieldType` ist kanonischer `ActionParameterValue` fuer `action.scoutNearby.parameters.targetFieldType`; alte Distanzparameter wie `maxDistanceFromBuilding` sind nicht MVP-kanonisch.
Tick-Reihenfolge: `docs/03-technical/tick-pipeline.md` ist die einzige kanonische Quelle; andere Dokumente duerfen keine abweichende Pipeline definieren.
Externe Roboterladung wird im MVP nicht verarbeitet; es gibt keine Priorisierung zwischen Produktion und externer Roboterladung.
MVP-FUT-005 ist aktualisiert: lokale Energienetze sind Future und keine offene MVP-Entscheidung.
Sichtzustände sind explizit: unknown = nie sichtbar, discovered = bekannt aber aktuell nicht sichtbar, visible = aktuell sichtbar.
Iron Ore wird nur bei visibility = visible gerendert; unknown/discovered verraten keine Ressourcen.
ProgramRowIds fuer Starttemplates sind stabil: row.starter.mineIronOre.main, row.starter.buildSolarCollector.main, row.starter.buildRobotFactory.main, row.starter.exploreNearby.main, row.starter.stasisCharge.main.
Build-Fortsetzung ist technisch präzisiert: `newConstruction` und `continueConstruction` sind getrennte BuildingTask-Modi.
`idle` ist kein `RobotStatus`; es ist ein abgeleiteter `RobotActivityState` fuer UI und Debug-Diagnose.
RobotTask ist kanonisch als diskriminierte Union definiert: MovementTask | MiningTask | BuildingTask | StasisChargingTask.
Gebäude-mit-Status-Bedingungen nutzen `BuildingQuery`; Gebäudetyp und Status werden gemeinsam geprüft.
Aktive Programmzeilen werden ausschliesslich ueber `robot.activeProgram = { programId, rowId, startedTick }` gespeichert.
CommandResult gilt fuer alle PlayerCommands; RejectionReasons decken Runtime-, Selection-, Program-, Production- und Reset-Commands ab.
updateProgram akzeptiert nur templatekonforme Änderungen an freigegebenen Template-Parametern; freie Strukturänderungen werden abgelehnt.
Deterministische ID-Erzeugung ist zentral in `docs/03-technical/deterministic-id-generation.md` definiert.
continueConstruction-Reservierung: Eine bestehende Baustelle gilt als reserviert, wenn ein laufender `BuildingTask` mit derselben `buildingId` existiert; es gibt keine zusätzliche Building-Reservation und höchstens einen laufenden BuildingTask pro Baustelle.
Build-Events enthalten verbindlich `details.mode`: `action.build.targetSelected`, `action.build.started` und `action.build.completed` unterscheiden dadurch `newConstruction` und `continueConstruction`.
```

Neue/aktualisierte v59-v84-Quellen:

```text
docs/03-technical/mvp-constants.md
docs/03-technical/robot-task-lifecycle.md
docs/05-future/logistics-system.md
docs/04-systems/buildings-and-construction.md
docs/03-technical/canonical-data-model.md
docs/03-technical/visual-programming-data-model.md
docs/02-mvp/mvp-template-spec.md
docs/02-mvp/mvp-test-matrix.md
docs/03-technical/program-stack-rules.md
docs/04-systems/visual-programming-ui.md
docs/03-technical/pathfinding-and-map-generation.md
docs/03-technical/tick-pipeline.md
docs/03-technical/robot-task-payloads.md
docs/03-technical/player-command-handling.md
docs/03-technical/deterministic-id-generation.md
docs/04-systems/ui-components-contract.md
```

## Gesamtpaket v84

Dieses Paket ist die optimierte Dokumentationsstruktur für die weitere Planungs- und spätere Umsetzungsphase.

## Ziel

Am Ende der Planungsphase soll ein detailliert geplantes Spielkonzept vorliegen, das von einer umsetzenden KI und ihren Agenten möglichst eindeutig verarbeitet werden kann. Gleichzeitig muss es ein reduziertes MVP-Dokument geben, das als erster Implementierungsschritt dient und bewusst nicht die gesamte Langfristvision enthält.

## Wichtigste Einstiegsdokumente

1. `docs/00-documentation-guideline.md`  
   Leitlinie für die weitere Planungsphase und Dokumentationsstruktur.

2. `docs/01-product/vision-and-core-loop.md`  
   Langfristiges Spielbild, Grundidee und Spielschleife.

3. `docs/02-mvp/mvp-and-tech-stack.md`  
   Verbindliche MVP-Spezifikation inklusive notwendigem Tech-Stack.

4. `docs/02-mvp/implementation-plan.md`  
   Umsetzungsphasen für den MVP.

5. `docs/03-technical/canonical-data-model.md`  
   Verbindliches technisches Datenmodell.

6. `AGENTS.md`  
   Kurzbriefing für Codex/Claude-Code-Agenten.

## Strukturprinzip

- `01-product`: langfristiges Spielkonzept.
- `02-mvp`: reduzierter erster Umsetzungsschritt.
- `03-technical`: technische Referenzen und Regeln.
- `04-systems`: einzelne Spielsysteme.
- `05-future`: geplante Systeme nach dem MVP.
- `06-reference`: Glossar, Namenskonventionen, Assets.
- `archive`: alte Dokumentstände zur Nachverfolgung.

Die umsetzende KI soll für den MVP primär `02-mvp`, `03-technical` und `AGENTS.md` verwenden. Die Langfristvision dient als Kontext, darf aber den MVP nicht aufblähen.

## Hosting

Das Spiel und der MVP sollen auf GitHub Pages gehostet werden.

Wichtige Referenz:

```text
docs/03-technical/github-pages-deployment.md
```

Der MVP muss als statische Vite/React-App ohne Backend funktionieren.

## Archiv-Hinweis

`docs/archive/` enthält ältere Dokumentstände nur zur Nachverfolgung. Für Umsetzung und weitere Planung gelten die aktiven Dokumente außerhalb des Archivs. Agenten sollen Archivdateien ignorieren, außer sie werden ausdrücklich zur Historienprüfung angefordert.

## Neue Ergänzung v26

- Aktionen haben automatische Mindestenergiebedarfe.
- Aktionen können Parameter besitzen.
- `Scoute Nahfeld`: Zielparameter `targetFieldType`, im MVP mit Wert `ironOre`.
- `Baue Gebäude`: Gebäudetyp und Feldbedingung.
- `Iron Miner produzieren` ist kein Starter-Roboter-Programm mehr.
- Iron Miner wird durch einen Auftrag an die Roboterfabrik gebaut.
- Iron Miner kostet 5 Iron Ore.
- Bau- und Produktionskosten werden beim Auftragsstart abgezogen.
- Wenn kein freies Ausgabefeld vorhanden ist, bleibt die Produktion fertig, blockiert aber beim Spawn.
- Neues Dokument: `docs/04-systems/production-and-spawn.md`.

## Neue Ergänzung v27

v27 schließt die Brücke zwischen sichtbarer GUI-Programmierung und technischem Datenmodell.

Neu:

- `docs/03-technical/visual-programming-data-model.md`
- `ProgramTemplateDefinition`
- `ProgramInstance`
- `ProgramRow`
- `ConditionExpression`
- `StopConditionGroup`
- `ProgramAction`
- `SensorDefinition`
- `ActionDefinition`
- UI-Blöcke als Projektion des Datenmodells
- MVP-Grenze: kein freier Blockgraph-Editor, sondern editierbare Template-Instanzen

## Neue Ergänzung v28

v28 löst den offenen Punkt `ProductionTask`.

Ergänzt wurde:

- eindeutige ProductionTask-Zustandsmaschine
- Status: `inProgress`, `readyToSpawn`, `spawnBlocked`
- kein dauerhaft gespeicherter `completed`-Status
- nach erfolgreichem Spawn wird `productionTask` entfernt
- fehlende Leistung pausiert Produktion
- Spawn-Blockade blockiert neue Fabrikaufträge
- MVP-Ziel gilt erst nach tatsächlichem Spawn des Iron Miner

## Neue Ergänzung v29

v29 markiert Punkt 6 als geklärt:

- Iron Miner kostet im MVP 5 Iron Ore.
- Die Kosten werden beim Produktionsstart in der Roboterfabrik abgezogen.
- Das MVP-Ziel benötigt damit mindestens 15 Iron Ore:
  - 5 für Solar Collector
  - 5 für Roboterfabrik
  - 5 für Iron Miner

## Neue Ergänzung v30

v30 löst Punkt 7 `Ressourcenverbrauch beim Bauen`.

Festgelegt wurde:

- Baukosten werden beim Start des Bauauftrags abgezogen.
- Baustelle entsteht als `Building` mit `status = construction`.
- Baustelle speichert `costPaid`, `constructionProgress`, `constructionRequired`.
- Solar Collector und Roboterfabrik haben `constructionRequired = 1`.
- Eine erfolgreiche Bauaktion dauert 10 Ticks und erhöht den Fortschritt um 1.
- Baustellen blockieren Bewegung.
- Keine manuellen Bauabbrüche im MVP.
- Keine Rückerstattungen im MVP.
- Bauunterbrechungen lassen die Baustelle bestehen.
- Fortsetzen kostet keine erneuten Ressourcen.

## Neue Ergänzung v31

v31 historisch: Punkt 8 `Energieverbrauch durch Roboterladen` wurde später durch v55/v59 für den MVP ersetzt.

Historischer v31-Zwischenstand:

- externe Roboterladung wurde damals als MVP-Mechanik beschrieben.
- diese Regel wurde durch v55/v59 für den MVP ersetzt.

Aktueller MVP-Stand v59:

- Stasis-Laden ist die einzige aktive Roboter-Lademechanik.
- externe Roboterladung ist Future/Advanced.
- Solar Collector lädt im MVP keine Roboter.
- Gebäudeenergie beeinflusst nur ProductionTasks.

## Neue Ergänzung v32

v32 löst Punkt 9 `Kommunikationsgrid ist im MVP-Status unklar`.

Festgelegt wurde:

- Kommunikationsgrid ist im MVP deaktiviert.
- `MVP_COMMUNICATION_GRID_ACTIVE = false`.
- alle MVP-relevanten Einheiten gelten als connected.
- Starter Roboter ist immer connected.
- erster Iron Miner spawnt connected.
- Kommunikation blockiert keine Bewegung, Programme, Aktionen, Produktion oder UI-Bedienung.
- keine aktive Grid-Berechnung im MVP.
- Gebäude erzeugen im MVP kein Kommunikationsgrid.
- UI darf optional `Kommunikation: verbunden` anzeigen.
- Kommunikationsgrid, Sendeturm, Reichweiten und Offline-Verhalten bleiben Future-Systeme.

## Neue Ergänzung v33

v33 löst Punkt 10 `Map-Generator ist noch nicht algorithmisch genug`.

Festgelegt wurde:

- vollständiger MVP-Map-Generator-Algorithmus
- `MapGenerationConfig`
- feste Startposition `{ x: 5, y: 5 }`
- initiale No-Ore-Zone
- Zielring mit BFS-Distanz 4-6
- garantiertes erstes Ore-Cluster
- orthogonales Cluster-Wachstum
- genau 20 Iron-Ore-Felder mit je 20 Iron Ore
- Fairness-Validator
- Retry-Logik mit 100 Versuchen
- feste Fallback-Karte
- Testfälle für Seed-Stabilität und Fairness

## Neue Ergaenzung v34

v34 loest Punkt 11 `Pfadfindung und Kollisionen sind noch zu vage`.

Festgelegt wurde:

- BFS-Pfadfindung ueber orthogonale Nachbarn.
- keine diagonale Bewegung.
- ein Roboter pro Feld.
- Gebaeude, Baustellen und aktive Ressourcen blockieren Bewegung.
- erschoepfte Ressourcen blockieren nicht mehr.
- andere Roboter blockieren temporaer.
- keine Pfadreservierungen im MVP.
- kein direkter Platztausch.
- Bewegung deterministisch nach Robot-ID.
- bei Roboterblockade bis zu 3 Ticks warten.
- nach 3 Blockaden Aktion abbrechen.
- Mining/Bauen/Laden verwenden erreichbare Nachbarfelder ihrer Zielobjekte.

## Neue Ergänzung v35

v35 löst Punkt 12 `Long-Task-Timing braucht mehr Präzision`.

Festgelegt wurde:

- Long-Task-Lebenszyklus: Startprüfung → Fortschritt → Abschlussprüfung → Ergebnis oder Abbruch.
- Long Tasks nutzen `totalTicks` und `remainingTicks`.
- Start in Tick N, erster Fortschritt in Tick N+1.
- Mining: 10 Ticks, Ergebnis und Batteriekosten erst bei erfolgreichem Abschluss.
- Bauaktion: 10 Ticks, `constructionProgress += 1` und Batteriekosten erst bei erfolgreichem Abschluss.
- Abbruch von Mining/Bauen erzeugt keinen Teilfortschritt und kostet keine Batterie.
- Baustelle bleibt bei Bauabbruch bestehen.
- ProductionTask pausiert bei fehlender Leistung.
- Laden läuft kontinuierlich pro Tick.
- Historisch v35: Produktion hatte Vorrang vor externer Roboterladung; seit v59/v69 ersetzt durch: externe Roboterladung ist nicht MVP-aktiv.
- verbindliche Tick-Reihenfolge ergänzt.
- Tests für Abschluss, Abbruch, Pausierung und Tick-Reihenfolge ergänzt.

## Neue Ergaenzung v36

v36 loest Punkt 13 `Programmzeilen-Logik und Programmstack-Logik brauchen ein gemeinsames Beispiel`.

Festgelegt wurde:

- gemeinsames Auswertungsmodell fuer Stack und Programmzeilen
- Stack prueft Programme von oben nach unten
- Programm prueft Zeilen von oben nach unten
- erste Zeile mit erfuelltem IF und ausfuehrbarem THEN wird aktiv
- IF false fuehrt zur naechsten Zeile
- IF true, aber THEN nicht ausfuehrbar, fuehrt ebenfalls zur naechsten Zeile
- wenn keine Zeile ausfuehrbar ist, wird naechstes Programm geprueft
- waehrend laufendem Task keine Stack-Neupriorisierung
- nach Abschluss, Abbruch, Stop, Spielerabbruch oder Deaktivierung Stack-Pruefung von oben
- Roboter bleibt `status = active`; `idle` wird abgeleitet, wenn kein Programm ausfuehrbar ist
- Diagnose enthaelt Programm- und Zeilenebene
- kanonisches Beispiel Start -> Erkunden -> Mining -> Solarbau dokumentiert

## Neue Ergänzung v37

v37 löst Punkt 14 `UI-MVP ist noch nicht genau genug`.

Festgelegt wurde:

- genau ein Main Game Screen
- feste Panels: MapPanel, SelectionPanel, ProgramStackPanel, ProgramEditorPanel, DiagnosticsPanel, BottomControlBar, EventLogPanel
- 10x10-Karte mit Robotern, Ressourcen, Gebäuden, Baustellen und Fog/Unknown
- Auswahlzustände für Feld, Roboter, Gebäude und keine Auswahl
- Roboterpanel mit HP, Batterie, Cargo, Position, Kommunikation, aktivem Programm, aktiver Zeile, Task, Stack und Diagnose
- Gebäude-/Baustellenpanel mit Status, HP, Energie-/Produktions-/Bauwerten
- sichtbarer und minimal editierbarer Programmstack
- Programmeditor als Formular-/Zeileneditor für vorbereitete Templatewerte
- Diagnose für active, skipped, blocked, disabled, completed, locked und abgeleitetes idle
- Eventlog mit letzten 5–8 Ereignissen
- BottomControlBar mit Pause, Speed, Tick, Score, Zielstatus, Seed und Reset
- UI-State und PlayerCommand-Modell
- direkte Bewegungs-, Bau- und Angriffsbefehle explizit ausgeschlossen

## Neue Ergänzung v38

v38 löst Punkt 16 `Forschungsbaum ist noch beispielhaft, nicht vollständig`.

Festgelegt wurde:

- Forschung bleibt nicht MVP.
- Forschungsbaum wird als Future-System dokumentiert.
- KI-Forschungszentrum bleibt kanonischer Spielname.
- technische ID bleibt `aiResearchCenter`.
- erster vollständiger Forschungsbaum mit 8 Zweigen, 4 Tiers und 22 Projekten.
- jedes Projekt hat ID, Name, Branch, Tier, Voraussetzungen, Forschungskosten, Unlocks und Beschreibung.
- Forschungskosten sind erste Balancing-Werte.
- Unlocks betreffen Gebäude, Roboter, Ressourcen, Rezepte, Programmsysteme und Future-Systeme.
- Datenmodell für ResearchProject ergänzt.

## Neue Ergänzung v39

v39 löst Punkt 17 `Level-1- und Level-2-Einheiten brauchen Werte`.

Festgelegt wurde:

- kanonische Basiswerte für Starter Roboter, Iron Miner, Boden Scout, Konstrukteur, Nahkampfdrohne, Resource Miner, Transportroboter und Fernkampfdrohne
- Werte für HP, Batterie, Startbatterie, Cargo, Sichtweite, MovementType, ChargingMode und CommunicationMode
- Rollen und erlaubte Aktionen je Einheit
- Produktionsdaten je Einheit
- Kampfplatzhalter für Nahkampfdrohne und Fernkampfdrohne
- Datenmodell für `RobotDefinition` und `RobotProductionDefinition`
- MVP-Abgrenzung: nur Starter Roboter aktiv und Iron Miner als Zielroboter; alle anderen Einheiten bleiben Future

## Neue Ergänzung v40

v40 löst Punkt 18 `Level-2-Gebäude brauchen Werte`.

Festgelegt wurde:

- kanonische Basiswerte für Sendeturm, Grid Energy Line, Verbesserte Roboterfabrik, Drohnenfabrik, Gasförderanlage, Stahlwerk, Energiespeicher und Ressourcenspeicher
- alle Level-2-Gebäude bleiben Future-Systeme
- `BuildingType` wird um `energyStorage` und `resourceStorage` erweitert
- `BuildingDefinition` wird um `powerStorage` und `resourceStorage` erweitert
- `BuildingRecipe` für Stahlwerk und Gasförderanlage ergänzt
- Ressourcenspeicher lagert Rohressourcen und verarbeitete Ressourcen
- Transportroboter und Bauroboter/Konstrukteure nutzen Ressourcenspeicher später als Quelle für MaterialRequests
- MVP aktiv bleiben nur Solar Collector und Roboterfabrik

## Neue Ergänzung v41

v41 löst Punkt 19 `Logistik ist nur als Konzept vorhanden`.

Festgelegt wurde:

- Logistik bleibt Future-System und ist nicht MVP.
- Logistik basiert auf Gebäudeinventaren, Ressourcenspeicher, MaterialRequests und Transportrobotern.
- Inventarrollen: input, output, storage, construction, cargo.
- MaterialRequest-Typen: moveToStorage, supplyBuildingInput, supplyConstruction, clearBuildingOutput.
- MaterialRequest-Statusmodell ergänzt.
- Endpunkte für Gebäude, Baustellen und Roboter-Cargo ergänzt.
- Ressourcenreservierung gegen Doppelbuchung ergänzt.
- Transportroboter erfüllt genau einen Request gleichzeitig.
- Keine Teillieferungen in erster Logistik-Version.
- Pickup und Delivery dauern je 1 Tick und kosten keine Batterie.
- normale Bewegungskosten gelten für Transportwege.
- Request-Prioritäten dokumentiert.
- Future-Baulogistik und Produktionslogistik dokumentiert.

## Neue Ergänzung v42

v42 löst Punkt 20 `Assets sind noch zu grob`.

Festgelegt wurde:

- vollständige MVP-required Assetliste
- MVP-optional Assetliste
- Future-Assetliste
- Dateipfade und kebab-case-Namenskonvention
- empfohlene Assetgrößen
- Render-Layer-Reihenfolge
- Canvas-Fallbacks für fehlende Assets
- Asset Registry mit `AssetDefinition`
- BASE_URL-kompatibles Asset-Loading für Vite/GitHub Pages
- Regel: Spiel muss ohne echte Bilddateien lauffähig bleiben

## Neue Ergänzung v44

v44 basiert auf dem hochgeladenen deutschen v42-Archiv und verwirft die frühere englische v43.

Gelöst wurde Review-Punkt 1:

```text
canonical-data-model.md ist nicht wirklich kanonisch
```

Änderungen:

- `docs/03-technical/canonical-data-model.md` vollständig konsolidiert
- doppelte und konkurrierende Typdefinitionen entfernt
- eine verbindliche Definition pro Typ
- alter einfacher `Program`-Typ als nicht kanonisch markiert
- `ProgramInstance`/`ProgramRow` als kanonisches Programm-Modell gesetzt
- `RobotTaskType` vereinheitlicht
- `BuildingType` inklusive `energyStorage` und `resourceStorage` konsolidiert
- `BuildingStatus` inklusive `construction` konsolidiert
- `standardRobot` aus dem kanonischen `RobotType` entfernt
- `PlayerCommand` um `startIronMinerProduction` ergänzt
- `GameState.materialRequests` als vorbereitetes, im MVP leeres Future-Feld aufgenommen
- Konsistenzbericht ergänzt:
  - `docs/06-reference/canonical-data-model-consistency-check-v44.md`

## Neue Ergänzung v45

v45 löst Review-Punkt 2:

```text
Der MVP kann im aktuellen Programmablauf hängen bleiben
```

Änderungen:

- `Energie sichern` aus dem MVP-Startroboter-Stack entfernt
- `Energie sichern` bleibt optionales Advanced-/Future-Template
- neuer MVP-Startroboter-Stack:
  1. `Iron Ore abbauen`
  2. `Solar Collector bauen`
  3. `Roboterfabrik bauen`
  4. `Erkunden`
  5. `Stasis-Laden`
- Batterie-Mindestbedingung aus dem Startroboter-Template `Erkunden` entfernt
- `Erkunden` stoppt erst bei angrenzendem Iron Ore oder Stasis
- `scoutNearby` steuert sichtbares, aber nicht angrenzendes Iron Ore intern an
- `Stasis-Laden` ist die einzige harte Energiesicherung des Startroboters im MVP
- Akzeptanzkriterium ergänzt: sichtbares, aber nicht angrenzendes Iron Ore darf nicht mehr zu Idle führen

## Neue Ergänzung v46

v46 löst Review-Punkt 3:

```text
Scoute Nahfeld ist zu unklar
```

Änderungen:

- `Scoute Nahfeld` erhält einen konfigurierbaren Zielparameter
- kanonisches MVP-Erkundungsprogramm:
  - `IF NOT Nachbarfeld hat Typ "Iron Ore"`
  - `THEN Scoute Nahfeld mit Ziel "Iron Ore"`
  - `STOP Nachbarfeld hat Typ "Iron Ore"`
  - `OR Roboterstatus = Stasis`
- technische Aktion:
  - `action.scoutNearby(targetFieldType = ironOre)`
- `Scoute Nahfeld` darf nicht hart auf Iron Ore codiert werden
- Zielauswahl für sichtbares Ziel, unknown Randfelder und Fallback-Felder präzisiert
- Ziel-Neubewertung nach jedem Bewegungsschritt ergänzt
- Diagnosegründe und Akzeptanzkriterium ergänzt

## Neue Ergänzung v47

v47 löst Review-Punkt 4:

```text
Produktionskosten des Iron Miner sind nicht eindeutig verortet
```

Änderungen:

- Iron-Miner-Produktionskosten im MVP eindeutig aus Startroboter-Cargo
- Kosten: 5 Iron Ore
- Kostenzeitpunkt: Start des ProductionTask
- Startroboter muss connected sein
- Startroboter muss nicht neben der Roboterfabrik stehen
- kein globaler Ressourcenpool
- keine Gebäudeinput-Inventare
- keine MaterialRequests
- keine Transportroboter
- Fehlerfälle und Diagnosen ergänzt
- UI-Regel für Button `Iron Miner produzieren` ergänzt
- Score und MVP-Ziel erst nach erfolgreichem Spawn

## Neue Ergänzung v48

v48 löst Review-Punkt 5:

```text
UI-Command für Iron-Miner-Produktion fehlt
```

Änderungen:

- Button `Iron Miner produzieren` im Roboterfabrik-Panel spezifiziert
- kanonischer PlayerCommand:
  - `{ type: "startIronMinerProduction"; buildingId }`
- Command Handler und `CommandResult` spezifiziert
- `CommandRejectionReason` ergänzt
- UI-Enabled-/Disabled-Zustände dokumentiert
- Produktionsanzeige im Building Panel dokumentiert
- Tick-Reihenfolge für Produktionscommand ergänzt
- Testfälle für UI/Command ergänzt
- klargestellt: fehlende freie Leistung deaktiviert den Button nicht
- klargestellt: Score und MVP-Ziel erst nach erfolgreichem Spawn

## Neue Ergänzung v49

v49 löst Review-Punkt 6:

```text
Startzustand ist nicht zentral genug definiert
```

Änderungen:

- neues zentrales Dokument `docs/02-mvp/initial-game-state.md`
- kanonische Factory `createInitialGame(seed = "mvp-default")`
- Startkarte, Sichtzustand, Startroboter, Stack, Startgebäude, Score, Eventlog und Future-Felder zentral definiert
- Startroboter bei `{ x: 5, y: 5 }`
- Startroboter startet mit Batterie 100 und leerem Cargo
- keine Startgebäude
- initialer Stack mit 5 Programmen ohne `template.secureEnergy`
- `Stasis-Laden` ist letzter, locked und enabled
- `GameState.selected` zeigt auf Startroboter
- `UiState` als UI-lokal abgegrenzt
- initiales Eventlog ergänzt
- Determinismusregeln ergänzt
- Akzeptanzkriterien und Tests für `createInitialGame` ergänzt

## Neue Ergänzung v50

v50 löst Review-Punkt 7:

```text
Startposition ist widersprüchlich dokumentiert
```

Änderungen:

- 0-basierte Kartenkoordinaten verbindlich dokumentiert
- gültige 10x10-Koordinaten: `x = 0..9`, `y = 0..9`
- Ursprung `{ x: 0, y: 0 }` oben links
- `x` wächst nach rechts, `y` wächst nach unten
- kanonischer Kartenarray-Zugriff: `map[y][x]`
- Startposition verbindlich: `{ x: 5, y: 5 }`
- `{ x: 5, y: 5 }` als eines der vier zentralen Felder definiert, nicht als exakte Mitte
- initiale Sicht bei Sichtweite 2: `x = 3..7`, `y = 3..7`
- Startfeld garantiert `plains`, ressourcenfrei und gebäudefrei
- Akzeptanzkriterien und Tests ergänzt

## Neue Ergänzung v51

v51 löst Review-Punkt 8:

```text
Build-Action-Zielauswahl ist noch zu grob
```

Änderungen:

- `Build Building` als parametrisierte autonome Aktion definiert
- sichtbarer Parameter `buildingType`
- GUI-Bausteine:
  - `[Baue Gebäude] [Typ: Solar Collector]`
  - `[Baue Gebäude] [Typ: Roboterfabrik]`
- Solar Collector wird nahe dem bauenden Roboter platziert
- Roboterfabrik wird nahe einem active Solar Collector platziert
- gültige Baufelder und Bau-Ausführungsfelder präzisiert
- Reservierung über `reservedForConstruction` verbindlich
- Ressourcenabzug erst beim Start des Bau-Tasks
- Ziel-Invalidierung mit einmaliger Neuwahl dokumentiert
- Diagnosegründe, Akzeptanzkriterien, Tests und Implementierungsaufgaben ergänzt

## Neue Ergänzung v52

v52 löst Review-Punkt 9:

```text
Action-Executability-Matrix fehlt
```

Änderungen:

- neue zentrale Datei `docs/03-technical/action-executability-matrix.md`
- Executability-Regeln für alle MVP ProgramActions:
  - `action.scoutNearby`
  - `action.mineResource`
  - `action.buildBuilding`
  - `action.stasisCharge`
- `action.charge` als Future/Advanced abgegrenzt
- PlayerCommand-Anhang für `startIronMinerProduction`
- `ActionExecutabilityResult` ergänzt
- `ActionNotExecutableReason` ergänzt
- `action.mineResource` um Parameter `resourceType` erweitert
- Ressourcenzeitpunkte zentral definiert
- Stack-Fortsetzung bei `notExecutable`, Task-Ende und Task-Abbruch definiert
- Akzeptanzkriterien, Testfälle und Implementierungsaufgaben ergänzt

## Neue Ergänzung v53

v53 löst Review-Punkt 10:

```text
Diagnose/Eventlog ist noch zu allgemein
```

Änderungen:

- neue zentrale Datei `docs/03-technical/diagnostics-and-eventlog.md`
- `GameEvent`-Schema erweitert
- stabile `GameEventCode`-Liste ergänzt
- Player Eventlog und Debug Diagnostics getrennt
- `severity` und `priority` definiert
- Deduplizierung für Player Events innerhalb von 10 Ticks definiert
- `eventLog`-Limit auf 200 Einträge festgelegt
- MVP-Eventliste definiert
- Debug-Details und UI-Anzeige definiert
- Event-Erzeugung für Actions und Commands dokumentiert
- Akzeptanzkriterien, Tests und Implementierungsaufgaben ergänzt

## Neue Ergänzung v54

v54 löst Review-Punkt 11:

```text
Testmatrix fehlt als eigenes verbindliches Dokument
```

Änderungen:

- `docs/02-mvp/mvp-test-matrix.md` als verbindliches Teststeuerungsdokument neu strukturiert
- Test-ID-Konvention ergänzt
- Prioritäten `P0`, `P1`, `P2` definiert
- Statuswerte `required`, `recommended`, `future`, `deprecated` definiert
- Testkategorien definiert
- Definition of Done ergänzt
- P0-required Mindestabnahme festgelegt
- strukturierte Testtabellen pro Kategorie ergänzt
- Verweise in Akzeptanzkriterien, Implementierungsplan, technischen Dokumenten und AGENTS ergänzt

## Neue Ergaenzung v55

v55 loest Review-Punkt 12:

```text
MVP-Energie-Topologie sollte zentraler formuliert werden
```

Aenderungen:

- `docs/04-systems/energy-system.md` als zentrale Energie-Spezifikation erstellt
- MVP-Energie als globaler Power-Pool definiert
- Solar Collector active + enabled erzeugt 50 Leistung
- Iron-Miner-Produktion benoetigt 40 Leistung
- Roboterfabrik idle benoetigt 0 Leistung
- `EnergySnapshot` ergaenzt
- Energie-Tick-Berechnung dokumentiert
- `startIronMinerProduction` prueft nicht `freePower`
- Energiemangel pausiert ProductionTask, bricht ihn aber nicht ab
- Energiemangel erstattet keine Kosten
- Roboterfabrik braucht keine Adjazenz zum Solar Collector fuer Energieversorgung
- keine Leitungen, Reichweite oder Speicher im MVP
- Energieanzeige und Events dokumentiert
- Testmatrix um `MVP-ENERGY-*` ergaenzt

## Neue Ergänzung v56

v56 löst Review-Punkt 13:

```text
Score-Regeln sind fast vollständig, aber Spawn vs. Produktion sollte präzisiert werden
```

Änderungen:

- Score und MVP-Ziel ausschließlich an erfolgreichen Iron-Miner-Spawn gebunden
- ProductionCommand, ProductionTask-Start, `readyToSpawn` und `spawnBlocked` explizit als nicht score-relevant definiert
- `spawnedRobots` als tatsächlich gespawnte Robot-Entities präzisiert
- `goal.mvpReached` entsteht nicht bei `readyToSpawn` oder `spawnBlocked`
- `production.ironMiner.spawned` entsteht erst nach Einfügen der Robot-Entity
- `goalBonusAwarded` verhindert mehrfachen Zielbonus
- Akzeptanzkriterien und Testmatrix um `MVP-GOAL-007` bis `MVP-GOAL-012` ergänzt

## Neue Ergänzung v57

v57 löst Review-Punkt 14:

```text
standardRobot ist im Typensystem, aber nicht spezifiziert
```

Änderungen:

- `standardRobot` wird nicht nachspezifiziert, sondern als nicht-kanonischer Legacy-Begriff ausgeschlossen
- kanonische RobotType-Liste bestätigt
- MVP-aktive Robotertypen: `starterRobot`, `ironMiner`
- `createInitialGame` erzeugt ausschließlich `starterRobot`
- Iron-Miner-Produktion erzeugt ausschließlich `ironMiner`
- ProgramTemplates und ProductionTasks dürfen `standardRobot` nicht referenzieren
- Glossar um Legacy-Hinweis ergänzt
- Testmatrix um `MVP-ROBOT-*` und `MVP-REG-008` ergänzt

## Neue Ergaenzung v58

v58 loest Review-Punkt 15:

```text
Asset-Doku ist gut, aber Fallbacks koennten noch exakter sein
```

Aenderungen:

- neue zentrale Datei `docs/05-assets/asset-fallbacks.md`
- neues Asset-Inventar `docs/05-assets/asset-inventory.md`
- finale Assets werden bevorzugt
- fehlende finale Assets blockieren den MVP nicht
- jeder MVP-AssetKey braucht einen Fallback
- fehlende Fallbacks sind technische Fehler
- `AssetKey`, `RenderAsset` und `AssetResolutionResult` ergaenzt
- `resolveAsset(key)` darf fuer MVP-AssetKeys niemals `undefined` liefern
- Fallbacks fuer Terrain, Fog, Iron Ore, Roboter, Gebaeude, Construction, Production-Status, Selection und Reservation definiert
- Debug-Codes `debug.asset.fallbackUsed` und `debug.asset.missingFallback` ergaenzt
- Testmatrix um `MVP-ASSET-*` ergaenzt


## Ergänzung v60: Gebäudesicht präzisiert

v60 basiert auf v59 und ergänzt gezielt den in der v58-v59-Prüfung gefundenen Verlustkandidaten.

Kanonische Regel:

```text
MVP_BUILDING_SIGHT_RANGE = 2
Aktive und enabled Gebäude erzeugen Sicht im Chebyshev-Radius 2.
Baustellen, deaktivierte oder zerstörte Gebäude erzeugen keine Sicht.
```

Diese Regel betrifft nur Fog-of-War/Visibility. Sie erzeugt keine lokale Energiezone und ändert nicht die globale MVP-Energie-Topologie.


## Ergänzung v61: canonical-data-model.md dedupliziert

v61 setzt nur den ersten technischen Bereinigungspunkt um. `docs/03-technical/canonical-data-model.md` wurde dedupliziert:

- doppelte Typdefinitionen entfernt, u. a. `PlayerCommand`, `GameEvent`, `RobotType`, `FieldCoord`, `AssetKey`, `RenderAsset`, `AssetResolutionResult`
- weiterhin gültige v45-v58-Typen in passende Fachabschnitte integriert
- historische Anhangsabschnitte durch konsolidierte Verweise ersetzt
- `AssetKey` auf die vollständige v58/v60-Fallback-Form vereinheitlicht
- `CommunicationMode` um doppelte `autonomous`-Zeile bereinigt
- `ActionParameterValue`/`ActionParameterDefinition` um `fieldType` ergänzt, damit die kanonische Scout-Nahfeld-Aktion typkonsistent bleibt

Nicht umgesetzt in v61: weitere Review-Punkte wie `sensor.robotStatus`, alte UI-Beispiele, Tick-Pipeline-Konsolidierung oder Build-Fortsetzungsdetails.


## Ergänzung v62: Asset-Typdefinitionen kanonisiert

v62 setzt nur den zweiten technischen Bereinigungspunkt um:

```text
2. AssetKey / RenderAsset / AssetResolutionResult auf eine kanonische Definition reduzieren
```

Änderungen:

- `AssetKey`, `RenderAssetKind`, `RenderAsset`, `AssetResolutionResult` und `resolveAsset` werden nur noch in `docs/03-technical/canonical-data-model.md` als TypeScript-Typen/Funktion definiert.
- `docs/05-assets/asset-fallbacks.md` enthält keine eigene TypeScript-Definition dieser Typen mehr, sondern verweist auf die Asset Registry im kanonischen Datenmodell.
- `asset-fallbacks.md` bleibt verbindlich für Fallback-Verhalten, Fehlerregeln und Akzeptanzregeln.
- `asset-inventory.md` bleibt die tabellarische Review-/Abnahmeliste der MVP-AssetKeys.

Nicht umgesetzt in v62: die weiteren offenen Punkte wie `sensor.robotStatus`, alte UI-Beispiele, Tick-Pipeline-Konsolidierung oder Build-Fortsetzungsdetails.


## Ergänzung v63: PlayerCommand-Duplikat entfernt

v63 setzt nur den dritten technischen Bereinigungspunkt um:

```text
3. PlayerCommand-Duplikat entfernen
```

Die einzige TypeScript-Quelle fuer `PlayerCommand` ist nun `docs/03-technical/canonical-data-model.md`.

Geaendert:

- `docs/04-systems/visual-programming-ui.md` definiert `type PlayerCommand = ...` nicht mehr erneut.
- UI-Dokumente beschreiben Command-Gruppen und einzelne Command-Formen nur noch textlich oder als einzelne Objektform.
- `startIronMinerProduction` bleibt Bestandteil der kanonischen `PlayerCommand`-Union.

Nicht umgesetzt in v64: die weiteren offenen Punkte wie alte UI-Beispiele, Tick-Pipeline-Konsolidierung oder Build-Fortsetzungsdetails.


## Ergänzung v65: fieldType als ActionParameterValue

v65 setzt nur den fünften technischen Bereinigungspunkt um:

```text
5. fieldType als ActionParameterValue ergänzen
```

Geändert:

- `ActionParameterDefinition.type` erlaubt `fieldType`.
- `ActionParameterValue` enthält `{ type: "fieldType"; value: FieldTypeQuery }`.
- `ScoutNearbyActionParameters.targetFieldType` nutzt die objektförmige `fieldType`-Variante.
- `MVP_EXPLORE_ACTION` und `action.scoutNearby` sind damit in Datenmodell, Template-Spezifikation und UI-Datenmodell konsistent.

Nicht umgesetzt in v65: alte Energie-sichern-/Batterie-60-Beispiele, Tick-Pipeline-Konsolidierung, Akzeptanzkriterium zu externer Roboterladung, MVP-FUT-005, Sichtzustands-Übergänge, ScoreState-Gebäudetyp-Zähler, stabile ProgramRowIds und Build-Fortsetzungsdetails.

## Ergänzung v66: altes Scout-Parameter-Beispiel entfernt

v66 setzt nur den sechsten technischen Bereinigungspunkt um:

```text
6. altes Scout-Parameter-Beispiel entfernen
```

Geändert:

- Alte Beispiele mit einem Distanz-zum-Gebäude-Parameter wurden aus aktiven MVP-Dokumenten entfernt.
- `maxDistanceFromBuilding` ist nicht MVP-kanonisch.
- `Scoute Nahfeld` wird in aktiven Beispielen nur noch über den Zielparameter `targetFieldType` beschrieben.
- Die sichtbare UI-Form lautet `[Scoute Nahfeld] [Ziel: Iron Ore]`.
- Die technische MVP-Form lautet `targetFieldType: { type: "fieldType", value: "ironOre" }`.

Nicht umgesetzt in v66: alte Energie-sichern-/Batterie-60-Beispiele, Tick-Pipeline-Konsolidierung, Akzeptanzkriterium zu externer Roboterladung, MVP-FUT-005, Sichtzustands-Übergänge, ScoreState-Gebäudetyp-Zähler, stabile ProgramRowIds und Build-Fortsetzungsdetails.


## v68 Hinweis

Die einzige kanonische Tick-Reihenfolge steht in `docs/03-technical/tick-pipeline.md`. Andere Dokumente duerfen darauf verweisen, aber keine eigene abweichende Pipeline definieren.


## Neue Ergaenzung v69

v69 loest Punkt 9 `Akzeptanzkriterium zu externer Roboterladung korrigieren`.

Festgelegt wurde:

- Externe Roboterladung ist Future und nicht MVP-aktiv.
- Akzeptanzkriterien duerfen keine Priorisierung zwischen Produktion und externer Roboterladung verlangen.
- Gebaeudeenergie beeinflusst im MVP ausschliesslich `ProductionTask`-Fortschritt.
- Stasis-Laden bleibt die einzige aktive Roboter-Lademechanik im MVP.
- Akzeptanztests muessen erwarten, dass externe Roboterladung keinen State-Effekt erzeugt.


## v70

Punkt 10 `MVP-FUT-005 zur Energie-Topologie aktualisieren` umgesetzt.

- `MVP-FUT-005` beschreibt lokale Energienetze jetzt als Future-System, nicht als ungeklärte MVP-Entscheidung.
- `energy-system.md` stellt klar: Die MVP-Energie-Topologie ist der globale Power-Pool.
- Lokale Energienetze, Leitungen, Reichweiten und Power-Routing bleiben nicht MVP-aktiv.
- Testmatrix um `MVP-V70-001` bis `MVP-V70-003` ergänzt.


## v71

Punkt 11 `Sichtzustands-Übergänge explizit definieren` umgesetzt.

- `unknown`, `discovered` und `visible` haben verbindliche Übergangsregeln.
- `visible` wird pro Sichtupdate aus aktuellen Sichtquellen berechnet.
- Felder, die zuvor sichtbar/bekannt waren und nicht mehr in aktueller Sicht liegen, werden `discovered`.
- Nie sichtbare Felder bleiben `unknown`.
- Iron Ore wird im MVP nur bei `visibility = visible` gerendert.
- Testmatrix um `MVP-V71-001` bis `MVP-V71-006` ergänzt.


## v72

Punkt 12 `ScoreState oder Ableitungsregel für Gebäudetyp-Zähler ergänzen` umgesetzt.

Festgelegt wurde:

- `ScoreState` enthält `builtSolarCollectors`, `builtRobotFactories` und `builtBuildings`.
- `builtBuildings = builtSolarCollectors + builtRobotFactories`.
- Solar Collectors und Roboterfabriken zählen erst beim ersten erfolgreichen Wechsel zu `status = active`.
- Die Ergebnisübersicht kann gebaute Solar Collectors und gebaute Roboterfabriken direkt aus `ScoreState` anzeigen.
- Testmatrix um `MVP-V72-001` bis `MVP-V72-005` ergänzt.


## Ergänzung v79: CommandResult fuer alle PlayerCommands

Basis: gueltiges v78 aus der v58-v78-Quellenkette.

Umgesetzt:

```text
19. CommandResult/CommandRejectionReason fuer alle PlayerCommands erweitern
```

Aenderungen:

- `CommandResult` gilt fuer alle `PlayerCommand`-Varianten.
- `CommandRejectionReason` deckt Runtime-, Selection-, Program-, Production- und Reset-Commands ab.
- Neues Dokument `docs/03-technical/player-command-handling.md` definiert die Command-Matrix.
- TypeScript-Definitionen fuer `CommandResult` und `CommandRejectionReason` stehen nur in `canonical-data-model.md`.
- `rejected` Commands duerfen keinen spielrelevanten State mutieren.
- Testmatrix um `MVP-V79-001` bis `MVP-V79-007` ergaenzt.


## Neue Ergänzung v80

v80 präzisiert die `updateProgram`-Validierung. Der MVP-Editor bleibt ein Formular-/Zeileneditor: nur freigegebene Template-Parameter dürfen geändert werden. Strukturänderungen an RowIds, actionIds, Sensoren, Operatoren oder locked Programmen werden mit konkretem `CommandRejectionReason` abgelehnt.
