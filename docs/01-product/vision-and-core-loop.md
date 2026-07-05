# Vision und Core Loop

## Grundidee

Ein Roboter landet auf einem fremden Planeten. Der Spieler ist nicht direkt vor Ort und steuert den Roboter nicht wie in einem klassischen RTS. Stattdessen sendet der Spieler einfache Steuerungslogiken und Programme.

Der zentrale Reiz ist:

```text
Nicht direkte Steuerung, sondern Verhaltenslogiken entwerfen, priorisieren und beobachten.
```

## Spielgefühl

Das Spiel soll Elemente verbinden aus:

- Aufbau- und Automatisierungsspiel
- Survival auf fremdem Planeten
- indirekter RTS-Steuerung
- sichtbarem Wuselfaktor wie bei Siedler
- Retro-RTS-Anmutung wie Dune 2

Der Spieler entscheidet Absichten, Prioritäten und Programme. Die Roboter entscheiden konkrete Wege, Positionen und Ausführung innerhalb der Regeln.

## Core Loop

```text
Programme erstellen/anpassen
→ Roboter beobachten
→ Diagnose prüfen
→ Ressourcen erschließen
→ Infrastruktur bauen
→ neue Roboter/Gebäude/Forschung freischalten
→ komplexere Programme erstellen
```

## Langfristige Progression

```text
Starter Roboter
→ Iron Ore
→ Solar Collector
→ Roboterfabrik
→ Iron Miner
→ KI-Forschungszentrum
→ Forschung
→ Level-2-Gebäude
→ neue Ressourcen
→ Logistik
→ spezialisierte Einheiten
→ höhere Siegbedingungen
```

## Spielerrolle

Der Spieler ist kein Mauszeiger-Kommandant, sondern ein Operator, der Regelwerke an Roboter sendet.

Er steuert:

- Programmstack
- Prioritäten
- Bedingungen
- Aktionen
- Bauabsichten
- Gruppenlogik
- Forschung
- Infrastrukturplanung

Er steuert nicht direkt:

- exakte Bewegungsschritte
- jede einzelne Bauposition
- jeden Abbauklick
- jeden Kampf- oder Transportschritt

## Siegbedingungen langfristig

Mögliche Siegtypen:

- Punktesieg nach Zeitlimit
- Forschungssieg
- Kampfsieg
- Autonomie-/Rückkehrsignal-Sieg

Der MVP verwendet nur ein reduziertes Ziel: erster zusätzlicher Roboter erfolgreich gespawnt.
