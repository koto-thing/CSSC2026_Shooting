import { Component, clamp } from "../engine/index.js";
import { EnemyMovePatterns } from "./EnemyMovePatterns.js";
import { EnemyShotPattern } from "./EnemyShotPatterns.js";

/** 
 * 敵の移動と弾の発射を制御するコンポーネント
 */
export class EnemyControllerComponent extends Component {
    constructor({
        boundsProvider,
        bulletManager,
        moveSpeed = 300,
        shotCooldown = 0.1,
        movePattern = "straightDown",
        moveConfig = {},
        shotPattern = "singleDown",
        shotConfig = {},
    } = {}) {
        super();

        this.boundsProvider = boundsProvider;
        this.moveSpeed = moveSpeed;
        this.shotCooldown = shotCooldown;
        this.movePattern = movePattern;
        this.moveConfig = moveConfig;
        
        this.bulletManager = bulletManager;
        this.shotPattern = shotPattern;
        this.shotConfig = shotConfig;
        
        this.age = 0;
        this.shotTimer = 0;
        this.shotState = {
            shotCount: 0,
        };
        
        this.moveState = {
            initialized: false,
            age: 0,
            startX: 0,
            startY: 0,
        };
    }

    /**
     * ゲームオブジェクトの状態を更新する
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    tick(deltaTime) {
        this.age += deltaTime;
        this.moveState.age = this.age;
        
        this.shotTimer -= deltaTime;

        this.#move(deltaTime);
        this.#shot(deltaTime);
    }

    /**
     * 敵の移動処理
     * @param deltaTime
     */
    #move(deltaTime) {
        if (this.moveState.startX === 0 && this.moveState.startY === 0) {
            this.moveState.initialized = true;
            this.moveState.startX = this.transform.x;
            this.moveState.startY = this.transform.y;
        }
        
        const pattern = 
            EnemyMovePatterns[this.movePattern] ??
            EnemyMovePatterns.straightDown;
        
        pattern(this.gameObject, deltaTime, this.moveState, {
            ...this.moveConfig,
            moveSpeed: this.moveSpeed,
        });

        this.#clampToPlayArea();
    }

    /** 
     * 敵がUI領域へ侵入しないよう、プレイ領域を基準に移動を制限する 
     */
    #clampToPlayArea() {
        if (this.boundsProvider === undefined) {
            return;
        }

        const bounds = this.boundsProvider.playArea ?? {
            x: 0,
            y: 0,
            width: this.boundsProvider.width,
            height: this.boundsProvider.height,
        };
        const bottom = bounds.y + bounds.height;

        this.transform.x = clamp(this.transform.x, bounds.x, bounds.x + bounds.width);

        if (this.transform.y < bounds.y) {
            return;
        }

        if (this.transform.y > bottom) {
            this.gameObject.setActive(false);
            return;
        }

        this.transform.y = clamp(this.transform.y, bounds.y, bottom);
    }

    /**
     * 弾を撃つ処理
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    #shot(deltaTime) {
        if (this.shotCooldown <= 0) {
            return;
        } 
        
        if (this.shotTimer > 0) {
            return;
        }
        
        this.shotTimer = this.shotCooldown;
        
        const pattern = 
            EnemyShotPattern[this.shotPattern] ??
            EnemyShotPattern.singleDown;
        
        pattern(this.gameObject, {
            bulletManager: this.bulletManager,
            config: this.shotConfig,
            state: this.shotState,
        })
    }
}
