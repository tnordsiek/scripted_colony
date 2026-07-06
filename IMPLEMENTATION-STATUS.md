# Implementierungsstatus MVP

Wiedereinstieg fuer neue Sessions: AGENTS.md lesen, dann diese Datei, dann `git log --oneline`.
Objektiver Fortschritt: `npm test -- --run` (P0-Tests aus docs/02-mvp/mvp-test-matrix.md).
Vorgehensregel: pro Arbeitspaket erst Modul, dann Tests gruen, dann diese Datei aktualisieren und committen.

## Arbeitspakete (Reihenfolge aus docs/02-mvp/implementation-plan.md)

| # | Paket | Status |
|---|---|---|
| 1 | Projektgrundlage (Vite/React/TS/Vitest) | fertig |
| 2 | Datenmodell (types.ts, constants.ts, rng.ts, ids.ts) | fertig |
| 3 | Map-Generierung (seeded RNG, Fairness, Referenzwerte) | fertig |
| 4 | Sicht/Fog | fertig |
| 5 | Tick-System (Pipeline, Pause/Speed, Eventlog) | fertig |
| 6 | Bewegung & Pfadfindung | fertig |
| 7 | Programmstack (Templates, Auswertung, updateProgram) | fertig |
| 8 | Energie (Stasis, Power-Pool) | fertig |
| 9 | Mining | fertig |
| 10 | Bau | fertig |
| 11 | Produktion & Spawn | fertig |
| 12 | Canvas-Rendering | offen |
| 13 | UI-MVP (Panels, Editor, Steuerleiste) | offen |
| 14 | Tests (alle P0 gruen) | offen |
| 15 | Polishing | offen |
| 16 | GitHub-Pages-Deployment (Workflow-Datei) | offen |

## Naechster Schritt

Paket 12+13: Canvas-Rendering (MapCanvas mit Fallbacks) und UI-MVP (Panels, Editor, Steuerleiste) in src/ui/ nach docs/04-systems/ui-components-contract.md.

## Zwischenstand Simulation

Der komplette Sim-Kern ist funktionsfaehig: End-to-End-Test spielt einen ganzen Run
(Erkunden -> Mining -> Solar Collector -> Roboterfabrik -> Produktion -> Iron-Miner-Spawn
-> goal.mvpReached) deterministisch durch. 107 Tests gruen (npm test -- --run).

## Offene Punkte / Abweichungen

- Repo war kein Git-Repo; git init erfolgt in Paket 1.
- Deployment-Aktivierung (GitHub-Remote, Pages) macht der Nutzer spaeter; Workflow wird nur als Datei angelegt.
