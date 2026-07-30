import { Text } from "../engine/index.js";

export class PauseOverlay {
  constructor({ root }) {
    this.background = new createjs.Shape();
    this.label = new Text({
      text: "PAUSE",
      width: 300,
      height: 70,
      font: "36px sans-serif",
      color: "#ffffff",
      textAlign: "center",
      verticalAlign: "middle",
    });
    this.view = new createjs.Container();
    this.view.visible = false;
    this.view.addChild(this.background, this.label);
    root.addChild(this.view);
  }

  setVisible(visible) {
    this.view.visible = visible;
  }

  layout(width, height) {
    this.background.graphics
      .clear()
      .beginFill("rgba(8, 9, 20, 0.72)")
      .drawRect(0, 0, width, height);
    this.label.x = width / 2 - 150;
    this.label.y = height / 2 - 35;
  }

  destroy() {
    this.view.parent?.removeChild(this.view);
  }
}
