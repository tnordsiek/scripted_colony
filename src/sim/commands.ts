// PlayerCommand-Verarbeitung nach docs/03-technical/player-command-handling.md
// und canonical-data-model.md. Rejected Commands mutieren keinen Spielstate.
import { MVP_IRON_MINER_PRODUCTION } from "./constants";
import { makeCommandSortKey, type GameEventCandidate } from "./events";
import { createProductionTaskId } from "./ids";
import { createProgramInstanceFromTemplate } from "./programs";
import { validateUpdateProgram } from "./programEditing";
import type {
  CommandRejectionReason,
  CommandResult,
  GameState,
  PlayerCommand,
  ProgramInstance,
  Robot,
} from "./types";

function reject(reason: CommandRejectionReason): CommandResult {
  return { type: "rejected", reason };
}

const ACCEPTED: CommandResult = { type: "accepted" };

function findRobot(state: GameState, robotId: string): Robot | undefined {
  return state.robots.find((robot) => robot.id === robotId);
}

function findProgram(
  robot: Robot,
  programId: string,
): { program: ProgramInstance; index: number } | undefined {
  const index = robot.programStack.findIndex((program) => program.id === programId);
  if (index === -1) {
    return undefined;
  }
  return { program: robot.programStack[index], index };
}

function applySingleCommand(state: GameState, command: PlayerCommand): CommandResult {
  switch (command.type) {
    case "pause":
      state.isPaused = true;
      return ACCEPTED;

    case "resume":
      state.isPaused = false;
      return ACCEPTED;

    case "setSpeed":
      if (command.speed !== 1 && command.speed !== 2 && command.speed !== 4) {
        return reject("invalidSpeed");
      }
      state.speed = command.speed;
      return ACCEPTED;

    case "selectRobot": {
      if (!findRobot(state, command.robotId)) {
        return reject("robotNotFound");
      }
      state.selected = { type: "robot", id: command.robotId };
      return ACCEPTED;
    }

    case "selectBuilding": {
      if (!state.buildings.some((building) => building.id === command.buildingId)) {
        return reject("buildingNotFound");
      }
      state.selected = { type: "building", id: command.buildingId };
      return ACCEPTED;
    }

    case "selectField": {
      const height = state.map.length;
      const width = state.map[0]?.length ?? 0;
      if (
        !Number.isInteger(command.x) ||
        !Number.isInteger(command.y) ||
        command.x < 0 ||
        command.y < 0 ||
        command.x >= width ||
        command.y >= height
      ) {
        return reject("fieldOutOfBounds");
      }
      state.selected = { type: "field", x: command.x, y: command.y };
      return ACCEPTED;
    }

    case "toggleProgramEnabled": {
      const robot = findRobot(state, command.robotId);
      if (!robot) {
        return reject("robotNotFound");
      }
      const found = findProgram(robot, command.programId);
      if (!found) {
        return reject("programNotFound");
      }
      if (found.program.locked) {
        return reject("programLocked");
      }
      found.program.enabled = !found.program.enabled;
      return ACCEPTED;
    }

    case "moveProgramUp": {
      const robot = findRobot(state, command.robotId);
      if (!robot) {
        return reject("robotNotFound");
      }
      const found = findProgram(robot, command.programId);
      if (!found) {
        return reject("programNotFound");
      }
      if (found.program.locked) {
        return reject("programLocked");
      }
      if (found.index === 0) {
        return reject("programAlreadyFirst");
      }
      const stack = robot.programStack;
      [stack[found.index - 1], stack[found.index]] = [
        stack[found.index],
        stack[found.index - 1],
      ];
      return ACCEPTED;
    }

    case "moveProgramDown": {
      const robot = findRobot(state, command.robotId);
      if (!robot) {
        return reject("robotNotFound");
      }
      const found = findProgram(robot, command.programId);
      if (!found) {
        return reject("programNotFound");
      }
      if (found.program.locked) {
        return reject("programLocked");
      }
      const stack = robot.programStack;
      // Stasis-Laden bleibt immer letzter Eintrag: unter das locked-Programm
      // darf nicht getauscht werden.
      const lastMovableIndex = stack.length - 1 - (stack[stack.length - 1]?.locked ? 1 : 0);
      if (found.index >= lastMovableIndex) {
        return reject("programAlreadyLast");
      }
      [stack[found.index], stack[found.index + 1]] = [
        stack[found.index + 1],
        stack[found.index],
      ];
      return ACCEPTED;
    }

    case "updateProgram": {
      const robot = findRobot(state, command.robotId);
      if (!robot) {
        return reject("robotNotFound");
      }
      const found = findProgram(robot, command.program.id);
      if (!found) {
        return reject("programNotFound");
      }
      const validationError = validateUpdateProgram(found.program, command.program);
      if (validationError) {
        return reject(validationError);
      }
      robot.programStack[found.index] = {
        ...command.program,
        ...(found.program.executionState
          ? { executionState: found.program.executionState }
          : {}),
      };
      return ACCEPTED;
    }

    case "resetProgramToTemplate": {
      const robot = findRobot(state, command.robotId);
      if (!robot) {
        return reject("robotNotFound");
      }
      const found = findProgram(robot, command.programId);
      if (!found) {
        return reject("programNotFound");
      }
      if (found.program.locked) {
        return reject("programLocked");
      }
      robot.programStack[found.index] = createProgramInstanceFromTemplate(
        found.program.templateId,
      );
      return ACCEPTED;
    }

    case "startIronMinerProduction": {
      const building = state.buildings.find(
        (entry) => entry.id === command.buildingId,
      );
      if (!building) {
        return reject("buildingNotFound");
      }
      if (building.type !== "robotFactory") {
        return reject("buildingIsNotRobotFactory");
      }
      if (building.status !== "active") {
        return reject("buildingNotActive");
      }
      if (!building.isEnabled) {
        return reject("buildingDisabled");
      }
      if (building.productionTask) {
        return reject("productionAlreadyRunning");
      }
      const starter = state.robots.find((robot) => robot.type === "starterRobot");
      if (!starter || (starter.status !== "active" && starter.status !== "stasis")) {
        return reject("starterRobotMissing");
      }
      if (starter.communicationStatus !== "connected") {
        return reject("starterRobotNotConnected");
      }
      const requiredOre = MVP_IRON_MINER_PRODUCTION.cost.ironOre;
      const availableOre = starter.cargo.used.ironOre ?? 0;
      if (availableOre < requiredOre) {
        return reject("notEnoughIronOreInStarterCargo");
      }

      // Erfolg: Kosten abziehen, ProductionTask anlegen (Timing-Vertrag).
      starter.cargo.used.ironOre = availableOre - requiredOre;
      building.productionTask = {
        id: createProductionTaskId(building.id, "ironMiner", state),
        buildingId: building.id,
        robotType: "ironMiner",
        cost: { ...MVP_IRON_MINER_PRODUCTION.cost },
        costPaid: true,
        totalTicks: MVP_IRON_MINER_PRODUCTION.totalTicks,
        remainingTicks: MVP_IRON_MINER_PRODUCTION.totalTicks,
        powerRequired: MVP_IRON_MINER_PRODUCTION.powerRequired,
        status: "inProgress",
        createdTick: state.tick,
        startedTick: state.tick,
      };
      return ACCEPTED;
    }

    case "resetRun":
      // resetRun wird in tick.ts behandelt (erzeugt neuen Startzustand).
      if (command.seed !== undefined && command.seed.trim() === "") {
        return reject("invalidSeed");
      }
      return ACCEPTED;

    default:
      return reject("invalidCommand");
  }
}

export type CommandOutcome = {
  command: PlayerCommand;
  result: CommandResult;
};

// Schritt 1 der Tick-Pipeline: Commands in Eingabereihenfolge verarbeiten.
export function applyPlayerCommands(
  state: GameState,
  commands: PlayerCommand[],
  events: GameEventCandidate[],
): CommandOutcome[] {
  const outcomes: CommandOutcome[] = [];

  commands.forEach((command, index) => {
    const result = applySingleCommand(state, command);
    outcomes.push({ command, result });

    if (result.type === "rejected") {
      if (
        command.type === "startIronMinerProduction" &&
        result.reason === "notEnoughIronOreInStarterCargo"
      ) {
        const starter = state.robots.find((robot) => robot.type === "starterRobot");
        events.push({
          tick: state.tick,
          visibility: "player",
          severity: "warning",
          priority: "high",
          category: "production",
          code: "production.ironMiner.blocked.notEnoughOre",
          message: "Produktion blockiert: Nicht genug Iron Ore im Startroboter-Cargo.",
          buildingId: command.buildingId,
          entityId: command.buildingId,
          details: {
            reason: "notEnoughIronOreInStarterCargo",
            requiredOre: MVP_IRON_MINER_PRODUCTION.cost.ironOre,
            availableOre: starter?.cargo.used.ironOre ?? 0,
          },
          pipelineStepOrder: 1,
          sourceOrder: index,
          entitySortKey: makeCommandSortKey(index),
          localSequence: 1,
        });
      } else {
        events.push({
          tick: state.tick,
          visibility: "debug",
          severity: "warning",
          priority: "normal",
          category: "system",
          code: "debug.command.rejected",
          message: `Command abgelehnt: ${command.type} (${result.reason}).`,
          entityId: `command.${command.type}`,
          details: { commandType: command.type, reason: result.reason },
          pipelineStepOrder: 1,
          sourceOrder: index,
          entitySortKey: makeCommandSortKey(index),
          localSequence: 1,
        });
      }
    } else if (command.type === "startIronMinerProduction") {
      const building = state.buildings.find(
        (entry) => entry.id === command.buildingId,
      );
      events.push({
        tick: state.tick,
        visibility: "player",
        severity: "info",
        priority: "normal",
        category: "production",
        code: "production.ironMiner.started",
        message: "Iron-Miner-Produktion gestartet.",
        buildingId: command.buildingId,
        entityId: command.buildingId,
        details: {
          productionTaskId: building?.productionTask?.id ?? "",
          remainingTicks: building?.productionTask?.remainingTicks ?? 0,
        },
        pipelineStepOrder: 1,
        sourceOrder: index,
        entitySortKey: makeCommandSortKey(index),
        localSequence: 1,
      });
    }
  });

  return outcomes;
}
