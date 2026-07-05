# Implementierungs-Modulstruktur

## Status

Dieses Dokument ist die kanonische Quelle fuer die Projekt- und Modulstruktur der MVP-Implementierung.

Bei Strukturkonflikten mit `README.md`, `AGENTS.md`, `docs/02-mvp/mvp-and-tech-stack.md`, `docs/02-mvp/implementation-plan.md` oder UI-Systemdokumenten gilt diese Datei. Andere Dokumente duerfen die Struktur zusammenfassen, aber keine konkurrierende Ordner- oder Modulstruktur festlegen.

## Grundregel

```text
Simulation und UI bleiben getrennt.
Simulation ist deterministisch.
React-Komponenten enthalten keine Simulationsregeln.
UI sendet PlayerCommands und rendert abgeleiteten GameState.
Tests pruefen Simulation ohne DOM-/Canvas-Abhaengigkeit.
```

## Kanonische Projektstruktur

```text
package.json
package-lock.json
vite.config.ts
tsconfig.json
index.html

src/
  main.tsx
  App.tsx

  sim/
    constants.ts
    types.ts
    createInitialGame.ts
    tick.ts
    tickPipeline.ts
    commands.ts
    ids.ts
    rng.ts
    map.ts
    pathfinding.ts
    visibility.ts
    energy.ts
    production.ts
    scoring.ts
    events.ts
    assets.ts
    programs.ts
    programEditing.ts
    diagnostics.ts

    actions/
      canExecuteAction.ts
      scoutNearby.ts
      mineResource.ts
      buildBuilding.ts
      stasisCharge.ts

    tasks/
      movementTask.ts
      miningTask.ts
      buildingTask.ts
      stasisChargingTask.ts

  ui/
    GameLayout.tsx
    BottomControlBar.tsx
    MapCanvas.tsx
    MapTileTooltip.tsx
    SelectionPanel.tsx
    RobotPanel.tsx
    BuildingPanel.tsx
    FieldPanel.tsx
    ProgramStackPanel.tsx
    ProgramCard.tsx
    ProgramRowView.tsx
    ProgramEditorPanel.tsx
    ConditionEditor.tsx
    ActionParameterEditor.tsx
    DiagnosticsPanel.tsx
    EventLogPanel.tsx
    ScoreGoalPanel.tsx
    SpeedControls.tsx
    PauseButton.tsx
    ResetRunButton.tsx

  tests/
    sim/
    ui/
```

## Nicht-kanonische Architekturvorschlaege

Die folgenden Varianten sind fuer den MVP ausdruecklich nicht kanonisch. Sie duerfen nicht als parallele Struktur eingefuehrt, nicht als gleichwertige Option beschrieben und nicht in neuen aktiven Dokumenten als Architekturvorschlag wiederholt werden.

```text
src/sim/map/**
src/sim/robot/**
src/sim/programs/**
src/sim/buildings/**
src/sim/production/**
src/sim/energy/**
src/sim/scoring/**
src/sim/log/**
src/sim/assets/**
src/ui/layout/**
src/ui/map/**
src/ui/panels/**
src/ui/programEditor/**
src/ui/controls/**
```

Fachliche Aufteilung erfolgt im MVP ueber flache Simulationsmodule plus `src/sim/actions/**` und `src/sim/tasks/**`. UI-Komponenten liegen im MVP direkt unter `src/ui/`.

Wenn aktive Dokumente historische oder verworfene Architekturvarianten erwaehnen muessen, muessen diese unmittelbar als `nicht kanonisch`, `nicht verwenden` oder `verworfen` markiert sein. Neutrale Formulierungen wie `Alternative`, `Option`, `Variante`, `kann auch` oder `moeglich` sind fuer abweichende Strukturvorschlaege nicht zulaessig.

Zulaessig sind nur:

```text
1. die kanonische Struktur in diesem Dokument
2. kurze Verweise auf dieses Dokument
3. Umsetzungsschritte ohne eigene Ordner-/Modulhierarchie
4. ausdruecklich nicht-kanonisch markierte Negativlisten
```

## Simulationsmodule

```text
constants.ts: Werte aus mvp-constants.md.
types.ts: Re-Exports oder Typbruecke zu den kanonischen TypeScript-Typen aus canonical-data-model.md.
createInitialGame.ts: Startzustand nach initial-game-state.md.
tick.ts: oeffentliche Tick-Funktion, delegiert Reihenfolge an tickPipeline.ts.
tickPipeline.ts: einzige Implementierung der kanonischen Reihenfolge aus tick-pipeline.md.
commands.ts: PlayerCommand-Verarbeitung nach player-command-handling.md.
ids.ts: deterministische Runtime-ID-Erzeugung nach deterministic-id-generation.md.
rng.ts: makeRngInput, fnv1a32Utf8 und createSeededRng nach seeded-rng.md.
map.ts: Map-Erzeugung einschliesslich mvp-default-Referenz nach pathfinding-and-map-generation.md.
pathfinding.ts: BFS, Zielsuche und Distanzregeln.
visibility.ts: Sicht/Fog-of-War.
energy.ts: EnergySnapshot und ProductionTask-Leistungsbedarf.
production.ts: ProductionTask, readyToSpawn und Spawnpruefung.
scoring.ts: Score, MVP-Ziel und goal.mvpReached.
events.ts: Eventlog, Deduplizierung und Sortierung.
assets.ts: AssetRegistry, FallbackAssetRegistry, resolveAsset und resolveAssetDetailed.
programs.ts: ProgramStack-Auswertung, Template-Instanzen und ProgramEvaluationTrace.
programEditing.ts: updateProgram und templatekonforme Editor-Aenderungen.
diagnostics.ts: abgeleitete Diagnoseansichten ohne Simulations-Seiteneffekte.
```

## Action-Module

```text
actions/canExecuteAction.ts: Action-Ausfuehrbarkeitsmatrix und ActionNotExecutableReason.
actions/scoutNearby.ts: Scout-/Explore-Aktion.
actions/mineResource.ts: Mining-Startlogik.
actions/buildBuilding.ts: Build-Target-Auswahl und Build-Startlogik.
actions/stasisCharge.ts: Stasis-Laden als aktive MVP-Ladeaktion.
```

## Task-Module

```text
tasks/movementTask.ts: MovementTask-Fortschritt und Abschluss.
tasks/miningTask.ts: MiningTask-Fortschritt, Abschluss und Abbruch.
tasks/buildingTask.ts: BuildingTask-Fortschritt, Abschluss, Abbruch und Baustellenfreigabe.
tasks/stasisChargingTask.ts: StasisChargingTask-Fortschritt und Ladegrenzen.
```

## UI-Komponenten

```text
GameLayout.tsx: Hauptlayout des Game Screens.
BottomControlBar.tsx: Pause, Speed, Tick, Score, Zielstatus, Seed und Reset.
MapCanvas.tsx: 10x10-Karte mit Unknown/Visible/Fog, Entitaeten und Markern.
MapTileTooltip.tsx: optionale Feldinformationen.
SelectionPanel.tsx: Auswahlrouter fuer Feld, Roboter und Gebaeude.
RobotPanel.tsx: Roboterdetails.
BuildingPanel.tsx: Gebaeudedetails.
FieldPanel.tsx: Felddetails.
ProgramStackPanel.tsx: Programmliste je Roboter.
ProgramCard.tsx: Programmkartenstatus.
ProgramRowView.tsx: Zeilenanzeige.
ProgramEditorPanel.tsx: Formular-/Zeileneditor.
ConditionEditor.tsx: erlaubte IF-Parameter.
ActionParameterEditor.tsx: erlaubte Action-Parameter.
DiagnosticsPanel.tsx: ProgramEvaluationTrace und technische Hinweise.
EventLogPanel.tsx: letzte Spielerereignisse und optionale Debugansicht.
ScoreGoalPanel.tsx: Score und MVP-Zielstatus.
SpeedControls.tsx: Tickrate/Step-Steuerung.
PauseButton.tsx: Pause/Resume.
ResetRunButton.tsx: Reset mit Seed.
```

## Abhaengigkeitsrichtung

```text
src/ui/** darf aus src/sim/** importieren.
src/sim/** darf nicht aus src/ui/** importieren.
src/sim/** darf keine React-, DOM- oder Canvas-Abhaengigkeit haben.
src/sim/tickPipeline.ts darf die Tick-Reihenfolge nicht aus UI-State ableiten.
Asset-Rendering wird ueber AssetKeys und resolveAsset/resolveAssetDetailed entkoppelt.
```

## Tests

Tests sollen nach Test-IDs aus `docs/02-mvp/mvp-test-matrix.md` organisiert werden. Die Dateinamen duerfen fachlich gruppieren, muessen aber die Test-ID im Testnamen oder in der Testbeschreibung enthalten.

Beispiele:

```text
MVP-INIT-001 -> createInitialGame.test.ts
MVP-ACTION-002 -> canExecuteAction.test.ts
MVP-PROD-006 -> production.test.ts
MVP-DOC-006 -> documentation-structure.test.ts
```
