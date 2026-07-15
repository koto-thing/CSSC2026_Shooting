import { Scene } from "../engine/index.js";

export class GameScene extends Scene {
    constructor({ sceneManager, assetManager }) {
        super();

        this.sceneManager = sceneManager;
        this.assetManager = assetManager;

        this.player = null;
        this.background = null;
        this.speed = 200;
    }

    enter() {
        this.background = new createjs.Shape();

        this.player = new createjs.Shape();

        this.player.graphics
            .beginFill("#44aaff")
            .drawRect(-20, -20, 40, 40);

        this.player.x = this.width / 2;
        this.player.y = this.height / 2;

        this.root.addChild(this.background, this.player);
        this.layout();
    }

    tick(deltaTime) {
        this.player.x += this.speed * deltaTime;

        if (this.player.x > this.width + 20) {
            this.player.x = -20;
        }
    }

    exit() {
        console.log("Exiting GameScene");
    }

    resize(width, height) {
        super.resize(width, height);
        this.layout();
    }

    layout() {
        if (this.background === null) {
            return;
        }

        this.background.graphics
            .clear()
            .beginFill("#101010")
            .drawRect(0, 0, this.width, this.height);

        this.player.y = this.height / 2;
    }
}
