/**
 * 敵の種類定義
 * @type {{normal: {hp: number, radius: number, color: string, moveSpeed: number, shotCooldown: number, movePattern: string, shotPattern: string, bulletSpeed: number, bulletHitRadius: number, bulletVisualType: string}, fast: {hp: number, radius: number, color: string, moveSpeed: number, shotCooldown: number, movePattern: string, shotPattern: string}, shooter: {hp: number, radius: number, color: string, moveSpeed: number, shotCooldown: number, movePattern: string, stopY: number, shotPattern: string, bulletSpeed: number, bulletHitRadius: number, bulletVisualType: string}, burst: {hp: number, radius: number, color: string, moveSpeed: number, shotCooldown: number, movePattern: string, stopY: number, shotPattern: string, bulletSpeed: number, bulletHitRadius: number, bulletVisualType: string}}}
 */
export const EnemyTypes = {
  // 通常の敵
  normal: {
    hp: 3,
    radius: 12,
    color: "#756dff",
    visualType: "hitodama",
    moveSpeed: 180,
    shotCooldown: 1.0,
    movePattern: "straightDown",
    shotPattern: "singleDown",
    bulletSpeed: 260,
    bulletHitShape: "ellipse",
    bulletHitWidth: 12,
    bulletHitHeight: 26,
    bulletVisualType: "enemyPurpleOval",
  },

  // 高速で移動する敵
  fast: {
    hp: 1,
    radius: 8,
    color: "#5ce1e6",
    visualType: "fastTrail",
    trailDuration: 0.12,
    trailSampleDistance: 3,
    moveSpeed: 320,
    shotCooldown: 0,
    movePattern: "zigzag",
    shotPattern: "none",
  },

  // 弾を発射する敵
  shooter: {
    hp: 5,
    radius: 14,
    color: "#ff4d6d",
    moveSpeed: 120,
    shotCooldown: 0.8,
    movePattern: "stopAtY",
    stopY: 140,
    shotPattern: "fan3",
    bulletSpeed: 280,
    bulletHitShape: "ellipse",
    bulletHitWidth: 12,
    bulletHitHeight: 26,
    bulletVisualType: "enemyPurpleOval",
  },

  // 弾を連射する敵
  burst: {
    hp: 50,
    radius: 13,
    color: "#b967ff",
    moveSpeed: 90,
    shotCooldown: 1.5,
    movePattern: "stopAtY",
    stopY: 100,
    shotPattern: "circle15WithOffset",
    angleOffsetStep: 12,
    bulletSpeed: 180,
    bulletHitShape: "ellipse",
    bulletHitWidth: 12,
    bulletHitHeight: 26,
    bulletVisualType: "enemyBlueGlow",
  },

  boss: {
    isBoss: true,
    hp: 500,
    radius: 36,
    color: "#c83264",

    hpBarRadius: 50,
    hpBarLineWidth: 2.5,

    moveSpeed: 60,
    shotCooldown: 1.0,
    movePattern: "stopAtY",
    stopY: 120,
    shotPattern: "circle15WithOffset",

    angleOffsetStep: 12,
    bulletSpeed: 180,
    bulletHitShape: "ellipse",
    bulletHitWidth: 12,
    bulletHitHeight: 26,
    bulletVisualType: "enemyBlueGlow",
  },
};
