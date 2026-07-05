# Canonical Data Model Consistency Check

## Ergebnis

`docs/03-technical/canonical-data-model.md` wurde in v44 konsolidiert.

## Bereinigt

- Mehrfachdefinitionen entfernt.
- Alter einfacher `Program`-Typ durch `ProgramInstance`/`ProgramRow` ersetzt.
- Alte `RobotTaskType`-Werte wie `move`, `charge`, `mine`, `build`, `produce`, `wait` sind nicht mehr kanonisch.
- `RobotTaskType` nutzt nur noch:
  - `movement`
  - `mining`
  - `building`
  - `charging`
  - `stasisCharging`
  - `logistics`
- `BuildingType` enthält nun verbindlich:
  - `energyStorage`
  - `resourceStorage`
- `BuildingStatus` enthält nun verbindlich:
  - `construction`
- `standardRobot` wurde aus dem kanonischen `RobotType` entfernt.
- `PlayerCommand` enthält nun `startIronMinerProduction`.
- `GameState` enthält `materialRequests` als vorbereitetes, im MVP leeres Future-Feld.
- Score-Regel präzisiert: Roboter-Score und MVP-Zielbonus erst nach erfolgreichem Spawn.

## Nicht gelöst

Dieser Schritt löst nicht:

- Explore-/Mining-Sackgasse
- Produktionskostenquelle des Iron Miner
- vollständigen Initial GameState
- Action-Executability-Matrix
- Build-Zielauswahl
- Diagnose-/Eventlog-Feinspezifikation
- Testmatrix
- MVP-Energie-Topologie
