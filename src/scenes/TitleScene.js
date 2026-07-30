import { Button, Scene, Text } from "../engine/index.js";

export class TitleScene extends Scene {
  constructor({ sceneManager, assetManager }) {
    super();

    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.background = new createjs.Shape();
    this.titleText = new Text({
      text: "STARRY GARDEN RITES",
      width: 720,
      height: 80,
      font: "42px sans-serif",
      color: "#ffffff",
      textAlign: "center",
      verticalAlign: "middle",
      outlineColor: "#14162a",
      outlineWidth: 4,
    });
    this.startButton = new Button({
      text: "START",
      width: 240,
      height: 58,
      font: "22px sans-serif",
    });
    this.creditsButton = new Button({
      text: "CREDITS",
      width: 240,
      height: 58,
      font: "22px sans-serif",
    });
  }

  initialize() {
    this.startButton.onClick(() => this.sceneManager.changeScene("menu"));
    this.creditsButton.onClick(() => this.sceneManager.changeScene("credits"));
    this.root.addChild(this.background, this.titleText, this.startButton, this.creditsButton);
    this.layout();
  }

  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  layout() {
    this.background.graphics
      .clear()
      .beginLinearGradientFill(["#080914", "#202448"], [0, 1], 0, 0, 0, this.height)
      .drawRect(0, 0, this.width, this.height);

    this.titleText.x = this.width / 2 - 360;
    this.titleText.y = this.height * 0.24;
    this.startButton.x = this.width / 2 - 120;
    this.startButton.y = this.height * 0.52;
    this.creditsButton.x = this.width / 2 - 120;
    this.creditsButton.y = this.startButton.y + 76;
    this.background.cache(0, 0, this.width, this.height);
  }
}
