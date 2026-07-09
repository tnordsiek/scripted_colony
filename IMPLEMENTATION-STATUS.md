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
| 2 | GitHub-Deployment (Push + Pages via Actions) | fertig — live: https://tnordsiek.github.io/scripted_colony/ |
| 3 | Doku-Inkrement v111: Expansion 1 Scope (Forschung + Tier-2-Einstieg) | fertig |
| 4 | Implementierung Expansion 1 (research.ts, Stahlwerk, Energiespeicher, Template-Bibliothek, ResearchPanel, EXP1-Tests) | fertig — 143 Tests gruen inkl. EXP1-E2E |

## Expansion 2 (Logistik + Ladenetz, Plan genehmigt)

| # | Paket | Status |
|---|---|---|
| A | Doku-Inkrement v112 (expansion-2-scope, kanonische Deltas, Testmatrix EXP2) | fertig |
| B | Sim (logistics.ts, charging, Gridline, Inventare, Transporter, Miner aktiv) | fertig |
| C | Tests inkl. EXP2-E2E (vollautomatische Kette, Determinismus, Livelock-Waechter) | fertig — 157 Tests gruen inkl. EXP2-E2E-003 (3000-Tick-Langlauf) |
| D | UI (LogisticsPanel, Inventare, Canvas), Preview-Verifikation, Deploy | fertig — live gepusht, Preview verifiziert |

Expansion 2 vollstaendig: 157 Tests gruen, UI (LogisticsPanel, Stahlwerk-/Speicher-
Inventare, Transporter-Produktions-Button, TemplateLibrary +2, MapCanvas
Gridline/Speicher/Transporter) live verifiziert (Preview: Kette rendert, Requests
erscheinen, Auto-Modus/Inventare korrekt), CHANGELOG-Nachtrag ergaenzt, gepusht
(deployt automatisch nach https://tnordsiek.github.io/scripted_colony/).

Waehrend Stufe 4 gefundene und behobene Design-Luecken (Doku + Code):
Einschluss-Schutz und Commitment-Regel der Bauplatzwahl
(pathfinding-and-map-generation.md), Template-Einfuegeposition ueber der
Erkundung (expansion-1-scope.md).

Waehrend Expansion 2 (Stufe B/C) gefundene und behobene Design-Luecken (Doku + Code):
- Blockierte MaterialRequests wurden nie neu bewertet (from=undefined blieb haengen)
  -> processLogisticsTick bindet Quellen blockierter Requests am Tick-Anfang neu.
- Transporter blockierte an geparktem Roboter (3-Tick-Abbruchschleife)
  -> Ausweich-Pfad in stepAlongPath (stehende Roboter als Hindernis).
- Spawn-Stack-Prioritaet: rechargeAtGrid stand unten -> Miner mint sich leer und
  strandet ausserhalb der Ladezone. Notfall-Laden jetzt an der Stack-Spitze
  (feuert nur bei Batterie <= 20; Langlauf-Learning EXP2-E2E-003).

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
