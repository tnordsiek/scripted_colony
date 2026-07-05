# Programmstack-Regeln

## Stack-Auswertung

Programme werden immer von oben nach unten geprüft.

```text
erstes ausführbares Programm
→ wird gestartet
```

Wenn ein Programm nicht ausführbar ist, wird das nächste geprüft.

## Laufendes Programm

Ein Programm läuft, bis:

- Stop-Bedingung erfüllt
- Spieler bricht ab
- Spieler deaktiviert
- Ziel ungültig

Danach beginnt die Stack-Prüfung wieder oben.

## Mehrere Zeilen im Programm

Ein Programm kann mehrere IF/THEN-Zeilen besitzen.

- Bedingung falsch: nächste Zeile
- Bedingung wahr und Aktion ausführbar: Aktion ausführen
- Bedingung wahr, aber Aktion nicht ausführbar: nächste Zeile im selben Programm
- keine Zeile trifft zu: nächstes Programm im Stack

## Deaktivierung

- deaktiviertes Programm bleibt sichtbar
- wird übersprungen
- erhält Skip-Icon
- Reaktivierung macht es wieder prüfbar

## Abbruch

- Abbruch beendet nur aktuelle Ausführung
- Programm bleibt unverändert
- es kann bei nächster Prüfung erneut gewählt werden

## Bauprogramme

Ein Bauprogramm zählt erst als abgeschlossen, wenn das Gebäude fertiggestellt ist.

## Automatische Mindestenergieprüfung

Jede Aktion besitzt einen Mindestenergiebedarf. Dieser wird automatisch bei der Ausführbarkeitsprüfung berücksichtigt.

Der Spieler muss keine zusätzliche Bedingung wie `Batterie >= 1` in jedes Template einbauen.

Wenn die Energie nicht reicht:

```text
Aktion nicht ausführbar
→ Diagnose: Batterie reicht nicht für Aktion
→ Stack-Prüfung beginnt wieder oben
```

## Aktionsparameter

Aktionen dürfen eigene Parameter besitzen. Diese Parameter steuern die interne Ausführung.

Beispiele:

```text
Scoute Nahfeld:
- Ziel: Iron Ore
- technischer Parameter: targetFieldType = ironOre
```

```text
Baue Gebäude:
- Art des Gebäudes
- Feldbedingung
```

## Datenmodellbezug

Die Stack-Auswertung arbeitet auf `ProgramInstance`-Objekten aus:

```text
docs/03-technical/visual-programming-data-model.md
```

Relevante Struktur:

```text
ProgramInstance
→ rows[]
→ if
→ then
→ stop
```

Jede Zeile wird so geprüft:

```text
IF ConditionExpression erfüllt
AND ProgramAction ausführbar
THEN Aktion starten
```

Die automatische Mindestenergieprüfung ist Teil der Ausführbarkeitsprüfung der `ProgramAction`.

## Long Tasks im Programmstack

Long Tasks laufen, bis sie abgeschlossen sind oder abbrechen.

Regel:

```text
Während ein MiningTask oder BuildTask läuft,
wird nicht zu einem anderen Programm gewechselt.
```

Nach Abschluss oder Abbruch:

```text
Stack-Prüfung beginnt wieder oben.
```

Stop-Bedingungen:

- Laden prüft Stop-Bedingungen pro Tick.
- Mining und Bauen prüfen Stop-Bedingungen nach Abschluss oder Abbruch.
- Produktion ist Gebäudelogik und kein Roboterprogramm.

Abgebrochene Mining-/Bauaktionen:

```text
kein Ergebnis
keine Batteriekosten
Diagnose schreiben
Stack neu prüfen
```

Bei Bauabbruch bleibt die Baustelle bestehen.

## Programmzeilen-Logik und Programmstack-Logik

Programmzeilen-Logik und Programmstack-Logik sind durch ein gemeinsames Auswertungsmodell verbunden.

## Grundmodell

Der Roboter entscheidet in zwei Ebenen:

```text
Ebene 1: Programmstack
-> Programme von oben nach unten pruefen

Ebene 2: Programmzeilen
-> Zeilen innerhalb eines Programms von oben nach unten pruefen
```

Ein Programm gilt als ausfuehrbar, wenn mindestens eine aktive Zeile ausfuehrbar ist.

Eine Zeile ist ausfuehrbar, wenn:

```text
IF-Bedingung erfuellt
AND THEN-Aktion ausfuehrbar
AND Programm/Zeile nicht deaktiviert
AND Ausfuehrungslimit nicht erreicht
```

## Stack-Auswertung

Regel:

```text
Der Programmstack prueft Programme von oben nach unten.
```

Ablauf:

```text
1. Pruefe Programm 1.
2. Pruefe Zeilen von Programm 1.
3. Wenn keine Zeile ausfuehrbar ist: Pruefe Programm 2.
4. Wiederhole, bis eine ausfuehrbare Zeile gefunden wird.
5. Wenn keine ausfuehrbare Zeile im gesamten Stack existiert: Roboter bleibt `status = active`; der abgeleitete Aktivitaetszustand ist `idle`.
```

## Zeilen-Auswertung innerhalb eines Programms

Regel:

```text
Jedes aktive Programm prueft seine Zeilen von oben nach unten.
```

Fuer jede Zeile:

```text
Wenn IF-Bedingung falsch ist:
  naechste Zeile im selben Programm pruefen.

Wenn IF-Bedingung wahr ist, aber THEN-Aktion nicht ausfuehrbar ist:
  naechste Zeile im selben Programm pruefen.

Wenn IF-Bedingung wahr ist und THEN-Aktion ausfuehrbar ist:
  Zeile starten.
```

Wenn keine Zeile eines Programms ausfuehrbar ist:

```text
Programm gilt als nicht ausfuehrbar.
Stack prueft naechstes Programm.
```

## Start einer Programmzeile

Wenn eine Zeile startet:

```text
Programm wird laufendes Programm.
Zeile wird laufende Zeile.
Aktion erzeugt ggf. einen RobotTask.
Stack wird waehrenddessen nicht weiter geprueft.
```

Waehrend ein Task laeuft:

```text
keine Neupriorisierung des Stacks
kein Wechsel zu hoeherem Programm
keine neue Zeilenpruefung
```

Ausnahme:

```text
Spieler bricht ab oder deaktiviert laufendes Programm.
```

## Ende einer laufenden Zeile

Eine laufende Zeile endet durch:

```text
Stop-Bedingung erfuellt
Task abgeschlossen
Task abgebrochen
Spielerabbruch
Programm deaktiviert
Ziel ungueltig
Aktion nicht mehr ausfuehrbar
```

Danach gilt:

```text
Stack-Pruefung beginnt wieder oben.
```

## Stop-Bedingungen

Stop-Bedingungen gehoeren zur laufenden Zeile.

Laden:

```text
Stop-Bedingung pro Tick pruefen.
```

Mining und Bauen:

```text
Stop-Bedingung nach Abschluss oder Abbruch des Long Tasks pruefen.
```

Wenn Stop erfuellt ist:

```text
laufende Zeile endet
laufendes Programm endet
Stack-Pruefung beginnt wieder oben
```

Wenn Stop nicht erfuellt ist:

```text
gleiche Zeile kann erneut eine Aktion / einen Task starten,
sofern IF weiterhin erfuellt und THEN ausfuehrbar ist.
```

## Wenn kein Programm ausfuehrbar ist

Kanonische Regel:

```text
idle ist kein RobotStatus.
Ein Roboter ohne ausfuehrbares Programm bleibt im Datenmodell active.
Die UI und Debug-Diagnose duerfen daraus RobotActivityState = idle ableiten.
```

Wenn der gesamte Stack keine ausfuehrbare Zeile enthaelt:

```text
robot.status bleibt active
robot.activeTask = undefined
robot.activeProgram = undefined
abgeleiteter RobotActivityState = idle
Diagnose schreiben
```

Beispiel-Diagnose:

```text
Kein Programm ausfuehrbar:
- Iron Ore abbauen: Nachbarfeld hat kein Iron Ore
- Solar Collector bauen: Iron Ore fehlt
- Roboterfabrik bauen: Solar Collector fehlt oder Solar Collector nicht active
- Erkunden: kein gueltiges Scout-Ziel
- Stasis-Laden: Batterie > 1
```

## Gebäude-mit-Status-Bedingungen im Stack

Build-Programme verwenden für Regeln wie `Gebäude vorhanden Solar Collector mit Status active` oder `Baustelle vorhanden Roboterfabrik mit Status construction` technisch immer `sensor.buildingExists` mit einem `BuildingQuery`.

```text
Gebäude vorhanden X mit Status Y
= sensor.buildingExists exists { buildingType: X, status: Y }

Gebäude oder Baustelle vorhanden X
= sensor.buildingExists exists { buildingType: X }
```

Dadurch kann die Stack-Auswertung Gebäudetyp und Status nicht versehentlich getrennt oder global auswerten.

## Kanonisches Beispiel: Start bis Solar Collector

### Ausgangszustand

```text
Tick: 0
Position: [5,5]
Batterie: 100/100
Cargo: 0/10 Iron Ore
Nachbarfeld: kein Iron Ore
Solar Collector: nicht vorhanden
Roboterfabrik: nicht vorhanden
```

MVP-Stack:

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

Programme:

```text
Iron Ore abbauen:
IF Nachbarfeld hat Typ Iron Ore
AND Cargo ist nicht voll
THEN Mine Resource mit Ziel Iron Ore
STOP Cargo ist voll
OR Roboterstatus = Stasis

Solar Collector bauen:
IF Baustelle vorhanden Solar Collector mit Status construction
OR (Cargo hat Iron Ore >= 5 AND NOT Gebaeude oder Baustelle vorhanden Solar Collector)
THEN Baue Gebaeude Solar Collector
STOP Gebaeude vorhanden Solar Collector mit Status active
OR Roboterstatus = Stasis

Roboterfabrik bauen:
IF Gebaeude vorhanden Solar Collector mit Status active
AND (Baustelle vorhanden Roboterfabrik mit Status construction
     OR (Cargo hat Iron Ore >= 5 AND NOT Gebaeude oder Baustelle vorhanden Roboterfabrik))
THEN Baue Gebaeude Roboterfabrik
STOP Gebaeude vorhanden Roboterfabrik mit Status active
OR Roboterstatus = Stasis

Erkunden:
IF NOT Nachbarfeld hat Typ Iron Ore
THEN Scoute Nahfeld mit Ziel Iron Ore
STOP Nachbarfeld hat Typ Iron Ore
OR Roboterstatus = Stasis

Stasis-Laden:
IF Batterie <= 1
THEN Gehe in Stasis und lade
STOP Batterie >= 50
```

### Stack-Pruefung 1

#### Programm 1: Iron Ore abbauen

```text
Nachbarfeld hat Typ Iron Ore: falsch
Cargo ist nicht voll: wahr
```

Gesamtbedingung falsch. Keine Zeile ausfuehrbar. Naechstes Programm.

#### Programm 2: Solar Collector bauen

```text
Baustelle vorhanden Solar Collector mit Status construction: falsch
Cargo hat Iron Ore >= 5: falsch
NOT Gebaeude oder Baustelle vorhanden Solar Collector: wahr
```

Gesamtbedingung falsch. Keine Zeile ausfuehrbar. Naechstes Programm.

#### Programm 3: Roboterfabrik bauen

```text
Gebaeude vorhanden Solar Collector mit Status active: falsch
Baustelle vorhanden Roboterfabrik mit Status construction: falsch
Cargo hat Iron Ore >= 5: falsch
NOT Gebaeude oder Baustelle vorhanden Roboterfabrik: wahr
```

Gesamtbedingung falsch. Keine Zeile ausfuehrbar. Naechstes Programm.

#### Programm 4: Erkunden

```text
NOT Nachbarfeld hat Typ Iron Ore: wahr
THEN Scoute Nahfeld mit Ziel Iron Ore: ausfuehrbar
```

Ergebnis:

```text
Programm "Erkunden" wird laufendes Programm.
Zeile 1 wird laufende Zeile.
Roboter startet Scouting.
Stack wird waehrenddessen nicht weiter geprueft.
```

### Waehrend Erkunden laeuft

Der Roboter bewegt sich nach interner Scouting-Logik. Die Zielauswahl erfolgt ueber:

```text
1. sichtbares Ziel Iron Ore ansteuern
2. unknown Randfeld erkunden
3. erreichbares Fallback-Feld waehlen
```

Wenn Iron Ore angrenzend erreicht wird:

```text
STOP Nachbarfeld hat Typ Iron Ore: wahr
```

Ergebnis:

```text
Erkunden endet.
Stack-Pruefung beginnt wieder oben.
```

### Mining-Beispiel

Angenommen spaeter:

```text
Roboter steht neben Iron Ore
Cargo: 0/10
```

Stack beginnt wieder oben.

```text
Iron Ore abbauen:
  Nachbarfeld hat Typ Iron Ore = wahr
  Cargo ist nicht voll = wahr
  THEN Mine Resource mit Ziel Iron Ore = ausfuehrbar
```

Ergebnis:

```text
Programm "Iron Ore abbauen" startet.
Zeile 1 startet MiningTask.
MiningTask remainingTicks = 10.
```

Nach 10 Fortschrittsticks:

```text
Cargo +1 Iron Ore
Iron-Ore-Feld amount -= 1
Batterie -= 1
```

Stop-Bedingung:

```text
Cargo ist voll
OR Roboterstatus = Stasis
```

Bei Cargo `1/10` und Roboterstatus `active`:

```text
Stop-Bedingung falsch.
Gleiche Zeile kann erneut Mining starten.
```

Bei Cargo `10/10`:

```text
Stop-Bedingung wahr.
Programm endet.
Stack-Pruefung beginnt wieder oben.
```

### Solarbau-Beispiel

Angenommen:

```text
Cargo: 5/10 Iron Ore
Solar Collector nicht vorhanden
Roboter steht auf begehbarem Feld
```

Stack-Pruefung:

```text
Iron Ore abbauen: nicht ausfuehrbar, wenn kein angrenzendes Iron Ore.
Solar Collector bauen:
  Cargo hat Iron Ore >= 5 = wahr
  NOT Gebaeude vorhanden Solar Collector = wahr
  THEN Baue Gebaeude Solar Collector = ausfuehrbar
```

Ergebnis:

```text
Baukosten 5 Iron Ore werden beim Start des BuildingTask abgezogen.
Baustelle entsteht als Building mit status = construction.
BuildTask startet mit remainingTicks = 10.
```

Nach 10 Fortschrittsticks:

```text
constructionProgress = constructionRequired
Batterie -= 1
Solar Collector status = active
Event `action.build.completed` wird mit `details.mode = buildingTask.mode` geschrieben
Score wird aktualisiert
```

Stop-Bedingung:

```text
Gebaeude vorhanden Solar Collector
OR Roboterstatus = Stasis
```

ist erfuellt.

Ergebnis:

```text
Programm endet.
Stack-Pruefung beginnt wieder oben.
```

## Gemeinsame Designregel

```text
Der Stack entscheidet, welches Programm grundsaetzlich Prioritaet hat.
Die Zeilenlogik entscheidet, welche konkrete IF/THEN-Zeile innerhalb dieses Programms ausfuehrbar ist.
Die erste ausfuehrbare Zeile des ersten ausfuehrbaren Programms wird aktiv.
Waehrend sie laeuft, bleibt sie aktiv, bis sie stoppt, abgeschlossen wird oder abbricht.
Danach beginnt die Stack-Pruefung wieder oben.
```

## Regel zu Startstack-Beispielen

Aktive Beispiele in diesem Dokument verwenden ausschließlich den kanonischen MVP-Startstack:

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

`template.secureEnergy` bleibt nur als optionales Advanced-/Future-Template reserviert und darf nicht als aktives MVP-Beispiel verwendet werden.

## MVP-Sackgasse im Programmablauf

wird die MVP-Sackgasse nicht durch eine zusaetzliche Batterie-Startbedingung geloest, sondern durch die Vereinfachung des Startroboter-Stacks.

## Problem

Der Startroboter darf nicht in einen Zustand geraten, in dem kein Programm ausfuehrbar ist, obwohl der Spieler keine direkten Bewegungsbefehle geben darf.

## Designentscheidung

```text
Das Programm "Energie sichern" ist im MVP-Startstack nicht notwendig.
```

Begruendung:

```text
Wenn dem Startroboter Energie fuer Aktionen fehlt,
wechselt er ueber die harte Sicherheitsebene in Stasis-Laden.
Nach Stasis-Laden sind Aktionen wieder moeglich.
```

Damit wird Energie im MVP nicht als Optimierungsprogramm behandelt, sondern als Sicherheitsmechanik.

## MVP-Startroboter-Stack

Verbindlich:

```text
1. Iron Ore abbauen
2. Solar Collector bauen
3. Roboterfabrik bauen
4. Erkunden
5. Stasis-Laden
```

Nicht im MVP-Startstack:

```text
Energie sichern
```

## Status von "Energie sichern"

```text
"Energie sichern" bleibt als optionales Advanced-/Future-Template erhalten.
Es ist nicht Teil des MVP-Startstacks.
Es ist nicht notwendig fuer den Startroboter-MVP.
```

Spaetere Verwendung:

```text
fuer externe Ladeabhaengigkeit
fuer Spezialroboter ohne Selbstladung
fuer Effizienz-/Optimierungsprogramme
fuer hoehere Schwierigkeitsgrade
```

## Neues Explore-Template für den Startroboter

Verbindlich:

```text
IF NOT Nachbarfeld hat Typ Iron Ore
THEN Scoute Nahfeld
STOP Nachbarfeld hat Typ Iron Ore
OR Roboterstatus = Stasis
```

Die Batteriebedingung entfällt für den Startroboter.

## Stasis-Laden bleibt harte Sicherheitsebene

```text
IF Batterie <= 1
THEN Gehe in Stasis und lade
STOP Batterie >= 50
```

Sonderregeln bleiben:

```text
nicht löschbar
nicht deaktivierbar
immer unterstes Programm
nicht frei verschiebbar
```

Wenn `Stasis-Laden` abgeschlossen ist:

```text
Roboterstatus = active
Stack-Prüfung beginnt wieder oben
```

## Energie- und Aktionsregel

```text
Bewegung benötigt mindestens 1 Batterie.
Nach erfolgreichem Bewegungsschritt: -1 Batterie.
Wenn Batterie <= 1, wechselt der Startroboter in Stasis.
In Stasis werden keine normalen Programme ausgeführt.
Nur Stasis-Laden läuft.
Stasis-Laden endet bei Batterie >= 50.
Danach beginnt die Stack-Prüfung wieder oben.
```

Für Long Tasks:

```text
Wenn Mining oder Bau wegen Batterie nicht mehr abgeschlossen werden kann:
→ Task bricht ab
→ kein Ergebnis
→ keine Batteriekosten
→ Stasis-Laden greift
```

## scoutNearby-Präzisierung

Damit sichtbares, aber nicht angrenzendes Iron Ore nicht zu Idle führt, erhält `action.scoutNearby` eine interne Zielpriorität.

```text
Priorität 1:
Wenn sichtbares Iron Ore existiert,
aber kein Iron Ore angrenzend ist:
→ bewege dich zu einem erreichbaren Nachbarfeld dieses Iron-Ore-Feldes.

Priorität 2:
Wenn kein sichtbares Iron Ore existiert:
→ bewege dich zu einem Erkundungsziel am Rand des sichtbaren Bereichs.

Priorität 3:
Wenn kein Randziel existiert:
→ bewege dich zu einem zufälligen erreichbaren begehbaren Feld im erlaubten Erkundungsradius.
```

Diese Zielauswahl ist intern.

```text
Sie ist kein direkter Bewegungsbefehl des Spielers.
Der Spieler wählt weiterhin nur die Verhaltenslogik "Erkunden".
```

## Zielauswahl bei sichtbarem Iron Ore

```text
Für alle sichtbaren Iron-Ore-Felder:
  suche freie, begehbare, orthogonal angrenzende Nachbarfelder.

Wähle das Ziel mit:
  1. kürzestem BFS-Pfad
  2. bei Gleichstand seeded random nach `docs/03-technical/seeded-rng.md`
```

Wenn kein erreichbares Ziel existiert:

```text
Aktion nicht ausführbar.
Diagnose: Kein erreichbares Nachbarfeld von Iron Ore.
Stack-Prüfung beginnt wieder oben.
```

## Akzeptanzkriterium

Diese Situation darf nicht mehr zu Idle führen:

```text
Batterie: 58/100
Iron Ore sichtbar, aber nicht angrenzend
Cargo: leer
keine Gebäude
```

Erwartetes Verhalten:

```text
Erkunden ist ausführbar.
Roboter bewegt sich Richtung sichtbares Iron Ore.
Sobald Iron Ore angrenzend ist, stoppt Erkunden.
Stack-Prüfung beginnt oben.
Iron Ore abbauen startet.
```

## Designregel

```text
Der Startroboter verwendet im MVP keine vorsorgliche Energieoptimierung.
Stasis-Laden ist die einzige harte Energiesicherung.
Erkunden hat für den Startroboter keine Mindestbatteriebedingung.
Sichtbares Iron Ore wird durch scoutNearby intern angesteuert, bis es angrenzend ist.
```

## Scoute Nahfeld mit Zielparameter

`Scoute Nahfeld` ist eine parametrisierte Aktion.

Kanonisches MVP-Erkundungsprogramm:

```text
IF NOT Nachbarfeld hat Typ "Iron Ore"
THEN Scoute Nahfeld mit Ziel "Iron Ore"
STOP Nachbarfeld hat Typ "Iron Ore"
OR Roboterstatus = Stasis
```

Regel:

```text
IF, THEN und STOP beziehen sich sichtbar auf denselben Zieltyp.
```

`Scoute Nahfeld mit Ziel X`:

```text
Wenn Ziel X sichtbar, aber nicht angrenzend ist:
→ bewege dich zu einem erreichbaren Nachbarfeld von Ziel X.

Wenn Ziel X noch nicht sichtbar ist:
→ erkunde unknown Randfelder, um Ziel X zu finden.

Wenn kein Randziel existiert:
→ wähle ein erreichbares Fallback-Feld.
```

Diese Zielauswahl ist internes Roboterverhalten und kein direkter Spielerbefehl.

## Scoute Nahfeld mit Zielparameter

`Scoute Nahfeld` besitzt einen konfigurierbaren Zielparameter.

Kanonisches MVP-Erkundungsprogramm:

```text
IF NOT Nachbarfeld hat Typ "Iron Ore"
THEN Scoute Nahfeld mit Ziel "Iron Ore"
STOP Nachbarfeld hat Typ "Iron Ore"
OR Roboterstatus = Stasis
```

Technisch:

```text
action.scoutNearby(targetFieldType = ironOre)
```

Regel:

```text
Die Aktion reagiert nur auf den konfigurierten Zieltyp.
Der Spieler gibt weiterhin kein konkretes Bewegungsziel vor.
```

## Initialer Startroboter-Stack

Der Startroboter erhält durch `createStarterProgramStack()` exakt diesen Stack:

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

Regeln:

```text
template.stasisCharge ist enabled, locked und letzter Eintrag.
Alle ProgramInstance-IDs sind stabil und deterministisch.
Alle initialen ProgramRow-IDs sind stabil und deterministisch.
```

Kanonische ProgramRow-IDs:

```text
program.starter.mineIronOre -> row.starter.mineIronOre.main
program.starter.buildSolarCollector -> row.starter.buildSolarCollector.main
program.starter.buildRobotFactory -> row.starter.buildRobotFactory.main
program.starter.exploreNearby -> row.starter.exploreNearby.main
program.starter.stasisCharge -> row.starter.stasisCharge.main
```

Regel:

```text
Stack-Auswertung, ActiveProgramState, Debug-Diagnostics und Eventlog duerfen sich auf diese RowIds verlassen.
Wenn ein Programm auf sein Template zurueckgesetzt wird, wird auch die kanonische RowId wiederhergestellt.
```

## Startposition-Bezug

Alle Starter-Programme gehen implizit vom zentral definierten Startzustand aus:

```text
Startroboter bei { x: 5, y: 5 }
0-basierte 10x10-Karte
map[y][x]
initiale Sicht x = 3..7 und y = 3..7
```

Programme dürfen keine abweichende Startposition oder 1-basierte Koordinatenannahme enthalten.

## Build-Action im Programmstack

Bauprogramme nutzen eine parametrisierte Aktion:

```text
THEN Baue Gebäude mit Typ "Solar Collector"
THEN Baue Gebäude mit Typ "Roboterfabrik"
```

Die Aktion ist ausführbar nur, wenn ein gültiges Baufeld und ein erreichbares Bau-Ausführungsfeld existieren.

Wenn die Aktion nicht ausführbar ist:

```text
kein Ressourcenabzug
kein Gebäude
Stack-Prüfung geht weiter
```

Wenn ein Bauplatz reserviert wurde und später ungültig wird:

```text
Reservierung freigeben
Zielauswahl einmal neu versuchen
sonst Aktion abbrechen
Stack-Prüfung beginnt wieder oben
```

## Action Executability Matrix

Es gilt:

```text
docs/03-technical/action-executability-matrix.md ist die zentrale Quelle für die Ausführbarkeit von ProgramActions.
```

Stack-Regel:

```text
Wenn eine Aktion nicht ausführbar ist:
  aktuelles Programm gilt als nicht ausführbar
  nächstes Programm im Stack wird geprüft

Wenn eine Aktion ausführbar ist:
  Task oder Soforteffekt wird gestartet
  Stack wird nicht weiter geprüft, solange Task läuft

Wenn Task endet oder abbricht:
  Diagnose schreiben
  Stack-Prüfung beginnt wieder oben
```

Nicht ausführbar ist kein Fehler, sondern Teil der Roboterlogik.

## Programmdiagnose

Programm- und Stackdiagnosen folgen:

```text
docs/03-technical/diagnostics-and-eventlog.md
```

Regeln:

```text
program.row.conditionFalse ist debug-only.
program.skipped.notExecutable ist debug-only, außer eine relevante Blockade muss player-sichtbar werden.
Nicht jede fehlgeschlagene IF-Zeile erzeugt ein Player Event.
Wenn alle Programme blockiert bleiben, kann nach Blocker-Regel ein Player Event erzeugt werden.
```


### Baustellen-Fortsetzung im Stack

Build-Programme behandeln `construction` nicht als abgeschlossenes Ziel. Eine passende Baustelle im Status `construction` macht die Build-Row ausführbar, auch wenn der Roboter nicht erneut genug Cargo für die Baukosten besitzt.

```text
Bestehende Baustelle vorhanden -> action.buildBuilding setzt BuildingTask.mode = continueConstruction.
Keine Baustelle vorhanden -> action.buildBuilding darf nur mit genug Cargo und gültigem neuem Baufeld starten.
STOP-Bedingung fuer Build-Programme prueft active, nicht construction.
```

Dadurch gilt gleichzeitig:

```text
construction verhindert doppelte Neubauten.
construction erlaubt Fortsetzung derselben Baustelle.
active beendet das Build-Programm.
```


## updateProgram-Validierung

`updateProgram` darf den Programmstack nur mit einer validierten, templatekonformen `ProgramInstance` veraendern.

Pflichtregeln:

```text
Programm muss im Stack des Roboters existieren.
Locked Programme duerfen nicht geaendert werden.
Stabile RowIds muessen erhalten bleiben.
ActionId, SensorIds, OperatorIds und die Grundstruktur der Rows muessen templatekonform bleiben.
Nur freigegebene Template-Parameter duerfen geaendert werden.
Nicht erlaubte Parameterwerte erzeugen invalidTemplateParameter.
Strukturaenderungen erzeugen invalidProgramDefinition.
```

Bei `CommandResult = rejected` bleibt der ProgramStack unveraendert.


## Build-Event-Details

Wenn eine ProgramRow `action.buildBuilding` startet oder abschließt, muss der zugehörige Build-Event den technischen Modus enthalten:

```text
details.mode = newConstruction
oder
details.mode = continueConstruction
```

Der Modus stammt nicht aus der sichtbaren UI-Zeile, sondern aus der internen Build-Zielauswahl bzw. dem `BuildingTask.mode`.
