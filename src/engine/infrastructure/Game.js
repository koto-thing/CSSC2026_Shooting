import { Input } from "./Input.js";

export class Game {
    /**
     * コンストラクタ
     * @param canvasId {string} キャンバスのID
     */
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Canvas ${canvasId} not found`);
        }

        this.canvas = canvas;
        this.stage = new createjs.Stage(canvas);

        this.isRunning = false;
        this.tickHandler = null;
        this.resizeListeners = new Set();
        this.resizeHandler = () => {
            this.resizeCanvas();
        };

        createjs.Ticker.framerate = 60;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

        window.addEventListener("resize", this.resizeHandler);
        this.resizeCanvas();

        Input.initialize(canvas);
    }

    /**
     * ゲームの幅を取得する
     * @returns {*}
     */
    get width() {
        return this.canvas.width;
    }

    /**
     * ゲームの高さを取得する
     * @returns {*}
     */
    get height() {
        return this.canvas.height;
    }

    /**
     * ゲームのリサイズイベントを購読する
     * @param listener {function({width: number, height: number}): void} リサイズイベントのリスナー
     * @returns {(function(): void)|*} リスナーの購読を解除する関数
     */
    onResize(listener) {
        this.resizeListeners.add(listener);
        listener({
            width: this.width,
            height: this.height,
        });

        return () => {
            this.resizeListeners.delete(listener);
        };
    }

    /**
     * ゲームのキャンバスをリサイズする
     */
    resizeCanvas() {
        const width = Math.max(1, Math.floor(window.innerWidth));
        const height = Math.max(1, Math.floor(window.innerHeight));

        if (this.canvas.width === width && this.canvas.height === height) {
            return;
        }

        this.canvas.width = width;
        this.canvas.height = height;

        for (const listener of this.resizeListeners) {
            listener({ width, height });
        }

        this.stage.update();
    }

    /**
     * ゲームを開始する
     * @param updateCallback {function(number): void} 更新コールバック関数
     */
    start(updateCallback) {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        this.tickHandler = (event) => {
            const deltaTime = event.delta / 1000;

            Input.tick();

            updateCallback(deltaTime);

            this.stage.update(event);

            Input.lateTick();
        };

        createjs.Ticker.addEventListener("tick", this.tickHandler);
    }

    /**
     * ゲームを停止する
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;

        createjs.Ticker.removeEventListener("tick", this.tickHandler);

        this.tickHandler = null;
    }

    /**
     * ゲームを破棄する
     */
    dispose() {
        this.stop();
        Input.dispose();
        window.removeEventListener("resize", this.resizeHandler);

        this.stage.removeAllChildren();
        this.stage.removeAllEventListeners();
        this.resizeListeners.clear();
    }
}
