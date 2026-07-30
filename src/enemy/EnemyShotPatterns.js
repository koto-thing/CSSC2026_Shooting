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
      const angle = i * 30 + offset;

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
};
