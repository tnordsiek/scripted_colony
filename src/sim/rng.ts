// Seeded RNG nach docs/03-technical/seeded-rng.md: FNV-1a 32-bit über UTF-8 + Mulberry32.
import {
  FNV1A_32_OFFSET,
  FNV1A_32_PRIME,
  MULBERRY32_INCREMENT,
  UINT32_SIZE,
} from "./constants";
import type { FieldCoord } from "./types";

export function makeRngInput(
  parts: ReadonlyArray<string | number | boolean>,
): string {
  return parts
    .map((part) => {
      const value = String(part);
      return `${value.length}:${value}`;
    })
    .join("|");
}

export function fnv1a32Utf8(input: string): number {
  const bytes = new TextEncoder().encode(input);
  let hash = FNV1A_32_OFFSET;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, FNV1A_32_PRIME) >>> 0;
  }

  return hash >>> 0;
}

export type SeededRng = {
  nextUint32(): number;
  nextFloat(): number;
  intInclusive(minInclusive: number, maxInclusive: number): number;
  pickIndex(length: number): number;
};

export function createSeededRng(input: string): SeededRng {
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

// Stabile Kandidaten-Sortierung vor jeder seeded Auswahl (seeded-rng.md#auswahlregeln).

export function sortFieldCoords(coords: ReadonlyArray<FieldCoord>): FieldCoord[] {
  return [...coords].sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

export function sortEntityIds(ids: ReadonlyArray<string>): string[] {
  return [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export function pickFromSorted<T>(rng: SeededRng, sortedCandidates: ReadonlyArray<T>): T {
  const index = rng.pickIndex(sortedCandidates.length);
  return sortedCandidates[index];
}
