export const EnemyMovePatterns = {
  /** 敵を真下へ移動させる */
  straightDown(enemy, deltaTime, state, config) {
    enemy.transform.y += config.moveSpeed * deltaTime;
  },

  /** 敵を左右に蛇行させながら下へ移動させる */
  zigzag(enemy, deltaTime, state, config) {
    enemy.transform.y += config.moveSpeed * deltaTime;

    const amplitude = config.amplitude ?? 60;
    const frequency = config.frequency ?? 4;

    enemy.transform.x = state.startX + Math.sin(state.age * frequency) * amplitude;
  },

  /** 敵を指定したY座標まで下へ移動させる */
  stopAtY(enemy, deltaTime, state, config) {
    const stopY = config.stopAtY ?? config.stopY ?? 120;

    if (enemy.transform.y < stopY) {
      enemy.transform.y += config.moveSpeed * deltaTime;
    }
  },
};
