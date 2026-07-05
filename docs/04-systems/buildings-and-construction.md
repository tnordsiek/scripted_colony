# Gebäude und Bau

Dieses Dokument beschreibt die aktiven MVP-Gebäude und die Bauausführung. Ältere Aussagen zu Solarleistung 100, externer Roboterladung und Energie-Adjazenz sind nicht kanonisch.

## MVP-aktive Gebäude

### Solar Collector

```text
type = solarCollector
tier = 1
hp = 100/100
size = 1 Feld
cost = 5 Iron Ore
powerProvided = 50
powerRequired = 0
sightRange = 2
status nach Fertigstellung = active
```

Regeln:

- Zählt nur für den globalen MVP-Power-Pool, wenn `status = active` und `isEnabled = true`.
- Zählt nicht bei `construction`, `disabled`, `destroyed` oder `isEnabled = false`.
- Lädt im MVP keine Roboter extern.

### Roboterfabrik

```text
type = robotFactory
tier = 1
hp = 100/100
size = 1 Feld
cost = 5 Iron Ore
idle powerRequired = 0
productionTask.powerRequired = 40
sightRange = 2
status nach Fertigstellung = active
```

Regeln:

- Produziert im MVP ausschließlich `ironMiner`.
- Muss für Energieversorgung nicht neben einem Solar Collector stehen.
- Wird per Placement-Policy nahe einem active Solar Collector platziert.
- Energieversorgung erfolgt über den globalen MVP-Power-Pool.

## Future / vorbereitet

- KI-Forschungszentrum
- Sendeturm
- Grid Energy Line
- Verbesserte Roboterfabrik
- Drohnenfabrik
- Gasförderanlage
- Stahlwerk
- Energiespeicher
- Ressourcenspeicher

Diese Gebäude sind nicht MVP-aktiv, außer sie werden in Future-Dokumenten ausdrücklich spezifiziert.


## Gebäudesicht im MVP

MVP-Gebäude erzeugen Sicht, aber nur in aktivem Zustand:

```text
building.status = active
building.isEnabled = true
building.sightRange = 2
```

Sichtbereich:

```text
max(abs(field.x - building.x), abs(field.y - building.y)) <= building.sightRange
```

Gilt für:

```text
Solar Collector
Roboterfabrik
```

Erzeugt keine Sicht:

```text
status = construction
status = disabled
status = destroyed
isEnabled = false
```

Gebäudesicht aktualisiert nur den Fog-of-War-/Visibility-State. Sie ist keine Energiebedingung und erzeugt keine lokale Energiezone. Versteckte Ressourcen werden erst sichtbar, wenn das Feld durch Roboter- oder Gebäudesicht `visible` wird.

## Baukosten

```text
Solar Collector: 5 Iron Ore
Roboterfabrik: 5 Iron Ore
```

Kostenquelle bei Neubau:

```text
Cargo des bauenden Roboters
```

Kostenzeitpunkt bei Neubau:

```text
beim Start des BuildingTask
```

Nicht bei Zielauswahl, nicht beim Movement zur Baustelle, nicht erst bei Fertigstellung.

Beim Fortsetzen einer bestehenden Baustelle werden keine neuen Ressourcen abgezogen. Die bereits bezahlten Kosten liegen am `Building` der Baustelle (`costPaid` und optional `inventory.construction`).

## Gültiges Baufeld

Ein Baufeld ist gültig, wenn alle Bedingungen erfüllt sind:

```text
Koordinate innerhalb der Karte
Field.visibility = visible
terrainType = plains
kein buildingId
kein aktiver ResourceDeposit
kein reservedForConstruction
kein Roboter auf dem Feld
nicht das aktuelle Feld des bauenden Roboters
```

Baustellen und Gebäude blockieren Bewegung.

Erschöpfte Iron-Ore-Felder sind bebaubar, sofern Terrain und andere Blocker dies erlauben.

## Build-Action-Fälle

`action.buildBuilding` unterscheidet im MVP zwei technische Fälle. Diese Trennung ist verbindlich, damit eine abgebrochene Baustelle fortgesetzt werden kann, ohne dass ein zweites Gebäude entsteht oder Ressourcen erneut abgezogen werden.

### Fall A: Neue Baustelle starten

Eine neue Baustelle darf nur gestartet werden, wenn alle Bedingungen erfüllt sind:

```text
kein aktives Gebäude desselben Typs vorhanden
keine bestehende Baustelle desselben Typs vorhanden
Cargo enthält die Baukosten
gültiges freies Baufeld vorhanden
erreichbares Build-From-Feld vorhanden
```

Ablauf bei Task-Start:

```text
1. `buildingId = createBuildingId(action.buildingType, state)` gemaess `deterministic-id-generation.md` erzeugen
2. Baufeld reservieren
3. Baukosten aus Roboter-Cargo abziehen
4. Building mit status = construction anlegen
5. costPaid am Building setzen
6. BuildingTask.mode = newConstruction setzen
```

### Fall B: Bestehende Baustelle fortsetzen

Eine bestehende Baustelle wird fortgesetzt, wenn ein `Building` mit passendem `buildingType` und `status = construction` existiert und noch nicht fertig ist.

Bedingungen:

```text
Building.type entspricht action.buildingType
Building.status = construction
constructionProgress < constructionRequired
costPaid ist gesetzt
Baustelle ist nicht destroyed
erreichbares orthogonal angrenzendes Build-From-Feld vorhanden
Baustelle ist nicht durch einen anderen laufenden BuildingTask reserviert
keine abweichende reservedForConstruction.buildingId auf dem Baustellenfeld
```

Wichtig:

```text
Cargo wird beim Fortsetzen nicht geprüft.
Es werden keine neuen Ressourcen abgezogen.
Es wird kein neues Building angelegt.
Es wird kein neues Baufeld gesucht.
Die vorhandene buildingId bleibt erhalten.
BuildingTask.mode = continueConstruction.
```

Wenn eine passende Baustelle existiert, hat Fortsetzen Vorrang vor dem Suchen eines neuen Baufelds. Dadurch verhindert die Action Duplikate und erfüllt gleichzeitig die Regel, dass abgebrochene Baustellen weitergebaut werden können.

## Build-From-Feld

Der Roboter baut von einem orthogonal angrenzenden Feld aus.

Gültiges Build-From-Feld:

```text
orthogonal angrenzend zum Baufeld
begehbar
nicht blockiert
für den Roboter erreichbar
```

Wenn kein gültiges Build-From-Feld erreichbar ist, ist die Aktion nicht ausführbar:

```text
reason = noReachableBuildFromField
```

## Bauplatz- und Baustellen-Reservierung

Es gibt im MVP zwei unterschiedliche Reservierungsfälle:

```text
1. Bauplatz-Reservierung für newConstruction
2. Baustellen-Reservierung für continueConstruction
```

### 1. Bauplatz-Reservierung bei newConstruction

Bei einer neuen Baustelle wird nach gültiger Zielauswahl das Baufeld reserviert:

```ts
type ConstructionReservation = {
  buildingId: BuildingId;
  reservedByRobotIds: RobotId[];
};
```

Diese Feldreservierung gilt für das geplante Baufeld, bevor oder während der Roboter zum Build-From-Feld läuft.

Regeln:

```text
reservedForConstruction liegt auf dem Field der geplanten Baustelle.
reservedForConstruction.buildingId entspricht der geplanten oder bereits angelegten buildingId.
reservedByRobotIds enthält im MVP höchstens eine RobotId.
Das reservierte Feld ist für andere Neubauversuche blockiert.
Das reservierte Feld ist für Bewegung blockiert.
Die Reservierung wird freigegeben, wenn der zugehörige MovementTask/BuildingTask abgeschlossen oder abgebrochen wird oder das Ziel ungültig wird.
```

Sobald der BuildingTask für `newConstruction` startet, wird das `Building` mit `status = construction` angelegt. Die Feldreservierung darf bestehen bleiben, solange der BuildingTask läuft, muss aber spätestens beim Abschluss oder Abbruch entfernt werden.

### 2. Baustellen-Reservierung bei continueConstruction

Beim Fortsetzen einer bestehenden Baustelle wird keine neue `reservedForConstruction`-Feldstruktur erzeugt. Die Baustellen-Reservierung wird aus aktiven RobotTasks abgeleitet.

Kanonische Ableitungsregel:

```text
Eine Baustelle ist reserviert, wenn irgendein Roboter einen activeTask vom Typ building hat,
der auf dieselbe buildingId zeigt und dessen status = running ist.
```

Für den MVP gilt:

```text
Eine Baustelle darf nur von einem BuildingTask gleichzeitig bearbeitet werden.
Wenn ein anderer Roboter bereits einen laufenden BuildingTask mit derselben buildingId hat,
ist continueConstruction für diesen Roboter notExecutable mit reason = constructionAlreadyReserved.
Wenn derselbe Roboter den laufenden BuildingTask besitzt, wird kein zweiter Task erzeugt; die Action ist wegen taskAlreadyRunning nicht erneut ausführbar.
Beim Abschluss oder Abbruch des BuildingTask ist die abgeleitete Baustellen-Reservierung automatisch aufgehoben.
```

Falls auf dem Feld einer bestehenden Baustelle noch eine `reservedForConstruction`-Struktur vorhanden ist, darf sie nur dieselbe `buildingId` referenzieren. Eine abweichende `buildingId` macht das Ziel ungültig und führt zu `targetInvalid` oder `constructionAlreadyReserved` je nach Auswertungskontext.

Hilfslogik:

```text
isConstructionSiteReserved(state, buildingId, requestingRobotId?)
  durchsucht state.robots nach activeTask.type = building
  berücksichtigt nur Tasks mit status = running
  berücksichtigt nur Tasks mit derselben buildingId
  ignoriert requestingRobotId nur für Diagnose; für neue Task-Erzeugung gilt trotzdem taskAlreadyRunning
```

## BuildingTask-Ablauf

### Neue Baustelle

```text
1. Startprüfung Fall A
2. Bauplatz auswählen
3. Baufeld reservieren
4. MovementTask zum Build-From-Feld, falls nötig
5. BuildingTask starten, sobald Roboter orthogonal angrenzend steht
6. Baukosten aus Cargo abziehen
7. Building mit status = construction anlegen
8. remainingTicks herunterzählen
9. bei erfolgreichem Abschluss constructionProgress += 1
10. wenn constructionProgress >= constructionRequired: status = active
11. Stack-Prüfung beginnt wieder oben
```

### Bestehende Baustelle fortsetzen

```text
1. Startprüfung Fall B
2. vorhandenes Building mit status = construction auswählen
3. erreichbares Build-From-Feld bestimmen
4. MovementTask zum Build-From-Feld, falls nötig
5. BuildingTask starten, sobald Roboter orthogonal angrenzend steht
6. keine Baukosten abziehen
7. kein neues Building anlegen
8. remainingTicks herunterzählen
9. bei erfolgreichem Abschluss constructionProgress += 1
10. wenn constructionProgress >= constructionRequired: status = active
11. Stack-Prüfung beginnt wieder oben
```

MVP-Werte:

```text
constructionRequired = 1
BuildingTask Dauer = 10 Ticks
constructionProgress pro erfolgreichem Abschluss = 1
Batteriekosten = 1 bei erfolgreichem Abschluss
```

## Bauabbruch

Bei Abbruch eines BuildingTask gilt:

```text
kein constructionProgress
keine Batteriekosten
Baustelle bleibt bestehen
bereits bezahlte Kosten bleiben bezahlt
Fortsetzen derselben Baustelle kostet nicht erneut Ressourcen
active-Score wird nicht vergeben
```

Nach einem Abbruch muss die nächste Ausführung von `action.buildBuilding` zuerst prüfen, ob eine passende bestehende Baustelle fortgesetzt werden kann. Erst wenn keine passende Baustelle existiert, darf ein Neubaupfad geprüft werden.

## Placement-Policies

### Solar Collector

```text
reason = nearBuilder
```

Der Solar Collector wird möglichst nahe am bauenden Roboter platziert.

### Roboterfabrik

```text
reason = nearActiveSolarCollector
```

Die Roboterfabrik wird möglichst nahe an einem active Solar Collector platziert.

Wichtig:

```text
Nähe ist nur Build-Placement-Policy.
Energieversorgung ist globaler Power-Pool.
Adjazenz ist keine Energiebedingung.
```

## Events und Diagnose

Stabile Eventcodes aus `docs/03-technical/diagnostics-and-eventlog.md` verwenden, z. B.:

```text
action.build.targetSelected
action.build.blocked.notEnoughResources
action.build.blocked.noValidBuildSite
action.build.blocked.noReachableBuildFromField
action.build.blocked.constructionAlreadyReserved
action.build.started
action.build.completed
```

`constructionAlreadyReserved` wird im Build-System nicht nur als interner Grund geführt, sondern muss den stabilen Event-Code `action.build.blocked.constructionAlreadyReserved` verwenden, sobald dazu ein Build-Blocker-Event oder eine Diagnose erzeugt wird.

Verbindliche Details:

```text
code = action.build.blocked.constructionAlreadyReserved
details.reason = constructionAlreadyReserved
details.mode = continueConstruction
details.buildingId = bestehende Baustelle
details.reservedByRobotId = Roboter mit laufendem BuildingTask
```

Legacy-Begriffe wie `buildingCompleted` dürfen nicht als neue kanonische Eventcodes verwendet werden.

### Verbindliche Build-Event-Details

Für Build-Events, die sich auf einen gewählten, gestarteten oder abgeschlossenen Build-Task beziehen, ist `details.mode` verbindlich.

Gilt für:

```text
action.build.targetSelected
action.build.started
action.build.completed
```

Pflichtdetails:

```ts
details: {
  mode: "newConstruction" | "continueConstruction";
  buildingType: "solarCollector" | "robotFactory";
  buildingId: BuildingId;
  siteX: number;
  siteY: number;
}
```

Regeln:

```text
newConstruction: details.mode = newConstruction
continueConstruction: details.mode = continueConstruction
Der Wert wird vom erzeugten bzw. fortgesetzten BuildingTask uebernommen.
Tests pruefen details.mode, nicht freie Message-Texte.
```

