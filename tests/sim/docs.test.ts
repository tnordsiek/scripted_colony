// Doku-Konsistenz-Tests nach docs/02-mvp/mvp-test-matrix.md
// (MVP-V68/V69/V70/V82/V87/V92 und MVP-DOC-Serie, pragmatische Content-Checks).
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function activeMarkdownFiles(): string[] {
  const results: string[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(join(ROOT, dir))) {
      const relative = `${dir}/${entry}`;
      if (statSync(join(ROOT, relative)).isDirectory()) {
        if (!relative.includes("archive") && !relative.includes("node_modules")) {
          walk(relative);
        }
      } else if (entry.endsWith(".md")) {
        results.push(relative);
      }
    }
  }
  walk("docs");
  return results;
}

describe("Doku-Konsistenz (mvp-test-matrix.md)", () => {
  it("MVP-V68-001: tick-pipeline.md ist die einzige kanonische Quelle der Simulationsreihenfolge", () => {
    const tickPipeline = read("docs/03-technical/tick-pipeline.md");
    expect(tickPipeline).toContain(
      "einzige kanonische Quelle fuer die Simulationsreihenfolge",
    );
  });

  it("MVP-V68-002: simulation-rules.md verweist auf tick-pipeline.md ohne eigene Schrittfolge", () => {
    const simulationRules = read("docs/03-technical/simulation-rules.md");
    expect(simulationRules).toContain("docs/03-technical/tick-pipeline.md");
    expect(simulationRules).toContain(
      "Die einzige kanonische Tick-Reihenfolge steht in",
    );
  });

  it("MVP-V68-003: implementation-plan.md verweist auf tick-pipeline.md", () => {
    const implementationPlan = read("docs/02-mvp/implementation-plan.md");
    expect(implementationPlan).toContain("tick-pipeline.md");
  });

  it("MVP-V69-001: Akzeptanzkriterien verlangen keine Ladepriorisierung", () => {
    const acceptance = read("docs/02-mvp/acceptance-criteria.md");
    expect(acceptance).toContain(
      "Es gibt keine Priorisierung zwischen Produktion und externer Roboterladung.",
    );
  });

  it("MVP-V70-002: MVP nutzt globalen Power-Pool, keine lokalen Energienetze", () => {
    const energySystem = read("docs/04-systems/energy-system.md");
    expect(energySystem.toLowerCase()).toContain("power-pool");
    const simulationRules = read("docs/03-technical/simulation-rules.md");
    expect(simulationRules).toContain("globaler Power-Pool");
  });

  it("MVP-V82-001: deterministic-id-generation.md ist zentrale ID-Referenz", () => {
    const idDoc = read("docs/03-technical/deterministic-id-generation.md");
    expect(idDoc).toContain("zentrale Referenz fuer deterministische IDs");
  });

  it("MVP-V87-001/002: GameEventCode-Union nur in canonical-data-model.md", () => {
    expect(read("docs/03-technical/canonical-data-model.md")).toContain(
      "type GameEventCode =",
    );
    expect(read("docs/03-technical/diagnostics-and-eventlog.md")).not.toContain(
      "type GameEventCode =",
    );
  });

  it("MVP-V92: canonical-data-model.md verweist auf initial-game-state.md als Initial-State-Quelle", () => {
    const dataModel = read("docs/03-technical/canonical-data-model.md");
    expect(dataModel).toContain("docs/02-mvp/initial-game-state.md");
  });

  it("MVP-DOC-004/005: npm + Node 22 sind die einzigen aktiven Tooling-Vorgaben", () => {
    const guideline = read("docs/00-documentation-guideline.md");
    expect(guideline).toContain("npm ci");
    expect(guideline).toContain("node-version: 22");
    const packageJson = JSON.parse(read("package.json"));
    expect(packageJson.engines.node).toBe(">=22 <23");
    expect(existsSync(join(ROOT, "package-lock.json"))).toBe(true);
    expect(existsSync(join(ROOT, "pnpm-lock.yaml"))).toBe(false);
    expect(existsSync(join(ROOT, "yarn.lock"))).toBe(false);
  });

  it("MVP-DOC-008: alle aktiven Markdown-Dateien haben geschlossene Codebloecke", () => {
    for (const file of activeMarkdownFiles()) {
      const content = read(file);
      const fenceCount = content
        .split("\n")
        .filter((line) => line.startsWith("```")).length;
      expect(fenceCount % 2, `${file} hat unbalancierte Codebloecke`).toBe(0);
    }
  });

  it("MVP-DOC-003: docs/-Pfadverweise in aktiven Dokumenten loesen auf", () => {
    const pattern = /docs\/[0-9a-z-]+\/[0-9a-zA-Z-]+\.md/g;
    for (const file of activeMarkdownFiles()) {
      const content = read(file);
      for (const match of content.match(pattern) ?? []) {
        expect(
          existsSync(join(ROOT, match)),
          `${file} verweist auf fehlende Datei ${match}`,
        ).toBe(true);
      }
    }
  });

  it("MVP-DOC-011: aktive MVP-Regeltexte verwenden Batteriewerte als absolute Punkte", () => {
    // Zulaessige Ausnahmen: kanonische Einheitsdefinition, UI-Anzeige,
    // Future-Dokumente/-Templates, Negativ-Checks der Testmatrix.
    const ruleDocs = [
      "docs/03-technical/simulation-rules.md",
      "docs/03-technical/program-stack-rules.md",
      "docs/03-technical/action-executability-matrix.md",
      "docs/03-technical/pathfinding-and-map-generation.md",
      "docs/03-technical/robot-task-lifecycle.md",
      "docs/02-mvp/mvp-and-tech-stack.md",
      "docs/02-mvp/initial-game-state.md",
    ];
    for (const file of ruleDocs) {
      const content = read(file);
      expect(content, `${file} enthaelt %-Batteriewert`).not.toMatch(
        /Batterie (<=|>=|<|>|-=|\+=) \d+ %/,
      );
      expect(content, `${file} enthaelt %-Batteriekosten`).not.toContain("% Batterie");
    }
  });

  it("MVP-DOC-001: aktive Fach-/Technikdokumente ohne Arbeitschronik-Abschnittstitel", () => {
    for (const file of activeMarkdownFiles()) {
      const content = read(file);
      expect(content, `${file} enthaelt vXX-Chronik-Abschnitt`).not.toMatch(
        /^#+ v\d+-(Hinweis|Klarstellung)/m,
      );
    }
  });
});
