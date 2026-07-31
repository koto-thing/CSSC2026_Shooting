import { describe, expect, it, vi } from "vite-plus/test";

import { ChapterController } from "./ChapterController.js";

function createController(onChapterStart = vi.fn()) {
  return new ChapterController({
    stages: [
      {
        id: "test",
        chapters: [{ id: "test-1", duration: 1, endCondition: "duration", events: [] }],
      },
    ],
    enemySpawner: { reset: vi.fn(), setWaves: vi.fn(), isComplete: () => true },
    enemyManager: { clearAll: vi.fn(), getActiveEnemies: () => [] },
    bulletManager: { clearAll: vi.fn() },
    snapshotProvider: () => ({ score: 10 }),
    snapshotRestorer: vi.fn(),
    onChapterStart,
  });
}

describe("ChapterController", () => {
  it("marks a restarted section as a retry", () => {
    const onChapterStart = vi.fn();
    const controller = createController(onChapterStart);
    controller.start();
    controller.restartCurrentChapter();

    expect(onChapterStart.mock.calls[0][0].isRetry).toBe(false);
    expect(onChapterStart.mock.calls[1][0].isRetry).toBe(true);
  });
});
