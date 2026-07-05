# MVP-Template-Spezifikation

v59 bereinigt die alte Template-Reihenfolge aus v58. `Energie sichern` bleibt als Future/Advanced-Template dokumentiert, ist aber nicht Teil des MVP-Startstacks.

## Grundprinzip

MVP-Templates bleiben bewusst reduziert. Sichtbar sind:

```text
Name
IF-Bedingungen
THEN-Aktion
STOP-Bedingungen
editierbare Werte
Aktionsparameter
```

Interne Aktionslogik wie Pfadfindung, Zielauswahl und seeded random nach `docs/03-technical/seeded-rng.md` bleibt für den Spieler verborgen, ist aber testbar.

## Kanonischer MVP-Startroboter-Stack

```text
1. template.mineIronOre
2. template.buildSolarCollector
3. template.buildRobotFactory
4. template.exploreNearby
5. template.stasisCharge
```

Nicht enthalten:

```text
template.secureEnergy
```

`template.stasisCharge` ist locked, enabled, nicht löschbar, nicht deaktivierbar und immer letzter Stack-Eintrag.

## Stabile ProgramRowIds

Jedes MVP-Starttemplate besitzt eine stabile `.main`-Zeile. Die IDs sind Teil des kanonischen Startzustands und duerfen in Tests, Diagnostics und Eventlog referenziert werden.

| Template | ProgramInstanceId | ProgramRowId |
|---|---|---|
| `template.mineIronOre` | `program.starter.mineIronOre` | `row.starter.mineIronOre.main` |
| `template.buildSolarCollector` | `program.starter.buildSolarCollector` | `row.starter.buildSolarCollector.main` |
| `template.buildRobotFactory` | `program.starter.buildRobotFactory` | `row.starter.buildRobotFactory.main` |
| `template.exploreNearby` | `program.starter.exploreNearby` | `row.starter.exploreNearby.main` |
| `template.stasisCharge` | `program.starter.stasisCharge` | `row.starter.stasisCharge.main` |

Regeln:

```text
ProgramRowIds sind stabil und deterministisch.
Eine Template-Reset-Operation stellt die kanonische RowId wieder her.
Diagnose-Events verwenden diese RowIds, wenn sie sich auf eine Starttemplate-Zeile beziehen.
Spaetere zusaetzliche Rows verwenden das Muster row.<program>.<purpose> und duerfen bestehende IDs nicht wiederverwenden.
```

## ProgramTemplateId

```ts
type ProgramTemplateId =
  | "template.secureEnergy" // Future/Advanced, nicht Startstack
  | "template.exploreNearby"
  | "template.mineIronOre"
  | "template.buildSolarCollector"
  | "template.buildRobotFactory"
  | "template.stasisCharge";
```

## updateProgram-Editierbarkeit

Die sichtbaren MVP-Templates sind editierbare Instanzen, aber keine freie Programmiersprache. `updateProgram` darf nur templatekonforme Änderungen akzeptieren.

| Template | locked | erlaubte Änderungen im MVP |
|---|---:|---|
| `template.mineIronOre` | nein | Name, enabled, `resourceType = ironOre` |
| `template.buildSolarCollector` | nein | Name, enabled, `buildingType = solarCollector` |
| `template.buildRobotFactory` | nein | Name, enabled, `buildingType = robotFactory` |
| `template.exploreNearby` | nein | Name, enabled, `targetFieldType = Iron Ore` |
| `template.stasisCharge` | ja | keine |

Nicht erlaubt sind:

```text
templateId ändern
RowIds ändern
Rows hinzufügen oder löschen
actionId austauschen
Sensor-/Operatorstruktur frei umbauen
Future-Gebäude oder Future-Feldtypen in MVP-Templates speichern
```

Ablehnungen erfolgen über `CommandResult = rejected` mit konkretem `CommandRejectionReason`.

## Automatischer Mindestenergiebedarf

Jede Aktion besitzt einen Mindestenergiebedarf. Dieser wird automatisch bei jeder Ausführbarkeitsprüfung berücksichtigt.

Der Spieler muss nicht in jedes Template schreiben:

```text
AND Batterie >= Mindestenergie
```

Wenn die Batterie für die Aktion nicht reicht:

```text
Aktion nicht ausführbar
→ Diagnose: Batterie reicht nicht für Aktion
→ nächste ProgramRow oder nächstes Programm prüfen
```

## Sensorprinzip

`Nachbarfeld` und `Sichtfeld` sind getrennte Sensortypen.

### Nachbarfeld hat Typ

Prüft nur orthogonal angrenzende Felder:

```text
oben
unten
links
rechts
```

Mining benötigt Iron Ore auf einem Nachbarfeld.

### Sichtfeld hat Typ

Prüft Felder innerhalb der Sichtweite. Ein Roboter kann Iron Ore sehen, ohne es bereits abbauen zu können.

## Template: Iron Ore abbauen

Sichtbare Form:

```text
IF Nachbarfeld hat Typ Iron Ore
AND Cargo ist nicht voll
THEN Mine Resource mit Ziel Iron Ore
STOP Cargo ist voll
OR Roboterstatus = Stasis
```

Technische Aktion:

```ts
const MVP_MINE_IRON_ORE_ACTION: ProgramAction = {
  actionId: "action.mineResource",
  parameters: { resourceType: "ironOre" },
};
```

Interne Logik:

- wählt ein angrenzendes Iron-Ore-Feld
- bei mehreren Kandidaten: größtes Deposit, danach seeded random nach `docs/03-technical/seeded-rng.md`
- Mining dauert 10 Ticks
- Ergebnis erst bei erfolgreichem Abschluss: +1 Iron Ore im Cargo, -1 amount auf Ore-Feld
- Batteriekosten erst bei erfolgreichem Abschluss
- Abbruch erzeugt kein Iron Ore und kostet keine Batterie
- erschöpftes Feld verliert aktiven Ressourcentyp

## Gebäude-mit-Status-Bedingungen

Sichtbare Template-Regeln mit Gebäudetyp und Status werden technisch als `BuildingQuery` modelliert. Dadurch wird nicht nur ein Status allgemein geprüft, sondern immer Gebäudetyp und Status gemeinsam.

Beispiele:

```ts
{
  type: "sensor",
  sensorId: "sensor.buildingExists",
  operator: "exists",
  value: {
    type: "buildingQuery",
    value: { buildingType: "solarCollector", status: "active" },
  },
}

{
  type: "sensor",
  sensorId: "sensor.buildingExists",
  operator: "exists",
  value: {
    type: "buildingQuery",
    value: { buildingType: "robotFactory", status: "construction" },
  },
}
```

Regel:

```text
Gebäude existiert X mit Status Y = sensor.buildingExists + BuildingQuery { buildingType: X, status: Y }.
Gebäude oder Baustelle existiert X = sensor.buildingExists + BuildingQuery { buildingType: X }.
```

## Template: Solar Collector bauen

Sichtbare Form:

```text
IF Baustelle existiert Solar Collector mit Status construction
OR (Cargo enthält genug Iron Ore für Solar Collector
    AND NOT Gebäude oder Baustelle existiert Solar Collector)
THEN Baue Gebäude mit Typ Solar Collector
STOP Gebäude existiert Solar Collector mit Status active
OR Roboterstatus = Stasis
```

Technische Aktion:

```ts
const MVP_BUILD_SOLAR_COLLECTOR_ACTION: ProgramAction = {
  actionId: "action.buildBuilding",
  parameters: { buildingType: "solarCollector" },
};
```

Interne Logik:

- Kosten: 5 Iron Ore
- Placement-Policy: `nearBuilder`
- Wenn eine passende Baustelle `status = construction` existiert, wird diese fortgesetzt.
- Sonst muss ein neuer Bauplatz visible, plains, frei und ohne aktives ResourceDeposit sein.
- Baukosten nur beim Start eines neuen BuildingTask mit `mode = newConstruction`.
- Fortsetzen einer Baustelle nutzt `mode = continueConstruction` und kostet keine Ressourcen.
- Neue Baustelle `status = construction`
- Bau dauert 10 Ticks
- bei Abschluss `constructionProgress += 1`
- bei `constructionProgress >= constructionRequired` wird Gebäude `active`

Duplikatvermeidung zählt auch Gebäude im Status `construction`; diese werden nicht neu angelegt, sondern als Fortsetzungsziel genutzt.

## Template: Roboterfabrik bauen

Sichtbare Form:

```text
IF Gebäude existiert Solar Collector mit Status active
AND (Baustelle existiert Roboterfabrik mit Status construction
     OR (Cargo enthält genug Iron Ore für Roboterfabrik
         AND NOT Gebäude oder Baustelle existiert Roboterfabrik))
THEN Baue Gebäude mit Typ Roboterfabrik
STOP Gebäude existiert Roboterfabrik mit Status active
OR Roboterstatus = Stasis
```

Technische Aktion:

```ts
const MVP_BUILD_ROBOT_FACTORY_ACTION: ProgramAction = {
  actionId: "action.buildBuilding",
  parameters: { buildingType: "robotFactory" },
};
```

Interne Logik:

- Kosten: 5 Iron Ore
- Placement-Policy: `nearActiveSolarCollector`
- Solar Collector muss `active` sein
- Nähe zum Solar Collector ist nur Placement-Policy
- Energieversorgung der Roboterfabrik erfolgt über den globalen Power-Pool
- Baukosten nur beim Start eines neuen BuildingTask mit `mode = newConstruction`
- Fortsetzen einer bestehenden Baustelle nutzt `mode = continueConstruction` und kostet nicht erneut Ressourcen

Duplikatvermeidung zählt auch Gebäude im Status `construction`; diese werden nicht neu angelegt, sondern als Fortsetzungsziel genutzt.

## Template: Erkunden

Sichtbare Form:

```text
IF NOT Nachbarfeld hat Typ Iron Ore
THEN Scoute Nahfeld mit Ziel Iron Ore
STOP Nachbarfeld hat Typ Iron Ore
OR Roboterstatus = Stasis
```

Technische Aktion:

```ts
const MVP_EXPLORE_ACTION: ProgramAction = {
  actionId: "action.scoutNearby",
  parameters: {
    targetFieldType: { type: "fieldType", value: "ironOre" },
  },
};
```

`targetFieldType` wird als `ActionParameterValue` gespeichert, nicht als Freitext oder nackter String.

Wichtig:

```text
Erkunden hat keine sichtbare Batterie-Mindestbedingung.
```

Interne Zielauswahl:

```text
1. sichtbares Ziel Iron Ore ansteuern, wenn erreichbar
2. unknown Randfeld erkunden
3. erreichbares Fallback-Feld wählen
```

Ziel-Neubewertung erfolgt nach jedem Bewegungsschritt.

## Template: Stasis-Laden

Sichtbare Form:

```text
IF Batterie <= 1
THEN Stasis-Laden
STOP Batterie >= 50
```

Regeln:

- locked
- enabled
- nicht löschbar
- nicht deaktivierbar
- immer letzter Stack-Eintrag
- lädt mit +1 Batterie pro Tick
- verbraucht keine Gebäudeenergie
- nach Erreichen von 50 Batterie startet Stack-Prüfung wieder oben

## Kein Startroboter-Template: Iron Miner produzieren

`Iron Miner produzieren` ist kein Programm des Starter Roboters.

Im MVP ist es ein PlayerCommand an die Roboterfabrik:

```ts
{ type: "startIronMinerProduction"; buildingId: BuildingId }
```

Produktion wird in `docs/04-systems/production-and-spawn.md` geregelt.

## Optional/Future: Energie sichern

`template.secureEnergy` bleibt als optionales Advanced-/Future-Template reserviert.

Nicht MVP-aktiv:

```text
IF Batterie < 20 %
THEN Laden
STOP Batterie >= 80 %
```

Grund:

```text
Der MVP-Startstack nutzt Stasis-Laden als harte Sicherung.
Ein zusätzliches Energie-sichern-Programm kann frühe MVP-Abläufe blockieren und ist daher nicht im Startstack.
```

## Datenmodellbezug

Alle MVP-Templates werden technisch als `ProgramTemplateDefinition` definiert und beim Hinzufügen zum Stack als `ProgramInstance` gespeichert.

Technische Darstellung von `Roboterstatus = Stasis`:

```ts
{
  type: "sensor",
  sensorId: "sensor.robotStatus",
  operator: "eq",
  value: { type: "robotStatus", value: "stasis" }
}
```

Regel:

```text
Alle STOP-Bedingungen mit Roboterstatus verwenden sensor.robotStatus.
```

```text
ProgramInstance
→ rows[]
→ if: ConditionExpression
→ then: ProgramAction
→ stop: StopConditionGroup
```

Spieleränderungen betreffen die `ProgramInstance`, nicht die ursprüngliche `ProgramTemplateDefinition`.

## ProgramRow-Auswertung

```text
Programme werden im Stack von oben nach unten geprüft.
Innerhalb eines Programms werden Rows von oben nach unten geprüft.
IF falsch → nächste Row.
IF wahr, THEN nicht ausführbar → nächste Row.
IF wahr, THEN ausführbar → Aktion starten.
Keine Row ausführbar → nächstes Programm.
```

## MVP-Grenze Editor

- kein freier Node-Editor
- keine eigenen Sensoren
- keine eigenen Operatoren
- keine frei verdrahtbaren Blöcke
- editierbare Template-Instanzen mit vorbereiteten Parametern
