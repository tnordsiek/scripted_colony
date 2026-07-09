# Roboter-Logikspiel

## Game

Scripted Colony is a browser-based automation and survival strategy prototype
about building up a robotic outpost through indirect control. Instead of
micromanaging units directly, the player edits simple visual behavior templates
and lets robots explore, mine, build, recharge, research, and transport
resources on their own.

The core appeal of the project is that control happens through program design:
you shape robot behavior, priorities, and recovery logic, then watch the system
execute those decisions autonomously. A playable version is available on GitHub
Pages: https://tnordsiek.github.io/scripted_colony/

## Motivation

"This is a small educational and hobby project that combines the enjoyable and interesting with the practical."

The goal is to develop a self-created game idea into a concept that is as
thought-through as possible, while also shaping it in a way that allows a first
playable prototype to be built quickly and iterated on in practice.

## Technology

The project is built with TypeScript, React, and Vite, with Vitest used for
automated verification. This stack supports fast iteration on UI and gameplay
logic, keeps the deterministic simulation manageable in a typed codebase, and
fits the project's static browser deployment model via GitHub Pages.

## Aktueller Stand

Dieses Paket ist Version v112. Es basiert auf v111 und definiert Expansion 2
(Logistik + Ladenetz) in `docs/02-mvp/expansion-2-scope.md`. Zuvor definierte
v111 Expansion 1 (Forschung + Tier-2-Einstieg). MVP, Expansion 1 und
Expansion 2 sind implementiert; das Projekt wird ueber GitHub Pages deployt.
Wiedereinstieg und Umsetzungsstand stehen in `IMPLEMENTATION-STATUS.md`.

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

## Setup und Kurzregeln

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

Fuer die konkrete Umsetzung gelten die aktiven Fach- und Technikdokumente in
`docs/**`. Insbesondere liegen Scope, Datenmodell, Tick-Regeln,
Simulationsregeln, Systemverhalten und Quellenprioritaet in den dort benannten
Quelleigentuemer-Dokumenten. `README.md` dient nur als Einstieg und
Zusammenfassung.

## Wichtige Einstiegspunkte

```text
AGENTS.md
IMPLEMENTATION-STATUS.md
docs/00-documentation-guideline.md
docs/02-mvp/mvp-and-tech-stack.md
docs/02-mvp/expansion-1-scope.md
docs/02-mvp/expansion-2-scope.md
docs/02-mvp/acceptance-criteria.md
docs/02-mvp/mvp-test-matrix.md
docs/02-mvp/initial-game-state.md
docs/03-technical/canonical-data-model.md
docs/03-technical/tick-pipeline.md
docs/03-technical/simulation-rules.md
docs/03-technical/implementation-module-structure.md
docs/03-technical/pathfinding-and-map-generation.md
docs/03-technical/seeded-rng.md
docs/03-technical/diagnostics-and-eventlog.md
docs/05-assets/asset-fallbacks.md
```

## Archiv- und Quellenhinweis

```text
docs/archive/** ist nur Historie.
CHANGELOG.md ist nur Historie und Versionsnotiz.
Aktive Regeln stehen in docs/00-documentation-guideline.md, docs/02-mvp/**, docs/03-technical/**, docs/04-systems/**, docs/05-assets/** und docs/06-reference/**.
```

## Development

Code powered by Codex & Claude

Graphics powered by Nano Banana

Concept and AI Direction by fnord GAMES (2026)
