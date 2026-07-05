# Roboter-Logikspiel Konzept – Zwischenstand v21

## 1. Grundidee

Der Spieler kommuniziert aus der Ferne mit einem Roboter auf einem fremden Planeten. Der Roboter ist ein vielseitiger Allzweckroboter, der sich bewegen, Energie laden, erkunden, Ressourcen abbauen, einfache Gebäude bauen und später Produktionsprozesse anstoßen kann.

Der Spieler steuert den Roboter nicht direkt. Es gibt keine direkten Befehle wie „gehe dort hin“, „baue genau hier“ oder „greife dieses Ziel an“. Stattdessen sendet der Spieler Programme an den Roboter. Diese Programme bestehen aus spielerischen GUI-Bausteinen und werden vom Roboter autonom in einem priorisierten Stack ausgeführt.

Der Kern des Spiels ist:

> Der Spieler gestaltet Verhaltenslogiken, beobachtet die autonome Ausführung und verbessert die Programme schrittweise.

## 2. Programmierung über GUI-Bausteine

Programme werden nicht als Textcode geschrieben, sondern aus Bausteinen zusammengesetzt.

Beispiel:

```text
IF
→ Batteriezustand
→ kleiner als
→ 20 %
THEN
→ Energie laden
→ bis 80 %
```

Mögliche Bausteinkategorien:

- Bedingungen: Batterie, Sonnenlicht, Ressource erkannt, Inventar voll, Gebäude vorhanden, Kommunikationssignal, Schaden, Feindkontakt
- Operatoren: kleiner als, größer als, gleich, vorhanden, nicht vorhanden, innerhalb Bereich, außerhalb Bereich
- Werte: Prozentwerte, Ressourcenarten, Gebäudetypen, Entfernungen, Mengen
- Aktionen: laden, erkunden, abbauen, bauen, produzieren, verteidigen, zurückkehren, warten, Signal senden
- Programmsteuerung: weiterleiten zu anderem Programm, abbrechen, pausieren

## 3. Programm-Templates

Für Basisfunktionen gibt es vorgefertigte Templates. Der Spieler zieht Templates per Drag-and-drop in den Roboterspeicher, bearbeitet Parameter, speichert sie und aktiviert sie anschließend im Stack.

Templates sind dadurch Einstiegshilfe und Arbeitsgrundlage, nicht starre Befehle.

Beispiele:

- Energie sichern
- Erkunden
- Iron Ore abbauen
- Solarkollektor bauen
- Roboterfabrik bauen
- Roboter produzieren
- später: Rückkehr, Reparatur, Kommunikation, Verteidigung, Transport

Programme können aktiv oder inaktiv sein. Inaktive Programme bleiben im Speicher, werden aber beim Stack-Durchlauf ignoriert und können überschrieben oder später reaktiviert werden.

## 4. Programmstack

Jeder Roboter besitzt einen individuellen Programmstack. Programme werden grundsätzlich von oben nach unten geprüft. Das erste aktuell ausführbare Programm wird aktiv.

Beispiel:

```text
1. Energie sichern
2. Iron Ore abbauen
3. Solarkollektor bauen
4. Roboterfabrik bauen
5. Roboter produzieren
6. Erkunden
7. Basisprogramm: Stasis-Laden
```

Programme können außerdem auf andere Programme weiterleiten, die weiter unten im Stack liegen. Dadurch können modulare Routinen entstehen.

## 5. Nicht löschbares Basisprogramm

Jeder Roboter besitzt ein fest eingebautes Basisprogramm:

```text
Wenn Batterie <= 1 %
→ gehe in Stasis
→ lade bis 50 %
```

Dieses Programm ist nicht löschbar. Die Partie kann damit beginnen, dass der Startroboter nach der Landung zunächst inaktiv ist und erst bei 50 % Ladung aufwacht.

## 6. Energie

Energie ist eine zentrale Einschränkung.

Der Roboter verbraucht Energie für:

- Bewegung
- Erkundung
- Abbau
- Bau
- Produktion auslösen
- spätere Sonderaktionen

Fällt der Roboter unter den kritischen Schwellenwert, greift das Stasis-Basisprogramm. Schlechte Programmierung kann dadurch Zeitverlust und ineffiziente Abläufe verursachen, soll aber nicht sofort in eine unrettbare Sackgasse führen.

## Terrain-System

Das Spiel soll später verschiedene Terrain-Typen unterstützen. Für den MVP bleibt Plains das aktive Standardterrain. Das Datenmodell soll aber bereits so vorbereitet werden, dass weitere Terrain-Typen ergänzt werden können.

### Terrain-Typen v0.1

| Terrain | Bodeneinheiten passierbar | Fliegende Einheiten passierbar | Bebaubar | Schaden |
|---|---:|---:|---:|---|
| Plains | ja | ja | ja | nein |
| Geröllhaufen | nein | ja | nein | nein |
| Lavafluss | nein | ja | nein | ja |
| Quecksilberfluss | nein | ja | nein | ja |

### Plains

Plains ist normales Standardterrain.

Regeln:

- fahrende Roboter können Plains betreten
- fliegende Einheiten können Plains überqueren
- Gebäude können auf Plains gebaut werden
- Plains verursacht keinen Schaden

Plains entspricht dem aktuell vorgesehenen normalen Bodentile.

### Geröllhaufen

Geröllhaufen blockieren fahrende Roboter, sind aber für fliegende Einheiten passierbar.

Regeln:

- fahrende Roboter können Geröllhaufen nicht betreten
- fliegende Einheiten können Geröllhaufen überqueren
- Geröllhaufen sind nicht bebaubar
- Geröllhaufen verursachen keinen Schaden

Geröllhaufen dienen später als natürliche Barrieren, Engstellen und Pfadfindungshindernisse.

### Lava- und Quecksilberflüsse

Lava- oder Quecksilberflüsse sind gefährliche Flussfelder.

Regeln:

- fahrende Roboter können Flussfelder nicht betreten
- fliegende Einheiten können Flussfelder überqueren
- Flussfelder sind nicht bebaubar
- Roboter auf orthogonal benachbarten Feldern erhalten Schaden
- fliegende Einheiten erhalten Schaden auf dem Flussfeld selbst
- fliegende Einheiten erhalten ebenfalls Schaden auf orthogonal benachbarten Feldern

Erste Schadensregel:

```text
Gefahrenschaden: -1 HP pro Tick
```

### Nachbarschaftsregel

Für den Anfang gilt nur orthogonale Nachbarschaft:

```text
oben
unten
links
rechts
```

Diagonale Felder zählen nicht als Nachbarfelder für Flussschaden.

Beispiel:

```text
    Schaden
Schaden Lava Schaden
    Schaden
```

### Gebäude und Gefahrenfelder

Für die erste Version des Terrain-Systems gilt:

- Gebäude können nicht auf Geröll, Lava oder Quecksilber gebaut werden
- Gebäude auf Nachbarfeldern zu Lava oder Quecksilber erhalten zunächst keinen automatischen Schaden
- später kann Gebäudeschaden durch Umweltfelder als zusätzliche Regel ergänzt werden

### Bewegungsarten

Einheiten sollen perspektivisch eine Bewegungsart haben:

```text
ground
flying
```

Der Startroboter ist im MVP eine Bodeneinheit.

### MVP-Einordnung

Im MVP aktiv:

- Plains als Standardterrain
- Terrain-Typ im Datenmodell
- Startroboter mit Bewegungsart `ground`

Im MVP vorbereitet, aber noch nicht aktiv:

- Geröllhaufen
- Lavafluss
- Quecksilberfluss
- fliegende Einheiten
- Umweltschaden durch Terrain
- alternative Terrain-Grafiken

Designregel:

> Terrain bestimmt Passierbarkeit, Bebaubarkeit und spätere Umweltrisiken. Der MVP nutzt nur Plains aktiv, bereitet aber das Datenmodell für Geröll, gefährliche Flüsse und fliegende Einheiten vor.

## Hitpoints, Schaden und Reparatur

Jede Einheit und jedes Gebäude besitzt Hitpoints.

Für den Anfang gilt ein einheitlicher Standardwert:

```text
Maximale HP: 100
Start-HP: 100
```

Das gilt für:

- Startroboter
- später produzierte Roboter
- Solarkollektor
- Roboterfabrik
- spätere Gebäude
- spätere Spezialroboter

### Schaden

Hitpoints können durch spätere Systeme reduziert werden.

Mögliche Schadensquellen:

- Kampf gegen andere Fraktionen
- Angriffe durch Einheiten
- beschädigende Umweltfelder
- negative Umwelteinflüsse als Damage over Time
- spätere Ereignisse wie Sandstürme, Strahlung, Säure oder elektromagnetische Störungen

Beispiel für Damage over Time:

```text
Roboter steht auf gefährlichem Feld
→ pro Tick werden X HP abgezogen
→ solange der Roboter auf dem Feld bleibt, läuft der Schaden weiter
```

### Zerstörung

Wenn HP <= 0, gilt eine Einheit oder ein Gebäude als zerstört.

Spätere Grundregeln:

```text
Zerstörter Roboter:
- führt keine Programme mehr aus
- kann nicht reparieren oder handeln
- kann optional als Wrack sichtbar bleiben

Zerstörtes Gebäude:
- liefert keine Funktion mehr
- erzeugt keine Sicht
- stellt keine Energie bereit
- kann keine Produktion ausführen
```

Für den Startroboter ist Zerstörung besonders relevant. Später kann die Zerstörung des Startroboters ein harter Verlust- oder Game-Over-Zustand sein. Im MVP wird Zerstörung noch nicht aktiv durch Kampf oder Umweltgefahren herbeigeführt.

### Reparatur

Einheiten mit Reparaturfähigkeit können HP bis zum Maximalwert wiederherstellen.

Reparaturfähige Einheiten:

- Startroboter
- spätere Reparaturdrohnen
- spätere spezialisierte Wartungsroboter

Grundregel:

```text
Reparatur kann HP bis maximal 100 auffüllen.
HP können nie über den Maximalwert steigen.
```

### MVP-Umfang des HP-Systems

Im MVP enthalten:

- alle Roboter und Gebäude haben 100/100 HP
- HP werden im Datenmodell gespeichert
- HP werden in der rechten Seitenleiste angezeigt
- Reparaturfähigkeit des Startroboters ist konzeptionell vorgesehen

Im MVP noch nicht zwingend enthalten:

- Kampf
- Umweltschaden
- Zerstörung durch aktive Gefahren
- Reparaturprogramm
- Reparaturdrohnen

### Spätere Reparatur-Templates

```text
Template: Selbst reparieren

IF eigene HP < 70 %
THEN repariere dich bis HP = 100 %
```

```text
Template: Gebäude reparieren

IF beschädigtes Gebäude in Reichweite
AND Batterie > 30 %
THEN repariere Gebäude bis HP = 100 %
```

```text
Template: Wartungsroute

IF beschädigte Einheit oder beschädigtes Gebäude bekannt
THEN bewege dich zum Ziel
AND repariere bis HP = 100 %
```

Designregel:

> Alle Einheiten und Gebäude sind grundsätzlich beschädigbar und reparierbar. Der Standardwert beträgt 100 HP. Schaden durch Kampf oder Umwelteinflüsse reduziert HP. Reparaturfähige Einheiten können HP bis zum Maximalwert wiederherstellen. Für den MVP wird das HP-System bereits im Datenmodell und in der UI vorgesehen, aktive Schadensquellen bleiben aber außerhalb des MVP.

## 7. Kommunikation

Der Startroboter ist überall erreichbar. Er dient als Rückfallversicherung und verhindert funktionelle Sackgassen, solange er existiert.

Andere Roboter sind grundsätzlich auf ein Kommunikationsgrid angewiesen, um neue Programme, Änderungen und Statusdaten zuverlässig austauschen zu können. Spezialisten wie Scout-Roboter können später Ausnahmen bilden, zum Beispiel durch größere Funkreichweite, temporäre Uplinks oder Relaisfunktionen.

Designregel:

> Der Startroboter ist immer erreichbar. Alle anderen Roboter benötigen Infrastruktur, Spezialfähigkeit oder vorbereitete Autonomie.

## 8. Kartenstruktur

Das Spiel findet auf klar begrenzten Maps statt, ähnlich klassischen Echtzeitstrategiespielen. Es gibt einen Startpunkt des Spielers und mögliche Startpunkte anderer Parteien.

Maps können später manuell gestaltet oder prozedural generiert sein. Eine Map enthält:

- unbekannte und erkundete Bereiche
- Ressourcen
- Bauflächen
- Sonnenlichtwerte
- mögliche Gefahren
- Kommunikationsabdeckung
- Startpunkte anderer Parteien

## 9. Kartenauflösung: Sektor-Prototyp und Feingrid-Finalvision

Final soll das Spiel auf einem feinen Grid mit Retro-RTS-Anmutung funktionieren, inspiriert von frühen Strategiespielen wie Dune 2. Roboter sollen sichtbar über die Karte wuseln, Wege nehmen, Material holen, bauen, laden und autonom auf ihre Programme reagieren.

Für frühe Versionen ist eine grobe Sektoraufteilung sinnvoll.

Entwicklungsstufen:

### Stufe 1: Sektor-Prototyp

- kleine Karte aus groben Sektoren
- Roboter befinden sich in Sektoren
- Aktionen betreffen Sektoren
- Fokus auf Programmstack, Energie, Erkundung, Abbau und Bau
- keine komplexe Pfadfindung

### Stufe 2: Hybridkarte

- Sektoren bleiben strategische Ebene
- Roboter bekommen sichtbare Positionen innerhalb eines Sektors
- erste Wuselbewegungen
- einfache Bauplatzsuche innerhalb eines Sektors

### Stufe 3: Feingrid-Retro-RTS

- feines Tile-Grid
- konkrete Pfadfindung
- Gebäudeplatzierung auf Tiles
- wuselige Roboterbewegung
- sichtbare Transport- und Bauprozesse
- Retro-RTS-Grafik

Die Spiellogik soll von Anfang an absichtsbasiert formuliert werden, damit sie später vom Sektor-Modell auf ein Feingrid übertragen werden kann.

## 10. Positionierung und Wuselfaktor

Der Spieler platziert Gebäude nicht exakt. Stattdessen definiert er Standortprofile und Ausführungsstile.

Beispiel:

```text
Baue Solarkollektor
Standortprofil:
- Sonnenlicht hoch
- bebaubar
- möglichst nahe am Arbeitsbereich
- geringe Gefahr

Ausführungsstil:
- pragmatisch
```

Der Roboter interpretiert diese Absicht anhand seines Wissensstands, seiner Sensorik und der aktuellen Situation. Dadurch entsteht kontrollierte Unsicherheit: Der Roboter baut nicht unbedingt exakt dort, wo der Spieler es erwartet, aber innerhalb nachvollziehbarer Kriterien.

Mögliche Ausführungsstile:

- strikt: wartet auf sehr gute Bedingungen
- ausgewogen: Standardverhalten
- pragmatisch: nimmt brauchbare Orte schneller an
- expansiv: bevorzugt Randbereiche
- sicher: bevorzugt geringe Gefahr und Nähe zur Infrastruktur

Designregel:

> Der Spieler bestimmt Absichten, Prioritäten und Zonen. Der Roboter bestimmt konkrete Wege, Positionen und Ausführung.

## 11. Diagnose und Transparenz

Der Spieler soll jederzeit verstehen können, warum ein Roboter etwas tut.

Die Roboteransicht zeigt:

- Batteriestand
- Inventar/Frachtspeicher
- aktueller Sektor oder Position
- aktuelles Programm
- Programmstack
- aktive und inaktive Programme
- übersprungene oder blockierte Programme

Beispiel:

```text
Aktiv:
- Erkunden

Übersprungen:
- Energie sichern: Batterie 64 % > Grenzwert 20 %

Blockiert:
- Solarkollektor bauen: Iron Ore fehlt
```

Diese Diagnose ist Kernbestandteil, nicht nur Komfortfunktion.

## 12. MVP-Umfang

Die erste spielbare Version soll sehr klein bleiben und nur beweisen, dass der Kern funktioniert.

MVP-Ziel:

> Produziere den ersten zusätzlichen Roboter.

Der MVP enthält:

- 1 Startroboter
- 1 Ressource: Iron Ore
- 1 Energiequelle: Solarkollektor
- 1 Produktionsgebäude: Roboterfabrik
- kleine Sektorkarte
- Batterie
- Frachtspeicher des Startroboters
- Programm-Templates
- Programmstack
- Pause und Zeitbeschleunigung
- einfache Diagnose

Nicht enthalten:

- mehrere Ressourcen
- Fraktionen
- Kampf
- komplexes Kommunikationsgrid
- Lagergebäude
- komplexe Produktionsketten
- Forschung
- spezialisierte Roboter
- Feingrid
- Wetter
- Tag/Nacht-Zyklus
- Schadenssystem

## 13. MVP ohne Basislager

Im MVP gibt es keine implizite Basis- oder Lagerzone.

Der Startroboter besitzt stattdessen einen kleinen internen Frachtspeicher. Dieser Speicher reicht aus, um die MVP-Zielkette grundsätzlich abschließen zu können.

Der Startroboter ist dadurch gleichzeitig:

- Erkundungseinheit
- Miner
- Transporter
- Builder
- temporärer Ressourcenspeicher
- Initialisierungseinheit für die erste Infrastruktur

## 14. MVP-Spielablauf

1. Der Startroboter wacht mit 50 % Batterie auf.
2. Der Spieler aktiviert Templates für Energie sichern und Erkunden.
3. Der Roboter erkundet die Sektorkarte.
4. Der Roboter findet Iron Ore.
5. Der Spieler aktiviert oder verbessert das Abbauprogramm.
6. Der Roboter baut Iron Ore ab und speichert es im eigenen Frachtspeicher.
7. Der Roboter nutzt gespeichertes Iron Ore, um einen Solarkollektor zu bauen.
8. Der Solarkollektor verbessert die Energieversorgung oder Ladefähigkeit.
9. Der Roboter sammelt weiteres Iron Ore.
10. Der Roboter nutzt gespeichertes Iron Ore, um eine Roboterfabrik zu bauen.
11. Die Roboterfabrik produziert den ersten zusätzlichen Roboter.
12. Das MVP-Ziel ist erreicht.

## 15. MVP-Gebäude

### Solarkollektor

Funktion:

- verbessert Energiegewinn oder Ladefähigkeit
- wird vom Startroboter aus intern gespeichertem Iron Ore gebaut
- bevorzugt sonnige, bebaubare Sektoren

Benötigt:

- Iron Ore aus dem Frachtspeicher des Startroboters

### Roboterfabrik

Funktion:

- produziert den ersten zusätzlichen Roboter
- markiert das Ziel der ersten spielbaren Version

Benötigt:

- Iron Ore aus dem Frachtspeicher des Startroboters
- ausreichende Energieversorgung

Für den MVP kann die Roboterfabrik sehr einfach funktionieren:

- Beim Bau wird die notwendige Iron-Ore-Menge für die erste Produktion direkt mit verbaut oder intern eingelagert.
- Nach Fertigstellung kann die Fabrik den ersten zusätzlichen Roboter produzieren.
- Ein separates Input-/Output-Lagersystem ist noch nicht erforderlich.

## 16. MVP-Templates

### Energie sichern

```text
Wenn Batterie < X %
→ lade bis Y %
```

Standardwerte:

- X = 20 %
- Y = 80 %

### Erkunden

```text
Wenn Batterie > X %
→ erkunde angrenzenden unbekannten Sektor
```

Abbruchbedingungen:

- Batterie < Y %
- Iron Ore gefunden
- keine erreichbaren unbekannten Sektoren

### Iron Ore abbauen

```text
Wenn Iron Ore bekannt oder im aktuellen Sektor vorhanden
→ bewege dich dorthin
→ baue Iron Ore ab
→ speichere Iron Ore im eigenen Frachtspeicher
```

Abbruchbedingungen:

- Frachtspeicher voll
- Batterie < X %
- Ressource erschöpft

### Solarkollektor bauen

```text
Wenn genug Iron Ore im Frachtspeicher
→ suche geeigneten Bausektor
→ baue Solarkollektor
→ verbrauche Iron Ore aus Frachtspeicher
```

### Roboterfabrik bauen

```text
Wenn genug Iron Ore im Frachtspeicher
→ suche geeigneten Bausektor
→ baue Roboterfabrik
→ verbrauche Iron Ore aus Frachtspeicher
```

### Roboter produzieren

```text
Wenn Roboterfabrik vorhanden
UND Produktionsvoraussetzungen erfüllt
→ produziere neuen Roboter
```

Für den MVP reicht es, wenn die Roboterfabrik genau einen zusätzlichen Roboter erzeugen kann.

### Nicht löschbar: Stasis-Laden

```text
Wenn Batterie <= 1 %
→ gehe in Stasis
→ lade bis 50 %
```

## 17. MVP-Erfolgskriterien

Der MVP ist erfolgreich, wenn folgende Fragen positiv beantwortet werden können:

- Versteht der Spieler, warum der Roboter etwas tut?
- Ist es interessant, den Stack anzupassen?
- Entstehen kleine Überraschungen durch autonome Ausführung?
- Fühlt sich der Roboter wie ein eigenständiger Arbeiter an?
- Ist Energie als Einschränkung spürbar, aber nicht nervig?
- Ist das Produzieren des zweiten Roboters motivierend?
- Will man danach mehr Roboter, mehr Templates, mehr Gebäude und mehr Ressourcen haben?

---

# Ergänzung v3: MVP-Regelset, Energie-Leistungsmodell und Template-Set

## MVP-Regelset v0.1

### Karte

- Kartengröße: 10 x 10 Sektorfelder
- Gesamtfelder: 100
- Iron-Ore-Felder: 20
- Ein Iron-Ore-Feld enthält: 20 Iron Ore
- Iron-Ore-Felder sind nach Abbau der 20 Einheiten erschöpft

### Startroboter

- Batterie: 100 Energieeinheiten
- Anzeige: 100 Energieeinheiten = 100 %
- Frachtspeicher: 10 Iron Ore
- Startzustand: wacht bei 50 % Batterie auf
- Stasis: bei Batterie <= 1 %
- Stasis-Laden: bis 50 %

### Aktionskosten

Jede Basisaktion kostet 1 % Batterie:

- Bewegung um 1 Feld: 1 % Batterie und 1 Tick Dauer
- Abbauaktion: 1 %
- Bauaktion: 1 %

### Aktionsticks

Eine Aktion dauert 10 Spielsekunden.

Technische Übersetzung für den MVP:

- 1 Tick = 1 Spielsekunde
- 1 Bewegung = 1 Tick
- 1 Abbauaktion = 10 Ticks
- 1 Bauaktion = 10 Ticks
- 1 Produktionsaktion = 10 Ticks als vorläufiger MVP-Wert

### Iron Ore

- 1 Iron-Ore-Feld enthält 20 Einheiten
- 1 Abbauaktion erzeugt 1 Iron Ore
- 1 Abbauaktion kostet 1 % Batterie
- 1 Abbauaktion dauert 10 Ticks
- Der Startroboter kann 10 Iron Ore tragen

### Laden

Ohne Solarkollektor:

- Ladegeschwindigkeit: 1 % pro Spielsekunde
- 10 Sekunden laden = 10 %
- Von 1 % auf 50 %: 49 Sekunden
- Von 20 % auf 80 %: 60 Sekunden

Mit Solarkollektor:

- Ladegeschwindigkeit: 10 % pro Spielsekunde
- 10 Sekunden laden = 100 %
- Von 1 % auf 50 %: ca. 5 Sekunden
- Von 20 % auf 80 %: 6 Sekunden

## Energie-Leistungsmodell

Der Solarkollektor ist im MVP keine Batterie und kein einmaliger Energiespeicher. Er stellt eine Leistung bereit.

### Solarkollektor

- Baukosten: 5 Iron Ore
- Platzbedarf: 1 Feld
- Bereitgestellte Leistung: 100 Energie
- Beschleunigt das Laden von Robotern in seinem Wirkbereich auf 10 % pro Spielsekunde
- Muss für den MVP direkt neben der Roboterfabrik stehen

### Roboterfabrik

- Baukosten: 5 Iron Ore
- Platzbedarf: 1 Feld
- Leistungsbedarf: 40 Energie
- Die Roboterfabrik nimmt 40 Energie dauerhaft vom benachbarten Solarkollektor ab, solange sie aktiv ist.
- Im MVP gilt die Roboterfabrik während der Produktion als aktiv.
- Für die erste Version dauert eine Roboterproduktion vorläufig 10 Ticks.
- Nach Abschluss der Produktion ist das MVP-Ziel erreicht.

### Nachbarschaftsregel

Solarkollektor und Roboterfabrik müssen auf benachbarten Feldern stehen.

Für den MVP bedeutet „benachbart“ orthogonal:

- oben
- unten
- links
- rechts

Diagonal zählt nicht.

### Konsequenz für den ersten Bauablauf

Der Startroboter kann genau genug Iron Ore tragen, um die erste Energie- und Produktionsinfrastruktur zu bauen:

```text
Frachtspeicher: 10 Iron Ore

Solarkollektor: 5 Iron Ore
Roboterfabrik: 5 Iron Ore

Gesamt: 10 Iron Ore
```

Ein einzelnes Iron-Ore-Feld mit 20 Einheiten reicht damit für zwei volle Baupakete.

## MVP-Spielablauf mit Zahlen

1. Der Startroboter wacht mit 50 % Batterie auf.
2. Der Spieler aktiviert Templates für Energie sichern und Erkunden.
3. Der Roboter erkundet die Sektorkarte.
4. Der Roboter findet Iron Ore.
5. Der Roboter baut Iron Ore ab und speichert es im eigenen Frachtspeicher.
6. Für 10 Iron Ore benötigt er 10 Abbauaktionen, also 100 Spielsekunden und 10 % Batterie.
7. Der Roboter baut einen Solarkollektor für 5 Iron Ore.
8. Der Roboter baut eine Roboterfabrik für 5 Iron Ore orthogonal neben den Solarkollektor.
9. Die Roboterfabrik wird aktiv und nimmt während der Produktion 40 Energie Leistung vom Solarkollektor ab.
10. Nach vorläufig 10 Ticks wird der erste zusätzliche Roboter produziert.
11. Das MVP-Ziel ist erreicht.

## MVP-Template-Set v0.1

### Template 1: Energie sichern

Zweck: Verhindert, dass der Startroboter zu weit leerläuft.

```text
IF Batterie < 20 %
THEN lade bis Batterie >= 80 %
```

Standardwerte:

- Startwert: 20 %
- Zielwert: 80 %

Empfohlene Stack-Position:

```text
1. Energie sichern
```

### Template 2: Erkunden

Zweck: Der Roboter deckt unbekannte Sektoren auf und sucht Iron Ore.

```text
IF Batterie > 60 %
AND unbekannter angrenzender Sektor vorhanden
THEN erkunde angrenzenden unbekannten Sektor
UNTIL Iron Ore gefunden
OR Batterie < 30 %
OR kein unbekannter angrenzender Sektor vorhanden
```

Standardwerte:

- Startbedingung: Batterie > 60 %
- Abbruch Batterie: Batterie < 30 %
- Abbruch Fund: Iron Ore gefunden

Empfohlene Stack-Position:

```text
6. Erkunden
```

### Template 3: Iron Ore abbauen

Zweck: Baut bekanntes Iron Ore ab und speichert es im Frachtspeicher des Roboters.

```text
IF bekanntes Iron-Ore-Feld vorhanden
AND Frachtspeicher < 10 Iron Ore
AND Batterie > 25 %
THEN bewege dich zum nächsten bekannten Iron-Ore-Feld
AND baue Iron Ore ab
UNTIL Frachtspeicher = 10 Iron Ore
OR Batterie < 25 %
OR Iron-Ore-Feld erschöpft
```

Standardwerte:

- Mindestbatterie: 25 %
- Zielmenge: Frachtspeicher voll
- Frachtspeicherlimit: 10 Iron Ore

Empfohlene Stack-Position:

```text
3. Iron Ore abbauen
```

### Template 4: Solarkollektor bauen

Zweck: Baut die erste Energiequelle.

```text
IF Frachtspeicher >= 5 Iron Ore
AND Solarkollektor nicht vorhanden
AND Batterie > 20 %
THEN suche geeignetes Baufeld
AND baue Solarkollektor
```

Standardwerte:

- Kosten: 5 Iron Ore
- Mindestbatterie: 20 %
- Ausführungsstil: ausgewogen

Standortprofil:

- Feld muss frei sein
- Feld muss bebaubar sein
- Feld sollte hohes Sonnenlicht haben
- Feld sollte nahe am aktuellen Arbeitsbereich liegen
- Feld muss ein freies orthogonales Nachbarfeld für die Roboterfabrik haben

Empfohlene Stack-Position:

```text
4. Solarkollektor bauen
```

### Template 5: Roboterfabrik bauen

Zweck: Baut die Produktionsstätte neben dem Solarkollektor.

```text
IF Solarkollektor vorhanden
AND Roboterfabrik nicht vorhanden
AND Frachtspeicher >= 5 Iron Ore
AND Batterie > 20 %
THEN suche freies orthogonales Nachbarfeld neben Solarkollektor
AND baue Roboterfabrik
```

Standardwerte:

- Kosten: 5 Iron Ore
- Mindestbatterie: 20 %
- Pflichtbedingung: orthogonal neben Solarkollektor
- Ausführungsstil: strikt

Standortprofil:

- Feld muss frei sein
- Feld muss bebaubar sein
- Feld muss orthogonal neben Solarkollektor liegen
- Feld sollte möglichst nicht auf Iron Ore liegen

Empfohlene Stack-Position:

```text
5. Roboterfabrik bauen
```

### Template 6: Roboter produzieren

Zweck: Erfüllt die MVP-Siegbedingung.

```text
IF Roboterfabrik vorhanden
AND Roboterfabrik betriebsbereit
AND benachbarter Solarkollektor freie Leistung >= 40
THEN aktiviere Roboterfabrik
AND produziere 1 Standardroboter
```

Standardwerte:

- Leistungsbedarf: 40 Energie
- Produktionsziel: 1 Standardroboter
- MVP-Limit: maximal 1 produzieren
- Vorläufige Produktionsdauer: 10 Ticks

Verhalten:

- Die Roboterfabrik wird während der Produktion aktiv.
- Solange sie aktiv ist, nimmt sie 40 Energie Leistung vom Solarkollektor ab.
- Nach Abschluss der Produktion wird die Fabrik wieder inaktiv.
- Das MVP-Ziel ist erreicht, sobald der neue Roboter produziert wurde.

Empfohlene Stack-Position:

```text
2. Roboter produzieren
```

Dieses Template kann weit oben im Stack stehen, weil es fast immer blockiert ist, bis alle Voraussetzungen erfüllt sind. Sobald Fabrik und Energie vorhanden sind, wird das MVP-Ziel sofort ausgelöst.

### Template 7: Stasis-Laden

Zweck: Nicht löschbares Sicherheitsprogramm.

```text
IF Batterie <= 1 %
THEN gehe in Stasis
AND lade bis Batterie >= 50 %
```

Standardwerte:

- Auslöser: Batterie <= 1 %
- Zielwert: Batterie >= 50 %

Besonderheit:

- nicht löschbar
- nicht deaktivierbar
- immer unterste Sicherheitsebene

## Empfohlener Start-Stack

Für die erste spielbare Version ist dieser Stack intuitiv:

```text
1. Energie sichern
2. Iron Ore abbauen
3. Solarkollektor bauen
4. Roboterfabrik bauen
5. Roboter produzieren
6. Erkunden
7. Stasis-Laden
```

Für eine stärker zielorientierte Variante kann „Roboter produzieren“ weiter nach oben:

```text
1. Energie sichern
2. Roboter produzieren
3. Iron Ore abbauen
4. Solarkollektor bauen
5. Roboterfabrik bauen
6. Erkunden
7. Stasis-Laden
```

## Empfohlener Tutorial-Start

Der Spieler sollte zu Beginn nicht alle Templates gleichzeitig aktiv haben. Besser ist ein gestufter Einstieg.

### Schritt 1: Iron Ore finden

```text
Aktiv:
1. Energie sichern
2. Erkunden
3. Stasis-Laden
```

### Schritt 2: Iron Ore sammeln

Nach Iron-Ore-Fund:

```text
Aktiv:
1. Energie sichern
2. Iron Ore abbauen
3. Erkunden
4. Stasis-Laden
```

### Schritt 3: Infrastruktur bauen

Wenn der Frachtspeicher voll ist:

```text
Aktiv:
1. Energie sichern
2. Solarkollektor bauen
3. Roboterfabrik bauen
4. Iron Ore abbauen
5. Erkunden
6. Stasis-Laden
```

### Schritt 4: Roboter produzieren

Wenn die Roboterfabrik steht:

```text
Aktiv:
1. Energie sichern
2. Roboter produzieren
3. Iron Ore abbauen
4. Erkunden
5. Stasis-Laden
```

## Ergänzte offene Punkte

Noch zu klären:

- ob Roboterproduktion später zusätzlich Iron Ore benötigt oder im MVP nur Fabrik + Energie ausreicht
- ob Solarkollektoren später netzwerkfähig sind oder nur benachbarte Verbraucher versorgen
- ob mehrere Verbraucher Leistung vom selben Solarkollektor teilen können
- wie Leistungsausfall wirkt, wenn mehrere Gebäude gleichzeitig aktiv sind
- ob Roboter im Solarkollektor-Wirkbereich oder nur direkt am Solarkollektor schneller laden
- wie Kommunikationsgrid und Stromversorgung später zusammenhängen

---

# Ergänzung v4: MVP-Karte, Erkundung und Fog of War

## Startposition

Die Startposition des Startroboters wird zufällig auf einem freien Feld der 10x10-Sektorkarte gewählt.

Regeln:

- Das Startfeld muss frei sein.
- Das Startfeld darf kein Iron-Ore-Feld sein.
- Das Startfeld darf kein blockiertes Feld sein, falls blockierte Felder im MVP bereits existieren.
- Nach der Platzierung deckt der Startroboter sofort alle Felder innerhalb seiner Sichtweite auf.

Die zufällige Startposition unterstützt Wiederspielbarkeit. Gleichzeitig darf sie den MVP nicht unspielbar machen. Deshalb wird die Ressourcenverteilung nach der Startplatzierung so geprüft oder erzeugt, dass mindestens ein Iron-Ore-Vorkommen in sinnvoller Erkundungsdistanz erreichbar ist.

## Iron-Ore-Verteilung

Die MVP-Karte enthält 20 Iron-Ore-Felder. Diese Felder werden zufällig verteilt, treten aber als Cluster auf und nicht als gleichmäßig verstreute Einzelfelder.

Clusterregeln:

- Minimum pro Cluster: 3 Iron-Ore-Felder
- Maximum pro Cluster: 40 % aller Iron-Ore-Felder
- Bei 20 Iron-Ore-Feldern ergibt das eine maximale Clustergröße von 8 Feldern.
- Ein Cluster wächst orthogonal über benachbarte Felder.
- Orthogonal bedeutet: oben, unten, links, rechts.
- Diagonale Einzelverbindungen zählen nicht als stabile Clusterverbindung.

Damit liegt die empfohlene Clustergröße für den MVP bei:

```text
3 bis 8 Iron-Ore-Felder pro Cluster
```

Typische mögliche Verteilungen der 20 Iron-Ore-Felder:

```text
8 + 6 + 6
7 + 5 + 4 + 4
6 + 5 + 5 + 4
5 + 5 + 5 + 5
8 + 4 + 4 + 4
```

Dadurch entstehen in der Regel 3 bis 5 Iron-Ore-Cluster auf der 10x10-Karte. Das ist klein genug, um im MVP lesbar zu bleiben, und groß genug, um Erkundung und Positionierung relevant zu machen.

## Fairnessregel für Ressourcen

Damit eine zufallsgenerierte MVP-Karte nicht zu zäh oder unspielbar wird, gilt eine einfache Fairnessregel:

```text
Mindestens ein Iron-Ore-Feld muss innerhalb von 4 bis 6 Bewegungsschritten vom Startfeld erreichbar sein.
```

Dieses Vorkommen muss nicht direkt sichtbar sein. Der Spieler soll weiterhin erkunden müssen. Es soll aber verhindert werden, dass der Startroboter einen großen Teil der Karte absuchen muss, bevor die erste Ressource überhaupt erreichbar wird.

## Sichtweite des Startroboters

Der Startroboter besitzt im MVP eine Sichtweite von 2 Feldern.

Die Sichtweite wird für den Sektor-Prototyp als quadratischer Radius interpretiert:

- Sichtweite 1 = 3x3-Feldbereich
- Sichtweite 2 = 5x5-Feldbereich
- Sichtweite 3 = 7x7-Feldbereich

Für den Startroboter bedeutet das:

```text
Startroboter-Sichtweite: 2 Felder
Sichtbereich auf freier Fläche: 5 x 5 Felder
```

Andere Robotermodelle können später andere Sichtweiten besitzen. Scout-Roboter können zum Beispiel eine höhere Sichtweite erhalten, während spezialisierte Bau- oder Minenroboter eine geringere Sichtweite haben können.

## Aufdecken neuer Felder

Wenn ein Roboter einen Schritt geht, wird nach Abschluss der Bewegung sein Sichtbereich neu berechnet.

Ablauf:

1. Der Roboter beginnt eine Bewegung auf ein benachbartes Feld.
2. Die Bewegung dauert im MVP 1 Tick.
3. Nach Abschluss der Bewegung steht der Roboter auf dem neuen Feld.
4. Der Sichtbereich des Roboters wird neu berechnet.
5. Alle bisher unbekannten Felder innerhalb seiner Sichtweite werden aufgedeckt.
6. Bereits entdeckte Felder werden aktualisiert, sofern sie aktuell sichtbar sind.

Für den MVP reicht es aus, Sicht nach Abschluss einer Bewegung zu aktualisieren. Eine kontinuierliche Sichtaktualisierung während der Bewegung ist für den Sektor-Prototyp nicht erforderlich.

## Kartenrand als Barriere

Der Rand des Spielfelds erscheint als Barriere.

Regeln:

- Es existieren keine Felder außerhalb der 10x10-Karte.
- Sichtbereiche werden am Kartenrand abgeschnitten.
- Roboter können die Karte nicht verlassen.
- Es werden nur Felder innerhalb der Spielfläche aufgedeckt.

Beispiel: Steht ein Roboter mit Sichtweite 2 in einer Ecke, sieht er nicht 5x5 Felder, sondern nur den innerhalb der Karte liegenden Ausschnitt.

## Sichtzustände und Nebel des Krieges

Jedes Feld kann einen von drei Sichtzuständen haben.

### 1. Unbekannt

Das Feld wurde noch nie gesehen.

Eigenschaften:

- komplett unsichtbar
- keine Information über Gelände, Ressourcen, Gebäude oder Einheiten
- kann nicht direkt als Ziel für Programme verwendet werden, außer über allgemeine Erkundungslogiken wie „erkunde unbekannten angrenzenden Sektor“

### 2. Entdeckt, aber nicht aktuell sichtbar

Das Feld wurde früher gesehen, liegt aber aktuell nicht in Sichtweite eines Roboters oder Gebäudes.

Eigenschaften:

- erhält Nebel des Krieges
- bekannte Informationen bleiben sichtbar, werden aber als potenziell veraltet behandelt
- spätere Änderungen auf diesem Feld werden nicht angezeigt, solange es im Nebel liegt

Für den MVP ohne Fraktionen ist dieser Zustand vor allem als Vorbereitung auf spätere Spielsysteme relevant. Sobald andere Fraktionen, bewegliche Gefahren oder Umweltveränderungen hinzukommen, wird der Nebel des Krieges spielmechanisch wichtiger.

### 3. Aktuell sichtbar

Das Feld liegt aktuell in Sichtweite eines Roboters oder Gebäudes.

Eigenschaften:

- Informationen sind aktuell
- Ressourcen, Gebäude und Einheiten werden sichtbar
- der Nebel des Krieges ist aufgehoben

## Gebäudesicht

Gebäude besitzen ebenfalls eine Sichtweite und können Nebel des Krieges aufheben.

Für den MVP gilt:

```text
Solarkollektor-Sichtweite: 2 Felder
Roboterfabrik-Sichtweite: 2 Felder
```

Regeln:

- Ein Gebäude deckt alle Felder innerhalb seiner Sichtweite auf.
- Solange ein Gebäude existiert und aktiv ist, bleiben diese Felder aktuell sichtbar.
- Gebäude können dadurch dauerhaft sichtbare Inseln auf der Karte erzeugen.
- Gebäudesicht unterstützt das Gefühl von Basisaufbau, auch wenn der MVP noch keine klassische Basis- oder Lagerzone enthält.

## Zusammenspiel von Roboter- und Gebäudesicht

Ein Feld ist aktuell sichtbar, wenn mindestens eine der folgenden Bedingungen erfüllt ist:

- Es liegt in Sichtweite eines Roboters.
- Es liegt in Sichtweite eines aktiven Gebäudes.

Ein Feld wird zu „entdeckt, aber nicht aktuell sichtbar“, wenn:

- es früher aufgedeckt wurde,
- aber aktuell weder von einem Roboter noch von einem aktiven Gebäude gesehen wird.

Ein Feld bleibt „unbekannt“, solange es noch nie innerhalb einer Sichtweite lag.

## Bedeutung für den MVP

Diese Regeln sorgen dafür, dass Erkundung bereits im MVP relevant ist:

- Der Startpunkt ist zufällig.
- Iron Ore ist nicht automatisch bekannt.
- Der Roboter muss die Karte schrittweise aufdecken.
- Gebäude stabilisieren Sichtbereiche.
- Der Kartenrand ist klar lesbar.
- Entdeckte, aber nicht sichtbare Bereiche bleiben als Wissen erhalten, sind aber nicht mehr aktuell.

Damit entsteht bereits mit wenigen Systemen ein einfaches, nachvollziehbares RTS-Gefühl: Der Spieler sieht nur, was seine Roboter und Gebäude erfassen können.

# Ergänzung v5: Gruppen, Kommunikationsbindung und Offline-Zustände

Roboter können später Gruppen zugeordnet werden. Jede Gruppe besitzt einen eigenen Programmstack. Roboter in dieser Gruppe führen den Gruppenstack aus, sodass der Spieler nicht jeden Roboter einzeln programmieren muss.

Standardroboter sind strikt an das Kommunikationsgrid gebunden. Verlässt ein Standardroboter das Grid, wird sein Gruppenprogramm nicht mit einer alten Version weitergeführt. Stattdessen wechselt der Roboter in einen deaktivierten Offline-Zustand.

Ein deaktivierter Standardroboter:

- führt keine normalen Programme aus
- betreibt kein Mining
- baut nicht
- transportiert nicht
- bewegt sich nicht aufgrund seines Gruppenprogramms
- wartet, bis das Kommunikationsgrid ihn wieder erreicht
- behält nur das nicht löschbare Stasis-Laden als Sicherheitsebene

Spezialroboter wie Scouts können eine Ausnahme bilden. Ein Scout darf das Kommunikationsgrid verlassen. Sobald er außerhalb des Grids ist, wird sein aktuell aktiver Stack gelocked.

Ein Scout außerhalb des Grids:

- arbeitet mit dem zuletzt aktivierten Stack weiter
- kann nicht umprogrammiert werden
- kann keine neue Gruppenlogik erhalten
- kann erst wieder geändert werden, wenn er ins Grid oder zur Basis zurückkehrt

Designregel:

> Standardroboter brauchen Infrastruktur. Scouts brauchen Vorbereitung.

Damit gibt es keine verzögerte Gruppenprogramm-Synchronisation und keine alten Stack-Versionen. Außerhalb des Grids gibt es nur zwei klare Fälle:

1. Standardroboter: deaktiviert
2. Scout/Spezialist: läuft weiter, aber Programm ist gelocked

# Änderungsnotiz v5

- Gruppenstacks und Offline-Zustände wurden festgelegt.
- Standardroboter werden außerhalb des Kommunikationsgrids deaktiviert.
- Scouts/Spezialisten dürfen außerhalb des Grids weiterarbeiten, ihr Stack ist dort aber gelocked.
- Bewegungsdauer wurde geändert: 1 Bewegung um 1 Feld dauert jetzt 1 Tick bzw. 1 Spielsekunde.
- Abbau, Bau und Produktion bleiben vorläufig bei 10 Ticks pro Aktion.

## MVP-Grafikassets: Terrain, Ressourcen und Objekt-Sprites

Für den MVP werden folgende PNG-Assets bereitgestellt:

```text
plain.png
iron-ore.png
start-robot.png
solar-collector.png
robot-factory.png
```

### Rollen der Assets

- `plain.png`: Basistile für normales begehbares/bebaubares Terrain
- `iron-ore.png`: transparentes Overlay für ein Feld mit abbaubarem Iron Ore
- `start-robot.png`: Sprite des Startroboters
- `solar-collector.png`: Sprite des Solarkollektors
- `robot-factory.png`: Sprite der Roboterfabrik

### Renderlogik

Im MVP werden diese Assets auf der 10x10-Sektorkarte so verwendet:

- jedes Feld zeichnet zuerst `plain.png`
- enthält ein Feld Iron Ore mit verbleibender Menge > 0, wird `iron-ore.png` darüber gezeichnet
- erschöpfte Iron-Ore-Felder zeigen wieder nur normales Terrain
- Roboter und Gebäude werden als eigene Sprites über dem Feld gezeichnet

Fog of War und Unknown-Zustände werden als Overlays über den Terrain-/Ressourcen-Layern dargestellt. Die Assets selbst ändern keine Spielregeln.


## Gebaeudestufen / Building Tiers

Gebaeude werden langfristig in Stufen gegliedert. Jede Stufe erweitert die strategischen Moeglichkeiten des Spielers.

Fuer den MVP bleiben nur Solar Collector und Roboterfabrik aktiv. Das Konzept sieht aber bereits Level-1- und Level-2-Gebaeude vor.

### Level 1: Basisinfrastruktur

```text
Level 1 Gebaeude:
- Solar Collector
- Roboterfabrik
- KI-Forschungszentrum
```

#### Solar Collector

Funktion:

```text
Basis-Energieversorgung
```

Regeln:

- erzeugt Energie/Leistung
- ermoeglicht schnelleres Laden
- versorgt fruehe Produktionsgebaeude
- ist Voraussetzung fuer den Betrieb der ersten Roboterfabrik

#### Roboterfabrik

Funktion:

```text
erste Produktion
```

Regeln:

- produziert Standardroboter
- benoetigt Energie vom Solar Collector
- ist zentrale Voraussetzung fuer Expansion
- kann spaeter durch Forschung fortgeschrittene Robotertypen oder Produktionsoptionen freischalten

#### KI-Forschungszentrum

Funktion:

```text
erste Forschung
```

Regeln:

- schaltet Forschung frei
- erzeugt Forschungskapazitaet
- erlaubt erste Upgrades
- ermoeglicht spaetere Gebaeudestufen, neue Einheiten und neue Ressourcenverwertung

Das KI-Forschungszentrum ist konzeptionell ein Level-1-Gebaeude, aber nicht Teil des initialen MVP.

MVP-Einordnung Level 1:

```text
MVP aktiv:
- Solar Collector
- Roboterfabrik

MVP vorbereitet:
- KI-Forschungszentrum
```

### Level 2: Infrastruktur, Industrie und Spezialisierung

Level-2-Gebaeude werden durch Forschung freigeschaltet. Sie erweitern das Spiel von einfacher Basisproduktion zu Kommunikation, Energieverteilung, spezialisierter Produktion und Ressourcenverarbeitung.

```text
Level 2 Gebaeude:
- Sendeturm
- Grid Energy Line
- Verbesserte Roboterfabrik
- Drohnenfabrik
- Gasfoerderanlage / Gasmine
- Stahlwerk
```

#### Sendeturm

Funktion:

```text
Erweitert Kommunikationsgrid / Handlungsradius normaler Roboter
```

Regeln:

- normale Roboter koennen nur innerhalb des Kommunikationsgrids aktiv arbeiten
- Sendetuerme erweitern dieses Grid
- ermoeglichen Expansion ohne Scout-Spezialregeln
- koennen Voraussetzung fuer entfernte Bergbau-, Bau- oder Reparaturaufgaben sein

Moegliche Forschung:

```text
Kommunikationsinfrastruktur I
-> Sendeturm freigeschaltet
```

#### Grid Energy Line

Funktion:

```text
Erweitert Energieversorgung ueber direkte Nachbarschaft hinaus
```

Bisher muessen fruehe Gebaeude direkt neben Energiequellen wie Solar Collectoren stehen. Grid Energy Lines erweitern dieses System.

Regeln:

- verbinden Energiequellen mit entfernten Gebaeuden
- Gebaeude muessen nicht mehr direkt neben einem Solar Collector stehen
- erlauben groessere Produktionscluster
- machen Bau-Schemata und geplante Basisstrukturen wichtiger
- koennen als Voraussetzung fuer Level-2-/Level-3-Gebaeude dienen

Moegliche Forschung:

```text
Energienetz I
-> Grid Energy Line freigeschaltet
```

#### Verbesserte Roboterfabrik

Funktion:

```text
Fortgeschrittene Produktion
```

Regeln:

- produziert Standardroboter schneller
- kann verbesserte Robotervarianten bauen
- kann mehrere Ressourcen benoetigen
- kann mehr Energie benoetigen
- kann Voraussetzung fuer spezialisierte Einheiten sein

Moegliche Kostenbeispiele:

```text
Iron Ore
Steel Plates
Silicium
Energie
```

Moegliche Forschung:

```text
Industrielle Fertigung I
-> Verbesserte Roboterfabrik freigeschaltet
```

#### Drohnenfabrik

Funktion:

```text
Produktion flugfaehiger Einheiten
```

Regeln:

- produziert flugfaehige Drohnen
- Drohnen koennen Geroell und Flussfelder ueberqueren
- Drohnen nehmen bei Lava-/Quecksilberfeldern weiterhin Umweltschaden
- kann Gas, Silicium oder Steel Plates benoetigen

Moegliche Forschung:

```text
Flugmechanik I
-> Drohnenfabrik freigeschaltet
```

#### Gasfoerderanlage / Gasmine

Funktion:

```text
Foerdert Gas aus Gasvorkommen
```

Begriffliche Trennung:

```text
Gasvorkommen = Ressource auf der Karte
Gasfoerderanlage / Gasmine = Gebaeude zur Foerderung
```

Regeln:

- muss auf oder neben einem Gasvorkommen gebaut werden
- foerdert Gas ueber Zeit
- benoetigt Energie
- Gas wird fuer hoehere Forschung, Fluggeraete, Energie oder Spezialproduktion verwendet

Moegliche Forschung:

```text
Gasextraktion
-> Gasfoerderanlage freigeschaltet
```

#### Stahlwerk

Funktion:

```text
Veredelt Iron Ore zu Steel Plates
```

Regeln:

- verbraucht Iron Ore und Energie
- produziert Steel Plates
- Steel Plates sind eine verarbeitete Ressource
- Steel Plates werden fuer Level-2-/Level-3-Gebaeude, groessere Fabriken und robuste Einheiten benoetigt

Beispielrezept:

```text
2 Iron Ore + 10 Energie + 10 Ticks
-> 1 Steel Plate
```

Moegliche Forschung:

```text
Metallverarbeitung I
-> Stahlwerk freigeschaltet
```

### Verarbeitete Ressource: Steel Plates

Mit dem Stahlwerk entsteht neben Rohstoffen eine verarbeitete Materialkategorie.

```text
Rohstoffe:
- Iron Ore
- Gas
- Silicium

Verarbeitete Materialien:
- Steel Plates
```

Steel Plates sind kein natuerliches Vorkommen, sondern ein Produktionsgut.

```text
Iron Ore
-> Stahlwerk
-> Steel Plates
```

Dadurch bleibt Iron Ore auch in spaeteren Spielphasen relevant.

### Beispielhafte Level-2-Progression

```text
Iron Ore
-> Solar Collector
-> Roboterfabrik
-> KI-Forschungszentrum
-> Forschung: Metallverarbeitung
-> Stahlwerk
-> Steel Plates
-> Verbesserte Roboterfabrik / Sendeturm / Grid Energy Line
```

Alternative Progression:

```text
KI-Forschungszentrum
-> Forschung: Gasextraktion
-> Gasfoerderanlage
-> Gas
-> Drohnenfabrik / fortgeschrittene Energie / weitere Forschung
```

### MVP-Einordnung

Im MVP aktiv:

- Solar Collector
- Roboterfabrik

Im MVP vorbereitet, aber nicht aktiv:

- KI-Forschungszentrum
- Sendeturm
- Grid Energy Line
- Verbesserte Roboterfabrik
- Drohnenfabrik
- Gasfoerderanlage / Gasmine
- Stahlwerk
- Steel Plates

Designregel:

> Level-2-Gebaeude werden durch Forschung freigeschaltet und erweitern das Spiel von einfacher Basisproduktion zu Infrastruktur, Energieverteilung, Kommunikation, Ressourcenfoerderung, Ressourcenveredelung und spezialisierten Einheiten. Sie benoetigen haeufig mehrere Ressourcen oder verarbeitete Materialien und ermoeglichen dadurch hoehere Gebaeudestufen, neue Robotertypen und komplexere Automatisierung.

## Konsolidierte Regeln v16

### Ressourcen-Kategorien

Ressourcen werden konsequent getrennt:

```text
Natürliche Rohstoffe:
- Iron Ore
- Gas
- Silicium

Verarbeitete Materialien:
- Steel Plates
```

Steel Plates sind kein natürliches Vorkommen auf der Karte, sondern werden später durch Produktionsgebäude hergestellt.

Beispiel:

```text
2 Iron Ore + 10 Energie + 10 Ticks
→ 1 Steel Plate
```

### Verbindliche Benennung Forschung

```text
Spielname:
KI-Forschungszentrum

Technische ID:
aiResearchCenter
```

Ältere Arbeitsnamen wie `KI-Forschungszentrum`, `Forschungszentrum` oder `aiResearchCenter` gelten als überholt.

### Bau- und Belegungsregeln

- Roboter können nicht auf einem Gebäude-Tile stehen.
- Gebäude blockieren Bewegung.
- Baustellen blockieren Bewegung, sobald der Bau begonnen wurde.
- Ein Gebäude entsteht auf einem orthogonal angrenzenden Nachbarfeld des bauenden Roboters.
- Der bauende Roboter muss neben dem Baufeld stehen.
- Diagonale Nachbarschaft zählt nicht.
- Auf einem aktiven Ressourcenfeld kann nicht gebaut werden.
- Ressourcenabbauende Gebäude wie Minen oder Gasförderanlagen müssen daher direkt neben der Ressource platziert werden.
- Wenn ein Iron-Ore-Feld vollständig aufgebraucht ist, darf darauf gebaut werden, sofern das Terrain bebaubar ist.
- Ein Feld, auf dem ein Bau begonnen wird, wird reserviert und für Bewegung gesperrt.
- Mehrere Roboter können an einem Gebäude bauen und dadurch den Fortschritt beschleunigen.
- Jeder beteiligte Roboter muss neben dem Baufeld stehen und zahlt seine eigenen Batteriekosten für erfolgreiche Bauaktionen.

### Energie- und Lade-Edge-Cases

- Selbstladung findet nur statt, wenn Laden oder Stasis-Laden der aktive Programmschritt ist.
- Während anderer Programme findet keine Selbstladung statt.
- Roboter können beim Arbeiten oder Bewegen extern laden, wenn sie neben einer gültigen Energiequelle arbeiten oder sich auf einer gültigen Energieposition befinden.
- Mehrere externe Energiequellen stacken nicht.
- Ausnahme: Selbstladung plus eine externe Energiequelle kann kombiniert werden, wenn der aktive Programmschritt Laden ist.
- Externe Ladung verbraucht immer Netzleistung.
- Wenn alle Leistung durch Gebäude abgenommen wird, können Roboter nicht extern laden.
- Gebäude können deaktiviert werden und nehmen dann keine Leistung ab.
- Batterie wird nach erfolgreicher Aktion verbraucht.
- Wenn vor der Durchführung klar ist, dass nicht genügend Batterie für eine Aktion vorhanden ist, wird das Programm übergangen oder blockiert und die Aktion startet nicht.

### Diagnosegründe

```text
Nicht genug Batterie für Aktion
Keine freie Netzleistung zum Laden
Keine externe Stromversorgung erreichbar
Gebäude deaktiviert
Baufeld blockiert
Baufeld enthält aktive Ressource
```

## Energiemanagement, Ladefähigkeit und Energie-Infrastruktur

Energie ist nicht nur ein Batteriewert einzelner Roboter, sondern ein Infrastruktur- und Einheitenrollen-System.

Das Energiemanagement besteht aus drei Ebenen:

```text
1. selbstladefähige Einheiten
2. extern versorgte Einheiten
3. Energie-Infrastruktur über Solar Collectoren und Grid Energy Lines
```

### Selbstladefähige Einheiten

Einige Robotertypen können sich selbst laden.

Beispiele:

```text
- Starter Roboter
- Scouts
- spätere Spezialroboter mit Autonomie-Modul
```

Diese Einheiten können das bekannte Ladeprogramm nutzen:

```text
IF Batterie < 20 %
THEN lade bis Batterie >= 80 %
```

Regel:

```text
Selbstladefähige Roboter können auch ohne externe Infrastruktur Energie zurückgewinnen.
```

Für den Starter Roboter ist diese Regel wichtig, weil er die Partie absichert und frühe Sackgassen verhindert.

Im MVP gilt weiterhin:

```text
Ohne Solar Collector:
+1 % Batterie pro Sekunde

Mit Solar Collector:
+10 % Batterie pro Sekunde
```

### Extern versorgte Einheiten

Andere Robotertypen sind stärker spezialisiert und auf externe Stromversorgung angewiesen.

Beispiele:

```text
- Iron Miner
- Miner für neue Ressourcen
- Transportroboter
- Kampfdrohnen
- ggf. Konstrukteure, je nach Balance
```

Regel:

```text
Extern versorgte Roboter laden nur, wenn sie auf oder neben einem aktiven Energieversorgungsfeld stehen.
```

Damit entsteht ein Trade-off:

```text
Starter Roboter:
langsam, flexibel, autark

Iron Miner:
schnell, spezialisiert, aber abhängig von Energie-Infrastruktur
```

### Solar Collectoren

Solar Collectoren sind frühe Energiequellen.

Regeln:

- erzeugen Energie/Leistung
- laden Roboter auf orthogonal angrenzenden Feldern automatisch auf
- versorgen frühe Produktionsgebäude
- diagonale Nachbarschaft zählt nicht

Orthogonale Ladefelder:

```text
    Laden
Laden Solar Laden
    Laden
```

Für den MVP gilt:

```text
Solar Collector lädt Roboter auf orthogonal angrenzenden Feldern mit +10 % pro Sekunde.
```

Das Laden passiert automatisch, wenn ein Roboter auf einem gültigen Ladefeld steht.

Wichtige Trennung:

```text
Automatische Energieaufnahme:
Roboter steht neben Solar Collector oder Grid Energy Line
→ Batterie steigt automatisch

Ladeprogramm:
Roboter erkennt niedrige Batterie
→ bewegt sich gezielt zu einer Ladequelle
```

Das Ladeprogramm steuert also nicht den Ladevorgang selbst, sondern die Entscheidung, wann ein Roboter aktiv ein Ladefeld aufsucht.

### Grid Energy Lines

Grid Energy Lines erweitern später die Energieversorgung.

Funktion:

```text
Grid Energy Line:
- leitet Energie von Solar Collectoren weiter
- erzeugt Lade-/Versorgungsfelder entlang des Energienetzes
- erlaubt Gebäude fernab direkter Solar-Collector-Nachbarschaft
- lädt Roboter auf orthogonal angrenzenden Feldern automatisch
```

Beispiel:

```text
S = Solar Collector
G = Grid Energy Line
R = Roboter

S - G - G - G
        R
```

Der Roboter kann neben einer Grid Energy Line laden, obwohl er nicht direkt neben einem Solar Collector steht.

### Energiezonen

Später kann aus Solar Collectoren und Grid Energy Lines ein Energienetz entstehen.

```text
Energiequelle
→ Grid Energy Line
→ versorgte Felder
→ Gebäude / Roboter können dort Energie nutzen
```

Felder können dann einen einfachen Energiezugang besitzen:

```text
unpowered
powered
```

Oder technisch:

```text
field.energyAccess = true
```

Roboter können automatisch laden, wenn sie auf einem Feld mit Energiezugang stehen oder orthogonal an ein aktives Energieversorgungsfeld angrenzen.

### Batterie vs. Netzleistung

Es gibt zwei unterschiedliche Energiebegriffe.

#### Roboter-Batterie

```text
Roboter-Batterie:
- individueller Energiespeicher
- sinkt durch Bewegung, Abbau, Bau, Kampf
- steigt durch Laden
```

#### Netzleistung

```text
Energie-Leistung:
- wird von Solar Collectoren erzeugt
- wird von Fabriken, Rechenzentren, Raffinerien usw. verbraucht
- kann später über Grid Energy Lines verteilt werden
```

Beispiel:

```text
Solar Collector:
100 Leistung

Roboterfabrik:
verbraucht 40 Leistung während Produktion

freie Leistung:
60
```

Für den Anfang bleibt das Laden einfach:

```text
Solar Collector/Grid Energy Line lädt Roboter automatisch,
solange das Energienetz aktiv ist.
```

Später kann Ladeleistung begrenzt oder mit freier Netzleistung verrechnet werden.

### Charging Mode pro Robotertyp

Jeder Robotertyp erhält perspektivisch eine Ladeart.

```text
ChargingMode:
- selfCharging
- externalOnly
- hybrid
```

Beispiele:

```text
Starter Roboter:
hybrid oder selfCharging

Boden Scout:
selfCharging

Iron Miner:
externalOnly

Transportroboter:
externalOnly

Konstrukteur:
externalOnly oder hybrid, je nach Balance
```

Bedeutung:

```text
selfCharging:
kann ohne externe Infrastruktur laden

externalOnly:
kann nur an aktiven Lade-/Versorgungsfeldern laden

hybrid:
kann langsam selbst laden, lädt aber schneller am Energienetz
```

### Ladeprogramme nach Robotertyp

#### Selbstladefähiger Roboter

```text
IF Batterie < 20 %
THEN lade bis Batterie >= 80 %
```

Der Roboter kann notfalls überall laden.

#### Extern versorgter Roboter

```text
IF Batterie < 20 %
THEN suche nächstes Ladefeld im Energienetz
AND bewege dich dorthin
AND lade bis Batterie >= 80 %
```

Wenn kein Ladefeld erreichbar ist:

```text
Programm blockiert:
Keine externe Stromversorgung erreichbar
```

Dieser Diagnosegrund ist wichtig, damit der Spieler versteht, warum spezialisierte Roboter nicht weiterarbeiten.

### Designwirkung

Das System erzeugt eine klare Entscheidung:

```text
Will ich flexible, aber langsamere Roboter?
Oder spezialisierte, effiziente Roboter, die Infrastruktur brauchen?
```

Beispiele:

- Iron Miner arbeitet effizient, braucht aber Ladeinfrastruktur in der Nähe.
- Transportroboter benötigen ein Energienetz für stabile Logistikrouten.
- Scouts können allein losziehen, sind aber weniger produktiv.
- Starter Roboter bleibt ein robuster, autarker Startanker.

### MVP-Einordnung

Im MVP aktiv:

- Starter Roboter kann sich selbst laden
- Solar Collector lädt orthogonal angrenzende Roboter automatisch
- Ladeprogramm des Starter Roboters bleibt nutzbar
- Roboterfabrik benötigt weiterhin Leistung vom Solar Collector

Im MVP vorbereitet:

- `ChargingMode`
- Unterscheidung selbstladefähig vs. externalOnly
- Ladefeld-/Energiezugang-Logik
- spätere Grid Energy Lines

Nicht im MVP aktiv:

- externe-only Spezialroboter
- Grid Energy Lines
- Energiezonen über mehrere Felder
- Netzleistungsverteilung über Leitungen
- begrenzte Ladeleistung pro Netz
- Energiemanagement für Transport- oder Miner-Flotten

Designregel:

> Einige Robotertypen können sich selbst laden, darunter der Starter Roboter und bestimmte Scouts. Andere spezialisierte Robotertypen, etwa Miner, Transportroboter oder Kampfdrohnen, sind auf externe Energieversorgung angewiesen. Solar Collectoren und Grid Energy Lines laden Roboter auf orthogonal angrenzenden Feldern automatisch auf. Ladeprogramme steuern nicht den Ladevorgang selbst, sondern entscheiden, wann ein Roboter aktiv ein Ladefeld aufsucht. Dadurch entsteht ein Unterschied zwischen autarken Allroundern und effizienteren, aber infrastrukturell abhängigen Spezialisten.

## Einheitenstufen / Unit Tiers

Einheiten werden analog zu Gebäuden in Stufen gegliedert. Die Stufen definieren, welche Rolle eine Einheit im Spiel hat und über welche Gebäude oder Forschung sie freigeschaltet wird.

Für den MVP bleibt nur der Starter Roboter und ein einfacher zusätzlicher Standardroboter aktiv. Die Einheitenstufen werden als spätere Progression vorgesehen.

### Übersicht

```text
Level 0:
- Starter Roboter

Level 1:
- Iron Miner
- Boden Scout
- Nahkampfdrohne
- Konstrukteur

Level 2:
- Miner für neue Ressourcen
- Transportroboter
- Fernkampfdrohne
```

### Level 0: Starter Roboter

Der Starter Roboter ist eine Sonderrolle.

Funktion:

```text
Initialisierungseinheit / Notfall-Allrounder
```

Regeln:

- existiert zu Spielbeginn
- kann Grundfunktionen ausführen
- kann Iron Ore abbauen
- kann Level-1-Basisgebäude errichten
- ist immer erreichbar
- verhindert frühe Sackgassen
- ist nicht so effizient wie spezialisierte Einheiten

Der Starter Roboter soll später nicht die beste Einheit bleiben, sondern als robuster Startanker dienen.

### Level 1: Erste Spezialisierung

Level-1-Einheiten entstehen nach der ersten Produktionsphase und übernehmen spezialisierte Grundaufgaben.

#### Iron Miner

Funktion:

```text
Spezialisierter Iron-Ore-Abbau
```

Regeln:

- baut Iron Ore schneller oder effizienter ab als der Starter Roboter
- kann eventuell mehr Iron Ore tragen als der Starter Roboter
- ist auf einfache Ressourcen spezialisiert
- kann keine oder nur stark eingeschränkte Bauaufgaben übernehmen

#### Boden Scout

Funktion:

```text
Erkundung auf Bodenterrain
```

Regeln:

- höhere Sichtweite als normale Roboter
- schneller als Arbeitsroboter
- kann eventuell Kommunikationsgrid verlassen
- kann Ressourcen und Terrain früher erkennen
- kann Geröll, Lava oder Quecksilber nicht betreten, weil er eine Bodeneinheit ist

Der Boden Scout passt zur Kommunikationsregel: Scouts dürfen außerhalb des Grids weiterarbeiten, aber ihr Programm ist dann gelocked.

#### Nahkampfdrohne

Funktion:

```text
frühe Verteidigung / Nahkampf
```

Regeln:

- schützt Basis und Arbeiter
- greift nur in kurzer Reichweite an
- einfache Kampfeinheit
- benötigt später Kampfprogramme oder Verteidigungslogik
- noch keine komplexe Taktik

#### Konstrukteur

Funktion:

```text
fortgeschrittener Bauroboter
```

Regeln:

- baut Gebäude effizienter als der Starter Roboter
- kann Gebäude oberhalb von Level 1 errichten
- wird Voraussetzung für Level-2-Infrastruktur
- kann Bau-Schemata und spätere Baupläne besser umsetzen
- ist wichtig für Expansion und größere Basen

Der Starter Roboter baut die Basis an. Der Konstrukteur übernimmt später komplexere Bauaufgaben.

### Level 2: Erweiterte Spezialisierung

Level-2-Einheiten werden durch Forschung und höhere Produktionsgebäude freigeschaltet.

#### Miner für neue Ressourcen

Funktion:

```text
Abbau oder Förderung neuer Ressourcen
```

Beispiele:

```text
Gas-Miner / Wartungseinheit für Gasförderanlagen
Silicium-Miner
Spezialbohrer
Gefahrenzonen-Miner
```

Regeln:

- können Ressourcen abbauen oder erschließen, die der Iron Miner nicht verarbeiten kann
- benötigen Forschung
- können spezialisierte Gebäude wie Gasförderanlage oder Siliciumförderung unterstützen
- können ggf. auf gefährlichem Terrain besser arbeiten

#### Transportroboter

Funktion:

```text
Materiallogistik
```

Regeln:

- transportiert Ressourcen zwischen Abbau, Lager, Fabriken und Baustellen
- hat großen Laderaum
- ist nicht primär für Abbau oder Kampf gedacht
- wird wichtig, sobald Ressourcen nicht mehr nur im Starter Roboter liegen
- unterstützt komplexere Produktionsketten wie Steel Plates

Der Transportroboter wird spätestens relevant, wenn es Lager, Stahlwerk, Gasförderung und mehrere Baustellen gibt.

#### Fernkampfdrohne

Funktion:

```text
fortgeschrittene Verteidigung / Angriff auf Distanz
```

Regeln:

- greift aus Entfernung an
- kann Basisbereiche schützen
- kann gefährlichere Gegner bekämpfen
- benötigt vermutlich Energie, Munition oder fortgeschrittene Komponenten
- kann später in Gruppenlogik eingebunden werden

Spätere Varianten:

```text
Boden-Fernkampfdrohne
Flug-Fernkampfdrohne
```

Die Flugvariante passt zur Drohnenfabrik und zum Terrain-System.

### Freischaltung

Einheiten werden an Gebäude und Forschung gekoppelt.

Beispiele:

```text
Roboterfabrik Level 1
→ Iron Miner
→ Boden Scout
→ Nahkampfdrohne
→ Konstrukteur
```

```text
Verbesserte Roboterfabrik / Spezialforschung
→ Miner für neue Ressourcen
→ Transportroboter
→ Fernkampfdrohne
```

```text
Drohnenfabrik
→ flugfähige Drohnen
```

### MVP-Einordnung

Im MVP aktiv:

- Starter Roboter
- erster zusätzlicher Iron Miner

Im MVP vorbereitet, aber nicht aktiv:

- Iron Miner
- Boden Scout
- Nahkampfdrohne
- Konstrukteur
- Miner für neue Ressourcen
- Transportroboter
- Fernkampfdrohne
- Einheitenfreischaltung durch Forschung
- spezialisierte Produktionsgebäude

Designregel:

> Einheiten werden wie Gebäude in Stufen gegliedert. Der Starter Roboter bildet Level 0 und dient als robuste Initialisierungseinheit. Level-1-Einheiten übernehmen erste Spezialisierungen wie Iron-Ore-Abbau, Bodenerkundung, Nahkampf und fortgeschrittenes Bauen. Level-2-Einheiten erweitern das Spiel um neue Ressourcenförderung, Materiallogistik und Fernkampf. Höhere Einheitenstufen werden durch Forschung und passende Produktionsgebäude freigeschaltet.

## Ressourcen und Rohstoffprogression

Das Spiel beginnt mit Iron Ore als einfacher Startressource. Später kommen weitere Ressourcen hinzu, die neue Gebäude, Forschung, Einheiten und Produktionsketten ermöglichen.

Für den MVP bleibt Iron Ore die einzige aktive Ressource. Das Konzept soll aber bereits auf ein mehrstufiges Ressourcensystem vorbereitet sein.

### Grundidee

Ressourcen können unterschiedliche Fördermethoden benötigen.

Beispiele:

```text
Iron Ore
→ direkt durch Roboter abbaubar

Gas
→ nur durch Gasraffinerie förderbar

Silicium
→ durch spezialisierte Förderung oder Verarbeitung nutzbar
```

Dadurch entsteht eine Progression:

```text
Iron Ore
→ Basisgebäude
→ Forschung
→ neue Fördertechnik
→ neue Ressourcen
→ höhere Gebäude-/Einheitenstufen
→ weitere Forschung
```

### Ressourcentypen v0.1

#### Iron Ore

Iron Ore ist die Startressource.

Regeln:

- im MVP aktiv
- durch Startroboter direkt abbaubar
- wird für Solarkollektor und Roboterfabrik verwendet
- Grundlage für frühe Infrastruktur

#### Gas

Gas ist eine spätere Spezialressource.

Regeln:

- liegt als Gasvorkommen auf bestimmten Feldern vor
- kann nicht direkt vom Roboter eingesammelt werden
- benötigt eine Gasraffinerie
- kann für Energie, Forschung, fortgeschrittene Produktion oder Spezialgebäude benötigt werden

Beispielgebäude:

```text
Gasraffinerie
→ muss auf oder neben einem Gasvorkommen gebaut werden
→ fördert Gas über Zeit
→ benötigt Energie
```

#### Silicium

Silicium ist eine spätere technische Ressource.

Regeln:

- benötigt für Elektronik, Sensorik, KI-Systeme und fortgeschrittene Roboter
- kann durch spezialisierte Förderung oder Verarbeitung gewonnen werden
- wichtig für Forschung, Rechenzentren und höhere Einheitenstufen

Beispielnutzung:

```text
KI-Forschungszentrum:
- Iron Ore
- Silicium
- Energie

Fortgeschrittene Roboterfabrik:
- Iron Ore
- Silicium
- Gas

Flugeinheit:
- Iron Ore
- Silicium
- Gas
```

### Ressourcen durch Forschung freischalten

Eine Ressource kann auf der Karte existieren, aber zunächst nicht verwertbar sein.

Beispiel Gas:

```text
Gasvorkommen entdeckt
→ Spieler sieht: "Gasvorkommen erkannt, Fördertechnik fehlt"
→ Forschung "Gasextraktion" erforderlich
→ Gasraffinerie wird freigeschaltet
→ Gas kann gefördert werden
```

Beispiel Silicium:

```text
Siliciumvorkommen entdeckt
→ Forschung "Mineralanalyse" erforderlich
→ spezialisierter Siliciumabbau wird freigeschaltet
```

Forschung erschließt damit nicht nur Upgrades, sondern auch neue Teile der Ökonomie.

### Produktionsstufen

#### Tier 1: Basis

```text
Iron Ore
```

Nutzung:

- Solarkollektor
- Roboterfabrik
- Standardroboter
- erste Infrastruktur

#### Tier 2: Industrie

```text
Gas
Silicium
```

Nutzung:

- KI-Forschungszentrum
- Kommunikationsmast
- Lagerdepot
- Reparaturstation
- spezialisierte Roboter
- bessere Energieversorgung

#### Tier 3: Fortgeschritten

Später mögliche Ressourcen:

```text
Seltene Metalle
Kristalle
Plasma
Datenkerne
Alien-Material
```

Nutzung:

- High-End-Forschung
- Kampfeinheiten
- Flugeinheiten
- Forschungssieg
- Endgame-Gebäude

### Ressourcen und Freischaltungen

Höhere Forschung, Gebäude und Einheiten können weitere Ressourcen benötigen. Gleichzeitig können genau diese Forschungsschritte, Gebäude oder Einheiten neue Ressourcen erst nutzbar machen.

Beispiel:

```text
Iron Ore
→ Roboterfabrik
→ KI-Forschungszentrum
→ Forschung "Gasextraktion"
→ Gasraffinerie
→ Gas
→ Flugeinheit / fortgeschrittene Energie / weitere Forschung
```

### MVP-Einordnung

Im MVP aktiv:

- Iron Ore
- Iron Ore direkt per Startroboter abbauen
- einfache Kosten für Solarkollektor und Roboterfabrik

Im Datenmodell vorbereitet:

- generische ResourceType-Struktur
- generische ResourceInventory-Struktur
- generische ResourceCost-Struktur
- ResourceDeposit mit Fördermethode
- spätere Ressourcen wie Gas und Silicium

Nicht im MVP aktiv:

- Gas
- Silicium
- Gasraffinerie
- Siliciumförderung
- mehrstufige Produktionsketten
- Forschungsvoraussetzungen für Ressourcen
- komplexe Lager- und Logistikketten

Designregel:

> Iron Ore ist die einfache Startressource. Spätere Rohstoffe wie Gas und Silicium benötigen passende Forschung, Gebäude oder spezialisierte Einheiten. Höhere Forschung, Gebäude und Einheiten verlangen mehrere Ressourcen und ermöglichen zugleich, neue Rohstoffe zu erkennen, zu fördern oder zu verarbeiten.

## GUI-Programmierung und Blocksystem v21

Die Programmierung der Roboter erfolgt über grafische Bausteine. Der Spieler schreibt keinen Code, sondern baut Programme aus farbigen, editierbaren Blöcken zusammen.

### Grundaufbau eines Programms

Ein Programm besteht aus beliebig vielen Zeilen. Jede Zeile beschreibt eine Bedingungs-Aktions-Regel.

Grundform:

```text
IF <Bedingung>
THEN <Aktion>
```

Ein Programm kann mehrere IF-Zeilen besitzen.

Beispiel:

```text
IF Batterie < 20 %
THEN lade

IF neben Iron Ore AND Cargo nicht voll
THEN baue Iron Ore ab

IF sichtbares Iron Ore vorhanden
THEN bewege dich zum nächsten erreichbaren Nachbarfeld
```

### Auswertung innerhalb eines Programms

Die Zeilen eines Programms werden von oben nach unten geprüft.

Regeln:

- Trifft eine IF-Zeile nicht zu, wird die nächste IF-Zeile geprüft.
- Trifft eine IF-Zeile zu, wird die zugehörige Aktion geprüft.
- Ist die Aktion ausführbar, wird sie ausgeführt.
- Ist die Aktion nicht ausführbar, wird das nächste Programm im Programmstack aufgerufen.
- Trifft keine IF-Zeile zu, wird das nächste Programm im Programmstack geprüft.

Beispiel:

```text
IF neben Iron Ore
THEN baue Iron Ore ab
```

Wenn kein Iron Ore in der Nähe ist:

```text
Bedingung nicht erfüllt
→ nächste IF-Zeile oder nächstes Programm prüfen
```

Wenn die Bedingung erfüllt ist, aber die Aktion nicht ausführbar ist:

```text
Aktion nicht ausführbar
→ nächstes Programm im Stack prüfen
```

Dadurch entsteht Spieltiefe: Der Spieler steuert Roboter durch sinnvolle Bedingungen, Aktionen und bewusst eingeplante ausführbare oder nicht ausführbare Programmpfade.

### Bausteintypen und Farben

Bausteine haben Typen und visuelle Farben.

Vorgeschlagene Kategorien:

```text
Conditions: Gelb
Aktionen: Rot
Operatoren: Blau
Sensoren: Grün
Values/Werte: Weiß oder Grau
Programmsteuerung: Violett
Container/Gruppen: Dunkelgrau
```

Beispiele:

```text
Condition:
Batterie >= 50 %

Aktion:
Iron Ore abbauen

Operator:
AND / OR / NOT / >= / <= / ==

Sensor:
Batteriestand

Value:
50 %

Programmsteuerung:
Stack reset
```

### Condition-Container

Eine Condition ist selbst ein Container aus mehreren Bausteinen.

Beispiel:

```text
[Batteriestand] [>=] [50 %]
```

Dabei sind die Teile einzeln editierbar:

- Sensorwert: `Batteriestand`
- Operator: `>=`
- Value: `50 %`

Weitere Beispiele:

```text
[Cargo: Iron Ore] [<] [100 %]
```

```text
[Sichtbares Iron Ore] [vorhanden]
```

```text
[Gegner in Reichweite] [nicht vorhanden]
```

### Verschachtelte Bedingungen

Bedingungen können nebeneinander mit logischen Operatoren verbunden oder gruppiert werden.

Beispiel:

```text
(Batterie >= 25 %)
AND
(Cargo nicht voll)
AND
(neben Iron Ore)
```

Gruppierte Bedingungen:

```text
(Batterie >= 50 % AND Cargo leer)
OR
(Gefahr niedrig AND Ladefeld erreichbar)
```

### Bausteinbibliothek

Die GUI enthält eine Bibliothek mit verfügbaren Bausteinen.

Der Spieler kann Bausteine per Drag-and-drop in ein Programm ziehen.

Bibliotheksbereiche:

```text
Sensoren
Operatoren
Werte
Conditions
Aktionen
Programmsteuerung
Templates
```

Sensoren können zum Beispiel sein:

```text
Batteriestand
Cargo-Füllstand
Cargo-Menge einer Ressource
HP
sichtbare Ressource
angrenzende Ressource
Gebäude vorhanden
Gegner vorhanden
Kommunikationsstatus
freie Netzleistung
```

Aktionen können zum Beispiel sein:

```text
laden
bewegen
erkunden
Iron Ore abbauen
Gebäude bauen
produzieren
angreifen
warten
Stack reset
```

### Kontextabhängige Operatoren

Die Bausteinbibliothek soll nur Operatoren anbieten, die zum gewählten Sensor passen.

Beispiele:

```text
Sensor: Batteriestand
erlaubte Operatoren:
<, <=, >, >=, ==, !=
```

```text
Sensor: sichtbares Iron Ore
erlaubte Operatoren:
vorhanden, nicht vorhanden
```

```text
Sensor: Kommunikationsstatus
erlaubte Operatoren:
ist, ist nicht
```

```text
Sensor: Cargo-Ressource
erlaubte Operatoren:
<, <=, >, >=, ==, !=
```

### Validierte Werteingabe

Werte können als Ziffern eingegeben werden, müssen aber abhängig vom Sensor validiert werden.

Beispiele:

```text
Batteriestand:
0 bis 100 %

Cargo-Füllstand:
0 bis 100 %

HP:
0 bis 100 % oder konkrete HP-Werte bis MaxHP

Ressourcenmenge:
0 bis Kapazität

Gebäudetyp:
nur gültige freigeschaltete Gebäudetypen

Ressourcentyp:
nur bekannte/freigeschaltete Ressourcen
```

Ungültig:

```text
Batteriestand > 101 %
```

Die UI soll solche Eingaben verhindern oder direkt als ungültig markieren.

### Programmsteuerungsbausteine

Neben Conditions, Operatoren und Aktionen gibt es Programmsteuerungsbausteine.

Beispiele:

```text
Stack reset
Programm beenden
nächstes Programm prüfen
warten
```

`Stack reset` bedeutet:

```text
aktuelle Programmausführung endet
→ Prüfung beginnt wieder oben im Programmstack
```

Dieser Baustein ist wichtig, damit Programme aktiv erzwingen können, dass höhere Prioritäten neu geprüft werden.

### Programmübersicht

Die oberste Programmübersicht zeigt den Programmstack einer Einheit oder Gruppe.

Funktionen:

- Programme per Drag-and-drop in Reihenfolge bewegen.
- Programm aktivieren/deaktivieren.
- deaktiviertes Programm mit Skip-Icon markieren.
- Programmnamen anzeigen.
- aktiven Status anzeigen.
- blockierte Programme mit Diagnosegrund anzeigen.
- Programme öffnen und editieren.
- neue Programme erstellen.
- Programme benennen.
- Templates hinzufügen und bearbeiten.

### Neue Programme

Der Spieler kann komplett neue Programme erstellen.

Regeln:

- neues Programm erhält einen Namen
- Spieler kann IF-Zeilen hinzufügen
- Spieler zieht Bausteine aus der Bibliothek hinein
- Programm kann aktiviert/deaktiviert werden
- Programm kann im Stack verschoben werden

### Templates im MVP

Für den MVP sind Templates notwendig.

MVP-Anforderungen:

- Templates sind vorhanden.
- Templates können zum Stack hinzugefügt werden.
- Templates können editiert werden.
- Parameter innerhalb der Templates können geändert werden.
- Programmübersicht ist vorhanden.
- Programme können aktiviert/deaktiviert werden.
- deaktivierte Programme zeigen ein Skip-Icon.
- Programme können im Stack umsortiert werden.
- Neue Programme können optional vorbereitet werden; wichtiger sind editierbare Templates.

### Designregel

> Die Roboterprogrammierung erfolgt über grafische, farbcodierte Bausteine. Programme bestehen aus IF-Zeilen mit editierbaren Condition-Containern und Aktionen. Bedingungen prüfen Sensorwerte mit passenden Operatoren und validierten Werten. Aktionen werden nur ausgeführt, wenn sie ausführbar sind; andernfalls wird der Stack weiter geprüft. Die Programmübersicht erlaubt Reihenfolge, Aktivierung, Deaktivierung, Diagnose und Template-Bearbeitung.

## Kommunikationsgrid und Grid-Abhängigkeit v20

Das Kommunikationsgrid bestimmt, welche Einheiten erreichbar, programmierbar und aktiv steuerbar sind.

### Bedeutung von communicationMode

`communicationMode` ist die technische Eigenschaft einer Einheit, die beschreibt, wie stark sie vom Kommunikationsgrid abhängig ist.

Vorgesehene Modi:

```text
gridRequired:
Einheit muss im Kommunikationsgrid sein.
Sie bewegt sich nicht aus dem Grid heraus.

autonomous:
Einheit kann auch außerhalb des Grids arbeiten.
Sie kann dort aber ggf. nicht umprogrammiert werden.

scoutLocked:
Scout-/Spezialmodus.
Einheit darf außerhalb des Grids arbeiten,
nutzt dort aber den zuletzt aktiven Stack und ist gelocked.
```

Für die meisten normalen Arbeitsroboter gilt:

```text
communicationMode = gridRequired
```

Für Scouts oder Spezialisten:

```text
communicationMode = scoutLocked oder autonomous
```

### Reichweite von Gebäuden

Normale Gebäude haben eine kleinere Kommunikationsreichweite.

```text
Normales Gebäude:
Reichweite 3 Felder
```

Sendetürme haben eine größere Reichweite.

```text
Sendeturm:
Reichweite 5 Felder
```

Die Reichweite wird ohne Diagonalen berechnet.

```text
Distanz = |x1 - x2| + |y1 - y2|
```

Ein Feld liegt innerhalb der Kommunikationsreichweite, wenn seine Manhattan-Distanz zur Quelle kleiner oder gleich der Reichweite ist.

### Keine diagonale Ausbreitung

Kommunikationsreichweite zählt nur orthogonal.

Beispiel mit Reichweite 2:

```text
..X..
.XXX.
XXSXX
.XXX.
..X..
```

`S` ist die Quelle. Diagonal entfernte Felder zählen nur über orthogonale Schritte.

### Verhalten gridpflichtiger Einheiten

Einheiten mit `gridRequired` sind strikt an das Kommunikationsgrid gebunden.

Regeln:

- Sie planen keine Bewegung aus dem Grid heraus.
- Sie wählen nur Ziele innerhalb des Kommunikationsgrids.
- Sie bewegen sich nur über Felder innerhalb des Kommunikationsgrids.
- Wenn sie trotzdem außerhalb des Grids stehen, gehen sie in Stasis/offline.
- In Stasis/offline führen sie keine normalen Programme aus.
- Sie reagieren nicht auf Gruppenprogrammänderungen, solange sie offline sind.

Eine gridpflichtige Einheit soll also normalerweise nicht aktiv aus dem Grid herauslaufen. Der Offline-/Stasis-Fall ist eine Sicherheitsregel für Sonderfälle, z. B. wenn das Grid durch Gebäudedeaktivierung, Zerstörung oder Energieausfall schrumpft.

### Disconnected UI-Anzeige

Für Einheiten außerhalb des Kommunikationsgrids soll die UI einen klaren Status anzeigen.

Vorschlag:

```text
Status:
disconnected
```

UI-Symbol:

```text
disconnected icon
```

Bedeutung:

- Einheit ist nicht im Kommunikationsgrid.
- Einheit ist nicht normal steuerbar.
- Einheit reagiert nicht auf neue Gruppenbefehle.
- Einheit kann je nach Typ in Stasis/offline sein oder mit gelocktem Stack weiterarbeiten.

### Gruppen und einzelne Offline-Einheiten

Eine Gruppe kann mehrere Einheiten enthalten. Einzelne Einheiten einer Gruppe können offline/stasis/disconnected sein.

Regeln:

- Gruppenprogramm kann weiterhin angepasst werden.
- Online-Einheiten der Gruppe übernehmen die Änderungen.
- Offline-/Stasis-Einheiten reagieren nicht auf Gruppenänderungen.
- Wenn eine Einheit wieder ins Grid kommt, kann sie wieder synchronisiert werden.
- Bis dahin bleibt sie vom Gruppenverhalten entkoppelt.

### Designregel

> Normale Roboter sind gridpflichtig und bewegen sich nur innerhalb des Kommunikationsgrids. Sendetürme erweitern das Grid mit größerer Reichweite als normale Gebäude. Reichweite wird ohne Diagonalen über Manhattan-Distanz berechnet. Wenn eine gridpflichtige Einheit außerhalb des Grids steht, geht sie in Stasis/offline und reagiert nicht auf Gruppenänderungen. Die UI zeigt diesen Zustand mit einem disconnected icon.

## Forschungsbaum und Freischaltungen v20

Forschung wird als späteres Fortschrittssystem konkret vorbereitet. Im initialen MVP bleibt Forschung inaktiv, aber Gebäude, Einheiten, Ressourcen und Programmoptionen sollen später über Forschungsprojekte freigeschaltet werden.

### Grundstruktur

Ein Forschungsprojekt besitzt:

```text
ID
Name
Voraussetzungen
Kosten
Dauer in Ticks
benötigte Forschungskapazität
Freischaltungen
```

Forschung wird über das KI-Forschungszentrum ermöglicht.

```text
KI-Forschungszentrum
→ schaltet Forschungsmenü frei
→ erzeugt Forschungskapazität
→ kann einem Forschungsprojekt zugewiesen werden
```

### Forschungszweige

Vorgesehene Forschungszweige:

```text
1. Infrastruktur
2. Energie
3. Industrie und Verarbeitung
4. Ressourcenextraktion
5. Einheiten
6. Kommunikation
7. Programm-Gestaltungsoptionen
8. Kampf und Verteidigung
```

### Beispiel-Forschungen

#### Metallverarbeitung I

```text
ID:
research.metallurgy1

Voraussetzung:
KI-Forschungszentrum

Kosten:
20 Iron Ore

Dauer:
300 Ticks

Freischaltungen:
- Stahlwerk
- Steel Plates als verarbeitete Ressource
```

#### Gasextraktion

```text
ID:
research.gasExtraction1

Voraussetzung:
KI-Forschungszentrum

Kosten:
20 Iron Ore
5 Steel Plates

Dauer:
360 Ticks

Freischaltungen:
- Gasförderanlage
- Gas als verwertbare Ressource
```

#### Kommunikationsinfrastruktur I

```text
ID:
research.communicationInfrastructure1

Voraussetzung:
KI-Forschungszentrum

Kosten:
15 Iron Ore
5 Steel Plates

Dauer:
300 Ticks

Freischaltungen:
- Sendeturm
- erweitertes Kommunikationsgrid
```

#### Energienetz I

```text
ID:
research.energyGrid1

Voraussetzung:
KI-Forschungszentrum

Kosten:
15 Iron Ore
5 Steel Plates

Dauer:
300 Ticks

Freischaltungen:
- Grid Energy Line
- Energieversorgung über direkte Nachbarschaft hinaus
```

#### Industrielle Fertigung I

```text
ID:
research.industrialManufacturing1

Voraussetzung:
Metallverarbeitung I

Kosten:
20 Iron Ore
10 Steel Plates

Dauer:
420 Ticks

Freischaltungen:
- Verbesserte Roboterfabrik
- schnellere Produktion
```

#### Flugmechanik I

```text
ID:
research.flightMechanics1

Voraussetzung:
Industrielle Fertigung I
Gasextraktion

Kosten:
10 Steel Plates
10 Gas
5 Silicium

Dauer:
480 Ticks

Freischaltungen:
- Drohnenfabrik
- flugfähige Drohnenvarianten
```

#### Programm-Gestaltungsoptionen I: Ausführungslimits

```text
ID:
research.programDesign.executionLimits

Voraussetzung:
KI-Forschungszentrum

Kosten:
10 Iron Ore

Dauer:
180 Ticks

Freischaltungen:
- Programme können maximale Ausführungszahlen erhalten
```

#### Programm-Gestaltungsoptionen II: Bau-Schemata

```text
ID:
research.programDesign.buildSchemas

Voraussetzung:
Programm-Gestaltungsoptionen I

Kosten:
10 Iron Ore
5 Steel Plates

Dauer:
300 Ticks

Freischaltungen:
- Bau-Schemata wie Linie, L-Form und Block
```

#### Programm-Gestaltungsoptionen III: Komplexe Baupläne

```text
ID:
research.programDesign.complexBuildPlans

Voraussetzung:
Programm-Gestaltungsoptionen II

Kosten:
10 Steel Plates
5 Silicium

Dauer:
420 Ticks

Freischaltungen:
- Gebäudelisten für Schema-Slots
- komplexe Baupläne
```

### Designregel

> Forschung schaltet nicht nur bessere Werte frei, sondern neue Spielsysteme: neue Ressourcenverwertung, neue Gebäude, neue Einheiten, neue Energie- und Kommunikationsinfrastruktur sowie zusätzliche Programm-Gestaltungsoptionen.

## Map-Generierung, erster Miner und spätere Logistik v19

### Deterministische Map-Generierung

Die Map-Generierung soll reproduzierbar sein.

Regeln:

- Jede Partie besitzt einen `randomSeed`.
- Der Map-Generator arbeitet deterministisch auf Basis dieses Seeds.
- Bei gleicher Seed-Eingabe entsteht dieselbe Karte.
- Gleichstandsentscheidungen, z. B. bei Zielauswahl, nutzen ebenfalls seeded random.

### Fairness-Regeln für Iron Ore

Iron Ore soll fair erreichbar sein, aber nicht sofort sichtbar sein.

MVP-Regeln:

- Karte: 10 x 10 Felder.
- Iron-Ore-Felder: 20.
- Iron Ore tritt in Clustern auf.
- Mindestens ein Iron-Ore-Feld muss in 4–6 Bewegungsschritten vom Startfeld erreichbar sein.
- Der Startroboter darf an seiner Startposition noch kein Iron Ore sehen können.
- Die initial sichtbaren Felder des Startroboters dürfen daher kein Iron Ore enthalten.
- Iron Ore kann erst durch Bewegung/Erkundung entdeckt werden.

Da der Startroboter im MVP Sichtweite 2 besitzt, muss der Generator sicherstellen:

```text
Kein Iron Ore im initial sichtbaren Bereich des Startroboters.
Mindestens ein Iron Ore außerhalb der initialen Sicht, aber erreichbar in 4–6 Schritten.
```

### Regenerierung und Fallback

Wenn eine generierte Karte die Fairness-Regeln nicht erfüllt:

```text
neuen Seed/Versuch erzeugen
→ Regeln erneut prüfen
```

Vorschlag:

```text
max. 100 Generierungsversuche
```

Wenn danach keine gültige Karte entsteht:

```text
feste Fallback-Karte verwenden
```

### Erster produzierter Roboter

Der erste zusätzlich produzierte Roboter kann ein Miner sein.

MVP-Regel:

```text
Erster produzierter Roboter:
- Typ: Iron Miner
- Tier: Level 1
- Rolle: spezialisierter Iron-Ore-Abbau
```

Das MVP-Ziel gilt weiterhin als erfüllt, sobald dieser Roboter fertig produziert wurde.

Da spezialisierte Miner externe Energie benötigen können, gilt:

```text
Der erste Miner kann im MVP zunächst als Ziel-/Erfolgseinheit produziert werden.
Seine vollständige Arbeitslogik kann später ausgebaut werden.
```

Empfohlene Startwerte:

```text
HP: 100/100
Batterie: 50/100
ChargingMode: externalOnly
Cargo: leer
Programmstack: leer oder später Miner-Template
```

### Spätere Lager- und Logistikstruktur

Mit zusätzlichen Ressourcen, Steel Plates, Produktionsketten und Transportrobotern braucht das Spiel später ein Logistikmodell.

Nicht im MVP aktiv, aber konzeptionell vorgesehen:

- Gebäude können eigene Inventare besitzen.
- Lagerdepots dienen als zentrale lokale Speicher.
- Produktionsgebäude besitzen Input- und Output-Inventare.
- Baustellen besitzen Materialanforderungen.
- Transportroboter erfüllen Materialaufträge zwischen Quelle und Ziel.

### Gebäudeinventare

Spätere Gebäude können Ressourcen speichern.

Beispiele:

```text
Stahlwerk:
Input:
- Iron Ore

Output:
- Steel Plates
```

```text
Gasförderanlage:
Output:
- Gas
```

```text
Lagerdepot:
Input/Output:
- mehrere Ressourcenarten
```

### Materialaufträge

Transportroboter sollen später nicht direkt vom Spieler gesteuert werden. Stattdessen entstehen Materialaufträge.

Beispiele:

```text
Baustelle benötigt 5 Steel Plates
→ Transportauftrag wird erzeugt
→ Transportroboter sucht Quelle
→ Transportroboter liefert Material zur Baustelle
```

```text
Stahlwerk produziert Steel Plates
→ Output-Inventar füllt sich
→ Lagerdepot fordert Abholung an
```

### Designregel

> Die MVP-Karte ist seed-basiert, fair und zwingt zur Erkundung: Der Startroboter sieht an seiner Startposition noch kein Iron Ore, aber ein Vorkommen ist nach kurzer Bewegung erreichbar. Der erste produzierte Roboter kann ein Iron Miner sein. Spätere Produktionsketten nutzen lokale Inventare, Lagerdepots und Transportaufträge statt globaler Sofortressourcen.

## Zielauswahl, Pfadfindung und Exploration v18

Dieser Abschnitt konkretisiert, wie Roboter Ziele suchen, Wege wählen und mit Fog of War oder unbekannten Feldern umgehen.

### Miner-Beispiel

Ein Miner kann zwei zentrale Programme besitzen.

Oberstes Programm:

```text
IF neben Iron-Ore-Feld
AND Ressourcenspeicher nicht voll
AND genug Energie für mindestens einen Abbau
THEN baue Iron Ore ab
```

Wenn das angrenzende Iron-Ore-Feld erschöpft ist:

```text
laufendes Mining-Programm bricht ab
→ Stack-Prüfung beginnt wieder oben
```

Beim nächsten Check ist das oberste Programm nicht mehr ausführbar, weil die Bedingung „neben Iron-Ore-Feld“ nicht mehr erfüllt ist.

Zweites Programm:

```text
IF genug Energie vorhanden
THEN suche im Sichtbereich nach weiteren Iron-Ore-Feldern
AND bewege dich zum nächst erreichbaren Nachbarfeld dieses Vorkommens
```

Wenn dieses Nachbarfeld erreicht wurde:

```text
Bewegungsprogramm endet
→ Stack-Prüfung beginnt wieder oben
→ Mining-Programm kann wieder ausführbar sein
```

Dadurch entsteht ein natürlicher Arbeitszyklus:

```text
abbauen
→ Feld erschöpft
→ Ziel suchen
→ hinbewegen
→ wieder abbauen
```

### Manhattan-Distanz

Manhattan-Distanz ist die Entfernung auf einem Grid, wenn nur orthogonale Schritte zählen.

Formel:

```text
Distanz = |x1 - x2| + |y1 - y2|
```

Beispiel:

```text
Start: (2, 3)
Ziel:  (5, 1)

|2 - 5| + |3 - 1|
= 3 + 2
= 5 Schritte
```

Sie entspricht der Anzahl horizontaler und vertikaler Schritte ohne diagonale Bewegung.

### Gleichstände

Wenn mehrere Ziele gleich gut erreichbar sind, darf der Roboter zufällig entscheiden.

Regel:

```text
Gleichstand bei Zielauswahl
→ zufällige Auswahl unter den gleichwertigen Kandidaten
```

Für reproduzierbare Tests sollte der Zufall technisch über den `randomSeed` des GameState laufen.

### Sichtbereich und Zielsuche

Programme können Ziele im Sichtbereich suchen.

Beispiele:

- Miner sucht sichtbare Iron-Ore-Felder.
- Scout sucht unbekannte oder noch nicht sichtbare Felder.
- Ladeprogramm sucht bekannte Ladefelder.
- Bauprogramm sucht bekannte bebaubare Nachbarfelder.

Für normale Arbeitsprogramme gilt:

```text
Ziel muss bekannt oder aktuell sichtbar sein.
```

### Fog und unbekannte Felder

Roboter, die sich außerhalb des Kommunikationsbereichs bewegen dürfen, können durch Fog laufen und unbekannte Felder betreten.

Präzisierung:

```text
Ein Roboter deckt durch seine Sichtweite Felder vor dem Betreten auf.
```

Das bedeutet:

- Der Roboter bewegt sich nicht blind in ein dauerhaft unbekanntes Feld.
- Beim Annähern werden Felder im Sichtbereich sichtbar.
- Danach kann der Roboter das neu sichtbare Feld als Bewegungsziel verwenden.

Diese Regel gilt nur für Robotertypen, die außerhalb des Kommunikationsbereichs autonom handeln dürfen, z. B. Scouts oder entsprechend freigeschaltete Spezialisten.

Normale Standardroboter bleiben an den Kommunikationsbereich gebunden.

### Ladefelder

Ladefelder gelten als bekannt, wenn sie durch den Kommunikationsbereich um Gebäude abgedeckt sind.

Regel:

```text
Ladefelder im Kommunikationsbereich von Gebäuden
→ gelten als bekannt
→ können direkt annavigiert werden
```

Das gilt insbesondere für:

- Solar Collectoren
- spätere Grid Energy Lines
- spätere Energie-Infrastruktur im Kommunikationsnetz

### Kein Pfad möglich

Wenn kein Pfad zu einem Ziel möglich ist, ist das Programm nicht ausführbar oder wird abgebrochen.

Beispiele:

- alle Wege sind durch Roboter blockiert
- Gebäude oder Baustellen blockieren den Weg
- Terrain ist für den Robotertyp nicht passierbar
- Ziel liegt außerhalb erlaubter Kommunikations-/Autonomieregeln

Regel:

```text
kein Pfad möglich
→ laufendes Programm bricht ab oder gilt nicht als ausführbar
→ Diagnosegrund wird geschrieben
→ Stack-Prüfung beginnt wieder von oben
```

### Designregel

> Roboter suchen Ziele anhand bekannter, sichtbarer oder durch Kommunikationsinfrastruktur bekannter Informationen. Miner wechseln natürlich zwischen Abbau und Zielsuche. Gleichstände dürfen zufällig entschieden werden. Autonome Roboter wie Scouts können durch Fog und in unbekannte Gebiete vordringen, decken diese aber durch Sichtweite vor dem Betreten auf. Wenn kein Pfad möglich ist, bricht das Programm ab und der Stack wird erneut von oben geprüft.

## Programmstack und Ausführungsregeln v17

Programme werden als priorisierter Stack verarbeitet. Die Reihenfolge im Stack ist spielentscheidend.

### Top-down-Prüfung

Der Roboter prüft Programme immer von oben nach unten.

```text
1. Prüfe Programm 1
2. Wenn nicht ausführbar: prüfe Programm 2
3. Wenn nicht ausführbar: prüfe Programm 3
4. Erstes ausführbares Programm wird gestartet
```

Ein Programm ist ausführbar, wenn alle benötigten Bedingungen erfüllt sind. Bedingungen können aus Sensoren, Ressourcen oder situativen Gegebenheiten entstehen.

Beispiele:

```text
Batterie < 20 %
Baumaterial vorhanden
Iron Ore bekannt
Frachtspeicher nicht voll
Gegner in Reichweite
kein Gegner vorhanden
Gebäude noch nicht vorhanden
```

Wenn eine Prüfung negativ ist, wird das nächste Programm geprüft.

Beispiel:

```text
Programm: Angriff
Bedingung: Gegner vorhanden

Wenn kein Gegner da ist:
→ Angriff nicht ausführbar
→ nächstes Programm wird geprüft
```

### Laufendes Programm

Sobald ein Programm ausführbar ist, wird es durchgeführt.

Ein laufendes Programm bleibt aktiv, bis eine der folgenden Bedingungen eintritt:

- Stop-Bedingung des Programms ist erfüllt
- Spieler bricht das Programm ab
- Spieler deaktiviert das Programm
- Programmziel wird ungültig

Während ein Programm läuft, wird nicht permanent automatisch zu einem anderen Programm gewechselt.

### Stop-Bedingung

Programme können eigene Stop-Bedingungen besitzen.

Beispiele:

```text
Lade bis Batterie >= 80 %
Mine bis Frachtspeicher voll
Erkunde bis Iron Ore gefunden
Baue bis Gebäude fertig
Produziere bis Roboter fertig
```

Wenn die Stop-Bedingung erfüllt ist:

```text
laufendes Programm endet
→ Programmstack wird wieder von oben nach unten geprüft
```

### Abbruch durch Spieler

Der Spieler kann das laufende Programm abbrechen.

Regeln:

- Das Programm selbst bleibt im Stack erhalten.
- Das Programm bleibt aktivierbar.
- Die Programmparameter werden nicht geändert.
- Nach dem Abbruch wird der Programmstack wieder von oben nach unten geprüft.
- Wenn das abgebrochene Programm weiterhin ausführbar ist und hoch genug im Stack steht, kann es erneut ausgewählt werden.

Abbruch bedeutet nicht Deaktivierung.

### Deaktivierung durch Spieler

Der Spieler kann ein Programm deaktivieren.

Regeln:

- Ein deaktiviertes Programm bleibt im Stack sichtbar.
- Es wird bei der nächsten Top-down-Prüfung übersprungen.
- Es bleibt übersprungen, bis der Spieler es wieder aktiviert.
- Wird ein laufendes Programm deaktiviert, endet die aktuelle Ausführung und die Stack-Prüfung beginnt erneut von oben.
- Das deaktivierte Programm wird dabei nicht geprüft.

### Erfolgreiche Ausführung

Bei erfolgreicher Ausführung wird das Programm nicht automatisch verändert.

Regeln:

- Reihenfolge bleibt gleich.
- Parameter bleiben gleich.
- Aktivierungszustand bleibt gleich.
- Ausführungslimits werden nur erhöht, wenn eine erfolgreiche Ausführung wirklich abgeschlossen wurde.

Beispiel:

```text
Bauprogramm mit max. 1 Ausführung
→ zählt erst als abgeschlossen, wenn das Gebäude fertig gebaut wurde
```

### Ungültiges Programmziel

Wenn das Ziel eines laufenden Programms nicht mehr gültig ist, wird das laufende Programm abgebrochen.

Beispiele:

```text
Gegner wurde zerstört oder ist nicht mehr erreichbar
Ressourcenfeld ist erschöpft
Baufeld wurde blockiert
Gebäudeziel existiert nicht mehr
```

Regel:

```text
Programmziel ungültig
→ laufendes Programm bricht ab
→ Diagnosegrund wird geschrieben
→ Programmstack wird wieder von oben nach unten geprüft
```

### Bauprogramme

Ein Bauprogramm gilt erst als abgeschlossen, wenn das Gebäude fertig gebaut ist.

Nicht abgeschlossen:

- Baufeld gefunden
- Bau begonnen
- Baustelle reserviert
- Teilfortschritt erreicht

Abgeschlossen:

```text
Gebäude fertiggestellt
→ Bauprogramm zählt als erfolgreiche Ausführung
```

Bei Bauprogrammen mit Ausführungslimit bedeutet das:

```text
max. 1 Ausführung
→ erst verbraucht, wenn das Gebäude fertig ist
```

### Designregel

> Der Programmstack wird immer von oben nach unten auf ausführbare Programme geprüft. Das erste ausführbare Programm läuft, bis seine Stop-Bedingung erfüllt ist, der Spieler es abbricht/deaktiviert oder sein Ziel ungültig wird. Danach beginnt die Prüfung wieder oben im Stack. Abbruch verändert das Programm nicht; Deaktivierung führt dazu, dass es bei Prüfungen übersprungen wird. Bauprogramme zählen erst als abgeschlossen, wenn das Gebäude fertig ist.

## Bauprogramme, Ausführungslimits und Bau-Schemata

Bauaufträge sind Programme. Sie sollen nicht nur ein einzelnes Gebäude bauen können, sondern später auch kontrollieren, wie oft ein Bauauftrag ausgeführt wird und in welcher räumlichen Struktur Gebäude errichtet werden.

### 1. Anzahl der Programm-Ausführungen

Jedes Bauprogramm kann ein Ausführungslimit besitzen.

Beispiele:

```text
Baue 1 Solarkollektor
→ max. 1 Ausführung
```

```text
Baue 3 Kommunikationsmasten
→ max. 3 Ausführungen
```

```text
Baue Solarkollektoren, solange Iron Ore > 20
→ unbegrenzt, solange Bedingungen erfüllt sind
```

Grundregel:

- Programme können unbegrenzt laufen
- Programme können genau einmal laufen
- Programme können eine feste maximale Anzahl an Ausführungen besitzen
- abgeschlossene Ausführungen werden gezählt
- wenn das Limit erreicht ist, gilt das Programm als blockiert oder abgeschlossen

Für den MVP ist diese Funktion besonders wichtig, damit Gebäude wie Solarkollektor und Roboterfabrik nur einmal gebaut werden, wenn das Template dies vorsieht.

### 2. Bau-Schemata

Später kann ein Bauprogramm ein räumliches Schema erhalten.

Ein Schema beschreibt keine exakten Weltkoordinaten, sondern eine relative Form, die der Roboter passend auf der Karte platzieren soll.

Beispiele:

```text
L-Form
```

```text
3x3-Block
```

```text
Linie aus 4 Feldern
```

```text
Ring um ein Zentralgebäude
```

Ein Schema besteht aus relativen Tile-Positionen.

Beispiel 3x3-Block:

```text
XXX
XXX
XXX
```

Beispiel L-Form:

```text
X..
X..
XXX
```

Der Spieler gibt damit eine Bauabsicht vor. Der Roboter sucht anschließend einen geeigneten Ort, an dem dieses Schema möglichst gut erfüllt werden kann.

### 3. Gebäudelisten für Schemata

Ein Bauprogramm kann später zusätzlich eine Liste von Gebäuden erhalten, die in ein Schema eingesetzt werden.

Beispiel:

```text
Schema: L-Form

Gebäudeliste:
1. Solarkollektor
2. Solarkollektor
3. Energieknoten
4. Roboterfabrik
5. Lagerdepot
```

Oder:

```text
Schema: 3x3-Block

Gebäudeliste:
- 4 Solarkollektoren
- 1 Energieknoten
- 1 Roboterfabrik
- 1 Reparaturstation
- 2 freie Reservefelder
```

Damit können komplexere Bauabsichten formuliert werden, ohne dass der Spieler einzelne Koordinaten direkt steuert.

### Platzierungslogik

Auch bei Bau-Schemata bleibt die zentrale Designregel erhalten:

> Der Spieler bestimmt Absicht, Priorität, Gebäudetypen und räumliches Schema. Der Roboter bestimmt konkrete Position, Reihenfolge und Ausführung.

Der Roboter prüft:

- passt das Schema auf bekannte/bebaubare Felder?
- sind alle benötigten Ressourcen vorhanden oder beschaffbar?
- ist der Bereich erreichbar?
- bleiben kritische Wege frei?
- sind Energie- oder Nachbarschaftsanforderungen erfüllt?
- ist das Schema innerhalb des Kommunikationsgrids, falls nötig?

### Forschungszweig: Programm-Gestaltungsoptionen

Bau-Schemata und Gebäudelisten sollen nicht zwingend von Anfang an verfügbar sein. Sie können Teil eines Forschungszweigs sein:

```text
Programm-Gestaltungsoptionen
```

Mögliche Forschungsschritte:

```text
Ausführungslimits
→ Programme können maximale Ausführungszahlen erhalten
```

```text
Bau-Schemata
→ Programme können einfache Formen wie Linie, L-Form oder Block verwenden
```

```text
Komplexe Baupläne
→ Programme können Gebäudelisten mit Schemata kombinieren
```

```text
Bauplatzbewertung
→ Roboter bewerten mehrere mögliche Schema-Platzierungen und wählen die beste
```

```text
Reservierungslogik
→ Felder können für spätere Gebäudeteile eines Schemas reserviert werden
```

Für den MVP gilt:

- Ausführungslimits werden als Basisfunktion vorgesehen
- einfache Bauprogramme können auf `maxExecutions: 1` gesetzt werden
- Bau-Schemata sind nicht aktiv
- Gebäudelisten für Schemata sind nicht aktiv
- Forschungszweig Programm-Gestaltungsoptionen ist nur konzeptionell vorgesehen

### Beispiel Bauprogramm

```text
Programm: Solarkollektor bauen

Bedingungen:
- Solarkollektor nicht vorhanden
- Frachtspeicher >= 5 Iron Ore
- Batterie > 20 %

Ausführung:
- baue 1 Solarkollektor

Ausführungslimit:
- max. 1 erfolgreiche Ausführung
```

Späteres Beispiel:

```text
Programm: Energiecluster bauen

Schema:
- 3x3-Block

Gebäudeliste:
- 4 Solarkollektoren
- 1 Energieknoten
- 1 Roboterfabrik

Ausführungslimit:
- max. 1 Cluster
```

## Forschung und Technologie

Forschung ist ein späteres Fortschrittssystem. Sie wird nicht im ersten MVP aktiv umgesetzt, soll aber als zentrale Progressionsschicht im Konzept vorgesehen werden.

### Freischaltung durch KI-Forschungszentrum

Forschung wird durch ein spezielles Gebäude freigeschaltet:

```text
KI-Forschungszentrum
```

Erst wenn mindestens ein KI-Forschungszentrum gebaut wurde, kann der Spieler Forschungsprojekte starten.

Das KI-Forschungszentrum:

- schaltet das Forschungsmenü frei
- erzeugt Forschungskapazität
- benötigt später Energieversorgung
- kann Forschungsprojekten zugewiesen werden
- ermöglicht Verbesserungen, neue Gebäude, neue Einheiten und neue Programm-/Automatisierungsfunktionen

### Forschungskosten

Forschung kostet grundsätzlich:

```text
Ressourcen
+ Zeit / Ticks
+ optional Energie oder Forschungskapazität
```

Beispiel:

```text
Forschung: Erweiterter Frachtraum

Kosten:
- 20 Iron Ore
- 300 Ticks Forschungszeit

Effekt:
- Startroboter und Standardroboter erhalten +5 Laderaum
- neu produzierte Roboter starten direkt mit verbessertem Laderaum
```

### Forschungskapazität durch Rechenzentren

Jedes KI-Forschungszentrum stellt Forschungskapazität bereit.

Beispielwert:

```text
1 KI-Forschungszentrum = 100 Forschungskapazität
```

Jedes Rechenzentrum kann genau einem aktiven Forschungsprojekt zugewiesen werden.

Regeln:

- ein Rechenzentrum kann immer nur an einem Forschungsprojekt gleichzeitig arbeiten
- mehrere Rechenzentren können demselben Forschungsprojekt zugewiesen werden
- mehrere Rechenzentren an einem Projekt beschleunigen dessen Abschluss
- werden Rechenzentren auf mehrere Projekte verteilt, können mehrere Forschungen parallel laufen

### Beschleunigung eines Forschungsprojekts

Beispiel:

```text
Forschung: Erweiterter Frachtraum
Basisdauer: 300 Ticks
Benötigte Forschungskapazität: 100
```

Lineare Grundregel für den ersten Entwurf:

```text
1 Rechenzentrum: 300 Ticks
2 Rechenzentren: 150 Ticks
3 Rechenzentren: 100 Ticks
```

Später können Diminishing Returns ergänzt werden, falls lineare Beschleunigung zu stark ist.

Beispiel für spätere Abschwächung:

```text
1. Rechenzentrum: 100 % Effizienz
2. Rechenzentrum: +75 %
3. Rechenzentrum: +50 %
4. Rechenzentrum: +25 %
```

Für die erste Konzeption reicht lineare Beschleunigung.

### Parallele Forschung

Mehrere KI-Rechenzentren ermöglichen parallele Forschung, wenn sie auf verschiedene Projekte verteilt werden.

Beispiel mit drei Rechenzentren:

```text
Option A:
Projekt A: 3 Rechenzentren
Projekt B: 0
Projekt C: 0

→ Projekt A läuft schnell
```

```text
Option B:
Projekt A: 1 Rechenzentrum
Projekt B: 1 Rechenzentrum
Projekt C: 1 Rechenzentrum

→ drei Projekte laufen gleichzeitig, aber jeweils langsamer
```

```text
Option C:
Projekt A: 2 Rechenzentren
Projekt B: 1 Rechenzentrum

→ ein Hauptprojekt wird beschleunigt, ein Nebenprojekt läuft parallel
```

### Forschungsarten

Forschung kann verschiedene Arten von Fortschritt erzeugen.

#### Einheitenverbesserungen

Beispiele:

```text
Verstärkte Chassis
→ +25 maximale HP für Roboter

Erweiterter Frachtraum
→ +5 Laderaum für Transport-/Arbeitsroboter

Effizientere Bohrköpfe
→ Ressourcenabbau schneller

Verbesserte Akkuzellen
→ höhere Batteriekapazität

Optimierte Servomotoren
→ Bewegung kostet weniger Energie oder dauert weniger Ticks

Waffenmodul I
→ mehr Schaden im Kampf

Reparaturmodul
→ bestimmte Einheiten können Reparaturen durchführen
```

#### Neue Gebäude

Beispiele:

```text
Kommunikationsmast
→ Kommunikationsgrid erweitern

Lagerdepot
→ Ressourcen außerhalb von Robotern speichern

Energieknoten
→ Energieverteilung verbessern

Reparaturstation
→ beschädigte Einheiten/Gebäude automatisch reparieren

Verteidigungsturm
→ Basisverteidigung

Fortgeschrittene Roboterfabrik
→ spezialisierte Einheiten produzieren
```

#### Neue Einheiten

Beispiele:

```text
Scout
→ kann Kommunikationsgrid verlassen

Reparaturdrohne
→ repariert Einheiten und Gebäude

Transportroboter
→ großer Laderaum

Bergbauroboter
→ schnellerer Abbau

Kampfroboter
→ spezialisiert auf Angriff/Verteidigung

Flugeinheit
→ kann Geröll und Flüsse überqueren

Bauroboter
→ schnelleres oder günstigeres Bauen
```

#### Neue Programm- und Automatisierungsfunktionen

Forschung soll nicht nur Zahlenwerte verbessern, sondern auch neue Logik- und Automatisierungsmöglichkeiten freischalten.

Beispiele:

```text
Prioritätslogik II
→ Programme können zusätzliche Bedingungen nutzen

Erweiterte Sensorik
→ Roboter erkennen Ressourcen aus größerer Entfernung

Diagnosemodul
→ bessere Blockierungsgründe im Programmstack

Gruppenkoordination
→ Gruppenstacks werden freigeschaltet

Autonome Reparaturroutine
→ neue Reparatur-Templates verfügbar

Gefahrenanalyse
→ Roboter vermeiden Lava-/Quecksilber-Nachbarfelder
```

### Forschungssieg

Forschung kann später eine eigene Siegbedingung bilden.

Beispiele für finale Forschungsziele:

```text
Planetare Autonomie
```

```text
Rückkehrsignal senden
```

```text
KI-Netzwerk vollständig synchronisiert
```

Ein Forschungssieg setzt voraus, dass der Spieler eine Forschungskette abschließt, die nötige Infrastruktur baut und genügend Ressourcen, Energie und Forschungskapazität bereitstellt.

### MVP-Einordnung

Im MVP nicht aktiv:

- KI-Forschungszentrum
- Forschungsmenü
- Forschungsprojekte
- Forschungskosten
- Forschungszeit
- parallele Forschung
- Forschungskapazität
- Einheiten-Upgrades
- Gebäude-Freischaltungen
- Einheiten-Freischaltungen
- Forschungssieg

Konzeptionell vorgesehen:

- Forschung als spätere Progressionsschicht
- KI-Forschungszentrum als Freischaltgebäude
- mehrere Rechenzentren für Beschleunigung oder parallele Forschung
- Forschung als Quelle für Upgrades, neue Gebäude, neue Einheiten und neue Automatisierungsfunktionen

Designregel:

> Forschung wird durch KI-Rechenzentren ermöglicht. Jedes Rechenzentrum kann einem aktiven Forschungsprojekt zugewiesen werden. Mehrere Rechenzentren an einem Projekt beschleunigen die Forschung; verteilte Rechenzentren erlauben parallele Forschungsprojekte. Forschung kostet Ressourcen und Zeit und kann Werte verbessern, neue Gebäude freischalten, neue Einheiten verfügbar machen oder neue Programmfunktionen aktivieren.

## Siegbedingungen und Scoring

Das Spiel soll langfristig mehrere Siegbedingungen unterstützen.

### Spätere Siegtypen

#### Kampfsieg

Der Spieler gewinnt, wenn gegnerische Fraktionen ausgeschaltet, verdrängt oder funktionsunfähig gemacht wurden.

#### Forschungssieg

Der Spieler gewinnt, wenn ein bestimmter Forschungsschritt erreicht wurde, zum Beispiel ein planetarer Kommunikationsdurchbruch, eine höhere Autonomiestufe oder ein finales Rückkehr-/Signalsystem.

#### Punktesieg

Der Spieler erhält nach Ablauf eines Zeitlimits eine Bewertung. Punkte gibt es für geerntete Ressourcen, gebaute Infrastruktur und produzierte Einheiten.

### MVP-Siegbedingung: Punktescore nach Zeitlimit

Für den MVP wird zunächst nur ein Punktesieg umgesetzt.

Der MVP läuft über:

```text
600 Ticks = 600 Spielsekunden = 10 Minuten
```

Nach Ablauf dieser Zeit wird der Score berechnet und angezeigt.

### MVP-Scoring v0.1

Punkte werden vergeben für:

```text
+1 Punkt pro abgebauter Iron-Ore-Einheit
+25 Punkte pro gebautem Solarkollektor
+50 Punkte pro gebauter Roboterfabrik
+100 Punkte pro produziertem Roboter
+200 Punkte Zielbonus, wenn mindestens ein zusätzlicher Roboter produziert wurde
```

Ressourcenpunkte werden beim Abbau vergeben, nicht nach aktuellem Bestand. Dadurch wird der Spieler nicht dafür bestraft, Ressourcen für Gebäude oder Produktion auszugeben.

### Beispielwertung

```text
20 Iron Ore abgebaut:             20 Punkte
1 Solarkollektor gebaut:          25 Punkte
1 Roboterfabrik gebaut:           50 Punkte
1 Roboter produziert:            100 Punkte
MVP-Zielbonus:                   200 Punkte

Gesamt:                          395 Punkte
```

### MVP-Auswertung

Nach Ablauf von 600 Ticks zeigt das Spiel eine einfache Ergebnisübersicht:

```text
Zeit abgelaufen

Score: 395

Abgebautes Iron Ore: 20
Solarkollektoren gebaut: 1
Roboterfabriken gebaut: 1
Roboter produziert: 1
MVP-Ziel erreicht: Ja
```

Optional kann später eine Bewertung ergänzt werden:

```text
0-149 Punkte: Fehlgeschlagen
150-299 Punkte: Grundbetrieb erreicht
300-449 Punkte: Erfolgreiche Initialisierung
450+ Punkte: Effizienter Aufbau
```

Diese Schwellen sind vorläufig und sollen nach ersten Tests angepasst werden.

## GUI-Grundkonzept v0.1

Das Spiel verwendet eine klassische Retro-RTS-Oberfläche, angelehnt an frühe Strategiespiele wie Dune 2.

Die Oberfläche besteht aus drei Hauptbereichen:

```text
┌──────────────────────────────────────┬──────────────────────┐
│                                      │                      │
│                                      │ Rechte Seitenleiste   │
│          Karte / Spielfeld           │ Status / Programme   │
│                                      │ Gruppen / Gebäude    │
│                                      │ Diagnose             │
│                                      │                      │
├──────────────────────────────────────┴──────────────────────┤
│ Zeit: Start/Pause 1x 2x 4x | Zoom - 100% + | Ereignislog     │
└─────────────────────────────────────────────────────────────┘
```

### Linker Hauptbereich: Karte und Spielfläche

Der linke große Bereich zeigt die Karte und die eigentliche Spielfläche.

Im MVP zeigt dieser Bereich:

- 10x10-Sektorkarte
- Startroboter
- Iron-Ore-Felder, sobald entdeckt
- Solarkollektor
- Roboterfabrik
- unbekannte Felder
- Nebel des Krieges
- aktuell sichtbare Felder
- Bewegungen, Bau- und Abbauaktivitäten

Später zeigt dieser Bereich das Feingrid mit Retro-RTS-Wuselfaktor.

### Rechte Seitenleiste: Status, Bedienung und Diagnose

Die rechte Seitenleiste ist kontextsensitiv. Ihr Inhalt hängt davon ab, was der Spieler ausgewählt hat:

- einzelner Roboter
- Gebäude
- Gruppe
- Feld
- Ressourcenfeld
- globale Übersicht

Bei einem Roboter zeigt die Seitenleiste zum Beispiel:

```text
Roboter: START-01
Typ: Startroboter
Status: aktiv
Batterie: 64 %
Frachtspeicher: 7 / 10 Iron Ore
Position: X4/Y6
Kommunikation: permanent erreichbar
Aktives Programm: Iron Ore abbauen
```

Darunter erscheint der Programmstack:

```text
1. Energie sichern
2. Iron Ore abbauen       [aktiv]
3. Solarkollektor bauen   [blockiert: Iron Ore < 5]
4. Roboterfabrik bauen    [blockiert: kein Solarkollektor]
5. Erkunden               [übersprungen]
6. Stasis-Laden           [Sicherheitsprogramm]
```

Bei einem Gebäude zeigt die Seitenleiste zum Beispiel:

```text
Gebäude: Solarkollektor
Status: aktiv
Leistung: 100
Abgenommen: 40
Freie Leistung: 60
Sichtweite: 2
Ladebonus: 10 % / Sek.
```

Bei einer Gruppe zeigt sie später:

```text
Gruppe: Miner
Roboter: 4
Online: 3
Deaktiviert: 1
Aktives Gruppenprogramm: Iron Ore abbauen
```

### Tabs in der Seitenleiste

Die rechte Seitenleiste kann in wenige klare Tabs gegliedert werden:

- Status
- Programme
- Gruppen
- Diagnose

Der Tab Status zeigt den aktuellen Zustand des ausgewählten Objekts.  
Der Tab Programme zeigt Templates, Stack-Reihenfolge, aktive/inaktive Programme und Bearbeitungsoptionen.  
Der Tab Gruppen zeigt Gruppenzuordnung, Gruppenstack und Mitglieder.  
Der Tab Diagnose zeigt aktive, blockierte und übersprungene Programme sowie Begründungen.

## Eingabekonzept

Die primäre Eingabe erfolgt per Maus. Das Spiel orientiert sich an klassischen RTS-Oberflächen: Der Spieler wählt Roboter, Gebäude, Gruppen oder Felder auf der Karte aus und bedient die meisten Funktionen über die rechte Seitenleiste.

### Primäre Mauseingabe

Die Maus wird verwendet für:

- Roboter auswählen
- Gebäude auswählen
- Felder auswählen
- Gruppen auswählen
- Programm-Templates in Stacks ziehen
- Programme aktiv/inaktiv schalten
- Stack-Reihenfolge ändern
- Buttons in der rechten Seitenleiste bedienen
- Tabs wechseln
- Tooltips anzeigen
- Kartenbereiche inspizieren
- Karte bewegen
- Karte per Mausrad zoomen

### Tastatur als Ergänzung

Die Tastatur ergänzt die Maus, ersetzt sie aber nicht.

Tastatureingaben werden verwendet für:

- numerische Werte in Programmen
- Texteingaben wie Robotername, Gruppenname, Programmtitel oder Marker-Label
- Shortcuts für häufige Funktionen

MVP-Shortcuts:

```text
Leertaste: Pause / Fortsetzen
1: normale Geschwindigkeit
2: schnelle Geschwindigkeit
3: sehr schnelle Geschwindigkeit
D: Diagnose öffnen
P: Programmstack öffnen
Esc: Dialog schließen / Auswahl aufheben
```

Designregel:

> Maus zuerst, Tastatur optional.

Alle zentralen Spielfunktionen sollen per Maus erreichbar sein. Tastatur und Shortcuts dienen der Beschleunigung für erfahrene Spieler.

## Untere Steuerleiste

Unterhalb der Spielfläche befindet sich eine dauerhafte Steuerleiste für Zeitverlauf, Zoom und ein kompaktes Ereignislog.

Die Leiste ist immer sichtbar und unabhängig von der aktuellen Auswahl.

### Zeitsteuerung

Die Zeitsteuerung enthält:

```text
[Pause/Start] [1x] [2x] [4x]
```

Funktionen:

- Simulation pausieren
- Simulation starten
- Geschwindigkeit wechseln
- aktuelle Geschwindigkeit anzeigen
- optional später: einzelnen Tick ausführen

Da das Spiel stark auf Beobachten, Pausieren und Anpassen basiert, muss die Zeitsteuerung jederzeit sichtbar und erreichbar sein.

### Kartenzoom

Die Karte kann per Mausrad gezoomt werden. Zusätzlich gibt es feste Zoomstufen in der unteren Steuerleiste.

Beispiel:

```text
Zoom: [-] [100 %] [+]
```

Primäre Zoomsteuerung:

- Mausrad zoomt die Karte hinein und heraus.
- Die Karte bleibt dabei auf die Mausposition oder den aktuellen Fokuspunkt zentriert.

Zusätzliche Zoomsteuerung:

- Minus-Button reduziert die Zoomstufe.
- Plus-Button erhöht die Zoomstufe.
- Prozentanzeige zeigt die aktuelle Zoomstufe.
- Klick auf die Prozentanzeige kann optional auf Standardzoom zurücksetzen.

Mögliche Zoomstufen für den MVP:

- 50 %
- 75 %
- 100 %
- 150 %
- 200 %

Zoom unterstützt zwei Beobachtungsebenen:

- Übersicht: Karte, Ressourcen, Gebäude, Erkundungsstand
- Detail: Roboter, Programmaktivität, Bewegung, Baufortschritt, Wuselfaktor

### Ereignis- und Aktivitätslog

Die untere Leiste enthält außerdem ein kompaktes Ereignislog.

Beispiel:

```text
[03:12] START-01: Programmwechsel → Erkunden
[03:18] START-01: Iron Ore entdeckt
[03:22] START-01: Programmwechsel → Iron Ore abbauen
[03:35] START-01: Frachtspeicher 10/10
[03:46] Solarkollektor gebaut
```

Für den MVP gehören folgende Ereignisse ins Log:

- Programmwechsel
- relevante Blockierungen
- Iron Ore entdeckt
- Frachtspeicher voll
- Gebäude gebaut
- Produktion gestartet
- Produktion abgeschlossen
- Roboter fällt in Stasis
- Roboter wacht aus Stasis auf

Später können ergänzt werden:

- Roboter verlässt Kommunikationsgrid
- Standardroboter deaktiviert
- Scout-Programm gelocked
- Gruppe geändert
- Feindkontakt
- Gebäude offline
- Energieengpass

Das Log zeigt den zeitlichen Verlauf wichtiger Ereignisse. Die rechte Seitenleiste erklärt dagegen den aktuellen Zustand und die Diagnose des ausgewählten Objekts.

### MVP-Pflichtumfang der unteren Leiste

Für den MVP sind Pflicht:

- Start/Pause
- Geschwindigkeit 1x / 2x / 4x
- aktuelle Tick-/Zeit-Anzeige
- Zoomsteuerung mit Minus, Prozentwert und Plus
- Mausrad-Zoom
- kleines Ereignislog mit den letzten 5 bis 8 Meldungen

Optional:

- Einzeltick-Button
- Logfilter
- ausführlicher Diagnosemodus