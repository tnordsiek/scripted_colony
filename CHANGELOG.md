# Changelog

## v111 - Expansion 1 definiert (Forschung + Tier-2-Einstieg)

- Neues Scope-Dokument `docs/02-mvp/expansion-1-scope.md` als Quelleigentuemer fuer den Expansion-1-Umfang; in der Quelleigentuemer-Tabelle eingetragen.
- Aktiviert: KI-Forschungszentrum, Forschung mit vier Projekten (basicAutomation1, metalProcessing1, energyDistribution1, energyBuffer1), Stahlwerk mit Rezept 2 Iron Ore -> 1 Steel Plate, Energiespeicher als globaler Pool-Puffer, Ressource steelPlates, Template-Bibliothek (addProgramFromTemplate/removeProgram), Ausfuehrungslimits nach basicAutomation1.
- Bootstrap-Kostenregel: Expansion-1-Baukosten ohne Steel-Plate-/Silicon-Zirkularitaet (Forschungszentrum 10 Iron Ore, Stahlwerk 8 Iron Ore, Energiespeicher 4 Steel Plates); Future-Werte in building-and-unit-tiers.md bleiben Rebalancing-Referenz.
- Bewusst nicht aktiviert: Logistik/Transportroboter, Ressourcenspeicher, Grid Energy Line, Kommunikationsgrid-Wirkung, weitere Einheiten, Gas/Silicon, Combat/Hazards.
- `canonical-data-model.md`: ResearchState + GameState.research, SteelProductionTask, neue PlayerCommands, CommandRejectionReasons, GameEventCodes, AssetKeys, ProgramTemplateIds.
- `mvp-constants.md`: EXP1_*-Konstanten; `deterministic-id-generation.md`: SteelProductionTaskId-Muster.
- `tick-pipeline.md` Schritt 3 verarbeitet Gebaeudetasks (Produktion, Stahlwerk, Forschung); EnergySnapshot mit Energiespeicher-Regel; `energy-system.md` entsprechend ergaenzt.
- `initial-game-state.md`: initialer ResearchState (leer).
- Assets: `building.aiResearchCenter`, `building.steelworks`, `building.energyStorage` in Inventar und Fallback-Katalog.
- Testmatrix um EXP1-Serie erweitert (RES, STEEL, ESTOR, BUILD, TPL, GOAL, E2E, DOC).
- v110-Berichtsdateien nach `docs/archive/` verschoben; README, AGENTS, MANIFEST, Guideline auf v111.
- Keine MVP-Regel geaendert (Siegbedingung, Score, Batterie, Bewegung, Mining, Bau, Produktion, Startzustand unveraendert; additiv: GameState.research startet leer).
- Nachtrag (waehrend der Implementierung ergaenzt): Bauplatzwahl-Regeln praezisiert in `pathfinding-and-map-generation.md` — Einschluss-Schutz (kein Baufeld, das den bauenden Roboter einmauert) und Commitment-Regel (reserviertes gueltiges Baufeld wird beibehalten, verhindert Ziel-Pendeln); `expansion-1-scope.md` — addProgramFromTemplate fuegt ueber dem Erkundungsprogramm ein (Bau vor Erkundung, verhindert Livelock). Zusaetzlich kanonisch ergaenzt: ConditionValue resourceAmount, Building.storedEnergy/steelProductionTask, ResearchState.activeProjectSelectedTick, ActiveBuildableType, Verbraucher-Reihenfolge im Energie-Tick.

## v110 - Konsistenzkorrekturen nach inhaltlicher Pruefung umgesetzt

- Batterie-Einheit kanonisch als absolute Batteriepunkte in `docs/04-systems/units-and-energy.md` definiert; alle MVP-Robotertypen verwenden `batteryMax = 100`, 1 Punkt = 1 %.
- Prozentschreibweisen fuer Batteriewerte (`Batterie <= 1 %`, `-1 % Batterie`, `Batterie >= 50 %`) in aktiven MVP-Regeltexten auf absolute Punkte umgestellt: `simulation-rules.md`, `program-stack-rules.md`, `action-executability-matrix.md`, `acceptance-criteria.md`, `visual-programming-ui.md`, `resources-and-logistics.md`. Numerisch identisch, keine Gameplay-Aenderung.
- Quellenabgrenzung zwischen `units-and-energy.md` (Einheitenwerte, Batterie-Einheit, Verbrauch) und `robot-battery-and-charging.md` (Stasis-Ladeverhalten) in beiden Dokumenten dokumentiert; Quelleigentuemer-Tabelle entsprechend erweitert.
- Score-Konstanten (`MVP_SCORE_*`) in `docs/03-technical/mvp-constants.md` gespiegelt; Regelquelle bleibt `docs/04-systems/scoring-and-win-conditions.md`.
- Spawnfeld-Tie-Break-Verweis (seeded random, Kontext `spawnSite`) in `docs/03-technical/simulation-rules.md` ergaenzt.
- Abgrenzung der Iron-Miner-Spawnwerte in `docs/02-mvp/initial-game-state.md` ergaenzt.
- Testmatrix: in v109 angekuendigte, aber fehlende Eintraege `MVP-DOC-009` und `MVP-DOC-010` nachgetragen; `MVP-DOC-011` fuer die Batterie-Einheit ergaenzt.
- `roboter_logikspiel_konsistenzbericht_v109.md` und `roboter_logikspiel_konzept_zwischenstand_v109.md` nach `docs/archive/` verschoben; v110-Berichtsdateien neu erstellt.
- README.md, AGENTS.md, MANIFEST.md, Dokumentationsleitlinie und Konzept-Zwischenstand auf v110 angepasst.
- Keine Siegbedingung, Produktionskosten, Produktionsdauer, Tick-Reihenfolge, RNG-Regel, Build-Regel oder UI-Fachregel geaendert.


## v109 - Konsistenzkorrekturen nach Review umgesetzt

- Initiales `GameEvent` auf eine einzige kanonische Form mit `id = event.initialLanding` und `code = system.initialLanding` vereinheitlicht.
- Eventdetails fuer `production.ironMiner.blocked.notEnoughOre` auf `requiredOre` und `availableOre` angeglichen.
- Ore-Distanzregel fachlich beibehalten und korrekt als verpflichtendes erreichbares Zielband in Distanz 4-6 benannt.
- Betroffene Map-, Initial-State-, Test- und Referenzdokumente zur Ore-Distanzregel abgeglichen.
- RNG-Smoke-Test-Aufrufreihenfolge als fortlaufende Calls desselben RNG-Objekts klargestellt.
- Fog-Fallback-AssetKeys auf `fog.unknown` und `fog.discovered` vereinheitlicht; sichtbare Felder verwenden kein Fog-Overlay.
- Chronologische Formulierungen in aktiven Fach-/Technikdokumenten bereinigt.
- Kanonische TypeScript-Typquelle gestaerkt; nicht-kanonische Typbloecke als Auszuege/Future-Kontext eingeordnet.
- Beispiele und Testdaten gegen kanonische Typfelder geprueft.
- Testmatrix um `MVP-DOC-009` und `MVP-DOC-010` erweitert.
- README.md, AGENTS.md, MANIFEST.md und Konzept-Zwischenstand auf v109 angepasst.
- Keine Siegbedingung, Produktionsdauer, Produktionskosten, Tick-Reihenfolge, RNG-Algorithmus oder UI-Fachregel geaendert.


## v108 - Markdown-/Codeblock-Fehler bereinigt

- Punkt 14 umgesetzt: Markdown-/Codeblock-Fehler bereinigen.
- `docs/02-mvp/mvp-template-spec.md` bereinigt: erklaerende Prosa steht nicht mehr innerhalb eines TypeScript-Codeblocks.
- `docs/archive/v21-legacy/technical-guidelines.md` bereinigt: ueberzaehliger historischer Codeblock-Fence entfernt.
- `docs/00-documentation-guideline.md` um Markdown-/Codeblock-Regeln erweitert.
- Testmatrix um `MVP-DOC-008` erweitert.
- README.md, AGENTS.md, MANIFEST.md und Konzept-Zwischenstand auf v108 angepasst.
- Keine Spielmechanik, Produktionsdauer, Tick-Reihenfolge, RNG-Regel, Diagnostik-Mapping-Regel oder UI-Fachregel geaendert.

## v107 - Event-, Reason- und Command-Rejection-Mapping dokumentiert

- Punkt 13 umgesetzt: Event-, Reason- und Command-Rejection-Mapping vollstaendig als Matrix dokumentieren.
- `docs/03-technical/diagnostics-and-eventlog.md` enthaelt jetzt eine Event-Code-Matrix fuer alle `GameEventCode`-Eintraege.
- Action-Reason-Matrix fuer alle `ActionNotExecutableReason`-Eintraege ergaenzt.
- Command-Rejection-Matrix fuer alle `CommandRejectionReason`-Eintraege ergaenzt.
- Generischer Debug-Code `debug.command.rejected` fuer abgelehnte PlayerCommands ergaenzt.
- `notEnoughIronOreInStarterCargo` bleibt auf den Player-Code `production.ironMiner.blocked.notEnoughOre` gemappt.
- `player-command-handling.md`, `action-executability-matrix.md` und `deterministic-id-generation.md` auf das Mapping abgeglichen.
- Testmatrix um `MVP-EVENT-010` bis `MVP-EVENT-012` erweitert.
- Keine Spielmechanik, Produktionsdauer, Tick-Reihenfolge, RNG-Regel oder UI-Fachregel geaendert.

## v106 - Abweichende Architekturvorschlaege bereinigt

- Punkt 12 umgesetzt: Abweichende Architekturvorschlaege entfernen oder als nicht-kanonisch markieren.
- `docs/03-technical/implementation-module-structure.md` bleibt alleinige kanonische Strukturquelle.
- `docs/02-mvp/mvp-and-tech-stack.md` fuehrt keine eigene Kurzstruktur mehr, sondern verweist auf die kanonische Strukturquelle.
- `docs/02-mvp/implementation-plan.md`, `docs/04-systems/visual-programming-ui.md` und `docs/04-systems/ui-components-contract.md` als Umsetzungs-/UI-Vertraege ohne Architekturhoheit markiert.
- Dokumentationsleitlinie um Regel fuer Architekturvorschlaege in aktiven Dokumenten ergaenzt.
- Testmatrix um `MVP-DOC-007` erweitert.

## v105 - Kanonische Projekt- und Modulstruktur festgelegt

- `docs/03-technical/implementation-module-structure.md` als kanonische Quelle fuer Projekt- und Modulstruktur festgelegt.
- Strukturstatus von empfohlen auf verbindlich geaendert.
- Kanonische Wurzeldateien, `src/sim/**`, `src/sim/actions/**`, `src/sim/tasks/**`, `src/ui/**` und `src/tests/**` dokumentiert.
- Nicht kanonische parallele Unterbaeume wie `src/sim/map/**`, `src/sim/robot/**`, `src/sim/programs/**`, `src/ui/layout/**`, `src/ui/panels/**` und `src/ui/programEditor/**` ausgeschlossen.
- `docs/02-mvp/mvp-and-tech-stack.md`, `docs/02-mvp/implementation-plan.md`, `docs/04-systems/visual-programming-ui.md`, `docs/04-systems/ui-components-contract.md` und `docs/06-reference/glossary-and-naming.md` auf die kanonische Struktur abgeglichen.
- Quellenprioritaet um den Themenbereich Projekt- und Modulstruktur erweitert.
- Testmatrix um `MVP-DOC-006` erweitert.
- README.md, AGENTS.md, MANIFEST.md und Konzept-Zwischenstand auf v105 angepasst.
- Keine Spielmechanik, Tick-Reihenfolge, Produktionsregel, Datenmodellregel, RNG-Regel oder UI-Fachregel geaendert.

## v104 - Node-Version und Lockfile-Regel dokumentiert

- Node.js 22.x als verbindliche Runtime fuer aktive MVP-Umsetzung, CI und Dokumentation festgelegt.
- Node-Range `>=22 <23` fuer `package.json` dokumentiert.
- GitHub-Actions-Regel `actions/setup-node@v4` mit `node-version: 22` bestaetigt.
- Lockfile-Regel fuer `package-lock.json` praezisiert: eingecheckt, nicht manuell editiert, Aktualisierung nur durch npm unter Node.js 22.x.
- `npm ci` als verbindlicher Installationsbefehl fuer CI und reproduzierbare Clean-Setups dokumentiert.
- `docs/02-mvp/mvp-and-tech-stack.md`, `docs/00-documentation-guideline.md`, `docs/03-technical/github-pages-deployment.md` und Testmatrix angepasst.
- Testmatrix um `MVP-DOC-005` erweitert.
- README.md, AGENTS.md, MANIFEST.md und Konzept-Zwischenstand auf v104 angepasst.
- Keine Spielmechanik, Tick-Reihenfolge, Produktionsregel, Datenmodellregel, RNG-Regel oder UI-Regel geaendert.

## v103 - Verbindlichen Package Manager festgelegt

- `npm` als einzigen aktiven Package Manager fuer MVP-Umsetzung, CI und Dokumentation festgelegt.
- `package-lock.json` als einziges vorgesehenes Lockfile dokumentiert.
- Aktive `npm oder pnpm`-Formulierung aus `AGENTS.md` und `docs/02-mvp/mvp-and-tech-stack.md` entfernt.
- `docs/02-mvp/mvp-and-tech-stack.md` um eine explizite Package-Manager-Regel ergaenzt.
- `docs/00-documentation-guideline.md` um Dokumentationskonsistenz fuer Package Manager und Lockfile ergaenzt.
- Testmatrix um `MVP-DOC-004` erweitert.
- README.md, AGENTS.md, MANIFEST.md und Konzept-Zwischenstand auf v103 angepasst.
- Keine Spielmechanik, Tick-Reihenfolge, Produktionsregel, Datenmodellregel, RNG-Regel oder UI-Regel geaendert.


## v102 - Kaputte relative Links korrigiert

- Defekten relativen Dateiverweis in `docs/02-mvp/implementation-plan.md` korrigiert: `03-technical/canonical-data-model.md` wurde zu `../03-technical/canonical-data-model.md`.
- `docs/00-documentation-guideline.md` um die Regel `Dateiverweise und relative Pfade` erweitert.
- Testmatrix um `MVP-DOC-003` fuer Dateiverweis-Pruefung ergaenzt.
- README.md, AGENTS.md, MANIFEST.md und Konzept-Zwischenstand auf v102 angepasst.
- Keine Spielmechanik, Tick-Reihenfolge, Produktionsregel, Datenmodellregel, RNG-Regel oder UI-Regel geaendert.

## v101 - Quellenprioritaet aktiver Dokumente geregelt

- `docs/00-documentation-guideline.md` um eine eindeutige Quellenprioritaet aktiver Dokumente erweitert.
- Quelleigentuemer je Themenbereich festgelegt, unter anderem fuer MVP-Umfang, Initial-State, Datenmodell, Tick-Reihenfolge, Simulation, Tests, RNG, Map, Systemverhalten und Assets.
- README.md, AGENTS.md, MANIFEST.md, CHANGELOG.md und Konzept-Zwischenstand als Einstiegs-, Arbeits- oder Versionsdokumente abgegrenzt, die keine Fach- oder Technikquelle ueberschreiben.
- Konfliktaufloesung und spezifische Vorrangregeln dokumentiert.
- README.md und AGENTS.md verweisen jetzt auf die Quellenprioritaet in der Dokumentationsleitlinie.
- Testmatrix um `MVP-DOC-002` ergaenzt.
- Keine Spielmechanik, Tick-Reihenfolge, Produktionsregel, Datenmodellregel, RNG-Regel oder UI-Regel geaendert.

## v100 - ProductionTask-Timing-Dokumente und Tests abgeglichen

- `tick-pipeline.md`, `simulation-rules.md` und `production-and-spawn.md` mit einem einheitlichen Timing-Vertrag fuer `ProductionTask`s abgeglichen.
- Starttick N praezisiert: neu gestartete `ProductionTask`s erzeugen keinen Leistungsbedarf, keinen Fortschritt, kein Pause-Event, kein `readyToSpawn` und keinen Spawnversuch.
- Tick N+1 als erster moeglicher Fortschritt- oder Pause-Tick in allen drei Dokumenten gleich formuliert.
- Tick N+10 ohne Pausen als Abschluss-, `readyToSpawn`- und Spawn-Pruefungs-Tick konsistent dokumentiert.
- Timingtests aus der separaten v99-Gruppe in den normalen Testbereich `Produktion / Spawn` ueberfuehrt und auf `MVP-PROD-010` bis `MVP-PROD-015` erweitert.
- Keine Siegbedingung, Produktionskosten, Produktionsdauer, RNG-Regel, Build-Regel oder UI-Regel geaendert.

## v99 - Exaktes Timing fuer ProductionTask-Fortschritt festgelegt

- `startIronMinerProduction` in Tick N erzeugt einen `ProductionTask` mit `createdTick = startedTick = N` und `remainingTicks = 10`.
- Neu gestartete `ProductionTask`s sind in ihrem Starttick nicht fortschrittsberechtigt.
- Der erste moegliche Fortschrittstick ist Tick N+1.
- Ohne Pausen erfolgt der zehnte Fortschrittstick in Tick N+10; `readyToSpawn` und Spawn-Pruefung erfolgen im selben Tick N+10.
- Same-Tick-Fortschritt, Same-Tick-Pause und Same-Tick-Spawn fuer neu gestartete `ProductionTask`s ausgeschlossen.
- `tick-pipeline.md`, `simulation-rules.md`, `production-and-spawn.md`, `energy-system.md` und Testmatrix angepasst.
- Keine Siegbedingung, Produktionskosten, Build-Regel, RNG-Regel oder UI-Regel geaendert.

## v98 - Referenzwerte fuer Seed mvp-default definiert

- Referenzwerte fuer `generateMvpMap("mvp-default")` in `docs/03-technical/pathfinding-and-map-generation.md` ergaenzt.
- Kanonische Iron-Ore-Koordinatenliste `MVP_DEFAULT_IRON_ORE_FIELDS` dokumentiert.
- Kartenvisualisierung, Selektions-Checkpoints, Koordinaten-Signatur und Grid-Signatur ergaenzt.
- `docs/02-mvp/initial-game-state.md` verweist auf die Kartenreferenz.
- Testmatrix um `MVP-V98-001` bis `MVP-V98-005` ergaenzt.
- Keine Tick-Reihenfolge, Siegbedingung, Produktionsregel, Build-Regel oder UI-Regel geaendert.

## v97 - Seeded-RNG-Algorithmus festgelegt

- `docs/03-technical/seeded-rng.md` als kanonische technische Quelle fuer seed-basierten Zufall ergaenzt.
- FNV-1a 32-bit ueber UTF-8-Bytes als Hashing des RNG-Eingabestrings festgelegt.
- Mulberry32 als PRNG festgelegt.
- `makeRngInput(...)` als eindeutige Kontext-Seed-Bildung dokumentiert.
- Map-Generierung auf `createSeededRng(makeRngInput([seed, "map", attempt]))` praezisiert.
- Stabile Sortierung von Kandidatenlisten vor RNG-Auswahl verbindlich gemacht.
- RNG-Smoke-Test-Referenzwerte und Testmatrix-Eintraege `MVP-V97-001` bis `MVP-V97-005` ergaenzt.
- Keine Siegbedingung, Tick-Reihenfolge, Produktions-/Build-Regel oder UI-Regel fachlich geaendert.

## v96 - Veraltete Referenzdokumente bereinigt

- Veraltete Referenzdokumente geprueft.
- Historischen Konsistenzcheck `docs/06-reference/canonical-data-model-consistency-check-v44.md` nach `docs/archive/canonical-data-model-consistency-check-v44.md` verschoben.
- Begruendung: Die dort genannten offenen Punkte sind durch spaetere aktive Dokumente geloest, ersetzt oder neu geregelt.
- `docs/06-reference/assets.md` von Legacy-`AssetId`-Beispielen auf aktuelle `AssetKey`-Begriffe aktualisiert.
- `docs/06-reference/glossary-and-naming.md` bei Asset-Quellen und versionsbezogenen Referenzhinweisen bereinigt.
- Keine Spielmechanik, Tick-Reihenfolge, Datenmodellregel oder Asset-Fallback-Regel geaendert.

## v95 - Arbeitschronik-Ueberschriften aus aktiven Dokumenten entfernt

- Nachbearbeitung der Dokumentationshygiene umgesetzt.
- Aktive Markdown-Dokumente ausserhalb `CHANGELOG.md` und `docs/archive/**` erneut geprueft.
- Ueberschriften mit Versionsmarkern, Punktnummern, Abschlussformeln und Phasenmarkern durch sachliche Abschnittstitel ersetzt.
- Keine fachlichen Regeln, Spielmechaniken, Tests, Tick-Reihenfolgen oder Datenmodelle geaendert.


## v94 - Arbeitschronik-Abschnitte aus aktiven Dokumenten bereinigt

- Punkt 35 umgesetzt: aktive Dokumente von Arbeitschronik-Abschnitten bereinigt.
- Versionsartige Hinweis-/Klarstellungsueberschriften in aktiven Fach- und Technikdokumenten durch sachliche Abschnittstitel ersetzt.
- README-Klarstellungsanhaenge in den aktuellen Stand integriert und als aktive Chronikabschnitte entfernt.
- Dokumentationsleitlinie um die Regel ergaenzt, dass Arbeitschronik nur in `CHANGELOG.md` oder `docs/archive/**` steht.
- Testmatrix um `MVP-DOC-001` ergaenzt.
- Keine Spielmechanik geaendert.

## v93 - Event-Beispiele und Goal-Message aktualisiert

- Punkt 33 umgesetzt: Event-Beispiele und Goal-Message auf Spawn- und deterministische ID-Begriffe aktualisiert.
- Beispiel-Event-IDs nutzen jetzt `event.<tick6>.<seq3>.<code>`.
- Beispiel-Entity-IDs nutzen jetzt kanonische dreistellige Sequenzen wie `building.robotFactory.001`.
- `goal.mvpReached` meldet jetzt `MVP-Ziel erreicht: erster Iron Miner gespawnt.`
- Aktive Zieltexte wurden bereinigt, damit Produktionsabschluss nicht mit erfolgreichem Spawn gleichgesetzt wird.
- Keine Spielmechanik geaendert.

## v92 - Initial-State-Verweis im Datenmodell bereinigt

- Punkt 32 umgesetzt: veralteter Hinweis entfernt, dass der Initial-State erst spaeter zentralisiert wird.
- `canonical-data-model.md` verweist jetzt eindeutig auf `docs/02-mvp/initial-game-state.md` als verbindliche Initial-State-Quelle.
- Keine Spielmechanik geaendert.


## v90 - Deterministische Event-Sequenz innerhalb eines Ticks

Basis: gueltiges v89 aus der v58-v89-Quellenkette.

Umgesetzt:

```text
30. deterministische Event-Sequenz innerhalb eines Ticks definieren
```

Aenderungen:

- Event-Kandidaten werden vor Runtime-ID-Vergabe deterministisch sortiert.
- Kanonischer Sortierschluessel: `pipelineStepOrder -> sourceOrder -> entitySortKey -> eventCodeOrder -> localSequence`.
- `seq3` in `event.<tick6>.<seq3>.<code>` wird erst nach Sortierung und Deduplizierung an neue Events vergeben.
- Deduplizierte Player-Events behalten ihre bestehende ID und verbrauchen keinen neuen `seq3`-Slot.
- Tick-Pipeline stellt sicher, dass Score-/Goal-Events vor der finalen Event-Normalisierung entstehen koennen.
- Testmatrix um `MVP-V90-001` bis `MVP-V90-006` ergaenzt.

## v84 - Build-Event-details.mode verbindlich gemacht

Basis: gueltiges v83 aus der v58-v83-Quellenkette.

Umgesetzt:

```text
24. Build-Event-details.mode verbindlich machen
```

Aenderungen:

- `action.build.targetSelected`, `action.build.started` und `action.build.completed` muessen `details.mode` enthalten, sobald ein BuildTarget/BuildingTask feststeht.
- Erlaubte Werte: `newConstruction` und `continueConstruction`.
- `details.mode` wird aus `BuildTarget.mode` bzw. `BuildingTask.mode` uebernommen.
- Pflichtdetails fuer Build-Events dokumentiert: `mode`, `buildingType`, `buildingId`, `siteX`, `siteY`.
- `BuildActionEventDetails` und `BuildActionGameEvent` im kanonischen Datenmodell ergaenzt.
- Testmatrix um `MVP-V84-001` bis `MVP-V84-006` ergaenzt.

## v82 - Deterministische ID-Erzeugung zentral definiert

Basis: gueltiges v81 aus der v58-v81-Quellenkette.

Umgesetzt:

```text
22. deterministische ID-Erzeugung zentral definieren
```

Aenderungen:

- Neue zentrale Datei `docs/03-technical/deterministic-id-generation.md`.
- Kanonische ID-Muster fuer `BuildingId`, `ProductionTaskId`, gespawnte `RobotId`, `RobotTaskId` und Runtime-`GameEventId` festgelegt.
- Statische Initial-IDs wie `robot.starter`, `program.starter.*`, `row.starter.*.main` und `event.initialLanding` dokumentiert.
- ID-Factory-Signaturen in `canonical-data-model.md` ergaenzt.
- `Math.random()`, `Date.now()` und `crypto.randomUUID()` fuer spielrelevante IDs explizit verboten.
- Rejected Commands erzeugen keine spielrelevanten IDs.
- Testmatrix um `MVP-V82-001` bis `MVP-V82-008` ergaenzt.

## v81 - Visual-Programming-Beispielwerte ersetzt

- Alte aktive Visual-Programming-Beispielwerte ersetzt.
- Keine alten Batteriegrenzwerte aus dem frueheren Energie-sichern-Template mehr als aktive MVP-Beispiele.
- Keine alten Scout-Distanzparameterwerte mehr als aktive MVP-Beispiele.
- `visual-programming-data-model.md` nutzt aktuelle MVP-Templates und freigegebene Template-Parameter als Beispiele.
- `visual-programming-ui.md` zeigt beim Build-Beispiel `construction` als Fortsetzungsziel und `active` als Stop-Status.
- Neue Tests `MVP-V81-001` bis `MVP-V81-004` ergaenzt.

## v78 - activeProgram als kanonischen aktiven Programmzustand verwendet

Basis: gueltiges v77 aus der v58-v77-Quellenkette.

Umgesetzt:

```text
18. activeProgramId/activeRowId durch activeProgram ersetzen
```

Aenderungen:

- `ActiveProgramState` bleibt die einzige kanonische Struktur fuer die aktuell ausgefuehrte Programmzeile.
- Beim Start einer ausfuehrbaren Row setzt die Simulation `robot.activeProgram = { programId, rowId, startedTick }`.
- Nach Abschluss, Abbruch, Stop-Bedingung, Spielerabbruch oder Deaktivierung wird `robot.activeProgram` auf `undefined` gesetzt.
- Aktive Dokumente fuehren keine separaten gespeicherten Programm-/Row-ID-Felder am Robot-Objekt.
- Testmatrix um `MVP-V78-001` bis `MVP-V78-004` ergaenzt.


## v76 - RobotTask als diskriminierte Union konsolidiert

Basis: gueltiges v75 aus der v58-v75-Quellenkette.

Umgesetzt:

```text
16. RobotTask auf eine kanonische diskriminierte Union konsolidieren
```

Aenderungen:

- `RobotTask` ist jetzt kanonisch `MovementTask | MiningTask | BuildingTask | StasisChargingTask`.
- Der alte generische RobotTask mit optionalen Feldern ist nicht mehr kanonisch.
- `BuildingTaskMode` ersetzt die Namensdrift zu `BuildTaskMode`.
- `robot-task-payloads.md` enthaelt keine zweite TypeScript-Definition mehr, sondern verweist auf `canonical-data-model.md`.
- Future-Tasktypen wie `charging` und `logistics` bleiben nicht MVP-aktiv.
- Testmatrix um `MVP-V76-001` bis `MVP-V76-006` ergaenzt.

## v74 - Build-Fortsetzung technisch präzisiert

Basis: gueltiges v73 aus der v58-v73-Quellenkette.

Umgesetzt:

```text
14. Build-Fortsetzung technisch präzisieren
```

Aenderungen:

- `action.buildBuilding` prueft zuerst, ob eine passende bestehende Baustelle mit `status = construction` fortgesetzt werden kann.
- Neubau und Fortsetzung sind als `BuildingTask.mode = newConstruction | continueConstruction` getrennt.
- Fortsetzen zieht keine neuen Ressourcen ab und legt kein neues Building an.
- Fortsetzen verwendet dieselbe `buildingId`.
- Build-Templates stoppen erst bei `status = active`; `construction` ist Fortsetzungsziel und Duplikatblocker.
- Testmatrix um `MVP-V74-001` bis `MVP-V74-006` ergaenzt.

# CHANGELOG

## v81

- Alte aktive Visual-Programming-Beispielwerte ersetzt.
- Keine Batterie-20/25-, Batterie-80/90- oder Scouting-Distanz-15/12-Beispiele mehr als aktive MVP-Beispiele.
- `visual-programming-data-model.md` nutzt aktuelle MVP-Templates und freigegebene Template-Parameter als Beispiele.
- `visual-programming-ui.md` zeigt beim Build-Beispiel `construction` als Fortsetzungsziel und `active` als Stop-Status.
- Neue Tests `MVP-V81-001` bis `MVP-V81-004` ergaenzt.

## v73

- Stabile `ProgramRowId`s fuer alle MVP-Starttemplates ergaenzt.
- Kanonische IDs: `row.starter.mineIronOre.main`, `row.starter.buildSolarCollector.main`, `row.starter.buildRobotFactory.main`, `row.starter.exploreNearby.main`, `row.starter.stasisCharge.main`.
- `createStarterProgramStack()`, Diagnostics/Eventlog, Template-Reset und Tests duerfen diese IDs verbindlich verwenden.
- Neue Tests `MVP-V73-001` bis `MVP-V73-005` ergaenzt.

## v67

- Alte aktive Beispiele mit `Energie sichern`, `Batterie >= 60 %` und `STOP Sichtfeld hat Typ Iron Ore` aus ProgramStack- und UI-Dokumenten ersetzt.
- `program-stack-rules.md` verwendet im kanonischen Beispiel nur noch den aktuellen MVP-Startstack: `mineIronOre`, `buildSolarCollector`, `buildRobotFactory`, `exploreNearby`, `stasisCharge`.
- `visual-programming-ui.md` zeigt im ProgramStackPanel und ProgramEditorPanel nur noch aktuelle MVP-Beispiele.
- `visual-programming-data-model.md` nutzt in der UI-Projektion kein altes Batterie-60-Beispiel mehr.
- Neue Regressionspruefungen `MVP-V67-001` bis `MVP-V67-004` ergaenzt.

## v66

- Altes Scout-Parameter-Beispiel entfernt.
- `maxDistanceFromBuilding` ist nicht MVP-kanonisch.
- `Scoute Nahfeld` nutzt in aktiven Dokumenten nur noch den Zielparameter `targetFieldType`; MVP-Wert ist `ironOre`.
- Akzeptanzkriterien, ProgramStack-Beispiele, Pathfinding-Regeln und Visual-Programming-UI wurden entsprechend bereinigt.

## v63

Konsolidierungsrelease fuer die Punkte 16-25. Primaerquellen bereinigt, Templates finalisiert, Roboterbatterie/Laden konsolidiert, Tick-Pipeline, Konstanten, Task-Payloads, UI-Komponentenvertrag, Modulstruktur, Reset/Seed/Persistenz und README/CHANGELOG-Trennung ergaenzt.

## Vorherige README-Historie aus v58

# Roboter-Logikspiel Gesamtpaket v58

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

v31 löst Punkt 8 `Energieverbrauch durch Roboterladen`.

> v69-Hinweis: Diese v31-Regeln zur externen Roboterladung sind historisch und nicht MVP-aktiv. Fuer den MVP gilt: externe Roboterladung wird nicht verarbeitet; Gebaeudeenergie beeinflusst ausschliesslich ProductionTasks.

Festgelegt wurde:

- Selbstladung verbraucht keine Netzleistung.
- Starter-Selbstladung: 1 % Batterie/Sekunde.
- Externes Laden verbraucht Netzleistung.
- 1 Leistung = 1 % Batterie/Sekunde.
- Solar Collector lädt extern maximal 10 %/Sekunde pro Roboter.
- Maximales externes Laden kostet 10 Leistung.
- Bei weniger freier Leistung lädt der Roboter langsamer.
- Historisch v31: Gebäudeproduktion hatte Vorrang vor Roboterladung; seit v69 ist externe Roboterladung nicht MVP-aktiv.
- Mehrere externe Ladequellen stacken nicht.
- Selbstladung und eine externe Ladequelle können kombiniert werden.

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
- Historisch v35: Produktion hatte Vorrang vor externer Roboterladung; seit v69 ist externe Roboterladung nicht MVP-aktiv und es gibt keine solche Priorisierung.
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

## v64 - RobotStatus-Sensor ergänzt

Basis: gueltiges v63 aus der v58-v63-Quellenkette.

Umgesetzt:

```text
4. sensor.robotStatus und robotStatus ConditionValue ergaenzen
```

Aenderungen:

- `SensorId` enthaelt `sensor.robotStatus`.
- `SensorValueType` enthaelt `robotStatus`.
- `ConditionValue` enthaelt `{ type: "robotStatus"; value: RobotStatus }`.
- `Roboterstatus = Stasis` in sichtbaren Template-Regeln ist technisch als SensorCondition modellierbar.
- Testmatrix um `MVP-V64-001` bis `MVP-V64-003` ergaenzt.



## v65 - fieldType als ActionParameterValue

Basis: gueltiges v64 aus der v58-v64-Quellenkette.

Umgesetzt:

```text
5. fieldType als ActionParameterValue ergänzen
```

Aenderungen:

- `ActionParameterDefinition.type` erlaubt `fieldType`.
- `ActionParameterValue` enthaelt `{ type: "fieldType"; value: FieldTypeQuery }`.
- `ScoutNearbyActionParameters.targetFieldType` ist auf die objektfoermige fieldType-Variante umgestellt.
- `action.scoutNearby` nutzt `targetFieldType: { type: "fieldType", value: "ironOre" }`.
- Testmatrix um `MVP-V65-001` bis `MVP-V65-003` ergaenzt.

## v68

- Punkt 8 umgesetzt: Tick-Reihenfolge auf eine kanonische Fassung reduziert.
- `docs/03-technical/tick-pipeline.md` ist die einzige Quelle fuer die Simulationsreihenfolge.
- `simulation-rules.md` und `implementation-plan.md` verweisen nur noch auf die kanonische Pipeline.
- Neue Tests `MVP-V68-001` bis `MVP-V68-006` ergaenzt.


## v69

Punkt 9 `Akzeptanzkriterium zu externer Roboterladung korrigieren` umgesetzt.

- `acceptance-criteria.md` beschreibt externe Roboterladung nicht mehr als MVP-Prioritaetsfall.
- Externe Roboterladung wird im MVP nicht verarbeitet.
- Es gibt keine Priorisierung zwischen Produktion und externer Roboterladung.
- Gebaeudeenergie beeinflusst ausschliesslich `ProductionTask`-Fortschritt.
- AGENTS.md verweist fuer die Tick-Reihenfolge auf `tick-pipeline.md`.


## v70 - MVP-FUT-005 zur Energie-Topologie aktualisiert

Basis: gueltiges v69 aus der v58-v69-Quellenkette.

Umgesetzt:

```text
10. MVP-FUT-005 zur Energie-Topologie aktualisieren
```

Aenderungen:

- `MVP-FUT-005` beschreibt lokale Energienetze jetzt als Future-System.
- Lokale Energienetze sind nicht MVP-aktiv.
- Lokale Energienetze sind keine offene MVP-Entscheidung mehr.
- Die MVP-Energie-Topologie bleibt der globale Power-Pool.
- `energy-system.md` verweist explizit auf diese Entscheidung.
- Testmatrix um `MVP-V70-001` bis `MVP-V70-003` ergaenzt.


## v71 - Sichtzustands-Übergänge explizit definiert

Basis: gueltiges v70 aus der v58-v70-Quellenkette.

Umgesetzt:

```text
11. Sichtzustands-Übergänge explizit definieren
```

Aenderungen:

- `unknown`, `discovered` und `visible` haben verbindliche Uebergangsregeln.
- Sichtupdate berechnet `currentVisibleFields` aus aktiven Robotern und active+enabled Gebaeuden.
- Felder in aktueller Sicht werden `visible`.
- Zuvor sichtbare oder bekannte Felder ausserhalb aktueller Sicht werden `discovered`.
- Nie sichtbare Felder bleiben `unknown`.
- Iron Ore wird im MVP nur bei `visibility = visible` gerendert.
- Testmatrix um `MVP-V71-001` bis `MVP-V71-006` ergaenzt.


## v72 - ScoreState-Gebäudezähler

Basis: gueltiges v71 aus der v58-v71-Quellenkette.

Umgesetzt:

```text
12. ScoreState oder Ableitungsregel für Gebäudetyp-Zähler ergänzen
```

Aenderungen:

- `ScoreState` wurde um `builtSolarCollectors` und `builtRobotFactories` erweitert.
- `builtBuildings` bleibt als Aggregat erhalten.
- Verbindliche Invariante: `builtBuildings = builtSolarCollectors + builtRobotFactories`.
- Solar Collectors und Roboterfabriken zählen erst beim ersten erfolgreichen Wechsel von `construction` zu `active`.
- Ergebnisübersicht und UI-Vertrag können getrennte Gebäudezähler direkt aus `ScoreState` anzeigen.
- Testmatrix um `MVP-V72-001` bis `MVP-V72-005` ergaenzt.

## v75 - idle als abgeleiteten UI-/Diagnosezustand definiert

Basis: gueltiges v74 aus der v58-v74-Quellenkette.

Umgesetzt:

```text
15. idle als abgeleiteten UI-/Diagnosezustand statt RobotStatus definieren
```

Aenderungen:

- `RobotStatus` enthaelt weiterhin nur `active`, `stasis`, `inactive`, `destroyed`.
- `RobotActivityState` wurde als abgeleiteter UI-/Diagnosezustand ergänzt.
- `idle` ist nur `RobotActivityState`, nicht `RobotStatus`.
- Wenn kein Programm ausfuehrbar ist, bleibt `robot.status = active`.
- Die Simulation schreibt nie `idle` in `robot.status`.
- UI und Debug-Diagnose zeigen `idle` als Aktivitaet/Diagnosezustand.
- Testmatrix um `MVP-V75-001` bis `MVP-V75-005` ergaenzt.

## v77 - BuildingQuery / Gebäude-mit-Status-Condition ergänzt

Basis: gueltiges v76 aus der v58-v76-Quellenkette.

Umgesetzt:

```text
17. BuildingQuery / Gebäude-mit-Status-Condition ergänzen
```

Aenderungen:

- `BuildingQuery` wurde als kanonischer Query-Typ ergänzt.
- `ConditionValue` unterstützt `buildingQuery`.
- Sichtbare Bedingungen mit Gebäudetyp und Status nutzen `sensor.buildingExists` plus `BuildingQuery`.
- `Gebäude existiert X mit Status Y` prüft Gebäudetyp und Status gemeinsam.
- `Gebäude oder Baustelle existiert X` nutzt `BuildingQuery` ohne `status`.
- Testmatrix um `MVP-V77-001` bis `MVP-V77-005` ergänzt.


## v79 - CommandResult / CommandRejectionReason fuer alle PlayerCommands

Basis: gueltiges v78 aus der v58-v78-Quellenkette.

Umgesetzt:

```text
19. CommandResult/CommandRejectionReason fuer alle PlayerCommands erweitern
```

Aenderungen:

- `CommandResult` gilt fuer alle `PlayerCommand`-Varianten.
- `CommandRejectionReason` wurde um Runtime-, Selection-, Program- und Reset-Gruende erweitert.
- Produktions-RejectionReasons fuer `startIronMinerProduction` bleiben erhalten.
- Neues Dokument `docs/03-technical/player-command-handling.md` beschreibt die Command-Matrix.
- Andere Dokumente definieren `CommandResult` und `CommandRejectionReason` nicht erneut als TypeScript-Typen.
- `rejected` Commands mutieren keinen spielrelevanten State.
- Testmatrix um `MVP-V79-001` bis `MVP-V79-007` ergänzt.


## v80

- `updateProgram`-Validierung präzisiert.
- Template-Edit-Policy für MVP-Starttemplates ergänzt.
- Unveränderliche Strukturfelder, freigegebene Parameter und RejectionReasons dokumentiert.
- Tests `MVP-V80-001` bis `MVP-V80-007` ergänzt.


## v83 - continueConstruction-Reservierung technisch präzisiert

Basis: gueltiges v82 aus der v58-v82-Quellenkette.

Umgesetzt:

```text
23. continueConstruction-Reservierung technisch präzisieren
```

Aenderungen:

- Bestehende Baustellen erhalten kein eigenes Reservation-Feld am Building.
- `continueConstruction` erzeugt keine neue `reservedForConstruction`-Feldstruktur.
- Eine Baustelle gilt als reserviert, wenn ein laufender `BuildingTask` dieselbe `buildingId` nutzt.
- Im MVP darf höchstens ein laufender `BuildingTask` pro `buildingId` existieren.
- Ein zweiter Roboter erhält `constructionAlreadyReserved`, wenn ein anderer Roboter dieselbe Baustelle baut.
- Beim Abschluss oder Abbruch des BuildingTask ist die Baustellen-Reservierung automatisch frei.
- Testmatrix um `MVP-V83-001` bis `MVP-V83-005` ergänzt.

## v85 - README/Archiv-Hinweise bereinigt

Basis: gueltiges v84 aus der v58-v84-Quellenkette.

Umgesetzt:

```text
25. README/Archiv-Hinweise bereinigen
```

Aenderungen:

- README.md ist jetzt ein kompakter aktueller Einstieg und keine lange Versionshistorie mehr.
- Alte README-Historie aus v84 wurde nach `docs/archive/readme-history-v84.md` verschoben.
- `docs/archive/README.md` beschreibt die Archiv-Regel explizit.
- AGENTS.md wurde auf aktive Quellen, MVP-Regeln und klare Archiv-Ausschlussregeln reduziert.
- `docs/archive/**` ist nicht implementierungsverbindlich und darf nur zur Historienpruefung genutzt werden.
- Testmatrix um `MVP-V85-001` bis `MVP-V85-004` ergaenzt.



## v86 - MVP_MAP_CONFIG Property-Deduplizierung

Basis: gueltiges v85 aus der v58-v85-Quellenkette.

Umgesetzt:

```text
26. doppeltes maxNearestIronOreDistance in MVP_MAP_CONFIG entfernen
```

Aenderungen:

- `MVP_MAP_CONFIG` wurde gegen doppelte Property-Eintraege geprueft.
- `maxNearestIronOreDistance` ist im kanonischen Config-Objekt genau einmal mit dem Wert `6` definiert.
- Eine Konsistenzregel wurde im kanonischen Datenmodell ergaenzt.
- Testmatrix um `MVP-V86-001` bis `MVP-V86-003` ergaenzt.
- Keine Spielmechanik geaendert.

## v87 - GameEventCode kanonisch ins Datenmodell aufgenommen

Basis: gueltiges v86 aus der v58-v86-Quellenkette.

Umgesetzt:

```text
27. GameEventCode kanonisch ins Datenmodell aufnehmen
```

Aenderungen:

- `GameEventCode` ist jetzt als kanonische TypeScript-Union in `docs/03-technical/canonical-data-model.md` definiert.
- `docs/03-technical/diagnostics-and-eventlog.md` beschreibt Event-Codes nur noch fachlich und fuehrt keine eigene konkurrierende TypeScript-Union mehr.
- Asset-Debug-Codes `debug.asset.fallbackUsed` und `debug.asset.missingFallback` sind Teil der kanonischen Union.
- Testmatrix um `MVP-V87-001` bis `MVP-V87-004` ergaenzt.
- Keine Spielmechanik geaendert.


## v88 - action.charge aus MVP ActionDefinitions entfernt

Basis: gueltiges v87 aus der v58-v87-Quellenkette.

Umgesetzt:

```text
28. action.charge aus MVP ActionDefinitions entfernen
```

Aenderungen:

- `action.charge` bleibt als Future/Advanced-ActionId vorbereitet.
- `action.charge` ist keine aktive MVP-ActionDefinition mehr.
- `action.charge` wird im MVP-ProgramEditor nicht als auswaehlbare Aktion angeboten.
- Aktive MVP-ActionDefinitions sind nur `action.scoutNearby`, `action.mineResource`, `action.buildBuilding` und `action.stasisCharge`.
- Testmatrix um `MVP-V88-001` bis `MVP-V88-004` ergaenzt.
- Keine Spielmechanik geaendert.

## v89 - Build-Blocked-Event fuer constructionAlreadyReserved

Basis: gueltiges v88 aus der v58-v88-Quellenkette.

Umgesetzt:

```text
29. Build-Blocked-Event fuer constructionAlreadyReserved ergaenzen
```

Aenderungen:

- `action.build.blocked.constructionAlreadyReserved` wurde als kanonischer `GameEventCode` ergaenzt.
- `constructionAlreadyReserved` ist jetzt nicht nur ein `ActionNotExecutableReason`, sondern eindeutig auf einen stabilen Event-/Diagnosecode gemappt.
- Verbindliche Details fuer den Blocker wurden definiert: `reason`, `mode`, `buildingType`, `buildingId`, `reservedByRobotId`.
- Testmatrix um `MVP-V89-001` bis `MVP-V89-004` ergaenzt.
- Keine Spielmechanik geaendert.

## v91 - AssetRegistry und resolveAssetDetailed praezisiert

Basis: gueltiges v90 aus der v58-v90-Quellenkette.

Umgesetzt:

```text
31. AssetRegistry und resolveAssetDetailed praezisieren
```

Aenderungen:

- `AssetRegistry` wurde als partielle Registry finaler Assets definiert.
- `FallbackAssetRegistry` wurde als vollstaendige Registry fuer alle MVP-AssetKeys definiert.
- `resolveAsset(...)` ist der render-sichere Pfad und liefert ein `RenderAsset` oder wirft bei fehlendem Fallback einen technischen Fehler.
- `resolveAssetDetailed(...)` ist der Diagnose-/Testpfad und liefert `AssetResolutionResult` mit `final`, `fallback` oder `missingFallback`.
- `missingFallback` ist eindeutig mit `debug.asset.missingFallback` und MVP-Abnahmeblockade verbunden.
- Testmatrix um `MVP-V91-001` bis `MVP-V91-006` ergaenzt.
- Keine Spielmechanik geaendert.