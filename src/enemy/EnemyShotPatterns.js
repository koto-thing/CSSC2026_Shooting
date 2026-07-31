import { Vector2 } from "../engine/index.js";

/** 角度から正規化された方向ベクトルを生成する */
function directionFromAngle(degrees) {
  const radians = (degrees * Math.PI) / 180;

  return new Vector2(Math.cos(radians), Math.sin(radians));
}

/**
 * 敵弾のオプションを取得する
 * @param context 敵弾に関するコンテキスト
 * @returns {{damage, hitRadius, hitShape, hitWidth, hitHeight, visualType, visualConfig}}
 */
function enemyBulletOptions(context) {
  return {
    damage: context.config.bulletDamage ?? 1,
    hitRadius: context.config.bulletHitRadius ?? 6,
    hitShape: context.config.bulletHitShape ?? "circle",
    hitWidth: context.config.bulletHitWidth,
    hitHeight: context.config.bulletHitHeight,
    visualType: context.config.bulletVisualType ?? "enemyBlueGlow",
    visualConfig: context.config.bulletVisualConfig ?? {},
  };
}

function aimedAngle(enemy, context) {
  const player = context.bulletManager.playerProvider?.();
  if (player === null || player === undefined) {
    return 90;
  }
  return (
    (Math.atan2(player.transform.y - enemy.transform.y, player.transform.x - enemy.transform.x) *
      180) /
    Math.PI
  );
}

function spawnAtAngle(enemy, context, angle, overrides = {}) {
  context.bulletManager.spawnBullet({
    owner: "enemy",
    x: enemy.transform.x,
    y: enemy.transform.y,
    direction: directionFromAngle(angle),
    moveSpeed: context.config.bulletSpeed ?? 220,
    ...enemyBulletOptions(context),
    ...overrides,
  });
}

/**
 * 敵の弾の生成の仕方を定義している
 * @type {{none(*, *), singleDown(*, *): void, fan3(*, *): void, circle12(*, *): void, circle12WithOffset(*, *): void, circle24(*, *): void}}
 */
export const EnemyShotPattern = {
  /**
   * 弾を発射しない
   */
  none(_enemy, _context) {},

  /**
   * 真下へ1発の弾を発射する
   * @param enemy 敵のゲームオブジェクト
   * @param context 敵弾に関するコンテキスト
   */
  singleDown(enemy, context) {
    context.bulletManager.spawnBullet({
      owner: "enemy",
      x: enemy.transform.x,
      y: enemy.transform.y,
      direction: new Vector2(0, 1),
      moveSpeed: context.config.bulletSpeed ?? 300,
      ...enemyBulletOptions(context),
    });
  },

  /**
   * 扇状に3発の弾を発射する
   * @param enemy 敵のゲームオブジェクト
   * @param context 敵弾に関するコンテキスト
   */
  fan3(enemy, context) {
    const speed = context.config.bulletSpeed ?? 300;
    const angles = [75, 90, 105];

    for (const angle of angles) {
      context.bulletManager.spawnBullet({
        owner: "enemy",
        x: enemy.transform.x,
        y: enemy.transform.y,
        direction: directionFromAngle(angle),
        moveSpeed: speed,
        ...enemyBulletOptions(context),
      });
    }
  },

  /**
   * 全方向へ12発の弾を発射する
   * @param enemy 敵のゲームオブジェクト
   * @param context 敵弾に関するコンテキスト
   */
  circle12(enemy, context) {
    const speed = context.config.bulletSpeed ?? 220;

    for (let i = 0; i < 12; i++) {
      const angle = i * 30;

      context.bulletManager.spawnBullet({
        owner: "enemy",
        x: enemy.transform.x,
        y: enemy.transform.y,
        direction: directionFromAngle(angle),
        moveSpeed: speed,
        ...enemyBulletOptions(context),
      });
    }
  },

  /**
   * 全方向へ12発の弾を発射するが、angleを発射ごとに少しずつずらす
   * @param enemy 敵のゲームオブジェクト
   * @param context 敵弾に関するコンテキスト
   */
  circle15WithOffset(enemy, context) {
    const speed = context.config.bulletSpeed ?? 220;
    const offsetStep = context.config.angleOffsetStep ?? 15;
    const offset = (context.state.shotCount * offsetStep) % 360;

    for (let i = 0; i < 15; i++) {
      const angle = i * 24 + offset;

      context.bulletManager.spawnBullet({
        owner: "enemy",
        x: enemy.transform.x,
        y: enemy.transform.y,
        direction: directionFromAngle(angle),
        moveSpeed: speed,
        ...enemyBulletOptions(context),
      });
    }

    context.state.shotCount++;
  },

  /**
   * 全方向へ24発の弾を発射する
   * @param enemy 敵のゲームオブジェクト
   * @param context 敵弾に関するコンテキスト
   */
  circle24(enemy, context) {
    const speed = context.config.bulletSpeed ?? 220;

    for (let i = 0; i < 24; i++) {
      const angle = i * 15;

      context.bulletManager.spawnBullet({
        owner: "enemy",
        x: enemy.transform.x,
        y: enemy.transform.y,
        direction: directionFromAngle(angle),
        moveSpeed: speed,
        ...enemyBulletOptions(context),
      });
    }
  },

  aimedFan(enemy, context) {
    const center = aimedAngle(enemy, context);
    const count = context.config.fanCount ?? 7;
    const spread = context.config.fanSpread ?? 9;
    for (let index = 0; index < count; index++) {
      const offset = (index - (count - 1) / 2) * spread;
      spawnAtAngle(enemy, context, center + offset);
    }
    context.state.shotCount++;
  },

  doubleSpiral(enemy, context) {
    const count = context.config.ringCount ?? 18;
    const offset = context.state.shotCount * (context.config.angleOffsetStep ?? 11);
    for (let index = 0; index < count; index++) {
      const angle = offset + (index * 360) / count;
      spawnAtAngle(enemy, context, angle, {
        movePattern: index % 2 === 0 ? "accelerated" : "straight",
        moveConfig: { acceleration: 80, maxSpeed: (context.config.bulletSpeed ?? 190) * 1.8 },
        visualType: index % 2 === 0 ? "enemyRedOrb" : "enemyBlueGlow",
      });
    }
    context.state.shotCount++;
  },

  lunarWave(enemy, context) {
    const count = context.config.waveCount ?? 13;
    const center = aimedAngle(enemy, context);
    for (let index = 0; index < count; index++) {
      const offset = (index - (count - 1) / 2) * 13;
      spawnAtAngle(enemy, context, center + offset, {
        movePattern: "wave",
        moveConfig: { amplitude: index % 2 === 0 ? 62 : -62, frequency: 5.2 },
        visualType: index % 2 === 0 ? "enemyBlueGlow" : "enemyPurpleOval",
      });
    }
    context.state.shotCount++;
  },

  pureRing(enemy, context) {
    const count = context.config.ringCount ?? 28;
    const offset = (context.state.shotCount % 2) * (180 / count);
    for (let index = 0; index < count; index++) {
      spawnAtAngle(enemy, context, offset + (index * 360) / count, {
        movePattern: "decelerateThenGo",
        moveConfig: { holdTime: 0.65, acceleration: 260, maxSpeed: 420 },
        visualType: index % 3 === 0 ? "enemyRedOrb" : "enemyWhiteOrb",
      });
    }
    context.state.shotCount++;
  },
};
