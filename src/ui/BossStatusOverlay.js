import { Text } from "../engine/index.js";

export class BossStatusOverlay {
  constructor({ root }) {
    this.root = root;
    this.view = new createjs.Container();
    this.barBack = new createjs.Shape();
    this.barFill = new createjs.Shape();
    this.timer = new Text({
      text: "",
      width: 80,
      font: "bold 22px monospace",
      color: "#ffffff",
      textAlign: "right",
      outlineColor: "#140611",
      outlineWidth: 4,
    });
    this.phase = new Text({
      text: "",
      width: 360,
      font: "bold 15px sans-serif",
      color: "#ffe4f0",
      outlineColor: "#240614",
      outlineWidth: 3,
    });
    this.view.addChild(this.barBack, this.barFill, this.timer, this.phase);
    this.view.visible = false;
    this.root.addChild(this.view);
    this.playArea = { x: 0, y: 0, width: 1, height: 1 };
  }

  layout(playArea) {
    this.playArea = playArea;
    this.view.x = playArea.x + 12;
    this.view.y = playArea.y + 8;
    this.timer.x = playArea.width - 104;
    this.phase.y = 15;
  }

  update({ boss, chapter, chapterElapsed }) {
    const visible = chapter?.type === "boss";
    this.view.visible = visible;
    if (!visible) {
      return;
    }

    const width = Math.max(80, this.playArea.width - 108);
    const ratio = boss === undefined ? 0 : Math.max(0, boss.hp / boss.maxHp);
    const remaining = Math.max(0, Math.ceil((chapter.duration ?? 0) - chapterElapsed));
    this.barBack.graphics
      .clear()
      .beginFill("rgba(8,4,18,.72)")
      .drawRoundRect(0, 0, width, 9, 4)
      .endFill();
    this.barFill.graphics
      .clear()
      .beginLinearGradientFill(["#ffffff", "#ff4f92", "#823cff"], [0, 0.45, 1], 0, 0, width, 0)
      .drawRoundRect(2, 2, Math.max(0, (width - 4) * ratio), 5, 3)
      .endFill();
    this.timer.setText(remaining.toString().padStart(2, "0"));
    this.phase.setText(`PHASE  ${chapter.name}`);
  }

  destroy() {
    this.view.removeAllChildren();
    this.view.parent?.removeChild(this.view);
  }
}
