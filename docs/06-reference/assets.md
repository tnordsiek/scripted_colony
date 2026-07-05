# Assets

## Status

Dieses Referenzdokument ist eine fachliche Asset-Uebersicht. Fuer TypeScript-Typen ist `docs/03-technical/canonical-data-model.md#asset-registry` verbindlich. Fuer Fallback-Verhalten und Abnahmeregeln sind `docs/05-assets/asset-fallbacks.md` und `docs/05-assets/asset-inventory.md` verbindlich.

Dieses Dokument darf keine abweichenden Legacy-`AssetId`-Listen definieren. Alle MVP-Assets verwenden die kanonischen `AssetKey`-Werte.

## Asset-Spezifikation

MVP-Assets, Future-Assets, Pfade, Größen, Render-Layer, Fallbacks und Asset-Loading sind fachlich dokumentiert.

## Ziel

Die Asset-Spezifikation erfüllt zwei Aufgaben:

```text
1. MVP-Assets exakt definieren.
2. Future-Assets vorbereiten, ohne sie im MVP zu erzwingen.
```

Das Spiel muss auch ohne finale Bilddateien lauffähig sein.

```text
Wenn ein Asset fehlt, rendert die UI einen Canvas-Fallback.
```

## Stilvorgabe

```text
Kamera: Top-down
Stil: frühe 90er RTS-Optik, Dune-2-inspiriert
Setting: Wüstenplanet
Tile-Stil: flach, klar, RTS-lesbar
Detailgrad: niedrig bis mittel
Wiederholbarkeit: wichtig
Farbwelt: Sand, Rost, dunkles Metall, Solarblau, Signalgrün
Outlines: erlaubt, wenn Lesbarkeit steigt
Animationen: MVP optional
```

Assets dürfen retro-inspiriert sein, müssen aber nicht künstlich niedrig aufgelöst sein.

## Asset-Kategorien

```text
tiles
resources
units
buildings
overlays
ui-icons
effects
```

MVP-relevant:

```text
tiles
resources
units
buildings
overlays
ui-icons
```

Effekte sind optional.

## Größen

```text
Logical tile size: 64x64 px
Source asset size Kartenassets: 128x128 px empfohlen
Canvas render size: skalierbar
```

Regeln:

```text
Terrain-Tiles: 128x128 PNG
Einheiten: 128x128 PNG mit Transparenz
Gebäude: 128x128 PNG mit Transparenz
Ressourcen: 128x128 PNG mit Transparenz
Overlays: 128x128 PNG mit Transparenz
UI-Icons: 32x32 SVG oder PNG
```

Große generierte Terrain-Quellen:

```text
1024x1024 ist für nahtlose Terrain-Quellen erlaubt,
wird aber in der App als Tile oder Subtile heruntergerechnet.
```

## Namenskonvention

```text
Dateien: kebab-case
AssetKeys: punktgetrennte Werte gemaess `docs/03-technical/canonical-data-model.md#asset-registry`
ResourceType / RobotType / BuildingType: camelCase
```

Beispiele:

```text
robotFactory → robot-factory.png
solarCollector → solar-collector.png
ironOre → iron-ore.png
starterRobot → starter-robot.png
resourceStorage → resource-storage.png
```

Keine Leerzeichen, keine Großbuchstaben in Dateinamen.

## Render-Layer

Verbindliche Render-Reihenfolge:

```text
1. Terrain
2. Resource overlay
3. Building / Construction site
4. Unit
5. Fog / Unknown overlay
6. Selection / Debug overlay
7. UI hover / tooltip
```

Auswahl- und Debug-Overlays liegen über Fog/Unknown, damit ausgewählte Objekte oder Felder klar markierbar bleiben.

## MVP-required Assets

### Terrain: Plains

```text
Pfad: public/assets/tiles/plain.png
AssetKey: terrain.plains
Typ: terrain tile
Status: MVP-required
Größe: 128x128 PNG
Transparenz: nein
Wiederholbar: ja
```

Darstellung:

```text
sandiger Wüstenboden
leichte Farbvariation
keine starken Landmarken
tilebar / wiederholbar
```

Fallback:

```text
hellbraunes Rechteck
```

### Terrain: Unknown Placeholder

```text
Pfad: public/assets/tiles/unknown.png
AssetKey: terrain.unknown
Typ: terrain placeholder
Status: MVP-required als Fallback-Key, finales Asset optional
Größe: 128x128 PNG
Transparenz: nein
Wiederholbar: ja
```

Darstellung:

```text
neutrale dunkle Placeholder-Kachel
keine Ressourceninformation
klar von sichtbarem Plains-Terrain unterscheidbar
```

Fallback:

```text
dunkles neutrales Rechteck
```

### Ressource: Iron Ore

```text
Pfad: public/assets/resources/iron-ore.png
AssetKey: resource.ironOre
Typ: resource overlay
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Darstellung:

```text
dunkle Erzbrocken
rostige/rotbraune Akzente
klar vom Sand unterscheidbar
füllt nicht das ganze Tile
```

Fallback:

```text
braunroter Kreis / Marker mit Text "Fe"
```

### Einheit: Starter Roboter

```text
Pfad: public/assets/units/starter-robot.png
AssetKey: robot.starterRobot
Typ: unit sprite
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Darstellung:

```text
kleiner Allround-Roboter
gut sichtbar auf Sand
neutral/metallisch
optional kleiner grüner Signalpunkt
```

Fallback:

```text
blauer Kreis mit "S"
```

### Einheit: Iron Miner

```text
Pfad: public/assets/units/iron-miner.png
AssetKey: robot.ironMiner
Typ: unit sprite
Status: MVP-required / MVP-Ziel
Größe: 128x128 PNG mit Transparenz
```

Darstellung:

```text
robusterer Miner
Bohr-/Greifarm erkennbar
dunkles Metall + Erzfarbe
```

Fallback:

```text
orangefarbener Kreis mit "M"
```

### Gebäude: Solar Collector

```text
Pfad: public/assets/buildings/solar-collector.png
AssetKey: building.solarCollector
Typ: building sprite
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Darstellung:

```text
flaches Solarpanel
dunkelblau/schwarz
technisch klar lesbar
```

Fallback:

```text
blaues Quadrat mit Sonnensymbol
```

### Gebäude: Roboterfabrik

```text
Pfad: public/assets/buildings/robot-factory.png
AssetKey: building.robotFactory
Typ: building sprite
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Darstellung:

```text
kleines Fabrikmodul
metallisch
Tür/Produktionsausgang sichtbar
```

Fallback:

```text
graues Quadrat mit "F"
```

### Gebäude: Baustelle

```text
Pfad: public/assets/buildings/construction-site.png
AssetKey: building.construction
Typ: building/construction overlay
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Darstellung:

```text
Fundament
Baugerüst
Warnmarkierung
```

Fallback:

```text
gelb-schraffiertes Quadrat
```

### Overlay: Unknown

```text
Pfad: public/assets/overlays/unknown.png
AssetKey: fog.unknown
Typ: map overlay
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Fallback:

```text
schwarzes Rechteck mit 85 % Deckkraft
```

### Overlay: Fog

```text
Pfad: public/assets/overlays/fog.png
AssetKey: fog.discovered
Typ: map overlay
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Fallback:

```text
schwarzes Rechteck mit 45 % Deckkraft
```

### Overlay: Selection

```text
Pfad: public/assets/overlays/selection.png
AssetKey: ui.selection
Typ: selection overlay
Status: MVP-required
Größe: 128x128 PNG mit Transparenz
```

Fallback:

```text
gelber Stroke-Rahmen
```

### UI-Highlight: Reservation

```text
Pfad: public/assets/ui/reservation.svg
AssetKey: ui.reservation
Typ: UI highlight overlay
Status: MVP-required als Fallback-Key, finales Icon optional
Größe: 128x128 PNG oder SVG
```

Fallback:

```text
gestrichelter Rahmen fuer reservierte Bauplaetze
```

## Weitere MVP-Fallback-Keys

### UI-Status: Production Paused

```text
Pfad: public/assets/ui/production-paused.svg
AssetKey: ui.productionPaused
Typ: UI status indicator
Status: MVP-required als Fallback-Key, finales Icon optional
Größe: 32x32 SVG oder PNG
```

Fallback:

```text
Warnsymbol oder Textstatus "Produktion pausiert"
```

### UI-Status: Spawn Blocked

```text
Pfad: public/assets/ui/spawn-blocked.svg
AssetKey: ui.spawnBlocked
Typ: UI status indicator
Status: MVP-required als Fallback-Key, finales Icon optional
Größe: 32x32 SVG oder PNG
```

Fallback:

```text
Warnsymbol oder Textstatus "Spawn blockiert"
```

### UI-Icons

UI-Icons sind optional. Textbuttons sind erlaubt.

Empfohlene Pfade:

```text
public/assets/ui/pause.svg
public/assets/ui/play.svg
public/assets/ui/speed-1x.svg
public/assets/ui/speed-2x.svg
public/assets/ui/speed-4x.svg
public/assets/ui/move-up.svg
public/assets/ui/move-down.svg
public/assets/ui/edit.svg
public/assets/ui/reset.svg
public/assets/ui/enabled.svg
public/assets/ui/disabled.svg
public/assets/ui/locked.svg
```

Fallback:

```text
Button-Text statt Icon
```

## Future Assets

### Future Units

```text
public/assets/units/ground-scout.png
public/assets/units/constructor.png
public/assets/units/melee-drone.png
public/assets/units/resource-miner.png
public/assets/units/transport-robot.png
public/assets/units/ranged-drone.png
```

### Future Buildings

```text
public/assets/buildings/ai-research-center.png
public/assets/buildings/communication-tower.png
public/assets/buildings/grid-energy-line.png
public/assets/buildings/advanced-robot-factory.png
public/assets/buildings/drone-factory.png
public/assets/buildings/gas-extractor.png
public/assets/buildings/steelworks.png
public/assets/buildings/energy-storage.png
public/assets/buildings/resource-storage.png
```

### Future Resources

```text
public/assets/resources/gas.png
public/assets/resources/silicon.png
public/assets/resources/steel-plates.png
```

### Future Terrain

```text
public/assets/tiles/rubble.png
public/assets/tiles/lava-river.png
public/assets/tiles/mercury-river.png
```

### Future Effects

```text
public/assets/effects/mining.png
public/assets/effects/building.png
public/assets/effects/charging.png
public/assets/effects/production.png
public/assets/effects/damage.png
public/assets/effects/explosion.png
```

Effekte bleiben optional.

## Fallback-Regel

Das Spiel muss ohne Bilddateien lauffähig sein.

Fallbacks:

```text
Terrain: farbiges Rechteck
Ressource: farbiger Kreis + Label
Einheit: Kreis + Label
Gebäude: Quadrat + Label
Baustelle: schraffiertes Quadrat
Fog/Unknown: halbtransparente Rechtecke
Selection: Stroke-Rahmen
UI-Icon: Textbutton
```

Fehlende Assets dürfen keine Laufzeitfehler erzeugen.

## Asset Registry

Für die Implementierung gibt es eine zentrale Registry.

```ts
// Kanonische Typen nicht hier neu definieren.
// Quelle: docs/03-technical/canonical-data-model.md#asset-registry

const MVP_ASSET_EXAMPLES = [
  {
    key: "terrain.plains",
    source: "assets/tiles/plain.png",
    kind: "image",
    fallback: false,
  },
  {
    key: "robot.starterRobot",
    source: "assets/units/starter-robot.png",
    kind: "image",
    fallback: false,
  },
] satisfies RenderAsset[];
```

## Asset Loading und GitHub Pages

Assetpfade in der Registry sind relativ zu `public/`.

Regel:

```text
Keine hart codierten absoluten /assets/... Pfade.
Alle Assetpfade müssen BASE_URL-kompatibel sein.
```

Vite-kompatible Auflösung:

```ts
function resolveAssetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}
```

Beispiel:

```ts
const assetPath = resolveAssetPath("assets/tiles/plain.png");
```

## MVP-Akzeptanzkriterien Assets

Das Akzeptanzkriterium ist erfüllt, wenn:

```text
1. MVP-AssetKey-Liste ist vollständig.
2. Future-Assetliste ist vorbereitet.
3. Dateipfade sind festgelegt.
4. Namenskonvention ist festgelegt.
5. Assetgrößen sind festgelegt.
6. Render-Layer sind festgelegt.
7. Fallback-Regel ist festgelegt.
8. Asset Registry nutzt die kanonischen AssetKey-Typen.
9. BASE_URL-kompatible Pfadauflösung ist dokumentiert.
10. Spiel läuft ohne echte Bilddateien über Canvas-Fallbacks.
```

## Designregel

```text
Assets unterstützen die Lesbarkeit, blockieren aber nicht die technische MVP-Entwicklung.
MVP-required Assets dürfen durch Fallbacks ersetzt werden.
Future-Assets werden vorbereitet, aber im MVP nicht benötigt.
```

## Asset-Fallbacks

Die zentralen Asset-Fallback-Regeln stehen in:

```text
docs/05-assets/asset-fallbacks.md
```

Grundregel:

```text
Finale Assets haben Vorrang.
Fehlende finale Assets blockieren den MVP nicht.
Jeder MVP-AssetKey muss einen Fallback haben.
Fehlende Fallbacks sind ein technischer Fehler.
```

Zusaetzliches Inventar:

```text
docs/05-assets/asset-inventory.md
```
