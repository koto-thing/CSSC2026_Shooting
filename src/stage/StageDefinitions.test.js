import { describe, expect, it } from "vite-plus/test";

import { StageDefinitions } from "./StageDefinitions.js";

describe("StageDefinitions", () => {
  it("defines six themed stages with deterministic chapter ids", () => {
    expect(StageDefinitions).toHaveLength(6);
    expect(new Set(StageDefinitions.map((stage) => stage.theme)).size).toBe(6);

    for (const stage of StageDefinitions) {
      expect(stage.chapters.length).toBeGreaterThanOrEqual(8);
      expect(new Set(stage.chapters.map((chapter) => chapter.id)).size).toBe(stage.chapters.length);
    }
  });

  it("raises final boss pattern complexity over the run", () => {
    const patterns = StageDefinitions.map((stage) => stage.chapters.at(-1).boss.shotPattern);
    expect(patterns[0]).toBe("circle15WithOffset");
    expect(patterns.at(-1)).toBe("pureRing");
  });
});
