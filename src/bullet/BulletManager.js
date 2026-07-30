import { ColliderComponent, ObjectPool } from "../engine/index.js";

/**
 * 弾の管理を行うクラス
 */
export class BulletManager {
  /** 弾管理クラスを初期化する */
  constructor({
    bulletFactory,
    root,
    playerProvider,
    enemyProvider,
    onTargetDefeated,
    onPlayerHit,
    onGraze,
  } = {}) {
    this.bulletFactory = bulletFactory;
    this.root = root;
    this.playerProvider = playerProvider;
    this.enemyProvider = enemyProvider;
    this.onTargetDefeated = onTargetDefeated;
    this.onPlayerHit = onPlayerHit;
    this.onGraze = onGraze;
    this.nextGrazeId = 1;

    this.pool = new ObjectPool({
      createObject: () => this.createBullet(),
      onGet: (bullet) => {
        bullet.setActive(true);
      },
      onRelease: (bullet) => {
        bullet.setActive(false);
      },
      initialSize: 32,
    });
  }

  /**
   * ゲームの状態を更新する
   * @param deltaTime {number} 前回のフレームからの経過時間（秒）
   */
  tick(deltaTime) {
    // 弾の状態を更新し、衝突判定を行う
    for (const bullet of this.pool.activeObjects) {
      bullet.tick(deltaTime);
      this.checkBulletHit(bullet);
    }

    // 非アクティブな弾をプールに返却する
    this.pool.releaseInactiveObjects();
  }

  /**
   * 弾を作成する
   * @returns {*|Bullet} 作成された弾のオブジェクト
   */
  createBullet() {
    const bullet = this.bulletFactory.createBullet();
    bullet.setActive(false);
    this.root?.addChild(bullet.view);
    return bullet;
  }

  /**
   * 弾を生成する
   * @param param0
   * @param param0.owner
   * @param param0.x
   * @param param0.y
   * @param param0.direction
   * @param param0.moveSpeed
   * @param param0.damage
   * @param param0.hitShape
   * @param param0.hitWidth
   * @param param0.hitHeight
   * @param param0.visualType
   * @param param0.visualConfig
   * @returns {*}
   */
  spawnBullet({
    owner,
    x,
    y,
    direction,
    moveSpeed,
    damage = 1,
    hitRadius = 4,
    hitShape = "circle",
    hitWidth,
    hitHeight,
    movePattern = "straight",
    moveConfig = {},
    visualType = "default",
    visualConfig = {},
  } = {}) {
    const bullet = this.pool.get();

    bullet.transform.x = x;
    bullet.transform.y = y;

    bullet.configure({
      owner,
      damage,
      hitRadius,
      hitShape,
      hitWidth,
      hitHeight,
      direction,
      moveSpeed,
      movePattern,
      moveConfig,
      visualType,
      visualConfig,
    });
    bullet.grazeId = this.nextGrazeId++;
    bullet.grazed = false;

    return bullet;
  }

  /**
   * 弾がプレイヤーまたは敵に当たったかどうかをチェックする
   * @param bullet {any} チェックする弾のオブジェクト
   */
  checkBulletHit(bullet) {
    // 弾が非アクティブの場合は衝突判定を行わない
    if (!bullet.active) {
      return;
    }

    // 弾の所有者がプレイヤーの場合は敵に当たったかどうかをチェックする
    if (bullet.owner === "player") {
      const enemies = this.enemyProvider?.() ?? [];
      for (const enemy of enemies) {
        this.checkHitTarget(bullet, enemy);

        if (!bullet.active) {
          break;
        }
      }

      return;
    }

    // 弾の所有者が敵の場合はプレイヤーに当たったかどうかをチェックする
    if (bullet.owner === "enemy") {
      const player = this.playerProvider?.();
      this.checkGraze(bullet, player);
      this.checkHitTarget(bullet, player);
    }
  }

  /**
   * 弾がターゲットに当たったかどうかをチェックし、当たった場合はダメージを与える
   * @param bullet {any} チェックする弾のオブジェクト
   * @param target {any} チェックするターゲットのオブジェクト（プレイヤーまたは敵）
   */
  checkHitTarget(bullet, target) {
    // ターゲットが存在しない場合は衝突判定を行わない
    if (target === null || target === undefined || !target.active) {
      return;
    }

    // 弾がターゲットに当たったかどうかをチェックする
    if (!this.isHit(bullet, target)) {
      return;
    }

    // 弾がターゲットに当たった場合はダメージを与え、弾を非アクティブにする
    target.hp -= bullet.damage;
    bullet.setActive(false);

    if (target.name === "player") {
      this.onPlayerHit?.();
    }

    // ターゲットのHPが0以下になった場合はターゲットを非アクティブにする
    if (target.hp <= 0) {
      this.onTargetDefeated?.(target);
      target.setActive(false);
    }
  }

  /**
   * 弾とターゲットが衝突したかどうかをチェックする
   * @param a 弾A
   * @param b 弾B
   * @returns {*|boolean|boolean} 衝突した場合はtrue、そうでない場合はfalse
   */
  isHit(a, b) {
    const aCollider = a.getComponent(ColliderComponent);
    const bCollider = b.getComponent(ColliderComponent);

    return aCollider?.intersects(bCollider) ?? false;
  }

  checkGraze(bullet, player) {
    if (bullet.grazed || player === null || player === undefined || !player.active) {
      return;
    }

    const dx = bullet.transform.x - player.transform.x;
    const dy = bullet.transform.y - player.transform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > player.grazeRadius || distance <= player.hitRadius + 3) {
      return;
    }

    bullet.grazed = true;
    this.onGraze?.(bullet);
  }

  clearAll() {
    for (const bullet of this.pool.activeObjects) {
      bullet.setActive(false);
    }

    this.pool.releaseInactiveObjects();
  }
}
