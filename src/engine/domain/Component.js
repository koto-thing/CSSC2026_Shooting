export class Component {
    /**
     * コンストラクタ
     */
    constructor() {
        this.gameObject = null;
        this.enabled = true;
        this._started = false;
    }

    /**
     * ゲームオブジェクトのトランスフォームを取得する
     * @returns {*|null}
     */
    get transform() {
        return this.gameObject?.transform ?? null;
    }

    /**
     * コンポーネントが初期化されたときに呼び出される
     */
    initialize() {
        
    }

    /**
     * コンポーネントが開始されたときに呼び出される
     */
    start() {
        
    }

    /**
     * コンポーネントが更新されるたびに呼び出される
     */
    tick() {
        
    }

    /**
     * コンポーネントが更新された後に呼び出される
     */
    lateTick() {
        
    }

    /**
     * コンポーネントが破棄されるときに呼び出される
     */
    onDestroy() {
        
    }

    /**
     * コンポーネントを破棄する
     */
    destroy() {
        this.gameObject?.destroy();
    }
}