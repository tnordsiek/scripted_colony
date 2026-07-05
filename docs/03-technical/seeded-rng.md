# Seeded RNG

## Zweck

Dieses Dokument ist die kanonische technische Quelle fuer deterministischen Zufall im MVP.

Seeded RNG wird verwendet fuer:

```text
Map-Generierung
Gleichstandsentscheidungen bei Zielauswahl
Gleichstandsentscheidungen bei Bau-/Spawn-Feldern
alle weiteren spielrelevanten Zufallsentscheidungen
```

Nicht verwenden fuer seeded RNG:

```text
Math.random()
Date.now()
crypto.randomUUID()
Browser-/Engine-Reihenfolge ohne vorherige Sortierung
```

Der RNG ist nicht kryptografisch. Er dient nur reproduzierbarer Simulation und Tests.

## Kanonischer Algorithmus

Der MVP verwendet:

```text
Hash: FNV-1a 32-bit ueber UTF-8-Bytes
PRNG: Mulberry32
Ausgabe: unsigned 32-bit integer und float in [0, 1)
```

Jede Implementierung muss exakt diese Bitoperationen verwenden.

## Seed-Normalisierung

Ein RNG-Eingabestring wird aus Kontextteilen gebaut. Die Laengenangabe verwendet exakt JavaScript `String(value).length` und damit UTF-16-Code-Units, nicht Byte-Laenge. Der daraus entstehende gesamte Eingabestring wird anschliessend per UTF-8 gehasht.

Kanonisch:

```ts
function makeRngInput(parts: ReadonlyArray<string | number | boolean>): string {
  return parts
    .map((part) => {
      const value = String(part);
      return `${value.length}:${value}`;
    })
    .join("|");
}
```

Beispiele:

```text
makeRngInput(["mvp-default", "map", 0])
= 11:mvp-default|3:map|1:0

makeRngInput(["mvp-default", "tie", 37, "scoutTarget", "robot.starter.001"])
= 11:mvp-default|3:tie|2:37|11:scoutTarget|17:robot.starter.001
```

Regel:

```text
Seed-Kontextteile duerfen nicht frei per ':' oder '-' verkettet werden.
makeRngInput(...) ist die kanonische Kontextbildung.
```

Dadurch bleiben Seeds mit Trennzeichen im User-Seed eindeutig.

## FNV-1a 32-bit

Kanonische TypeScript-Implementierung:

```ts
const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

function fnv1a32Utf8(input: string): number {
  const bytes = new TextEncoder().encode(input);
  let hash = FNV1A_32_OFFSET;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, FNV1A_32_PRIME) >>> 0;
  }

  return hash >>> 0;
}
```

## Mulberry32

Kanonische TypeScript-Implementierung:

```ts
const MULBERRY32_INCREMENT = 0x6d2b79f5;
const UINT32_SIZE = 0x100000000;

type SeededRng = {
  nextUint32(): number;
  nextFloat(): number;
  intInclusive(minInclusive: number, maxInclusive: number): number;
  pickIndex(length: number): number;
};

function createSeededRng(input: string): SeededRng {
  let state = fnv1a32Utf8(input);

  function nextUint32(): number {
    state = (state + MULBERRY32_INCREMENT) >>> 0;

    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return (t ^ (t >>> 14)) >>> 0;
  }

  function nextFloat(): number {
    return nextUint32() / UINT32_SIZE;
  }

  function intInclusive(minInclusive: number, maxInclusive: number): number {
    if (!Number.isInteger(minInclusive) || !Number.isInteger(maxInclusive)) {
      throw new Error("RNG integer bounds must be integers.");
    }

    if (maxInclusive < minInclusive) {
      throw new Error("RNG maxInclusive must be >= minInclusive.");
    }

    const span = maxInclusive - minInclusive + 1;
    return minInclusive + Math.floor(nextFloat() * span);
  }

  function pickIndex(length: number): number {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error("RNG pickIndex length must be a positive integer.");
    }

    return intInclusive(0, length - 1);
  }

  return {
    nextUint32,
    nextFloat,
    intInclusive,
    pickIndex,
  };
}
```

## Auswahlregeln

Vor jeder seeded Auswahl muss die Kandidatenliste stabil sortiert werden.

Feldkoordinaten:

```text
sort by y ascending, then x ascending
```

Entities:

```text
sort by kanonischem EntityId-String ascending
```

Events:

```text
sort by kanonischer Event-Sequenz aus deterministic-id-generation.md
```

Danach wird der Index bestimmt:

```ts
const index = rng.pickIndex(candidates.length);
const selected = candidates[index];
```

Nicht erlaubt:

```text
RNG-Auswahl auf unsortierten Object.keys(...)-, Map-, Set- oder Framework-Listen.
```

## Kontext-Seeds

Spielrelevanter Zufall darf kein global fortlaufendes RNG-State-Objekt im `GameState` speichern. Stattdessen wird fuer jede klar abgegrenzte Entscheidung ein Kontext-Seed aus `GameState.randomSeed` und stabilen Kontextteilen gebildet.

Kanonische Muster:

```text
Map-Generierung, Versuch N:
makeRngInput([seed, "map", attempt])

Scout-Ziel bei Gleichstand:
makeRngInput([gameState.randomSeed, "tie", gameState.tick, "scoutTarget", robot.id, activeProgram.rowId])

Mining-Ziel bei mehreren gleichwertigen angrenzenden Iron-Ore-Feldern:
makeRngInput([gameState.randomSeed, "tie", gameState.tick, "mineAdjacentOre", robot.id, activeProgram.rowId])

Bauplatz bei Gleichstand:
makeRngInput([gameState.randomSeed, "tie", gameState.tick, "buildSite", robot.id, activeProgram.rowId, buildingType])

Spawn-Feld bei Gleichstand:
makeRngInput([gameState.randomSeed, "tie", gameState.tick, "spawnSite", productionTask.id, robotType])
```

Wenn fuer ein System ein weiterer seeded Tie-Breaker eingefuehrt wird, muss ein neuer stabiler Kontextname dokumentiert oder im jeweiligen Fachsystem eindeutig genannt werden.

## Map-Generator-Regel

`generateMvpMap(seed, config)` verwendet pro Versuch genau einen RNG-Stream:

```ts
const rng = createSeededRng(makeRngInput([seed, "map", attempt]));
```

Der Versuch nutzt diesen Stream fuer:

```text
Auswahl des garantierten Zielring-Felds
Cluster-Zielgroessen
Auswahl vorhandener Clusterfelder
Auswahl gueltiger Nachbarfelder
weitere Ore-Cluster
```

Neue RNG-Aufrufe im Map-Generator duerfen nicht zwischen bestehende RNG-Aufrufe eingefuegt werden, ohne die erwarteten Map-Referenzwerte und Tests anzupassen.

## Referenzwerte fuer Algorithmus-Smoke-Tests

Diese Werte pruefen nur Hash und PRNG. Die vollstaendige `mvp-default`-Kartenreferenz steht in `docs/03-technical/pathfinding-and-map-generation.md`.

Die Sequenzwerte entstehen aus fortlaufenden Aufrufen desselben RNG-Objekts. Es wird nicht fuer jeden Referenzwert ein neues RNG-Objekt erzeugt.

```ts
const rng = createSeededRng("mvp-default");

rng.nextUint32(); // 2072433787
rng.nextUint32(); // 2977076701
rng.nextUint32(); // 185255773
```

Werden zusaetzlich Float-Werte geprueft, muessen sie entweder aus einem frischen RNG-Objekt oder aus der exakt dokumentierten fortlaufenden Sequenz stammen. Die unten stehenden `nextFloat`-Werte entsprechen einem frischen `createSeededRng(input)` und den ersten drei Float-Aufrufen.


```text
Input: mvp-default
fnv1a32Utf8(input): 2236944682
nextUint32 #1: 2072433787
nextUint32 #2: 2977076701
nextUint32 #3: 185255773
nextFloat #1: 0.4825260926
nextFloat #2: 0.6931546845
nextFloat #3: 0.0431332209
```

```text
Input: makeRngInput(["mvp-default", "map", 0])
RNG-Eingabestring: 11:mvp-default|3:map|1:0
fnv1a32Utf8(input): 2914558808
nextUint32 #1: 2543255916
nextUint32 #2: 2482908342
nextUint32 #3: 4149768718
nextFloat #1: 0.5921479119
nextFloat #2: 0.5780971474
nextFloat #3: 0.9661933216
```

## Abnahmeregel

Eine Implementierung erfuellt die RNG-Regel nur, wenn:

```text
makeRngInput(...) exakt wie oben arbeitet
fnv1a32Utf8(...) die Referenzwerte trifft
createSeededRng(...) die Referenzwerte trifft
spielrelevante Zufallsentscheidungen keine verbotenen Quellen nutzen
Kandidatenlisten vor RNG-Auswahl stabil sortiert werden
Map-Generierung makeRngInput([seed, "map", attempt]) verwendet
```
