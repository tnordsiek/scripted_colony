# Asset Inventory

## Status

Dieses Dokument listet die MVP-AssetKeys und ihren Abnahmestatus.

Finale Assets koennen vom Nutzer bereitgestellt werden. Fuer die MVP-Abnahme ist aber entscheidend, dass jeder Key mindestens einen Fallback besitzt.

## MVP AssetKeys

| AssetKey | Finales Asset erwartet | Fallback Pflicht | MVP-blockierend bei fehlendem Fallback |
|---|---:|---:|---:|
| `terrain.plains` | ja | ja | ja |
| `terrain.unknown` | optional | ja | ja |
| `fog.unknown` | optional | ja | ja |
| `fog.discovered` | optional | ja | ja |
| `resource.ironOre` | ja | ja | ja |
| `robot.starterRobot` | ja | ja | ja |
| `robot.ironMiner` | ja | ja | ja |
| `building.solarCollector` | ja | ja | ja |
| `building.robotFactory` | ja | ja | ja |
| `building.construction` | optional | ja | ja |
| `ui.selection` | optional | ja | ja |
| `ui.reservation` | optional | ja | ja |
| `ui.productionPaused` | optional | ja | ja |
| `ui.spawnBlocked` | optional | ja | ja |

## Regel

```text
Finale Assets verbessern die Darstellung.
Fallbacks sichern die MVP-Funktionsfaehigkeit.
```

Fehlende finale Assets werden nicht als MVP-Fehler behandelt.
Fehlende Fallbacks sind MVP-blockierend.
