import { BulletFactory } from "../bullet/BulletFactory.js";
import { Scene, clamp } from "../engine/index.js";
import { Stage1 } from "../stage/Stage1.js";
import { BulletManager } from "../bullet/BulletManager.js";
import { EnemyManager } from "../enemy/EnemyManager.js";
import { EnemySpawner } from "../enemy/EnemySpawner.js";
import { Player } from "../player/Player.js";
import { PlayerShotPatterns } from "../player/PlayerShotPatterns.js";
import { GameplaySpaceBackground } from "../effects/GameplaySpaceBackground.js";
import { EnemyDefeatEffectManager } from "../effects/EnemyDefeatEffectManager.js";

/** 
 * ゲームプレイ中のオブジェクトと進行を管理するシーン
 */
export class GameScene extends Scene {
    /**
     * ゲームシーンのコンストラクタ
     * @param param0
     * @param param0.sceneManager
     * @param param0.assetManager
     */
    constructor({ sceneManager, assetManager }) {
        super();

        this.sceneManager = sceneManager;
        this.assetManager = assetManager;

        this.background = null;
        this.gameplayBackground = null;
        this.gameplayLayer = null;
        this.gameplayMask = null;
        this.bulletFactory = null;
        this.bulletManager = null;
        this.enemy = null;
        this.enemyManager = null;
        this.enemySpawner = null;
        this.enemyDefeatEffectManager = null;
        this.player = null;
        this.playArea = { x: 0, y: 0, width: 0, height: 0 };
        this.uiArea = { x: 0, y: 0, width: 0, height: 0 };
    }

    /**
     * ゲームシーンに入る際の初期化処理
     */
    Initialize() {
        this.background = new createjs.Shape();
        this.gameplayBackground = new GameplaySpaceBackground();
        this.gameplayLayer = new createjs.Container();
        this.gameplayMask = new createjs.Shape();
        this.gameplayBackground.view.mask = this.gameplayMask;
        this.gameplayLayer.mask = this.gameplayMask;

        this.root.addChild(this.background);
        this.root.addChild(this.gameplayBackground.view);
        this.root.addChild(this.gameplayLayer);
        this.layout();

        // 弾関係の初期化
        this.bulletFactory = new BulletFactory({
            boundsProvider: this,
        });
        this.bulletManager = new BulletManager({
            bulletFactory: this.bulletFactory,
            root: this.gameplayLayer,
            playerProvider: () => this.player,
            enemyProvider: () => this.enemyManager?.getActiveEnemies() ?? [],
        });

        // プレイヤー関係の初期化
        this.player = new Player({
            boundsProvider: this,
            onShot: (player, shotSlot) => {
                const pattern =
                    PlayerShotPatterns[shotSlot.pattern] ??
                    PlayerShotPatterns.straight;

                pattern(player, {
                    bulletManager: this.bulletManager,
                    enemyProvider: () => this.enemyManager?.getActiveEnemies() ?? [],
                    config: shotSlot.config ?? {},
                });
            },
        });
        this.player.transform.x = this.playArea.x + this.playArea.width / 2;
        this.player.transform.y = this.playArea.y + this.playArea.height * 0.75;
        this.player.shotSlots = [
            {
                pattern: "straight",
                cooldown: 0.08,
                timer: 0,
                config: {
                    moveSpeed: 650,
                    damage: 1,
                },
            },
            {
                pattern: "homing",
                cooldown: 0.4,
                timer: 0,
                config: {
                    moveSpeed: 420,
                    damage: 1,
                    turnRate: 2,
                },
            },
        ];
        this.gameplayLayer.addChild(this.player.view);

        this.enemyDefeatEffectManager = new EnemyDefeatEffectManager({
            root: this.gameplayLayer,
        });

        // 敵関係の初期化
        this.enemyManager = new EnemyManager({
            root: this.gameplayLayer,
            boundsProvider: this, 
            bulletManager: this.bulletManager,
        });

        this.bulletManager.onTargetDefeated = (target) => {
            if (target?.name !== "enemy") {
                return;
            }

            this.enemyDefeatEffectManager?.spawn({
                x: target.transform.x,
                y: target.transform.y,
                radius: target.radius,
                color: target.color,
                maxHp: target.maxHp,
            });
        };

        this.enemySpawner = new EnemySpawner({
            enemyManager: this.enemyManager,
            boundsProvider: this,
            waves: Stage1.waves,
        });

    }

    /**
     * ゲームシーンの状態を更新する
     * @param deltaTime 前のフレームからの経過時間（秒）
     */
    tick(deltaTime) {
        this.gameplayBackground?.tick(deltaTime);
        this.player?.tick(deltaTime);
        this.enemySpawner?.tick(deltaTime);
        this.enemyManager?.tick(deltaTime);
        this.bulletManager?.tick(deltaTime);
        this.enemyDefeatEffectManager?.tick(deltaTime);
    }

    /**
     * ゲームシーンから退出する際の処理
     */
    exit() {
        console.log("Exiting GameScene");
    }

    /**
     * ゲームシーンのサイズが変更された際の処理
     * @param width 幅
     * @param height 高斎
     */
    resize(width, height) {
        super.resize(width, height);
        this.layout();
        this.#clampActorsToPlayArea();
    }

    /**
     * ゲームシーンのレイアウトを更新する
     */
    layout() {
        if (this.background === null) {
            return;
        }

        this.background.graphics
            .clear()
            .beginFill("#101010")
            .drawRect(0, 0, this.width, this.height);

        const outerMargin = 0;
        const gap = 0;
        const playHeight = Math.max(1, this.height);
        const preferredPlayWidth = Math.floor(playHeight * 0.75);
        const maxPlayWidth = Math.max(1, this.width);
        const remainingWidth = maxPlayWidth - preferredPlayWidth;
        const playWidth = remainingWidth > 0 && remainingWidth <= 32
            ? maxPlayWidth
            : Math.max(1, Math.min(preferredPlayWidth, maxPlayWidth));

        this.playArea = {
            x: Math.floor((this.width - playWidth) / 2),
            y: outerMargin,
            width: playWidth,
            height: playHeight,
        };

        this.uiArea = {
            x: this.playArea.x + this.playArea.width + gap,
            y: outerMargin,
            width: Math.max(0, this.width - (this.playArea.x + this.playArea.width + gap + outerMargin)),
            height: playHeight,
        };

        this.gameplayMask?.graphics
            .clear()
            .beginFill("#ffffff")
            .drawRect(this.playArea.x, this.playArea.y, this.playArea.width, this.playArea.height);

        this.gameplayBackground?.resize(this.playArea);

        this.background.graphics
            .setStrokeStyle(2)
            .beginStroke("#d8dde8")
            .drawRect(this.playArea.x, this.playArea.y, this.playArea.width, this.playArea.height)
            .endStroke()
            .beginFill("#171923")
            .drawRect(this.uiArea.x, this.uiArea.y, this.uiArea.width, this.uiArea.height)
            .setStrokeStyle(1)
            .beginStroke("#4b5264")
            .drawRect(this.uiArea.x, this.uiArea.y, this.uiArea.width, this.uiArea.height)
            .endStroke();

        this.background.cache(0, 0, this.width, this.height);
    }

    /** 
     * リサイズ後も操作対象がプレイ領域内に残るようにする
     */
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
