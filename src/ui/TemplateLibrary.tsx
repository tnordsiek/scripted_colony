// Template-Bibliothek (Expansion 1): freigeschaltete Templates zum Stack hinzufuegen.
import { isTemplateUnlocked } from "../sim/research";
import type {
  GameState,
  PlayerCommand,
  ProgramTemplateId,
  Robot,
} from "../sim/types";

const LIBRARY_TEMPLATES: Array<{ id: ProgramTemplateId; label: string; hint: string }> = [
  {
    id: "template.buildAiResearchCenter",
    label: "Forschungszentrum bauen",
    hint: "10 Iron Ore",
  },
  {
    id: "template.buildSteelworks",
    label: "Stahlwerk bauen",
    hint: "8 Iron Ore, braucht Metallverarbeitung I",
  },
  {
    id: "template.buildEnergyStorage",
    label: "Energiespeicher bauen",
    hint: "4 Steel Plates, braucht Energiepuffer I",
  },
];

type TemplateLibraryProps = {
  state: GameState;
  robot: Robot;
  sendCommand: (command: PlayerCommand) => void;
};

export function TemplateLibrary({ state, robot, sendCommand }: TemplateLibraryProps) {
  const entries = LIBRARY_TEMPLATES.map((template) => ({
    ...template,
    unlocked: isTemplateUnlocked(state, template.id),
    inStack: robot.programStack.some((program) => program.templateId === template.id),
  }));

  return (
    <div className="panel template-library">
      <h3>Template-Bibliothek</h3>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} className="template-library-entry">
            <span>
              {entry.label} <em className="template-hint">({entry.hint})</em>
            </span>
            <button
              disabled={!entry.unlocked || entry.inStack}
              onClick={() =>
                sendCommand({
                  type: "addProgramFromTemplate",
                  robotId: robot.id,
                  templateId: entry.id,
                })
              }
            >
              {entry.inStack ? "Im Stack" : entry.unlocked ? "Hinzufuegen" : "Gesperrt"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
