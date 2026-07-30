import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { HitodamaShaderSurface } from "../effects/HitodamaShaderSurface.js";
import { EnemyControllerComponent } from "./EnemyControllerComponent.js";
import { BossHpVisual } from "./BossHpVisual.js";
import { FastEnemyVisual } from "./FastEnemyVisual.js";

/**
 * 敵キャラクターを表すゲームオブジェクト
 */
export class Enemy extends GameObject {
  /** 敵を初期化する */
  constructor({ boundsProvider, bulletManager, spawnPosition, enemyType, root } = {}) {
    const radius = enemyType?.radius ?? 12;
    const color = enemyType?.color ?? "#f58220";
    const visualType = enemyType?.visualType ?? "circle";

    let view;
    let shaderSurface = null;
    let fastVisual = null;

    if (visualType === "hitodama") {
      const width = radius * 3.8;
      const height = radius * 5.0;

      shaderSurface = new HitodamaShaderSurface({
        width,
        height,
        phase: Math.random() * Math.PI * 2,
      });
      view = new createjs.Bitmap(shaderSurface.canvas);
      view.regX = shaderSurface.canvas.width / 2;
      view.regY = shaderSurface.canvas.height * 0.68;
    } else if (visualType === "fastTrail") {
      fastVisual = new FastEnemyVisual({
        trailDuration: enemyType?.trailDuration,
        sampleDistance: enemyType?.trailSampleDistance,
      });
      view = fastVisual.view;
    } else {
      view = new createjs.Shape();
      view.graphics.beginFill(color).drawCircle(0, 0, radius);

      view.cache(-radius, -radius, radius * 2, radius * 2);
    }

    super("enemy", view);

    this.hp = enemyType?.hp;
    this.maxHp = enemyType?.hp ?? 1;
    this.radius = radius;
    this.color = color;
    this.shaderSurface = shaderSurface;
    this.fastVisual = fastVisual;

    if (spawnPosition !== undefined) {
      this.transform.position = spawnPosition;
    }

    this.addComponent(new CircleColliderComponent({ radius }));
    this.addComponent(
      new EnemyControllerComponent({
        boundsProvider,
        bulletManager,
        moveSpeed: enemyType?.moveSpeed,
        shotCooldown: enemyType?.shotCooldown,
        movePattern: enemyType?.movePattern,
        moveConfig: enemyType,
        shotPattern: enemyType?.shotPattern,
        shotConfig: enemyType,
      }),
    );

    if (enemyType?.isBoss) {
      this.addComponent(
        new BossHpVisual({
          root,
          radius: enemyType.hpBarRadius ?? radius + 12,
          lineWidth: enemyType.hpBarLineWidth ?? 6,
        }),
      );
    }
  }

  /**
   * シェーダー時刻を進め、先端の揺らぎを再描画する
   */
  tick(deltaTime) {
    super.tick(deltaTime);

    if (this.active && this.shaderSurface !== null) {
      this.shaderSurface.tick(deltaTime);
    }

    if (this.active && this.fastVisual !== null) {
      this.fastVisual.tick(deltaTime, this.transform.x, this.transform.y);
    }
  }

  /**
   * 専用WebGL描画面を解放してから敵オブジェクトを破棄する
   */
  destroy() {
    this.shaderSurface?.destroy();
    this.shaderSurface = null;
    this.fastVisual = null;
    super.destroy();
  }
}
