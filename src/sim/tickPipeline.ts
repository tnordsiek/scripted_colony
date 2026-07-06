// Einzige Implementierung der kanonischen Tick-Reihenfolge nach
// docs/03-technical/tick-pipeline.md (11 Schritte).
import { canExecuteAction } from "./actions/canExecuteAction";
import { getBuildingCost, selectNewConstructionSite } from "./actions/buildBuilding";
import { applyPlayerCommands, type CommandOutcome } from "./commands";
import {
  MVP_BUILDING_CONSTRUCTION_REQUIRED,
  MVP_BUILDING_SIGHT_RANGE,
  MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED,
  MVP_ROBOT_FACTORY_IDLE_POWER_REQUIRED,
  MVP_SOLAR_COLLECTOR_POWER_PROVIDED,
} from "./constants";
import { type GameEventCandidate } from "./events";
import { finalizeTickEvents } from "./events";
import { createBuildingId } from "./ids";
import { processBuildingTask } from "./tasks/buildingTask";
import { processMiningTask } from "./tasks/miningTask";
import { processMovementTask } from "./tasks/movementTask";
import { processStasisChargingTask } from "./tasks/stasisChargingTask";
import { processProductionTasks, processSpawnChecks } from "./production";
import { evaluateProgramStack } from "./programs";
import { scoreRobotSpawned } from "./scoring";
import { sortEntityIds } from "./rng";
import { updateVisibility } from "./visibility";
import type {
  ActionExecutabilityResult,
  Building,
  BuildingTask,
  GameState,
  PlayerCommand,
  Robot,
  RobotTaskStatus,
} from "./types";

export type TickResult = {
  state: GameState;
  commandOutcomes: CommandOutcome[];
};

function sortedRobots(state: GameState): Robot[] {
  const order = sortEntityIds(state.robots.map((robot) => robot.id));
  return order.map(
    (id) => state.robots.find((robot) => robot.id === id) as Robot,
  );
}

function releaseReservationsByRobot(state: GameState, robotId: string): void {
  for (const row of state.map) {
    for (const field of row) {
      const reservation = field.reservedForConstruction;
      if (!reservation) {
        continue;
      }
      const remaining = reservation.reservedByRobotIds.filter((id) => id !== robotId);
      if (remaining.length === 0) {
        delete field.reservedForConstruction;
      } else {
        reservation.reservedByRobotIds = remaining;
      }
    }
  }
}

// Start-of-Task-Effekte fuer BuildingTasks: Kostenabzug und Building-Anlage
// bei newConstruction (Ressourcenabzug erst beim Start des Bau-Tasks).
function startBuildingTask(
  state: GameState,
  robot: Robot,
  task: BuildingTask,
  events: GameEventCandidate[],
  robotSourceOrder: number,
): void {
  if (task.mode === "newConstruction") {
    const cost = getBuildingCost(task.buildingType);
    for (const [resource, amount] of Object.entries(cost)) {
      const key = resource as keyof typeof robot.cargo.used;
      robot.cargo.used[key] = (robot.cargo.used[key] ?? 0) - (amount ?? 0);
    }
    task.costPaidByThisTask = true;

    const building: Building = {
      id: task.buildingId,
      type: task.buildingType,
      tier: 1,
      x: task.site.x,
      y: task.site.y,
      hp: { current: 100, max: 100 },
      status: "construction",
      isEnabled: true,
      sightRange: MVP_BUILDING_SIGHT_RANGE,
      costPaid: cost,
      constructionProgress: 0,
      constructionRequired: MVP_BUILDING_CONSTRUCTION_REQUIRED,
      ...(task.buildingType === "solarCollector"
        ? { powerProvided: MVP_SOLAR_COLLECTOR_POWER_PROVIDED }
        : {
            powerRequired: MVP_IRON_MINER_PRODUCTION_POWER_REQUIRED,
            powerConsumed: MVP_ROBOT_FACTORY_IDLE_POWER_REQUIRED,
          }),
    };
    state.buildings.push(building);
    state.map[task.site.y][task.site.x].buildingId = building.id;
    releaseReservationsByRobot(state, robot.id);
  }

  events.push({
    tick: state.tick,
    visibility: "player",
    severity: "info",
    priority: "normal",
    category: "building",
    code: "action.build.started",
    message:
      task.mode === "newConstruction"
        ? "Bau gestartet: neue Baustelle."
        : "Bau gestartet: bestehende Baustelle fortgesetzt.",
    robotId: robot.id,
    buildingId: task.buildingId,
    entityId: robot.id,
    details: {
      mode: task.mode,
      buildingType: task.buildingType,
      buildingId: task.buildingId,
      siteX: task.site.x,
      siteY: task.site.y,
    },
    pipelineStepOrder: 8,
    sourceOrder: robotSourceOrder,
    entitySortKey: `robot:${robot.id}`,
    localSequence: 2,
  });
}

export function advanceTick(
  previousState: GameState,
  commands: PlayerCommand[] = [],
): TickResult {
  const state = structuredClone(previousState);
  const events: GameEventCandidate[] = [];

  state.tick += 1;
  state.score.elapsedTicks = state.tick;

  // Schritt 1: PlayerCommands validieren und anwenden.
  const commandOutcomes = applyPlayerCommands(state, commands, events);

  // Schritt 2 (EnergySnapshot) wird in Schritt 3 konsumiert.
  // Schritt 3: ProductionTasks verarbeiten.
  const production = processProductionTasks(state);
  for (const [index, taskId] of production.pausedTaskIds.entries()) {
    events.push({
      tick: state.tick,
      visibility: "player",
      severity: "warning",
      priority: "normal",
      category: "production",
      code: "production.ironMiner.paused.insufficientPower",
      message: "Produktion pausiert: Nicht genug freie Leistung.",
      entityId: taskId,
      details: { reason: "insufficientPower" },
      pipelineStepOrder: 3,
      sourceOrder: index,
      entitySortKey: `production:${taskId}`,
      localSequence: 1,
    });
  }

  // Schritt 4: Spawn-Pruefungen.
  const spawnResult = processSpawnChecks(state);
  for (const [index, blocked] of spawnResult.blocked.entries()) {
    events.push({
      tick: state.tick,
      visibility: "player",
      severity: "warning",
      priority: "high",
      category: "production",
      code: "production.ironMiner.spawnBlocked",
      message: "Spawn blockiert: Kein freies Ausgabefeld.",
      buildingId: blocked.buildingId,
      entityId: blocked.taskId,
      details: { reason: "noFreeOutputField" },
      pipelineStepOrder: 4,
      sourceOrder: index,
      entitySortKey: `production:${blocked.taskId}`,
      localSequence: 1,
    });
  }
  for (const [index, spawned] of spawnResult.spawned.entries()) {
    events.push({
      tick: state.tick,
      visibility: "player",
      severity: "success",
      priority: "high",
      category: "production",
      code: "production.ironMiner.spawned",
      message: "Iron Miner gespawnt.",
      robotId: spawned.robotId,
      buildingId: spawned.buildingId,
      entityId: spawned.taskId,
      details: { robotId: spawned.robotId },
      pipelineStepOrder: 4,
      sourceOrder: index,
      entitySortKey: `production:${spawned.taskId}`,
      localSequence: 1,
    });
  }

  // Schritte 5+6: Laufende RobotTasks verarbeiten und Enden anwenden.
  const robotsInOrder = sortedRobots(state);
  robotsInOrder.forEach((robot, robotIndex) => {
    const task = robot.activeTask;
    if (!task || task.status !== "running") {
      return;
    }

    switch (task.type) {
      case "movement":
        processMovementTask(state, robot, task);
        break;
      case "mining":
        processMiningTask(state, robot, task);
        break;
      case "building": {
        const completion = processBuildingTask(state, robot, task);
        if (completion.type === "activated") {
          events.push({
            tick: state.tick,
            visibility: "player",
            severity: "success",
            priority: "high",
            category: "building",
            code: "action.build.completed",
            message: "Bau abgeschlossen.",
            robotId: robot.id,
            buildingId: task.buildingId,
            entityId: robot.id,
            details: {
              mode: task.mode,
              buildingType: task.buildingType,
              buildingId: task.buildingId,
              siteX: task.site.x,
              siteY: task.site.y,
            },
            pipelineStepOrder: 6,
            sourceOrder: robotIndex,
            entitySortKey: `robot:${robot.id}`,
            localSequence: 1,
          });
        }
        break;
      }
      case "stasisCharging":
        processStasisChargingTask(state, robot, task);
        break;
    }

    // Task-Prozessoren mutieren task.status; Narrowing daher aufheben.
    const endStatus = task.status as RobotTaskStatus;
    if (endStatus === "completed" || endStatus === "aborted") {
      if (task.type === "stasisCharging" && endStatus === "completed") {
        robot.status = "active";
        events.push({
          tick: state.tick,
          visibility: "player",
          severity: "success",
          priority: "normal",
          category: "robot",
          code: "action.stasis.completed",
          message: "Stasis-Laden abgeschlossen.",
          robotId: robot.id,
          entityId: robot.id,
          pipelineStepOrder: 6,
          sourceOrder: robotIndex,
          entitySortKey: `robot:${robot.id}`,
          localSequence: 1,
        });
      }

      if (task.type === "mining" && endStatus === "completed") {
        events.push({
          tick: state.tick,
          visibility: "player",
          severity: "success",
          priority: "normal",
          category: "resource",
          code: "action.mine.completed",
          message: "Iron Ore aufgenommen.",
          robotId: robot.id,
          entityId: robot.id,
          details: { minedAmount: task.minedAmount },
          pipelineStepOrder: 6,
          sourceOrder: robotIndex,
          entitySortKey: `robot:${robot.id}`,
          localSequence: 1,
        });
      }

      if (endStatus === "aborted") {
        releaseReservationsByRobot(state, robot.id);
        events.push({
          tick: state.tick,
          visibility: "debug",
          severity: "warning",
          priority: "normal",
          category: "task",
          code: "task.aborted",
          message: `Task abgebrochen: ${task.abortReason ?? "unbekannt"}.`,
          robotId: robot.id,
          entityId: robot.id,
          details: { taskType: task.type, reason: task.abortReason ?? "" },
          pipelineStepOrder: 6,
          sourceOrder: robotIndex,
          entitySortKey: `robot:${robot.id}`,
          localSequence: 2,
        });
      } else {
        events.push({
          tick: state.tick,
          visibility: "debug",
          severity: "info",
          priority: "low",
          category: "task",
          code: "task.completed",
          message: `Task abgeschlossen: ${task.type}.`,
          robotId: robot.id,
          entityId: robot.id,
          details: { taskType: task.type },
          pipelineStepOrder: 6,
          sourceOrder: robotIndex,
          entitySortKey: `robot:${robot.id}`,
          localSequence: 2,
        });
      }

      robot.activeTask = undefined;
      robot.activeProgram = undefined;
    }
  });

  // Schritt 7: Sicht und Fog-of-War aktualisieren.
  updateVisibility(state);

  // Schritt 8: ProgramStacks fuer freie aktive Roboter auswerten.
  sortedRobots(state).forEach((robot, robotIndex) => {
    if (robot.status !== "active" || robot.activeTask) {
      return;
    }

    let plannedResult:
      | Extract<ActionExecutabilityResult, { type: "executable" }>
      | undefined;
    const evaluation = evaluateProgramStack(
      state,
      robot,
      (evalState, evalRobot, action, rowId, programId) => {
        const result = canExecuteAction(
          evalState,
          evalRobot,
          action,
          programId ?? "",
          rowId ?? "",
        );
        if (result.type === "executable") {
          plannedResult = result;
        }
        return result;
      },
    );

    if (evaluation.type !== "startRow" || !plannedResult?.plannedTask) {
      return;
    }

    const task = plannedResult.plannedTask;
    robot.activeProgram = {
      programId: evaluation.programId,
      rowId: evaluation.rowId,
      startedTick: state.tick,
    };
    robot.activeTask = task;

    events.push({
      tick: state.tick,
      visibility: "debug",
      severity: "info",
      priority: "low",
      category: "task",
      code: "task.started",
      message: `Task gestartet: ${task.type}.`,
      robotId: robot.id,
      programId: evaluation.programId,
      rowId: evaluation.rowId,
      entityId: robot.id,
      details: { taskType: task.type },
      pipelineStepOrder: 8,
      sourceOrder: robotIndex,
      entitySortKey: `robot:${robot.id}`,
      localSequence: 1,
    });

    if (task.type === "stasisCharging") {
      robot.status = "stasis";
      events.push({
        tick: state.tick,
        visibility: "player",
        severity: "warning",
        priority: "high",
        category: "robot",
        code: "action.stasis.started",
        message: "Stasis-Laden gestartet.",
        robotId: robot.id,
        entityId: robot.id,
        details: { battery: robot.battery },
        pipelineStepOrder: 8,
        sourceOrder: robotIndex,
        entitySortKey: `robot:${robot.id}`,
        localSequence: 2,
      });
    } else if (task.type === "building") {
      startBuildingTask(state, robot, task, events, robotIndex);
    } else if (task.type === "movement" && task.reason === "building") {
      // Bauplatz fuer newConstruction reservieren, solange der Roboter anlaeuft.
      const row = robot.programStack
        .find((program) => program.id === evaluation.programId)
        ?.rows.find((entry) => entry.id === evaluation.rowId);
      const parameter = row?.then.parameters.buildingType;
      const buildingType =
        typeof parameter === "string"
          ? parameter
          : typeof parameter === "object" && parameter !== null && "value" in parameter
            ? parameter.value
            : undefined;
      if (buildingType === "solarCollector" || buildingType === "robotFactory") {
        const hasConstruction = state.buildings.some(
          (building) =>
            building.type === buildingType && building.status === "construction",
        );
        if (!hasConstruction) {
          const selected = selectNewConstructionSite(
            state,
            robot,
            buildingType,
            evaluation.rowId,
          );
          if (selected) {
            releaseReservationsByRobot(state, robot.id);
            state.map[selected.site.y][selected.site.x].reservedForConstruction = {
              buildingId: createBuildingId(buildingType, state),
              reservedByRobotIds: [robot.id],
            };
          }
        }
      }
    } else if (task.type === "mining") {
      events.push({
        tick: state.tick,
        visibility: "player",
        severity: "info",
        priority: "normal",
        category: "resource",
        code: "action.mine.started",
        message: "Mining gestartet.",
        robotId: robot.id,
        entityId: robot.id,
        details: { targetX: task.target.x, targetY: task.target.y },
        pipelineStepOrder: 8,
        sourceOrder: robotIndex,
        entitySortKey: `robot:${robot.id}`,
        localSequence: 2,
      });
    }
  });

  // Schritt 9: Score und MVP-Ziel aktualisieren.
  for (const spawned of spawnResult.spawned) {
    const firstGoal = scoreRobotSpawned(state);
    if (firstGoal) {
      events.push({
        tick: state.tick,
        visibility: "player",
        severity: "success",
        priority: "critical",
        category: "goal",
        code: "goal.mvpReached",
        message: "MVP-Ziel erreicht: Erster Iron Miner erfolgreich gespawnt.",
        robotId: spawned.robotId,
        entityId: "goal.mvp",
        pipelineStepOrder: 9,
        sourceOrder: 1,
        entitySortKey: "goal:mvp",
        localSequence: 1,
      });
    }
  }

  // Schritt 10: Events sortieren, deduplizieren, IDs vergeben, Limit anwenden.
  finalizeTickEvents(state, events);

  // Schritt 11: UI-State ist aus GameState ableitbar; keine Simulationseffekte.
  return { state, commandOutcomes };
}
