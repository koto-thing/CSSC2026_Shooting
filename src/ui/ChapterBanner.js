import { Text } from "../engine/index.js";

export class ChapterBanner {
  constructor({ root }) {
    this.root = root;
    this.timer = 0;
    this.view = new Text({
      text: "",
      width: 520,
      height: 80,
      font: "28px sans-serif",
      color: "#ffffff",
      textAlign: "center",
      verticalAlign: "middle",
      outlineColor: "#111328",
      outlineWidth: 4,
    });
    this.view.visible = false;
    this.root.addChild(this.view);
  }

  show(stageName, chapterName) {
    this.timer = 2.2;
    this.view.visible = true;
    this.view.alpha = 1;
    this.view.setText(`${stageName}\n${chapterName}`);
  }

  layout(playArea) {
    this.view.x = playArea.x + playArea.width / 2 - 260;
    this.view.y = playArea.y + playArea.height * 0.25;
  }

  tick(deltaTime) {
    if (this.timer <= 0) {
      this.view.visible = false;
      return;
    }

    this.timer -= deltaTime;
    this.view.alpha = Math.min(1, this.timer);
  }

  destroy() {
    this.view.parent?.removeChild(this.view);
  }
}
