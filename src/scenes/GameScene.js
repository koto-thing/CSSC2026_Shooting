import { Scene } from "../engine/index.js";

export class GameScene extends Scene {
    constructor({ sceneManager, assetManager }) {
        super();

        this.sceneManager = sceneManager;
        this.assetManager = assetManager;

        this.player = null;
        this.speed = 200;
    }

    enter() {
        const background = new createjs.Shape();

        background.graphics
            .beginFill("#101010")
            .drawRect(0, 0, 500, 300);

        this.player = new createjs.Shape();

        this.player.graphics
            .beginFill("#44aaff")
            .drawRect(-20, -20, 40, 40);

        this.player.x = 250;
        this.player.y = 150;

        this.root.addChild(background, this.player);
    }

    tick(deltaTime) {
        this.player.x += this.speed * deltaTime;

        if (this.player.x > 520) {
            this.player.x = -20;
        }
    }

    exit() {
        console.log("Exiting GameScene");
    }
}
