# Asset Fallbacks

## Status

Dieses Dokument ist die zentrale Spezifikation fuer Asset-Fallbacks im MVP.

Der Nutzer plant, nach Moeglichkeit finale Assets bereitzustellen. Trotzdem darf der MVP nicht von finalen Art Assets abhaengen.

Verbindliche Grundregel:

```text
Finale Assets haben Vorrang.
Fehlende finale Assets blockieren Simulation, Rendering und MVP-Abnahme nicht.
Jeder MVP-AssetKey muss einen definierten Fallback haben.
Fehlende Fallbacks sind ein technischer Fehler.
```

## Zweck

Asset-Fallbacks stellen sicher, dass der MVP jederzeit vollstaendig renderbar bleibt.

Sie sind verbindlich fuer:

```text
Terrain
Fog of War
Ressourcenfelder
Roboter
Gebaeude
Construction-State
Production-State
Selection / Highlight
UI Icons und Statusanzeigen
Tests
```

## Grundentscheidung

```text
Fallbacks sind Teil des MVP und nicht nur Debug-Hilfen.
```

Fehlendes finales Asset bedeutet:

```text
Simulation laeuft weiter.
Rendering nutzt Fallback.
Debug-Diagnose darf geschrieben werden.
Player Eventlog bleibt still, ausser ein UI-kritisches Element kann gar nicht gerendert werden.
```

Fehlender Fallback bedeutet:

```text
technischer Fehler
Test schlaegt fehl
MVP-Abnahme blockiert
```

## Kanonische Typdefinitionen

Die TypeScript-Definitionen fuer `AssetKey`, `RenderAsset`, `RenderAssetKind`, `AssetRegistry`, `FallbackAssetRegistry`, `AssetResolutionResult`, `resolveAsset` und `resolveAssetDetailed` stehen genau einmal in:

```text
docs/03-technical/canonical-data-model.md#asset-registry
```

Dieses Dokument definiert keine eigenen Asset-Typen. Es beschreibt die verbindlichen Fallback-Regeln und die erwarteten visuellen Fallbacks fuer die dort definierten MVP-AssetKeys.

Verbindliche Regeln:

```text
canonical-data-model.md ist die einzige Quelle fuer Asset-Typdefinitionen.
asset-fallbacks.md ist die Quelle fuer Fallback-Verhalten und Fallback-Akzeptanzregeln.
asset-inventory.md listet die MVP-Keys tabellarisch fuer Review und Abnahme.
```

Future-Keys duerfen vorbereitet werden, sind aber nicht MVP-blockierend und duerfen die kanonische MVP-AssetKey-Union nicht ohne Fallback-Ergaenzung erweitern.

## Asset-Aufloesung

Die kanonischen Signaturen stehen im Datenmodell. Fachlich gilt:

```text
loadedAssets
  partielle Registry finaler Assets
  darf einzelne MVP-Keys nicht enthalten

fallbackAssets
  vollstaendige Registry aller MVP-AssetKeys
  darf keinen MVP-Key auslassen

resolveAsset(...)
  render-sicherer Pfad
  liefert RenderAsset oder wirft technischen Fehler bei fehlendem Fallback

resolveAssetDetailed(...)
  Diagnose-/Testpfad
  liefert AssetResolutionResult mit final, fallback oder missingFallback
```

Normale UI- und Map-Renderer verwenden `resolveAsset(...)` und muessen danach nicht zwischen finalem Asset und Fallback unterscheiden. Tests, Diagnosepanels und Asset-Review verwenden `resolveAssetDetailed(...)`, wenn sie pruefen muessen, ob ein finales Asset, ein Fallback oder ein fehlender Fallback verwendet wurde.

Verbindliche Regeln:

```text
resolveAsset(...) darf fuer MVP-AssetKeys niemals undefined zurueckgeben.
resolveAssetDetailed(...) ist die einzige API, die missingFallback als Datenwert zurueckgibt.
missingFallback ist ein technischer Fehler und blockiert MVP-Abnahme.
```


Diagnose-Events:

```text
resolveAssetDetailed(...) darf debug.asset.fallbackUsed vorbereiten, wenn ein Fallback statt eines finalen Assets verwendet wird.
resolveAssetDetailed(...) muss debug.asset.missingFallback vorbereiten, wenn kein Fallback fuer einen MVP-AssetKey vorhanden ist.
resolveAsset(...) gibt diese Diagnose nicht als Datenwert zurueck; Renderer koennen sie ignorieren oder ueber einen separaten Diagnosepfad sammeln lassen.
```

## Finale Assets vs. Fallbacks

Wenn ein finales Asset vorhanden ist:

```text
finales Asset verwenden
kein Fallback verwenden
kein Fallback-Debug-Event erzeugen
```

Wenn finales Asset fehlt und Fallback vorhanden ist:

```text
Fallback verwenden
optional debug.asset.fallbackUsed erzeugen
kein Player Event erzeugen
```

Wenn finales Asset fehlt und Fallback fehlt:

```text
technischer Fehler
Test schlaegt fehl
MVP nicht abnahmefaehig
```

## Kanonische Fallbacks

### Terrain

| Key | Fallback | MVP-Regel |
|---|---|---|
| `terrain.plains` | sandfarbene quadratische Kachel, optional leichte Noise-/Dither-Variation | aktiv |
| `terrain.unknown` | neutral dunkle Placeholder-Kachel | fuer unbekannte/future Terrain-Typen |

Nicht aktive Terrain-Typen wie `rubble`, `lavaRiver` und `mercuryRiver` duerfen im MVP auf `terrain.unknown` fallen.

### Fog of War

| AssetKey | Fallback | Regel |
|---|---|---|
| `fog.unknown` | dunkle, undurchsichtige Kachel | fuer `Field.visibility = "unknown"`; darf keine Ressourcen verraten |
| `fog.discovered` | abgedunkelte bekannte Kachel | fuer `Field.visibility = "discovered"`; nur bekannte Basisform |

Wichtig:

```text
Fuer `Field.visibility = "visible"` wird kein Fog-Overlay verwendet. Es gibt keinen kanonischen AssetKey `fog.visible`.
Fog-of-War-Fallback darf keine versteckten Ressourcen verraten.
Iron Ore darf nicht sichtbar gerendert werden, wenn Field.visibility = unknown.
Iron Ore wird im MVP nur bei Field.visibility = visible gerendert; discovered zeigt keine Resource-Fallbacks.
```

### Ressourcen

| Key | Fallback | Regel |
|---|---|---|
| `resource.ironOre` | plains tile + braun/orange Ore-Marker | nur bei visibility = visible anzeigen |

Bei `Field.visibility = "unknown"`:

```text
kein Ore-Fallback anzeigen
```

### Roboter

| Key | Fallback | Regel |
|---|---|---|
| `robot.starterRobot` | neutral/blauer Roboter-Marker mit kleinem Command-Punkt | eindeutig vom Iron Miner unterscheidbar |
| `robot.ironMiner` | kompakter Miner-Marker mit Ore-/Cargo-Akzent | eindeutig vom Starter unterscheidbar |

Regel:

```text
starterRobot und ironMiner duerfen nicht denselben Fallback verwenden.
```

### Gebaeude

| Key | Fallback | Regel |
|---|---|---|
| `building.solarCollector` | Gebaeudefeld mit Solarpanel-Symbol | eindeutig von Roboterfabrik unterscheidbar |
| `building.robotFactory` | Fabrik-/Werkstatt-Symbol | eindeutig von Solar Collector unterscheidbar |
| `building.aiResearchCenter` | Gebaeudefeld mit Forschungs-/Antennensymbol (violett) | Expansion 1; eindeutig unterscheidbar |
| `building.steelworks` | Gebaeudefeld mit Schmelz-/Ambosssymbol (dunkelrot) | Expansion 1; eindeutig unterscheidbar |
| `building.energyStorage` | Gebaeudefeld mit Batteriesymbol (gruen) | Expansion 1; eindeutig unterscheidbar |
| `building.construction` | halbtransparente Gebaeudeform + Baustellenrahmen | darf nicht wie active aussehen |

Regel:

```text
Alle aktiven Gebaeudetypen muessen visuell unterscheidbar sein.
status = construction darf nicht gleich aussehen wie status = active.
```

### Production-State

| Key | Fallback | MVP-Minimum |
|---|---|---|
| `ui.productionPaused` | Warnsymbol oder Textstatus im Panel | Textstatus reicht |
| `ui.spawnBlocked` | Warnsymbol oder Textstatus im Panel | Textstatus reicht |
| `building.resourceStorage` | Gebaeudefeld mit Lager-/Kistensymbol (Expansion 2) | unterscheidbar von anderen Gebaeuden |
| `building.gridEnergyLine` | schmale Leitungs-Leiste auf dem Feld (Expansion 2) | begehbar erkennbar, kein Vollfeld |
| `robot.transportRobot` | kompakter Transporter-Marker (Expansion 2) | unterscheidbar von Starter und Iron Miner |

MVP-Minimum:

```text
Status muss im Roboterfabrik-Panel textlich sichtbar sein.
Map-Icon ist optional.
```

### Selection / Highlight

| Key | Fallback | Regel |
|---|---|---|
| `ui.selection` | 1px/2px Outline | fuer ausgewaehlte Roboter/Gebaeude/Felder |
| `ui.reservation` | gestrichelter Outline | fuer reservierte Bauplaetze |

## Was als Fehler gilt

```text
Fehlendes finales Asset = kein Fehler.
Fehlender Fallback = Fehler.
```

Beispiele:

```text
robot.ironMiner.png fehlt:
  Fallback nutzen
  Debug-Diagnose optional

robot.ironMiner Fallback fehlt:
  Entwicklungsfehler
  Test schlaegt fehl
```

## Diagnosen

Debug Event bei genutztem Fallback:

```text
debug.asset.fallbackUsed
```

Details:

```ts
{
  assetKey: "robot.ironMiner",
  fallbackKey: "robot.ironMiner.fallback"
}
```

Debug/Event bei fehlendem Fallback:

```text
debug.asset.missingFallback
```

Player Eventlog:

```text
kein Player Event bei normalem Asset-Fallback
```

Nur UI-kritische Faelle duerfen player-sichtbar werden, wenn ein UI-Element gar nicht gerendert werden kann. Dieser Fall darf im MVP bei vollstaendiger Fallback-Abdeckung nicht auftreten.

## Akzeptanzkriterium

Das Akzeptanzkriterium ist erfüllt, wenn:

```text
jeder MVP AssetKey zu einem RenderAsset aufloest
finale Assets vor Fallbacks verwendet werden
fehlende finale Assets den MVP nicht blockieren
fehlende Fallbacks Tests fehlschlagen lassen
starterRobot und ironMiner unterscheidbare Fallbacks haben
solarCollector und robotFactory unterscheidbare Fallbacks haben
`fog.unknown`-Felder keine Resource-Fallbacks anzeigen
construction anders aussieht als active building
spawnBlocked im UI sichtbar ist
Fallback-Nutzung hoechstens Debug Events erzeugt, keine Player Event-Flut
```

## Designregel

```text
Art Assets koennen spaeter ersetzt und verbessert werden.
Der MVP bleibt durch definierte Fallbacks jederzeit vollstaendig renderbar.
```
