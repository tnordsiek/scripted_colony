# Roboter-Logikspiel Konzept - Zwischenstand

## Dokumentationsstand

Dieses Paket ist Version v112. Es basiert auf v111 und definiert Expansion 2
(Logistik + Ladenetz) als naechste Ausbaustufe nach dem implementierten MVP und
Expansion 1.

Umgesetzt wurde:

```text
1. Scope-Dokument docs/02-mvp/expansion-2-scope.md als Quelleigentuemer angelegt.
2. MaterialRequest-Engine spezifiziert: 3 aktive Typen mit Ausloesern, Quellenwahl
   mit Commitment und Reservierung, Zuweisung, keine Teillieferungen.
3. Ladenetz definiert: Ladezonen an Energie-Gebaeuden und begehbaren Gridlines,
   action.charge und Tasktyp charging aktiviert (5 Batterie/Tick fuer 5 Leistung).
4. Transportroboter aktiviert (Produktion durch die normale Roboterfabrik).
5. Iron Miner von goalOnly auf aktiv umgestellt (Spawn-Stack).
6. Stahlwerk-Inventare (input/output) mit Auto-Modus definiert.
7. Kanonisches Datenmodell erweitert (ChargingTask, LogisticsTask, Commands,
   Events, AssetKeys, Templates); Pipeline-Schritt-3-Gliederung 3a-3d dokumentiert.
8. Konstanten (EXP2_*), ID-Muster (request.<typ>.<tick6>.<seq2>), Assets und
   Testmatrix (EXP2-Serie) ergaenzt.
```

## Fachliche Entscheidungen

```text
Ladenetz statt selfCharging-Umstellung (Nutzerentscheid): externalOnly-Roboter laden
  an Ladezonen; Stasis bleibt selfCharging-Mechanik.
Transporter aus der normalen Roboterfabrik: vermeidet die Silicon-Zirkularitaet der
  Verbesserten Roboterfabrik (bleibt Future).
research.transportLogistics1 mit Scope-Voraussetzung metalProcessing1.
supplyConstruction bleibt Future (MVP-Baumodell unangetastet).
Commitment-Regeln fuer Quellen- und Roboterbindung (Learning aus Expansion 1:
  tick-abhaengige Tie-Breaks + Neubewertung erzeugen Oszillation).
Gridline-Felder sind begehbar (dokumentierte Ausnahme von "Gebaeude blockieren").
```

## Weiterhin gueltige Quelleigentuemer

Unveraendert gegenueber v111; neu: Expansion-2-Umfang gehoert
`docs/02-mvp/expansion-2-scope.md` (siehe Tabelle in
docs/00-documentation-guideline.md).

## Keine Gameplay-Aenderung an MVP/Expansion 1

v112 aendert keine bestehende aktive Regel. Alle Erweiterungen sind additiv;
Startzustand, Siegbedingung, Score, Batterie- und Bauregeln bleiben identisch.
Die Implementierung von Expansion 2 folgt als naechster Schritt
(IMPLEMENTATION-STATUS.md).
