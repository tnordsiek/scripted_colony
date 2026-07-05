# Robotertypen und Rollen

## standardRobot ist nicht kanonisch

`standardRobot` wird nicht nachspezifiziert, sondern ausdrücklich ausgeschlossen.

## Grundentscheidung

```text
standardRobot ist kein kanonischer RobotType.
standardRobot wird nicht als MVP- oder Future-Typ spezifiziert.
Alle Roboter müssen konkrete RobotType-Werte verwenden.
```

## Kanonische RobotType-Liste

```ts
type RobotType =
  | "starterRobot"
  | "ironMiner"
  | "groundScout"
  | "constructor"
  | "meleeDrone"
  | "resourceMiner"
  | "transportRobot"
  | "rangedDrone";
```

## MVP-aktive Robotertypen

```text
starterRobot
ironMiner
```

## Future / vorbereitet

```text
groundScout
constructor
meleeDrone
resourceMiner
transportRobot
rangedDrone
```

## Nicht kanonisch

```text
standardRobot
```

## Begründung

`standardRobot` ist zu unscharf und kollidiert mit bestehenden konkreten Typen.

Unklar wäre:

```text
Welche Rolle hat er?
Kann er bauen?
Kann er minen?
Kann er kämpfen?
Ist er Starter, Miner, Scout oder Constructor?
Welche Tier-Stufe hat er?
Welche Programme bekommt er?
Wie unterscheidet er sich vom starterRobot?
```

Der Startroboter ist bereits präzise spezifiziert:

```text
type = starterRobot
tier = 0
role = allrounder
movementType = ground
communicationMode = autonomous
chargingMode = selfCharging
kann minen
kann bauen
kann erkunden
hat Startstack
```

Ein `standardRobot` wäre entweder redundant oder zu unklar.

## Kanonische Abgrenzung

```text
starterRobot ist der einmalige Startroboter des MVP.
ironMiner ist der erste erfolgreich gespawnte Zielroboter des MVP.
standardRobot ist kein gültiger kanonischer RobotType.
```

Falls ein generischer Begriff gebraucht wird, darf er nicht als `Robot.type` verwendet werden.

Nicht verwenden:

```text
robot.type = "standardRobot"
```

## Migration alter Begriffe

| Alter Begriff | Ersetzen durch |
|---|---|
| `standardRobot` als Startroboter | `starterRobot` |
| `standardRobot` als Miner | `ironMiner` |
| `standardRobot` als generischer Bauroboter | `constructor` / future |
| `standardRobot` als generischer Ressourcenroboter | `resourceMiner` / future |
| `standardRobot` als Platzhalter | konkreten `RobotType` wählen oder entfernen |

## Produktionsregel

MVP-Produktion erzeugt ausschließlich:

```text
robot.type = ironMiner
```

Nicht zulässig:

```text
robot.type = standardRobot
```

## Startzustand-Regel

Der Startzustand erzeugt ausschließlich:

```text
robot.type = starterRobot
```

Nicht zulässig:

```text
robot.type = standardRobot
```

## ProgramTemplate-Regel

MVP-ProgramTemplates dürfen keinen `standardRobot` referenzieren.

Zulässig:

```text
starterRobot-Startstack
Iron-Miner-Produktion über PlayerCommand
```

Nicht zulässig:

```text
standardRobot als Template-Ziel
standardRobot als Produktionsziel
standardRobot als Rollenplatzhalter
```

## Akzeptanzkriterium

Das Akzeptanzkriterium ist erfüllt, wenn:

```text
standardRobot nicht Teil von RobotType ist.
standardRobot nicht im MVP-Startzustand vorkommt.
standardRobot nicht in ProgramTemplates vorkommt.
standardRobot nicht in ProductionTasks vorkommt.
standardRobot nicht in der Testmatrix als gültiger RobotType vorkommt.
standardRobot im Glossar als nicht-kanonischer Legacy-Begriff markiert ist.
Alle aktiven Roboter verwenden konkrete RobotType-Werte.
```

## Designregel

```text
standardRobot wird nicht spezifiziert, sondern ausgeschlossen.
Alle Roboter müssen konkrete RobotType-Werte verwenden.
Für den MVP sind nur starterRobot und ironMiner aktiv.
```
