# Pfadfindung und Map-Generierung

Kanonische TypeScript-Typdefinitionen stehen in `docs/03-technical/canonical-data-model.md`. Codebloecke in diesem Dokument sind algorithmische Auszuege und Referenzdaten.
## Manhattan-Distanz

```text
Distanz = |x1 - x2| + |y1 - y2|
```

Nur orthogonale Schritte zählen.

## Pfadfindung

MVP: BFS über passierbare Felder.

Blockiert:

- Gebäude
- Baustellen
- nicht passierbares Terrain
- ggf. Roboter, wenn sie Weg vollständig blockieren

## Gleichstände

Gleichstände dürfen zufällig entschieden werden. Zufall muss über `GameState.randomSeed` reproduzierbar sein und den kanonischen Algorithmus aus `docs/03-technical/seeded-rng.md` verwenden.

## Miner-Zyklus

```text
IF neben Iron Ore AND Cargo nicht voll AND genug Batterie
THEN Iron Ore abbauen
```

Wenn Feld erschöpft:

```text
Mining bricht ab
→ Stackprüfung oben
```

Zweites Programm:

```text
IF genug Batterie
THEN sichtbares Iron Ore suchen
AND nächst erreichbares Nachbarfeld anlaufen
```

## Fog und Unbekanntes

- Normale Roboter nutzen bekannte Ziele.
- Autonome Scouts/Spezialisten dürfen Fog/unbekannte Felder betreten.
- Sichtweite deckt Felder vor Betreten auf.

## Map-Generierung

- Seed-basiert nach `docs/03-technical/seeded-rng.md`.
- 10x10.
- 20 Iron-Ore-Felder.
- kein Iron Ore in initialer Sicht des Starter Roboters.
- ein Vorkommen in 4-6 Schritten erreichbar.
- 100 Versuche, dann Fallback.

## MVP-Map-Generator

Der MVP-Map-Generator ist algorithmisch festgelegt.

## Ziel

Der Generator erzeugt deterministisch eine faire MVP-Karte.

MVP-Regeln:

- Karte: 10x10
- Terrain: nur `plains`
- Startposition: `{ x: 5, y: 5 }`
- Startroboter-Sichtweite: 2
- initiale Sicht: quadratischer Radius 2
- kein Iron Ore im initial sichtbaren Bereich
- insgesamt 20 Iron-Ore-Felder
- jedes Iron-Ore-Feld enthält 20 Iron Ore
- mindestens ein erreichbares Iron-Ore-Feld liegt in BFS-Distanz 4-6 vom Start
- Iron Ore entsteht in orthogonal verbundenen Clustern
- Clustergröße: 3-8
- maximal 100 Generierungsversuche
- gleicher Seed erzeugt gleiche Karte
- nach 100 Fehlschlägen wird eine feste Fallback-Karte verwendet

## MVP-Konfiguration

```ts
type MapGenerationConfig = {
  width: number;
  height: number;
  seed: string;
  startPosition: { x: number; y: number };
  starterSightRange: number;
  ironOreFieldCount: number;
  ironOrePerField: number;
  requiredReachableIronOreMinDistance: number;
  requiredReachableIronOreMaxDistance: number;
  minClusterSize: number;
  maxClusterSize: number;
  maxGenerationAttempts: number;
};
```

```ts
const MVP_MAP_CONFIG: MapGenerationConfig = {
  width: 10,
  height: 10,
  seed: "mvp-default",
  startPosition: { x: 5, y: 5 },
  starterSightRange: 2,
  ironOreFieldCount: 20,
  ironOrePerField: 20,
  requiredReachableIronOreMinDistance: 4,
  requiredReachableIronOreMaxDistance: 6,
  minClusterSize: 3,
  maxClusterSize: 8,
  maxGenerationAttempts: 100,
};
```

## Generator-Ablauf

```text
generateMvpMap(seed):
  config = MVP_MAP_CONFIG mit seed

  for attempt in 0..99:
    rng = createSeededRng(makeRngInput([seed, "map", attempt]))

    map = createPlainMap(10, 10)
    start = { x: 5, y: 5 }

    noOreZone = fieldsWithinSquareRadius(start, 2)

    targetRing = fieldsWhere:
      field not in noOreZone
      AND bfsDistance(start, field) between 4 and 6

    placeGuaranteedOreCluster(map, targetRing, rng)
    placeRemainingOreClusters(map, rng)

    applyInitialVisibility(map, start, sightRange = 2)

    if validateMvpMap(map, config):
      return map

  return createFallbackMvpMap()
```

## Plain-Map-Erzeugung

```text
Erzeuge 10x10 Felder.
Setze jedes Feld auf terrainType = plains.
Setze visibility initial auf unknown.
Setze keine Ressourcen.
Setze keine Gebäude.
```

## Initiale No-Ore-Zone

Der Startroboter darf an der Startposition kein Iron Ore sehen.

Bei Startposition `{ x: 5, y: 5 }` und Sichtweite 2 gilt:

```text
initial sichtbare Zone:
x = 3..7
y = 3..7
```

In dieser Zone darf kein Iron Ore liegen.

## Zielring für garantiertes Iron Ore

Zielring:

```text
nicht in initial sichtbarer Zone
AND BFS-Distanz vom Start >= 4
AND BFS-Distanz vom Start <= 6
```

Obwohl im MVP alles `plains` ist, wird BFS verwendet, damit der Generator später mit Hindernissen kompatibel bleibt.

## Garantiertes erstes Ore-Cluster

Regeln:

```text
1. Wähle seeded-random nach `docs/03-technical/seeded-rng.md` ein Feld aus dem Zielring.
2. Platziere dort Iron Ore.
3. Wachse daraus ein Cluster mit Zielgröße 3-5.
4. Wachstum nur orthogonal.
5. Keine Felder in initial sichtbarer Zone.
6. Keine doppelten Felder.
```

Damit ist gesichert:

```text
Iron Ore ist nicht sofort sichtbar,
aber mindestens ein Vorkommen ist nach 4-6 Bewegungsschritten erreichbar.
```

## Weitere Ore-Cluster

Danach werden weitere Cluster platziert, bis insgesamt 20 Iron-Ore-Felder existieren.

```text
while oreFieldCount < 20:
  wähle seeded-random nach `docs/03-technical/seeded-rng.md` Cluster-Seed außerhalb No-Ore-Zone
  Zielgröße = random 3..8, begrenzt durch noch fehlende Felder
  wachse Cluster orthogonal
  füge gültige Felder hinzu
```

## Cluster-Wachstum

```text
placeOreCluster(map, seedCoord, targetSize, rng):
  cluster = [seedCoord]
  setze seedCoord als Iron Ore

  while cluster.length < targetSize:
    source = random vorhandenes Clusterfeld
    candidates = orthogonale Nachbarn von source
    candidates filtern:
      - innerhalb Karte
      - nicht in No-Ore-Zone
      - noch kein Iron Ore
    wenn keine candidates:
      versuche anderes Clusterfeld
    sonst:
      wähle seeded-random nach `docs/03-technical/seeded-rng.md` candidate
      setze candidate als Iron Ore
      füge candidate zu cluster hinzu

  return cluster
```

Diagonal zählt nicht als Cluster-Verbindung.

## Iron-Ore-Feld

Jedes Iron-Ore-Feld erhält:

```ts
field.resource = {
  type: "ironOre",
  amount: 20,
  extractionMethod: "directMining",
};
```

## Initiale Sicht

```text
Felder im quadratischen Radius 2 um Start:
visibility = visible

alle anderen Felder:
visibility = unknown
```

Zum Spielstart gibt es im MVP nur:

```text
visible
unknown
```

`discovered` entsteht später während Bewegung/Fog-Updates.

## Sichtquellen nach Start

Nach Spielstart wird Sicht aus allen aktiven Sichtquellen berechnet:

```text
Roboter mit status = active
Gebäude mit status = active und isEnabled = true
```

Gebäude nutzen im MVP denselben Chebyshev-Radius-Ansatz wie Roboter:

```text
MVP_BUILDING_SIGHT_RANGE = 2
max(abs(field.x - building.x), abs(field.y - building.y)) <= building.sightRange
```

Gebäude in `construction`, `disabled`, `destroyed` oder mit `isEnabled = false` decken keine Felder auf. Gebäudesicht beeinflusst nur `visibility`; sie erzeugt keine lokale Energieversorgung.

## Sichtzustands-Übergänge

`Field.visibility` ist kein rein aktueller Renderzustand, sondern speichert, ob ein Feld jemals gesehen wurde.

Kanonische Übergangsregel pro Sichtaktualisierung:

```text
1. Berechne currentVisibleFields aus allen aktuellen Sichtquellen.
2. Für jedes Feld:
   - wenn Feld in currentVisibleFields liegt:
       visibility = visible
   - sonst wenn vorher visibility = visible oder discovered war:
       visibility = discovered
   - sonst:
       visibility = unknown
```

Damit gilt:

```text
unknown -> visible, wenn ein Feld erstmals in Sicht kommt
visible -> discovered, wenn ein Feld nicht mehr in aktueller Sicht liegt
discovered -> visible, wenn ein Feld wieder in Sicht kommt
discovered -> discovered, solange es bekannt, aber aktuell nicht sichtbar ist
unknown -> unknown, solange es nie sichtbar war
```

`visible` wird also in jedem Sichtupdate neu aus aktuellen Sichtquellen berechnet. `discovered` bleibt als Gedächtniszustand erhalten, sobald ein Feld mindestens einmal sichtbar war.

## Anzeige- und Informationsregeln

```text
unknown:
  dunkle/undurchsichtige Kachel
  keine Terrain-Details außer generischem Unknown-Fallback
  keine Ressourcen anzeigen
  keine versteckten Gebäude oder dynamischen Inhalte anzeigen

discovered:
  abgedunkelte bekannte Kachel
  Terrain-Basisform darf bekannt bleiben
  statische, bereits entdeckte Kartenform darf angezeigt werden
  keine aktuellen dynamischen Inhalte garantieren
  keine Ressourcen anzeigen; im MVP erscheinen Resource-Marker nur bei visible

visible:
  normale Kachel
  aktuelle Ressourcen, Roboter, Gebäude, Baustellen und Reservierungen anzeigen
```

Für den MVP gilt die einfache Ressourcenregel:

```text
Iron Ore wird nur gerendert, wenn Field.visibility = visible.
```

Diese Regel verhindert, dass `unknown`- oder `discovered`-Felder durch Resource-Fallbacks versteckte Ressourcen verraten.

## Fairness-Validator

Nach jeder generierten Karte prüft `validateMvpMap`:

```text
1. Karte ist 10x10.
2. Startposition ist { x: 5, y: 5 }.
3. Genau 20 Iron-Ore-Felder existieren.
4. Jedes Iron-Ore-Feld hat amount = 20.
5. Jedes Iron-Ore-Feld hat extractionMethod = directMining.
6. Kein Iron Ore liegt im initial sichtbaren Bereich.
7. Mindestens ein Iron-Ore-Feld liegt in BFS-Distanz 4-6 vom Start.
8. Alle Ore-Felder liegen innerhalb der Karte.
9. Cluster wachsen nur orthogonal.
10. Alle Felder sind im MVP terrainType = plains.
```

Wenn eine Prüfung fehlschlägt, wird der Versuch verworfen.

## Retry-Logik

```text
for attempt in 0..99:
  rng = createSeededRng(makeRngInput([seed, "map", attempt]))
  candidate = generateCandidateMap(rng)
  if validateMvpMap(candidate):
    return candidate

return createFallbackMvpMap()
```

`Math.random()` darf nicht direkt verwendet werden. Es muss der Seeded-RNG-Algorithmus aus `docs/03-technical/seeded-rng.md` verwendet werden.


## Referenzwerte fuer Seed `mvp-default`

Diese Referenzwerte sind fuer Tests von `generateMvpMap("mvp-default")` verbindlich. Sie gelten fuer `MVP_MAP_CONFIG` und den Seeded-RNG aus `docs/03-technical/seeded-rng.md`.

Referenz-Erzeugungsregeln:

```text
Alle FieldCoord-Kandidaten werden vor seeded Auswahl nach y aufsteigend, dann x aufsteigend sortiert.
Der angenommene Versuch ist attempt = 0.
Der RNG-Eingabestring fuer diesen Versuch ist 11:mvp-default|3:map|1:0.
Fallback wird fuer mvp-default nicht verwendet.
Cluster-Seed-Kandidaten sind alle Felder ausserhalb der initial sichtbaren Zone ohne vorhandenes Ore.
Cluster-Source-Kandidaten sind aktuelle Clusterfelder mit mindestens einem gueltigen Nachbarfeld.
Cluster-Source-Kandidaten und Nachbar-Kandidaten werden ebenfalls nach y, dann x sortiert.
Die Zielgroesse des letzten Clusters darf durch die noch fehlende Feldanzahl kleiner als minClusterSize werden.
```

Selektions-Checkpoints:

| Schritt | Kandidaten | Seed-Index | Seed-Feld | Roh-Zielgroesse | Effektive Zielgroesse | Rest vor Schritt |
|---|---:|---:|---|---:|---:|---:|
| Garantiertes Cluster | 46 | 27 | `{ x: 1, y: 6 }` | 4 | 4 | 20 |
| Zusatzcluster 1 | 71 | 14 | `{ x: 4, y: 1 }` | 8 | 8 | 16 |
| Zusatzcluster 2 | 63 | 36 | `{ x: 9, y: 5 }` | 7 | 7 | 8 |
| Zusatzcluster 3 | 56 | 43 | `{ x: 7, y: 8 }` | 8 | 1 | 1 |

Kanonische Iron-Ore-Koordinaten fuer `generateMvpMap("mvp-default")`, sortiert nach y, dann x:

```ts
const MVP_DEFAULT_IRON_ORE_FIELDS: FieldCoord[] = [
  { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
  { x: 9, y: 3 },
  { x: 8, y: 4 }, { x: 9, y: 4 },
  { x: 8, y: 5 }, { x: 9, y: 5 },
  { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 },
  { x: 0, y: 7 }, { x: 1, y: 7 },
  { x: 7, y: 8 },
];
```

Kartenvisualisierung fuer die Referenzwerte:

```text
Legende: O = Iron Ore, S = Startposition, . = kein Iron Ore

 y=0  ..........
 y=1  ..OOOO....
 y=2  ..OOOO....
 y=3  .........O
 y=4  ........OO
 y=5  .....S..OO
 y=6  OO......OO
 y=7  OO........
 y=8  .......O..
 y=9  ..........
```

Pruefwerte:

```text
generateMvpMap("mvp-default") akzeptiert attempt 0.
Fallback wird nicht verwendet.
Iron-Ore-Felder: 20
Iron Ore gesamt: 400
Initial sichtbare Felder: 25
Initial sichtbare Iron-Ore-Felder: 0
Ore-Felder mit BFS-/Manhattan-Distanz 4-6 vom Start: 16
Naechste Ore-Distanz nach bestehender Validator-Regel: 3
Koordinaten-Signatur: 40375871
Grid-Signatur: 317699538
```

Die Koordinaten-Signatur ist `fnv1a32Utf8(...)` aus `docs/03-technical/seeded-rng.md` ueber den String:

```text
2,1|3,1|4,1|5,1|2,2|3,2|4,2|5,2|9,3|8,4|9,4|8,5|9,5|0,6|1,6|8,6|9,6|0,7|1,7|7,8
```

Die Grid-Signatur ist `fnv1a32Utf8(...)` ueber die zehn Grid-Zeilen, verbunden mit `\n`, ohne Legende und ohne y-Praefixe.

Hinweis zur Distanz: Diese Referenzwerte bilden die kanonische Validator-Regel ab. Verbindlich ist, dass kein Ore im initial sichtbaren Quadrat liegt und dass mindestens ein erreichbares Ore-Feld in Distanz 4-6 existiert. Die Referenzwerte fuehren keine Mindestdistanzregel fuer jedes Ore-Feld ein.

## Fallback-Karte

Startposition:

```text
[5,5]
```

Iron-Ore-Felder:

```text
[1,1], [1,2], [2,1], [2,2],
[8,1], [8,2], [9,1], [9,2],
[1,8], [1,9], [2,8], [2,9],
[8,8], [8,9], [9,8], [9,9],
[5,1], [6,1], [7,1], [7,2]
```

Die Felder `[5,1]`, `[6,1]`, `[7,1]`, `[7,2]` erfüllen die Fairnessregel:

```text
BFS-/Manhattan-Distanz vom Start: 4-6
```

Alle Fallback-Ore-Felder liegen außerhalb der initial sichtbaren Zone.

## Benannte Implementierungsfunktionen

```ts
createPlainMap(width, height): Field[][];
getInitialVisibleFields(start, sightRange): FieldCoord[];
isInInitialVisibleArea(coord, start, sightRange): boolean;
manhattanDistance(a, b): number;
bfsDistance(map, from, to): number | null;
getOrthogonalNeighbors(coord): FieldCoord[];
placeOreCluster(map, seedCoord, targetSize, rng, rules): FieldCoord[];
countOreFields(map): number;
validateMvpMap(map, config): boolean;
createFallbackMvpMap(): Field[][];
makeRngInput(parts): string;
createSeededRng(input): SeededRng;
generateMvpMap(seed, config): Field[][];
```

## Testfälle

```text
1. gleicher Seed erzeugt gleiche Karte
2. unterschiedliche Seeds dürfen unterschiedliche Karten erzeugen
3. Karte ist 10x10
4. Startposition ist { x: 5, y: 5 }
5. genau 20 Iron-Ore-Felder
6. jedes Iron-Ore-Feld enthält 20 Iron Ore
7. kein Iron Ore in initial sichtbarer Zone
8. mindestens ein Iron-Ore-Feld in BFS-Distanz 4-6
9. Fallback-Karte ist valide
10. nach 100 Fehlschlägen wird Fallback-Karte verwendet
```

## Pfadfindung und Kollisionen

Pfadfindung und Kollisionen sind im MVP eindeutig geregelt.

## Bewegungsmodell

Roboter bewegen sich auf dem 10x10-Sektorgitter.

MVP-Regeln:

```text
eine Bewegung = 1 Feld
nur orthogonal
keine Diagonalen
1 Tick pro Bewegungsschritt
1 Batterie pro erfolgreichem Bewegungsschritt
```

Erlaubte Richtungen:

```text
oben
unten
links
rechts
```

Nicht erlaubt:

```text
diagonal
```

## Begehbarkeit von Feldern

Ein Feld ist fuer einen Ground-Roboter begehbar, wenn:

```text
innerhalb der Karte
AND Terrain fuer ground passierbar
AND kein Gebaeude
AND keine Baustelle
AND kein aktives Ressourcenfeld
AND kein anderer Roboter
```

MVP-Regeln:

- `plains` ist begehbar.
- Gebaeude blockieren Bewegung.
- Baustellen blockieren Bewegung.
- aktive Iron-Ore-Felder blockieren Bewegung.
- erschoepfte Iron-Ore-Felder blockieren nicht mehr.
- Roboter blockieren Bewegung temporaer.

Aktives Ressourcenfeld:

```text
resource.amount > 0
```

Wenn ein Iron-Ore-Feld erschoepft ist:

```text
resource.amount = 0
-> aktiver Ressourcentyp verschwindet
-> Feld kann begehbar und spaeter bebaubar werden
```

## Ein Roboter pro Feld

Auf einem Feld darf maximal ein Roboter stehen.

Nicht erlaubt:

```text
2 Roboter auf demselben Feld
```

Auch kurzfristig innerhalb eines Ticks ist Stapeln nicht erlaubt.

## Pfadfindung

Die MVP-Pfadfindung verwendet BFS.

Regeln:

- BFS ueber orthogonale Nachbarn.
- keine diagonale Bewegung.
- alle Bewegungskosten sind gleich.
- BFS beruecksichtigt Gebaeude, Baustellen, aktive Ressourcen und Roboter.
- Vor jedem Bewegungsschritt wird der Pfad neu berechnet oder neu validiert.

Grundregel:

```text
Recompute path before each movement step.
```

Wenn kein Pfad existiert:

```text
Aktion bricht ab
Diagnose: Kein Pfad zum Ziel
Stack-Pruefung beginnt wieder oben
```

## Zieltypen

### Mining

Mining laeuft nicht auf das Iron-Ore-Feld selbst.

Zielobjekt:

```text
Iron-Ore-Feld
```

Laufziel:

```text
begehbares orthogonales Nachbarfeld des Iron-Ore-Feldes
```

Wenn kein erreichbares Nachbarfeld existiert:

```text
Aktion nicht ausfuehrbar
Diagnose: Zielnachbarfeld nicht erreichbar
```

### Bauen

Zielobjekt:

```text
Baufeld oder Baustelle
```

Laufziel:

```text
begehbares orthogonales Nachbarfeld des Baufeldes / der Baustelle
```

Wenn kein erreichbares Nachbarfeld existiert:

```text
Aktion nicht ausfuehrbar
Diagnose: Zielnachbarfeld nicht erreichbar
```

### Laden

Zielobjekt:

```text
Solar Collector / Ladequelle
```

Laufziel:

```text
begehbares Feld neben Ladequelle
```

Wenn kein Feld erreichbar ist:

```text
Aktion nicht ausfuehrbar
Diagnose: Kein erreichbares Ladefeld
```

### Scouting

`Scoute Nahfeld` waehlt intern ein begehbares Erkundungsziel.

Dieses Ziel ist keine sichtbare Condition.

## Zielauswahl bei Gleichstand

Wenn mehrere gleichwertige Ziele oder Pfade moeglich sind:

```text
1. kuerzester BFS-Pfad gewinnt
2. bei Gleichstand entscheidet seeded random nach `docs/03-technical/seeded-rng.md`
```

Alle Gleichstaende muessen reproduzierbar sein.

Nicht erlaubt:

```text
Math.random() direkt
```

## Kollisionen

MVP-Kollisionen werden deterministisch aufgeloest.

Regel:

```text
Roboterbewegungen werden pro Tick in stabiler Reihenfolge nach Robot-ID verarbeitet.
```

Ablauf:

```text
1. Roboter nach ID sortieren.
2. Fuer jeden Roboter aktuelle Belegung pruefen.
3. Pfad zum Ziel neu berechnen.
4. naechsten Schritt pruefen.
5. Bewegung nur ausfuehren, wenn Zielfeld jetzt frei ist.
```

Wenn zwei Roboter dasselbe Feld wollen:

```text
Roboter mit frueherer ID bewegt zuerst.
zweiter Roboter sieht Feld als blockiert.
```

## Kein direkter Platztausch

Direkter Platztausch ist im MVP nicht erlaubt.

Beispiel:

```text
Robot A steht auf [5,5]
Robot B steht auf [5,4]
A will nach [5,4]
B will nach [5,5]
```

Ergebnis:

```text
Tausch findet nicht statt.
Bewegung gilt als blockiert.
```

## Keine Pfadreservierungen

Im MVP gibt es keine langfristigen Pfadreservierungen.

Nicht MVP:

```text
Roboter reserviert gesamten Pfad.
```

MVP-Regel:

```text
nur aktuelle Feldbelegung zaehlt.
nur Baufelder/Baustellen werden reserviert.
```

## Temporaere Roboterblockade

Wenn der naechste Schritt durch einen anderen Roboter blockiert ist:

```text
Roboter wartet bis zu 3 Ticks.
```

Technisch:

```text
blockedByRobotTicks += 1
```

Wenn:

```text
blockedByRobotTicks >= 3
```

Dann:

```text
Aktion bricht ab
Diagnose: Weg durch Roboter blockiert
Stack-Pruefung beginnt wieder oben
```

Bei erfolgreicher Bewegung:

```text
blockedByRobotTicks = 0
```

Bei permanenter Blockade durch Gebaeude, Baustelle, aktive Ressource oder Kartenrand:

```text
sofort kein Pfad / Aktion nicht ausfuehrbar
```

## Keine Deadlock-Aufloesung im MVP

Nicht MVP:

- automatisches Ausweichen
- Pushen
- Platztausch
- Pfadreservierungen
- Traffic-System
- Warteschlangen
- Gruppenbewegung

MVP-Regel:

```text
temporaere Roboterblockade -> bis zu 3 Ticks warten
danach Aktion abbrechen und Stack neu pruefen
```

## Diagnosegruende

MVP-Diagnosen fuer Bewegung:

```text
Kein Pfad zum Ziel
Naechster Schritt blockiert
Weg durch Roboter blockiert
Zielnachbarfeld nicht erreichbar
Kein erreichbares Ladefeld
Direkter Platztausch nicht erlaubt
```

## Implementierungsfunktionen

Fuer die Umsetzung sollen diese Funktionen angelegt werden:

```ts
isInsideMap(coord): boolean;
isTerrainPassable(terrainType, movementType): boolean;
hasActiveResource(field): boolean;
hasBuilding(field): boolean;
hasConstruction(field): boolean;
hasRobotOnField(coord, gameState): boolean;
isFieldWalkableForRobot(coord, robot, gameState): boolean;
findPathBfs(map, from, goals, gameState): PathResult;
findReachableNeighborOf(targetCoord, robot, gameState): FieldCoord | null;
getNextStep(path): FieldCoord | null;
tryMoveOneStep(robot, targetCoord, gameState): MoveStepResult;
resolveRobotMovementOrder(robots): Robot[];
```

## Testfaelle

MVP-Testfaelle:

```text
1. Roboter bewegt sich orthogonal.
2. Roboter bewegt sich nicht diagonal.
3. Gebaeude blockiert Bewegung.
4. Baustelle blockiert Bewegung.
5. aktives Iron-Ore-Feld blockiert Bewegung.
6. erschoepftes Iron-Ore-Feld blockiert nicht mehr.
7. anderer Roboter blockiert Bewegung.
8. zwei Roboter koennen nicht auf dasselbe Feld.
9. direkter Platztausch ist nicht erlaubt.
10. Roboter wartet bis zu 3 Ticks bei temporaerer Blockade.
11. nach 3 Blockaden bricht Aktion ab.
12. Mining sucht Nachbarfeld der Ressource.
13. Bauen sucht Nachbarfeld der Baustelle.
14. Laden sucht Nachbarfeld der Ladequelle.
15. kein Pfad erzeugt Diagnose.
16. Bewegungskosten werden nach erfolgreichem Schritt abgezogen.
```

## Long Tasks und Bewegung

Bewegung bleibt ein Ein-Tick-Schritt.

```text
1 Bewegungsschritt = 1 Tick = 1 Batterie bei erfolgreichem Schritt
```

Mining, Bauen und Laden nutzen Pfadfindung, um ein erreichbares Nachbarfeld des Zielobjekts zu finden.

Long-Task-Start erst, wenn die jeweilige Positionsbedingung erfüllt ist:

```text
Mining: Roboter steht neben Iron Ore.
Bauen: Roboter steht neben Baufeld/Baustelle.
Laden: Roboter steht auf gültigem Ladefeld oder neben Ladequelle.
```

Wenn das Ziel während eines Long Tasks ungültig wird, entscheidet die Abschlussprüfung über Erfolg oder Abbruch.

## scoutNearby-Zielauswahl

`action.scoutNearby` nutzt diese interne Zielpriorität:

```text
1. sichtbares Iron Ore ansteuern, wenn es noch nicht angrenzend ist
2. unbekanntes Feld am Rand des sichtbaren Bereichs erkunden
3. zufälliges erreichbares begehbares Feld im erlaubten Erkundungsradius
```

Bei sichtbarem Iron Ore:

```text
Für alle sichtbaren Iron-Ore-Felder:
  suche freie, begehbare, orthogonal angrenzende Nachbarfelder.

Wähle das Ziel mit:
  1. kürzestem BFS-Pfad
  2. bei Gleichstand seeded random nach `docs/03-technical/seeded-rng.md`
```

Wenn kein erreichbares Ziel existiert:

```text
Aktion nicht ausführbar.
Diagnose: Kein erreichbares Nachbarfeld von Iron Ore.
Stack-Prüfung beginnt wieder oben.
```

Diese Zielwahl ist internes Roboterverhalten und kein direkter Bewegungsbefehl des Spielers.

## Scoute Nahfeld mit Zielparameter

`Scoute Nahfeld` ist keine hart auf Iron Ore codierte Aktion.

Stattdessen besitzt `action.scoutNearby` einen konfigurierbaren Zielparameter.

## Problem

Die frühere zu enge Regel lautete sinngemäß:

```text
Scoute Nahfeld steuert sichtbares Iron Ore an.
```

Das war zu speziell.

Problem:

```text
Die Aktion selbst wusste implizit, dass sie auf Iron Ore reagieren soll.
IF- und STOP-Bedingung prüften Iron Ore,
aber THEN enthielt keinen sichtbaren Zielbezug.
```

Dadurch war unklar:

```text
woher der Roboter weiß, auf welchen Sichtkontakt er reagieren soll
wie dieselbe Aktion später für Gas, Silicon, Gegner oder andere Ziele verwendet wird
wie UI-Bausteine und Aktionsparameter konsistent dargestellt werden
```

## Neue Designentscheidung

```text
Scoute Nahfeld erhält einen Zielparameter.
```

Kanonische Bausteinform:

```text
[Scoute Nahfeld] [Ziel: Iron Ore]
```

Kanonisches MVP-Template:

```text
IF NOT Nachbarfeld hat Typ "Iron Ore"
THEN Scoute Nahfeld mit Ziel "Iron Ore"
STOP Nachbarfeld hat Typ "Iron Ore"
OR Roboterstatus = Stasis
```

## Bedeutung

```text
IF prüft:
Ist das Ziel noch nicht angrenzend?

THEN sagt:
Erkunde/bewege dich in der Nähe mit Fokus auf dieses Ziel.

STOP prüft:
Ist das Ziel jetzt angrenzend oder fällt der Roboter in Stasis?
```

Damit beziehen sich IF, THEN und STOP sichtbar auf denselben Zieltyp.

## Technische Aktionsform

```ts
type ScoutNearbyActionParameters = {
  targetFieldType: { type: "fieldType"; value: FieldTypeQuery };
};
```

Im bestehenden `ProgramAction`-Modell:

```ts
const MVP_EXPLORE_ACTION: ProgramAction = {
  actionId: "action.scoutNearby",
  parameters: {
    targetFieldType: { type: "fieldType", value: "ironOre" },
  },
};
```

## Generalisierte Regel

`Scoute Nahfeld mit Ziel X` bedeutet:

```text
1. Wenn Ziel X sichtbar, aber nicht angrenzend ist:
   → bewege dich zu einem erreichbaren Nachbarfeld von Ziel X.

2. Wenn Ziel X noch nicht sichtbar ist:
   → erkunde unknown Randfelder, um Ziel X zu finden.

3. Wenn kein sinnvolles Randfeld existiert:
   → wähle ein erreichbares Fallback-Feld im Erkundungsbereich.
```

Für den MVP gilt:

```text
X = Iron Ore
```

## Future-Verwendung

Dasselbe Aktionsmuster kann später genutzt werden für:

```text
Scoute Nahfeld mit Ziel "Gas"
Scoute Nahfeld mit Ziel "Silicon"
Scoute Nahfeld mit Ziel "Enemy"
Scoute Nahfeld mit Ziel "Free Build Field"
Scoute Nahfeld mit Ziel "Charging Field"
```

## Zielpriorität

Für `Scoute Nahfeld mit Ziel X` gilt:

```text
1. sichtbares Ziel X ansteuern, wenn es noch nicht angrenzend ist
2. unbekanntes Feld am Rand des sichtbaren Bereichs erkunden
3. erreichbares Fallback-Feld im Erkundungsradius wählen
```

## Zielauswahl bei sichtbarem Ziel X

```text
Für alle sichtbaren Felder vom Zieltyp X:
  suche freie, begehbare, orthogonal angrenzende Nachbarfelder.

Wähle das Ziel mit:
  1. kürzestem BFS-Pfad
  2. bei Gleichstand seeded random nach `docs/03-technical/seeded-rng.md`
```

Wichtig:

```text
Der Roboter bewegt sich nicht auf das Zielfeld,
wenn dieses Feld Bewegung blockiert.
Er bewegt sich auf ein freies Nachbarfeld.
```

Für Iron Ore:

```text
aktive Iron-Ore-Felder blockieren Bewegung
Mining braucht orthogonale Nachbarschaft
```

## Zielauswahl bei noch nicht sichtbarem Ziel X

Wenn Ziel X nicht sichtbar ist:

```text
Suche erreichbare begehbare Felder,
von denen aus mindestens ein unknown Feld in Sichtweite sichtbar gemacht werden kann.
```

Kandidaten:

```text
begehbare bekannte/discovered/visible Felder
per BFS erreichbar
Sichtbereich enthält mindestens ein unknown Feld
```

Auswahl:

```text
1. kürzester BFS-Pfad
2. größte Anzahl neu aufdeckbarer unknown Felder
3. bei Gleichstand seeded random nach `docs/03-technical/seeded-rng.md`
```

## Fallback-Ziel

Wenn weder ein sichtbares Ziel X noch ein Randziel existiert:

```text
Wähle ein erreichbares begehbares Feld im erlaubten Erkundungsradius.
```

Tie-Breaker:

```text
1. kürzester BFS-Pfad
2. seeded random nach `docs/03-technical/seeded-rng.md`
```

Wenn auch das nicht existiert:

```text
Aktion nicht ausführbar.
Diagnose: Kein erreichbares Erkundungsziel.
```

## MVP-Erkundungsradius

Für den Startroboter im MVP gilt:

```text
Der Startroboter darf jedes erreichbare Feld der 10x10-Karte als scoutNearby-Ziel wählen.
```

Frühere Distanzparameter fuer `Scoute Nahfeld` sind nicht MVP-kanonisch. Das MVP verwendet ausschließlich den Zielparameter `targetFieldType`; interne Reichweiten- und Balancinggrenzen duerfen spaeter als Future-Regel neu spezifiziert werden.

## Ablauf eines scoutNearby-Tasks

```text
1. Startprüfung
2. Zielauswahl mit Zielparameter
3. MovementTask anlegen
4. pro Tick maximal ein Bewegungsschritt
5. vor jedem Schritt Pfad neu validieren
6. nach erfolgreichem Schritt Sicht aktualisieren
7. Stop-Bedingung prüfen
8. falls Stop nicht erfüllt: Ziel neu bewerten
9. nach Ende Stack-Prüfung wieder oben
```

Bewegungsregeln:

```text
Bewegung: 1 Tick pro Feld
Batteriekosten: 1 Batterie pro erfolgreichem Bewegungsschritt
```

## Ziel-Neubewertung

Nach jedem erfolgreichen Scout-Bewegungsschritt:

```text
Sicht aktualisieren.
Stop-Bedingung prüfen.
Falls Stop nicht erfüllt:
  scoutNearby-Ziel mit demselben Zielparameter neu bewerten.
```

Begründung:

```text
Die Karte ist klein.
BFS ist billig.
Der Roboter reagiert sofort, wenn das konfigurierte Ziel sichtbar wird.
```

## Ende der Aktion

`Scoute Nahfeld mit Ziel X` endet bei:

```text
Ziel erreicht
Stop-Bedingung des Programms erfüllt
Roboter fällt in Stasis
Ziel wird ungültig
kein Pfad mehr verfügbar
Roboter blockiert 3 Ticks lang den nächsten Schritt
Spieler deaktiviert Programm
Spieler bricht Programm ab
```

Danach:

```text
Stack-Prüfung beginnt wieder oben.
```

## Startprüfung

`action.scoutNearby` ist ausführbar, wenn:

```text
Roboterstatus = active
Batterie > 1
targetFieldType ist gesetzt
mindestens ein erreichbares Scout-Ziel existiert
kein aktiver Task läuft
```

Nicht ausführbar, wenn:

```text
Roboter in Stasis
Batterie <= 1
targetFieldType fehlt
kein erreichbares Scout-Ziel
kein Pfad
```

## Diagnosen

Ergänzte Diagnosegründe:

```text
Scouting: Zieltyp sichtbar, Nachbarfeld wird angesteuert
Scouting: unknown Randfeld wird erkundet
Scouting: Fallback-Ziel gewählt
Scouting blockiert: targetFieldType fehlt
Scouting blockiert: kein erreichbares Ziel-Nachbarfeld
Scouting blockiert: kein erreichbares Erkundungsziel
Scouting abgebrochen: kein Pfad
Scouting abgebrochen: Ziel ungültig
Scouting gestoppt: Zieltyp angrenzend
Scouting gestoppt: Stasis
```

## Determinismus

```text
Alle Gleichstände werden seeded deterministic nach `docs/03-technical/seeded-rng.md` entschieden.
Kein Math.random() direkt.
Gleicher Seed + gleicher State = gleiche Zielauswahl.
```

## Beispiel

```text
Programm: Erkunden

IF NOT Nachbarfeld hat Typ "Iron Ore"
THEN Scoute Nahfeld mit Ziel "Iron Ore"
STOP Nachbarfeld hat Typ "Iron Ore"
OR Roboterstatus = Stasis
```

Ablauf:

```text
Tick 0:
Batterie 58/100
Iron Ore sichtbar bei [5,1]
Roboter bei [5,3]
Iron Ore nicht angrenzend

Stack:
Mining nicht ausführbar
Solarbau nicht ausführbar
Fabrikbau nicht ausführbar
Erkunden ausführbar

scoutNearby(targetFieldType = ironOre):
sichtbares Iron Ore vorhanden
freie Nachbarfelder des Ore-Feldes suchen
Ziel [5,2] wählen
Roboter bewegt sich Richtung [5,2]

Tick 1:
Roboter erreicht [5,2]
Nachbarfeld hat Iron Ore
Stop-Bedingung erfüllt
Stack neu prüfen

Mining startet
```

## Designregel

```text
Scoute Nahfeld ist eine parametrisierte autonome Movement-Action.
Die Aktion reagiert nur auf den konfigurierten Zieltyp.
Im MVP lautet der Zielparameter des Erkundungs-Templates: Iron Ore.
Der Spieler gibt weiterhin kein konkretes Bewegungsziel vor.
```

## Startzustand zentral definiert

Der MVP-Startzustand ist zentral definiert in:

```text
docs/02-mvp/initial-game-state.md
```

Kanonische Factory:

```ts
function createInitialGame(seed = "mvp-default"): GameState
```

Startzustand:

```text
tick = 0
randomSeed = "mvp-default"
map = generateMvpMap(seed)
Startroboter bei { x: 5, y: 5 }
Startroboter battery = 100
Startroboter cargo.used = {}
Startroboter sightRange = 2
buildings = []
selected = { type: "robot", id: "robot.starter" }
Score = 0
mvpGoalReached = false
materialRequests = []
```

Startstack:

```text
1. template.mineIronOre
2. template.buildSolarCollector
3. template.buildRobotFactory
4. template.exploreNearby
5. template.stasisCharge
```

Nicht enthalten:

```text
template.secureEnergy
```

## Startposition und Koordinatenlogik

Die Startposition ist eindeutig dokumentiert.

## Kanonische Koordinatenlogik

```text
Die MVP-Karte nutzt 0-basierte Koordinaten.
Gültige Koordinaten bei 10x10 sind x = 0..9 und y = 0..9.
Der Ursprung { x: 0, y: 0 } liegt oben links.
x wächst nach rechts.
y wächst nach unten.
map wird als map[y][x] adressiert.
```

Nicht kanonisch:

```text
map[x][y]
1-basierte Kartenkoordinaten
{ x: 5, y: 5 } als mathematisch exakte Mitte
```

## Kanonische Konstanten

```ts
type FieldCoord = {
  x: number; // 0-based horizontal coordinate, left to right
  y: number; // 0-based vertical coordinate, top to bottom
};

const MVP_MAP_WIDTH = 10;
const MVP_MAP_HEIGHT = 10;

const MVP_VALID_X_RANGE = [0, 9];
const MVP_VALID_Y_RANGE = [0, 9];

const MVP_START_POSITION: FieldCoord = { x: 5, y: 5 };
```

Array-Zugriff:

```ts
const field = map[y][x];
```

## Startposition

```text
Die kanonische MVP-Startposition ist { x: 5, y: 5 }.
```

Wichtig:

```text
{ x: 5, y: 5 } ist eines der vier zentralen Felder der 0-basierten 10x10-Karte.
Es ist nicht als mathematisch exakte Kartenmitte zu beschreiben.
```

Die vier zentralen Felder der 0-basierten 10x10-Karte sind:

```text
{ x: 4, y: 4 }
{ x: 5, y: 4 }
{ x: 4, y: 5 }
{ x: 5, y: 5 }
```

Das MVP verwendet bewusst:

```text
{ x: 5, y: 5 }
```

## Konsistenzregel

Alle Systeme verwenden dieselbe Startpositionskonstante:

```text
MapGenerationConfig.startPosition
createInitialGame(seed)
createStarterRobot()
initiale Sichtberechnung
Map-Generator-Ausschlussregeln
```

Keine Dokumentation darf mehr eine abweichende Startposition nennen.

## Formulierungsregel

Zu vermeiden:

```text
Startroboter steht in der Kartenmitte.
Startposition ist die Mitte der Karte.
center tile
middle of map
```

Kanonisch:

```text
Startroboter steht auf dem kanonischen MVP-Startfeld { x: 5, y: 5 }.
Dieses Feld ist eines der vier zentralen Felder der 0-basierten 10x10-Karte.
```

## Initiale Sicht

Die initiale Sicht verwendet Chebyshev-Distanz:

```text
max(abs(field.x - robot.x), abs(field.y - robot.y)) <= sightRange
```

Bei:

```text
startPosition = { x: 5, y: 5 }
starterSightRange = 2
```

sind initial sichtbar:

```text
x = 3..7
y = 3..7
```

Das ergibt maximal 25 sichtbare Felder.

Zu Spielstart gilt:

```text
visible: alle gültigen Felder im Sichtbereich des Startroboters
unknown: alle übrigen Felder
discovered: keine
```

## Startfeld-Regeln

Das Startfeld wird vom Map-Generator geschützt:

```text
Feld { x: 5, y: 5 } ist immer plains.
Feld { x: 5, y: 5 } enthält keine Ressource.
Feld { x: 5, y: 5 } enthält kein Gebäude.
Startroboter steht auf { x: 5, y: 5 }.
```

Zusätzlich:

```text
Der Map-Generator darf auf der Startposition kein Iron Ore platzieren.
Der Map-Generator darf keine blockierenden Startfeld-Inhalte erzeugen.
```

Die Distanzkonstanten beschreiben das verpflichtende erreichbare Ore-Zielband, nicht die Mindestdistanz jedes Ore-Felds. Die Karte darf außerhalb des initial sichtbaren Bereichs auch nähere Ore-Felder enthalten.

## Fallback-Ore-Felder

Die vorhandenen Fallback-Ore-Felder verwenden ebenfalls 0-basierte Koordinaten.

Beispiel:

```text
{ x: 9, y: 9 }
```

ist bei einer 10x10-Karte das rechte untere Feld und bestätigt die 0-basierte Indexierung.

## Akzeptanzkriterium

Das Akzeptanzkriterium ist erfüllt, wenn:

```text
10x10-Karte nutzt x/y von 0 bis 9.
Ursprung ist oben links.
map[y][x] ist verbindlich.
Startposition ist { x: 5, y: 5 }.
{ x: 5, y: 5 } ist eines der vier zentralen Felder, nicht die exakte Mitte.
Startroboter, MapGenerationConfig und createInitialGame verwenden dieselbe Konstante.
Initial sichtbare Felder sind x = 3..7 und y = 3..7.
Startfeld ist plains, ressourcenfrei und gebäudefrei.
```

## Designregel

```text
Die MVP-Startposition ist kanonisch { x: 5, y: 5 } auf einer 0-basierten 10x10-Karte.
Alle Kartenkoordinaten sind 0-basiert.
Der Ursprung liegt oben links.
map wird als map[y][x] adressiert.
```

## Build-Action Bauplatzwahl

`action.buildBuilding` verwendet eine deterministische interne Bauplatzwahl.

Grundregeln:

```text
Baufeld muss visible, plains, frei von Gebäuden, Ressourcen, Robotern und Reservierungen sein.
Baufeld darf nicht das aktuelle Feld des bauenden Roboters sein.
Zu jedem Baufeld muss ein erreichbares orthogonal angrenzendes Bau-Ausführungsfeld existieren.
Einschluss-Schutz: Ein Baufeld orthogonal neben dem bauenden Roboter ist ungültig,
wenn der Roboter nach dem Bau keinen passierbaren orthogonalen Nachbarn mehr hätte.
Array-Zugriff bleibt map[y][x].
```

Platzierung nach Gebäudetyp:

```text
Solar Collector:
  nearBuilder

Roboterfabrik:
  nearActiveSolarCollector
```

Solar Collector:

```text
Wähle gültiges Baufeld mit kürzestem Pfad zum Bau-Ausführungsfeld.
Tie-Breaker: kürzeste Distanz zum Roboter, dann seeded random nach `docs/03-technical/seeded-rng.md`.
```

Roboterfabrik:

```text
Bevorzuge Felder nahe einem active Solar Collector.
Suche ringweise, falls direkt angrenzend kein gültiges Baufeld existiert.
Tie-Breaker: kürzeste Distanz zum Solar Collector, dann kürzester Roboterpfad, dann seeded random nach `docs/03-technical/seeded-rng.md`.
```

Alle Gleichstände sind seeded deterministic nach `docs/03-technical/seeded-rng.md`.

Commitment-Regel:

```text
Ein Baufeld, das der bauende Roboter bereits fuer sich reserviert hat und das
weiterhin gueltig und erreichbar ist, wird bei der naechsten Zielauswahl
beibehalten. Erst wenn es ungueltig oder unerreichbar wird, erfolgt eine
Neuauswahl (Reservierung freigeben, Zielauswahl neu).
```
