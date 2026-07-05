# RobotTask Payloads

Dieses Dokument beschreibt die konkreten RobotTask-Varianten fachlich. Die einzige kanonische TypeScript-Definition der Task-Typen steht in `docs/03-technical/canonical-data-model.md`.

Es gilt:

```text
RobotTask ist eine diskriminierte Union.
Jede Task-Instanz besitzt ein `type`-Feld und nur die dazu passenden Payload-Felder.
Der alte generische RobotTask mit vielen optionalen Feldern ist nicht kanonisch.
```

Kanonische Union:

```text
RobotTask = MovementTask | MiningTask | BuildingTask | StasisChargingTask
```

## Gemeinsame Felder

Alle aktiven MVP-Tasks besitzen:

```text
id
status
sourceProgramId
sourceRowId
startedTick
completedTick optional
abortReason optional
```

`status` ist `running`, `completed` oder `aborted`.

## MovementTask

Payload-Felder:

```text
type = movement
path
target
reason
movementState
```

Regeln:

```text
path enthaelt die geplanten naechsten Felder.
Bewegung um ein Feld dauert 1 Tick.
Nach jedem Schritt duerfen Scout-Ziele neu bewertet werden.
movementState.blockedByRobotTicks zaehlt temporäre Roboterblockaden.
```

## MiningTask

Payload-Felder:

```text
type = mining
resourceType = ironOre
target
totalTicks
remainingTicks
minedAmount
batteryCostOnSuccess
```

Regeln:

```text
Iron Ore wird erst bei erfolgreichem Task-Abschluss gutgeschrieben.
Bei Abbruch entsteht kein Ore-Gewinn.
Bei Abbruch entstehen keine Batteriekosten.
```

## BuildingTask

Payload-Felder:

```text
type = building
mode = newConstruction | continueConstruction
buildingId
buildingType
site
buildFrom
totalTicks
remainingTicks
costToPay
costPaidByThisTask
batteryCostOnSuccess
```

Regeln fuer `mode = newConstruction`:

```text
costToPay enthaelt die Baukosten.
costPaidByThisTask wird beim Start true.
Baufeld ist reserviert, solange Task aktiv ist.
Building wird beim Task-Start mit status = construction angelegt.
```

Regeln fuer `mode = continueConstruction`:

```text
buildingId verweist auf eine bestehende Baustelle.
costToPay = {}.
costPaidByThisTask = false.
Es wird kein neues Building angelegt.
Es werden keine Ressourcen abgezogen.
```

Reservierungsregel fuer `continueConstruction`:

```text
Es gibt kein eigenes Reservation-Feld am Building.
Die Baustelle gilt als reserviert, solange ein laufender BuildingTask eines anderen Roboters dieselbe buildingId verwendet.
Ein zweiter BuildingTask mit derselben buildingId darf im MVP nicht gestartet werden.
Beim Task-Abschluss oder Task-Abbruch ist die Reservierung automatisch frei.
```

## StasisChargingTask

Payload-Felder:

```text
type = stasisCharging
targetBattery
```

Regeln:

```text
Roboterstatus bleibt stasis, bis targetBattery erreicht ist.
StasisChargingTask ist die einzige aktive MVP-Lademechanik fuer Roboter.
```

## Nicht MVP-aktive Tasks

```text
external charging
logistics
combat
repair
```

Diese koennen als Future-Systeme beschrieben sein, duerfen aber im MVP nicht als aktive `RobotTask`-Instanzen erzeugt werden.


## Event-Details für BuildingTask

`BuildingTask.mode` ist die Quelle für `details.mode` bei Build-Events.

```text
mode = newConstruction -> Build-Events tragen details.mode = newConstruction
mode = continueConstruction -> Build-Events tragen details.mode = continueConstruction
```

Dies gilt mindestens für `action.build.started` und `action.build.completed`; `action.build.targetSelected` muss denselben Modus tragen, sobald das Ziel als Neubau oder Fortsetzung feststeht.
