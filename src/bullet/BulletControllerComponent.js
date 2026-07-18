import { Component, Vector2 } from "../engine/index.js";

/** 弾の移動と画面外への退出を制御するコンポーネント */
export class BulletControllerComponent extends Component {
    constructor(
        {   boundsProvider, 
            moveSpeed = 600,
            direction = Vector2.up(),
            
        } = {}) {
        super();
        
        this.boundsProvider = boundsProvider;
        this.moveSpeed = moveSpeed;
        this.direction = direction.normalized;
    }

    /**
     * ゲームオブジェクトの状態を更新する
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    tick(deltaTime) {
        this.#move(deltaTime);

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
    configure({ direction, moveSpeed } = {}) {
        if (direction !== undefined) {
            this.direction = direction.normalized;
        }

        if (moveSpeed !== undefined) {
            this.moveSpeed = moveSpeed;
        }
    }

    /**
     * 弾自身を移動させる
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    #move(deltaTime) {
        // ベクトル方向にdeltaTimeで弾を移動させる
        this.transform.x += this.direction.x * this.moveSpeed * deltaTime;
        this.transform.y += this.direction.y * this.moveSpeed * deltaTime;
    }

    /**
     * 弾が画面外に出たかどうかをチェックする
     * @returns {boolean} 画面外に出た場合はtrue、そうでない場合はfalse
     */
    #isOutsideBounds() {
        if (this.boundsProvider === undefined) {
            return false;
        }
        
        return this.transform.x < 0 ||
            this.transform.x > this.boundsProvider.width ||
            this.transform.y < 0 ||
            this.transform.y > this.boundsProvider.height;
    }
}
