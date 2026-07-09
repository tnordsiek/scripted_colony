# AGENTS.md

Geltungsbereich: gesamtes Repository.

Diese Arbeitsvereinbarung gilt fuer KI-Agenten in diesem Projekt. Arbeite
pragmatisch, praezise, minimal-invasiv und testorientiert. Bevorzuge kleine,
gezielte Aenderungen, die den bestehenden fachlichen und technischen Regeln
folgen.

## Aktuelle Basis

Arbeite auf Basis von Paket v112. v112 basiert auf v111 und definiert Expansion 2 (Logistik + Ladenetz) in `docs/02-mvp/expansion-2-scope.md`; Expansion 1 (Forschung + Tier-2-Einstieg) steht in `docs/02-mvp/expansion-1-scope.md`. Das MVP ist implementiert; Implementierungsstand und Wiedereinstieg stehen in `IMPLEMENTATION-STATUS.md`.

Kurzfassung:

```text
1. docs/archive/** nie als aktive Regelquelle verwenden.
2. CHANGELOG.md nur als Historie verwenden, nicht als Detailregelquelle.
3. Dateiverweise aus aktiven Dokumenten muessen auf existierende Dateien zeigen; relative Pfade werden vom verweisenden Dokument aus aufgeloest.
4. Aktive Markdown-Dateien muessen geschlossene Codebloecke haben; Prosa steht ausserhalb von TypeScript-Codebloecken.
5. Vollstaendige kanonische TypeScript-Typdefinitionen stehen in docs/03-technical/canonical-data-model.md.
6. Beispiele muessen zu den kanonischen Typen passen oder klar als Auszug markiert sein.
7. Fuer Projekt-/Modulstruktur docs/03-technical/implementation-module-structure.md verwenden.
8. Fuer Event-/Reason-/Command-Rejection-Mapping docs/03-technical/diagnostics-and-eventlog.md verwenden.
9. Quelleigentuemer aus docs/00-documentation-guideline.md verwenden.
10. Spezifische technische Quelle schlaegt allgemeine Zusammenfassung.
11. README.md, AGENTS.md, MANIFEST.md, CHANGELOG.md und Konzept-Zwischenstand sind keine Detailregelquellen gegenueber Fach- und Technikdokumenten.
```

Wichtige aktuelle Korrekturen:

```text
Batterie-Einheit: absolute Punkte, batteryMax = 100; kanonisch in docs/04-systems/units-and-energy.md
Batteriebedingungen in Regeltexten ohne Prozentzeichen: Batterie <= 1, Batterie >= 50, -1 Batterie
Roboterbatterie-Quellen: units-and-energy.md (Werte/Verbrauch), robot-battery-and-charging.md (Stasis-Laden)
Score-Konstanten gespiegelt in docs/03-technical/mvp-constants.md; Regelquelle scoring-and-win-conditions.md
Tie-Breaks seeded deterministic nach docs/03-technical/seeded-rng.md (scoutTarget, mineAdjacentOre, buildSite, spawnSite)
Initialer Landungs-Event: id = event.initialLanding, code = system.initialLanding
Ore-Mangel-Eventdetails: requiredOre und availableOre
Fog-Fallbacks: fog.unknown und fog.discovered; visible hat kein Fog-Overlay
```

## Mission

Arbeite auf dem implementierten Stand von MVP + Expansion 1 + Expansion 2. Nutze
die aktiven Scope-Dokumente und technischen Quellen als Regelbasis; die
Langfristvision bleibt Kontext und aktiviert keine weiteren Future-Systeme ohne
ausdrueckliche Freigabe durch aktive Dokumente.

## Arbeitsprinzipien

- Vor Aenderungen relevante Fachdoku, Technikdoku, Code und bestehende Tests lesen.
- Bestehende Architektur, Benennung, Patterns und Teststruktur respektieren.
- Kleine, reviewbare Aenderungen bevorzugen; keine unrelated Refactors.
- Kein undokumentiertes Aendern von Verhalten.
- Tests nicht abschwaechen oder loeschen, ausser sie sind nachweislich falsch oder obsolet.
- Keine unnoetigen Dependencies einfuehren.
- Keine Debug-Ausgaben, Logs, Temp-Dateien oder generierten Artefakte einchecken.
- Oeffentliche APIs nur aendern, wenn fachlich noetig und durch Tests abgesichert.
- Lockfiles und generierte Dateien nur aendern, wenn es fuer die Aufgabe wirklich noetig ist.
- Wenn Tests nicht ausgefuehrt werden koennen: genauen Befehl, Fehlergrund und Restrisiko dokumentieren.

## Primaere Quellen

Diese Liste ist die wichtigste Arbeitsliste fuer den aktuellen implementierten
Stand (MVP + Expansion 1 + Expansion 2). Fuer Konflikte und weitere
Quelleigentuemer gilt die Quellenprioritaet in
`docs/00-documentation-guideline.md`.

1. `docs/00-documentation-guideline.md`
2. `docs/02-mvp/mvp-and-tech-stack.md` (MVP)
3. `docs/02-mvp/expansion-1-scope.md` (Expansion 1)
4. `docs/02-mvp/expansion-2-scope.md` (Expansion 2)
5. `docs/02-mvp/implementation-plan.md`
6. `docs/02-mvp/acceptance-criteria.md`
7. `docs/02-mvp/mvp-test-matrix.md`
8. `docs/02-mvp/initial-game-state.md`
9. `docs/03-technical/canonical-data-model.md`
10. `docs/03-technical/tick-pipeline.md`
11. `docs/03-technical/simulation-rules.md`
12. `docs/03-technical/program-stack-rules.md`
13. `docs/03-technical/pathfinding-and-map-generation.md`
14. `docs/03-technical/player-command-handling.md`
15. `docs/03-technical/deterministic-id-generation.md`
16. `docs/03-technical/seeded-rng.md`
17. `docs/03-technical/robot-task-lifecycle.md`
18. `docs/03-technical/robot-task-payloads.md`
19. `docs/03-technical/implementation-module-structure.md`
20. `docs/03-technical/diagnostics-and-eventlog.md`

## Kontextquellen

```text
docs/01-product/**
docs/04-systems/**
docs/05-assets/**
docs/05-future/**
docs/06-reference/**
```

## Nicht verwenden

```text
docs/archive/** als aktive Regelquelle
CHANGELOG.md als aktive Detailregelquelle
alte oder externe Versionen ohne ausdrueckliche Freigabe
pnpm, yarn, bun
Node.js ausserhalb 22.x
nicht-kanonische Projektstrukturvarianten
Math.random fuer spielrelevanten Zufall
Date.now oder crypto.randomUUID fuer deterministische Runtime-IDs
```

## Umgang mit Unklarheiten

1. Zuerst bestehende Tests pruefen.
2. Dann die erkennbare Intention im bestehenden Code pruefen.
3. Dann operative oder technische Dokumente heranziehen, wenn sie den aktuellen Ablauf klarer machen.
4. Wenn die Antwort klar ist, konsistent zum Bestand umsetzen.
5. Wenn sie nicht klar ist, die konkrete Unklarheit als Blocker benennen statt Anforderungen zu erfinden.

## Prioritaet

Korrektheit zur Anforderung > Konsistenz mit getroffenen Entscheidungen >
Testbarkeit > Stabilitaet > Wartbarkeit
