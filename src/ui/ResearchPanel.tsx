// Forschungsansicht (Expansion 1): Projekte, Fortschritt, Auswahl.
import {
  EXP1_RESEARCH_PROJECTS,
  hasActiveResearchCenter,
} from "../sim/research";
import type { GameState, PlayerCommand } from "../sim/types";

type ResearchPanelProps = {
  state: GameState;
  sendCommand: (command: PlayerCommand) => void;
};

export function ResearchPanel({ state, sendCommand }: ResearchPanelProps) {
  const centerActive = hasActiveResearchCenter(state);

  return (
    <div className="panel research-panel">
      <h3>Forschung</h3>
      {!centerActive && <p>Kein aktives KI-Forschungszentrum.</p>}
      <ul className="research-list">
        {EXP1_RESEARCH_PROJECTS.map((project) => {
          const completed = state.research.completedProjects.includes(project.id);
          const progress = state.research.progress[project.id] ?? 0;
          const active = state.research.activeProjectId === project.id;
          const prerequisitesMet = project.prerequisites.every((prerequisite) =>
            state.research.completedProjects.includes(prerequisite),
          );
          return (
            <li
              key={project.id}
              className={`research-project${completed ? " completed" : ""}${
                active ? " active" : ""
              }`}
            >
              <div className="research-project-header">
                <span>{project.name}</span>
                <span className="research-progress">
                  {completed ? "✔" : `${progress}/${project.cost}`}
                </span>
              </div>
              {!completed && (
                <button
                  disabled={!centerActive || active || !prerequisitesMet}
                  onClick={() =>
                    sendCommand({
                      type: "selectResearchProject",
                      projectId: project.id,
                    })
                  }
                >
                  {active
                    ? "Wird erforscht…"
                    : prerequisitesMet
                      ? "Erforschen"
                      : "Voraussetzung fehlt"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
