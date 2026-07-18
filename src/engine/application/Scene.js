/** ゲーム内の各シーンに共通するライフサイクルと表示領域を管理する基底クラス */
export class Scene {
    /** シーンを初期化する */
    constructor() {
        this.root = new createjs.Container();
        this.viewport = {
            width: 0,
            height: 0,
        };
    }

    /**
     * シーンのビューポートの幅を取得する
     * @returns {number} シーンのビューポートの幅
     */
    get width() {
        return this.viewport.width;
    }

    /**
     * シーンのビューポートの高さを取得する
     * @returns {number} シーンのビューポートの高さ
     */
    get height() {
        return this.viewport.height;
    }
    
    /**
     * シーンが開始されたときに呼び出される
     */
    enter() {
        // シーン開始時
    }

    /**
     * シーンが更新されるたびに呼び出される
     * @param deltaTime {number} 前のフレームからの経過時間（秒）
     */
    tick(deltaTime) {
        // 毎フレーム
    }
    
    /**
     * シーンが終了するときに呼び出される
     */
    exit() {
        // シーン終了時
    }

    /**
     * シーンのビューポートのサイズを変更する
     * @param width {number} ビューポートの幅
     * @param height {number} ビューポートの高さ
     */
    resize(width, height) {
        this.viewport.width = width;
        this.viewport.height = height;
    }

    /**
     * シーンを破棄する
     */
    dispose() {
        this.root.removeAllEventListeners();
        this.root.removeAllChildren();
    }
}
