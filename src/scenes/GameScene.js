import { BulletFactory } from "../bullet/BulletFactory.js";
import { BulletManager } from "../bullet/BulletManager.js";
import { EnemyManager } from "../enemy/EnemyManager.js";
import { EnemySpawner } from "../enemy/EnemySpawner.js";
import { InputSystem, KeyCode, Scene, clamp } from "../engine/index.js";
import { ThemedGameplayBackground } from "../effects/ThemedGameplayBackground.js";
import { EnemyDefeatEffectManager } from "../effects/EnemyDefeatEffectManager.js";
import { GameplayTransitionEffects } from "../effects/GameplayTransitionEffects.js";
import { Player } from "../player/Player.js";
import { PlayerShotPatterns } from "../player/PlayerShotPatterns.js";
import { ChapterController } from "../stage/ChapterController.js";
import { StageDefinitions } from "../stage/StageDefinitions.js";
import { ChapterBanner } from "../ui/ChapterBanner.js";
import { BossStatusOverlay } from "../ui/BossStatusOverlay.js";
import { Hud } from "../ui/Hud.js";
import { PauseOverlay } from "../ui/PauseOverlay.js";
import { ResultOverlay } from "../ui/ResultOverlay.js";

export class GameScene extends Scene {
  constructor({ sceneManager, assetManager, session }) {
    super();

    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.session = session;

    this.background = null;
    this.gameplayBackground = null;
    this.gameplayLayer = null;
    this.gameplayMask = null;
    this.bulletFactory = null;
    this.bulletManager = null;
    this.enemyManager = null;
    this.enemySpawner = null;
    this.enemyDefeatEffectManager = null;
    this.transitionEffects = null;
    this.player = null;
    this.chapterController = null;
    this.hud = null;
    this.chapterBanner = null;
    this.bossStatusOverlay = null;
    this.pauseOverlay = null;
    this.resultOverlay = null;
    this.playArea = { x: 0, y: 0, width: 0, height: 0 };
    this.uiArea = { x: 0, y: 0, width: 0, height: 0 };
    this.paused = false;
    this.deathTimer = 0;
  }

  initialize() {
    this.background = new createjs.Shape();
    this.gameplayBackground = new ThemedGameplayBackground();
    this.gameplayLayer = new createjs.Container();
    this.gameplayMask = new createjs.Shape();
    this.gameplayBackground.view.mask = this.gameplayMask;
    this.gameplayLayer.mask = this.gameplayMask;

    this.root.addChild(this.background, this.gameplayBackground.view, this.gameplayLayer);
    this.layout();

    this.bulletFactory = new BulletFactory({ boundsProvider: this });
    this.bulletManager = new BulletManager({
      bulletFactory: this.bulletFactory,
      root: this.gameplayLayer,
      playerProvider: () => this.player,
      enemyProvider: () => this.enemyManager?.getActiveEnemies() ?? [],
      onTargetDefeated: (target) => this.#handleTargetDefeated(target),
      onPlayerHit: () => this.#handlePlayerHit(),
      onGraze: () => {
        this.session.graze += 1;
        this.session.score += 10;
      },
    });

    this.enemyDefeatEffectManager = new EnemyDefeatEffectManager({ root: this.gameplayLayer });
    this.transitionEffects = new GameplayTransitionEffects({ root: this.gameplayLayer });
    this.enemyManager = new EnemyManager({
      root: this.gameplayLayer,
      boundsProvider: this,
      bulletManager: this.bulletManager,
    });
    this.enemySpawner = new EnemySpawner({
      enemyManager: this.enemyManager,
      boundsProvider: this,
      waves: [],
    });

    this.#createPlayer();

    this.hud = new Hud({ root: this.root });
    this.chapterBanner = new ChapterBanner({ root: this.root });
    this.bossStatusOverlay = new BossStatusOverlay({ root: this.root });
    this.pauseOverlay = new PauseOverlay({ root: this.root });
    this.resultOverlay = new ResultOverlay({
      root: this.root,
      onBackToMenu: () => this.sceneManager.changeScene("menu"),
    });

    this.chapterController = new ChapterController({
      stages: StageDefinitions,
      enemySpawner: this.enemySpawner,
      enemyManager: this.enemyManager,
      bulletManager: this.bulletManager,
      snapshotProvider: () => this.#createSnapshot(),
      snapshotRestorer: (snapshot) => this.#restoreSnapshot(snapshot),
      onChapterStart: ({ stage, chapter, isRetry }) => {
        if (isRetry) {
          this.session.retryChapter();
        } else {
          this.session.startChapter();
        }
        this.gameplayBackground.setTheme(stage.theme);
        this.#resetPlayerPosition();
        this.transitionEffects.playClear(this.player.transform.x, this.player.transform.y);
        this.chapterBanner.show(stage.name, chapter.name);
      },
      onChapterClear: () => {
        this.session.clearChapter();
        this.session.score += 5000;
      },
      onStageClear: () => {
        this.session.score += 15000;
      },
      onGameClear: () => {
        this.session.saveHighScore();
        this.resultOverlay.show(this.session);
      },
    });
    this.chapterController.start();
    this.layout();
  }

  tick(deltaTime) {
    if (InputSystem.getKeyDown(KeyCode.Escape)) {
      this.paused = !this.paused;
      this.pauseOverlay.setVisible(this.paused);
    }

    this.chapterBanner?.tick(deltaTime);
    this.hud?.update({
      session: this.session,
      stage: this.chapterController?.currentStage,
      chapter: this.chapterController?.currentChapter,
      chapterElapsed: this.chapterController?.chapterElapsed ?? 0,
      stageIndex: this.chapterController?.stageIndex ?? 0,
      stageCount: StageDefinitions.length,
      chapterIndex: this.chapterController?.chapterIndex ?? 0,
    });
    this.bossStatusOverlay?.update({
      boss: this.enemyManager?.getActiveEnemies().find((enemy) => enemy.isBoss),
      chapter: this.chapterController?.currentChapter,
      chapterElapsed: this.chapterController?.chapterElapsed ?? 0,
    });

    if (this.paused || this.chapterController?.isComplete) {
      return;
    }

    this.session.elapsedSeconds += deltaTime;
    this.gameplayBackground?.tick(deltaTime);
    this.transitionEffects?.tick(deltaTime);

    if (this.deathTimer > 0) {
      this.deathTimer -= deltaTime;
      if (this.deathTimer <= 0) {
        this.#restartChapter();
      }
      return;
    }

    this.player?.tick(deltaTime);
    this.enemySpawner?.tick(deltaTime);
    this.enemyManager?.tick(deltaTime);
    this.bulletManager?.tick(deltaTime);
    this.enemyDefeatEffectManager?.tick(deltaTime);
    this.#checkEnemyContact();
    this.chapterController?.tick(deltaTime);
  }

  exit() {
    this.enemyManager?.clearAll();
    this.bulletManager?.clearAll();
    this.hud?.destroy();
    this.chapterBanner?.destroy();
    this.bossStatusOverlay?.destroy();
    this.pauseOverlay?.destroy();
    this.resultOverlay?.destroy();
    this.transitionEffects?.destroy();
  }

  resize(width, height) {
    super.resize(width, height);
    this.layout();
    this.#clampActorsToPlayArea();
  }

  layout() {
    if (this.background === null) {
      return;
    }

    this.background.graphics.clear().beginFill("#050611").drawRect(0, 0, this.width, this.height);

    const playHeight = Math.max(1, this.height);
    const preferredPlayWidth = Math.floor(playHeight * 0.75);
    const sidePanelMin = this.width >= 760 ? 250 : 0;
    const playWidth = Math.max(1, Math.min(preferredPlayWidth, this.width - sidePanelMin));
    const left =
      this.width >= playWidth + sidePanelMin
        ? Math.floor((this.width - playWidth - sidePanelMin) / 2)
        : Math.floor((this.width - playWidth) / 2);

    this.playArea = { x: left, y: 0, width: playWidth, height: playHeight };
    this.uiArea = {
      x: this.playArea.x + this.playArea.width,
      y: 0,
      width: Math.max(0, this.width - (this.playArea.x + this.playArea.width)),
      height: playHeight,
    };

    this.gameplayMask.graphics
      .clear()
      .beginFill("#ffffff")
      .drawRect(this.playArea.x, this.playArea.y, this.playArea.width, this.playArea.height);
    this.gameplayBackground?.resize(this.playArea);

    this.background.graphics
      .setStrokeStyle(2)
      .beginStroke("#d8dde8")
      .drawRect(this.playArea.x, this.playArea.y, this.playArea.width, this.playArea.height)
      .endStroke()
      .beginFill("#151927")
      .drawRect(this.uiArea.x, this.uiArea.y, this.uiArea.width, this.uiArea.height)
      .setStrokeStyle(1)
      .beginStroke("#445070")
      .drawRect(this.uiArea.x, this.uiArea.y, this.uiArea.width, this.uiArea.height)
      .endStroke();

    this.hud?.layout(this.uiArea.width > 0 ? this.uiArea : this.playArea);
    this.chapterBanner?.layout(this.playArea);
    this.bossStatusOverlay?.layout(this.playArea);
    this.transitionEffects?.layout(this.playArea);
    this.pauseOverlay?.layout(this.width, this.height);
    this.resultOverlay?.layout(this.width, this.height);
    this.background.cache(0, 0, this.width, this.height);
  }

  #createPlayer() {
    this.player?.destroy();
    this.player = new Player({
      boundsProvider: this,
      character: this.session.character,
      onShot: (player, shotSlot) => {
        const pattern = PlayerShotPatterns[shotSlot.pattern] ?? PlayerShotPatterns.straight;
        pattern(player, {
          bulletManager: this.bulletManager,
          enemyProvider: () => this.enemyManager?.getActiveEnemies() ?? [],
          config: shotSlot.config ?? {},
        });
      },
    });
    this.player.shotSlots = this.session.shot.slots.map((slot) => ({
      ...slot,
      config: { ...slot.config },
      timer: 0,
    }));
    this.gameplayLayer.addChild(this.player.view);
    this.#resetPlayerPosition();
  }

  #resetPlayerPosition() {
    if (this.player === null) {
      return;
    }

    this.player.hp = 1;
    this.player.setActive(true);
    this.player.transform.x = this.playArea.x + this.playArea.width / 2;
    this.player.transform.y = this.playArea.y + this.playArea.height * 0.78;
  }

  #createSnapshot() {
    return {
      score: this.session.score,
      graze: this.session.graze,
    };
  }

  #restoreSnapshot(snapshot) {
    if (snapshot === null) {
      return;
    }

    this.session.score = snapshot.score;
    this.session.graze = snapshot.graze;
  }

  #handleTargetDefeated(target) {
    if (target?.name !== "enemy") {
      return;
    }

    this.session.score += target.maxHp >= 100 ? 2500 : 300;
    this.enemyDefeatEffectManager?.spawn({
      x: target.transform.x,
      y: target.transform.y,
      radius: target.radius,
      color: target.color,
      maxHp: target.maxHp,
    });
  }

  #handlePlayerHit() {
    if (this.deathTimer > 0 || this.chapterController?.isComplete) {
      return;
    }

    this.player.setActive(false);
    this.transitionEffects?.playHit(this.player.transform.x, this.player.transform.y);
    this.deathTimer = 0.75;
  }

  #restartChapter() {
    this.deathTimer = 0;
    this.chapterController.restartCurrentChapter();
  }

  #checkEnemyContact() {
    if (this.player === null || !this.player.active) {
      return;
    }

    for (const enemy of this.enemyManager.getActiveEnemies()) {
      const dx = enemy.transform.x - this.player.transform.x;
      const dy = enemy.transform.y - this.player.transform.y;
      const limit = enemy.radius + this.player.hitRadius;
      if (dx * dx + dy * dy <= limit * limit) {
        this.#handlePlayerHit();
        return;
      }
    }
  }

  #clampActorsToPlayArea() {
    const clampObject = (gameObject) => {
      if (gameObject === null || gameObject === undefined) {
        return;
      }

      gameObject.transform.x = clamp(
        gameObject.transform.x,
        this.playArea.x,
        this.playArea.x + this.playArea.width,
      );
      gameObject.transform.y = clamp(
        gameObject.transform.y,
        this.playArea.y,
        this.playArea.y + this.playArea.height,
      );
    };

    clampObject(this.player);
    for (const enemy of this.enemyManager?.getActiveEnemies() ?? []) {
      clampObject(enemy);
    }
  }
}
