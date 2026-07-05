# Roboter-Logikspiel Gesamtpaket

## Zweck dieser Version

Dieses Paket ist Version v110. Es basiert auf v109 und setzt die beschlossenen Konsistenzkorrekturen aus der inhaltlichen Prüfung von v109 um.

## Änderung dieser Version

```text
Batterie-Einheit kanonisch als absolute Batteriepunkte definiert
Prozentschreibweisen fuer Batteriewerte in aktiven MVP-Regeltexten auf Punkte umgestellt
Quellenabgrenzung units-and-energy.md vs. robot-battery-and-charging.md dokumentiert
Quelleigentuemer-Tabelle um Roboterbatterie-Themenbereiche erweitert
Score-Konstanten in mvp-constants.md gespiegelt
Spawnfeld-Tie-Break-Verweis in simulation-rules.md ergaenzt
Iron-Miner-Spawnwerte-Abgrenzung in initial-game-state.md ergaenzt
Testmatrix-Eintraege MVP-DOC-009/010 nachgetragen und MVP-DOC-011 ergaenzt
v109-Berichtsdateien nach docs/archive verschoben
```

## Nicht geändert

Keine Siegbedingung, Produktionskosten, Produktionsdauer, Tick-Reihenfolge, RNG-Algorithmus, Build-Regel oder UI-Fachregel wurden geändert. Die Batteriewerte sind numerisch identisch geblieben (batteryMax = 100).

## Quellenpriorität und Archivregel

```text
docs/00-documentation-guideline.md definiert die Quellenprioritaet aktiver Dokumente.
docs/03-technical/canonical-data-model.md ist kanonische TypeScript-Typquelle.
docs/03-technical/diagnostics-and-eventlog.md ist Quelleigentuemer fuer Event-, Reason- und Command-Rejection-Mapping.
docs/archive/** ist nur Historie.
CHANGELOG.md ist nur Versionshistorie.
Archivdateien sind nicht implementierungsverbindlich.
Bei Konflikten zwischen aktiven Dokumenten gilt der Quelleigentuemer je Themenbereich.
```

## Paketinhalt

```text
AGENTS.md
CHANGELOG.md
MANIFEST.md
README.md
docs/00-documentation-guideline.md
docs/01-product/design-pillars.md
docs/01-product/vision-and-core-loop.md
docs/02-mvp/acceptance-criteria.md
docs/02-mvp/implementation-plan.md
docs/02-mvp/initial-game-state.md
docs/02-mvp/mvp-and-tech-stack.md
docs/02-mvp/mvp-template-spec.md
docs/02-mvp/mvp-test-matrix.md
docs/03-technical/action-executability-matrix.md
docs/03-technical/canonical-data-model.md
docs/03-technical/deterministic-id-generation.md
docs/03-technical/diagnostics-and-eventlog.md
docs/03-technical/github-pages-deployment.md
docs/03-technical/implementation-module-structure.md
docs/03-technical/mvp-constants.md
docs/03-technical/pathfinding-and-map-generation.md
docs/03-technical/player-command-handling.md
docs/03-technical/program-stack-rules.md
docs/03-technical/reset-seed-and-persistence.md
docs/03-technical/robot-task-lifecycle.md
docs/03-technical/robot-task-payloads.md
docs/03-technical/seeded-rng.md
docs/03-technical/simulation-rules.md
docs/03-technical/tick-pipeline.md
docs/03-technical/visual-programming-data-model.md
docs/04-systems/buildings-and-construction.md
docs/04-systems/communication-grid.md
docs/04-systems/energy-system.md
docs/04-systems/production-and-spawn.md
docs/04-systems/resources-and-logistics.md
docs/04-systems/robot-battery-and-charging.md
docs/04-systems/robot-types-and-roles.md
docs/04-systems/scoring-and-win-conditions.md
docs/04-systems/ui-components-contract.md
docs/04-systems/units-and-energy.md
docs/04-systems/visual-programming-ui.md
docs/05-assets/asset-fallbacks.md
docs/05-assets/asset-inventory.md
docs/05-future/advanced-program-design.md
docs/05-future/building-and-unit-tiers.md
docs/05-future/combat-and-hazards.md
docs/05-future/logistics-system.md
docs/05-future/research-tree.md
docs/06-reference/assets.md
docs/06-reference/glossary-and-naming.md
docs/archive/README.md
docs/archive/canonical-data-model-consistency-check-v44.md
docs/archive/readme-history-v84.md
docs/archive/roboter_logikspiel_konsistenzbericht_v109.md
docs/archive/roboter_logikspiel_konzept_zwischenstand_v109.md
docs/archive/v21-legacy/game-concept.md
docs/archive/v21-legacy/mvp-implementation-plan.md
docs/archive/v21-legacy/technical-guidelines.md
roboter_logikspiel_konsistenzbericht_v110.md
roboter_logikspiel_konzept_zwischenstand_v110.md
```
