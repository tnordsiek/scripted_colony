# Dokumentationsleitlinie für die Planungsphase

## Zielbild

Am Ende der Planungsphase soll ein möglichst detailliert geplantes Konzept für das Roboter-Logikspiel vorliegen. Die Dokumentation muss so strukturiert sein, dass eine umsetzende KI und ihre Agenten damit ohne lange Rückfragen arbeiten können.

Gleichzeitig muss es ein separates MVP-Dokument geben, das als erster Umsetzungsschritt dient. Dieses MVP-Dokument steht im Konsens mit dem Spielkonzept, ist aber in Komplexität und Inhalt bewusst gekürzt.

## Leitprinzipien

### 1. Langfristvision und MVP strikt trennen

Die Langfristvision beschreibt, was das Spiel werden soll. Der MVP beschreibt nur, was zuerst gebaut wird.

Langfristvision darf enthalten:

- Forschung
- Level-2-Gebäude
- weitere Ressourcen
- Logistik
- Kampfsystem
- Kommunikationsgrid-Ausbau
- Bau-Schemata
- komplexe Programmieroptionen
- weitere Einheitentypen

MVP darf nur enthalten:

- notwendige Kernmechanik
- kleiner Spielausschnitt
- reduzierte Datenmodelle mit vorbereiteten Erweiterungspunkten
- klare Akzeptanzkriterien
- konkrete technische Umsetzung

### 2. Jedes System erhält ein eigenes Dokument

Spielsysteme sollen nicht dauerhaft in einem großen Monolithen gesammelt werden. Stattdessen werden sie nach Systemen getrennt.

Beispiele:

- Programmstack
- visuelle Programmierung
- Ressourcen und Logistik
- Gebäude und Bau
- Einheiten und Energie
- Kommunikation
- Forschung
- Map-Generierung

### 3. Technische Referenzen sind verbindlich

Wenn ein technisches Detail entschieden wurde, gehört es in `03-technical`. Dort gilt es als verbindlich.

Beispiele:

- Typnamen
- Datenmodelle
- Berechnungsregeln
- Tick-Regeln
- Stack-Logik
- Pfadfindung
- Energielogik

### 4. Zukunftssysteme dürfen geplant, aber nicht in den MVP gemischt werden

Zukunftssysteme sind wichtig, sollen aber klar markiert werden.

Formulierung:

```text
MVP:
- aktiv

Vorbereitet:
- Datenmodell/Architektur berücksichtigt es

Nicht MVP:
- nicht implementieren
```

### 5. Jede neue Entscheidung muss an drei Stellen geprüft werden

Wenn eine neue Regel beschlossen wird, sollte geprüft werden:

1. Gehört sie in die Langfristvision?
2. Hat sie Auswirkungen auf den MVP?
3. Muss das technische Datenmodell angepasst werden?

### 6. Implementierungsdokumente sollen agententauglich sein

Agententauglich bedeutet:

- konkrete Regeln statt vager Absichten
- eindeutige Typnamen
- klare Nicht-MVP-Abgrenzung
- Akzeptanzkriterien
- Tests oder testbare Erwartungen
- keine widersprüchlichen Dopplungen

## Zielstruktur der Dokumentation

```text
01-product
→ Warum gibt es das Spiel? Wie soll es sich anfühlen?

02-mvp
→ Was wird zuerst gebaut? Mit welchem Tech-Stack?

03-technical
→ Wie sind State, Regeln und Simulation definiert?

04-systems
→ Wie funktionieren einzelne Spielsysteme?

05-future
→ Was kommt später, aber nicht im MVP?

06-reference
→ Glossar, Namen, Assets, Konventionen
```


## Hosting als Planungsrandbedingung

GitHub Pages ist eine verbindliche Randbedingung für Spiel und MVP.

Alle zukünftigen Planungsentscheidungen müssen prüfen:

- Funktioniert das System als statische Web-App?
- Benötigt es einen Server?
- Benötigt es eine Datenbank?
- Sind Asset-Pfade mit GitHub Pages kompatibel?
- Kann der Zustand lokal oder rein im Client gehalten werden?
- Muss ein Feature deshalb aus dem MVP herausgehalten werden?

Wenn ein Feature Backend, Accounts, Multiplayer, Cloud Saves oder serverseitige Simulation benötigt, ist es nicht Teil des initialen MVP.

## Geltungsbereich

v110 ist der aktuelle bereinigte Dokumentationsstand. Fuer weitere Planung und Implementierung gilt:

- aktive Dokumente ausserhalb `docs/archive/` sind verbindlich
- Archivdokumente sind nur Historie und nicht implementierungsverbindlich
- README.md ist aktueller Einstieg, nicht Versionshistorie
- CHANGELOG.md enthaelt Versionsnotizen
- AGENTS.md enthaelt die kompakte Agenten-Anweisung
- Arbeitschronik-Abschnitte gehoeren in CHANGELOG.md oder docs/archive/**, nicht in aktive Fach- und Technikdokumente

## Dateiverweise und relative Pfade

Aktive Markdown-Dokumente duerfen keine defekten Dateiverweise enthalten. Fuer Dateiverweise gelten diese Regeln:

```text
- Verweise mit `docs/...` werden als projektwurzelrelative Pfade verstanden.
- Verweise mit `../`, `./` oder einem Unterordnernamen werden relativ zur verweisenden Markdown-Datei aufgeloest.
- Verweise auf Geschwisterdateien duerfen nur den Dateinamen verwenden, wenn die Datei im selben Ordner liegt.
- Markdown-Dateiverweise mit Anker duerfen nur auf existierende Dateien und existierende Ueberschriften zeigen.
- CHANGELOG.md und docs/archive/** duerfen historische, nicht mehr aktive Pfade nennen; aktive Fach- und Technikdokumente nicht.
```

Beispiel: Aus `docs/02-mvp/implementation-plan.md` muss ein Verweis auf das Datenmodell mit einem Elternordner-Prefix oder projektwurzelrelativ notiert werden:

```text
korrekt relativ: Elternordner-Prefix verwenden
korrekt projektwurzelrelativ: docs/03-technical/canonical-data-model.md
inkorrekt: ohne Elternordner-Prefix aus docs/02-mvp heraus
```



## Markdown und Codebloecke

Aktive Markdown-Dokumente muessen syntaktisch sauber sein. Fuer Codebloecke gelten diese Regeln:

```text
- Jeder geoeffnete Codeblock muss im selben Dokument geschlossen werden.
- TypeScript-Codebloecke duerfen nur TypeScript-Code oder TypeScript-Kommentare enthalten.
- Erklaerende Prosa steht ausserhalb von Codebloecken.
- Wenn ein Codeblock nur Pfade, Statuswerte, Tabellenersatz oder Ablauftext enthaelt, wird `text` als Sprachkennung verwendet.
- Historische Archivdateien sind nicht implementierungsverbindlich, sollen aber keine unbalancierten Markdown-Fences enthalten.
```

## Node-Version, Package Manager und Lockfile

Aktive MVP-Dokumente verwenden verbindlich Node.js 22.x und `npm`. Diese Regel wird fachlich durch `docs/02-mvp/mvp-and-tech-stack.md` gesetzt und von dieser Leitlinie fuer Dokumentationskonsistenz wiederholt.

```text
Verbindliche Node.js Runtime: 22.x
Verbindliche Node-Range: >=22 <23
GitHub-Actions-Notation: node-version: 22
Verbindlicher Package Manager: npm
Verbindliches Lockfile: package-lock.json
CI-Installation: npm ci
Nicht aktive Node-Major-Versionen: 20, 21, 23, 24 oder neuer
Nicht aktive Package Manager: pnpm, yarn, bun
Nicht vorgesehene Lockfiles: pnpm-lock.yaml, yarn.lock, bun.lockb
```

Aktive Dokumente duerfen andere Node-Major-Versionen, `pnpm`, `yarn` oder `bun` nur erwaehnen, wenn sie explizit als nicht verwendete Alternativen oder historische Beispiele abgegrenzt werden. Historische Nennungen in `docs/archive/**` und `CHANGELOG.md` sind zulaessig.

`package-lock.json` muss eingecheckt sein, darf nicht manuell editiert werden und wird nur durch npm unter Node.js 22.x erzeugt oder aktualisiert. `npm ci` ist fuer CI und reproduzierbare Neuinstallationen verbindlich.

## Quellenprioritaet aktiver Dokumente

Diese Regel gilt fuer alle aktiven Dokumente ausserhalb `docs/archive/**`. Sie ersetzt die unpraezise Regel, dass bei Konflikten nur allgemein aktive Dokumente gelten.

### Grundregel

Bei widerspruechlichen Aussagen wird zuerst der fachliche Themenbereich bestimmt. Es gewinnt das Dokument, das fuer diesen Themenbereich als Quelleigentuemer genannt ist. Zusammenfassungen, Einstiegstexte und Versionsdokumente duerfen keine Detailregel eines Quelleigentuemers ueberschreiben.

### Nicht regelsetzende Dokumente

Die folgenden Dokumente sind wichtig, aber nicht die hoechste Quelle fuer Spiel-, Simulations-, UI- oder Datenmodellregeln:

```text
README.md:
  Einstieg und Zusammenfassung. Verweist auf kanonische Quellen, ueberschreibt sie aber nicht.

AGENTS.md:
  Kompakte Arbeitsanweisung fuer Implementierungsagenten. Bei Detailkonflikten gilt der jeweilige Quelleigentuemer.

MANIFEST.md:
  Paketinhalt und Versionszweck. Keine Spielregelquelle.

CHANGELOG.md:
  Historie und Versionsnotizen. Keine aktive Regelquelle.

roboter_logikspiel_konzept_zwischenstand_v*.md:
  Uebergabe- und Zwischenstandsnotiz. Keine Detailregelquelle gegenueber Fach- und Technikdokumenten.
```

### Quelleigentuemer nach Themenbereich

| Themenbereich | Hoechste aktive Quelle | Nachrangige/ergaenzende Quellen |
|---|---|---|
| Dokumentationsregeln, Archivregel, Quellenprioritaet | `docs/00-documentation-guideline.md` | `README.md`, `AGENTS.md` |
| MVP-Umfang, Nicht-MVP-Abgrenzung, Tech-Stack | `docs/02-mvp/mvp-and-tech-stack.md` | `README.md`, `AGENTS.md`, `docs/01-product/**`, `docs/05-future/**` |
| Projekt- und Modulstruktur der Implementierung | `docs/03-technical/implementation-module-structure.md` | `docs/02-mvp/mvp-and-tech-stack.md`, `docs/02-mvp/implementation-plan.md`, UI-Systemdokumente |
| MVP-Akzeptanz auf Produktebene | `docs/02-mvp/acceptance-criteria.md` | `docs/02-mvp/mvp-test-matrix.md`, Systemdokumente |
| Verbindliche Test-IDs, Prioritaeten und Teststatus | `docs/02-mvp/mvp-test-matrix.md` | `docs/02-mvp/acceptance-criteria.md`, technische Quellen |
| Umsetzungsreihenfolge und Arbeitspakete | `docs/02-mvp/implementation-plan.md` | `mvp-test-matrix.md`, technische Quellen |
| Initialer GameState und Startwerte | `docs/02-mvp/initial-game-state.md` | `canonical-data-model.md`, `pathfinding-and-map-generation.md` |
| Typen, Enums, State-Formen, kanonische Interfaces | `docs/03-technical/canonical-data-model.md` | spezialisierte technische Dokumente |
| Tick-Reihenfolge | `docs/03-technical/tick-pipeline.md` | `simulation-rules.md`, Systemdokumente |
| Cross-System-Simulationsregeln | `docs/03-technical/simulation-rules.md` | `tick-pipeline.md`, Systemdokumente |
| Programstack-Regeln | `docs/03-technical/program-stack-rules.md` | `visual-programming-data-model.md`, `visual-programming-ui.md` |
| PlayerCommands, CommandResult und RejectionReasons | `docs/03-technical/player-command-handling.md` | `action-executability-matrix.md`, UI-Dokumente |
| Action-Ausfuehrbarkeit und ActionNotExecutableReason | `docs/03-technical/action-executability-matrix.md` | `simulation-rules.md`, Systemdokumente |
| Runtime-IDs und Event-Sequenz | `docs/03-technical/deterministic-id-generation.md` | `diagnostics-and-eventlog.md`, `tick-pipeline.md` |
| Seeded RNG | `docs/03-technical/seeded-rng.md` | `pathfinding-and-map-generation.md` |
| Map-Generierung, Pfadfindung, `mvp-default`-Kartenreferenz | `docs/03-technical/pathfinding-and-map-generation.md` | `seeded-rng.md`, `initial-game-state.md` |
| RobotTask-Lifecycle | `docs/03-technical/robot-task-lifecycle.md` | `simulation-rules.md`, Systemdokumente |
| RobotTask-Payloads | `docs/03-technical/robot-task-payloads.md` | `canonical-data-model.md`, `robot-task-lifecycle.md` |
| Visuelle Programmierung: Datenmodell | `docs/03-technical/visual-programming-data-model.md` | `program-stack-rules.md`, `visual-programming-ui.md` |
| Diagnose- und Eventlog-Fachregeln | `docs/03-technical/diagnostics-and-eventlog.md` | `canonical-data-model.md`, `deterministic-id-generation.md` |
| Event-, Action-Reason- und Command-Rejection-Mapping | `docs/03-technical/diagnostics-and-eventlog.md` | `player-command-handling.md`, `action-executability-matrix.md`, `canonical-data-model.md` |
| Systemverhalten einzelner Spielsysteme | jeweiliges Dokument in `docs/04-systems/**` | `simulation-rules.md`, `canonical-data-model.md` |
| Roboterbatterie: Einheitenwerte, Batterie-Einheit, Verbrauch | `docs/04-systems/units-and-energy.md` | `robot-battery-and-charging.md`, `canonical-data-model.md`, `mvp-constants.md` |
| Roboterladung: Stasis-Ladeverhalten | `docs/04-systems/robot-battery-and-charging.md` | `units-and-energy.md`, `simulation-rules.md` |
| Asset-Fallbacks und Asset-Inventar | `docs/05-assets/asset-fallbacks.md`, `docs/05-assets/asset-inventory.md` | `docs/06-reference/assets.md` |
| Glossar, Begriffs- und Namenskonventionen | `docs/06-reference/glossary-and-naming.md` | Fach- und Technikdokumente |
| Langfristvision | `docs/01-product/**` | `docs/05-future/**` |
| Future-Systeme | `docs/05-future/**` | nur aktiv, wenn ein MVP-Dokument explizit darauf verweist |

### Konfliktauflösung

```text
1. Archiv ausschliessen: docs/archive/** nie als aktive Regelquelle verwenden.
2. Themenbereich bestimmen.
3. Quelleigentuemer aus der Tabelle verwenden.
4. Spezifische technische Quelle schlaegt allgemeine Zusammenfassung.
5. MVP-Dokument schlaegt Future- oder Produktvision fuer MVP-Umfang.
6. Testmatrix schlaegt andere Dokumente nur fuer Test-ID, Prioritaet, Status und Testkategorie; die fachliche Regel selbst kommt vom jeweiligen Quelleigentuemer.
7. README, AGENTS, MANIFEST, CHANGELOG und Konzept-Zwischenstand sind bei Detailkonflikten nicht massgeblich.
8. Wenn danach ein echter Konflikt bleibt, darf keine neue Detailregel geraten werden; der Konflikt muss als Dokumentationsfehler behoben werden.
```

### Spezifische Vorrangregeln

```text
Initial-State:
  initial-game-state.md schlaegt canonical-data-model.md, wenn es um konkrete Startinstanzen, Startwerte oder Start-IDs geht.

Datenmodell:
  canonical-data-model.md schlaegt System- und UI-Dokumente, wenn es um TypeScript-Typen, Union-Mitglieder, State-Felder oder Enums geht.

Projekt-/Modulstruktur:
  implementation-module-structure.md schlaegt mvp-and-tech-stack.md, implementation-plan.md und UI-Systemdokumente, wenn es um Dateien, Ordner, Modulnamen oder Abhaengigkeitsrichtung geht.
  Abweichende Architekturvorschlaege duerfen in aktiven Dokumenten nur als ausdruecklich nicht-kanonisch, nicht zu verwenden oder verworfen erscheinen. Neutrale Alternativformulierungen fuer andere Ordnerbaeume oder Modulzuschnitte sind nicht zulaessig.

Tick-Reihenfolge:
  tick-pipeline.md schlaegt simulation-rules.md, implementation-plan.md und Systemdokumente, wenn es um Reihenfolge innerhalb eines Ticks geht.

ProductionTask-Timing:
  tick-pipeline.md, simulation-rules.md und production-and-spawn.md muessen denselben Timing-Vertrag enthalten. Bei Abweichungen gilt bis zur Bereinigung tick-pipeline.md fuer Reihenfolge und production-and-spawn.md fuer fachliche Produktionswirkung.

Seeded RNG:
  seeded-rng.md schlaegt alle anderen Dokumente fuer Hash, PRNG, Kontext-Seed und Integer-Auswahl. pathfinding-and-map-generation.md besitzt nur die Map-spezifische Anwendung und die mvp-default-Referenzwerte.

Tests:
  mvp-test-matrix.md schlaegt andere Dokumente fuer Teststatus, Test-ID und Prioritaet. Ein Test darf aber keine Fachregel gegen den Quelleigentuemer neu definieren.
```

## Architekturvorschlaege in aktiven Dokumenten

Aktive Dokumente duerfen keine konkurrierenden Architektur- oder Strukturvorschlaege fuehren. Erlaubt sind nur:

```text
1. die kanonische Struktur aus docs/03-technical/implementation-module-structure.md
2. ein kurzer Verweis auf diese Strukturquelle
3. fachliche Umsetzungslisten ohne eigene Ordner-/Modulhierarchie
4. Negativlisten, die eindeutig als nicht kanonisch oder nicht zu verwenden markiert sind
```

Wenn ein aktives Dokument alte oder alternative Ordnerbaeume nennt, muss die Nennung im selben Absatz oder direkt davor als `nicht kanonisch`, `nicht verwenden` oder `verworfen` gekennzeichnet sein.

## Testmatrix-Pflege

`docs/02-mvp/mvp-test-matrix.md` ist ein verbindliches Steuerdokument.

Wenn ein Dokument neue verbindliche Spiel-, Simulations-, UI- oder Datenmodellregeln einführt, muss geprüft werden:

```text
Braucht diese Regel einen neuen Test?
Gibt es bereits eine passende Test-ID?
Muss ein bestehender Test angepasst werden?
Ändert sich Priorität oder Status?
```

Regeln:

```text
Test-IDs sind stabil.
Test-IDs werden nicht wiederverwendet.
P0 required Tests sind MVP-blockierend.
Quell-Dokumente müssen in der Testmatrix genannt werden.
```

## Asset-Fallback-Pflege

Wenn ein neues MVP-Asset eingefuehrt wird, muessen aktualisiert werden:

```text
docs/05-assets/asset-fallbacks.md
docs/05-assets/asset-inventory.md
docs/02-mvp/mvp-test-matrix.md
```

Regel:

```text
Kein neuer MVP-AssetKey ohne Fallback.
```

## Stand

Event-Beispiele und die `goal.mvpReached`-Message verwenden Spawn- und deterministische ID-Begriffe. Event-Beispiele verwenden `event.<tick6>.<seq3>.<code>`, nicht alte freie Event-ID-Muster.

## Event- und Zieltext-Hinweis

Event-Beispiele und Event-Tests muessen das deterministische Runtime-ID-Muster verwenden. Zieltexte duerfen nicht suggerieren, dass `readyToSpawn` oder Produktionsabschluss allein das MVP-Ziel erfuellt; das Ziel ist der erfolgreiche Spawn der Iron-Miner-Entity.

## Initial-State-Hinweis

`docs/03-technical/canonical-data-model.md` darf keine alternative oder vorlaeufige Initial-State-Definition enthalten. Es fuehrt nur die kanonischen State-Typen, Signaturen und Querverweise.

## Beispiele und kanonische Typen

Beispiele in aktiven Dokumenten muessen zu den kanonischen TypeScript-Typen aus `docs/03-technical/canonical-data-model.md` passen.

```text
Vollstaendige Beispiele enthalten alle Pflichtfelder des jeweiligen Typs.
Gekuerzte Beispiele muessen ausdruecklich als Auszug markiert sein.
Feldnamen in Beispielen muessen exakt den kanonischen Typdefinitionen entsprechen.
Vollstaendige TypeScript-Typdefinitionen duerfen nur in canonical-data-model.md kanonisch sein; andere Dokumente duerfen Auszuege oder Beispiele enthalten, muessen diese aber als nicht-kanonische Volltypdefinitionen behandeln.
```
