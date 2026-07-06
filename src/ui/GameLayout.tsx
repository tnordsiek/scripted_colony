// Hauptlayout: Karte links, Auswahl-/Programmbereich rechts, Steuerleiste unten.
import { useState } from "react";
import type { GameState, PlayerCommand } from "../sim/types";
import { BottomControlBar } from "./BottomControlBar";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { EventLogPanel } from "./EventLogPanel";
import { MapCanvas } from "./MapCanvas";
import { ProgramEditorPanel } from "./ProgramEditorPanel";
import { ScoreGoalPanel } from "./ScoreGoalPanel";
import { SelectionPanel } from "./SelectionPanel";

type GameLayoutProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
};

export function GameLayout({ state, sendCommand }: GameLayoutProps) {
  const [openEditorProgramId, setOpenEditorProgramId] = useState<string | undefined>();
  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState(false);

  const selected = state.selected;
  const selectedRobot =
    selected?.type === "robot"
      ? state.robots.find((robot) => robot.id === selected.id)
      : undefined;

  return (
    <div className="game-layout">
      <header className="game-header">
        <h1>Scripted Colony</h1>
        <span className="seed-display">Seed: {state.randomSeed}</span>
      </header>
      <div className="game-main">
        <div className="game-left">
          <MapCanvas state={state} sendCommand={sendCommand} />
          <EventLogPanel state={state} showDebug={diagnosticsExpanded} />
        </div>
        <div className="game-right">
          <ScoreGoalPanel state={state} />
          <SelectionPanel
            state={state}
            sendCommand={sendCommand}
            onEditProgram={setOpenEditorProgramId}
          />
          {openEditorProgramId && selectedRobot && (
            <ProgramEditorPanel
              robot={selectedRobot}
              programId={openEditorProgramId}
              sendCommand={sendCommand}
              onClose={() => setOpenEditorProgramId(undefined)}
            />
          )}
          <DiagnosticsPanel
            state={state}
            expanded={diagnosticsExpanded}
            onToggle={() => setDiagnosticsExpanded((previous) => !previous)}
          />
        </div>
      </div>
      <BottomControlBar state={state} sendCommand={sendCommand} />
    </div>
  );
}
