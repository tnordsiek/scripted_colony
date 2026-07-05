# Roboter-Logikspiel Konzept - Zwischenstand

## Dokumentationsstand

Dieses Paket ist Version v110. Es basiert auf v109 und setzt die nach der inhaltlichen Prüfung von v109 beschlossenen Korrekturen um.

Umgesetzt wurde:

```text
1. Batterie-Einheit kanonisch als absolute Batteriepunkte definieren.
2. Prozentschreibweisen fuer Batteriewerte in aktiven MVP-Regeltexten auf absolute Punkte umstellen.
3. Quellenabgrenzung zwischen units-and-energy.md und robot-battery-and-charging.md dokumentieren.
4. Quelleigentuemer-Tabelle um Roboterbatterie-Themenbereiche erweitern.
5. Score-Konstanten in mvp-constants.md spiegeln.
6. Spawnfeld-Tie-Break-Verweis in simulation-rules.md ergaenzen.
7. Iron-Miner-Spawnwerte-Abgrenzung in initial-game-state.md ergaenzen.
8. Fehlende Testmatrix-Eintraege MVP-DOC-009 und MVP-DOC-010 nachtragen.
9. Neuen Testmatrix-Eintrag MVP-DOC-011 fuer die Batterie-Einheit ergaenzen.
10. v109-Berichtsdateien nach docs/archive verschieben.
```

## Fachliche Entscheidungen

```text
Batterie-Einheit:
  battery und batteryMax sind absolute Punktwerte.
  Alle MVP-Robotertypen verwenden batteryMax = 100; 1 Punkt = 1 %.
  Regeltexte und Konstanten verwenden absolute Punkte (Batterie <= 1, Batterie >= 50, -1 Batterie).
  Die UI darf Batteriestand als Prozent anzeigen; das ist reine Darstellung.

Quellenabgrenzung Roboterbatterie:
  units-and-energy.md: Einheitenwerte, Batterie-Einheit, Batterieverbrauch, ChargingMode-Zuordnung.
  robot-battery-and-charging.md: Stasis-Ladeverhalten und Ladezustandsuebergaenge.

Score-Konstanten (Spiegel der Regeln aus scoring-and-win-conditions.md):
  MVP_SCORE_MINED_IRON_ORE = 1
  MVP_SCORE_SOLAR_COLLECTOR_BUILT = 25
  MVP_SCORE_ROBOT_FACTORY_BUILT = 50
  MVP_SCORE_ROBOT_SPAWNED = 100
  MVP_SCORE_GOAL_BONUS = 200

Gleichstandsentscheidungen:
  Alle Tie-Breaks (Scout-Ziel, Mining-Ziel, Bauplatz, Spawnfeld) bleiben seeded deterministic
  nach docs/03-technical/seeded-rng.md mit stabil sortierten Kandidatenlisten.
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
Roboterbatterie (Einheit/Werte/Verbrauch): docs/04-systems/units-and-energy.md
Roboterladung (Stasis-Ladeverhalten): docs/04-systems/robot-battery-and-charging.md
Systemverhalten: jeweiliges docs/04-systems/**-Dokument, soweit nicht durch 03-technical ueberschrieben
Assets: docs/05-assets/asset-fallbacks.md und docs/05-assets/asset-inventory.md
```

## Keine Gameplay-Aenderung

v110 aendert keine Siegbedingung, keine Produktionskosten, keine Produktionsdauer, keine Tick-Reihenfolge, keine RNG-Regel, keine Build-Regel und keine UI-Fachregel. Da alle MVP-Robotertypen batteryMax = 100 verwenden, sind die umgestellten Batteriewerte numerisch identisch zu den frueheren Prozentangaben. Geaendert wurden Dokumentationskonsistenz, Einheitendefinition, Quellenabgrenzung, gespiegelte Konstanten und Testmatrix-Eintraege.
