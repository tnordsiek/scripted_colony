// PlayerCommand-Verarbeitung nach docs/03-technical/player-command-handling.md
// und canonical-data-model.md. Rejected Commands mutieren keinen Spielstate.
import {
  EXP1_STEEL_RECIPE_INPUT_IRON_ORE,
  EXP1_STEEL_RECIPE_POWER_REQUIRED,
  EXP1_STEEL_RECIPE_TICKS,
  EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES,
  EXP2_TRANSPORT_ROBOT_PRODUCTION_POWER,
  EXP2_TRANSPORT_ROBOT_PRODUCTION_TICKS,
  MVP_IRON_MINER_PRODUCTION,
} from "./constants";
import { makeCommandSortKey, type GameEventCandidate } from "./events";
import { createProductionTaskId, createSteelProductionTaskId } from "./ids";
import { createProgramInstanceFromTemplate } from "./programs";
import { validateUpdateProgram } from "./programEditing";
import {
  areExecutionLimitsUnlocked,
  getActiveResearchProject,
  hasActiveResearchCenter,
  isLogisticsUnlocked,
  isTemplateUnlocked,
} from "./research";
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
      const validationError = validateUpdateProgram(found.program, command.program, {
        allowExecutionLimitEdit: areExecutionLimitsUnlocked(state),
      });
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

    // --- Expansion 1 -------------------------------------------------------

    case "selectResearchProject": {
      if (!hasActiveResearchCenter(state)) {
        return reject("researchCenterMissing");
      }
      const project = getActiveResearchProject(command.projectId);
      if (!project) {
        return reject("unknownResearchProject");
      }
      if (state.research.completedProjects.includes(command.projectId)) {
        return reject("researchProjectAlreadyCompleted");
      }
      const prerequisitesMet = project.prerequisites.every((prerequisite) =>
        state.research.completedProjects.includes(prerequisite),
      );
      if (!prerequisitesMet) {
        return reject("researchPrerequisiteMissing");
      }
      state.research.activeProjectId = command.projectId;
      state.research.activeProjectSelectedTick = state.tick;
      return ACCEPTED;
    }

    case "startSteelProduction": {
      const building = state.buildings.find(
        (entry) => entry.id === command.buildingId,
      );
      if (!building) {
        return reject("buildingNotFound");
      }
      if (building.type !== "steelworks") {
        return reject("buildingIsNotSteelworks");
      }
      if (building.status !== "active") {
        return reject("buildingNotActive");
      }
      if (!building.isEnabled) {
        return reject("buildingDisabled");
      }
      if (building.steelProductionTask) {
        return reject("steelProductionAlreadyRunning");
      }
      const starter = state.robots.find((robot) => robot.type === "starterRobot");
      if (!starter || (starter.status !== "active" && starter.status !== "stasis")) {
        return reject("starterRobotMissing");
      }
      const availableOre = starter.cargo.used.ironOre ?? 0;
      if (availableOre < EXP1_STEEL_RECIPE_INPUT_IRON_ORE) {
        return reject("notEnoughIronOreInStarterCargo");
      }

      starter.cargo.used.ironOre = availableOre - EXP1_STEEL_RECIPE_INPUT_IRON_ORE;
      building.steelProductionTask = {
        id: createSteelProductionTaskId(building.id, state),
        buildingId: building.id,
        cost: { ironOre: EXP1_STEEL_RECIPE_INPUT_IRON_ORE },
        costPaid: true,
        totalTicks: EXP1_STEEL_RECIPE_TICKS,
        remainingTicks: EXP1_STEEL_RECIPE_TICKS,
        powerRequired: EXP1_STEEL_RECIPE_POWER_REQUIRED,
        status: "inProgress",
        createdTick: state.tick,
        startedTick: state.tick,
      };
      return ACCEPTED;
    }

    case "addProgramFromTemplate": {
      const robot = findRobot(state, command.robotId);
      if (!robot) {
        return reject("robotNotFound");
      }
      if (!isTemplateUnlocked(state, command.templateId)) {
        return reject("templateNotUnlocked");
      }
      if (robot.programStack.some((program) => program.templateId === command.templateId)) {
        return reject("duplicateProgram");
      }
      const instance = createProgramInstanceFromTemplate(command.templateId);
      // Direkt ueber dem ersten Erkundungsprogramm einfuegen (Bau vor Erkundung,
      // wie im MVP-Startstack); sonst ueber dem Stasis-Laden-Programm.
      const exploreIndex = robot.programStack.findIndex(
        (program) => program.templateId === "template.exploreNearby",
      );
      if (exploreIndex >= 0) {
        robot.programStack.splice(exploreIndex, 0, instance);
      } else {
        const lastIndex = robot.programStack.length - 1;
        if (lastIndex >= 0 && robot.programStack[lastIndex]?.locked) {
          robot.programStack.splice(lastIndex, 0, instance);
        } else {
          robot.programStack.push(instance);
        }
      }
      return ACCEPTED;
    }

    case "startTransportRobotProduction": {
      if (!isLogisticsUnlocked(state)) {
        return reject("templateNotUnlocked");
      }
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
      const availableSteel = starter.cargo.used.steelPlates ?? 0;
      if (availableSteel < EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES) {
        return reject("notEnoughSteelPlatesInStarterCargo");
      }

      starter.cargo.used.steelPlates =
        availableSteel - EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES;
      if (starter.cargo.used.steelPlates === 0) {
        delete starter.cargo.used.steelPlates;
      }
      building.productionTask = {
        id: createProductionTaskId(building.id, "transportRobot", state),
        buildingId: building.id,
        robotType: "transportRobot",
        cost: { steelPlates: EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES },
        costPaid: true,
        totalTicks: EXP2_TRANSPORT_ROBOT_PRODUCTION_TICKS,
        remainingTicks: EXP2_TRANSPORT_ROBOT_PRODUCTION_TICKS,
        powerRequired: EXP2_TRANSPORT_ROBOT_PRODUCTION_POWER,
        status: "inProgress",
        createdTick: state.tick,
        startedTick: state.tick,
      };
      return ACCEPTED;
    }

    case "removeProgram": {
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
      robot.programStack.splice(found.index, 1);
      if (robot.activeProgram?.programId === command.programId) {
        robot.activeProgram = undefined;
      }
      return ACCEPTED;
    }

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
        command.type === "startTransportRobotProduction" &&
        result.reason === "notEnoughSteelPlatesInStarterCargo"
      ) {
        const starter = state.robots.find((robot) => robot.type === "starterRobot");
        events.push({
          tick: state.tick,
          visibility: "player",
          severity: "warning",
          priority: "high",
          category: "production",
          code: "production.transportRobot.blocked.notEnoughSteel",
          message:
            "Transporter-Produktion blockiert: Nicht genug Steel Plates im Startroboter-Cargo.",
          buildingId: command.buildingId,
          entityId: command.buildingId,
          details: {
            reason: "notEnoughSteelPlatesInStarterCargo",
            requiredSteel: EXP2_TRANSPORT_ROBOT_COST_STEEL_PLATES,
            availableSteel: starter?.cargo.used.steelPlates ?? 0,
          },
          pipelineStepOrder: 1,
          sourceOrder: index,
          entitySortKey: makeCommandSortKey(index),
          localSequence: 1,
        });
      } else if (
        command.type === "startSteelProduction" &&
        result.reason === "notEnoughIronOreInStarterCargo"
      ) {
        const starter = state.robots.find((robot) => robot.type === "starterRobot");
        events.push({
          tick: state.tick,
          visibility: "player",
          severity: "warning",
          priority: "high",
          category: "production",
          code: "production.steelPlates.blocked.notEnoughOre",
          message: "Stahlverarbeitung blockiert: Nicht genug Iron Ore im Startroboter-Cargo.",
          buildingId: command.buildingId,
          entityId: command.buildingId,
          details: {
            reason: "notEnoughIronOreInStarterCargo",
            requiredOre: EXP1_STEEL_RECIPE_INPUT_IRON_ORE,
            availableOre: starter?.cargo.used.ironOre ?? 0,
          },
          pipelineStepOrder: 1,
          sourceOrder: index,
          entitySortKey: makeCommandSortKey(index),
          localSequence: 1,
        });
      } else if (
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
    } else if (command.type === "selectResearchProject") {
      events.push({
        tick: state.tick,
        visibility: "player",
        severity: "info",
        priority: "normal",
        category: "system",
        code: "research.projectSelected",
        message: `Forschungsprojekt gewaehlt: ${command.projectId}.`,
        entityId: `research.${command.projectId}`,
        details: { projectId: command.projectId },
        pipelineStepOrder: 1,
        sourceOrder: index,
        entitySortKey: makeCommandSortKey(index),
        localSequence: 1,
      });
    } else if (command.type === "startSteelProduction") {
      const building = state.buildings.find(
        (entry) => entry.id === command.buildingId,
      );
      events.push({
        tick: state.tick,
        visibility: "player",
        severity: "info",
        priority: "normal",
        category: "production",
        code: "production.steelPlates.started",
        message: "Stahlverarbeitung gestartet (2 Iron Ore -> 1 Steel Plate).",
        buildingId: command.buildingId,
        entityId: command.buildingId,
        details: {
          steelTaskId: building?.steelProductionTask?.id ?? "",
          remainingTicks: building?.steelProductionTask?.remainingTicks ?? 0,
        },
        pipelineStepOrder: 1,
        sourceOrder: index,
        entitySortKey: makeCommandSortKey(index),
        localSequence: 1,
      });
    } else if (command.type === "startTransportRobotProduction") {
      const building = state.buildings.find(
        (entry) => entry.id === command.buildingId,
      );
      events.push({
        tick: state.tick,
        visibility: "player",
        severity: "info",
        priority: "normal",
        category: "production",
        code: "production.transportRobot.started",
        message: "Transporter-Produktion gestartet (4 Steel Plates, 20 Ticks).",
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
