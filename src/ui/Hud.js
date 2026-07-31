import { Text } from "../engine/index.js";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${rest}`;
}

export class Hud {
  constructor({ root }) {
    this.root = root;
    this.panel = new createjs.Container();
    this.backdrop = new createjs.Shape();
    this.rule = new createjs.Shape();
    this.title = new Text({
      text: "MISSION STATUS",
      font: "bold 19px sans-serif",
      color: "#ffffff",
    });
    this.body = new Text({
      text: "",
      width: 220,
      font: "16px monospace",
      color: "#e6ebff",
      lineHeight: 24,
      maxWidth: 220,
    });
    this.panel.addChild(this.backdrop, this.rule, this.title, this.body);
    this.body.y = 42;
    this.root.addChild(this.panel);
  }

  layout(uiArea) {
    const width = Math.max(220, Math.min(280, uiArea.width - 24));
    this.panel.x = uiArea.x + 12;
    this.panel.y = uiArea.y + 22;
    this.backdrop.graphics
      .clear()
      .beginLinearGradientFill(["rgba(9,12,31,.92)", "rgba(31,20,61,.7)"], [0, 1], 0, 0, width, 360)
      .drawRoundRect(0, 0, width, 360, 8)
      .endFill()
      .setStrokeStyle(1)
      .beginStroke("rgba(171,190,255,.5)")
      .drawRoundRect(0, 0, width, 360, 8)
      .endStroke();
    this.rule.graphics
      .clear()
      .beginLinearGradientFill(["#66ddff", "#ff5db7"], [0, 1], 0, 0, width - 24, 0)
      .drawRect(12, 31, width - 24, 2)
      .endFill();
    this.title.x = 12;
    this.title.y = 7;
    this.body.x = 12;
  }

  update({ session, stage, chapter, chapterElapsed, stageIndex, stageCount, chapterIndex }) {
    this.body.setText(
      [
        `HI SCORE  ${String(session.highScore).padStart(9, "0")}`,
        `SCORE     ${String(session.score).padStart(9, "0")}`,
        "",
        `STAGE     ${stageIndex + 1} / ${stageCount}`,
        `${stage?.name ?? "-"}`,
        `CHAPTER   ${chapterIndex + 1} / ${stage?.chapters.length ?? 0}`,
        `${chapter?.name ?? "-"}`,
        "",
        `ATTEMPT   ${session.chapterAttempts}`,
        `RETRIES   ${session.totalRetries}`,
        `GRAZE     ${session.graze}`,
        `SHOT      ${session.shot.label}`,
        `TIME      ${formatTime(session.elapsedSeconds)}`,
        `SECTION   ${formatTime(chapterElapsed)}`,
        "",
        "Z  SHOT     SHIFT  FOCUS",
        "ESC  PAUSE",
      ].join("\n"),
    );
  }

  destroy() {
    this.panel.removeAllChildren();
    this.panel.parent?.removeChild(this.panel);
  }
}
