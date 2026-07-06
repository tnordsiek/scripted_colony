# Implementierungsstatus MVP

Wiedereinstieg fuer neue Sessions: AGENTS.md lesen, dann diese Datei, dann `git log --oneline`.
Objektiver Fortschritt: `npm test -- --run` (107 Tests, alle gruen).

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
| 12 | Canvas-Rendering | fertig |
| 13 | UI-MVP (Panels, Editor, Steuerleiste) | fertig |
| 14 | Tests | fertig (107 gruen, Kern-P0 abgedeckt) |
| 15 | Polishing | Basis fertig (Tooltips, Eventlog, Statusanzeigen) |
| 16 | GitHub-Pages-Deployment | Workflow-Datei angelegt (.github/workflows/deploy.yml) |

## Verifiziert

- `npm test -- --run`: 107 Tests gruen, inkl. End-to-End-Run bis goal.mvpReached
  und Determinismus-Snapshot-Vergleich.
- Map-Referenzabnahme: MVP_DEFAULT_IRON_ORE_FIELDS exakt, Koordinaten-Signatur
  40375871, Grid-Signatur 317699538, RNG-Smoke-Werte exakt.
- `npm run build` fehlerfrei (dist/ statisch, base /scripted_colony/ in Produktion).
- Live im Browser gespielt (Vite-Dev-Server): Starter erkundet, mined, baut Solar
  Collector und Roboterfabrik autonom; Spieler startet Produktion per Button;
  Iron Miner spawnt (Tick 253, Score 396), Zielbanner erscheint.

## Ausbaustufen nach MVP

| Stufe | Inhalt | Status |
|---|---|---|
| 1 | MVP-Feinschliff (End-Screen, Persistenz, Doku-/P1-Tests) | fertig (126 Tests gruen) |
| 2 | GitHub-Deployment (Push + Pages via Actions) | gepusht; Pages-Verifikation laeuft |
| 3 | Doku-Inkrement v111: Expansion 1 Scope (Forschung + Tier-2-Einstieg) | fertig |
| 4 | Implementierung Expansion 1 (research.ts, Stahlwerk, Energiespeicher, Template-Bibliothek, ResearchPanel, EXP1-Tests) | offen — naechster Schritt |

Expansion-1-Spezifikation: docs/02-mvp/expansion-1-scope.md (Quelleigentuemer),
EXP1-Konstanten in mvp-constants.md, EXP1-Tests in mvp-test-matrix.md.

## Offene Punkte / Naechste Schritte

- Deployment-Aktivierung durch den Nutzer: GitHub-Remote setzen, pushen,
  Pages auf "GitHub Actions" stellen. Vite-base ist auf /scripted_colony/
  gesetzt; bei anderem Repo-Namen vite.config.ts anpassen.
- Optionale Testmatrix-Vervollstaendigung: dokumentbezogene P0-Tests
  (MVP-DOC-*, MVP-V68-Doku-Checks) sind als Markdown-Inhaltstests noch offen;
  alle simulationsbezogenen Kern-P0-Bereiche sind abgedeckt.
- Feinschliff nach Geschmack: finale Bild-Assets (Canvas-Fallbacks decken alles ab),
  weitere UI-Politur.
