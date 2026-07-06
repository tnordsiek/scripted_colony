// Programmtemplates, Bedingungs-Auswertung und Stack-Logik nach
// docs/02-mvp/mvp-template-spec.md, docs/03-technical/visual-programming-data-model.md
// und docs/03-technical/program-stack-rules.md.
import {
  MVP_STARTER_PROGRAM_ROW_IDS,
  MVP_STASIS_ENTER_BATTERY,
  MVP_STASIS_TARGET_BATTERY,
} from "./constants";
import { computeEnergySnapshot } from "./energy";
import { getOrthogonalNeighbors, isFieldPassable, isInsideMap } from "./pathfinding";
import type {
  ActionExecutabilityResult,
  BuildingQuery,
  ConditionExpression,
  Field,
  FieldTypeQuery,
  GameState,
  ProgramAction,
  ProgramEvaluationResult,
  ProgramEvaluationTrace,
  ProgramInstance,
  ProgramRow,
  ProgramTemplateDefinition,
  ProgramTemplateId,
  Robot,
  SensorCondition,
} from "./types";

// ---------------------------------------------------------------------------
// Kanonische MVP-Templates
// ---------------------------------------------------------------------------

const ROBOT_STATUS_STASIS_CONDITION: SensorCondition = {
  type: "sensor",
  sensorId: "sensor.robotStatus",
  operator: "eq",
  value: { type: "robotStatus", value: "stasis" },
};

function buildingExists(query: BuildingQuery): SensorCondition {
  return {
    type: "sensor",
    sensorId: "sensor.buildingExists",
    operator: "exists",
    value: { type: "buildingQuery", value: query },
  };
}

function neighborHasIronOre(): SensorCondition {
  return {
    type: "sensor",
    sensorId: "sensor.neighborFieldType",
    operator: "hasType",
    value: { type: "fieldType", value: "ironOre" },
  };
}

export const MVP_PROGRAM_TEMPLATES: ProgramTemplateDefinition[] = [
  {
    id: "template.mineIronOre",
    name: "Iron Ore abbauen",
    description: "Baut angrenzendes Iron Ore ab, solange Cargo Platz hat.",
    defaultEnabled: true,
    defaultStackPosition: 1,
    rows: [
      {
        id: MVP_STARTER_PROGRAM_ROW_IDS.mineIronOre,
        if: {
          type: "group",
          operator: "AND",
          conditions: [
            neighborHasIronOre(),
            {
              type: "sensor",
              sensorId: "sensor.cargoFill",
              operator: "lt",
              value: { type: "percentage", value: 100 },
            },
          ],
        },
        then: {
          actionId: "action.mineResource",
          parameters: { resourceType: "ironOre" },
        },
        stop: {
          operator: "OR",
          conditions: [
            {
              type: "sensor",
              sensorId: "sensor.cargoFill",
              operator: "gte",
              value: { type: "percentage", value: 100 },
            },
            ROBOT_STATUS_STASIS_CONDITION,
          ],
        },
      },
    ],
  },
  {
    id: "template.buildSolarCollector",
    name: "Solar Collector bauen",
    description: "Baut oder vollendet einen Solar Collector.",
    defaultEnabled: true,
    defaultStackPosition: 2,
    rows: [
      {
        id: MVP_STARTER_PROGRAM_ROW_IDS.buildSolarCollector,
        if: {
          type: "group",
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "solarCollector", status: "construction" }),
            {
              type: "group",
              operator: "AND",
              conditions: [
                {
                  type: "sensor",
                  sensorId: "sensor.cargoResourceAmount",
                  operator: "gte",
                  value: { type: "number", value: 5 },
                },
                {
                  type: "not",
                  condition: buildingExists({ buildingType: "solarCollector" }),
                },
              ],
            },
          ],
        },
        then: {
          actionId: "action.buildBuilding",
          parameters: { buildingType: "solarCollector" },
        },
        stop: {
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "solarCollector", status: "active" }),
            ROBOT_STATUS_STASIS_CONDITION,
          ],
        },
      },
    ],
  },
  {
    id: "template.buildRobotFactory",
    name: "Roboterfabrik bauen",
    description: "Baut die Roboterfabrik, sobald ein Solar Collector aktiv ist.",
    defaultEnabled: true,
    defaultStackPosition: 3,
    rows: [
      {
        id: MVP_STARTER_PROGRAM_ROW_IDS.buildRobotFactory,
        if: {
          type: "group",
          operator: "AND",
          conditions: [
            buildingExists({ buildingType: "solarCollector", status: "active" }),
            {
              type: "group",
              operator: "OR",
              conditions: [
                buildingExists({ buildingType: "robotFactory", status: "construction" }),
                {
                  type: "group",
                  operator: "AND",
                  conditions: [
                    {
                      type: "sensor",
                      sensorId: "sensor.cargoResourceAmount",
                      operator: "gte",
                      value: { type: "number", value: 5 },
                    },
                    {
                      type: "not",
                      condition: buildingExists({ buildingType: "robotFactory" }),
                    },
                  ],
                },
              ],
            },
          ],
        },
        then: {
          actionId: "action.buildBuilding",
          parameters: { buildingType: "robotFactory" },
        },
        stop: {
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "robotFactory", status: "active" }),
            ROBOT_STATUS_STASIS_CONDITION,
          ],
        },
      },
    ],
  },
  {
    id: "template.exploreNearby",
    name: "Erkunden",
    description: "Erkundet die Karte auf der Suche nach Iron Ore.",
    defaultEnabled: true,
    defaultStackPosition: 4,
    rows: [
      {
        id: MVP_STARTER_PROGRAM_ROW_IDS.exploreNearby,
        if: {
          type: "not",
          condition: neighborHasIronOre(),
        },
        then: {
          actionId: "action.scoutNearby",
          parameters: {
            targetFieldType: { type: "fieldType", value: "ironOre" },
          },
        },
        stop: {
          operator: "OR",
          conditions: [neighborHasIronOre(), ROBOT_STATUS_STASIS_CONDITION],
        },
      },
    ],
  },
  {
    id: "template.stasisCharge",
    name: "Stasis-Laden",
    description: "Harte Energiesicherung: laedt in Stasis bis 50 Batterie.",
    defaultEnabled: true,
    defaultStackPosition: 5,
    locked: true,
    rows: [
      {
        id: MVP_STARTER_PROGRAM_ROW_IDS.stasisCharge,
        if: {
          type: "sensor",
          sensorId: "sensor.battery",
          operator: "lte",
          value: { type: "percentage", value: MVP_STASIS_ENTER_BATTERY },
        },
        then: {
          actionId: "action.stasisCharge",
          parameters: {},
        },
        stop: {
          operator: "OR",
          conditions: [
            {
              type: "sensor",
              sensorId: "sensor.battery",
              operator: "gte",
              value: { type: "percentage", value: MVP_STASIS_TARGET_BATTERY },
            },
          ],
        },
      },
    ],
  },
  {
    id: "template.buildAiResearchCenter",
    name: "Forschungszentrum bauen",
    description: "Baut das KI-Forschungszentrum (Expansion 1).",
    defaultEnabled: true,
    defaultStackPosition: 6,
    rows: [
      {
        id: "row.starter.buildAiResearchCenter.main",
        if: {
          type: "group",
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "aiResearchCenter", status: "construction" }),
            {
              type: "group",
              operator: "AND",
              conditions: [
                {
                  type: "sensor",
                  sensorId: "sensor.cargoResourceAmount",
                  operator: "gte",
                  value: {
                    type: "resourceAmount",
                    value: { resourceType: "ironOre", amount: 10 },
                  },
                },
                {
                  type: "not",
                  condition: buildingExists({ buildingType: "aiResearchCenter" }),
                },
              ],
            },
          ],
        },
        then: {
          actionId: "action.buildBuilding",
          parameters: { buildingType: "aiResearchCenter" },
        },
        stop: {
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "aiResearchCenter", status: "active" }),
            ROBOT_STATUS_STASIS_CONDITION,
          ],
        },
      },
    ],
  },
  {
    id: "template.buildSteelworks",
    name: "Stahlwerk bauen",
    description: "Baut das Stahlwerk (Expansion 1, nach Metallverarbeitung I).",
    defaultEnabled: true,
    defaultStackPosition: 7,
    rows: [
      {
        id: "row.starter.buildSteelworks.main",
        if: {
          type: "group",
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "steelworks", status: "construction" }),
            {
              type: "group",
              operator: "AND",
              conditions: [
                {
                  type: "sensor",
                  sensorId: "sensor.cargoResourceAmount",
                  operator: "gte",
                  value: {
                    type: "resourceAmount",
                    value: { resourceType: "ironOre", amount: 8 },
                  },
                },
                {
                  type: "not",
                  condition: buildingExists({ buildingType: "steelworks" }),
                },
              ],
            },
          ],
        },
        then: {
          actionId: "action.buildBuilding",
          parameters: { buildingType: "steelworks" },
        },
        stop: {
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "steelworks", status: "active" }),
            ROBOT_STATUS_STASIS_CONDITION,
          ],
        },
      },
    ],
  },
  {
    id: "template.buildEnergyStorage",
    name: "Energiespeicher bauen",
    description: "Baut den Energiespeicher (Expansion 1, nach Energiepuffer I).",
    defaultEnabled: true,
    defaultStackPosition: 8,
    rows: [
      {
        id: "row.starter.buildEnergyStorage.main",
        if: {
          type: "group",
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "energyStorage", status: "construction" }),
            {
              type: "group",
              operator: "AND",
              conditions: [
                {
                  type: "sensor",
                  sensorId: "sensor.cargoResourceAmount",
                  operator: "gte",
                  value: {
                    type: "resourceAmount",
                    value: { resourceType: "steelPlates", amount: 4 },
                  },
                },
                {
                  type: "not",
                  condition: buildingExists({ buildingType: "energyStorage" }),
                },
              ],
            },
          ],
        },
        then: {
          actionId: "action.buildBuilding",
          parameters: { buildingType: "energyStorage" },
        },
        stop: {
          operator: "OR",
          conditions: [
            buildingExists({ buildingType: "energyStorage", status: "active" }),
            ROBOT_STATUS_STASIS_CONDITION,
          ],
        },
      },
    ],
  },
];

const STARTER_INSTANCE_IDS: Record<ProgramTemplateId, string> = {
  "template.mineIronOre": "program.starter.mineIronOre",
  "template.buildSolarCollector": "program.starter.buildSolarCollector",
  "template.buildRobotFactory": "program.starter.buildRobotFactory",
  "template.exploreNearby": "program.starter.exploreNearby",
  "template.stasisCharge": "program.starter.stasisCharge",
  "template.secureEnergy": "program.starter.secureEnergy",
  "template.buildAiResearchCenter": "program.starter.buildAiResearchCenter",
  "template.buildSteelworks": "program.starter.buildSteelworks",
  "template.buildEnergyStorage": "program.starter.buildEnergyStorage",
};

export function getProgramTemplate(
  templateId: ProgramTemplateId,
): ProgramTemplateDefinition {
  const template = MVP_PROGRAM_TEMPLATES.find((entry) => entry.id === templateId);
  if (!template) {
    throw new Error(`Unknown MVP program template: ${templateId}`);
  }
  return template;
}

function cloneRows(rows: ProgramRow[]): ProgramRow[] {
  return JSON.parse(JSON.stringify(rows)) as ProgramRow[];
}

export function createProgramInstanceFromTemplate(
  templateId: ProgramTemplateId,
): ProgramInstance {
  const template = getProgramTemplate(templateId);
  return {
    id: STARTER_INSTANCE_IDS[templateId],
    templateId,
    name: template.name,
    enabled: template.defaultEnabled,
    rows: cloneRows(template.rows),
    ...(template.executionLimit ? { executionLimit: template.executionLimit } : {}),
    ...(template.locked ? { locked: true } : {}),
  };
}

// Verbindlicher MVP-Startstack (initial-game-state.md).
export function createStarterProgramStack(): ProgramInstance[] {
  return [
    createProgramInstanceFromTemplate("template.mineIronOre"),
    createProgramInstanceFromTemplate("template.buildSolarCollector"),
    createProgramInstanceFromTemplate("template.buildRobotFactory"),
    createProgramInstanceFromTemplate("template.exploreNearby"),
    createProgramInstanceFromTemplate("template.stasisCharge"),
  ];
}

// ---------------------------------------------------------------------------
// Sensor-/Bedingungs-Auswertung
// ---------------------------------------------------------------------------

function fieldMatchesQuery(
  state: GameState,
  field: Field,
  query: FieldTypeQuery,
): boolean {
  switch (query) {
    case "ironOre":
      return field.resource?.type === "ironOre" && field.resource.amount > 0;
    case "solarCollector":
    case "robotFactory": {
      if (!field.buildingId) {
        return false;
      }
      const building = state.buildings.find((entry) => entry.id === field.buildingId);
      return building?.type === query;
    }
    case "building":
      return field.buildingId !== undefined;
    case "freeField":
      return (
        isFieldPassable(field) &&
        !state.robots.some((robot) => robot.x === field.x && robot.y === field.y)
      );
    case "blockedField":
      return (
        !isFieldPassable(field) ||
        state.robots.some((robot) => robot.x === field.x && robot.y === field.y)
      );
    case "chargingField":
      return false; // Future, nicht MVP-aktiv
  }
}

function anyNeighborMatches(
  state: GameState,
  robot: Robot,
  query: FieldTypeQuery,
): boolean {
  return getOrthogonalNeighbors({ x: robot.x, y: robot.y }).some(
    (coord) =>
      isInsideMap(state.map, coord) &&
      fieldMatchesQuery(state, state.map[coord.y][coord.x], query),
  );
}

function anyVisibleFieldMatches(state: GameState, query: FieldTypeQuery): boolean {
  for (const row of state.map) {
    for (const field of row) {
      if (field.visibility === "visible" && fieldMatchesQuery(state, field, query)) {
        return true;
      }
    }
  }
  return false;
}

function buildingQueryMatches(state: GameState, query: BuildingQuery): boolean {
  return state.buildings.some((building) => {
    if (building.type !== query.buildingType) {
      return false;
    }
    if (query.status !== undefined) {
      return building.status === query.status;
    }
    // Ohne Status zaehlen construction und active gleichermassen als existierend.
    return building.status !== "destroyed";
  });
}

function compareNumeric(operator: string, left: number, right: number): boolean {
  switch (operator) {
    case "lt":
      return left < right;
    case "lte":
      return left <= right;
    case "gt":
      return left > right;
    case "gte":
      return left >= right;
    case "eq":
      return left === right;
    case "neq":
      return left !== right;
    default:
      return false;
  }
}

function cargoUsedTotal(robot: Robot): number {
  return Object.values(robot.cargo.used).reduce(
    (sum, amount) => sum + (amount ?? 0),
    0,
  );
}

function evaluateSensorCondition(
  state: GameState,
  robot: Robot,
  condition: SensorCondition,
): boolean {
  const { sensorId, operator, value } = condition;

  switch (sensorId) {
    case "sensor.battery": {
      const compareTo = value.type === "percentage" || value.type === "number" ? value.value : 0;
      return compareNumeric(operator, robot.battery, compareTo);
    }
    case "sensor.cargoFill": {
      const fillPercent = (cargoUsedTotal(robot) / robot.cargo.capacity) * 100;
      const compareTo = value.type === "percentage" || value.type === "number" ? value.value : 0;
      return compareNumeric(operator, fillPercent, compareTo);
    }
    case "sensor.cargoResourceAmount": {
      // number/percentage: Rueckwaertskompatibel Iron Ore;
      // resourceAmount (Expansion 1): konkrete Ressource mit Schwellwert.
      if (value.type === "resourceAmount") {
        const amount = robot.cargo.used[value.value.resourceType] ?? 0;
        return compareNumeric(operator, amount, value.value.amount);
      }
      const amount = robot.cargo.used.ironOre ?? 0;
      const compareTo = value.type === "number" || value.type === "percentage" ? value.value : 0;
      return compareNumeric(operator, amount, compareTo);
    }
    case "sensor.neighborFieldType": {
      if (value.type !== "fieldType") {
        return false;
      }
      const matches = anyNeighborMatches(state, robot, value.value);
      return operator === "notHasType" ? !matches : matches;
    }
    case "sensor.visibleFieldType": {
      if (value.type !== "fieldType") {
        return false;
      }
      const matches = anyVisibleFieldMatches(state, value.value);
      return operator === "notHasType" ? !matches : matches;
    }
    case "sensor.buildingExists": {
      if (value.type !== "buildingQuery") {
        return false;
      }
      const exists = buildingQueryMatches(state, value.value);
      return operator === "notExists" ? !exists : exists;
    }
    case "sensor.buildingStatus": {
      if (value.type !== "buildingStatus") {
        return false;
      }
      const exists = state.buildings.some(
        (building) => building.status === value.value,
      );
      return operator === "neq" || operator === "isNot" ? !exists : exists;
    }
    case "sensor.freePower": {
      const snapshot = computeEnergySnapshot(state);
      const compareTo = value.type === "power" || value.type === "number" ? value.value : 0;
      return compareNumeric(operator, snapshot.freePower, compareTo);
    }
    case "sensor.outputFieldAvailable": {
      if (value.type !== "boolean") {
        return false;
      }
      const factory = state.buildings.find(
        (building) => building.type === "robotFactory",
      );
      const available =
        factory !== undefined &&
        getOrthogonalNeighbors({ x: factory.x, y: factory.y }).some(
          (coord) =>
            isInsideMap(state.map, coord) &&
            isFieldPassable(state.map[coord.y][coord.x]) &&
            !state.robots.some((robot) => robot.x === coord.x && robot.y === coord.y),
        );
      const result = available === value.value;
      return operator === "neq" ? !result : result;
    }
    case "sensor.robotStatus": {
      if (value.type !== "robotStatus") {
        return false;
      }
      const matches = robot.status === value.value;
      return operator === "neq" || operator === "isNot" ? !matches : matches;
    }
  }
}

export function evaluateCondition(
  state: GameState,
  robot: Robot,
  condition: ConditionExpression,
): boolean {
  switch (condition.type) {
    case "sensor":
      return evaluateSensorCondition(state, robot, condition);
    case "not":
      return !evaluateCondition(state, robot, condition.condition);
    case "group": {
      if (condition.operator === "AND") {
        return condition.conditions.every((entry) =>
          evaluateCondition(state, robot, entry),
        );
      }
      return condition.conditions.some((entry) =>
        evaluateCondition(state, robot, entry),
      );
    }
  }
}

export function evaluateStopConditions(
  state: GameState,
  robot: Robot,
  row: ProgramRow,
): boolean {
  return row.stop.conditions.some((condition) =>
    evaluateCondition(state, robot, condition),
  );
}

// ---------------------------------------------------------------------------
// Stack-Auswertung (zweistufig, top-down)
// ---------------------------------------------------------------------------

function executionLimitReached(program: ProgramInstance): boolean {
  const limit = program.executionLimit;
  if (!limit || limit.type === "unlimited") {
    return false;
  }
  const completed = program.executionState?.completedExecutions ?? 0;
  if (limit.type === "once") {
    return completed >= 1;
  }
  return completed >= limit.maxExecutions;
}

export type CanExecuteAction = (
  state: GameState,
  robot: Robot,
  action: ProgramAction,
  rowId?: string,
  programId?: string,
) => ActionExecutabilityResult;

export function evaluateProgramStack(
  state: GameState,
  robot: Robot,
  canExecuteAction: CanExecuteAction,
): ProgramEvaluationResult {
  const traces: ProgramEvaluationTrace[] = [];

  for (const program of robot.programStack) {
    if (!program.enabled) {
      traces.push({
        programId: program.id,
        result: "skipped",
        reason: "programDisabled",
      });
      continue;
    }

    if (executionLimitReached(program)) {
      traces.push({
        programId: program.id,
        result: "executionLimitReached",
        reason: "executionLimitReached",
      });
      continue;
    }

    for (const row of program.rows) {
      if (!evaluateCondition(state, robot, row.if)) {
        traces.push({
          programId: program.id,
          rowId: row.id,
          result: "conditionFalse",
          reason: "conditionFalse",
        });
        continue;
      }

      const executability = canExecuteAction(state, robot, row.then, row.id, program.id);
      if (executability.type === "notExecutable") {
        traces.push({
          programId: program.id,
          rowId: row.id,
          result: "actionNotExecutable",
          reason: "actionNotExecutable",
        });
        continue;
      }

      traces.push({
        programId: program.id,
        rowId: row.id,
        result: "selected",
      });

      return {
        type: "startRow",
        programId: program.id,
        rowId: row.id,
        action: row.then,
      };
    }
  }

  return { type: "noExecutableProgram", reasons: traces };
}
