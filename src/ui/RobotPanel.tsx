// Roboterdetails nach docs/04-systems/ui-components-contract.md.
import { deriveRobotActivityState } from "../sim/diagnostics";
import type { GameState, PlayerCommand, Robot } from "../sim/types";
import { ProgramStackPanel } from "./ProgramStackPanel";

type RobotPanelProps = {
  state: GameState;
  robot: Robot;
  sendCommand: (command: PlayerCommand) => void;
  onEditProgram: (programId: string) => void;
};

export function RobotPanel({
  state,
  robot,
  sendCommand,
  onEditProgram,
}: RobotPanelProps) {
  const cargoUsed = Object.values(robot.cargo.used).reduce(
    (sum, amount) => sum + (amount ?? 0),
    0,
  );
  const batteryPercent = Math.round((robot.battery / robot.batteryMax) * 100);

  return (
    <div className="panel robot-panel">
      <h3>{robot.name}</h3>
      <ul>
        <li>Typ: {robot.type}</li>
        <li>Status: {robot.status}</li>
        <li>Aktivitaet: {deriveRobotActivityState(robot)}</li>
        <li>
          HP: {robot.hp.current}/{robot.hp.max}
        </li>
        <li>
          Batterie: {robot.battery}/{robot.batteryMax} ({batteryPercent} %)
        </li>
        <li>
          Cargo: {cargoUsed}/{robot.cargo.capacity}
          {robot.cargo.used.ironOre ? ` (Iron Ore: ${robot.cargo.used.ironOre})` : ""}
        </li>
        <li>
          Position: [{robot.x}, {robot.y}]
        </li>
        <li>Kommunikation: {robot.communicationStatus}</li>
        {robot.activeProgram && (
          <li>
            Aktives Programm:{" "}
            {robot.programStack.find(
              (program) => program.id === robot.activeProgram?.programId,
            )?.name ?? robot.activeProgram.programId}
          </li>
        )}
        {robot.activeTask && (
          <li>
            Aktueller Task: {robot.activeTask.type}
            {"remainingTicks" in robot.activeTask
              ? ` (${robot.activeTask.remainingTicks} Ticks)`
              : ""}
          </li>
        )}
      </ul>
      {robot.programStack.length > 0 && (
        <ProgramStackPanel
          state={state}
          robot={robot}
          sendCommand={sendCommand}
          onEdit={onEditProgram}
        />
      )}
    </div>
  );
}
