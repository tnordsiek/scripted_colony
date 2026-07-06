// Anzeige einer IF/THEN/STOP-Zeile als lesbare Projektion des Datenmodells.
import type {
  ActionParameterValue,
  ConditionExpression,
  ProgramRow,
} from "../sim/types";

const FIELD_TYPE_LABELS: Record<string, string> = {
  ironOre: "Iron Ore",
  solarCollector: "Solar Collector",
  robotFactory: "Roboterfabrik",
};

const BUILDING_LABELS: Record<string, string> = {
  solarCollector: "Solar Collector",
  robotFactory: "Roboterfabrik",
};

function describeValue(value: unknown): string {
  if (typeof value === "object" && value !== null && "value" in value) {
    const inner = (value as { value: unknown }).value;
    if (typeof inner === "string") {
      return FIELD_TYPE_LABELS[inner] ?? BUILDING_LABELS[inner] ?? inner;
    }
    if (typeof inner === "object" && inner !== null && "buildingType" in inner) {
      const query = inner as { buildingType: string; status?: string };
      const name = BUILDING_LABELS[query.buildingType] ?? query.buildingType;
      return query.status ? `${name} mit Status ${query.status}` : name;
    }
    return String(inner);
  }
  return String(value);
}

const OPERATOR_LABELS: Record<string, string> = {
  lt: "<",
  lte: "<=",
  gt: ">",
  gte: ">=",
  eq: "=",
  neq: "!=",
  hasType: "hat Typ",
  notHasType: "hat nicht Typ",
  exists: "existiert",
  notExists: "existiert nicht",
  is: "ist",
  isNot: "ist nicht",
};

const SENSOR_LABELS: Record<string, string> = {
  "sensor.battery": "Batterie",
  "sensor.cargoFill": "Cargo-Fuellstand",
  "sensor.cargoResourceAmount": "Cargo Iron Ore",
  "sensor.neighborFieldType": "Nachbarfeld",
  "sensor.visibleFieldType": "Sichtfeld",
  "sensor.buildingExists": "Gebaeude",
  "sensor.robotStatus": "Roboterstatus",
  "sensor.freePower": "freie Leistung",
  "sensor.outputFieldAvailable": "Ausgabefeld frei",
  "sensor.buildingStatus": "Gebaeudestatus",
};

export function describeCondition(condition: ConditionExpression): string {
  if (condition.type === "sensor") {
    const sensor = SENSOR_LABELS[condition.sensorId] ?? condition.sensorId;
    const operator = OPERATOR_LABELS[condition.operator] ?? condition.operator;
    return `${sensor} ${operator} ${describeValue(condition.value)}`;
  }
  if (condition.type === "not") {
    return `NICHT (${describeCondition(condition.condition)})`;
  }
  const joiner = condition.operator === "AND" ? " UND " : " ODER ";
  return condition.conditions.map(describeCondition).join(joiner);
}

const ACTION_LABELS: Record<string, string> = {
  "action.scoutNearby": "Scoute Nahfeld",
  "action.mineResource": "Baue Ressource ab",
  "action.buildBuilding": "Baue Gebaeude",
  "action.stasisCharge": "Stasis-Laden",
};

export function describeAction(
  actionId: string,
  parameters: Record<string, ActionParameterValue>,
): string {
  const label = ACTION_LABELS[actionId] ?? actionId;
  const parameterText = Object.entries(parameters)
    .map(([key, value]) => `${key}: ${describeValue(value)}`)
    .join(", ");
  return parameterText ? `${label} (${parameterText})` : label;
}

export function ProgramRowView({ row }: { row: ProgramRow }) {
  return (
    <div className="program-row">
      <div>
        <strong>WENN</strong> {describeCondition(row.if)}
      </div>
      <div>
        <strong>DANN</strong> {describeAction(row.then.actionId, row.then.parameters)}
      </div>
      <div>
        <strong>STOP</strong>{" "}
        {row.stop.conditions.map(describeCondition).join(" ODER ")}
      </div>
    </div>
  );
}
