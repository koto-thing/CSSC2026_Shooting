import { Scene } from "../engine/index.js";

export class TitleScene extends Scene {
    constructor({ sceneManager, assetManager }) {
        super();

        this.sceneManager = sceneManager;
        this.assetManager = assetManager;

        this.titleText = null;
        this.startText = null;
    }

    enter() {
        const background = new createjs.Shape();

        background.graphics
            .beginFill("#202030")
            .drawRect(0, 0, 500, 300);

        this.titleText = new createjs.Text(
            "SIMPLE SHOOTING",
            "32px sans-serif",
            "#ffffff",
        );

        this.titleText.textAlign = "center";
        this.titleText.x = 250;
        this.titleText.y = 80;

        this.startText = new createjs.Text(
            "CLICK TO START",
            "20px sans-serif",
            "#ffffff",
        );

        this.startText.textAlign = "center";
        this.startText.x = 250;
        this.startText.y = 190;
        this.startText.cursor = "pointer";

        this.startText.on("click", () => {
            this.sceneManager.changeScene("game");
        });

        this.root.addChild(
            background,
            this.titleText,
            this.startText,
        );
    }

    tick() {
        const alphaSpeed = 2;

        this.startText.alpha =
            0.5 + Math.sin(createjs.Ticker.getTime() / 1000 * alphaSpeed) * 0.5;
    }

    exit() {
        console.log("Exiting TitleScene");
    }
}
