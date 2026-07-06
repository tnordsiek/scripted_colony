// action.mineResource nach docs/03-technical/action-executability-matrix.md.
// Zielauswahl: groesster ResourceDeposit.amount, dann seeded random
// (Kontext mineAdjacentOre nach docs/03-technical/seeded-rng.md).
import { MVP_MINING_BATTERY_COST, MVP_MINING_TICKS } from "../constants";
import { createRobotTaskId } from "../ids";
import { getOrthogonalNeighbors, isInsideMap } from "../pathfinding";
import { createSeededRng, makeRngInput, sortFieldCoords } from "../rng";
import type {
  ActionExecutabilityResult,
  FieldCoord,
  GameState,
  MiningTask,
  ProgramAction,
  ProgramInstanceId,
  ProgramRowId,
  Robot,
} from "../types";

function cargoUsedTotal(robot: Robot): number {
  return Object.values(robot.cargo.used).reduce(
    (sum, amount) => sum + (amount ?? 0),
    0,
  );
}

export function planMineResource(
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  sourceProgramId: ProgramInstanceId,
  sourceRowId: ProgramRowId,
): ActionExecutabilityResult {
  const resourceType = action.parameters.resourceType;
  if (resourceType === undefined) {
    return { type: "notExecutable", reason: "missingParameter" };
  }

  const resolvedType =
    typeof resourceType === "string"
      ? resourceType
      : typeof resourceType === "object" && "value" in resourceType
        ? resourceType.value
        : undefined;

  if (resolvedType !== "ironOre") {
    return { type: "notExecutable", reason: "unsupportedMvpTarget" };
  }

  if (cargoUsedTotal(robot) >= robot.cargo.capacity) {
    return { type: "notExecutable", reason: "cargoFull" };
  }

  const adjacentOre: FieldCoord[] = getOrthogonalNeighbors({
    x: robot.x,
    y: robot.y,
  }).filter((coord) => {
    if (!isInsideMap(state.map, coord)) {
      return false;
    }
    const field = state.map[coord.y][coord.x];
    return field.resource?.type === "ironOre" && field.resource.amount > 0;
  });

  if (adjacentOre.length === 0) {
    return { type: "notExecutable", reason: "noAdjacentResource" };
  }

  // Groesster Deposit zuerst, Gleichstand seeded deterministic.
  const maxAmount = Math.max(
    ...adjacentOre.map((coord) => state.map[coord.y][coord.x].resource?.amount ?? 0),
  );
  const best = sortFieldCoords(
    adjacentOre.filter(
      (coord) => (state.map[coord.y][coord.x].resource?.amount ?? 0) === maxAmount,
    ),
  );

  let target = best[0];
  if (best.length > 1) {
    const rng = createSeededRng(
      makeRngInput([
        state.randomSeed,
        "tie",
        state.tick,
        "mineAdjacentOre",
        robot.id,
        sourceRowId,
      ]),
    );
    target = best[rng.pickIndex(best.length)];
  }

  const plannedTask: MiningTask = {
    id: createRobotTaskId(robot.id, "mining", state),
    type: "mining",
    status: "running",
    sourceProgramId,
    sourceRowId,
    startedTick: state.tick,
    resourceType: "ironOre",
    target,
    totalTicks: MVP_MINING_TICKS,
    remainingTicks: MVP_MINING_TICKS,
    minedAmount: 0,
    batteryCostOnSuccess: MVP_MINING_BATTERY_COST,
  };

  return { type: "executable", action, plannedTask };
}
