export class ChapterController {
  constructor({
    stages,
    enemySpawner,
    enemyManager,
    bulletManager,
    onChapterStart,
    onChapterClear,
    onStageClear,
    onGameClear,
    snapshotProvider,
    snapshotRestorer,
  } = {}) {
    this.stages = stages;
    this.enemySpawner = enemySpawner;
    this.enemyManager = enemyManager;
    this.bulletManager = bulletManager;
    this.onChapterStart = onChapterStart;
    this.onChapterClear = onChapterClear;
    this.onStageClear = onStageClear;
    this.onGameClear = onGameClear;
    this.snapshotProvider = snapshotProvider;
    this.snapshotRestorer = snapshotRestorer;

    this.stageIndex = 0;
    this.chapterIndex = 0;
    this.chapterElapsed = 0;
    this.currentBoss = null;
    this.chapterSnapshot = null;
    this.isComplete = false;
  }

  get currentStage() {
    return this.stages[this.stageIndex] ?? null;
  }

  get currentChapter() {
    return this.currentStage?.chapters[this.chapterIndex] ?? null;
  }

  start() {
    this.stageIndex = 0;
    this.chapterIndex = 0;
    this.isComplete = false;
    this.#startCurrentChapter();
  }

  tick(deltaTime) {
    if (this.isComplete || this.currentChapter === null) {
      return;
    }

    this.chapterElapsed += deltaTime;
    if (this.#isChapterFinished()) {
      this.#advance();
    }
  }

  restartCurrentChapter() {
    this.snapshotRestorer?.(this.chapterSnapshot);
    this.#startCurrentChapter(true);
  }

  #startCurrentChapter(isRetry = false) {
    this.chapterElapsed = 0;
    this.currentBoss = null;
    this.enemySpawner.reset();
    this.enemyManager.clearAll();
    this.bulletManager.clearAll();
    this.chapterSnapshot = this.snapshotProvider?.() ?? null;

    const chapter = this.currentChapter;
    const events = [...(chapter.events ?? [])];
    if (chapter.boss !== undefined) {
      events.push({ time: 0.8, ...chapter.boss });
    }

    this.enemySpawner.setWaves(events);
    this.onChapterStart?.({
      stage: this.currentStage,
      chapter,
      stageIndex: this.stageIndex,
      chapterIndex: this.chapterIndex,
      isRetry,
    });
  }

  #isChapterFinished() {
    const chapter = this.currentChapter;
    const endCondition = chapter.endCondition ?? "duration";

    if (endCondition === "duration") {
      return this.chapterElapsed >= chapter.duration;
    }

    if (endCondition === "allEnemiesDefeated") {
      return (
        this.chapterElapsed >= chapter.duration ||
        (this.enemySpawner.isComplete() && this.enemyManager.getActiveEnemies().length === 0)
      );
    }

    if (endCondition === "bossDefeated") {
      return (
        this.chapterElapsed >= chapter.duration ||
        (this.enemySpawner.isComplete() && this.enemyManager.getActiveEnemies().length === 0)
      );
    }

    return this.chapterElapsed >= chapter.duration;
  }

  #advance() {
    this.onChapterClear?.({
      stage: this.currentStage,
      chapter: this.currentChapter,
      stageIndex: this.stageIndex,
      chapterIndex: this.chapterIndex,
    });

    this.chapterIndex++;
    if (this.chapterIndex < this.currentStage.chapters.length) {
      this.#startCurrentChapter();
      return;
    }

    this.onStageClear?.({ stage: this.currentStage, stageIndex: this.stageIndex });
    this.stageIndex++;
    this.chapterIndex = 0;

    if (this.stageIndex < this.stages.length) {
      this.#startCurrentChapter();
      return;
    }

    this.isComplete = true;
    this.onGameClear?.();
  }
}
