# MVP Implementation Plan

## Projektgrundlage

- Vite + React + TypeScript einrichten.
- Vitest einrichten.
- Grundlayout erstellen.
- Canvas-Komponente anlegen.

## Datenmodell

- Kanonische Typen aus `../03-technical/canonical-data-model.md` umsetzen.
- Konstanten in `src/sim/constants.ts` gemaess der kanonischen Modulstruktur definieren.
- `GameState` erzeugen.

## Map-Generierung

- Seeded Random nach `docs/03-technical/seeded-rng.md` einbauen.
- 10x10-Karte erzeugen.
- Iron-Ore-Cluster erzeugen.
- Startposition validieren.
- Kein Iron Ore im initial sichtbaren Bereich.
- Fairness-Prüfung 4-6 Schritte.
- Fallback-Karte.

## Sicht/Fog

- Sichtzustände implementieren.
- Sichtweite Roboter und Gebäude.
- Fog-Overlay zeichnen.

## Tick-System

- Tick-Funktion ohne UI-Abhängigkeit.
- Pause/Geschwindigkeit.
- Eventlog.

## Bewegung und Pfadfindung

- Orthogonale Bewegung.
- Bewegungskosten nach Erfolg.
- Blockierte Felder.
- BFS-Pfadfindung.
- No-path-Diagnose.

## Programmstack

- Templates definieren.
- Top-down-Prüfung.
- Stop-Bedingungen.
- Deaktivierung/Abbruch.
- Ausführungslimits.
- `updateProgram` ueber Template-Edit-Policy validieren.
- Rejected `updateProgram` darf den ProgramStack nicht mutieren.

## Energie

- Selbstladung.
- Stasis-Laden als einzige aktive Roboter-Lademechanik.
- globaler MVP-Power-Pool durch active + enabled Solar Collector.
- Gebäudeverbrauch.
- Deaktivierbare Gebäude.

## Mining

- Iron-Ore-Abbau.
- Cargo.
- Felderschöpfung.
- Score für abgebautes Iron Ore.

## Bau

- Solar Collector bauen.
- Roboterfabrik bauen.
- Baustellenreservierung.
- Baukosten.
- Baufortschritt.

## Produktion

- Roboterfabrik-Leistungsbedarf.
- Iron Miner produzieren.
- MVP-Ziel erst nach erfolgreichem Iron-Miner-Spawn setzen.
- Score berechnen.

## Canvas Rendering

- Terrain zeichnen.
- Iron-Ore-Overlay.
- Roboter/Gebäude.
- Fog.
- Auswahlrahmen.

## UI

- Rechte Seitenleiste.
- Programmübersicht.
- Template-Editor.
- Diagnose.
- untere Steuerleiste.
- Score/Zeitlimit.

## Tests

- Map-Generator.
- Stack-Logik.
- Energie.
- Mining.
- Bau.
- Produktion.
- Zielerreichung.

## Polishing

- Lesbarkeit.
- Tooltips.
- Eventlog.
- Fehlerzustände.

## GitHub Pages Deployment

### Ziel

Der MVP soll als statische Web-App auf GitHub Pages lauffähig sein.

### Aufgaben

1. `vite.config.ts` mit GitHub-Pages-kompatiblem `base`-Pfad konfigurieren.
2. Asset-Pfade über `import.meta.env.BASE_URL` oder Vite-kompatible Mechanismen absichern.
3. Sicherstellen, dass keine Server-API benötigt wird.
4. `npm run build` prüfen.
5. `npm run preview` lokal prüfen.
6. GitHub-Actions-Workflow `.github/workflows/deploy.yml` ergänzen.
7. Tests vor Deployment ausführen.
8. `dist/` als Pages-Artefakt deployen.
9. GitHub Pages in Repository Settings aktivieren.
10. README um Deployment-Hinweise ergänzen.

### Akzeptanzkriterien

- Build läuft fehlerfrei.
- Tests laufen vor Deployment.
- GitHub Actions erzeugt ein Pages-Artefakt.
- GitHub Pages zeigt den MVP.
- Assets werden korrekt geladen.
- Kein Backend wird benötigt.

## Roboterfabrik-Aufträge

Aufgaben:

1. Auftrag `Iron Miner bauen` an der Roboterfabrik ermöglichen.
2. Produktionskosten 5 Iron Ore beim Start abziehen.
3. Produktionsdauer 10 Ticks.
4. Während Produktion 40 Leistung verbrauchen.
5. Nach Abschluss Status `readyToSpawn`.
6. Freies orthogonales Ausgabefeld suchen.
7. Wenn kein Ausgabefeld frei ist: Spawn blockieren.
8. Solange Spawn blockiert ist: keine neuen Fabrikaufträge.
9. Diagnose `Kein freies Ausgabefeld`.
10. MVP-Ziel setzen, wenn Iron Miner gespawnt ist.

## Visual Programming Data Model

Aufgaben:

1. `ProgramTemplateDefinition` definieren.
2. MVP-Templates als TemplateDefinitions anlegen.
3. Beim Hinzufügen zum Stack `ProgramInstance` erzeugen.
4. `ProgramRow` mit IF/THEN/STOP umsetzen.
5. `ConditionExpression` evaluieren.
6. `SensorDefinition` und erlaubte Operatoren implementieren.
7. Wertevalidierung für ConditionValues implementieren.
8. `ProgramAction` mit Parametern implementieren.
9. automatische Mindestenergieprüfung in Aktionsausführbarkeit integrieren.
10. UI-Blöcke als Projektion des Datenmodells rendern.

Akzeptanzkriterium:

- Das Template `Erkunden` kann intern als `ProgramInstance` gespeichert werden und in der UI als lesbare IF/THEN/STOP-Blöcke erscheinen.

## ProductionTask-Zustandsmaschine

Aufgaben:

1. `ProductionTaskStatus` mit `inProgress`, `readyToSpawn`, `spawnBlocked` definieren.
2. Roboterfabrik auf maximal einen `productionTask` begrenzen.
3. Beim Start 5 Iron Ore abziehen und `costPaid = true` setzen.
4. Bei ausreichender Leistung pro Tick `remainingTicks` reduzieren.
5. Bei fehlender Leistung Produktion pausieren und Diagnose schreiben.
6. Bei `remainingTicks <= 0` auf `readyToSpawn` setzen.
7. Gültige orthogonale Ausgabefelder prüfen.
8. Wenn kein Ausgabefeld frei ist: `spawnBlocked`.
9. Bei `spawnBlocked` neue Aufträge blockieren.
10. Später erneut Spawn prüfen.
11. Bei erfolgreichem Spawn Iron Miner erzeugen.
12. Nach Spawn `productionTask` entfernen.
13. Eventlog, Score und `mvpGoalReached` aktualisieren.

Testfälle:

- Produktion startet nur mit 5 Iron Ore.
- Kosten werden beim Start abgezogen.
- Fehlende Leistung pausiert Fortschritt.
- Kein Ausgabefeld blockiert Spawn.
- Fabrik nimmt während `spawnBlocked` keinen Auftrag an.
- MVP-Ziel erst nach Spawn.

## Baukosten und Baustellenmodell

Aufgaben:

1. Baukosten beim Start des Bauauftrags prüfen.
2. Baukosten aus Cargo abziehen.
3. `Building` mit `status = construction` erzeugen.
4. `costPaid`, `constructionProgress`, `constructionRequired` setzen.
5. Baustelle als bewegungsblockierend behandeln.
6. Bauaktion mit 10 Ticks Dauer implementieren.
7. Bei erfolgreichem Abschluss `constructionProgress += 1`.
8. Bei `constructionProgress >= constructionRequired` Gebäude auf `active` setzen.
9. Event `action.build.completed` mit `details.mode = buildingTask.mode` schreiben.
10. Score aktualisieren.
11. Bauunterbrechungen ohne Baustellenverlust behandeln.
12. Keine manuellen Bauabbrüche im MVP implementieren.

Testfälle:

- Bau startet nur mit ausreichendem Cargo.
- Kosten werden direkt beim Start abgezogen.
- Baustelle blockiert Bewegung.
- Energieabbruch zerstört Baustelle nicht.
- Fortsetzen kostet keine erneuten Ressourcen.
- Gebäude wird nach erfolgreicher Bauaktion aktiv.

## Roboterladung im MVP

Aufgaben:

1. Stasis-Laden als kontinuierlichen Tick-Effekt implementieren.
2. `battery <= 1` startet Stasis-Laden.
3. `battery >= 50` beendet Stasis-Laden.
4. Stasis-Laden erhöht Batterie um 1 pro Tick.
5. Stasis-Laden verbraucht keine Gebäudeenergie.
6. Externe Roboterladung nicht im MVP verarbeiten.
7. Solar Collector nicht als Roboter-Ladequelle behandeln.
8. Gebäudeenergie nur für ProductionTasks verwenden.

Testfälle:

- Stasis-Laden erhöht Batterie ohne Netzverbrauch.
- Roboterfabrik-Produktion wird nicht durch Roboterladung beeinflusst.
- Solar Collector active + enabled erzeugt 50 Leistung für den globalen Power-Pool.
- Externe Roboterladung wird nicht als MVP-Mechanik ausgeführt.

## Kommunikationsgrid im MVP deaktivieren

Aufgaben:

1. Konstante `MVP_COMMUNICATION_GRID_ACTIVE = false` definieren.
2. Starter Roboter mit `communicationMode = autonomous` und `communicationStatus = connected` initialisieren.
3. Iron Miner mit `communicationMode = gridRequired` und `communicationStatus = connected` initialisieren.
4. Kommunikation im MVP nicht als Blockadebedingung auswerten.
5. Keine Grid-Berechnung implementieren.
6. Keine Reichweitenberechnung für Kommunikation implementieren.
7. Keine disconnected/offline-Mechanik implementieren.
8. Optionales UI-Feld `Kommunikation: verbunden` anzeigen.
9. Future-Kommunikationssystem in Datenmodell und Doku vorbereitet lassen.

Testfälle:

- Starter Roboter bleibt unabhängig von Position connected.
- Iron Miner spawnt connected.
- Programme werden nicht wegen Kommunikation blockiert.
- Bewegung wird nicht wegen Kommunikation blockiert.
- Produktion wird nicht wegen Kommunikation blockiert.
- Es wird kein Kommunikationsgrid berechnet.

## MVP-Map-Generator

Aufgaben:

1. `MapGenerationConfig` definieren.
2. `MVP_MAP_CONFIG` definieren.
3. seeded RNG nach `docs/03-technical/seeded-rng.md` einführen.
4. `createPlainMap` implementieren.
5. Startposition `{ x: 5, y: 5 }` setzen.
6. initial sichtbare No-Ore-Zone berechnen.
7. Zielring mit BFS-Distanz 4-6 berechnen.
8. garantiertes erstes Ore-Cluster im Zielring platzieren.
9. restliche Ore-Cluster platzieren.
10. Cluster-Wachstum nur orthogonal erlauben.
11. jedes Ore-Feld mit 20 Iron Ore füllen.
12. initiale Sicht setzen.
13. `validateMvpMap` implementieren.
14. Retry-Logik mit 100 Versuchen implementieren.
15. `createFallbackMvpMap` implementieren.
16. Tests für Seed-Stabilität und Fairness schreiben.

Testfälle:

- gleicher Seed erzeugt gleiche Karte
- Karte ist 10x10
- genau 20 Iron-Ore-Felder
- kein Iron Ore im initial sichtbaren Bereich
- mindestens ein erreichbares Ore-Feld in BFS-Distanz 4-6
- Fallback-Karte ist valide
- nach 100 Fehlschlägen wird Fallback genutzt

## Pfadfindung und Kollisionen

Aufgaben:

1. `Direction` als `up/down/left/right` definieren.
2. `MovementState` mit `blockedByRobotTicks` definieren.
3. BFS ueber orthogonale Nachbarn implementieren.
4. Begehbarkeit pruefen: innerhalb Karte, passierbares Terrain, kein Gebaeude, keine Baustelle, keine aktive Ressource, kein anderer Roboter.
5. aktive Ressourcenfelder als blockierend behandeln.
6. erschoepfte Ressourcenfelder freigeben.
7. Bewegungskosten nach erfolgreichem Schritt abziehen.
8. Bewegung pro Tick nach Robot-ID verarbeiten.
9. direkten Platztausch verhindern.
10. keine Pfadreservierungen implementieren.
11. Roboterblockade bis 3 Ticks tolerieren.
12. nach 3 Blockaden Aktion abbrechen.
13. Zielnachbarfeld-Suche fuer Mining/Bauen/Laden implementieren.
14. Diagnosen ergaenzen.

Testfaelle:

- orthogonale Bewegung funktioniert.
- diagonale Bewegung ist unmoeglich.
- Gebaeude/Baustellen/aktive Ressourcen blockieren.
- erschoepfte Ressource blockiert nicht.
- zwei Roboter koennen nicht auf ein Feld.
- Platztausch wird verhindert.
- Roboterblockade wartet 3 Ticks.
- nach 3 Ticks wird Aktion abgebrochen.
- Mining/Bauen/Laden verwenden Nachbarfelder des Zielobjekts.

## Long-Task-Timing

Aufgaben:

1. `RobotTaskStatus` definieren.
2. `TaskAbortReason` definieren.
3. `RobotTask` um Status, Ticks, Ziel, Erfolgswerte und Abbruchgrund präzisieren.
4. Konstanten für Mining-, Bau-, Bewegungs- und Produktionsdauer definieren.
5. Startprüfung für Long Tasks implementieren.
6. Fortschritt über `remainingTicks` implementieren.
7. Abschlussprüfung für Mining und Bau implementieren.
8. Batteriekosten erst bei erfolgreichem Abschluss abziehen.
9. Mining-Abbruch ohne Ergebnis und ohne Batteriekosten behandeln.
10. Bauabbruch ohne Fortschritt und ohne Batteriekosten behandeln.
11. Baustelle bei Bauabbruch bestehen lassen.
12. ProductionTask bei fehlender Leistung pausieren.
13. ChargingTick als kontinuierlichen Tick-Effekt implementieren.
14. Tick-Reihenfolge fest implementieren.
15. Tests für Long-Task-Abschluss, Abbruch und Pausierung schreiben.

Verbindliche Tick-Reihenfolge:

```text
Die einzige kanonische Tick-Pipeline steht in docs/03-technical/tick-pipeline.md.
```

Implementierung:

```text
src/sim/tickPipeline.ts muss die Reihenfolge aus tick-pipeline.md exakt abbilden.
Andere Implementierungsphasen duerfen keine eigene abweichende Reihenfolge einfuehren.
```

## Gemeinsame Stack-und-Zeilen-Auswertung

Aufgaben:

1. Auswertungsfunktion fuer Stack-Reihenfolge implementieren.
2. Auswertungsfunktion fuer Zeilen-Reihenfolge implementieren.
3. `IF false -> naechste Zeile` implementieren.
4. `IF true, THEN nicht ausfuehrbar -> naechste Zeile` implementieren.
5. Bei erster ausfuehrbarer Zeile `robot.activeProgram = { programId: program.id, rowId: row.id, startedTick: currentTick }` setzen.
6. Waehrend laufendem RobotTask keine Stack-Neupriorisierung durchfuehren.
7. Nach Abschluss/Abbruch/Stop Stack-Pruefung oben starten.
8. Wenn kein Programm ausfuehrbar ist: `robot.status` bleibt `active`; `RobotActivityState = idle` fuer UI/Diagnose ableiten.
9. ProgramEvaluationTrace fuer Diagnosen erzeugen.
10. Kanonisches Beispiel als Test-/Debug-Szenario anlegen.

Testfaelle:

- Stack waehlt erstes ausfuehrbares Programm.
- Programm waehlt erste ausfuehrbare Zeile.
- Nicht erfuellte IF-Bedingung ueberspringt Zeile.
- Nicht ausfuehrbare THEN-Aktion ueberspringt Zeile.
- Wenn kein Programm ausfuehrbar ist, wird kein `idle` in `robot.status` geschrieben; `idle` wird nur fuer UI/Diagnose abgeleitet.
- Laufender Task verhindert Neupriorisierung.
- Abschluss startet Stack-Pruefung oben.
- Stop-Bedingung startet Stack-Pruefung oben.
- Beispiel Start -> Erkunden -> Mining -> Solarbau laeuft erwartungsgemaess.

## UI-MVP

Aufgaben:

1. `GameLayout` mit Main Game Screen anlegen.
2. `MapCanvas` fuer die 10x10-Karte implementieren.
3. Unknown/visible/Fog unterscheidbar rendern.
4. Roboter, Ressourcen, Gebäude und Baustellen rendern.
5. Auswahl per Klick auf Feld/Roboter/Gebäude implementieren.
6. `SelectionPanel` mit Field/Robot/Building-Varianten implementieren.
7. `ProgramStackPanel` implementieren.
8. ProgramCard-Statuswerte active/ready/skipped/blocked/disabled/completed/locked anzeigen.
9. Buttons Aktivieren/Deaktivieren, Hoch, Runter, Bearbeiten, Reset implementieren.
10. `ProgramEditorPanel` als Formular-/Zeileneditor implementieren.
11. Speichern/Abbrechen/Zurücksetzen für Programmänderungen implementieren.
12. `DiagnosticsPanel` mit Programm- und Zeilen-Diagnose implementieren.
13. `EventLogPanel` mit letzten 5–8 Ereignissen implementieren.
14. `BottomControlBar` mit Pause, Speed, Tick, Score, Zielstatus, Seed und Reset implementieren.
15. `UiState` und `PlayerCommand` einführen.
16. UI-State von GameState trennen.
17. Keine direkten Movement-/Build-/Attack-Commands implementieren.

Strukturhinweis:

Die verbindliche Projekt- und Modulstruktur steht in `../03-technical/implementation-module-structure.md`. Dieser Implementierungsplan ist keine Architekturquelle und darf keine abweichende Ordner- oder Modulstruktur einfuehren. Abweichende UI-Unterordner wie `src/ui/layout/**`, `src/ui/panels/**`, `src/ui/programEditor/**` oder `src/ui/controls/**` sind nicht kanonisch.

Pflichtkomponenten fuer den UI-MVP als Umsetzungsumfang, nicht als eigenstaendige Architekturdefinition:

```text
src/ui/GameLayout.tsx
src/ui/BottomControlBar.tsx
src/ui/MapCanvas.tsx
src/ui/MapTileTooltip.tsx
src/ui/SelectionPanel.tsx
src/ui/RobotPanel.tsx
src/ui/BuildingPanel.tsx
src/ui/FieldPanel.tsx
src/ui/ProgramStackPanel.tsx
src/ui/ProgramCard.tsx
src/ui/ProgramRowView.tsx
src/ui/ProgramEditorPanel.tsx
src/ui/ConditionEditor.tsx
src/ui/ActionParameterEditor.tsx
src/ui/DiagnosticsPanel.tsx
src/ui/EventLogPanel.tsx
src/ui/ScoreGoalPanel.tsx
src/ui/SpeedControls.tsx
src/ui/PauseButton.tsx
src/ui/ResetRunButton.tsx
```

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

## Asset-Implementierungsaufgaben

Aufgaben:

1. `assets.ts` mit Asset Registry anlegen.
2. `resolveAssetPath(path)` mit `import.meta.env.BASE_URL` implementieren.
3. Canvas-Fallbacks für fehlende Assets implementieren.
4. Render-Layer-Reihenfolge umsetzen:
   - Terrain
   - Resource overlay
   - Building / Construction site
   - Unit
   - Fog / Unknown overlay
   - Selection / Debug overlay
   - UI hover / tooltip
5. MVP-required AssetKeys und Fallbacks anlegen.
6. Fehlende Bilddateien dürfen keine Laufzeitfehler auslösen.
7. UI-Icons dürfen als Textbuttons ersetzt werden.

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

## Parametrisiertes Scouting

Implementierungsaufgaben:

1. `action.scoutNearby` um Parameter `targetFieldType` erweitern.
2. MVP-Erkundungs-ProgramAction mit `targetFieldType = ironOre` anlegen.
3. Scout-Zielauswahl auf Zieltyp X generalisieren.
4. Sichtbares Ziel X zu erreichbarem Nachbarfeld ansteuern.
5. Wenn Ziel X nicht sichtbar ist, unknown Randfeld wählen.
6. Fallback-Ziel wählen, falls kein Randfeld existiert.
7. Nach jedem Bewegungsschritt Sicht aktualisieren, Stop prüfen und Ziel neu bewerten.
8. Gleichstände seeded deterministic nach `docs/03-technical/seeded-rng.md` lösen.
9. Diagnosegründe für fehlenden Zielparameter und fehlendes Ziel ergänzen.

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

## Implementierungsaufgaben: startIronMinerProduction

Aufgaben:

1. `startIronMinerProduction(buildingId)` implementieren.
2. Prüfen, ob `building.type === "robotFactory"`.
3. Prüfen, ob Gebäude aktiv und enabled ist.
4. Prüfen, ob kein `productionTask` läuft.
5. Startroboter finden.
6. Prüfen, ob Startroboter connected ist.
7. Prüfen, ob Startroboter-Cargo mindestens 5 Iron Ore enthält.
8. Bei Erfolg: 5 Iron Ore aus Startroboter-Cargo abziehen.
9. `ProductionTask` mit `costPaid = true` anlegen.
10. Bei Fehler: kein Kostenabzug, kein Task, Diagnose/Eventlog schreiben.
11. Produktionsfortschritt nur bei verfügbarer Leistung >= 40.
12. Score und MVP-Ziel erst nach erfolgreichem Spawn setzen.

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

## Implementierungsaufgaben: UI-Command startIronMinerProduction

Aufgaben:

1. BuildingPanel für ausgewählte Roboterfabrik erweitern.
2. Button `Iron Miner produzieren` anzeigen.
3. Kosten, Dauer und Leistungsbedarf anzeigen.
4. Button-Enabled-State aus Command-Voraussetzungen ableiten.
5. Nicht genug freie Leistung nur als Hinweis anzeigen, nicht als Disabled-Grund.
6. Klick sendet `{ type: "startIronMinerProduction"; buildingId }`.
7. Command Handler `handleStartIronMinerProduction` implementieren.
8. `CommandResult` und `CommandRejectionReason` fuer alle `PlayerCommand`-Varianten nach `docs/03-technical/player-command-handling.md` modellieren.
9. Bei Erfolg Ressourcen abziehen und ProductionTask anlegen.
10. Bei Fehler keinen State mutieren außer Diagnose/Eventlog.
11. Produktionsstatus im BuildingPanel anzeigen.
12. Tests aus `docs/02-mvp/mvp-test-matrix.md` umsetzen.

Zusätzlich :

```text
Selection-, Program-, Production-, Reset- und Runtime-Validation-Commands liefern einheitlich CommandResult.
Rejected Commands mutieren keinen spielrelevanten State.
Die Typdefinition steht in canonical-data-model.md; die Validierungsmatrix steht in player-command-handling.md.
```

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

## Implementierungsaufgaben: createInitialGame

Aufgaben:

1. `docs/02-mvp/initial-game-state.md` als Quelle für Initialisierung verwenden.
2. `createInitialGame(seed = "mvp-default")` implementieren.
3. `createStarterRobot()` implementieren.
4. `createStarterProgramStack()` implementieren.
5. stabile IDs für Startroboter, Startprogramme und Start-Event verwenden.
6. `generateMvpMap(seed)` aufrufen.
7. `applyInitialVisibility(map, starterRobot)` implementieren.
8. `buildings = []` setzen.
9. `selected = { type: "robot", id: "robot.starter" }` setzen.
10. `createInitialScore()` mit Score 0 implementieren.
11. `createInitialEventLog()` mit Landungs-Event bei Tick 0 implementieren.
12. `materialRequests = []` setzen.
13. Tests für deterministische Initialisierung ergänzen.
14. Keine Initialisierung über `Math.random()`, `Date.now()` oder `crypto.randomUUID()`.

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

## Implementierungsaufgaben: Startposition

Aufgaben:

1. `MVP_START_POSITION = { x: 5, y: 5 }` als zentrale Konstante definieren.
2. Alle Startzustandsfunktionen auf diese Konstante umstellen.
3. Kartenarray als `map[y][x]` erzeugen und lesen.
4. Validierungshelper für 0-basierte Koordinaten ergänzen.
5. Initiale Sicht per Chebyshev-Distanz berechnen.
6. Startfeld auf `plains`, ressourcenfrei und gebäudefrei erzwingen.
7. Dokumentations-/Code-Kommentare vermeiden, die `{ x: 5, y: 5 }` als exakte Mitte bezeichnen.
8. Tests aus `mvp-test-matrix.md` ergänzen.

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

## Implementierungsaufgaben: Build-Action

Aufgaben:

1. `BuildBuildingActionParameters` mit `buildingType` ergänzen.
2. MVP-Templates auf `Baue Gebäude mit Typ X` umstellen.
3. Gültigkeitsprüfung für Baufelder implementieren.
4. Bau-Ausführungsfeld-Prüfung implementieren.
5. Solar-Collector-Policy `nearBuilder` implementieren.
6. Roboterfabrik-Policy `nearActiveSolarCollector` implementieren.
7. Reservierung über `reservedForConstruction` setzen.
8. MovementTask zum Bau-Ausführungsfeld erzeugen.
9. Ressourcen erst beim Start des Bau-Tasks abziehen.
10. Ziel-Invalidierung und einmalige Neuwahl implementieren.
11. Diagnosegründe ergänzen.
12. Tests aus `mvp-test-matrix.md` umsetzen.

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

## Implementierungsaufgaben: Action Executability

Aufgaben:

1. Datei `action-executability-matrix.md` als technische Quelle verwenden.
2. `ActionExecutabilityResult` modellieren.
3. `ActionNotExecutableReason` modellieren.
4. `canExecuteAction(state, robot, action)` implementieren.
5. `action.scoutNearby` gegen `targetFieldType` prüfen.
6. `action.mineResource` um `resourceType` erweitern.
7. `action.buildBuilding` gegen `buildingType` prüfen.
8. `action.stasisCharge` mit Status/Batterie/chargingMode prüfen.
9. `action.charge` als Future/Advanced markieren und nicht als MVP-ActionDefinition im ProgramEditor anbieten.
10. Stack-Fortsetzung bei notExecutable implementieren.
11. Ressourcenzeitpunkte aus der Matrix umsetzen.
12. Tests aus `mvp-test-matrix.md` ergänzen.

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

## Implementierungsaufgaben: Diagnose/Eventlog

Aufgaben:

1. `GameEventVisibility` modellieren.
2. `GameEventSeverity` modellieren.
3. `GameEventPriority` modellieren.
4. `GameEventCategory` modellieren.
5. `GameEventCode` als stabile Codes modellieren.
6. `GameEvent` um visibility, priority, code, repeatCount, firstTick und lastTick erweitern.
7. Event-Erzeugung über helper-Funktion zentralisieren.
8. Player-Event-Deduplizierung innerhalb von 10 Ticks implementieren.
9. eventLog auf 200 Einträge begrenzen.
10. Haupt-Eventlog auf visibility = player filtern.
11. Diagnosebereich an diagnosticsExpanded koppeln.
12. Tests aus `mvp-test-matrix.md` umsetzen.

## Implementierungssteuerung über Testmatrix

Die Umsetzung wird gegen die verbindliche Testmatrix gesteuert:

```text
docs/02-mvp/mvp-test-matrix.md
```

Regel:

```text
Jede Implementierungsphase muss die relevanten Test-IDs aus der Testmatrix berücksichtigen.
P0 required Tests sind MVP-blockierend.
P1 recommended Tests stabilisieren die MVP-Demo.
P2 future Tests werden vorbereitet, aber nicht als MVP-Pflicht behandelt.
```

Für Codex/Claude Code gilt:

```text
Implementierung nicht nur gegen Prosatext prüfen.
Immer relevante Test-IDs aus der Matrix heranziehen.
```

## MVP-Energie-Topologie

Aufgaben:

1. `EnergySnapshot` modellieren.
2. `MVP_SOLAR_COLLECTOR_POWER_PROVIDED = 50` definieren.
3. `MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED = 40` definieren.
4. Globalen Power-Pool pro Tick berechnen.
5. Solar Collector nur bei `active + enabled` einrechnen.
6. Roboterfabrik idle mit 0 Leistung behandeln.
7. ProductionTask-Fortschritt nur verarbeiten, wenn `productionTask.startedTick < currentTick` und ausreichende Produktionsleistung verfuegbar ist.
8. Bei Energiemangel `blockedReason = insufficientPower` setzen.
9. `startIronMinerProduction` nicht gegen freePower validieren.
10. Energieanzeige im UI ergaenzen.
11. Event `production.ironMiner.paused.insufficientPower` dedupliziert erzeugen.
12. Testfaelle `MVP-ENERGY-*` umsetzen.

## Implementierungsaufgaben: Spawn statt Produktion

Aufgaben:

1. Score-Update aus ProductionCommand- und ProductionTask-Erstellung entfernen.
2. Score-Update an erfolgreichen Robot-Spawn koppeln.
3. `mvpGoalReached` erst nach Einfügen der `ironMiner`-Robot-Entity setzen.
4. `spawnBlocked` ohne Score und ohne MVP-Ziel behandeln.
5. `goalBonusAwarded` nur beim ersten erfolgreichen Iron-Miner-Spawn setzen.
6. `production.ironMiner.spawned` erst nach erfolgreichem Entity-Insert erzeugen.
7. `goal.mvpReached` nicht bei `readyToSpawn` erzeugen.
8. Testmatrix um `MVP-GOAL-007` bis `MVP-GOAL-010` ergänzen und implementieren.

## Implementierungsaufgaben: standardRobot

Aufgaben:

1. `standardRobot` aus allen aktiven RobotType-Listen entfernen.
2. `standardRobot` nicht nachspezifizieren.
3. Startzustand auf `starterRobot` prüfen.
4. Iron-Miner-Produktion auf `ironMiner` prüfen.
5. ProgramTemplates auf `standardRobot` durchsuchen und bereinigen.
6. ProductionTasks gegen `standardRobot` validieren.
7. Legacy-Hinweis im Glossar beibehalten.
8. Tests `MVP-ROBOT-*` und `MVP-REG-008` berücksichtigen.

## Implementierungsaufgaben: Asset-Fallbacks

Aufgaben:

1. `AssetKey` fuer alle MVP-Assets modellieren.
2. `RenderAsset`, `AssetRegistry` und `FallbackAssetRegistry` modellieren.
3. `fallbackAssets: FallbackAssetRegistry` fuer alle MVP-AssetKeys vollstaendig definieren.
4. `loadedAssets: AssetRegistry` als partielle Registry finaler Assets definieren.
5. `resolveAsset(...)` als render-sicheren Pfad implementieren.
6. `resolveAssetDetailed(...)` als Diagnose-/Testpfad implementieren.
7. Finale Assets vor Fallbacks verwenden.
8. Missing final asset als normalen Fallback-Fall behandeln.
9. Missing fallback als technischen Fehler behandeln.
10. `debug.asset.fallbackUsed` optional ueber `resolveAssetDetailed(...)` erzeugen.
11. Unknown-Felder so rendern, dass keine Ressourcen verraten werden.
12. Tests `MVP-ASSET-*` und `MVP-V91-*` aus der Testmatrix umsetzen.


## Build-Event-Details

Implementierungspflicht:

```text
action.build.targetSelected, action.build.started und action.build.completed enthalten details.mode.
Der Wert kommt aus BuildTarget.mode bzw. BuildingTask.mode.
Erlaubte Werte: newConstruction, continueConstruction.
```

Tests muessen beide Modi abdecken.


## Implementierungshinweis: action.charge

`action.charge` wird im MVP nicht implementiert. Die Implementierung darf den Typ für spätere Ausbaustufen vorbereiten, aber aktive MVP-ActionDefinitionen, ProgramEditor-Auswahl, Starttemplates und Tests dürfen nur diese Actions verwenden:

```text
action.scoutNearby
action.mineResource
action.buildBuilding
action.stasisCharge
```
