import { Input } from "./Input.js";

export class Game {
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

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

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

    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;

        createjs.Ticker.removeEventListener("tick", this.tickHandler);

        this.tickHandler = null;
    }

    dispose() {
        this.stop();
        Input.dispose();
        window.removeEventListener("resize", this.resizeHandler);

        this.stage.removeAllChildren();
        this.stage.removeAllEventListeners();
        this.resizeListeners.clear();
    }
}
