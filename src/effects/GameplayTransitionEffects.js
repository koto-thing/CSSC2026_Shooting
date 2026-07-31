export class GameplayTransitionEffects {
  constructor({ root }) {
    this.root = root;
    this.view = new createjs.Container();
    this.flash = new createjs.Shape();
    this.ring = new createjs.Shape();
    this.view.addChild(this.flash, this.ring);
    this.root.addChild(this.view);
    this.bounds = { x: 0, y: 0, width: 1, height: 1 };
    this.timer = 0;
    this.duration = 0;
    this.mode = "clear";
    this.origin = { x: 0, y: 0 };
  }

  layout(bounds) {
    this.bounds = bounds;
  }

  playClear(x, y) {
    this.mode = "clear";
    this.timer = 0.5;
    this.duration = 0.5;
    this.origin = { x, y };
  }

  playHit(x, y) {
    this.mode = "hit";
    this.timer = 0.7;
    this.duration = 0.7;
    this.origin = { x, y };
  }

  tick(deltaTime) {
    if (this.timer <= 0) {
      this.flash.graphics.clear();
      this.ring.graphics.clear();
      return;
    }
    this.timer -= deltaTime;
    const progress = 1 - Math.max(0, this.timer) / this.duration;
    const { x, y, width, height } = this.bounds;
    const hit = this.mode === "hit";
    this.flash.graphics
      .clear()
      .beginFill(
        hit
          ? `rgba(255,35,80,${(1 - progress) * 0.34})`
          : `rgba(255,255,255,${(1 - progress) * 0.18})`,
      )
      .drawRect(x, y, width, height)
      .endFill();
    const radius = (20 + progress * Math.max(width, height) * 0.9) * (hit ? 0.72 : 1);
    this.ring.graphics
      .clear()
      .setStrokeStyle(Math.max(1, 8 * (1 - progress)))
      .beginStroke(hit ? `rgba(255,72,122,${1 - progress})` : `rgba(185,225,255,${1 - progress})`)
      .drawCircle(this.origin.x, this.origin.y, radius)
      .endStroke();
  }

  destroy() {
    this.view.removeAllChildren();
    this.view.parent?.removeChild(this.view);
  }
}
