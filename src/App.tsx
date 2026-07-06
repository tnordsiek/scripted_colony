// App-Wurzel: haelt den GameState und treibt den Game-Loop.
// Die UI mutiert den State nie direkt, sondern sendet nur PlayerCommands.
// Wichtig: State-Updater bleiben pur; die Command-Queue wird ausserhalb
// der Updater geleert (StrictMode ruft Updater doppelt auf).
import { useEffect, useRef, useState } from "react";
import { createInitialGame } from "./sim/createInitialGame";
import { applyCommandsWhilePaused, tick } from "./sim/tick";
import type { GameState, PlayerCommand } from "./sim/types";
import { GameLayout } from "./ui/GameLayout";
import { loadUiSettings } from "./ui/persistence";

export function App() {
  const [state, setState] = useState<GameState>(() => {
    // Optional persistierte Einstellungen (Seed, Speed) wiederherstellen.
    const settings = loadUiSettings();
    const initial = createInitialGame(settings.seed ?? "mvp-default");
    if (settings.speed === 1 || settings.speed === 2 || settings.speed === 4) {
      initial.speed = settings.speed;
    }
    return initial;
  });
  const pendingCommands = useRef<PlayerCommand[]>([]);
  const isPausedRef = useRef(state.isPaused);
  isPausedRef.current = state.isPaused;

  function drainCommands(): PlayerCommand[] {
    const commands = pendingCommands.current;
    pendingCommands.current = [];
    return commands;
  }

  function sendCommand(command: PlayerCommand) {
    pendingCommands.current.push(command);
    // Im Pausenmodus Commands sofort anwenden (ohne Simulationsfortschritt),
    // damit Pause/Resume/Auswahl/Editor reagieren.
    if (isPausedRef.current) {
      const commands = drainCommands();
      setState((current) => applyCommandsWhilePaused(current, commands).state);
    }
  }

  useEffect(() => {
    if (state.isPaused) {
      return;
    }
    const interval = window.setInterval(() => {
      const commands = drainCommands();
      setState((current) =>
        current.isPaused ? current : tick(current, commands).state,
      );
    }, 1000 / state.speed);
    return () => window.clearInterval(interval);
  }, [state.isPaused, state.speed]);

  return <GameLayout state={state} sendCommand={sendCommand} />;
}
