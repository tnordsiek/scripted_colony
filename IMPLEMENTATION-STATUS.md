# Implementierungsstatus MVP

Wiedereinstieg fuer neue Sessions: AGENTS.md lesen, dann diese Datei, dann `git log --oneline`.
Objektiver Fortschritt: `npm test -- --run` (P0-Tests aus docs/02-mvp/mvp-test-matrix.md).
Vorgehensregel: pro Arbeitspaket erst Modul, dann Tests gruen, dann diese Datei aktualisieren und committen.

## Arbeitspakete (Reihenfolge aus docs/02-mvp/implementation-plan.md)

| # | Paket | Status |
|---|---|---|
| 1 | Projektgrundlage (Vite/React/TS/Vitest) | in Arbeit |
| 2 | Datenmodell (types.ts, constants.ts) | offen |
| 3 | Map-Generierung (seeded RNG, Fairness, Referenzwerte) | offen |
| 4 | Sicht/Fog | offen |
| 5 | Tick-System (Pipeline, Pause/Speed, Eventlog) | offen |
| 6 | Bewegung & Pfadfindung | offen |
| 7 | Programmstack (Templates, Auswertung, updateProgram) | offen |
| 8 | Energie (Stasis, Power-Pool) | offen |
| 9 | Mining | offen |
| 10 | Bau | offen |
| 11 | Produktion & Spawn | offen |
| 12 | Canvas-Rendering | offen |
| 13 | UI-MVP (Panels, Editor, Steuerleiste) | offen |
| 14 | Tests (alle P0 gruen) | offen |
| 15 | Polishing | offen |
| 16 | GitHub-Pages-Deployment (Workflow-Datei) | offen |

## Naechster Schritt

Paket 1: package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx anlegen; npm install; Erst-Commit.

## Offene Punkte / Abweichungen

- Repo war kein Git-Repo; git init erfolgt in Paket 1.
- Deployment-Aktivierung (GitHub-Remote, Pages) macht der Nutzer spaeter; Workflow wird nur als Datei angelegt.
