# Konsistenzbericht v111

## Ergebnis

Status: bestanden. Es wurden keine blockierenden Inkonsistenzen in den geprüften Bereichen gefunden.

## Geprüfte Bereiche

- OK: expansion-1-scope.md als Quelleigentuemer in der Guideline-Tabelle eingetragen
- OK: Expansion-1-Kosten kollidieren nicht mit aktiven MVP-Regeln; Future-Werte als Referenz gekennzeichnet
- OK: ResearchState, SteelProductionTask, neue Commands/Reasons/EventCodes/AssetKeys/Template-IDs nur in canonical-data-model.md als TypeScript definiert
- OK: tick-pipeline.md bleibt einzige Quelle der Schrittfolge; Schritt-3-Erweiterung ohne neue Schrittnummerierung
- OK: EXP1-Konstanten nur in mvp-constants.md
- OK: Neue AssetKeys in asset-inventory.md und asset-fallbacks.md mit Fallback-Pflicht
- OK: Testmatrix um EXP1-Serie erweitert; Test-IDs eindeutig
- OK: initialer ResearchState in initial-game-state.md definiert
- OK: Manifest-Dateiliste stimmt mit Paketinhalt ueberein
- OK: Alle Markdown-Codebloecke geschlossen (automatisierter Test MVP-DOC-008)

## Fachliche Kontrollpunkte

- Forschung: 1 Punkt/Tick, 20 Leistung, Timing wie ProductionTasks (startedTick < currentTick sinngemaess: Projektwahl in Tick N wirkt ab N+1).
- Stahlwerk: 2 Iron Ore aus Starter-Cargo beim Start, 1 Steel Plate ins Starter-Cargo bei Abschluss, outputBlocked bei vollem Cargo.
- Energiespeicher: Kapazitaet 200, Laden/Entladen max 50/Tick, deterministisch nach BuildingId.
- Expansion 1 vergibt keinen Score und aendert goal.mvpReached nicht.

## Restbefunde

- Auszug-Dokumente (visual-programming-data-model.md, mvp-template-spec.md) fuehren die
  ProgramTemplateId-Union noch ohne Expansion-1-Templates; kanonisch ist
  canonical-data-model.md, die Auszuege gelten als nicht-kanonische Volltypdefinitionen
  (zulaessig nach Guideline). Bereinigung optional in v112.
