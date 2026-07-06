// Eventlog: deterministische Sortierung, Deduplizierung und ID-Vergabe nach
// docs/03-technical/deterministic-id-generation.md und diagnostics-and-eventlog.md.
import { MVP_EVENTLOG_LIMIT, MVP_PLAYER_EVENT_DEDUPE_TICKS } from "./constants";
import { createGameEventId } from "./ids";
import type { GameEvent, GameEventCode, GameState, Tick } from "./types";

// Reihenfolge der kanonischen GameEventCode-Union (canonical-data-model.md).
export const GAME_EVENT_CODE_ORDER: GameEventCode[] = [
  "system.initialLanding",
  "program.row.conditionFalse",
  "program.skipped.notExecutable",
  "program.action.executable",
  "task.started",
  "task.completed",
  "task.aborted",
  "action.scout.targetVisible",
  "action.scout.targetSelected",
  "action.scout.noReachableTarget",
  "action.mine.started",
  "action.mine.blocked.noAdjacentResource",
  "action.mine.blocked.cargoFull",
  "action.mine.completed",
  "action.build.targetSelected",
  "action.build.blocked.notEnoughResources",
  "action.build.blocked.noValidBuildSite",
  "action.build.blocked.noReachableBuildFromField",
  "action.build.blocked.constructionAlreadyReserved",
  "action.build.started",
  "action.build.completed",
  "action.stasis.started",
  "action.stasis.completed",
  "action.stasis.blocked.cannotSelfCharge",
  "production.ironMiner.started",
  "production.ironMiner.blocked.notEnoughOre",
  "production.ironMiner.paused.insufficientPower",
  "production.ironMiner.spawnBlocked",
  "production.ironMiner.spawned",
  "goal.mvpReached",
  "debug.command.rejected",
  "debug.canExecuteAction.result",
  "debug.build.targetRejected",
  "debug.scout.targetRejected",
  "debug.asset.fallbackUsed",
  "debug.asset.missingFallback",
];

const eventCodeOrderIndex = new Map<GameEventCode, number>(
  GAME_EVENT_CODE_ORDER.map((code, index) => [code, index]),
);

// Event-Kandidat vor Sortierung/ID-Vergabe (Schritt 10 der Tick-Pipeline).
export type GameEventCandidate = Omit<GameEvent, "id"> & {
  pipelineStepOrder: number;
  sourceOrder: number;
  entitySortKey: string;
  localSequence: number;
};

export function makeFieldSortKey(x: number, y: number): string {
  return `field:${String(y).padStart(4, "0")}:${String(x).padStart(4, "0")}`;
}

export function makeCommandSortKey(commandIndex: number): string {
  return `command:${String(commandIndex).padStart(3, "0")}`;
}

function compareCandidates(a: GameEventCandidate, b: GameEventCandidate): number {
  if (a.pipelineStepOrder !== b.pipelineStepOrder) {
    return a.pipelineStepOrder - b.pipelineStepOrder;
  }
  if (a.sourceOrder !== b.sourceOrder) {
    return a.sourceOrder - b.sourceOrder;
  }
  if (a.entitySortKey !== b.entitySortKey) {
    return a.entitySortKey < b.entitySortKey ? -1 : 1;
  }
  const codeA = eventCodeOrderIndex.get(a.code) ?? Number.MAX_SAFE_INTEGER;
  const codeB = eventCodeOrderIndex.get(b.code) ?? Number.MAX_SAFE_INTEGER;
  if (codeA !== codeB) {
    return codeA - codeB;
  }
  return a.localSequence - b.localSequence;
}

// Dedupe-Regel: gleiche Player-Events (code + entityId) innerhalb von
// MVP_PLAYER_EVENT_DEDUPE_TICKS aktualisieren repeatCount/lastTick statt
// einen neuen Eintrag zu erzeugen. Debug-Events werden nicht dedupliziert.
function findDedupeTarget(
  eventLog: GameEvent[],
  candidate: GameEventCandidate,
  currentTick: Tick,
): GameEvent | undefined {
  if (candidate.visibility !== "player") {
    return undefined;
  }
  return eventLog.find(
    (event) =>
      event.visibility === "player" &&
      event.code === candidate.code &&
      event.entityId === candidate.entityId &&
      currentTick - (event.lastTick ?? event.tick) <= MVP_PLAYER_EVENT_DEDUPE_TICKS,
  );
}

// Schritt 10: Kandidaten sortieren, deduplizieren, seq3 vergeben, Limit anwenden.
export function finalizeTickEvents(
  state: GameState,
  candidates: GameEventCandidate[],
): void {
  const sorted = [...candidates].sort(compareCandidates);

  let sequence = 0;
  for (const candidate of sorted) {
    const dedupeTarget = findDedupeTarget(state.eventLog, candidate, state.tick);
    if (dedupeTarget) {
      dedupeTarget.repeatCount = (dedupeTarget.repeatCount ?? 1) + 1;
      dedupeTarget.lastTick = state.tick;
      continue;
    }

    sequence += 1;
    const {
      pipelineStepOrder: _step,
      sourceOrder: _source,
      entitySortKey: _entity,
      localSequence: _local,
      ...eventFields
    } = candidate;

    state.eventLog.push({
      ...eventFields,
      id: createGameEventId(state.tick, sequence, candidate.code),
      firstTick: candidate.tick,
      lastTick: candidate.tick,
      repeatCount: 1,
    });
  }

  if (state.eventLog.length > MVP_EVENTLOG_LIMIT) {
    state.eventLog.splice(0, state.eventLog.length - MVP_EVENTLOG_LIMIT);
  }
}
