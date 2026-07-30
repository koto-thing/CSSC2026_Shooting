import { Button, Text } from "../engine/index.js";

export class ResultOverlay {
  constructor({ root, onBackToMenu }) {
    this.view = new createjs.Container();
    this.background = new createjs.Shape();
    this.title = new Text({
      text: "ALL STAGES CLEAR",
      width: 460,
      height: 70,
      font: "34px sans-serif",
      color: "#ffffff",
      textAlign: "center",
      verticalAlign: "middle",
    });
    this.body = new Text({
      text: "",
      width: 460,
      height: 120,
      font: "18px monospace",
      color: "#dbe4ff",
      textAlign: "center",
      verticalAlign: "middle",
      lineHeight: 28,
    });
    this.button = new Button({
      text: "MAIN MENU",
      width: 230,
      height: 54,
      font: "20px sans-serif",
    });
    this.button.onClick(onBackToMenu);
    this.view.visible = false;
    this.view.addChild(this.background, this.title, this.body, this.button);
    root.addChild(this.view);
  }

  show(session) {
    this.body.setText(
      `SCORE ${session.score}\nGRAZE ${session.graze}\nHI SCORE ${session.highScore}`,
    );
    this.view.visible = true;
  }

  layout(width, height) {
    this.background.graphics
      .clear()
      .beginFill("rgba(8, 9, 20, 0.86)")
      .drawRect(0, 0, width, height);
    this.title.x = width / 2 - 230;
    this.title.y = height * 0.28;
    this.body.x = width / 2 - 230;
    this.body.y = this.title.y + 86;
    this.button.x = width / 2 - 115;
    this.button.y = this.body.y + 150;
  }

  destroy() {
    this.view.parent?.removeChild(this.view);
  }
}
