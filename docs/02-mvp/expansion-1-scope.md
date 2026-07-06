# Expansion 1: Forschung und Tier-2-Einstieg

## Status

Dieses Dokument ist der Quelleigentuemer fuer den Umfang von Expansion 1 (analog zu
`docs/02-mvp/mvp-and-tech-stack.md` fuer den MVP-Umfang). Expansion 1 baut auf dem
abgeschlossenen MVP auf und aendert keine MVP-Regel rueckwirkend.

Bei Detailkonflikten zu aktivierten Werten gilt dieses Dokument vor den Future-Dokumenten
in `docs/05-future/**`. Die technischen Typen bleiben kanonisch in
`docs/03-technical/canonical-data-model.md`.

## Ziel von Expansion 1

```text
Der Spieler baut ein KI-Forschungszentrum, erforscht Metallverarbeitung,
baut ein Stahlwerk und produziert die erste Steel Plate.
```

Erweiterungsziel (optional im selben Run): Energieverteilung und Energiepuffer erforschen
und einen Energiespeicher bauen, um Produktions- und Forschungslast parallel zu fahren.

## Aktivierter Umfang

### Gebaeude (neu aktiv)

| Gebaeude | BuildingType | HP | Baukosten (Expansion 1) | constructionRequired | Energie | Sicht |
|---|---|---:|---|---:|---:|---:|
| KI-Forschungszentrum | `aiResearchCenter` | 150 | 10 Iron Ore | 2 | -20 bei aktivem Projekt | 2 |
| Stahlwerk | `steelworks` | 180 | 8 Iron Ore | 2 | -30 bei Verarbeitung | 2 |
| Energiespeicher | `energyStorage` | 150 | 4 Steel Plates | 2 | 0; Speicher 200, Laden/Entladen max 50 | 1 |

Bootstrap-Kostenregel:

```text
Die Baukosten in dieser Tabelle sind die aktiven Expansion-1-Werte.
Sie ersetzen fuer Expansion 1 die Future-Kostenwerte aus
docs/05-future/building-and-unit-tiers.md (Stahlwerk dort mit Steel Plates,
Energiespeicher dort mit Silicon), weil Steel Plates erst durch das Stahlwerk
entstehen und Silicon nicht aktiv ist. Die Future-Werte bleiben als spaetere
Rebalancing-Referenz dokumentiert.
```

Bauablauf: wie MVP-Gebaeude ueber `action.buildBuilding` mit neuen Programm-Templates
(siehe Template-Bibliothek). `constructionRequired = 2` bedeutet zwei abgeschlossene
Bauaktionen a 10 Ticks. Baukosten werden beim Start des ersten Bau-Tasks
(`mode = newConstruction`) vollstaendig aus dem Cargo des bauenden Roboters abgezogen.
Duplikatregel wie im MVP: pro Gebaeudetyp hoechstens ein aktives Gebaeude und
hoechstens eine Baustelle.

### Ressource (neu aktiv)

```text
steelPlates (Steel Plate)
```

Steel Plates belegen Cargo-Kapazitaet wie Iron Ore (1 Einheit = 1 Kapazitaet).

### Forschung (neu aktiv)

Aktivierte Projekte (Werte aus docs/05-future/research-tree.md):

| Projekt | Kosten | Voraussetzung | Unlock in Expansion 1 |
|---|---:|---|---|
| `research.basicAutomation1` | 200 | Forschungszentrum aktiv | Ausfuehrungslimits sichtbar/editierbar (maxExecutions fuer Bau-Templates) |
| `research.metalProcessing1` | 300 | Forschungszentrum aktiv | Stahlwerk baubar, Steel Plates |
| `research.energyDistribution1` | 250 | Forschungszentrum aktiv | nur Voraussetzung fuer Energiepuffer I; Grid Energy Line bleibt Future |
| `research.energyBuffer1` | 500 | `research.energyDistribution1` | Energiespeicher baubar |

Forschungsmechanik:

```text
Ein aktives, enabled KI-Forschungszentrum mit ausgewaehltem Projekt erzeugt
EXP1_RESEARCH_POINTS_PER_TICK = 1 Forschungspunkt pro Tick.
Es verbraucht dabei EXP1_RESEARCH_POWER_REQUIRED = 20 Leistung aus dem globalen Pool.
Ohne ausgewaehltes Projekt: kein Punkt, kein Leistungsbedarf.
Bei Energiemangel pausiert die Forschung (kein Punkt), Projekt bleibt aktiv.
Fortschritt wird pro Projekt gespeichert; Projektwechsel verwirft keinen Fortschritt.
Erreicht der Fortschritt die Projektkosten: Projekt completed, Unlock sofort aktiv,
Event research.completed.
Timing wie ProductionTasks: Ein in Tick N gewaehltes Projekt erzeugt fruehestens
in Tick N+1 Punkte und Leistungsbedarf.
```

Projektwahl: PlayerCommand `selectResearchProject`. Nur ein Projekt gleichzeitig aktiv.
Voraussetzungen muessen erfuellt sein (Ablehnung `researchPrerequisiteMissing`).
Abgeschlossene Projekte koennen nicht erneut gewaehlt werden
(`researchProjectAlreadyCompleted`).

### Stahlwerk-Verarbeitung (neu aktiv)

Rezept (aus building-and-unit-tiers.md):

```text
Input: 2 Iron Ore
Output: 1 Steel Plate
Dauer: 10 Ticks
Leistungsbedarf: 30
```

Expansion-1-Materialfluss (ohne Logistik):

```text
Der Command startSteelProduction zieht 2 Iron Ore beim Start aus dem
Startroboter-Cargo ab (analog startIronMinerProduction).
Bei Abschluss wird 1 Steel Plate in das Startroboter-Cargo gelegt.
Ist das Cargo bei Abschluss voll, wartet der Auftrag im Status outputBlocked,
bis Platz frei wird (kein Verlust, keine Kostenerstattung).
Ein Stahlwerk verarbeitet hoechstens einen Auftrag gleichzeitig.
Timing-Vertrag wie ProductionTask: Start in Tick N, erster Fortschritt in Tick N+1,
Abschluss ohne Pausen in Tick N+10; bei Energiemangel pausiert der Fortschritt.
```

### Energiespeicher (neu aktiv)

Der globale Power-Pool bleibt bestehen; der Energiespeicher puffert ihn:

```text
Reihenfolge im EnergySnapshot:
1. powerProvided = Summe aktiver Solar Collectors.
2. powerRequired = Summe fortschrittsberechtigter Verbraucher
   (ProductionTasks, Stahlwerk-Auftraege, aktive Forschung).
3. Defizit (powerRequired > powerProvided): aktive Energiespeicher entladen
   in BuildingId-Reihenfolge, je Tick maximal 50 pro Speicher, bis das Defizit
   gedeckt oder alle Speicher leer sind.
4. Ueberschuss (powerProvided > powerRequired): aktive Energiespeicher laden
   in BuildingId-Reihenfolge, je Tick maximal 50 pro Speicher, bis der
   Ueberschuss verbraucht oder alle Speicher voll (200) sind.
Entladene Energie zaehlt zu powerProvided des Ticks; geladene Energie
reduziert freePower.
Reicht die Gesamtleistung nicht fuer alle Verbraucher, werden Verbraucher in
BuildingId-Reihenfolge bedient; wofuer die Restleistung nicht reicht, pausiert.
```

### Template-Bibliothek (neu aktiv)

Neue Programm-Templates (alle nicht locked, editierbar wie MVP-Build-Templates):

```text
template.buildAiResearchCenter  (sofort verfuegbar)
template.buildSteelworks        (verfuegbar nach research.metalProcessing1)
template.buildEnergyStorage     (verfuegbar nach research.energyBuffer1)
```

Sichtbare Form je Template analog `template.buildSolarCollector`
(Baustelle fortsetzen ODER Cargo reicht UND kein Gebaeude/Baustelle des Typs;
STOP bei aktivem Gebaeude des Typs oder Stasis). Fuer Steel-Plate-Kosten prueft die
Cargo-Bedingung `sensor.cargoResourceAmount` mit `resourceType = steelPlates`.

Neue PlayerCommands fuer die Bibliothek:

```text
addProgramFromTemplate: fuegt eine Instanz eines freigeschalteten Templates
  direkt ueber dem ersten Erkundungsprogramm (template.exploreNearby) ein,
  sonst ueber dem Stasis-Laden-Programm. Begruendung: Bau-Templates gehoeren
  wie im MVP-Startstack vor die Erkundung, sonst zieht Erkunden den Roboter
  bei jeder Stack-Neubewertung vom Bauziel weg.
  (Ablehnungen: templateNotUnlocked, duplicateProgram, robotNotFound).
removeProgram: entfernt eine nicht-locked Programminstanz aus dem Stack
  (Ablehnungen: programNotFound, programLocked).
```

Die fuenf MVP-Startprogramme bleiben unveraendert Bestandteil des Startstacks.
Ein Roboter darf jedes Template hoechstens einmal im Stack haben.

### Ausfuehrungslimits (nach research.basicAutomation1)

```text
Der ProgramEditor zeigt fuer Bau-Templates das Feld executionLimit
(unlimited | once | count mit maxExecutions 1-99) und darf es aendern.
Vor Abschluss von research.basicAutomation1 ist das Feld nicht sichtbar/editierbar.
Die Simulation zaehlt completedExecutions bei erfolgreichem Programmabschluss
(Gebaeude active geworden) und ueberspringt Programme mit erreichtem Limit.
```

## Nicht aktiv in Expansion 1

```text
Logistik, MaterialRequests, Transportroboter
Ressourcenspeicher und Grid Energy Line (funktionslos ohne Logistik/lokale Netze)
Kommunikationsgrid-Wirkung (alle Einheiten bleiben connected)
weitere Einheiten (Boden Scout, Konstrukteur, Drohnen, Resource Miner)
Ressourcen Gas und Silicon
Combat und Hazards
lokale Energienetze (globaler Power-Pool bleibt)
alle weiteren Forschungsprojekte (waehlbar sind nur die vier aktivierten)
```

## Keine MVP-Aenderung

```text
Expansion 1 aendert keine MVP-Siegbedingung, keine Score-Regeln, keine
Batterie-/Bewegungs-/Mining-Regeln, keine Startbedingungen und keine
bestehenden Template-Definitionen. goal.mvpReached bleibt wie im MVP.
Neue Inhalte vergeben keinen Score.
```

## Quellenverweise

```text
Typen/Enums/State: docs/03-technical/canonical-data-model.md
Konstanten: docs/03-technical/mvp-constants.md (EXP1_*-Abschnitt)
Tick-Reihenfolge: docs/03-technical/tick-pipeline.md (Schritt 3 erweitert)
Energiesystem: docs/04-systems/energy-system.md (Speicherregel)
Forschungswerte: docs/05-future/research-tree.md (aktivierte Projekte)
Gebaeude-Referenzwerte (Future): docs/05-future/building-and-unit-tiers.md
Tests: docs/02-mvp/mvp-test-matrix.md (EXP1-Serie)
Assets: docs/05-assets/asset-fallbacks.md, docs/05-assets/asset-inventory.md
```
