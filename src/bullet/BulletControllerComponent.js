import { Component, Vector2 } from "../engine/index.js";
import { BulletMovePatterns } from "./BulletMovePatterns.js";

/** 
 * 弾の移動と画面外への移動を制御するコンポーネント 
 */
export class BulletControllerComponent extends Component {
    /**
     * コンストラクタ
     * @param param0
     * @param param0.boundsProvider
     * @param param0.moveSpeed
     * @param param0.direction
     */
    constructor(
        {   
            boundsProvider, 
            moveSpeed = 600,
            direction = Vector2.up(),
        } = {}) {
        super();
        
        this.boundsProvider = boundsProvider;
        this.moveSpeed = moveSpeed;
        this.direction = direction.normalized;
        this.movePattern = "straight";
        this.moveConfig = {};
        this.moveState = {};
    }

    /**
     * ゲームオブジェクトの状態を更新する
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    tick(deltaTime) {
        // 弾の移動パターンを取得し、存在しない場合はデフォルトの直線移動パターンを使用する
        const pattern = 
            BulletMovePatterns[this.movePattern] ??
            BulletMovePatterns.straight;
        
        // 弾の移動パターンを実行する
        pattern(this.gameObject, deltaTime, this.moveState, {
            direction: this.direction,
            moveSpeed: this.moveSpeed,
            config: this.moveConfig,
        });

        this.#alignToMoveDirection(this.moveState.direction ?? this.direction);
        
        // 弾が画面外に出た場合は非アクティブ化する
        if (this.#isOutsideBounds()) {
            this.gameObject.setActive(false);
        } 
    }

    /**
     * 弾の設定を行う
     * @param param0
     * @param param0.direction
     * @param param0.moveSpeed
     */
    configure({ direction, moveSpeed, movePattern = "straight", moveConfig = {} } = {}) {
        if (direction !== undefined) {
            this.direction = direction.normalized;
        }

        if (moveSpeed !== undefined) {
            this.moveSpeed = moveSpeed;
        }
        
        this.movePattern = movePattern;
        this.moveConfig = moveConfig;
        this.moveState = {};
        this.#alignToMoveDirection(this.direction);
    }

    /** 弾の長軸が進行方向を向くように表示角度を更新する */
    #alignToMoveDirection(direction) {
        if (direction === undefined || (direction.x === 0 && direction.y === 0)) {
            return;
        }

        this.transform.rotation = Math.atan2(direction.y, direction.x) * 180 / Math.PI - 90;
    }

    /**
     * 弾が画面外に出たかどうかをチェックする
     * @returns {boolean} 画面外に出た場合はtrue、そうでない場合はfalse
     */
    #isOutsideBounds() {
        if (this.boundsProvider === undefined) {
            return false;
        }
        
        // プレイエリアの境界を取得する
        // 存在しない場合は、全画面を境界とする
        const bounds = this.boundsProvider.playArea ?? {
            x: 0,
            y: 0,
            width: this.boundsProvider.width,
            height: this.boundsProvider.height,
        };
        const margin = 0;

        // 弾が境界の外に出た場合はtrueを返す
        return this.transform.x < bounds.x - margin ||
            this.transform.x > bounds.x + bounds.width + margin ||
            this.transform.y < bounds.y - margin ||
            this.transform.y > bounds.y + bounds.height + margin;
    }
}
