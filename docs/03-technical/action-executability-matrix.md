# Action Executability Matrix

Kanonische TypeScript-Unionen fuer `ActionExecutabilityResult` und `ActionNotExecutableReason` stehen in `docs/03-technical/canonical-data-model.md`. Die Tabellen in diesem Dokument sind die fachliche Ausfuehrbarkeitsmatrix.
## Status

Dieses Dokument ist die zentrale Spezifikation für die Ausführbarkeit von MVP-Aktionen.

Es ist verbindlich für:

```text
canExecuteAction
Task-Erzeugung
Ressourcenzeitpunkte
Abbruchregeln
Diagnosegründe
Stack-Fortsetzung
Tests
```

## Abgrenzung

Es gibt zwei Ebenen:

```text
ProgramAction
PlayerCommand
```

Dieses Dokument behandelt primär ProgramActions:

```text
action.scoutNearby
action.mineResource
action.buildBuilding
action.stasisCharge
```

Zusätzlich werden PlayerCommands separat dokumentiert. Die vollständige Command-Matrix steht in `docs/03-technical/player-command-handling.md`. Für diese Matrix ist `startIronMinerProduction` der einzige aktive Produktionscommand:

```text
startIronMinerProduction
```

`startIronMinerProduction` ist kein Roboterprogramm, sondern ein UI-/Gebäude-Command der Roboterfabrik.

## Allgemeine Executability-Regeln

Für ProgramActions gilt:

```text
Wenn Aktion ausführbar:
  Task starten oder Soforteffekt ausführen.

Wenn Aktion nicht ausführbar:
  kein State-Mutations-Effekt außer Diagnose.
  aktuelles Programm gilt als nicht ausführbar.
  Stack-Prüfung geht weiter.

Wenn laufender Task abbricht:
  Task entfernen.
  Diagnose schreiben.
  Stack-Prüfung beginnt wieder oben.
```

Wichtig:

```text
Nicht ausführbar ist kein Fehler.
Es ist Teil der Roboterlogik.
```

## Übersicht

| Aktion / Command | MVP | Parameter | Ergebnis / Task | Ressourcenzeitpunkt |
|---|---:|---|---|---|
| `action.scoutNearby` | aktiv | `targetFieldType` | `movement` | keine |
| `action.mineResource` | aktiv | `resourceType` | `mining` | bei Task-Abschluss |
| `action.buildBuilding` | aktiv | `buildingType` | `movement` → `building` | bei Bau-Task-Start |
| `action.stasisCharge` | aktiv/locked | keine | `stasisCharging` | keine |
| `action.charge` | future/optional | offen | `charging` | keine |
| `startIronMinerProduction` | PlayerCommand | `buildingId` | `ProductionTask` | bei Command-Erfolg |

## Zentrale Typen

```ts
type ActionExecutabilityResult =
  | {
      type: "executable";
      action: ProgramAction;
      plannedTask?: RobotTask;
      diagnostic?: GameEvent;
    }
  | {
      type: "notExecutable";
      reason: ActionNotExecutableReason;
      diagnostic?: GameEvent;
    };

type ActionNotExecutableReason =
  | "missingParameter"
  | "robotNotActive"
  | "batteryTooLow"
  | "robotInStasis"
  | "unsupportedMvpAction"
  | "unsupportedMvpTarget"
  | "cargoFull"
  | "notEnoughResources"
  | "noAdjacentResource"
  | "resourceDepleted"
  | "notAdjacentToTarget"
  | "noValidScoutTarget"
  | "noValidBuildSite"
  | "noReachableBuildFromField"
  | "constructionAlreadyReserved"
  | "noActiveSolarCollector"
  | "taskAlreadyRunning"
  | "noPath";
```

Für PlayerCommands separat:

```text
CommandResult und CommandRejectionReason werden kanonisch in docs/03-technical/canonical-data-model.md definiert.
Die Validierungsmatrix fuer alle PlayerCommands steht in docs/03-technical/player-command-handling.md.
```

## ProgramAction: action.scoutNearby

Kanonische Form:

```text
THEN Scoute Nahfeld mit Ziel "Iron Ore"
```

Technisch:

```ts
{
  actionId: "action.scoutNearby",
  parameters: {
    targetFieldType: { type: "fieldType", value: "ironOre" }
  }
}
```

`targetFieldType` ist ein `ActionParameterValue` der Form `{ type: "fieldType", value: FieldTypeQuery }`.

Ausführbar, wenn:

```text
Roboterstatus = active
Batterie > 1
targetFieldType ist gesetzt
kein aktiver Task läuft
mindestens ein erreichbares Scout-Ziel existiert
```

Zielauswahl:

```text
1. sichtbares Ziel X ansteuern, wenn nicht angrenzend
2. unknown Randfeld erkunden
3. erreichbares Fallback-Feld
```

Task:

```text
RobotTaskType = movement
```

Erfolg:

```text
Roboter bewegt sich schrittweise.
Sicht wird nach jedem Schritt aktualisiert.
Stop-Bedingung wird nach jedem Schritt geprüft.
Ziel wird nach jedem Schritt neu bewertet.
```

Nicht ausführbar, wenn:

```text
targetFieldType fehlt
Roboter in Stasis
Batterie <= 1
kein erreichbares Scout-Ziel
kein Pfad
taskAlreadyRunning
```

Diagnosen:

```text
Scouting: Zieltyp sichtbar, Nachbarfeld wird angesteuert
Scouting: unknown Randfeld wird erkundet
Scouting: Fallback-Ziel gewählt
Scouting blockiert: targetFieldType fehlt
Scouting blockiert: kein erreichbares Ziel-Nachbarfeld
Scouting blockiert: kein erreichbares Erkundungsziel
Scouting abgebrochen: kein Pfad
Scouting gestoppt: Zieltyp angrenzend
Scouting gestoppt: Stasis
```

## ProgramAction: action.mineResource

Mining ist parametrisiert.

Kanonische Form:

```text
THEN Mine Resource mit Ziel "Iron Ore"
```

Technisch:

```ts
type MineResourceActionParameters = {
  resourceType: NaturalResourceType;
};

{
  actionId: "action.mineResource",
  parameters: {
    resourceType: "ironOre"
  }
}
```

Ausführbar, wenn:

```text
Roboterstatus = active
Batterie > 1
resourceType ist gesetzt
resourceType = ironOre
Roboter kann mining
Cargo hat freie Kapazität
orthogonal angrenzendes Feld enthält aktives Iron Ore
kein aktiver Task läuft
```

Zielauswahl:

```text
Wähle angrenzendes Iron-Ore-Feld.
Bei mehreren:
  1. größter ResourceDeposit.amount
  2. seeded random nach `docs/03-technical/seeded-rng.md`
```

Task:

```text
RobotTaskType = mining
```

Ressourcen-/Effektregel:

```text
Mining-Task dauert definierte Ticks.
Bei Abschluss:
  ResourceDeposit.amount -= minedAmount
  Roboter-Cargo ironOre += minedAmount
```

Ressourcenzeitpunkt:

```text
Iron Ore wird erst bei erfolgreichem Mining-Task-Abschluss in den Cargo gelegt.
Kein Ore-Gewinn bei abgebrochenem Mining-Task.
```

Nicht ausführbar, wenn:

```text
resourceType fehlt
resourceType nicht MVP-erlaubt
Roboter in Stasis
Batterie <= 1
Cargo voll
kein angrenzendes Iron Ore
Ressource erschöpft
taskAlreadyRunning
```

Abbruch:

```text
Batterie reicht nicht mehr
Cargo wird voll
Ressource ist nicht mehr vorhanden
Roboter nicht mehr angrenzend
Roboter fällt in Stasis
```

Diagnosen:

```text
Mining blockiert: resourceType fehlt
Mining blockiert: Ressourcentyp im MVP nicht erlaubt
Mining blockiert: kein angrenzendes Iron Ore
Mining blockiert: Cargo voll
Mining abgebrochen: Ressource erschöpft
Mining abgebrochen: nicht mehr angrenzend
Mining abgeschlossen: Iron Ore aufgenommen
```

## ProgramAction: action.buildBuilding

Gebäude-mit-Status-Prüfungen verwenden kanonisch `BuildingQuery`. Eine Bedingung wie `Solar Collector active vorhanden` ist keine reine Statusprüfung, sondern `buildingType = solarCollector` und `status = active` in derselben Query.


Kanonische Formen:

```text
THEN Baue Gebäude mit Typ "Solar Collector"
THEN Baue Gebäude mit Typ "Roboterfabrik"
```

Technisch:

```ts
{
  actionId: "action.buildBuilding",
  parameters: {
    buildingType: "solarCollector"
  }
}
```

oder:

```ts
{
  actionId: "action.buildBuilding",
  parameters: {
    buildingType: "robotFactory"
  }
}
```

Ausführbar, wenn einer der beiden technischen Fälle gültig ist.

Gemeinsame Bedingungen:

```text
Roboterstatus = active
Batterie > 1
buildingType ist gesetzt
Gebäudetyp ist MVP-erlaubt
Roboter kann Gebäudetyp bauen
kein aktiver Task läuft
```

Fall A - neue Baustelle:

```text
keine bestehende Baustelle desselben Typs vorhanden
kein active Gebäude desselben Typs vorhanden
Cargo enthält benötigte Ressourcen
mindestens ein gültiges Baufeld existiert
mindestens ein erreichbares Bau-Ausführungsfeld existiert
```

Fall B - bestehende Baustelle fortsetzen:

```text
Building mit passendem buildingType und status = construction existiert
constructionProgress < constructionRequired
costPaid ist gesetzt
Baustelle ist nicht durch anderen laufenden BuildingTask reserviert
keine abweichende Feldreservierung auf dem Baustellenfeld vorhanden
mindestens ein erreichbares Build-From-Feld existiert
Cargo wird nicht geprüft
```

Fall B wird vor Fall A geprüft.

Reservierungsprüfung für Fall B:

```text
Prüfe alle state.robots.
Wenn ein anderer Roboter einen laufenden activeTask.type = building mit derselben buildingId hat:
  notExecutable(reason = constructionAlreadyReserved)
  diagnostic.code = action.build.blocked.constructionAlreadyReserved
  diagnostic.details.reason = constructionAlreadyReserved
  diagnostic.details.mode = continueConstruction
Wenn derselbe Roboter bereits einen laufenden activeTask hat:
  notExecutable(reason = taskAlreadyRunning)
Es wird keine neue reservedForConstruction-Struktur für continueConstruction erzeugt.
```

Zusätzlich für Roboterfabrik:

```text
mindestens ein Solar Collector mit status = active existiert
```

Zielauswahl:

```text
Solar Collector:
  nahe bauendem Roboter

Roboterfabrik:
  nahe active Solar Collector
```

Task:

```text
RobotTaskType = movement
danach RobotTaskType = building
BuildingTask.mode = newConstruction oder continueConstruction
```

Ressourcenabzug:

```text
newConstruction:
  nicht bei Zielauswahl
  nicht bei MovementTask
  erst beim Start des Bau-Tasks

continueConstruction:
  kein Ressourcenabzug
  keine Cargo-Prüfung
```

Erfolg:

```text
newConstruction: Gebäude mit status = construction anlegen
continueConstruction: bestehendes Gebäude weiterverwenden
Baufortschritt ausführen
nach Abschluss status = active
```

Nicht ausführbar, wenn:

```text
buildingType fehlt
Gebäudetyp im MVP nicht erlaubt
nicht genug Ressourcen im Cargo für newConstruction
kein gültiges Baufeld
kein erreichbares Bau-Ausführungsfeld
passende Baustelle durch anderen Task reserviert
abweichende Feldreservierung auf dem Baustellenfeld
kein active Solar Collector für Roboterfabrik
Roboter in Stasis
Batterie <= 1
taskAlreadyRunning
```

Diagnosen:

```text
Bau blockiert: buildingType fehlt
Bau blockiert: Gebäudetyp im MVP nicht erlaubt
Bau blockiert: nicht genug Ressourcen im Cargo
Bau blockiert: kein gültiges Baufeld
Bau blockiert: kein erreichbares Bau-Ausführungsfeld
Bau blockiert: Baustelle bereits reserviert
Bau blockiert: kein aktiver Solar Collector für Roboterfabrik
Bauziel gewählt: Solar Collector nahe Roboter
Bauziel gewählt: Roboterfabrik nahe Solar Collector
Bau abgebrochen: Bauplatz ungültig
Bau abgebrochen: Pfad zum Bau-Ausführungsfeld fehlt
Bau gestartet: neue Baustelle
Bau gestartet: bestehende Baustelle fortgesetzt
Bau abgeschlossen
```

## ProgramAction: action.stasisCharge

Kanonische Form:

```text
THEN Stasis-Laden
```

Template:

```text
IF Batterie <= 1
THEN Gehe in Stasis und lade
STOP Batterie >= 50
```

Ausführbar, wenn:

```text
Roboterstatus = active oder stasis
Batterie <= 1
Roboter chargingMode = selfCharging oder hybrid
```

Task:

```text
RobotTaskType = stasisCharging
```

Effekt:

```text
Roboterstatus = stasis
normale Programme laufen nicht
Batterie steigt pro Tick gemäß Stasis-Laderate
bei Batterie >= 50:
  Roboterstatus = active
  Stack-Prüfung beginnt wieder oben
```

Nicht ausführbar, wenn:

```text
Batterie > 1
Roboter chargingMode = externalOnly
Roboter destroyed
```

Diagnosen:

```text
Stasis-Laden gestartet
Stasis-Laden läuft
Stasis-Laden abgeschlossen
Stasis-Laden blockiert: Roboter kann nicht selbst laden
```

## ProgramAction: action.charge

`action.charge` bleibt im Modell, ist aber nicht Teil des MVP-Startstacks.

Status:

```text
MVP-Startstack: nein
MVP aktiv: nein
Future/Advanced: ja
```

Regel:

```text
Implementierung darf den `ActionId`-Typ `action.charge` für Future/Advanced vorbereiten,
aber der MVP darf keine aktive `ActionDefinition`, keinen ProgramEditor-Eintrag und keine Task-Erzeugung für `action.charge` enthalten.
```

## PlayerCommand: startIronMinerProduction

Kanonische Form:

```ts
{ type: "startIronMinerProduction"; buildingId: BuildingId }
```

Ausführbar, wenn:

```text
buildingId existiert
building.type = robotFactory
building.status = active
building.isEnabled = true
building.productionTask ist leer
Startroboter existiert
Startroboter.status ist active oder stasis
Startroboter.communicationStatus = connected
Startroboter-Cargo enthält mindestens 5 Iron Ore
```

Nicht prüfen:

```text
Startroboter steht neben Roboterfabrik
freie Leistung >= 40
Roboterfabrik hat Input-Inventar
MaterialRequest vorhanden
Transportroboter verfügbar
```

Erfolg:

```text
5 Iron Ore aus Startroboter-Cargo abziehen
ProductionTask mit costPaid = true anlegen
CommandResult = accepted
```

Ablehnung:

```text
kein Kostenabzug
kein ProductionTask
CommandResult = rejected
konkreter CommandRejectionReason
```

RejectionReasons:

```text
buildingNotFound
buildingIsNotRobotFactory
buildingNotActive
buildingDisabled
productionAlreadyRunning
starterRobotMissing
starterRobotNotConnected
notEnoughIronOreInStarterCargo
```

## Stack-Fortsetzung

Wenn ProgramAction nicht ausführbar ist:

```text
aktuelles Programm wird übersprungen
nächstes Programm im Stack wird geprüft
```

Wenn ProgramAction einen Task startet:

```text
Roboter führt Task aus
Stack wird nicht weiter geprüft, solange Task läuft
```

Wenn Task erfolgreich endet:

```text
Stop-Bedingung prüfen
Stack-Prüfung beginnt wieder oben
```

Wenn Task abbricht:

```text
Task entfernen
Diagnose schreiben
Stack-Prüfung beginnt wieder oben
```

## Akzeptanzkriterium

Das Akzeptanzkriterium ist erfüllt, wenn:

```text
jede MVP-Aktion eine zentrale Executability-Spezifikation hat
jede Aktion ihre Pflichtparameter nennt
jede Aktion klare Nicht-ausführbar-Gründe hat
jede Aktion ihren Task-Typ nennt
jede Aktion Ressourcenzeitpunkt definiert
jede Aktion Diagnosegründe nennt
startIronMinerProduction separat als PlayerCommand dokumentiert ist
action.mineResource einen resourceType-Parameter besitzt
```

## Event-Erzeugung

Für Aktionen gelten zusätzlich die Regeln aus:

```text
docs/03-technical/diagnostics-and-eventlog.md
```

Bei `notExecutable`:

```text
Debug Event mit code = program.skipped.notExecutable oder debug.canExecuteAction.result.
Player Event nur, wenn die Blocker-Regel erfüllt ist.
```

Bei `executable`:

```text
Debug Event mit code = program.action.executable optional.
Player Event nur bei sichtbarem Fortschritt oder relevanter Blockade.
```

Die vollstaendige Zuordnung jeder `ActionNotExecutableReason` zu Event-/Diagnosecodes steht in der Action-Reason-Matrix in `docs/03-technical/diagnostics-and-eventlog.md`.

Tests pruefen Event-Codes, nicht Meldungstexte.

## Testmatrix-Verweis

Relevante Testbereiche: `MVP-ACTION`, `MVP-SCOUT`, `MVP-MINE`, `MVP-BUILD`, `MVP-STASIS`. Die verbindliche Testmatrix steht in `docs/02-mvp/mvp-test-matrix.md`.

## Energie und ProductionCommand

`startIronMinerProduction` bleibt ein PlayerCommand und prueft nicht freie Leistung.

Nicht pruefen:

```text
freePower >= 40
```

Begruendung:

```text
Der Command darf accepted sein, auch wenn der ProductionTask danach wegen Energiemangel pausiert.
```

Energie-Executability betrifft nur den Fortschritt des laufenden ProductionTask, nicht den Command-Start.


## Build-Event-Details

Wenn `canExecuteAction` oder die anschließende Task-Erzeugung für `action.buildBuilding` einen Build-Modus bestimmt, muss dieser Modus in Build-Events übernommen werden.

```text
BuildTarget.mode = newConstruction | continueConstruction
BuildingTask.mode = BuildTarget.mode
action.build.targetSelected.details.mode = BuildTarget.mode
action.build.started.details.mode = BuildingTask.mode
action.build.completed.details.mode = BuildingTask.mode
```

Ohne bestimmbaren Modus darf kein `action.build.started` oder `action.build.completed` erzeugt werden.


## action.charge ist keine MVP ActionDefinition

`action.charge` bleibt ausschließlich Future/Advanced. Für MVP-ActionExecutability gilt:

```text
canExecuteAction muss action.charge nicht als MVP-Action unterstützen.
action.charge darf im MVP keinen charging-Task erzeugen.
action.charge darf im MVP-ProgramEditor nicht angeboten werden.
Stasis-Laden bleibt die einzige aktive MVP-Lademechanik.
```
