// updateProgram-Validierung nach docs/03-technical/canonical-data-model.md
// (MVP_PROGRAM_EDIT_POLICIES) und visual-programming-data-model.md.
import { getProgramTemplate } from "./programs";
import type {
  ActionId,
  ActionParameterValue,
  CommandRejectionReason,
  ConditionExpression,
  OperatorId,
  ProgramEditPolicy,
  ProgramInstance,
  SensorId,
} from "./types";

export const MVP_PROGRAM_EDIT_POLICIES: ProgramEditPolicy[] = [
  {
    templateId: "template.mineIronOre",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      resourceType: [{ type: "resourceType", value: "ironOre" }],
    },
  },
  {
    templateId: "template.buildSolarCollector",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      buildingType: [{ type: "buildingType", value: "solarCollector" }],
    },
  },
  {
    templateId: "template.buildRobotFactory",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      buildingType: [{ type: "buildingType", value: "robotFactory" }],
    },
  },
  {
    templateId: "template.exploreNearby",
    locked: false,
    editableFields: ["name", "enabled", "row.then.parameters"],
    allowedActionParameterValues: {
      targetFieldType: [{ type: "fieldType", value: "ironOre" }],
    },
  },
  {
    templateId: "template.stasisCharge",
    locked: true,
    editableFields: [],
  },
];

const KNOWN_SENSOR_IDS: SensorId[] = [
  "sensor.battery",
  "sensor.cargoFill",
  "sensor.cargoResourceAmount",
  "sensor.neighborFieldType",
  "sensor.visibleFieldType",
  "sensor.buildingExists",
  "sensor.buildingStatus",
  "sensor.freePower",
  "sensor.outputFieldAvailable",
  "sensor.robotStatus",
];

const KNOWN_OPERATOR_IDS: OperatorId[] = [
  "lt",
  "lte",
  "gt",
  "gte",
  "eq",
  "neq",
  "hasType",
  "notHasType",
  "exists",
  "notExists",
  "is",
  "isNot",
];

// MVP-aktive Actions; action.charge ist Future und nicht editierbar/auswaehlbar.
const KNOWN_MVP_ACTION_IDS: ActionId[] = [
  "action.scoutNearby",
  "action.mineResource",
  "action.buildBuilding",
  "action.stasisCharge",
];

type StructureIssue = Extract<
  CommandRejectionReason,
  "unknownSensor" | "unknownOperator" | "invalidConditionValue"
>;

function checkCondition(condition: ConditionExpression): StructureIssue | null {
  if (condition.type === "sensor") {
    if (!KNOWN_SENSOR_IDS.includes(condition.sensorId)) {
      return "unknownSensor";
    }
    if (!KNOWN_OPERATOR_IDS.includes(condition.operator)) {
      return "unknownOperator";
    }
    if (typeof condition.value !== "object" || condition.value === null) {
      return "invalidConditionValue";
    }
    return null;
  }
  if (condition.type === "not") {
    return checkCondition(condition.condition);
  }
  for (const inner of condition.conditions) {
    const issue = checkCondition(inner);
    if (issue) {
      return issue;
    }
  }
  return null;
}

// Vergleich von Action-Parameterwerten; Kurzform ("ironOre") und Objektform
// ({ type: "resourceType", value: "ironOre" }) gelten als gleichwertig.
function parameterValueEquals(
  a: ActionParameterValue,
  b: ActionParameterValue,
): boolean {
  const normalize = (value: ActionParameterValue): string =>
    typeof value === "object" && value !== null && "value" in value
      ? JSON.stringify(value.value)
      : JSON.stringify(value);
  return normalize(a) === normalize(b);
}

export type UpdateProgramOptions = {
  // Expansion 1: nach research.basicAutomation1 duerfen Ausfuehrungslimits
  // der Bau-Templates editiert werden.
  allowExecutionLimitEdit?: boolean;
};

function isValidExecutionLimit(limit: ProgramInstance["executionLimit"]): boolean {
  if (limit === undefined) {
    return true;
  }
  if (limit.type === "unlimited" || limit.type === "once") {
    return true;
  }
  return (
    limit.type === "count" &&
    Number.isInteger(limit.maxExecutions) &&
    limit.maxExecutions >= 1 &&
    limit.maxExecutions <= 99
  );
}

export function validateUpdateProgram(
  existing: ProgramInstance,
  draft: ProgramInstance,
  options: UpdateProgramOptions = {},
): CommandRejectionReason | null {
  const policy = MVP_PROGRAM_EDIT_POLICIES.find(
    (entry) => entry.templateId === existing.templateId,
  );

  if (!policy || policy.locked || existing.locked) {
    return "programLocked";
  }

  if (draft.id !== existing.id || draft.templateId !== existing.templateId) {
    return "invalidProgramDefinition";
  }

  const limitChanged =
    JSON.stringify(draft.executionLimit ?? null) !==
    JSON.stringify(existing.executionLimit ?? null);
  if (limitChanged) {
    if (!options.allowExecutionLimitEdit) {
      return "invalidProgramDefinition";
    }
    if (!isValidExecutionLimit(draft.executionLimit)) {
      return "invalidProgramDefinition";
    }
  }

  if (draft.rows.length !== existing.rows.length) {
    return "invalidProgramDefinition";
  }

  const template = getProgramTemplate(existing.templateId);

  for (let index = 0; index < draft.rows.length; index += 1) {
    const draftRow = draft.rows[index];
    const existingRow = existing.rows[index];
    const templateRow = template.rows[index];

    if (draftRow.id !== existingRow.id) {
      return "invalidProgramDefinition";
    }
    if (draftRow.then.actionId !== templateRow.then.actionId) {
      if (!KNOWN_MVP_ACTION_IDS.includes(draftRow.then.actionId)) {
        return "unknownAction";
      }
      return "invalidProgramDefinition";
    }

    const conditionIssue =
      checkCondition(draftRow.if) ??
      draftRow.stop.conditions.map(checkCondition).find((issue) => issue !== null) ??
      null;
    if (conditionIssue) {
      return conditionIssue;
    }

    // IF/STOP-Struktur ist im MVP nicht freigegeben: muss unveraendert bleiben.
    if (
      JSON.stringify(draftRow.if) !== JSON.stringify(existingRow.if) ||
      JSON.stringify(draftRow.stop) !== JSON.stringify(existingRow.stop)
    ) {
      return "invalidProgramDefinition";
    }

    // Parameter: nur freigegebene Schluessel mit erlaubten Werten.
    const draftKeys = Object.keys(draftRow.then.parameters);
    const existingKeys = Object.keys(existingRow.then.parameters);
    if (JSON.stringify([...draftKeys].sort()) !== JSON.stringify([...existingKeys].sort())) {
      return "invalidProgramDefinition";
    }

    for (const key of draftKeys) {
      const draftValue = draftRow.then.parameters[key];
      const existingValue = existingRow.then.parameters[key];
      if (parameterValueEquals(draftValue, existingValue)) {
        continue;
      }
      if (!policy.editableFields.includes("row.then.parameters")) {
        return "invalidProgramDefinition";
      }
      const allowed = policy.allowedActionParameterValues?.[key];
      if (!allowed || !allowed.some((value) => parameterValueEquals(value, draftValue))) {
        return "invalidTemplateParameter";
      }
    }
  }

  return null;
}
