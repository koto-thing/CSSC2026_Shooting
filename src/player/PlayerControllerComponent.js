import { Component, Input, KeyCode, Vector2, clamp } from "../engine/index.js";

/** プレイヤーの移動、ショット、ボム入力を制御するコンポーネント */
export class PlayerControllerComponent extends Component {
    /** プレイヤー操作コンポーネントを初期化する */
    constructor({ boundsProvider, onShot } = {}) {
        super();
        
        this.boundsProvider = boundsProvider;
        this.onShot = onShot;
        this.moveSpeed = 300;     // プレイヤーの基本移動速度
        this.slowMoveSpeed = 120; // 低速時のプレイヤーの移動速度
        this.shotCooldown = 0.1;  // ショットのクールダウン
        this.bombCooldown = 1.0;  // ボムのクールダウン
        
        this.shotTimer = 0;       // ショットのタイマー
        this.bombTimer = 0;       // ボムのタイマー
    }

    /**
     * ゲームオブジェクトの状態を更新する
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    tick(deltaTime) {
        this.shotTimer -= deltaTime;
        this.bombTimer -= deltaTime;
        
        this.#move(deltaTime);
        this.#shot(deltaTime);
        this.#bomb(deltaTime);
    }

    /**
     * プレイヤーの移動処理
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    #move(deltaTime) {
        const direction = Vector2.zero();
        
        // 左
        if (Input.getKey(KeyCode.ArrowLeft)) {
            direction.x -= 1;
        }
        
        // 右
        if (Input.getKey(KeyCode.ArrowRight)) {
            direction.x += 1;
        } 
        
        // 上
        if (Input.getKey(KeyCode.ArrowUp)) {
            direction.y -= 1;
        }
        
        // 下
        if (Input.getKey(KeyCode.ArrowDown)) {
            direction.y += 1;
        }
        
        // 負荷軽減のため、移動しないなら以降の処理は行わない
        if (direction.sqrMagnitude === 0) {
            return;
        }
        
        // 斜め移動のためにベクトル正規化
        direction.normalize();
        
        // 低速キーが押されているかどうか判定
        const isSlow = 
            Input.getKey(KeyCode.ShiftLeft) ||
            Input.getKey(KeyCode.ShiftRight);
        
        // 最終的なスピードを決定
        const speed = isSlow ? this.slowMoveSpeed : this.moveSpeed;
        
        // 最終的なスピードをもとに座標を移動
        this.transform.x += direction.x * speed * deltaTime;
        this.transform.y += direction.y * speed * deltaTime;
        
        // 画面の範囲内にクランプ
        if (this.boundsProvider !== undefined) {
            this.transform.x = clamp(this.transform.x, 0, this.boundsProvider.width);
            this.transform.y = clamp(this.transform.y, 0, this.boundsProvider.height);
        }
    }

    /**
     * プレイヤーのショット処理
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    #shot(deltaTime) {
        if (!Input.getKey(KeyCode.Z)) {
            return;
        }
        
        if (this.shotTimer > 0) {
            return;
        }
        
        this.shotTimer = this.shotCooldown;
        this.onShot?.(this.gameObject);
    }

    /**
     * プレイヤーのボム処理
     * @param deltaTime {number} 前回のフレームからの経過時間（秒）
     */
    #bomb(deltaTime) {
        if (!Input.getKeyDown(KeyCode.X)) {
            return;
        }
        
        if (this.bombTimer > 0) {
            return;
        }
        
        this.bombTimer = this.bombCooldown;
    }
}
