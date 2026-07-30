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
    this.title = new Text({ text: "STATUS", font: "20px sans-serif", color: "#f7f9ff" });
    this.body = new Text({
      text: "",
      width: 220,
      font: "16px monospace",
      color: "#dbe4ff",
      lineHeight: 24,
      maxWidth: 220,
    });
    this.panel.addChild(this.title, this.body);
    this.body.y = 34;
    this.root.addChild(this.panel);
  }

  layout(uiArea) {
    this.panel.x = uiArea.x + 18;
    this.panel.y = uiArea.y + 28;
  }

  update({ session, stage, chapter, chapterElapsed }) {
    this.body.setText(
      [
        `HI SCORE ${session.highScore}`,
        `SCORE    ${session.score}`,
        `STAGE    ${stage?.name ?? "-"}`,
        `CHAPTER  ${chapter?.name ?? "-"}`,
        `SHOT     ${session.shot.label}`,
        `GRAZE    ${session.graze}`,
        `TIME     ${formatTime(session.elapsedSeconds)}`,
        `CH TIME  ${formatTime(chapterElapsed)}`,
        "",
        "Move  WASD / Arrows",
        "Shot  Z",
        "Focus Shift",
        "Pause Escape",
      ].join("\n"),
    );
  }

  destroy() {
    this.panel.removeAllChildren();
    this.panel.parent?.removeChild(this.panel);
  }
}
