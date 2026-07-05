# Roboter-Logikspiel Konzept - Zwischenstand

## Dokumentationsstand

Dieses Paket ist Version v109. Es setzt die nach der ausführlichen Konsistenzprüfung von v108 beschlossenen Korrekturen um.

Umgesetzt wurde:

```text
1. Initiales GameEvent vereinheitlichen.
2. Eventdetails fuer production.ironMiner.blocked.notEnoughOre angleichen.
3. Ore-Distanzregel fachlich beibehalten und korrekt benennen.
4. Ore-Distanzregel in allen betroffenen Dokumenten angleichen.
5. RNG-Smoke-Test-Aufrufreihenfolge klarstellen.
6. Fog-Fallback-AssetKeys vereinheitlichen.
7. Verbleibende chronologische Formulierungen aus aktiven Fach-/Technikdokumenten entfernen.
8. Doppelt ausgeschriebene TypeScript-Typen reduzieren oder als Auszug markieren.
9. Beispiel- und Testdaten gegen kanonische Typen pruefen.
10. Abschliessende Konsistenzpruefung erneut ausfuehren.
```

## Fachliche Entscheidungen

```text
Initialer Landungs-Event:
  id = event.initialLanding
  code = system.initialLanding
  visibility = player
  severity = info
  priority = normal
  category = system

Ore-Mangel-Eventdetails:
  requiredOre
  availableOre

Ore-Distanzregel:
  kein Ore im initial sichtbaren Bereich
  mindestens ein erreichbares Ore-Feld in Distanz 4-6
  keine Mindestdistanzregel fuer jedes Ore-Feld ausserhalb der initial sichtbaren Zone

Fog-Fallbacks:
  fog.unknown fuer Field.visibility = unknown
  fog.discovered fuer Field.visibility = discovered
  kein fog.visible; sichtbare Felder erhalten kein Fog-Overlay
```

## Weiterhin gueltige Quelleigentuemer

```text
Dokumentationsregeln / Quellenprioritaet: docs/00-documentation-guideline.md
MVP-Umfang / Tech-Stack: docs/02-mvp/mvp-and-tech-stack.md
Projekt-/Modulstruktur: docs/03-technical/implementation-module-structure.md
Initialer GameState: docs/02-mvp/initial-game-state.md
Test-IDs / Testprioritaet / Teststatus: docs/02-mvp/mvp-test-matrix.md
Datenmodell / Enums / State-Felder: docs/03-technical/canonical-data-model.md
Diagnose- und Eventlog-Fachregeln: docs/03-technical/diagnostics-and-eventlog.md
Event-/Reason-/Command-Rejection-Mapping: docs/03-technical/diagnostics-and-eventlog.md
Tick-Reihenfolge: docs/03-technical/tick-pipeline.md
Cross-System-Simulation: docs/03-technical/simulation-rules.md
Seeded RNG: docs/03-technical/seeded-rng.md
Map-Generierung und mvp-default-Referenzwerte: docs/03-technical/pathfinding-and-map-generation.md
Systemverhalten: jeweiliges docs/04-systems/**-Dokument, soweit nicht durch 03-technical ueberschrieben
Assets: docs/05-assets/asset-fallbacks.md und docs/05-assets/asset-inventory.md
```

## Keine Gameplay-Aenderung

v109 aendert keine Siegbedingung, keine Produktionskosten, keine Produktionsdauer, keine Tick-Reihenfolge, keine RNG-Regel, keine Build-Regel und keine UI-Fachregel. Geaendert wurden Dokumentationskonsistenz, Beispielobjekte, Feldnamen in Eventdetails, Benennung der Ore-Distanzregel sowie Fog-AssetKey-Verwendung.
