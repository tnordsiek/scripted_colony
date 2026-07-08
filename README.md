# Roboter-Logikspiel

## Aktueller Stand

Dieses Paket ist Version v112. Es basiert auf v111 und definiert Expansion 2
(Logistik + Ladenetz) in `docs/02-mvp/expansion-2-scope.md`. Zuvor: v111 definierte Expansion 1
(Forschung + Tier-2-Einstieg). Das MVP ist vollstaendig implementiert (src/, tests/)
und wird ueber GitHub Pages deployt; Wiedereinstieg siehe IMPLEMENTATION-STATUS.md.

Kern von v112:

```text
Neues Scope-Dokument docs/02-mvp/expansion-2-scope.md (Quelleigentuemer Expansion 2)
Aktiviert: MaterialRequest-Engine (supplyBuildingInput, clearBuildingOutput,
moveToStorage), Transportroboter (normale Roboterfabrik, 4 Steel Plates),
Ressourcenspeicher, begehbare Grid Energy Line, Ladenetz (externes Laden an
Energie-Gebaeuden/Gridlines), Stahlwerk-Inventare mit Auto-Modus, Iron Miner aktiv
Datenmodell: ChargingTask + LogisticsTask aktiv, neue Commands/Events/AssetKeys
Testmatrix um EXP2-Serie erweitert; v111 (Expansion 1) bleibt unveraendert gueltig
```

Kurzregel:

```text
Node.js Runtime: 22.x
Node-Range: >=22 <23
Package Manager: npm
Lockfile: package-lock.json
CI-Installation: npm ci
Keine aktiven Alternativen: andere Node-Major-Versionen, pnpm, yarn, bun
Bei Detailkonflikten gewinnt das Dokument, das fuer den betroffenen Themenbereich als Quelleigentuemer definiert ist.
README.md, AGENTS.md, MANIFEST.md, CHANGELOG.md und Konzept-Zwischenstand sind Zusammenfassungs- oder Versionsdokumente und ueberschreiben keine Fach- oder Technikquelle.
```

## Kurzbeschreibung

Das Spiel ist ein Aufbau-/Survival-/Automatisierungsspiel mit indirekter Roboterprogrammierung. Der Spieler steuert Roboter nicht direkt, sondern bearbeitet einfache visuelle Programm-Templates. Die Roboter fuehren diese Logiken autonom aus.

MVP-Ziel:

```text
Der erste Iron Miner muss erfolgreich als Robot-Entity gespawnt worden sein.
```

Nicht ausreichend fuer das MVP-Ziel:

```text
Produktionsauftrag akzeptiert
Produktionskosten bezahlt
ProductionTask fertig
ProductionTask readyToSpawn
ProductionTask spawnBlocked
```

## Kanonischer MVP-Stand

```text
Startposition: { x: 5, y: 5 }
Startroboter: starterRobot, Batterie 100/100, Cargo leer
Karte: 10x10, 0-basierte Koordinaten, map[y][x]
Map-Regel: kein Ore im initial sichtbaren Bereich; mindestens ein erreichbares Ore-Feld in Distanz 4-6
Aktive Ressource: Iron Ore
Aktive Gebaeude: Solar Collector, Roboterfabrik
Solar Collector: 50 Leistung
Energie: globaler MVP-Power-Pool nur fuer ProductionTasks
Externe Roboterladung: Future, nicht MVP-aktiv
Stasis-Laden: einzige aktive MVP-Roboterladung
Gebaeudesicht: active + enabled Gebaeude haben Sichtweite 2
Tick-Pipeline: docs/03-technical/tick-pipeline.md ist kanonisch
RobotTask: diskriminierte Union aus MovementTask, MiningTask, BuildingTask, StasisChargingTask
Build-Modi: newConstruction und continueConstruction
Build-Events: details.mode ist fuer Build-Target/Start/Completion verbindlich
GameEventCode: kanonisch im Datenmodell definiert
action.charge: Future/Advanced, keine aktive MVP-ActionDefinition
Build-Blocked-Event: constructionAlreadyReserved -> action.build.blocked.constructionAlreadyReserved
Event-Sequenz: pipelineStepOrder -> sourceOrder -> entitySortKey -> eventCodeOrder -> localSequence
Event-ID-Muster: event.<tick6>.<seq3>.<code>
Initial-Event: id event.initialLanding, code system.initialLanding
Seeded RNG: FNV-1a 32-bit ueber UTF-8 + Mulberry32 nach docs/03-technical/seeded-rng.md
mvp-default-Map: Referenzwerte in docs/03-technical/pathfinding-and-map-generation.md
ProductionTask-Timing: Start in Tick N, erster Fortschritt oder Pauseeffekt fruehestens Tick N+1
Quellenprioritaet: docs/00-documentation-guideline.md bestimmt Quelleigentuemer je Themenbereich
Dateiverweise: relative Pfade muessen relativ zur verweisenden Markdown-Datei aufloesen
Tooling: Node.js 22.x, npm, package-lock.json, npm ci
Projekt-/Modulstruktur: docs/03-technical/implementation-module-structure.md ist kanonisch; abweichende Architekturvorschlaege sind nicht zu verwenden
Event-/Reason-/Command-Rejection-Mapping: docs/03-technical/diagnostics-and-eventlog.md
Markdown-/Codeblock-Hygiene: alle aktiven Markdown-Dateien haben geschlossene Codebloecke; Prosa steht ausserhalb von TypeScript-Codebloecken
Generische Command-Ablehnung: debug.command.rejected; Ore-Mangel bei Produktion: production.ironMiner.blocked.notEnoughOre mit requiredOre/availableOre
Initial-State-Quelle: docs/02-mvp/initial-game-state.md
Assets: AssetRegistry partiell, FallbackAssetRegistry vollstaendig, resolveAsset/render-sicher, resolveAssetDetailed/diagnostisch; Fog-Assets: fog.unknown und fog.discovered
Batterie-Einheit: absolute Punkte, batteryMax = 100 fuer alle MVP-Robotertypen; kanonisch in docs/04-systems/units-and-energy.md
Score-Werte: +1 Ore, +25 Solar Collector, +50 Roboterfabrik, +100 Spawn, +200 Zielbonus; Regelquelle docs/04-systems/scoring-and-win-conditions.md
Tie-Breaks: seeded deterministic nach docs/03-technical/seeded-rng.md (scoutTarget, mineAdjacentOre, buildSite, spawnSite)
Expansion-1-Umfang: docs/02-mvp/expansion-1-scope.md ist kanonisch
```

## Wichtige Einstiegspunkte

```text
AGENTS.md
MANIFEST.md
docs/00-documentation-guideline.md
docs/02-mvp/mvp-and-tech-stack.md
docs/02-mvp/implementation-plan.md
docs/02-mvp/acceptance-criteria.md
docs/02-mvp/mvp-test-matrix.md
docs/02-mvp/initial-game-state.md
docs/03-technical/canonical-data-model.md
docs/03-technical/tick-pipeline.md
docs/03-technical/simulation-rules.md
docs/03-technical/pathfinding-and-map-generation.md
docs/03-technical/seeded-rng.md
docs/03-technical/diagnostics-and-eventlog.md
docs/05-assets/asset-fallbacks.md
```

## Archivregel

```text
docs/archive/** ist nur Historie.
CHANGELOG.md ist nur Historie und Versionsnotiz.
Aktive Regeln stehen in docs/00-documentation-guideline.md, docs/02-mvp/**, docs/03-technical/**, docs/04-systems/**, docs/05-assets/** und docs/06-reference/**.
```
