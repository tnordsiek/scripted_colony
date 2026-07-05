# MVP Implementation Plan – Roboter-Logikspiel

## 1. Ziel dieses Dokuments

Dieses Dokument ist ein Schritt-für-Schritt-Plan für Codex oder Claude Code, um die initiale MVP-Version autark umzusetzen.

Das Ziel ist kein vollständiges Spiel, sondern ein spielbarer Prototyp mit folgender Kernschleife:

```text
Startroboter wacht auf
→ Programme aktivieren
→ Karte erkunden
→ Iron Ore finden
→ Iron Ore abbauen
→ Solarkollektor bauen
→ Roboterfabrik daneben bauen
→ Roboter produzieren
→ MVP-Ziel erreicht
```

## 2. Grundannahmen

Techstack:

- Vite
- React
- TypeScript
- HTML Canvas 2D
- Vitest
- kein Backend

Vor dem Start:

```bash
npm create vite@latest robot-logic-mvp -- --template react-ts
cd robot-logic-mvp
npm install
npm install -D vitest jsdom
```

Skripte in `package.json` sicherstellen:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 3. Akzeptanzkriterium für den gesamten MVP

Der MVP gilt als funktionsfähig, wenn:

1. Eine 10x10-Karte generiert wird.
2. Der Startroboter zufällig auf einem freien Feld startet.
3. 20 Iron-Ore-Felder als Cluster erzeugt werden.
4. Der Roboter Felder über Sichtweite 2 aufdeckt.
5. Bewegung, Abbau, Bau und Produktion über Ticks laufen.
6. Der Spieler Programme im Stack aktivieren/deaktivieren kann.
7. Der Roboter autonom Iron Ore finden und abbauen kann.
8. Der Roboter einen Solarkollektor bauen kann.
9. Der Roboter eine Roboterfabrik orthogonal daneben bauen kann.
10. Die Roboterfabrik 40 Leistung vom Solarkollektor abnimmt.
11. Die Roboterfabrik einen zweiten Roboter produziert.
12. Eine Meldung „MVP-Ziel erreicht“ erscheint.
14. Nach 600 Ticks erscheint eine Ergebnisübersicht mit Score.
15. Alle Einheiten und Gebäude haben 100/100 HP.
16. Terrain-Typen sind im Datenmodell vorbereitet.
13. `npm test` und `npm run build` erfolgreich laufen.

## Phase 1: Projektgrundlage

### Ziel

Projekt lauffähig machen und Grundstruktur anlegen.

### Aufgaben

1. Vite/React/TypeScript-Projekt anlegen.
2. Ordnerstruktur erstellen:

```text
src/
  sim/
  ui/
  tests/
```

3. `MVP_CONFIG` in `src/sim/constants.ts` anlegen.
4. Basistypen in `src/sim/types.ts` anlegen.
5. Minimalen App-Shell rendern.

### Akzeptanzkriterien

- `npm run dev` startet.
- `npm run build` läuft.
- `npm test` läuft, auch wenn noch wenige Tests existieren.

### Nicht umsetzen

- Noch keine Karte.
- Noch keine Simulation.
- Noch keine Programme.

## Phase 2: Simulationsdatenmodell

### Ziel

GameState, Felder, Roboter, Gebäude und Logdaten modellieren.

### Aufgaben

1. In `src/sim/types.ts` definieren:

- `GameState`
- `GameMap`
- `Field`
- `ResourceDeposit`
- `Robot`
- `Building`
- `Program`
- `RobotTask`
- `GameEvent`
- `Selection`

2. `createInitialGame(seed?: number)` anlegen.
3. Einen einfachen deterministischen Random-Helper einbauen oder eine Seed-Option vorsehen.

### Akzeptanzkriterien

- `createInitialGame()` gibt einen vollständigen State zurück.
- State ist serialisierbar.
- Keine React-Abhängigkeiten in `sim`.

### Tests

- Initialer State enthält `tick = 0`.
- Initialer State enthält genau einen Startroboter.
- Startroboter hat 50 Batterie, max 100, Cargo max 10.

## Phase 2b: Hitpoints für Einheiten und Gebäude

### Ziel

HP-System im Datenmodell vorbereiten, ohne Kampf oder Umweltschaden für den MVP umzusetzen.

### Regeln

- Jede Einheit hat 100/100 HP.
- Jedes Gebäude hat 100/100 HP.
- HP bestehen aus `current` und `max`.
- Der Startroboter ist konzeptionell reparaturfähig.
- Reparatur darf HP nie über `max` erhöhen.
- Aktive Schadensquellen sind nicht Teil des MVP.

### Aufgaben

1. `Hitpoints`-Typ in `types.ts` ergänzen.
2. `Robot` um `hp` erweitern.
3. `Building` um `hp` erweitern.
4. Optional `canRepair?: boolean` für Roboter ergänzen.
5. Startroboter mit `hp: { current: 100, max: 100 }` erzeugen.
6. Solarkollektor und Roboterfabrik mit 100/100 HP erzeugen.
7. Neu produzierte Roboter mit 100/100 HP erzeugen.
8. HP in der rechten Seitenleiste anzeigen.
9. Optional eine reine Hilfsfunktion `repairHp(hp, amount)` implementieren, die niemals über `max` heilt.

### Akzeptanzkriterien

- Startroboter zeigt 100/100 HP.
- Solarkollektor zeigt 100/100 HP.
- Roboterfabrik zeigt 100/100 HP.
- neu produzierte Roboter starten mit 100/100 HP.
- HP sind Teil des serialisierbaren GameState.
- Keine aktive Kampf- oder Umwelt-Schadenslogik wurde eingebaut.

### Tests

- Startroboter startet mit 100/100 HP.
- Gebäude starten mit 100/100 HP.
- neu produzierte Roboter starten mit 100/100 HP.
- Reparatur-Hilfsfunktion erhöht HP nicht über `max`, falls implementiert.

## Phase 2c: Kanonisches Datenmodell und Regelkonsolidierung

### Ziel

Vor der Implementierung werden Datenmodell, Begriffe, Bau-/Belegungsregeln und Energie-Edge-Cases verbindlich konsolidiert.

### Aufgaben

1. Kanonisches MVP-Datenmodell aus `technical-guidelines.md` übernehmen.
2. `steelPlates` als verarbeitete Ressource ergänzen, aber nicht im MVP aktivieren.
3. Natürliche Rohstoffe und verarbeitete Materialien trennen.
4. Einheitliche Benennung verwenden: KI-Forschungszentrum / `aiResearchCenter`.
5. Gebäude- und Baustellenfelder für Bewegung blockieren.
6. Bauen nur auf orthogonal angrenzenden freien Feldern erlauben.
7. Bauen auf aktiven Ressourcenfeldern verbieten.
8. Erschöpfte Iron-Ore-Felder als bebaubar behandeln, wenn Terrain bebaubar ist.
9. Externe Ladung an freie Netzleistung koppeln.
10. Gebäude deaktivierbar machen, sodass sie keine Leistung abnehmen.
11. Batteriekosten nach erfolgreicher Aktion abziehen.
12. Programme überspringen/blockieren, wenn Batterie vor Aktionsstart nicht ausreicht.

### Akzeptanzkriterien

- Die Implementierung nutzt eine einzige Datenmodell-Referenz.
- Keine alten IDs wie `aiResearchCenter` werden verwendet.
- Aktive Ressourcenfelder sind nicht bebaubar.
- Reservierte Baustellen sind nicht betretbar.
- Externe Ladung funktioniert nur bei freier Netzleistung.
- Mehrere externe Ladequellen stacken nicht.
- Selbstladung funktioniert nur als aktiver Ladeprogrammschritt.

## Phase 3: Map-Generierung

### Ziel

10x10-Karte mit zufälliger Startposition und Iron-Ore-Clustern erzeugen.

### Regeln

- Karte: 10 x 10 Felder
- 20 Iron-Ore-Felder
- Clustergröße: 3 bis 8
- Startposition auf freiem Feld
- Startfeld ohne Iron Ore
- Mindestens ein Iron-Ore-Feld in 4 bis 6 Bewegungsschritten erreichbar

### Aufgaben

1. `src/sim/map/generateMap.ts` erstellen.
2. Cluster-Verteilung erzeugen.
3. Cluster orthogonal wachsen lassen.
4. Startposition wählen.
5. Fairnessregel prüfen; bei ungültiger Karte neu generieren.

### Akzeptanzkriterien

- Karte hat 100 Felder.
- Exakt 20 Felder enthalten Iron Ore.
- Startfeld ist frei.
- Kein Iron Ore auf Startfeld.
- Mindestens ein Iron-Ore-Feld ist in 4 bis 6 Schritten erreichbar.

### Tests

- `mapGeneration.test.ts`
- Mehrere Seeds testen.
- Clustergrößen validieren.

## Phase 3b: Terrain-Typen und Bewegungsarten vorbereiten

### Ziel

Terrain-Typen, Passierbarkeit und Bewegungsarten im Datenmodell vorbereiten. Für den MVP bleibt Plains das einzige aktiv generierte Terrain.

### Regeln

Terrain-Typen:

```ts
type TerrainType =
  | "plains"
  | "rubble"
  | "lavaRiver"
  | "mercuryRiver";
```

Bewegungsarten:

```ts
type MovementType = "ground" | "flying";
```

MVP-Regeln:

- alle generierten Felder sind zunächst `plains`
- Startroboter hat `movementType: "ground"`
- Gebäude dürfen nur auf `plains` gebaut werden
- Bodeneinheiten dürfen `plains` betreten
- Geröll, Lava und Quecksilber werden im MVP noch nicht in der Karte generiert

Spätere Regeln:

- `rubble` blockiert Bodeneinheiten, ist für fliegende Einheiten passierbar
- `lavaRiver` und `mercuryRiver` blockieren Bodeneinheiten
- fliegende Einheiten können gefährliche Flussfelder überqueren
- gefährliche Flussfelder verursachen später -1 HP pro Tick auf orthogonalen Nachbarfeldern
- fliegende Einheiten erhalten später auch auf dem Flussfeld selbst -1 HP pro Tick

### Aufgaben

1. `TerrainType` in `types.ts` ergänzen.
2. `MovementType` in `types.ts` ergänzen.
3. `Field.terrain` auf `TerrainType` setzen.
4. `Robot.movementType` ergänzen.
5. Startroboter als `ground` initialisieren.
6. Map-Generator so anpassen, dass Felder im MVP mit `terrain: "plains"` erzeugt werden.
7. `canEnterTerrain(terrain, movementType)` als reine Funktion implementieren.
8. `canBuildOnTerrain(terrain)` als reine Funktion implementieren.
9. Pfadfindung und Bauplatzsuche sollen diese Hilfsfunktionen verwenden.
10. Umweltschaden noch nicht aktiv in die Tick-Simulation einbauen.

### Akzeptanzkriterien

- jedes Feld hat einen Terrain-Typ.
- alle MVP-Felder sind zunächst `plains`.
- Startroboter hat Bewegungsart `ground`.
- Bewegung prüft Terrain über `canEnterTerrain`.
- Bauplatzsuche prüft Terrain über `canBuildOnTerrain`.
- keine aktiven Lava-/Quecksilber- oder Geröllfelder werden im MVP generiert.
- keine aktive Umweltschadenslogik wird im MVP ausgeführt.

### Tests

- `plains` ist für `ground` passierbar.
- `plains` ist für `flying` passierbar.
- `plains` ist bebaubar.
- `rubble` ist für `ground` nicht passierbar.
- `rubble` ist für `flying` passierbar.
- `rubble` ist nicht bebaubar.
- `lavaRiver` und `mercuryRiver` sind für `ground` nicht passierbar.
- `lavaRiver` und `mercuryRiver` sind für `flying` passierbar.
- `lavaRiver` und `mercuryRiver` sind nicht bebaubar.

## Phase 3c: Generisches Ressourcenmodell vorbereiten

### Ziel

Das Ressourcenmodell für spätere Rohstoffe vorbereiten, ohne Gas, Silicium oder komplexe Produktionsketten im MVP aktiv umzusetzen.

### Regeln

Aktive MVP-Ressource:

```ts
"ironOre"
```

Vorbereitete spätere Ressourcen:

```ts
"gas"
"silicon"
```

Fördermethoden:

```ts
"directMining"
"refinery"
"specializedMining"
```

### Aufgaben

1. `ResourceType` in `types.ts` ergänzen.
2. `ResourceInventory` als generisches Inventar ergänzen.
3. `ResourceCost` als generische Kostenstruktur ergänzen.
4. `ExtractionMethod` ergänzen.
5. `ResourceDeposit` um `type: ResourceType` und `extractionMethod` erweitern.
6. Iron-Ore-Vorkommen mit `extractionMethod: "directMining"` erzeugen.
7. Cargo des Startroboters als `ResourceInventory` modellieren.
8. Gebäudekosten als `ResourceCost` modellieren.
9. Bestehende MVP-Logik weiterhin nur mit Iron Ore betreiben.
10. Gas und Silicium nicht aktiv generieren.

### Akzeptanzkriterien

- Iron Ore funktioniert wie bisher.
- Cargo ist nicht hart auf eine einzelne Ressource verdrahtet.
- Gebäudekosten können mehrere Ressourcen unterstützen.
- ResourceDeposit unterstützt verschiedene Fördermethoden.
- Kein Gas und kein Silicium erscheinen im MVP-Spielablauf.
- Bestehende MVP-Tests bleiben grün.

### Tests

- Startroboter-Cargo kann Iron Ore speichern.
- Solarkollektor-Kosten werden als `ResourceCost` mit Iron Ore geprüft.
- Roboterfabrik-Kosten werden als `ResourceCost` mit Iron Ore geprüft.
- Iron-Ore-Vorkommen haben `extractionMethod: "directMining"`.
- Gas/Silicium werden im MVP-Map-Generator nicht erzeugt.

## Phase 3d: Map-Fairness, erster Miner und Logistik-Vorbereitung

### Ziel

Die Map-Generierung fair und reproduzierbar machen, den ersten produzierten Roboter als Iron Miner festlegen und spätere Logistikstrukturen vorbereiten.

### Aufgaben

1. `randomSeed` für Map-Generierung verwenden.
2. Map-Generator deterministisch machen.
3. Startposition frei und ohne Ressource erzeugen.
4. Initial sichtbaren Bereich des Startroboters ohne Iron Ore erzwingen.
5. Mindestens ein Iron-Ore-Feld in 4–6 Bewegungsschritten erreichbar machen.
6. Maximal 100 Generierungsversuche erlauben.
7. Fallback-Karte definieren, falls keine gültige Karte erzeugt wird.
8. Ersten produzierten Roboter als `ironMiner` erzeugen.
9. MVP-Ziel bei Abschluss der Miner-Produktion erfüllen.
10. Spätere Typen für Gebäudeinventare und Materialaufträge dokumentieren.

### Akzeptanzkriterien

- Gleicher Seed erzeugt gleiche Karte.
- Startroboter sieht am Start kein Iron Ore.
- Ein Iron-Ore-Feld ist nach kurzer Bewegung erreichbar.
- Ungültige Karten werden verworfen.
- Nach 100 Fehlversuchen wird eine Fallback-Karte genutzt.
- Der erste produzierte Roboter ist ein Iron Miner.
- Logistik bleibt im MVP inaktiv, ist aber konzeptionell vorbereitet.

## Phase 4: Sicht und Fog of War

### Ziel

Sichtzustände `unknown`, `fog`, `visible` implementieren.

### Regeln

- Startroboter-Sichtweite: 2
- Sichtweite
   - HP 2 entspricht 5x5-Bereich
- Kartenrand schneidet Sicht ab
- Gebäude haben Sichtweite 2
- Felder außerhalb aktueller Sicht, aber bereits entdeckt, werden `fog`

### Aufgaben

1. `src/sim/map/visibility.ts` erstellen.
2. Funktion implementieren:

```ts
updateVisibility(state: GameState): GameState
```

3. Sicht aus allen Robotern und Gebäuden berechnen.
4. Initiale Sicht beim Spielstart setzen.
5. Sicht nach Bewegung und Gebäudebau aktualisieren.

### Akzeptanzkriterien

- Unbekannte Felder sind verborgen.
- Sichtbare Felder werden korrekt angezeigt.
- Verlassene Felder bleiben entdeckt, aber wechseln in Fog.
- Gebäudesicht hebt Fog auf.

### Tests

- Roboter in Kartenmitte deckt 5x5 auf.
- Roboter am Rand deckt nur vorhandene Felder auf.
- Sichtstatus wechselt von visible zu fog.

## Phase 5: Tick-System

### Ziel

Zentrale Tick-Funktion implementieren.

### Regeln

- 1 Tick = 1 Spielsekunde
- Bewegung = 1 Tick
- Abbau = 10 Ticks
- Bau = 10 Ticks
- Produktion = 10 Ticks

### Aufgaben

1. `src/sim/tick.ts` erstellen.
2. Funktion implementieren:

```ts
advanceGameByOneTick(state: GameState): GameState
```

3. Tickzähler erhöhen.
4. Aktive RobotTasks herunterzählen.
5. Bei Abschluss Task-Effekt anwenden.
6. Wenn kein Task aktiv ist, Programmstack auswerten.

### Akzeptanzkriterien

- Tick erhöht sich deterministisch.
- Aktive Tasks laufen über definierte Tickdauer.
- Simulation funktioniert ohne UI.

### Tests

- Bewegung endet nach 1 Tick.
- Abbau endet nach 10 Ticks.
- Bau endet nach 10 Ticks.
- Produktion endet nach 10 Ticks.

## Phase 6: Roboterbewegung

### Ziel

Roboter kann sich autonom auf Nachbarfelder bewegen.

### Regeln

- Bewegung um 1 Feld kostet 1 Batterie.
- Bewegung dauert 1 Tick.
- Nur orthogonale Bewegung.
- Roboter darf nicht außerhalb der Karte laufen.
- Roboter darf nicht auf blockierte Felder laufen.

### Aufgaben

1. `src/sim/robot/robotActions.ts` erstellen.
2. Bewegungstask implementieren.
3. Einfaches Ziel-Auswahlverfahren:
   - für Erkundung: nächstes unbekanntes angrenzendes oder nahes Feld
   - für Mining: nächstes bekanntes Iron-Ore-Feld
4. Einfache Pfadfindung per BFS auf 10x10-Karte.

### Akzeptanzkriterien

- Roboter kann sich schrittweise zu einem Ziel bewegen.
- Batterie sinkt pro Schritt um 1.
- Sicht wird nach Bewegung aktualisiert.

### Tests

- Roboter bewegt sich zu Nachbarfeld.
- Roboter läuft nicht aus Karte.
- Roboter findet Pfad zu bekanntem Iron-Ore-Feld.

## Phase 6b: Zielauswahl und Pfadfindung

### Ziel

Roboter sollen Ziele deterministisch oder seeded-zufällig auswählen und nicht ausführbare Wege sauber diagnostizieren.

### Aufgaben

1. Manhattan-Distanz als einfache Grid-Distanz dokumentieren.
2. BFS-Pfadfindung für erreichbare Ziele implementieren.
3. Sichtbare Iron-Ore-Felder als Kandidaten für Miner-Programme sammeln.
4. Für Mining das nächst erreichbare Nachbarfeld eines Ressourcenvorkommens suchen.
5. Gleichstände per seeded random entscheiden.
6. Robotertypen mit Explorationserlaubnis vorbereiten.
7. Normale Roboter auf bekannte Ziele beschränken.
8. Autonome Scouts/Spezialisten für Fog/unbekannte Felder vorbereiten.
9. Ladefelder im Kommunikationsbereich von Gebäuden als bekannt markieren.
10. Kein-Pfad-Fälle als nicht ausführbar oder `targetInvalid/noPath` behandeln.
11. Diagnosegründe anzeigen.

### Akzeptanzkriterien

- Miner baut angrenzendes Iron Ore ab, solange Bedingungen erfüllt sind.
- Erschöpftes Iron Ore beendet das Mining-Programm.
- Danach wird der Stack wieder von oben geprüft.
- Miner kann sichtbares weiteres Iron Ore suchen und ein erreichbares Nachbarfeld annavigieren.
- Gleichstände werden zufällig, aber über Seed reproduzierbar entschieden.
- Ladefelder im Kommunikationsbereich können direkt annavigiert werden.
- Wenn kein Pfad existiert, bricht das Programm ab oder gilt als nicht ausführbar.

## Phase 7: Programm-Templates und Stack

### Ziel

MVP-Templates und Stack-Auswertung implementieren.

### Templates

1. Energie sichern
2. Erkunden
3. Iron Ore abbauen
4. Solarkollektor bauen
5. Roboterfabrik bauen
6. Roboter produzieren
7. Stasis-Laden

### Aufgaben

1. `src/sim/programs/templates.ts` erstellen.
2. Standardprogramme erzeugen.
3. `evaluateProgramStack.ts` erstellen.
4. Programme von oben nach unten prüfen.
5. Diagnoseinformationen erzeugen:
   - active
   - skipped
   - blocked
   - reason

### Akzeptanzkriterien

- Deaktivierte Programme werden ignoriert.
- Erstes ausführbares Programm startet eine Task.
- Stasis-Laden ist locked und immer vorhanden.
- UI kann Programme aktiv/inaktiv setzen.

### Tests

- Energie sichern triggert bei Batterie < 20.
- Erkunden triggert bei Batterie > 60 und unbekannten Feldern.
- Mining blockiert ohne bekanntes Iron Ore.
- Produzieren blockiert ohne Fabrik.

## Phase 7b: Ausführungslimits für Bauprogramme

### Ziel

Bauprogramme sollen begrenzen können, wie oft sie erfolgreich ausgeführt werden. Das ist die Basis für Programme wie „baue genau einen Solarkollektor“.

### Regeln

Ein Programm kann haben:

```ts
executionLimit: "unlimited" | "once" | { count: number }
```

oder als typisierte Struktur:

```ts
type ProgramExecutionLimit =
  | { type: "unlimited" }
  | { type: "once" }
  | { type: "count"; maxExecutions: number };
```

Eine Ausführung zählt erst, wenn der Bauauftrag erfolgreich abgeschlossen wurde.

### Aufgaben

1. `ProgramExecutionLimit` und `ProgramExecutionState` ergänzen.
2. `Program` um `executionLimit` und `executionState` erweitern.
3. Programmstack-Auswertung so anpassen, dass abgeschlossene Programme übersprungen werden.
4. Bei erfolgreichem Bau `completedExecutions` erhöhen.
5. Solarkollektor-Bauprogramm mit `once` oder `count: 1` konfigurieren.
6. Roboterfabrik-Bauprogramm mit `once` oder `count: 1` konfigurieren.
7. Diagnosegrund anzeigen, wenn ein Programm wegen erreichtem Ausführungslimit blockiert ist.

### Akzeptanzkriterien

- Ein Bauprogramm mit `once` läuft nach erfolgreichem Bau nicht erneut.
- Ein Bauprogramm mit `count: 3` kann höchstens drei erfolgreiche Bauten erzeugen.
- Das Limit zählt erfolgreiche Ausführungen, nicht bloße Versuche.
- Diagnose zeigt, wenn das Ausführungslimit erreicht wurde.
- Bestehende MVP-Templates funktionieren weiterhin.

### Tests

- `once`-Programm wird nach erfolgreicher Ausführung blockiert.
- `count: 1` verhält sich wie `once`.
- `count: 3` erlaubt drei erfolgreiche Ausführungen.
- fehlgeschlagene oder blockierte Bauversuche erhöhen den Zähler nicht.

## Phase 7c: Programmstack-Ausführungsregeln

### Ziel

Die Stack-Auswertung und das Verhalten laufender Programme verbindlich implementieren.

### Aufgaben

1. Programme immer von oben nach unten prüfen.
2. Deaktivierte Programme überspringen.
3. Programme mit erreichtem Ausführungslimit überspringen.
4. Erstes ausführbares Programm starten.
5. Laufendes Programm bis Stop-Bedingung, Spielerabbruch, Deaktivierung oder ungültigem Ziel ausführen.
6. Nach Ende eines laufenden Programms Stack wieder von oben prüfen.
7. Abbruch so behandeln, dass das Programm selbst unverändert bleibt.
8. Deaktivierung so behandeln, dass das Programm künftig übersprungen wird.
9. Zielvalidierung für laufende Tasks vorbereiten.
10. Bauprogramme erst bei fertiggestelltem Gebäude als erfolgreiche Ausführung zählen.
11. Diagnosegründe für Überspringen, Blockieren, Abbruch und ungültige Ziele anzeigen.

### Akzeptanzkriterien

- Ein nicht ausführbares Programm führt zur Prüfung des nächsten Programms.
- Das erste ausführbare Programm wird gestartet.
- Ein laufendes Programm wird nicht durch niedrigere Programme ersetzt.
- Nach Stop-Bedingung startet die Stack-Prüfung wieder oben.
- Spielerabbruch verändert das Programm nicht.
- Deaktivierte Programme werden übersprungen.
- Ungültige Ziele brechen laufende Programme ab.
- Bauprogramm-Ausführungslimits zählen erst bei fertiggestelltem Gebäude.

## Phase 8: Laden und Stasis

### Ziel

Laderegeln und Stasis-Sicherheitsprogramm implementieren.

### Regeln

- Ohne Solarkollektor: 1 % pro Sekunde
- Mit Solarkollektor im Wirkbereich: 10 % pro Sekunde
- Stasis bei Batterie <= 1 %
- Stasis lädt bis 50 %
- Stasis-Laden bleibt immer möglich

### Aufgaben

1. Charge-Task implementieren.
2. Prüfen, ob Roboter im Ladebereich eines Solarkollektors ist.
3. Stasis-Status implementieren.
4. Event-Log-Einträge:
   - Stasis betreten
   - Stasis verlassen
   - Ladeziel erreicht

### Akzeptanzkriterien

- Roboter lädt ohne Solarkollektor langsam.
- Roboter lädt im Solarkollektorbereich schneller.
- Roboter verlässt Stasis bei 50 %.

### Tests

- 10 Ticks ohne Solarkollektor geben +10 Batterie.
- 5 Ticks mit Solarkollektor können von 1 auf 50 bringen.
- Stasis blockiert normale Programme.

## Phase 8b: Energiemanagement und Charging Modes vorbereiten

### Ziel

Das Energiemanagement soll selbstladefähige Roboter und später extern versorgte Roboter unterscheiden.

### MVP-Regeln

Aktiv:

- Starter Roboter kann sich selbst laden.
- Solar Collector lädt Roboter auf orthogonal angrenzenden Feldern automatisch.
- Ladeprogramm des Starter Roboters bleibt nutzbar.
- Roboterfabrik benötigt weiterhin Leistung vom Solar Collector.

Vorbereitet:

- `ChargingMode`
- `selfCharging`
- `externalOnly`
- `hybrid`
- Diagnosegrund für nicht erreichbare externe Stromversorgung

Nicht aktiv:

- Grid Energy Lines
- externe-only Spezialroboter
- komplexe Energienetze
- begrenzte Ladeleistung

### Aufgaben

1. `ChargingMode` in `types.ts` ergänzen.
2. Robotertyp um `chargingMode` erweitern.
3. Starter Roboter als `hybrid` oder `selfCharging` konfigurieren.
4. Automatische Ladung neben aktivem Solar Collector berechnen.
5. Orthogonale Nachbarschaft verwenden; diagonale Nachbarschaft zählt nicht.
6. Ladeprogramm von automatischer Ladefunktion trennen.
7. Diagnosegrund für fehlende externe Stromversorgung vorbereiten.
8. Grid Energy Lines nur im Modell/Future Notes erwähnen, nicht aktiv implementieren.

### Akzeptanzkriterien

- Starter Roboter kann ohne Solar Collector langsam laden.
- Starter Roboter lädt neben Solar Collector schneller.
- Roboter auf diagonalen Feldern werden nicht durch Solar Collector geladen.
- Ladeprogramm entscheidet, wann ein Roboter eine Ladeposition aufsucht.
- Der tatsächliche Batteriezuwachs erfolgt über die automatische Ladefunktion.
- Keine Grid Energy Lines erscheinen im MVP-Spiel.

### Tests

- Starter Roboter lädt ohne externe Quelle mit MVP-Basisrate.
- Starter Roboter lädt orthogonal neben Solar Collector mit Solar-Rate.
- Diagonal neben Solar Collector findet kein Solar-Laden statt.
- Batterie steigt nicht über `batteryMax`.
- Diagnose für fehlende externe Stromversorgung ist als Reason-Code vorbereitet.

## Phase 9: Iron Ore abbauen

### Ziel

Roboter kann bekannte Iron-Ore-Felder abbauen.

### Regeln

- 1 Abbauaktion = 10 Ticks
- 1 Abbauaktion erzeugt 1 Iron Ore
- 1 Abbauaktion kostet 1 Batterie
- Frachtspeicher max 10
- Feld enthält 20 Iron Ore

### Aufgaben

1. Mining-Task implementieren.
2. Menge im Feld reduzieren.
3. Cargo erhöhen.
4. Stoppen bei Cargo voll oder Feld leer.
5. Log-Einträge:
   - Iron Ore entdeckt
   - Abbau gestartet
   - Frachtspeicher voll
   - Feld erschöpft

### Akzeptanzkriterien

- Roboter baut Iron Ore ab.
- Cargo steigt.
- Feldmenge sinkt.
- Cargo überschreitet 10 nicht.

### Tests

- 10 Mining-Aktionen füllen Cargo auf 10.
- Iron-Ore-Feld reduziert sich korrekt.
- Feld mit 0 Iron Ore gilt als erschöpft.

## Phase 10: Gebäude bauen

### Ziel

Solarkollektor und Roboterfabrik bauen.

### Regeln

- Solarkollektor kostet 5 Iron Ore.
- Roboterfabrik kostet 5 Iron Ore.
- Beide brauchen 1 Feld.
- Roboterfabrik muss orthogonal neben Solarkollektor stehen.
- Bauaktion dauert 10 Ticks.
- Bauaktion kostet 1 Batterie.
- Bau verbraucht Iron Ore aus Frachtspeicher.

### Aufgaben

1. `src/sim/buildings/buildingRules.ts` erstellen.
2. Standortsuche für Solarkollektor:
   - frei
   - bebaubar
   - hat freies orthogonales Nachbarfeld
3. Standortsuche für Roboterfabrik:
   - frei
   - bebaubar
   - orthogonal neben Solarkollektor
4. Build-Task implementieren.
5. Sicht nach Gebäudebau aktualisieren.

### Akzeptanzkriterien

- Solarkollektor wird gebaut.
- Roboterfabrik wird daneben gebaut.
- Cargo wird korrekt reduziert.
- Gebäude belegen Feld.
- Bau blockiert, wenn Bedingungen fehlen.

### Tests

- Solarkollektor kostet 5 Iron Ore.
- Fabrik kann nicht ohne Solarkollektor gebaut werden.
- Fabrik wird nur orthogonal angrenzend gebaut.
- Gebäude erzeugen Sicht.

## Phase 11: Leistung und Produktion

### Ziel

Roboterfabrik produziert den zweiten Roboter.

### Regeln

- Solarkollektor stellt 100 Energie Leistung bereit.
- Roboterfabrik nimmt während Produktion 40 Leistung ab.
- Produktion dauert 10 Ticks.
- Nach Produktion existiert ein zweiter Roboter.
- MVP-Ziel erreicht.

### Aufgaben

1. `src/sim/production/productionRules.ts` erstellen.
2. Freie Leistung benachbarter Solarkollektoren berechnen.
3. Produktion nur starten, wenn >= 40 freie Leistung vorhanden.
4. Produktionstask an Fabrik oder State speichern.
5. Nach Abschluss Standardroboter erzeugen.
6. Event-Log:
   - Produktion gestartet
   - Produktion abgeschlossen
   - MVP-Ziel erreicht

### Akzeptanzkriterien

- Produktion startet nur bei benachbartem Solarkollektor.
- Während Produktion ist Fabrik aktiv/producing.
- Nach 10 Ticks entsteht neuer Roboter.
- `mvpGoalReached = true`.

### Tests

- Fabrik blockiert ohne Solarkollektor.
- Fabrik blockiert bei zu wenig freier Leistung.
- Produktion erzeugt Roboter.
- MVP-Ziel wird gesetzt.

## Phase 11b: Siegbedingung, Score und Zeitlimit

### Ziel

MVP-Punktesieg nach 600 Ticks implementieren.

### Regeln

- Das MVP-Zeitlimit beträgt 600 Ticks.
- Nach 600 Ticks wird `timeLimitReached = true`.
- Für den MVP soll die Simulation bei Ablauf des Zeitlimits automatisch pausieren.
- Die UI zeigt eine Ergebnisübersicht.

### Punktewertung

```text
+1 Punkt pro abgebauter Iron-Ore-Einheit
+25 Punkte pro gebautem Solarkollektor
+50 Punkte pro gebauter Roboterfabrik
+100 Punkte pro produziertem Roboter
+200 Punkte Zielbonus, wenn mindestens ein zusätzlicher Roboter produziert wurde
```

### Aufgaben

1. Score-Konstanten in `MVP_CONFIG` ergänzen.
2. `ScoreState` in `types.ts` ergänzen.
3. Score-Werte im `GameState` speichern.
4. Beim erfolgreichen Mining Punkte und `ironOreMined` erhöhen.
5. Beim Bau eines Solarkollektors Punkte und `solarCollectorsBuilt` erhöhen.
6. Beim Bau einer Roboterfabrik Punkte und `robotFactoriesBuilt` erhöhen.
7. Beim Produzieren eines Roboters Punkte und `robotsProduced` erhöhen.
8. MVP-Zielbonus genau einmal vergeben, sobald der erste zusätzliche Roboter produziert wurde.
9. Bei Tick 600 `timeLimitReached = true` setzen.
10. Bei Tick 600 Simulation pausieren.
11. Ergebnisübersicht in der UI anzeigen.

### Ergebnisübersicht

Die Ergebnisübersicht zeigt mindestens:

```text
Score
Abgebautes Iron Ore
Solarkollektoren gebaut
Roboterfabriken gebaut
Roboter produziert
MVP-Ziel erreicht: Ja/Nein
Zeitlimit erreicht: Ja/Nein
```

### Akzeptanzkriterien

- Score erhöht sich deterministisch durch Spielereignisse.
- Ausgegebene Ressourcen reduzieren den historischen Ressourcenscore nicht.
- MVP-Zielbonus wird nicht mehrfach vergeben.
- Bei 600 Ticks wird das Zeitlimit ausgelöst.
- Ergebnisübersicht ist sichtbar.
- `npm test` und `npm run build` laufen erfolgreich.

### Tests

- Mining von 1 Iron Ore gibt +1 Punkt.
- Bau eines Solarkollektors gibt +25 Punkte.
- Bau einer Roboterfabrik gibt +50 Punkte.
- Produktion eines Roboters gibt +100 Punkte.
- Zielbonus gibt +200 Punkte und nur einmal.
- Nach 600 Ticks ist `timeLimitReached = true`.
- Nach Ablauf des Zeitlimits ist `isPaused = true`.

## Phase 12: Canvas-Karte und PNG-Assets

### Ziel

Karte sichtbar machen und die vom Nutzer bereitgestellten PNG-Assets korrekt verwenden.

### Erwartete Asset-Pfade

Der MVP erwartet folgende PNG-Dateien:

```text
public/assets/tiles/plain.png
public/assets/resources/iron-ore.png

public/assets/units/start-robot.png

public/assets/buildings/solar-collector.png
public/assets/buildings/robot-factory.png
```

Diese Dateien werden vom Nutzer bereitgestellt. Der Coding-Agent soll die Pfade, Lade-Logik und Fallback-Darstellung vorbereiten, aber keine finalen Assets erzeugen.

### Rendering-Regeln

- jedes Kartenfeld zeichnet zuerst `plain.png`
- enthält das Feld Iron Ore und `amount > 0`, wird `iron-ore.png` als transparentes Overlay darüber gezeichnet
- erschöpfte Iron-Ore-Felder verwenden nur `plain.png`
- Gebäude und Roboter werden als separate Sprites über den Feldern gezeichnet

### Aufgaben

1. `MapCanvas.tsx` erstellen.
2. Einfache Image-Loading-Logik für Terrain-, Ressourcen- und Objekt-Assets erstellen.
3. `plain.png` für alle normalen Felder verwenden.
4. `iron-ore.png` als transparentes Overlay für Felder mit Iron Ore und `amount > 0` verwenden.
5. `start-robot.png` für den Startroboter verwenden.
6. `solar-collector.png` für Solarkollektoren verwenden.
7. `robot-factory.png` für Roboterfabriken verwenden.
8. 10x10-Raster zeichnen.
9. Felder nach Sichtstatus darstellen:
   - `unknown`: verdeckt
   - `fog`: Terrain/Ressource sichtbar, aber mit Nebel-Overlay
   - `visible`: normal sichtbar
10. Auswahl per Mausklick implementieren.
11. Zoomstufen unterstützen.
12. Fallback-Farben und einfache Marker zeichnen, falls PNGs fehlen oder noch nicht bereitgestellt wurden.

### Akzeptanzkriterien

- Karte ist links sichtbar.
- Normale Felder verwenden `plain.png`, sobald verfügbar.
- Iron-Ore-Felder verwenden `plain.png` plus `iron-ore.png`, solange dort Iron Ore vorhanden ist.
- Erschöpfte Iron-Ore-Felder fallen auf normales Terrain zurück.
- Startroboter und Gebäude verwenden ihre separaten PNG-Sprites.
- Fehlende PNG-Dateien führen nicht zu einem Absturz.
- Sicht/Fog funktioniert visuell über den Assets.
- Roboterposition ist sichtbar.
- Klick auf Roboter/Gebäude/Feld setzt Auswahl.
- Zoom ändert Darstellungsgröße.

### Nicht umsetzen

- Keine finalen Sprites für zusätzliche Robotertypen nötig.
- Keine Animationen nötig, wenn Zeit knapp ist.
- Keine Asset-Pipeline über PNG-Laden hinaus.


## Phase 13: UI-Seitenleiste

### Ziel

Rechte Seitenleiste mit Status, Programmen und Diagnose.

### Aufgaben

1. `RightPanel.tsx` erstellen.
2. Bei Roboterauswahl anzeigen:
   - Name
   - Batterie
   - HP
   - Cargo
   - Position
   - aktives Programm
   - aktiver Task
   - Programmstack
3. Programme aktiv/inaktiv schalten.
4. Template hinzufügen.
5. Einfache Diagnose anzeigen.
6. Bei Gebäudeauswahl anzeigen:
   - Typ
   - Status
   - Leistung/Verbrauch
   - Sichtweite
7. Bei Feldauswahl anzeigen:
   - Koordinate
   - Sichtstatus
   - Ressource
   - Gebäude

### Akzeptanzkriterien

- Spieler kann den Roboterstatus verstehen.
- Spieler kann Programme aktivieren/deaktivieren.
- Blockierte Programme zeigen Gründe.
- Gebäude zeigen relevante Werte.

## Phase 13b: GUI-Programmiereditor und Blocksystem

### Ziel

Der Spieler soll Programme über farbige, editierbare Bausteine verstehen und im MVP zumindest Templates bearbeiten können.

### MVP-Aufgaben

1. Programmübersicht für Roboter anzeigen.
2. Programme im Stack per Drag-and-drop sortierbar machen.
3. Fallback: Hoch-/Runter-Buttons, falls Drag-and-drop nicht rechtzeitig umgesetzt wird.
4. Aktivieren/Deaktivieren-Button pro Programm ergänzen.
5. Deaktivierte Programme mit Skip-Icon markieren.
6. Aktives Programm hervorheben.
7. Blockierte Programme mit Diagnosegrund anzeigen.
8. Templates zum Stack hinzufügen.
9. Template-Parameter editierbar machen.
10. Programmnamen editierbar machen.
11. Programme öffnen und Detailansicht anzeigen.
12. Conditions als Container aus Sensor, Operator und Value darstellen.
13. Nur passende Operatoren für Sensoren anbieten.
14. Werte abhängig vom Sensor validieren.
15. Basis-Bausteinbibliothek für Sensoren, Operatoren, Werte, Aktionen und Programmsteuerung vorbereiten.

### Spätere Aufgaben

- vollständiger freier Block-Editor
- Drag-and-drop einzelner Bausteine aus Bibliothek
- verschachtelte Bedingungsgruppen
- komplexe Programmsteuerungsbausteine
- Forschungsfreischaltung neuer Bausteine
- Schema- und Bauplan-Editor

### Akzeptanzkriterien MVP

- Spieler sieht den Programmstack.
- Spieler kann Templates aktivieren/deaktivieren.
- Skip-Icon für deaktivierte Programme ist sichtbar.
- Spieler kann Template-Werte wie Batteriegrenzen ändern.
- Ungültige Werte werden verhindert oder markiert.
- Operatorauswahl passt zum gewählten Sensor.
- Spieler kann Programme im Stack umsortieren.

## Phase 14: Untere Steuerleiste

### Ziel

Zeitsteuerung, Zoom und Eventlog einbauen.

### Aufgaben

1. `BottomBar.tsx` erstellen.
2. Start/Pause-Button.
3. Geschwindigkeiten 1x, 2x, 4x.
4. Tick-/Zeit-Anzeige.
5. Zoomsteuerung:
   - -
   - Prozentwert
   - +
6. Mausrad-Zoom im Canvas.
7. Eventlog mit letzten 5 bis 8 Meldungen.

### Akzeptanzkriterien

- Simulation kann pausiert/gestartet werden.
- Geschwindigkeit wirkt auf Tick-Fortschritt.
- Zoomsteuerung funktioniert.
- Log zeigt wichtige Ereignisse.

## Phase 15: MVP-Flow-Test

### Ziel

Einen automatisierten Flow testen.

### Aufgaben

1. `mvpFlow.test.ts` erstellen.
2. Mit einem festen Seed starten.
3. Programme aktivieren.
4. Simulation so lange laufen lassen, bis:
   - Iron Ore gefunden
   - Cargo gefüllt
   - Solarkollektor gebaut
   - Fabrik gebaut
   - Roboter produziert
5. Sicherheitslimit, z. B. 10.000 Ticks.

### Akzeptanzkriterien

- Test erreicht `mvpGoalReached = true`.
- Test läuft deterministisch.
- Test bricht mit klarer Fehlermeldung ab, wenn Flow nicht funktioniert.

## Phase 16: Polishing für spielbaren MVP

### Ziel

Den Prototyp bedienbar machen.

### Aufgaben

- klare Startansicht
- sichtbare MVP-Zielanzeige
- sichtbare Pausen-/Geschwindigkeitsanzeige
- Tooltips für Programme
- verständliche Blockermeldungen
- Reset/New Game Button
- Seed-Anzeige optional

### Akzeptanzkriterien

- Neuer Nutzer kann erkennen, was passiert.
- Programmwechsel sind im Log sichtbar.
- Roboteraktivität ist nachvollziehbar.
- Zielerreichung wird klar angezeigt.

## 4. Reihenfolge strikt einhalten

Coding-Agent soll diese Reihenfolge bevorzugen:

1. Datenmodell
2. Tests
3. Simulation
4. Map/Fog
5. Programmstack
6. Ressourcen/Gebäude/Produktion
7. UI
8. Polishing

Nicht mit UI beginnen, bevor die Kernsimulation testbar ist.

## 5. Definition of Done pro Arbeitspaket

Ein Arbeitspaket ist abgeschlossen, wenn:

- Code kompiliert
- betroffene Tests existieren
- Tests grün sind
- Build grün ist
- keine MVP-fremden Features eingebaut wurden
- relevante Akzeptanzkriterien erfüllt sind

## Spätere Phase: Forschungsbaum und Kommunikationsgrid

### Forschung

Aufgaben:

1. Forschungsprojekte mit IDs, Voraussetzungen, Kosten, Dauer und Unlocks modellieren.
2. Forschungszweige definieren: Infrastruktur, Energie, Industrie, Ressourcenextraktion, Einheiten, Kommunikation, Programm-Gestaltungsoptionen, Kampf.
3. KI-Forschungszentrum als Voraussetzung für Forschung verwenden.
4. Programm-Gestaltungsoptionen als eigenen Forschungszweig vorbereiten.
5. Forschung im initialen MVP nicht aktivieren.

### Kommunikationsgrid

Aufgaben:

1. `CommunicationMode` pro Einheit ergänzen.
2. Normale Arbeitsroboter als `gridRequired` definieren.
3. Scouts/Spezialisten als `scoutLocked` oder `autonomous` vorbereiten.
4. Normale Gebäude mit Kommunikationsreichweite 3 Felder definieren.
5. Sendeturm mit Kommunikationsreichweite 5 Felder definieren.
6. Reichweite per Manhattan-Distanz ohne Diagonalen berechnen.
7. Gridpflichtige Einheiten nur innerhalb des Grids bewegen lassen.
8. Gridpflichtige Einheiten außerhalb des Grids auf `disconnected`/Stasis/offline setzen.
9. UI-Status `disconnected` mit Icon vorsehen.
10. Gruppenänderungen nur auf verbundene Einheiten anwenden.

Akzeptanzkriterien:

- Reichweite 3 und 5 wird ohne Diagonalen berechnet.
- Gridpflichtige Einheiten verlassen das Grid nicht aktiv.
- Wenn das Grid unter einer Einheit wegfällt, wird sie disconnected/stasis/offline.
- Offline-Einheiten reagieren nicht auf Gruppenänderungen.
- Forschungsbaum ist vorbereitet, aber nicht MVP-aktiv.

## Spätere Phase: Bau-Schemata und Programm-Gestaltungsoptionen

### Ziel

Bauprogramme sollen später räumliche Schemata und Gebäudelisten nutzen können.

### Funktionen

- L-Formen
- Linien
- 3x3-Blöcke
- Ringe
- freie Bauformen
- Gebäudelisten pro Schema
- automatische Platzierungsbewertung
- Feldreservierungen

### Forschung

Diese Funktionen gehören zum späteren Forschungszweig:

```text
Programm-Gestaltungsoptionen
```

Mögliche Freischaltungen:

- Ausführungslimits
- Bau-Schemata
- Komplexe Baupläne
- Bauplatzbewertung
- Reservierungslogik

### Nicht im initialen MVP implementieren

- Schema-Editor
- Gebäudelisten für Schemata
- automatische Mehrgebäude-Baupläne
- Forschungszweig Programm-Gestaltungsoptionen

## Spaetere Phase: Gebaeudestufen und Level-2-Gebaeude

### Ziel

Gebaeudestufen und forschungsabhaengige Level-2-Gebaeude spaeter ergaenzen. Nicht Teil des initialen MVP.

### Level 1

Level-1-Gebaeude:

- Solar Collector
- Roboterfabrik
- KI-Forschungszentrum

Im MVP aktiv:

- Solar Collector
- Roboterfabrik

Im MVP nicht aktiv:

- KI-Forschungszentrum

### Level 2

Level-2-Gebaeude werden durch Forschung freigeschaltet.

Vorgesehene Level-2-Gebaeude:

- Sendeturm
- Grid Energy Line
- Verbesserte Roboterfabrik
- Drohnenfabrik
- Gasfoerderanlage / Gasmine
- Stahlwerk

### Funktionen

- Sendetuerme erweitern das Kommunikationsgrid.
- Grid Energy Lines erweitern Energieversorgung ueber direkte Nachbarschaft hinaus.
- Verbesserte Roboterfabriken produzieren schneller oder fortgeschrittene Einheiten.
- Drohnenfabriken produzieren flugfaehige Einheiten.
- Gasfoerderanlagen foerdern Gas aus Gasvorkommen.
- Stahlwerke verarbeiten Iron Ore und Energie zu Steel Plates.

### Steel Plates

Spaetere verarbeitete Ressource:

```text
2 Iron Ore + 10 Energie + 10 Ticks
-> 1 Steel Plate
```

Steel Plates werden fuer hoehere Gebaeude, groessere Fabriken und robuste Einheiten verwendet.

### Nicht im initialen MVP implementieren

- Level-2-Gebaeude
- Steel-Plates-Produktion
- Produktionsrezepte
- Gebaeudefreischaltung durch Forschung
- Energienetzlinien
- Kommunikationsgrid-Ausbau
- Drohnenproduktion

## Spätere Phase: Einheitenstufen und spezialisierte Einheiten

### Ziel

Einheitenstufen und spezialisierte Robotertypen später ergänzen. Nicht Teil des initialen MVP.

### Level 0

Level-0-Einheit:

- Starter Roboter

Rolle:

- Initialisierungseinheit
- Grundfunktionen
- Iron-Ore-Abbau
- Level-1-Basisbau
- Notfall-Allrounder

### Level 1

Level-1-Einheiten:

- Iron Miner
- Boden Scout
- Nahkampfdrohne
- Konstrukteur

Funktionen:

- Iron Miner baut Iron Ore effizienter ab.
- Boden Scout erkundet Bodenterrain und kann ggf. Grid-Regeln anders behandeln.
- Nahkampfdrohne übernimmt frühe Verteidigung.
- Konstrukteur kann fortgeschritten bauen und Gebäude über Level 1 errichten.

### Level 2

Level-2-Einheiten:

- Miner für neue Ressourcen
- Transportroboter
- Fernkampfdrohne

Funktionen:

- Miner für neue Ressourcen erschließen Gas, Silicium oder andere spätere Rohstoffe.
- Transportroboter bewegen Materialien zwischen Abbau, Lager, Fabriken und Baustellen.
- Fernkampfdrohnen übernehmen Distanzkampf und fortgeschrittene Verteidigung.

### Nicht im initialen MVP implementieren

- Level-1-Spezialroboter
- Level-2-Spezialroboter
- Einheitenfreischaltung durch Forschung
- spezialisierte Produktionsgebäude für diese Einheiten
- Kampflogik für Nahkampf- oder Fernkampfdrohnen
- Logistiksystem für Transportroboter

## Spätere Phase: Forschung und Technologie

### Ziel

Forschung ist nicht Teil des initialen MVP. Dieses Kapitel hält fest, wie das System später ergänzt werden soll.

### Grundidee

- Forschung wird durch ein KI-Forschungszentrum freigeschaltet.
- Forschung kostet Ressourcen und Zeit.
- Jedes KI-Forschungszentrum erzeugt Forschungskapazität.
- Jedes Rechenzentrum kann einem aktiven Forschungsprojekt zugewiesen werden.
- Mehrere Rechenzentren an einem Projekt beschleunigen dessen Abschluss.
- Werden Rechenzentren auf mehrere Projekte verteilt, können mehrere Forschungen parallel laufen.

### Spätere Forschungswirkungen

Forschung kann später:

- Einheitenwerte verbessern, z. B. HP, Laderaum, Abbaugeschwindigkeit, Schaden
- neue Gebäude freischalten
- neue Einheiten freischalten
- neue Programm- und Automatisierungsfunktionen freischalten
- einen Forschungssieg ermöglichen

### Nicht im MVP implementieren

Für die initiale MVP-Umsetzung ausdrücklich nicht bauen:

- KI-Forschungszentrum
- Forschungsmenü
- Forschungsdatenmodell im aktiven GameState
- Forschungsprojekte
- Forschungskapazität
- parallele Forschung
- Upgrades
- Forschungssieg

## 6. Nicht implementieren

Nicht im initialen MVP implementieren:

- Kampf
- Gegner
- Alien-Fraktionen
- Forschung
- Kommunikationsgrid
- Gruppenstacks
- Scout-Spezialregeln
- Speicherstände
- Sound
- echte Pixelart
- komplexe Animation
- aktive Lava-/Quecksilberflüsse
- aktiver Umweltschaden
- fliegende Einheiten
- Backend
- Multiplayer

Diese Features sind konzeptionell vorgesehen, aber nicht Teil der ersten Umsetzung.
- Silicium
- Gasraffinerie
- Siliciumförderung
- mehrstufige Produktionsketten
- Ressourcenfreischaltung durch Forschung
- Bau-Schema-Editor