// App-Wurzel: haelt den GameState und treibt den Game-Loop.
// Die UI mutiert den State nie direkt, sondern sendet nur PlayerCommands.
import { useEffect, useRef, useState } from "react";
import { createInitialGame } from "./sim/createInitialGame";
import { applyCommandsWhilePaused, tick } from "./sim/tick";
import type { GameState, PlayerCommand } from "./sim/types";
import { GameLayout } from "./ui/GameLayout";

export function App() {
  const [state, setState] = useState<GameState>(() => createInitialGame());
  const pendingCommands = useRef<PlayerCommand[]>([]);

  function sendCommand(command: PlayerCommand) {
    pendingCommands.current.push(command);
    // Im Pausenmodus Commands sofort anwenden (ohne Simulationsfortschritt),
    // damit Pause/Resume/Auswahl/Editor reagieren.
    setState((current) => {
      if (!current.isPaused) {
        return current;
      }
      const commands = pendingCommands.current;
      pendingCommands.current = [];
      return applyCommandsWhilePaused(current, commands).state;
    });
  }

  useEffect(() => {
    if (state.isPaused) {
      return;
    }
    const interval = window.setInterval(() => {
      setState((current) => {
        if (current.isPaused) {
          return current;
        }
        const commands = pendingCommands.current;
        pendingCommands.current = [];
        return tick(current, commands).state;
      });
    }, 1000 / state.speed);
    return () => window.clearInterval(interval);
  }, [state.isPaused, state.speed]);

  return <GameLayout state={state} sendCommand={sendCommand} />;
}
