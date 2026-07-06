# Roboter-Logikspiel Konzept - Zwischenstand

## Dokumentationsstand

Dieses Paket ist Version v111. Es basiert auf v110 und definiert Expansion 1
(Forschung + Tier-2-Einstieg) als ersten Ausbauschritt nach dem implementierten MVP.

Umgesetzt wurde:

```text
1. Neues Scope-Dokument docs/02-mvp/expansion-1-scope.md als Quelleigentuemer
   fuer den Expansion-1-Umfang.
2. Aktivierte Systeme: KI-Forschungszentrum, Forschung (4 Projekte), Stahlwerk
   mit Rezept, Energiespeicher, Ressource steelPlates, Template-Bibliothek,
   Ausfuehrungslimits nach basicAutomation1.
3. Bootstrap-Kostenregel: Expansion-1-Baukosten ohne Steel-Plate-/Silicon-
   Zirkularitaet (Forschungszentrum 10 Ore, Stahlwerk 8 Ore, Energiespeicher
   4 Steel Plates); Future-Werte bleiben Rebalancing-Referenz.
4. canonical-data-model.md: ResearchState, SteelProductionTask, neue
   PlayerCommands/RejectionReasons/GameEventCodes/AssetKeys/Template-IDs,
   GameState.research.
5. mvp-constants.md: EXP1_*-Konstanten.
6. tick-pipeline.md: Schritt 3 verarbeitet Gebaeudetasks (Produktion,
   Stahlwerk, Forschung); EnergySnapshot mit Speicherregel.
7. energy-system.md: Expansion-1-Verbraucher und Energiespeicher-Pufferregel.
8. initial-game-state.md: initialer ResearchState.
9. Assets: drei neue Gebaeude-AssetKeys mit Fallback-Pflicht.
10. Testmatrix: EXP1-Serie (RES/STEEL/ESTOR/BUILD/TPL/GOAL/E2E/DOC).
11. deterministic-id-generation.md: SteelProductionTaskId-Muster.
12. v110-Berichtsdateien nach docs/archive verschoben.
```

## Bewusst nicht aktiviert

```text
Logistik, MaterialRequests, Transportroboter
Ressourcenspeicher, Grid Energy Line (funktionslos ohne Logistik/lokale Netze)
Kommunikationsgrid-Wirkung, weitere Einheiten, Gas/Silicon, Combat/Hazards
```

## Keine MVP-Aenderung

v111 aendert keine MVP-Regel: Siegbedingung, Score, Batterie-/Bewegungs-/
Mining-/Bau-/Produktionsregeln und Startzustand bleiben unveraendert
(einzige additive Ausnahme: GameState.research startet leer).

## Implementierungsstand

MVP vollstaendig implementiert und deployt (siehe IMPLEMENTATION-STATUS.md).
Expansion 1 ist mit diesem Paket spezifiziert; Implementierung folgt als Stufe 4.
