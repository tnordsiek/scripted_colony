# Visuelle Programmierung und UI

Kanonische TypeScript-Typdefinitionen stehen in `docs/03-technical/canonical-data-model.md`. Dieses Dokument beschreibt UI-Verhalten und darf keine abweichende Volltypdefinition einfuehren.
## Blocksystem

Programme bestehen aus farbigen Bausteinen.

```text
Conditions: Gelb
Aktionen: Rot
Operatoren: Blau
Sensoren: Grün
Werte: Neutral
Programmsteuerung: Violett
Container: Dunkelgrau
```

## Programmzeilen

Ein Programm besteht aus einer oder mehreren Zeilen:

```text
IF Bedingung
THEN Aktion
```

## Conditions als Container

Beispiel:

```text
[Batteriestand] [>=] [50]
```

Ein Condition-Container besteht aus:

- Sensor
- Operator
- Wert

## Sensorabhängige Operatoren

Batterie:

- `<`
- `<=`
- `>`
- `>=`
- `==`
- `!=`

Präsenzsensor:

- vorhanden
- nicht vorhanden

## Wertevalidierung

- Batterie: 0-100 %
- Cargo-Füllstand: 0-100 %
- HP: 0 bis MaxHP oder Prozent
- Ressourcenmenge: 0 bis Kapazität
- Ressourcentypen: nur gültige/freigeschaltete Typen
- Gebäudetypen: nur gültige/freigeschaltete Typen

## Programmübersicht

MVP benötigt:

- Programmstack anzeigen
- Programme umsortieren
- Aktivieren/deaktivieren
- Skip-Icon
- Diagnose
- Template hinzufügen
- Template editieren
- Parameter bearbeiten
- Programmnamen bearbeiten

## Stack reset

Programmsteuerungsbaustein:

```text
Stack reset
→ aktuelle Programmausführung endet
→ Stackprüfung beginnt oben
```

Im MVP kann der Baustein vorbereitet werden; vollständige freie Programmierung kann später kommen.

## Aktionsparameter und Mindestenergie

Aktionen können konfigurierbare Parameter besitzen.

Beispiele:

```text
Scoute Nahfeld
Parameter:
- Ziel: Iron Ore
```

```text
Baue Gebäude
Parameter:
- Art des Gebäudes
- Feldbedingung
```

Jede Aktion besitzt außerdem einen internen Mindestenergiebedarf. Die UI kann diesen als Hinweis anzeigen, aber der Spieler muss ihn nicht manuell als IF-Bedingung einfügen.

## UI als Projektion des Datenmodells

Die sichtbaren Blöcke sind im MVP eine UI-Projektion des technischen Modells aus:

```text
docs/03-technical/visual-programming-data-model.md
```

Beispiel:

```text
NOT Nachbarfeld hat Typ Iron Ore
```

entspricht intern:

```text
SensorCondition(sensor.neighborFieldType, not hasType, Iron Ore)
```

Beispiel:

```text
Scoute Nahfeld
Parameter: Ziel Iron Ore
```

entspricht intern:

```text
ProgramAction(action.scoutNearby, { targetFieldType: { type: "fieldType", value: "ironOre" } })
```

MVP-Grenze:

- keine frei verdrahtbaren Blockgraphen
- keine selbst erstellten Sensoren
- keine selbst erstellten Operatoren
- editierbare Template-Instanzen statt vollständigem freien Editor

## Kommunikationsanzeige im MVP

Die UI darf im MVP optional anzeigen:

```text
Kommunikation: verbunden
```

Diese Anzeige hat im MVP keine Gameplay-Wirkung.

Nicht MVP:

- Kommunikationsgrid-Overlay
- Sendeturm-Reichweiten
- disconnected-Warnungen
- locked-Scout-Anzeige
- Kommunikationspfade
- Einheitensteuerung abhängig von Grid-Abdeckung

## Regel zu aktuellen UI-Beispielen

Aktive UI-Beispiele verwenden ausschließlich den kanonischen MVP-Startstack:

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

`Energie sichern` ist kein MVP-Startprogramm und darf in aktiven UI-Beispielen nicht mehr erscheinen.

## Diagnose fuer Stack-und-Zeilen-Auswertung

Die UI soll die zwei Ebenen sichtbar machen:

```text
Stack:
- Programm uebersprungen / blockiert / aktiv

Zeile:
- IF falsch
- THEN nicht ausfuehrbar
- Zeile aktiv
```

Beispiel:

```text
Aktiv: Erkunden / Zeile 1
Blockiert: Iron Ore abbauen: Nachbarfeld hat kein Iron Ore
Blockiert: Solar Collector bauen: Iron Ore fehlt
Blockiert: Roboterfabrik bauen: Solar Collector fehlt oder ist nicht active
Locked: Stasis-Laden: Batterie > 1
```

Wenn kein Programm ausfuehrbar ist:

```text
Robot.status: active
Aktivitaet: idle
Diagnose: Kein Programm ausfuehrbar
```

## UI-MVP-Spezifikation

Der UI-MVP ist implementierungsscharf definiert.

## Ziel des UI-MVP

Der UI-MVP muss drei Aufgaben erfüllen:

```text
1. Spieler kann den Simulationszustand verstehen.
2. Spieler kann den Programmstack lesen und minimal verändern.
3. Spieler kann erkennen, warum etwas passiert oder nicht passiert.
```

Das UI muss nicht final gestaltet sein. Es muss eindeutig, bedienbar und testbar sein.

## Screen-Struktur

Der MVP besitzt genau einen Hauptscreen:

```text
Main Game Screen
```

Dieser Screen besteht aus festen Bereichen:

```text
MapCanvas-Bereich
SelectionPanel
ProgramStackPanel
ProgramEditorPanel
DiagnosticsPanel
BottomControlBar
EventLogPanel
```

Layout-Prinzip:

```text
+-------------------------------+----------------------+
|                               | SelectionPanel       |
|                               | ProgramStackPanel    |
|           MapCanvas-Bereich            | ProgramEditorPanel   |
|                               | DiagnosticsPanel     |
|                               |                      |
+-------------------------------+----------------------+
| BottomControlBar | EventLogPanel                       |
+------------------------------------------------------+
```

Nicht MVP:

```text
Research Screen
Build Screen
Production Screen
Inventory Screen
Combat Screen
Communication Grid Screen
```

Produktion wird im Gebäudeauswahlpanel dargestellt, nicht auf einem eigenen Screen.

## MapCanvas-Bereich

Der MapCanvas-Bereich zeigt die 10x10-Karte.

MVP-Darstellung:

```text
10x10 Grid
Terrain-Tiles
Roboter
Iron Ore, wenn sichtbar/entdeckt
Solar Collector
Roboterfabrik
Baustellen
Fog/Unknown
```

Mindestdarstellung:

```text
Field.visibility = "unknown": Overlay `fog.unknown`
Field.visibility = "visible": kein Fog-Overlay
Field.visibility = "discovered": Overlay `fog.discovered`
Iron Ore: Ressourcenmarker
Roboter: Einheitensymbol oder Marker
Gebäude: Gebäudesymbol oder Marker
Baustelle: eigener Baustellenmarker
```

### Karteninteraktion

MVP-Interaktionen:

```text
Klick auf Feld → Feldinfo im SelectionPanel
Klick auf Roboter → Roboterinfo, Stack und Diagnose anzeigen
Klick auf Gebäude → Gebäudeinfo anzeigen
```

Nicht MVP:

```text
direkte Bewegungsbefehle
direktes Bauen per Kartenklick
direkte Angriffsziele
Drag-to-select
Box Selection
Minimap
Kommunikationsgrid-Overlay
manuelles Bauplatzsetzen
```

Der Spieler gibt keine direkten Kartenbefehle.

## Auswahlzustände

Es gibt vier Auswahltypen:

```ts
type Selection =
  | { type: "robot"; id: string }
  | { type: "building"; id: string }
  | { type: "field"; x: number; y: number }
  | null;
```

### Kein Objekt ausgewählt

Anzeige:

```text
Spielstatus
Tick
Score
MVP-Ziel
kurze Hilfe
```

Beispiel:

```text
MVP-Ziel: Iron Miner produzieren
Status: läuft
Tick: 123 / 600
Score: 75
```

### Feld ausgewählt

Anzeige:

```text
Koordinaten
Sichtstatus
Terrain
Ressource
Gebäude auf Feld
Roboter auf Feld
Bebaubar ja/nein
Begehbar ja/nein
```

Beispiel:

```text
Feld [4,2]
Sicht: visible
Terrain: Plains
Ressource: Iron Ore, 20
Bebaubar: Nein, aktive Ressource
Begehbar: Nein, aktive Ressource
```

### Roboter ausgewählt

Das Roboterpanel ist der wichtigste MVP-Fall.

Anzeige:

```text
Name
Typ
Status
HP
Batterie
Cargo
Position
Kommunikation
aktives Programm
aktive Zeile
aktueller Task
Programmstack
Diagnose
```

Beispiel:

```text
Starter Roboter
Typ: starterRobot
Status: active
HP: 100/100
Batterie: 52/100
Cargo: Iron Ore 3/10
Position: [5,4]
Kommunikation: verbunden

Aktiv:
Programm: Iron Ore abbauen
Zeile: IF Nachbarfeld hat Iron Ore AND Cargo nicht voll
Task: Mining, 6/10 Ticks verbleibend
```

### Gebäude ausgewählt

Solar Collector:

```text
Typ
Status
HP
Position
Leistung erzeugt
Leistung verwendet
Leistung frei
Ladebonus/Future-Hinweis
```

Beispiel:

```text
Solar Collector
Status: active
HP: 100/100
Leistung: 50
Verwendet: 40
Frei: 10
Ladebonus/Future-Hinweis: nicht MVP-aktiv
```

Roboterfabrik:

```text
Typ
Status
HP
Position
Produktion
remainingTicks
Leistungsbedarf
Spawnstatus
```

Beispiel:

```text
Roboterfabrik
Status: producing
Produktion: Iron Miner
Fortschritt: 4/10
Leistungsbedarf: 40
Spawnstatus: frei
```

Baustelle:

```text
Gebäudetyp
status = construction
costPaid
constructionProgress
constructionRequired
blockiert Bewegung
```

Beispiel:

```text
Baustelle: Solar Collector
Status: construction
Kosten bezahlt: 5 Iron Ore
Baufortschritt: 0/1
Blockiert Bewegung: Ja
```

## ProgramStackPanel

Der Programmstack ist im MVP sichtbar und minimal editierbar.

Jeder Stack-Eintrag zeigt:

```text
Position
Programmname
aktiv/deaktiviert
Status
Kurzdiagnose
Buttons
```

Beispiel:

```text
1. Iron Ore abbauen       active      Mining 6/10
2. Solar Collector bauen  blocked     Iron Ore fehlt
3. Roboterfabrik bauen    blocked     Solar Collector fehlt oder ist nicht active
4. Erkunden               ready       Ziel: Iron Ore
5. Stasis-Laden           locked      Batterie > 1
```

### Programmstatuswerte

```text
active
ready
skipped
blocked
disabled
completed
locked
```

Bedeutung:

```text
active: läuft gerade
ready: ausführbar, aber nicht ausgewählt, weil höheres Programm läuft
skipped: Bedingung nicht erfüllt
blocked: IF erfüllt, aber THEN nicht ausführbar
disabled: vom Spieler deaktiviert
completed: Ausführungslimit erreicht
locked: nicht editierbar, z. B. Stasis-Laden
```

### Buttons pro Programm

MVP-Buttons:

```text
Aktivieren/Deaktivieren
Nach oben
Nach unten
Bearbeiten
Reset auf Template
```

Stasis-Laden:

```text
nicht löschbar
nicht deaktivierbar
nicht verschiebbar
locked
```

Nicht MVP:

```text
freies Block-Drawing
beliebige neue Programmtypen
komplexe Drag-and-drop-Blocklogik
mehrere Robotergruppen
Copy/Paste
Import/Export
```

## ProgramEditorPanel

Der MVP-Editor ist ein Formular-/Zeileneditor, kein freier visueller Node-Editor.

Grundregel:

```text
Templates werden als Formular/Zeileneditor angezeigt.
Der Spieler kann nur vorbereitete Werte ändern.
```

Beispiel `Erkunden`:

```text
IF NOT Nachbarfeld hat Typ [Iron Ore]
THEN Scoute Nahfeld [Ziel: Iron Ore]
STOP Nachbarfeld hat Typ [Iron Ore]
OR Roboterstatus = Stasis
```

Editierbar:

```text
Zieltyp fuer Scoute Nahfeld
Zieltyp der Nachbarfeld-Bedingung
```

Beispiel `Iron Ore abbauen`:

```text
IF Nachbarfeld hat Typ [Iron Ore]
AND Cargo ist nicht voll
THEN Mine Resource [Ziel: Iron Ore]
STOP Cargo ist voll
OR Roboterstatus = Stasis
```

Editierbar:

```text
Resource-Ziel bleibt im MVP Iron Ore
```

Beispiel `Solar Collector bauen`:

```text
IF Baustelle Solar Collector existiert
OR (Cargo hat Iron Ore >= [5]
    AND NOT Gebäude oder Baustelle existiert [Solar Collector])
THEN Baue Gebäude [Solar Collector]
STOP Gebäude existiert [Solar Collector] mit Status active
OR Roboterstatus = Stasis
```

Sichtbare Werte im MVP:

```text
Gebäudetyp: Solar Collector
Kostenhinweis: 5 Iron Ore
Stop-Status: active
```

Im MVP sind einige Werte sichtbar, aber nicht alle editierbar. Der Gebäudetyp eines bestehenden MVP-Build-Templates ist nicht frei austauschbar.

### Editor-Aktionen

MVP:

```text
Wert ändern
Speichern
Abbrechen
Zurücksetzen
Programm aktivieren/deaktivieren
Programm im Stack verschieben
```

Nicht MVP:

```text
neue Sensoren frei hinzufügen
neue Operatoren frei kombinieren
beliebige Conditions bauen
komplexe Gruppen per Drag-and-drop
eigene Aktionen definieren
```

## DiagnosticsPanel

Diagnose ist Pflicht im MVP.

Diagnose pro Programm:

```text
Aktiv: Iron Ore abbauen: Mining 6/10
Blockiert: Solar Collector bauen: Iron Ore fehlt
Blockiert: Roboterfabrik bauen: Solar Collector fehlt oder ist nicht active
Ready: Erkunden: Ziel Iron Ore
Locked: Stasis-Laden: Batterie > 1
```

Diagnose pro aktivem Task:

```text
Tasktyp
Fortschritt
Ziel
Blockade
Abbruchgrund
```

Beispiel:

```text
MiningTask
Ziel: Iron Ore [4,3]
Fortschritt: 6/10
```

Bei Blockade:

```text
Weg durch Roboter blockiert: 2/3 Ticks
```

Wenn kein Programm ausführbar ist:

```text
Robot.status: active
Aktivität: idle
Diagnose: Kein Programm ausführbar
```

## EventLogPanel

Das Eventlog zeigt die letzten 5–8 Ereignisse.

MVP-Events:

```text
Programm gewechselt
Programm blockiert
Iron Ore entdeckt
Mining abgeschlossen
Cargo voll
Bau gestartet
Gebäude fertiggestellt
Produktion gestartet
Produktion pausiert
Produktion abgeschlossen
Iron Miner gespawnt
Stasis betreten
Stasis verlassen
MVP-Ziel erreicht
```

Beispiel:

```text
[042] Erkunden gestartet
[057] Iron Ore entdeckt
[058] Stack neu geprüft
[063] Mining gestartet
[073] +1 Iron Ore abgebaut
```

## BottomControlBar

MVP-Steuerung:

```text
Pause/Start
Geschwindigkeit 1x
Geschwindigkeit 2x
Geschwindigkeit 4x
Tick-Anzeige
Zeitlimit-Anzeige
Score
MVP-Zielstatus
Reset Run
Seed anzeigen
```

Beispiel:

```text
[Pause] [1x] [2x] [4x] Tick 183 / 600 | Score 120 | Ziel: Iron Miner produzieren | Seed: mvp-default | [Reset]
```

Optional:

```text
Seed ändern
Diagnose ein-/ausklappen
```

Nicht MVP:

```text
Speichern/Laden
mehrere Spielstände
Optionen-Menü
Audio-Menü
Keybinding-Menü
```

## Minimal notwendige Spieleraktionen

Der Spieler muss im MVP können:

```text
Simulation pausieren/starten
Geschwindigkeit ändern
Roboter auswählen
Gebäude auswählen
Feld auswählen
Programmstack ansehen
Programm aktivieren/deaktivieren
Programm im Stack nach oben/unten verschieben
Templatewerte ändern
Änderungen speichern/abbrechen
Programm auf Template zurücksetzen
Run zurücksetzen
```

Optional, aber sinnvoll:

```text
Seed ändern
Diagnose ein-/ausklappen
```

Nicht notwendig:

```text
direkte Einheitenbefehle
direkter Bauauftrag per Karte
freie Programmblock-Erstellung
mehrere Roboter voll bedienen
Kampf-UI
Forschungs-UI
Inventar-Management
Lager-UI
Kommunikationsgrid-UI
```

## Komponentenstruktur React

Die kanonische Projekt- und Modulstruktur steht in `../03-technical/implementation-module-structure.md`. Dieses UI-Dokument beschreibt nur den fachlichen UI-Umfang und keine eigenstaendige Architektur. Fuer den MVP liegen UI-Komponenten direkt unter `src/ui/`; die frueheren Unterordnergruppen `layout/`, `map/`, `panels/`, `programEditor/` und `controls/` sind nicht kanonisch.

Pflichtkomponenten als UI-Umfang, nicht als konkurrierender Architekturvorschlag:

```text
src/ui/GameLayout.tsx
src/ui/BottomControlBar.tsx
src/ui/MapCanvas.tsx
src/ui/MapTileTooltip.tsx
src/ui/SelectionPanel.tsx
src/ui/RobotPanel.tsx
src/ui/BuildingPanel.tsx
src/ui/FieldPanel.tsx
src/ui/ProgramStackPanel.tsx
src/ui/ProgramCard.tsx
src/ui/ProgramRowView.tsx
src/ui/ProgramEditorPanel.tsx
src/ui/ConditionEditor.tsx
src/ui/ActionParameterEditor.tsx
src/ui/DiagnosticsPanel.tsx
src/ui/EventLogPanel.tsx
src/ui/ScoreGoalPanel.tsx
src/ui/SpeedControls.tsx
src/ui/PauseButton.tsx
src/ui/ResetRunButton.tsx
```

Für den MVP darf `MapCanvas` einfache Rechtecke und Marker zeichnen.

## UI-State

```ts
type UiState = {
  selected:
    | { type: "robot"; id: string }
    | { type: "building"; id: string }
    | { type: "field"; x: number; y: number }
    | null;

  openEditorProgramId?: ProgramInstanceId;
  editedProgramDraft?: ProgramInstance;
  diagnosticsExpanded: boolean;
};
```

Regel:

```text
UI-State enthält keine Spielregeln.
Simulation entscheidet.
UI zeigt an und sendet Commands.
```

## PlayerCommands

Die UI mutiert die Simulation nicht direkt, sondern sendet Commands.

Kanonische TypeScript-Quelle fuer `PlayerCommand` ist ausschliesslich:

```text
docs/03-technical/canonical-data-model.md#ui-state-und-playercommands
```

Dieses UI-Dokument darf keine eigene `type PlayerCommand = ...`-Definition fuehren, damit Command-Varianten nicht auseinanderlaufen.

## CommandResult und UI-Rückmeldung

`CommandResult` gilt für alle UI-Commands. Die UI zeigt bei `rejected` eine verständliche Rückmeldung und darf den State nicht selbst korrigieren.

Beispiele:

| UI-Aktion | Command | rejected-Grund | UI-Verhalten |
|---|---|---|---|
| Roboter auswählen | `selectRobot` | `robotNotFound` | bisherige Auswahl bleibt bestehen |
| Feld auswählen | `selectField` | `fieldOutOfBounds` | bisherige Auswahl bleibt bestehen |
| Programm deaktivieren | `toggleProgramEnabled` | `programLocked` | Toggle bleibt disabled/ändert nichts |
| Programm verschieben | `moveProgramUp`/`moveProgramDown` | `programAlreadyFirst`/`programAlreadyLast` | Stack-Reihenfolge bleibt unverändert |
| Programm speichern | `updateProgram` | `invalidProgramDefinition` oder `invalidTemplateParameter` | Draft bleibt im Editor, Fehler wird angezeigt |
| Iron Miner produzieren | `startIronMinerProduction` | Produktions-RejectionReason | kein Kostenabzug, kein ProductionTask |


MVP-relevante Command-Gruppen:

```text
pause / resume
setSpeed
selectRobot / selectBuilding / selectField
toggleProgramEnabled
moveProgramUp / moveProgramDown
updateProgram
resetProgramToTemplate
startIronMinerProduction
resetRun
```

Nicht MVP:

```text
directMove
directBuild
directAttack
```

## ProgramEditor-Validierung

Der ProgramEditor darf nur Payloads erzeugen, die der Template-Edit-Policy entsprechen.

Pflichtverhalten:

```text
Locked Programme zeigen keine aktiven Speicher-/Editierfelder.
Nicht freigegebene Parameter werden nicht als editierbare Controls angeboten.
Speichern sendet updateProgram nur mit stabilen RowIds.
Bei rejected bleibt der Draft im Editor und der Fehler wird angezeigt.
```

MVP-Editor darf nicht anbieten:

```text
neue Rows hinzufügen
Rows löschen
actionId ändern
Sensoren/Operatoren frei austauschen
Future-Gebäude oder Future-Feldtypen als Ziel setzen
```


## UI-Akzeptanzkriterien

Das Akzeptanzkriterium ist erfüllt, wenn:

```text
1. Karte zeigt 10x10 Grid.
2. Unknown/visible/Fog sind unterscheidbar.
3. Roboter ist sichtbar und auswählbar.
4. Iron Ore wird nur sichtbar angezeigt, wenn entdeckt/sichtbar.
5. Gebäude und Baustellen sind sichtbar und auswählbar.
6. Auswahl zeigt passende Detailinfos.
7. Roboterpanel zeigt HP, Batterie, Cargo, Position, aktives Programm, aktive Zeile, Task.
8. Gebäudeinfo zeigt Status, HP und relevante Energie-/Produktionswerte.
9. Programmstack ist sichtbar.
10. Programme können aktiviert/deaktiviert werden.
11. Programme können nach oben/unten verschoben werden.
12. Templatewerte können im MVP-Editor geändert werden.
13. Änderungen können gespeichert/abgebrochen werden.
14. Diagnose zeigt Gründe für active, skipped, blocked, disabled, completed, locked und den abgeleiteten Zustand idle.
15. Eventlog zeigt wichtige Ereignisse.
16. Pause, 1x, 2x und 4x funktionieren.
17. Tick, Score und MVP-Zielstatus sind sichtbar.
18. Keine direkten Bewegungs-/Bau-/Angriffsbefehle existieren.
```

## Designregel

```text
Der UI-MVP ist ein Debug-spielbarer Main Game Screen.
Er zeigt Simulation, Programmstack, editierbare Templatewerte und Diagnose.
Er ersetzt keine Spielregeln und erlaubt keine direkte Einheitensteuerung.
```

## Asset-Spezifikation

Assets sind implementierungsscharf dokumentiert.

Festgelegt:

- MVP-required Assets
- MVP-optional Assets
- Future-Assets
- Dateipfade
- Assetgrößen
- Render-Layer
- Namenskonvention
- Canvas-Fallbacks
- Asset Registry
- BASE_URL-kompatibles Asset-Loading

Hauptdokument:

```text
docs/06-reference/assets.md
```

Regel:

```text
Das Spiel muss ohne echte Bilddateien über Canvas-Fallbacks lauffähig sein.
```

## Scoute-Nahfeld-Baustein

Der Aktionsbaustein `Scoute Nahfeld` besitzt einen sichtbaren Zielparameter.

GUI-Darstellung:

```text
[Scoute Nahfeld] [Ziel: Iron Ore]
```

Regel:

```text
Der Zielparameter ist editierbar, aber im MVP-Template auf Iron Ore voreingestellt.
```

Für den MVP genügt:

```text
Zieltyp: Iron Ore
```

Future-Zieltypen können später ergänzt werden:

```text
Gas
Silicon
Enemy
Free Build Field
Charging Field
```

Der Baustein bleibt eine autonome Bewegungsaktion. Der Spieler wählt kein konkretes Kartenfeld.

## Roboterfabrik-UI: Iron Miner produzieren

Wenn eine aktive Roboterfabrik ausgewählt ist, zeigt das Gebäude-Panel im MVP eine Aktion:

```text
Iron Miner produzieren
```

Der Button sendet:

```ts
{ type: "startIronMinerProduction"; buildingId }
```

Button deaktiviert, wenn:

```text
Roboterfabrik nicht aktiv
Roboterfabrik deaktiviert
ProductionTask läuft bereits
Startroboter fehlt
Startroboter nicht verbunden
Startroboter-Cargo enthält weniger als 5 Iron Ore
```

Hinweistext bei fehlenden Ressourcen:

```text
Nicht genug Iron Ore im Startroboter-Cargo.
```

Die UI zeigt keine Gebäudeinput-Inventare für die Roboterfabrik im MVP.

## UI-Command für Iron-Miner-Produktion

Es ist vollständig spezifiziert, wie der Spieler die Iron-Miner-Produktion auslöst.

## Grundentscheidung

Der Iron Miner wird nicht durch ein Roboterprogramm produziert.

Nicht kanonisch:

```text
IF Roboterfabrik vorhanden
THEN Produziere Iron Miner
```

Kanonisch im MVP:

```text
Spieler wählt Roboterfabrik
→ klickt "Iron Miner produzieren"
→ UI sendet PlayerCommand
→ Simulation startet ProductionTask
```

Begründung:

```text
Iron Miner produzieren ist eine Gebäudefunktion.
Es ist kein Startroboter-Programm.
Gebäudeprogramme sind Future.
```

## Kanonischer UI-Flow

```text
1. Spieler klickt Roboterfabrik auf der Karte.
2. SelectionPanel zeigt Gebäudeinformationen.
3. Wenn building.type = robotFactory:
   → Button "Iron Miner produzieren" anzeigen.
4. Spieler klickt Button.
5. UI sendet PlayerCommand: startIronMinerProduction.
6. Simulation prüft Voraussetzungen.
7. Bei Erfolg:
   → 5 Iron Ore aus Startroboter-Cargo abziehen
   → ProductionTask anlegen
   → Eventlog schreiben
8. Bei Fehler:
   → kein Kostenabzug
   → kein ProductionTask
   → Diagnose/Eventlog schreiben
```

## PlayerCommand

`startIronMinerProduction` ist eine Variante der kanonischen `PlayerCommand`-Union aus `docs/03-technical/canonical-data-model.md`. Dieses Dokument definiert den Union-Typ nicht erneut.

Kanonische Command-Form fuer den Produktionsbutton:

```ts
{ type: "startIronMinerProduction"; buildingId: BuildingId }
```

Der MVP verwendet bewusst keinen generischen Produktionscommand.

Nicht MVP:

```ts
{ type: "startProduction"; buildingId: BuildingId; robotType: RobotType }
```

## Command Handler und Ergebnis

Empfohlene Handler-Signatur:

```ts
function handleStartIronMinerProduction(
  state: GameState,
  command: { type: "startIronMinerProduction"; buildingId: BuildingId }
): CommandResult
```

`CommandResult` ist für Tests und UI-Rückmeldungen verbindlich. Die TypeScript-Definition von `CommandResult` und `CommandRejectionReason` steht ausschließlich in `docs/03-technical/canonical-data-model.md`.

Die vollständige Validierungsmatrix für alle `PlayerCommand`-Varianten steht in `docs/03-technical/player-command-handling.md`. Dieses UI-Dokument darf keine eigene `CommandResult`- oder `CommandRejectionReason`-Union definieren.

## Simulationsvalidierung

Die Simulation prüft verbindlich:

```text
buildingId existiert
building.type = robotFactory
building.status = active
building.isEnabled = true
building.productionTask ist leer
Startroboter existiert
Startroboter.status ist active oder stasis
Startroboter.communicationStatus = connected
Startroboter-Cargo enthält mindestens 5 Iron Ore
```

Nicht prüfen:

```text
Startroboter steht neben Roboterfabrik
Roboterfabrik hat Input-Inventar
Ressourcenspeicher enthält Iron Ore
Transportroboter verfügbar
MaterialRequest vorhanden
freie Leistung >= 40
```

Wichtig:

```text
Nicht genug freie Leistung deaktiviert den Button nicht.
Leistung wird während des ProductionTask geprüft.
Wenn Leistung fehlt, pausiert Produktion.
```

## Erfolgseffekt

Bei Erfolg:

```text
starterRobot.cargo.used.ironOre -= 5
robotFactory.productionTask = new ProductionTask
productionTask.costPaid = true
eventLog += "Iron Miner production started"
CommandResult = accepted
```

Kanonischer Task:

```ts
const productionTask: ProductionTask = {
  id: createProductionTaskId(buildingId, "ironMiner", state),
  buildingId,
  robotType: "ironMiner",
  cost: { ironOre: 5 },
  costPaid: true,
  totalTicks: 10,
  remainingTicks: 10,
  powerRequired: 40,
  status: "inProgress",
  createdTick: state.tick,
  startedTick: state.tick,
};
```

## Fehlerverhalten

Bei Fehler:

```text
kein Kostenabzug
kein ProductionTask
CommandResult = rejected
Eventlog/Diagnose schreiben
UI bleibt stabil
Button bleibt sichtbar, aber ggf. disabled
```

Diagnosezuordnung:

| Bedingung | RejectionReason | UI-/Diagnosetext |
|---|---|---|
| Gebäude fehlt | `buildingNotFound` | Roboterfabrik nicht gefunden |
| falscher Gebäudetyp | `buildingIsNotRobotFactory` | Gebäude kann keinen Iron Miner produzieren |
| Gebäude nicht aktiv | `buildingNotActive` | Roboterfabrik ist nicht aktiv |
| Gebäude deaktiviert | `buildingDisabled` | Roboterfabrik ist deaktiviert |
| Produktion läuft | `productionAlreadyRunning` | Produktion läuft bereits |
| Startroboter fehlt | `starterRobotMissing` | Startroboter fehlt |
| Startroboter nicht connected | `starterRobotNotConnected` | Startroboter nicht verbunden |
| zu wenig Iron Ore | `notEnoughIronOreInStarterCargo` | Nicht genug Iron Ore im Startroboter-Cargo |

## UI-Zustände im Building Panel

Wenn eine Roboterfabrik ausgewählt ist, zeigt das SelectionPanel:

```text
Gebäude: Roboterfabrik
Status
HP
Position
Produktion
Button: Iron Miner produzieren
Produktionskosten: 5 Iron Ore
Dauer: 10 Ticks
Leistungsbedarf: 40
```

Wenn kein ProductionTask läuft:

```text
Button anzeigen.
```

Wenn Voraussetzungen erfüllt:

```text
Button enabled.
```

Wenn Voraussetzungen nicht erfüllt:

```text
Button disabled.
Grund anzeigen.
```

Beispiele:

```text
Nicht genug Iron Ore im Startroboter-Cargo: 3/5
Produktion läuft bereits
Roboterfabrik ist noch im Bau
Startroboter nicht verbunden
```

## Leistungsbedarf im UI

Nicht genug freie Leistung deaktiviert den Button nicht.

UI-Hinweis erlaubt:

```text
Leistung fehlt aktuell. Produktion startet, pausiert aber ohne 40 freie Leistung.
```

## Produktionsanzeige

Während `productionTask.status = inProgress`:

```text
Produktion: Iron Miner
Fortschritt: 10 - remainingTicks / 10
Leistungsbedarf: 40
Status: läuft oder pausiert
```

Wenn Leistung fehlt:

```text
Status: pausiert – Nicht genug freie Leistung
```

Wenn `readyToSpawn`:

```text
Status: bereit zum Spawn
```

Wenn `spawnBlocked`:

```text
Status: Spawn blockiert – kein freies Ausgabefeld
```

## Command in Tick-Reihenfolge

`startIronMinerProduction` wird bei Spielerbefehlen verarbeitet:

```text
1. Spielerbefehle übernehmen
2. verfügbare Leistung aus aktiven Gebäuden berechnen
3. Gebäudeproduktion verarbeiten
4. Spawnprüfungen ausführen
5. Roboterprogramme und Tasks verarbeiten
6. Eventlog/Score/UI-State aktualisieren
```

Für Produktion gilt analog zu Long Tasks:

```text
ProductionTask startet in Tick N.
Erster Fortschrittstick wird in Tick N+1 verarbeitet.
```

## Tests

Verbindliche Testfälle:

```text
startIronMinerProduction succeeds with active robotFactory and 5 Iron Ore in starter cargo
deducts exactly 5 Iron Ore on start
creates ProductionTask with costPaid = true
rejects if robotFactory is missing
rejects if selected building is not robotFactory
rejects if robotFactory is under construction
rejects if robotFactory is disabled
rejects if productionTask already exists
rejects if starterRobot missing
rejects if starterRobot not connected
rejects if starter cargo has less than 5 Iron Ore
does not deduct resources on rejected command
does not create ProductionTask on rejected command
does not set score or mvpGoalReached on production start
does not disable production button only because free power is below 40
shows production progress while task is inProgress
shows spawnBlocked when no output field is free
```

## Designregel

```text
Roboterfabrik-Auswahl zeigt Button "Iron Miner produzieren".
Button sendet startIronMinerProduction(buildingId).
Simulation validiert alle Voraussetzungen.
Bei Erfolg wird ProductionTask erstellt.
Bei Fehler gibt es keinen Kostenabzug und eine klare Diagnose.
```

## Initiale UI-Auswahl

Beim Spielstart ist der Startroboter ausgewählt.

```ts
GameState.selected = { type: "robot", id: "robot.starter" }
```

Regel:

```text
GameState.selected ist die kanonische Spielauswahl.
UiState ist Frontend-State und wird nicht als kanonischer Spielzustand serialisiert.
```

Initialer UI-Lokalzustand:

```ts
const initialUiState: UiState = {
  selected: { type: "robot", id: "robot.starter" },
  openEditorProgramId: undefined,
  editedProgramDraft: undefined,
  diagnosticsExpanded: false,
};
```

## Build-Baustein

Der Aktionsbaustein `Baue Gebäude` besitzt einen sichtbaren Gebäudetyp-Parameter.

GUI-Darstellung:

```text
[Baue Gebäude] [Typ: Solar Collector]
[Baue Gebäude] [Typ: Roboterfabrik]
```

Regel:

```text
Der Spieler wählt nur den Gebäudetyp.
Der Spieler wählt kein konkretes Kartenfeld.
```

Die Bauplatzwahl erfolgt intern durch die Simulation.

MVP-Gebäudetypen:

```text
Solar Collector
Roboterfabrik
```

## Mine-Resource-Baustein

Der Mining-Aktionsbaustein besitzt einen sichtbaren Ressourcenparameter.

GUI-Darstellung:

```text
[Mine Resource] [Ziel: Iron Ore]
```

Regel:

```text
Der Zielparameter ist im MVP auf Iron Ore gesetzt.
Später können weitere ResourceTypes ergänzt werden.
```

## Eventlog- und Diagnose-UI

Die UI unterscheidet:

```text
Player Eventlog
Debug Diagnostics
```

Haupt-Eventlog:

```text
zeigt nur visibility = player
neueste oben
zeigt Tick, Severity, Message, optional Entity-Link
zeigt repeatCount, wenn > 1
```

Diagnosebereich:

```text
sichtbar, wenn diagnosticsExpanded = true
zeigt zusätzlich visibility = debug
zeigt details
zeigt programId, rowId, actionId und reason
```

Tests und UI sollen stabile `event.code` verwenden. `message` ist nur UI-Text.

## Energieanzeige

Die UI zeigt eine einfache globale Energieanzeige:

```text
Leistung: 50 erzeugt / 40 benoetigt / 10 frei
```

Im Roboterfabrik-Panel:

```text
Produktionsbedarf: 40 Leistung
Status: laeuft
Status: pausiert - nicht genug freie Leistung
```

Button-Regel:

```text
Nicht genug freie Leistung deaktiviert den Button Iron Miner produzieren nicht.
```

## Asset-Fallback-UI

Die UI muss alle MVP-Elemente auch ohne finale Assets darstellen koennen.

Verbindliche Quelle:

```text
docs/05-assets/asset-fallbacks.md
```

Regeln:

```text
Hauptkarte nutzt Fallbacks fuer Terrain, Fog, Ressourcen, Roboter und Gebaeude.
Roboterfabrik-Panel zeigt productionPaused und spawnBlocked mindestens textlich.
Selection und Reservation haben einfache Outline-Fallbacks.
Unknown Felder duerfen keine Resource-Fallbacks verraten.
```

Normale Asset-Fallback-Nutzung wird nicht im Player Eventlog angezeigt.


## ProgramStackPanel-Statuswerte

Die UI verwendet folgende Statusbegriffe einheitlich:

```text
active: Programm/Task läuft gerade.
ready: Bedingung und Aktion wären ausführbar, aber Programm ist aktuell nicht aktiv.
skipped: IF-Bedingung ist falsch.
blocked: IF-Bedingung ist wahr, THEN-Aktion ist nicht ausführbar.
disabled: Programm wurde vom Spieler deaktiviert.
completed: executionLimit erreicht, falls ein Limit aktiv ist.
locked: Programm ist nicht löschbar/deaktivierbar; im MVP betrifft das Stasis-Laden.
```

`completed` ist im MVP nur zu verwenden, wenn ein `executionLimit` tatsächlich erreicht wurde. Andernfalls darf die UI abgeschlossene Einzelaktionen nicht dauerhaft als abgeschlossenes Programm missverstehen.

## ProgramEditor-Vertrag

Der MVP-Editor ist ein Formular-/Zeileneditor, kein freier Node-Editor.

Pflichtaktionen:

```text
Speichern
Abbrechen
Zurücksetzen auf Template
Aktivieren/Deaktivieren
Programm verschieben
```

Editierbar sind nur vorbereitete Parameter:

```text
Mine Resource Ziel: Iron Ore
Baue Gebäude Typ: Solar Collector / Roboterfabrik
Scoute Nahfeld Ziel: Iron Ore
Schwellwerte, wenn das Template sie freigibt
```

`Stasis-Laden` ist locked und nicht löschbar/deaktivierbar.

## Minimale Spieleraktionen

Der UI-MVP muss mindestens ermöglichen:

```text
Simulation pausieren/starten
Geschwindigkeit ändern
Roboter auswählen
Gebäude auswählen
Feld auswählen
Programmstack ansehen
Programm aktivieren/deaktivieren
Programm verschieben
Templatewerte ändern
Änderungen speichern/abbrechen
Programm auf Template zurücksetzen
Run zurücksetzen
Diagnose ein-/ausklappen
Iron-Miner-Produktion an aktiver Roboterfabrik starten
```


## action.charge nicht im MVP-Editor

Der visuelle MVP-ProgramEditor darf `action.charge` nicht als auswählbare Aktion anzeigen. Sichtbare MVP-Aktionsblöcke sind nur:

```text
Scoute Nahfeld
Mine Resource
Baue Gebäude
Stasis-Laden
```

Externe Roboterladung und freies Laden bleiben Future/Advanced und sind nicht Teil des MVP-Editors.
