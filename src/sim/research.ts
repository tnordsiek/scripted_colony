// Forschungssystem nach docs/02-mvp/expansion-1-scope.md; Projektwerte aus
// docs/05-future/research-tree.md. Aktiv sind nur die vier Expansion-1-Projekte.
import {
  EXP1_RESEARCH_POINTS_PER_TICK,
  EXP1_RESEARCH_POWER_REQUIRED,
} from "./constants";
import type {
  GameState,
  ProgramTemplateId,
  ResearchProjectId,
} from "./types";

export type ActiveResearchProject = {
  id: ResearchProjectId;
  name: string;
  cost: number;
  prerequisites: ResearchProjectId[];
};

export const EXP1_RESEARCH_PROJECTS: ActiveResearchProject[] = [
  {
    id: "research.basicAutomation1",
    name: "Basisautomatisierung I",
    cost: 200,
    prerequisites: [],
  },
  {
    id: "research.metalProcessing1",
    name: "Metallverarbeitung I",
    cost: 300,
    prerequisites: [],
  },
  {
    id: "research.energyDistribution1",
    name: "Energieverteilung I",
    cost: 250,
    prerequisites: [],
  },
  {
    id: "research.energyBuffer1",
    name: "Energiepuffer I",
    cost: 500,
    prerequisites: ["research.energyDistribution1"],
  },
  // Expansion 2 (docs/02-mvp/expansion-2-scope.md):
  {
    id: "research.transportLogistics1",
    name: "Transportlogistik I",
    cost: 500,
    prerequisites: ["research.metalProcessing1"],
  },
];

export function getActiveResearchProject(
  projectId: ResearchProjectId,
): ActiveResearchProject | undefined {
  return EXP1_RESEARCH_PROJECTS.find((project) => project.id === projectId);
}

export function isProjectCompleted(
  state: GameState,
  projectId: ResearchProjectId,
): boolean {
  return state.research.completedProjects.includes(projectId);
}

export function hasActiveResearchCenter(state: GameState): boolean {
  return state.buildings.some(
    (building) =>
      building.type === "aiResearchCenter" &&
      building.status === "active" &&
      building.isEnabled,
  );
}

// Template-Freischaltung: Forschungszentrum sofort, Stahlwerk und
// Energiespeicher nach dem jeweiligen Projekt.
export function isTemplateUnlocked(
  state: GameState,
  templateId: ProgramTemplateId,
): boolean {
  switch (templateId) {
    case "template.mineIronOre":
    case "template.buildSolarCollector":
    case "template.buildRobotFactory":
    case "template.exploreNearby":
    case "template.stasisCharge":
    case "template.buildAiResearchCenter":
      return true;
    case "template.buildSteelworks":
      return isProjectCompleted(state, "research.metalProcessing1");
    case "template.buildEnergyStorage":
      return isProjectCompleted(state, "research.energyBuffer1");
    // Expansion 2:
    case "template.buildResourceStorage":
    case "template.buildGridEnergyLine":
      return isProjectCompleted(state, "research.transportLogistics1");
    case "template.logistics":
    case "template.rechargeAtGrid":
      // Roboter-interne Templates: nicht ueber die Bibliothek waehlbar.
      return false;
    default:
      return false;
  }
}

// Expansion 2: Logistik (Requests, Transporterproduktion) freigeschaltet?
export function isLogisticsUnlocked(state: GameState): boolean {
  return isProjectCompleted(state, "research.transportLogistics1");
}

export function areExecutionLimitsUnlocked(state: GameState): boolean {
  return isProjectCompleted(state, "research.basicAutomation1");
}

export type ResearchTickResult =
  | { type: "idle" }
  | { type: "paused"; projectId: ResearchProjectId }
  | { type: "progress"; projectId: ResearchProjectId }
  | { type: "completed"; projectId: ResearchProjectId };

// Fortschrittsberechtigung analog ProductionTasks: Wahl in Tick N wirkt ab N+1.
export function isResearchEligible(state: GameState): boolean {
  return (
    state.research.activeProjectId !== undefined &&
    (state.research.activeProjectSelectedTick ?? 0) < state.tick &&
    hasActiveResearchCenter(state)
  );
}

export function researchPowerRequired(state: GameState): number {
  return isResearchEligible(state) ? EXP1_RESEARCH_POWER_REQUIRED : 0;
}

// Ein Forschungs-Tick; hasPower entscheidet Fortschritt vs. Pause.
export function processResearchTick(
  state: GameState,
  hasPower: boolean,
): ResearchTickResult {
  if (!isResearchEligible(state)) {
    return { type: "idle" };
  }

  const projectId = state.research.activeProjectId as ResearchProjectId;
  const project = getActiveResearchProject(projectId);
  if (!project || isProjectCompleted(state, projectId)) {
    return { type: "idle" };
  }

  if (!hasPower) {
    return { type: "paused", projectId };
  }

  const progress =
    (state.research.progress[projectId] ?? 0) + EXP1_RESEARCH_POINTS_PER_TICK;
  state.research.progress[projectId] = progress;

  if (progress >= project.cost) {
    state.research.completedProjects.push(projectId);
    state.research.activeProjectId = undefined;
    state.research.activeProjectSelectedTick = undefined;
    return { type: "completed", projectId };
  }

  return { type: "progress", projectId };
}
