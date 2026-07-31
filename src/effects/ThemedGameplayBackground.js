const THEMES = {
  forest: { sky: ["#071421", "#183a4a", "#101624"], glow: "82,224,202", accent: "#b9fff2" },
  lake: { sky: ["#070d2d", "#132a62", "#261b54"], glow: "85,132,255", accent: "#b7caff" },
  dream: { sky: ["#170a32", "#4a1f67", "#15103a"], glow: "229,112,255", accent: "#ffd3ff" },
  city: { sky: ["#080a20", "#151b45", "#09091a"], glow: "91,121,255", accent: "#8fe8ff" },
  moon: { sky: ["#090a12", "#24283c", "#080911"], glow: "185,194,221", accent: "#fff7d1" },
  pure: { sky: ["#260711", "#670f2d", "#18030b"], glow: "255,58,105", accent: "#ffffff" },
};

/** 外部画像を使わず、各ステージ固有の疑似3D空間を生成描画する。 */
export class ThemedGameplayBackground {
  constructor() {
    this.view = new createjs.Container();
    this.sky = new createjs.Shape();
    this.dynamicLayer = new createjs.Shape();
    this.view.addChild(this.sky, this.dynamicLayer);
    this.bounds = { x: 0, y: 0, width: 1, height: 1 };
    this.time = 0;
    this.themeName = "forest";
    this.theme = THEMES.forest;
    this.particles = Array.from({ length: 110 }, (_, index) => ({
      x: ((index * 73) % 113) / 113,
      y: ((index * 47) % 127) / 127,
      z: 0.15 + ((index * 29) % 83) / 100,
      size: 0.5 + (index % 5) * 0.32,
      phase: index * 1.79,
    }));
  }

  setTheme(themeName = "forest") {
    this.themeName = THEMES[themeName] === undefined ? "forest" : themeName;
    this.theme = THEMES[this.themeName];
    this.#drawSky();
    this.#drawDynamicLayer();
  }

  resize(bounds) {
    this.bounds = {
      ...bounds,
      width: Math.max(1, bounds.width),
      height: Math.max(1, bounds.height),
    };
    this.#drawSky();
    this.#drawDynamicLayer();
  }

  tick(deltaTime) {
    this.time += deltaTime;
    this.#drawDynamicLayer();
  }

  #drawSky() {
    const { x, y, width, height } = this.bounds;
    this.sky.graphics
      .clear()
      .beginLinearGradientFill(this.theme.sky, [0, 0.55, 1], x, y, x, y + height)
      .drawRect(x, y, width, height)
      .endFill();
    this.sky.cache(x, y, width, height);
  }

  #drawDynamicLayer() {
    const { x, y, width, height } = this.bounds;
    const g = this.dynamicLayer.graphics;
    const centerX = x + width / 2;
    const horizon = y + height * 0.32;
    g.clear();

    if (this.themeName === "city") {
      g.setStrokeStyle(1).beginStroke(`rgba(${this.theme.glow},.22)`);
      for (let row = 0; row < 15; row++) {
        const depth = row / 14;
        const py = horizon + depth * depth * height * 0.72;
        g.moveTo(x, py).lineTo(x + width, py);
      }
      for (let column = -8; column <= 8; column++) {
        g.moveTo(centerX, horizon).lineTo(centerX + column * width * 0.16, y + height);
      }
      g.endStroke();
    } else if (this.themeName === "lake" || this.themeName === "dream") {
      for (let ring = 0; ring < 9; ring++) {
        const radius = ((ring * 71 + this.time * 28) % (height * 0.66)) + 20;
        g.setStrokeStyle(1.4)
          .beginStroke(`rgba(${this.theme.glow},${Math.max(0.025, 0.2 * (1 - radius / height))})`)
          .drawEllipse(centerX - radius, horizon - radius * 0.22, radius * 2, radius * 0.44)
          .endStroke();
      }
    } else if (this.themeName === "moon" || this.themeName === "pure") {
      const radius = Math.min(width, height) * (this.themeName === "pure" ? 0.25 : 0.2);
      const moonY = y + height * 0.25;
      g.beginRadialGradientFill(
        [this.theme.accent, `rgba(${this.theme.glow},.5)`, "rgba(0,0,0,0)"],
        [0, 0.55, 1],
        centerX,
        moonY,
        0,
        centerX,
        moonY,
        radius * 1.65,
      )
        .drawCircle(centerX, moonY, radius * 1.65)
        .endFill();
      for (let ray = 0; ray < 18; ray++) {
        const angle = ray * (Math.PI / 9) + this.time * (this.themeName === "pure" ? 0.16 : 0.04);
        const length = radius * (1.4 + (ray % 3) * 0.35);
        g.setStrokeStyle(ray % 3 === 0 ? 2 : 1)
          .beginStroke(`rgba(${this.theme.glow},${ray % 3 === 0 ? 0.2 : 0.08})`)
          .moveTo(centerX, moonY)
          .lineTo(centerX + Math.cos(angle) * length, moonY + Math.sin(angle) * length)
          .endStroke();
      }
    } else {
      for (let row = 0; row < 12; row++) {
        const py = y + (((row * height) / 11 + this.time * 30) % height);
        const spread = 12 + (py / height) * 32;
        for (let column = -3; column <= 3; column++) {
          g.beginFill(`rgba(${this.theme.glow},${0.04 + row * 0.006})`)
            .drawPolyStar(centerX + column * spread, py, 4 + row * 0.15, 6, 0.45, this.time * 12)
            .endFill();
        }
      }
    }

    for (const particle of this.particles) {
      const py = y + ((particle.y + this.time * (0.02 + particle.z * 0.06)) % 1) * height;
      const px = x + particle.x * width + Math.sin(this.time + particle.phase) * 5;
      g.beginFill(`rgba(${this.theme.glow},${0.16 + particle.z * 0.42})`)
        .drawCircle(px, py, particle.size * (0.6 + particle.z))
        .endFill();
    }

    g.beginLinearGradientFill(
      ["rgba(0,0,0,.48)", "rgba(0,0,0,0)", "rgba(0,0,0,.44)"],
      [0, 0.5, 1],
      x,
      y,
      x + width,
      y,
    )
      .drawRect(x, y, width, height)
      .endFill();
    this.dynamicLayer.cache(x, y, width, height);
  }
}
