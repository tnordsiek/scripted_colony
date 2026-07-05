# Combat und Hazards

Nicht MVP.

## Kampf

Später vorgesehene Einheiten:

- Nahkampfdrohne
- Fernkampfdrohne
- flugfähige Drohnen

## HP

Alle Einheiten und Gebäude haben HP. MVP zeigt HP, aber hat keine aktiven Schadensquellen.

## Gefahren

Vorbereitet:

- Lavafluss
- Quecksilberfluss
- Geröll
- Umweltschaden
- fliegende Einheiten

Erste Schadensidee:

```text
-1 HP pro Tick auf/bei gefährlichem Terrain
```

## Kampf-Forschungszweig

`combatDefense` umfasst `research.meleeCombat1`, `research.defenseRoutines1` und `research.rangedCombat1`. Kampf bleibt nicht MVP.

Vollständig dokumentiert in `docs/05-future/research-tree.md`.

## Einheitenwerte

MVP aktiv bleiben:

- Starter Roboter
- Iron Miner als erster gespawnter Zielroboter

Nicht MVP / Future:

- Boden Scout
- Konstrukteur
- Nahkampfdrohne
- Resource Miner
- Transportroboter
- Fernkampfdrohne

Alle diese Einheiten besitzen kanonische Startwerte für HP, Batterie, Startbatterie, Cargo, Sichtweite, MovementType, ChargingMode, CommunicationMode, Rollen, erlaubte Aktionen und Produktionsdaten.

Hauptdokument:

```text
docs/05-future/building-and-unit-tiers.md
```
