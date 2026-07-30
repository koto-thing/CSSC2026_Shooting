/**
 * CreateJSだけで描く、疑似3Dの宇宙背景。
 * 星と薄い星雲を奥から手前へ流して、ループする空間に見せる。
 */
export class GameplaySpaceBackground {
  constructor() {
    this.view = new createjs.Container();
    this.sky = new createjs.Shape();
    this.dynamicLayer = new createjs.Shape();

    this.view.addChild(this.sky);
    this.view.addChild(this.dynamicLayer);

    this.bounds = { x: 0, y: 0, width: 1, height: 1 };
    this.time = 0;
    this.stars = [];
    this.nebulae = [];

    this.#createStars(150);
    this.#createNebulae(9);
  }

  /**
   * 背景を描く範囲を更新する。
   * @param {{x: number, y: number, width: number, height: number}} bounds
   */
  resize(bounds) {
    this.bounds = {
      x: Math.floor(bounds.x),
      y: Math.floor(bounds.y),
      width: Math.max(1, Math.floor(bounds.width)),
      height: Math.max(1, Math.floor(bounds.height)),
    };

    this.#drawSky();
    this.#drawDynamicLayer();
  }

  /**
   * 背景アニメーションを更新する。
   * @param {number} deltaTime
   */
  tick(deltaTime) {
    this.time += deltaTime;

    for (const star of this.stars) {
      star.z -= deltaTime * star.speed;

      if (star.z <= 0.08) {
        this.#resetStar(star, true);
      }
    }

    for (const nebula of this.nebulae) {
      nebula.y += deltaTime * nebula.speed;

      if (nebula.y > 1.18) {
        this.#resetNebula(nebula, true);
      }
    }

    this.#drawDynamicLayer();
  }

  #createStars(count) {
    this.stars.length = 0;

    for (let i = 0; i < count; i += 1) {
      const star = {};
      this.#resetStar(star, false);
      this.stars.push(star);
    }
  }

  #createNebulae(count) {
    this.nebulae.length = 0;

    for (let i = 0; i < count; i += 1) {
      const nebula = {};
      this.#resetNebula(nebula, false);
      this.nebulae.push(nebula);
    }
  }

  #resetStar(star, startAtBack) {
    star.x = Math.random() * 2 - 1;
    star.y = Math.random() * 2 - 1;
    star.z = startAtBack ? 1 : 0.08 + Math.random() * 0.92;
    star.speed = 0.16 + Math.random() * 0.34;
    star.size = 0.45 + Math.random() * 1.4;
    star.twinkle = Math.random() * Math.PI * 2;
  }

  #resetNebula(nebula, startAbove) {
    nebula.x = Math.random();
    nebula.y = startAbove ? -0.18 - Math.random() * 0.2 : Math.random() * 1.2 - 0.1;
    nebula.radius = 0.18 + Math.random() * 0.34;
    nebula.speed = 0.012 + Math.random() * 0.026;
    nebula.alpha = 0.045 + Math.random() * 0.06;
    nebula.color = Math.random() > 0.45 ? "74, 95, 190" : "125, 60, 160";
  }

  #drawSky() {
    const { x, y, width, height } = this.bounds;
    const g = this.sky.graphics;

    g.clear()
      .beginLinearGradientFill(["#030510", "#07132d", "#12091d"], [0, 0.58, 1], x, y, x, y + height)
      .drawRect(x, y, width, height)
      .endFill();

    this.sky.cache(x, y, width, height);
  }

  #drawDynamicLayer() {
    const { x, y, width, height } = this.bounds;
    const g = this.dynamicLayer.graphics;

    g.clear();

    this.#drawNebulae(g);
    this.#drawStarStreaks(g);
    this.#drawStars(g);
    this.#drawVignette(g);

    this.dynamicLayer.cache(x, y, width, height);
  }

  #drawNebulae(g) {
    const { x, y, width, height } = this.bounds;

    for (const nebula of this.nebulae) {
      const centerX = x + nebula.x * width;
      const centerY = y + nebula.y * height;
      const radius = nebula.radius * Math.max(width, height);

      g.beginRadialGradientFill(
        [
          `rgba(${nebula.color}, ${nebula.alpha})`,
          `rgba(${nebula.color}, ${nebula.alpha * 0.3})`,
          "rgba(0, 0, 0, 0)",
        ],
        [0, 0.5, 1],
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius,
      )
        .drawCircle(centerX, centerY, radius)
        .endFill();
    }
  }

  #drawStars(g) {
    const { x, y, width, height } = this.bounds;
    const centerX = x + width / 2;
    const centerY = y + height * 0.53;
    const perspective = Math.min(width, height) * 0.56;

    for (const star of this.stars) {
      const depth = 1 / star.z;
      const screenX = centerX + star.x * perspective * depth;
      const screenY = centerY + star.y * perspective * depth;

      if (screenX < x || screenX > x + width || screenY < y || screenY > y + height) {
        continue;
      }

      const near = 1 - star.z;
      const alpha = Math.min(1, 0.18 + near * 0.82);
      const radius = star.size * (0.45 + near * 1.9);
      const pulse = 0.75 + Math.sin(this.time * 4 + star.twinkle) * 0.25;

      g.beginFill(`rgba(220, 238, 255, ${alpha * pulse})`)
        .drawCircle(screenX, screenY, radius)
        .endFill();

      if (near > 0.65) {
        const trail = 5 + near * 16;
        g.setStrokeStyle(Math.max(1, radius * 0.6))
          .beginStroke(`rgba(130, 170, 255, ${alpha * 0.28})`)
          .moveTo(screenX, screenY)
          .lineTo(
            centerX + star.x * perspective * (1 / Math.min(1, star.z + 0.08)),
            centerY + star.y * perspective * (1 / Math.min(1, star.z + 0.08)) + trail,
          )
          .endStroke();
      }
    }
  }

  #drawStarStreaks(g) {
    const { x, y, width, height } = this.bounds;
    const drift = (this.time * 42) % (height * 0.35);

    for (let i = 0; i < 7; i += 1) {
      const lineX = x + ((i * 0.19 + 0.08) % 1) * width;
      const lineY = y + ((i * 0.31) % 1) * height + drift - height * 0.22;
      const length = height * (0.08 + (i % 3) * 0.025);
      const alpha = 0.07 + (i % 2) * 0.035;

      g.setStrokeStyle(1.2, "round")
        .beginStroke(`rgba(92, 126, 220, ${alpha})`)
        .moveTo(lineX, lineY)
        .lineTo(lineX - width * 0.07, lineY + length)
        .endStroke();
    }
  }

  #drawVignette(g) {
    const { x, y, width, height } = this.bounds;

    g.beginLinearGradientFill(
      ["rgba(0, 0, 0, 0.38)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.34)"],
      [0, 0.45, 1],
      x,
      y,
      x + width,
      y,
    )
      .drawRect(x, y, width, height)
      .endFill();
  }
}
