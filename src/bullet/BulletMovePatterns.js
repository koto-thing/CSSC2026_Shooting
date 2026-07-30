import { Vector2 } from "../engine/index.js";

/**
 * 弾を直線的に移動させる関数
 * @param bullet 弾のゲームオブジェクト
 * @param direction 弾の移動方向（正規化されたベクトル）
 * @param moveSpeed 弾の移動速度
 * @param deltaTime 前回のフレームからの経過時間（秒）
 */
function moveStraight(bullet, direction, moveSpeed, deltaTime) {
  bullet.transform.x += direction.x * moveSpeed * deltaTime;
  bullet.transform.y += direction.y * moveSpeed * deltaTime;
}

/**
 * 弾に最も近い敵を取得する関数
 * @param bullet 弾のゲームオブジェクト
 * @param enemies 敵のゲームオブジェクトの配列
 * @returns {null|any} 最も近い敵のゲームオブジェクト、存在しない場合はnull
 */
function nearestEnemy(bullet, enemies) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const enemy of enemies) {
    if (!enemy.active) {
      continue;
    }

    const distance = Vector2.distance(bullet.transform, enemy.transform);
    if (distance < nearestDistance) {
      nearest = enemy;
      nearestDistance = distance;
    }
  }

  return nearest;
}

/**
 * 弾の移動パターンを定義するオブジェクト
 * @type {{straight(*, *, *, *): void, homing(*, *, *, *): void}}
 */
export const BulletMovePatterns = {
  /**
   * 弾を直線的に移動させるパターン
   * @param bullet 弾のゲームオブジェクト
   * @param deltaTime 前回のフレームからの経過時間（秒）
   * @param state 弾の状態を保持するオブジェクト
   * @param context 弾の移動に関するコンテキスト情報を保持するオブジェクト
   */
  straight(bullet, deltaTime, state, context) {
    moveStraight(bullet, context.direction, context.moveSpeed, deltaTime);
  },

  /**
   * 弾をホーミングさせるパターン
   * @param bullet 弾のゲームオブジェクト
   * @param deltaTime 前回のフレームからの経過時間（秒）
   * @param state 弾の状態を保持するオブジェクト
   * @param context 弾の移動に関するコンテキスト情報を保持するオブジェクト
   */
  homing(bullet, deltaTime, state, context) {
    if (state.direction === undefined) {
      state.direction = context.direction.normalized;
    }

    // 敵のリストを取得し、最も近い敵をターゲットとして取得する
    const enemies = context.config.enemyProvider?.() ?? [];
    const target = nearestEnemy(bullet, enemies);

    // ターゲットが存在する場合は、ターゲットの方向に向かって弾を回転させる
    if (target !== null) {
      // ターゲットの方向を計算する
      const desired = Vector2.subtract(target.transform, bullet.transform).normalized;

      // 弾の現在の方向とターゲットの方向の間を補間する
      const turnRate = context.config.turnRate ?? 8;
      const t = Math.min(1, turnRate * deltaTime);

      // 弾の方向を更新する
      state.direction = new Vector2(
        state.direction.x + (desired.x - state.direction.x) * t,
        state.direction.y + (desired.y - state.direction.y) * t,
      ).normalized;
    }

    // 弾を現在の方向に沿って移動させる
    moveStraight(bullet, state.direction, context.moveSpeed, deltaTime);
  },
};
