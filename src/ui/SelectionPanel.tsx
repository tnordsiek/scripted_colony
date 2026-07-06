// Delegiert die aktuelle Auswahl an Robot-/Building-/FieldPanel.
import type { GameState, PlayerCommand } from "../sim/types";
import { BuildingPanel } from "./BuildingPanel";
import { FieldPanel } from "./FieldPanel";
import { RobotPanel } from "./RobotPanel";

type SelectionPanelProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
  onEditProgram: (programId: string) => void;
};

export function SelectionPanel({
  state,
  sendCommand,
  onEditProgram,
}: SelectionPanelProps) {
  const selected = state.selected;
  if (!selected) {
    return <div className="panel">Keine Auswahl.</div>;
  }

  if (selected.type === "robot") {
    const robot = state.robots.find((entry) => entry.id === selected.id);
    if (!robot) {
      return <div className="panel">Roboter nicht gefunden.</div>;
    }
    return (
      <RobotPanel
        state={state}
        robot={robot}
        sendCommand={sendCommand}
        onEditProgram={onEditProgram}
      />
    );
  }

  if (selected.type === "building") {
    const building = state.buildings.find((entry) => entry.id === selected.id);
    if (!building) {
      return <div className="panel">Gebaeude nicht gefunden.</div>;
    }
    return <BuildingPanel state={state} building={building} sendCommand={sendCommand} />;
  }

  return <FieldPanel state={state} x={selected.x} y={selected.y} />;
}
