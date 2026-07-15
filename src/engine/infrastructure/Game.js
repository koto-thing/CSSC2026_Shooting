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

        createjs.Ticker.framerate = 60;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

        Input.initialize(canvas);
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

        this.stage.removeAllChildren();
        this.stage.removeAllEventListeners();
    }
}
