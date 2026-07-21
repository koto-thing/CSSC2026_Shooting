import { Enemy } from "./Enemy.js";
import { EnemyTypes } from "./EnemyTypes.js";

/** 敵の生成、更新、参照を管理するクラス */
export class EnemyManager {
    /** 敵管理クラスを初期化する */
    constructor({ root, boundsProvider, bulletManager } = {}) {
        this.root = root;
        this.boundsProvider = boundsProvider;
        this.bulletManager = bulletManager;
        this.enemies = [];
    }
    
    /** すべての敵を更新する */
    tick(deltaTime) {
        for (const enemy of this.enemies) {
            enemy.tick(deltaTime);
        }

        for (const enemy of this.enemies) {
            if (!enemy.active) {
                enemy.destroy();
            }
        }

        this.enemies = this.enemies.filter((enemy) => enemy.active);
    }
    
    /** 指定した種類と座標に敵を生成する */
    spawn({ type = "normal", x, y, ...overrides }= {}) {
        const enemyType = {
            ...(EnemyTypes[type] ?? EnemyTypes.normal),
            ...overrides,
        };
        
        const enemy = new Enemy({
            root: this.root,
            boundsProvider: this.boundsProvider,
            bulletManager: this.bulletManager,
            spawnPosition: { x, y },
            enemyType,
        });
        
        this.enemies.push(enemy);
        this.root?.addChild(enemy.view);
        
        return enemy;
    }
    
    /** アクティブな敵を取得する */
    getActiveEnemies() {
        return this.enemies.filter((enemy) => enemy.active);
    }
}
