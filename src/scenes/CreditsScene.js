import { Button, Scene, Text } from "../engine/index.js";

export class CreditsScene extends Scene {
  constructor({ sceneManager }) {
    super();
    this.sceneManager = sceneManager;
    this.background = new createjs.Shape();
    this.backButton = new Button({ text: "BACK", width: 130, height: 46, font: "18px sans-serif" });
    this.title = new Text({
      text: "CREDITS",
      width: 420,
      height: 64,
      font: "34px sans-serif",
      color: "#ffffff",
      textAlign: "center",
      verticalAlign: "middle",
    });
    this.body = new Text({
      text: "Credits will be added later.",
      width: 520,
      height: 80,
      font: "20px sans-serif",
      color: "#dbe4ff",
      textAlign: "center",
      verticalAlign: "middle",
    });
  }

  initialize() {
    this.backButton.onClick(() => this.sceneManager.changeScene("title"));
    this.root.addChild(this.background, this.backButton, this.title, this.body);
    this.layout();
  }

  resize(width, height) {
    super.resize(width, height);
    this.layout();
  }

  layout() {
    this.background.graphics.clear().beginFill("#090b18").drawRect(0, 0, this.width, this.height);
    this.backButton.x = 18;
    this.backButton.y = 18;
    this.title.x = this.width / 2 - 210;
    this.title.y = this.height * 0.24;
    this.body.x = this.width / 2 - 260;
    this.body.y = this.height * 0.42;
    this.background.cache(0, 0, this.width, this.height);
  }
}
