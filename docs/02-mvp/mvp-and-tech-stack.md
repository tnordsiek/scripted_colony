# MVP und notwendiger Tech-Stack

Dieses Dokument ist die verbindliche erste Umsetzungsspezifikation. v59 bereinigt ältere aktive Aussagen aus v58, ohne die Detaildokumente zu kürzen.

## MVP-Ziel

Der Spieler soll den Starter Roboter über editierbare Programm-Templates so automatisieren, dass er:

1. Iron Ore findet.
2. Iron Ore abbaut.
3. einen Solar Collector baut.
4. eine Roboterfabrik baut.
5. in der Roboterfabrik die Iron-Miner-Produktion startet und abschliesst.
6. den Iron Miner erfolgreich auf ein freies Ausgabefeld spawnt.

Der erste zusätzliche Roboter ist ein `ironMiner`.

MVP-Ziel erfüllt:

```text
Eine Robot-Entity mit robot.type = "ironMiner" wurde erfolgreich in GameState.robots eingefügt.
```

Nicht ausreichend:

```text
ProductionTask gestartet
ProductionTask remainingTicks = 0
ProductionTask readyToSpawn
ProductionTask spawnBlocked
```

## MVP-Inhalt

### Aktiv

- 10x10 Sektorkarte
- feste Startposition `{ x: 5, y: 5 }`
- Starter Roboter
- Iron Ore
- Solar Collector
- Roboterfabrik
- erster gespawnter Iron Miner
- Batterie und Stasis-Laden
- HP
- Cargo
- Fog of War
- Programmstack
- editierbare Templates
- Programmübersicht
- Diagnose/Eventlog
- Pause und Geschwindigkeit
- Score und Zeitlimit
- Asset-Fallbacks

### Vorbereitet, aber nicht aktiv

- generische Ressourcenstruktur
- Steel Plates als spätere verarbeitete Ressource
- ChargingMode für spätere Ausbaustufen
- UnitTier
- BuildingTier
- CommunicationMode
- Forschungstypen
- MaterialRequests
- Bau-Schemata
- Grid Energy Lines
- Level-2-Gebäude
- Level-2-Einheiten

### Nicht im MVP

- aktives Forschungssystem
- Gas
- Silicium
- Steel-Plates-Produktion
- Stahlwerk
- Sendeturm
- Grid Energy Line
- Transportroboter-Logistik
- externe Roboterladung über Gebäudeenergie
- Kampf
- Feingrid-RTS-Karte
- Bauplan-/Schema-Editor
- vollständiger freier Blockeditor

## MVP-Regeln

### Karte

- 10x10 Felder
- 0-basierte Koordinaten
- Ursprung `{ x: 0, y: 0 }` oben links
- `map[y][x]`
- Startposition `{ x: 5, y: 5 }`
- Startfeld ist frei, begehbar, ressourcenfrei und gebäudefrei
- initial sichtbarer Bereich: Chebyshev-Radius 2 um den Startroboter
- 20 Iron-Ore-Felder
- 20 Iron Ore pro Feld
- mindestens ein Iron-Ore-Cluster in 4-6 Bewegungsschritten erreichbar
- Clustergröße typischerweise 3-8 Felder
- deterministische Generierung per `randomSeed`
- maximal 100 Versuche, dann feste Fallback-Karte

### Sicht

- Starter Roboter Sichtweite 2
- quadratischer Radius, also 5x5 um Roboter
- Sichtzustände:
  - `unknown`: nie sichtbar gewesen
  - `discovered`: bekannt, aber aktuell nicht sichtbar
  - `visible`: aktuell durch Roboter- oder Gebäudesicht sichtbar
- Übergänge:
  - `unknown -> visible`, wenn ein Feld erstmals in Sicht kommt
  - `visible -> discovered`, wenn ein Feld nicht mehr in aktueller Sicht liegt
  - `discovered -> visible`, wenn es wieder in Sicht kommt
- Iron Ore wird im MVP nur bei `visible` gerendert.

### Energie und Batterie

- Starter Roboter startet mit `battery = 100`, `batteryMax = 100`
- Stasis bei `battery <= 1`
- Stasis-Laden bis `battery >= 50`
- Stasis-Laden verbraucht keine Gebäudeenergie
- externe Roboterladung über Solar Collector ist nicht MVP-aktiv
- Gebäudeenergie ist ein globaler Power-Pool
- Solar Collector erzeugt 50 Leistung, wenn `active` und `isEnabled = true`
- Energie beeinflusst im MVP nur `ProductionTask`-Fortschritt

### Aktionen

- 1 Tick = 1 Spielsekunde
- Bewegung um 1 Feld: 1 Tick, 1 Batterie nach erfolgreichem Schritt
- Abbau: 10 Ticks, 1 Batterie nach erfolgreichem Abschluss, +1 Iron Ore
- Bau: 10 Ticks, 1 Batterie nach erfolgreichem Abschluss, +1 constructionProgress
- Produktion: 10 Fortschrittsticks bei ausreichender Leistung
- Batterie wird nach erfolgreicher Aktion verbraucht
- Abbruch von Mining/Bauen erzeugt kein Teilresultat und kostet keine Batterie
- wenn Batterie vorab nicht reicht, startet die Aktion nicht

### Gebäude

Solar Collector:

- Kosten: 5 Iron Ore
- Leistung: 50
- lädt im MVP keine Roboter extern
- 1 Feld
- HP 100

Roboterfabrik:

- Kosten: 5 Iron Ore
- Idle-Leistungsbedarf: 0
- benötigt 40 Leistung während Iron-Miner-Produktion
- spawnt nach abgeschlossener Produktion den ersten Iron Miner
- muss für Energieversorgung nicht neben dem Solar Collector stehen
- wird im MVP per Placement-Policy nahe einem active Solar Collector platziert
- 1 Feld
- HP 100

### Bauen

- Roboter kann nicht auf Gebäude-Tiles stehen
- Gebäude blockieren Bewegung
- Baustellen blockieren Bewegung
- Gebäude entstehen auf gültigem Baufeld
- Bauroboter steht auf einem orthogonal angrenzenden Build-From-Feld
- auf aktiven Ressourcenfeldern darf nicht gebaut werden
- erschöpfte Iron-Ore-Felder sind bebaubar, wenn Terrain bebaubar ist
- Baukosten werden beim Start des BuildingTask abgezogen
- Fortsetzen einer bestehenden Baustelle kostet nicht erneut Ressourcen

### Programmstack

- Programme werden top-down geprüft
- innerhalb eines Programms werden `ProgramRow[]` top-down geprüft
- IF falsch: nächste Row im selben Programm
- IF wahr, THEN nicht ausführbar: nächste Row im selben Programm
- erst wenn keine Row ausführbar ist: nächstes Programm im Stack
- laufender Task blockiert Neupriorisierung bis Abschluss oder Abbruch
- danach Prüfung wieder von oben
- deaktivierte Programme werden übersprungen
- Stasis-Laden ist locked, enabled und letzter Stack-Eintrag

## MVP-Templates

1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden, nicht löschbar/deaktivierbar

Nicht im Startstack:

```text
template.secureEnergy
```

`template.secureEnergy` bleibt nur Future/Advanced.

## Tech-Stack

- Sprache: TypeScript
- Build Tool: Vite
- UI: React
- Rendering: HTML Canvas 2D
- Styling: CSS Modules oder einfache CSS-Dateien
- Tests: Vitest
- Node.js Runtime: 22.x (`>=22 <23`)
- Package Manager: npm
- Backend: keines
- Hosting: GitHub Pages
- Deployment: GitHub Actions oder GitHub Pages Build aus statischem `dist/`
- Lockfile: `package-lock.json`; `pnpm-lock.yaml`, `yarn.lock` und `bun.lockb` sind im aktiven MVP nicht vorgesehen


## Node-, Package-Manager- und Lockfile-Regel

Der MVP verwendet verbindlich Node.js 22.x und `npm`. Andere Node-Major-Versionen und andere Package Manager sind fuer aktive Umsetzung, CI und Dokumentation nicht vorgesehen.

```text
Node.js Runtime: 22.x
Node-Range: >=22 <23
CI-Node-Version: 22
Package Manager: npm
Installieren in CI und Clean-Setup: npm ci
Entwicklung: npm run dev
Tests: npm test -- --run
Build: npm run build
Preview: npm run preview
Lockfile: package-lock.json
Nicht verwenden: pnpm-lock.yaml, yarn.lock, bun.lockb
Nicht verwenden: pnpm, yarn, bun
```

Das `package.json` muss die Node-Version als Engine-Regel festhalten:

```json
{
  "engines": {
    "node": ">=22 <23"
  }
}
```

Lockfile-Regel:

- `package-lock.json` ist das einzige gueltige Lockfile.
- `package-lock.json` muss im Repository eingecheckt werden.
- `npm ci` ist fuer CI, reproduzierbare Testlaeufe und saubere lokale Neuinstallation verbindlich.
- `npm install` ist nur zulaessig, wenn Abhaengigkeiten bewusst geaendert werden; die dadurch geaenderte `package-lock.json` muss mit committed werden.
- `package-lock.json` darf nicht manuell editiert werden.
- Implementierungsagenten duerfen fuer den MVP kein zweites Lockfile erzeugen. Wenn ein Paket noch kein Lockfile enthaelt, wird es mit npm unter Node.js 22.x erzeugt.

## Architektur

Die kanonische Projekt- und Modulstruktur steht ausschliesslich in `../03-technical/implementation-module-structure.md`. Dieses Dokument definiert nur Tech-Stack und Architekturgrenzen; es fuehrt keine eigene Ordner- oder Modulhierarchie.

Abweichende Architekturvorschlaege sind im aktiven MVP nicht zulaessig. Falls verworfene Varianten erwaehnt werden, muessen sie ausdruecklich als nicht kanonisch oder nicht zu verwenden markiert sein.

Nicht kanonisch fuer den MVP sind insbesondere parallele Unterbaeume wie `src/sim/map/**`, `src/sim/robot/**`, `src/sim/programs/**`, `src/ui/layout/**`, `src/ui/panels/**` oder `src/ui/programEditor/**`.

## Architekturregel

```text
Simulation
→ keine React-Abhängigkeit
→ deterministisch testbar
→ keine DOM- oder Canvas-Abhängigkeit

UI
→ sendet PlayerCommands
→ rendert abgeleiteten GameState
→ enthält keine Simulationsregeln
```

## Primärquellen

- Projekt-/Modulstruktur: `docs/03-technical/implementation-module-structure.md`
- Startzustand: `docs/02-mvp/initial-game-state.md`
- Templates: `docs/02-mvp/mvp-template-spec.md`
- Programmstack: `docs/03-technical/program-stack-rules.md`
- Action-Ausführbarkeit: `docs/03-technical/action-executability-matrix.md`
- Long Tasks: `docs/03-technical/robot-task-lifecycle.md`
- Konstanten: `docs/03-technical/mvp-constants.md`
- Energie: `docs/04-systems/energy-system.md`
- Produktion/Spawn: `docs/04-systems/production-and-spawn.md`
- Score/Ziel: `docs/04-systems/scoring-and-win-conditions.md`
- Assets: `docs/05-assets/asset-fallbacks.md`

## Stabile ProgramRowIds

```text
row.starter.mineIronOre.main
row.starter.buildSolarCollector.main
row.starter.buildRobotFactory.main
row.starter.exploreNearby.main
row.starter.stasisCharge.main
```


## ProgramEditor / updateProgram

Der MVP-Editor ist ein Formular-/Zeileneditor. `updateProgram` akzeptiert nur templatekonforme Änderungen an freigegebenen Parametern. Freie Strukturänderungen an Rows, Actions, Sensoren oder Operatoren sind nicht MVP-aktiv.


## Deterministische ID-Erzeugung

Runtime-IDs fuer Buildings, ProductionTasks, RobotTasks, gespawnte Roboter und GameEvents folgen `docs/03-technical/deterministic-id-generation.md`.
