import { BulletFactory } from "../bullet/BulletFactory.js";
import { Scene } from "../engine/index.js";
import { Stage1 } from "../stage/Stage1.js";
import { BulletManager } from "../bullet/BulletManager.js";
import { EnemyManager } from "../enemy/EnemyManager.js";
import { EnemySpawner } from "../enemy/EnemySpawner.js";
import { Player } from "../player/Player.js";

/** ゲームプレイ中のオブジェクトと進行を管理するシーン */
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
        this.bulletFactory = null;
        this.bulletManager = null;
        this.enemy = null;
        this.enemyManager = null;
        this.enemySpawner = null;
        this.player = null;
    }

    /**
     * ゲームシーンに入る際の初期化処理
     */
    enter() {
        this.background = new createjs.Shape();
        this.root.addChild(this.background);

        this.bulletFactory = new BulletFactory({
            boundsProvider: this,
        });
        this.bulletManager = new BulletManager({
            bulletFactory: this.bulletFactory,
            root: this.root,
            playerProvider: () => this.player,
            enemyProvider: () => this.enemyManager?.getActiveEnemies() ?? [],
        });

        this.player = new Player({
            boundsProvider: this,
            onShot: (player) => this.bulletManager.spawnFrom(player),
        });
        this.player.transform.x = this.width / 2;
        this.player.transform.y = this.height / 2;
        this.root.addChild(this.player.view);

        // 敵関係の初期化
        this.enemyManager = new EnemyManager({
            root: this.root,
            boundsProvider: this, 
            bulletManager: this.bulletManager,
        });

        this.enemySpawner = new EnemySpawner({
            enemyManager: this.enemyManager,
            boundsProvider: this,
            waves: Stage1.waves,
        });

        this.layout();
    }

    /**
     * ゲームシーンの状態を更新する
     * @param deltaTime
     */
    tick(deltaTime) {
        this.player?.tick(deltaTime);
        this.enemySpawner?.tick(deltaTime);
        this.enemyManager?.tick(deltaTime);
        this.bulletManager?.tick(deltaTime);
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
    }
}
