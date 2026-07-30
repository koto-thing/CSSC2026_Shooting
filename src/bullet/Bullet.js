import {
  CircleColliderComponent,
  ColliderComponent,
  EllipseColliderComponent,
  GameObject,
} from "../engine/index.js";
import { BulletControllerComponent } from "./BulletControllerComponent.js";
import { applyBulletVisual } from "./BulletVisuals.js";

/** プレイヤーまたは敵が発射する弾を表すゲームオブジェクト */
export class Bullet extends GameObject {
  /** 弾を初期化する */
  constructor({ boundsProvider, direction, moveSpeed } = {}) {
    const view = new createjs.Shape();

    applyBulletVisual(view);

    super("bullet", view);

    this.owner = null;
    this.damage = 1;

    this.addComponent(new CircleColliderComponent({ radius: 4 }));
    this.addComponent(new BulletControllerComponent({ boundsProvider, direction, moveSpeed }));
  }

  /**
   * 弾の設定を行う
   * @param param0
   * @param param0.owner
   * @param param0.damage
   * @param param0.hitRadius
   * @param param0.hitShape
   * @param param0.hitWidth
   * @param param0.hitHeight
   * @param param0.direction
   * @param param0.moveSpeed
   * @param param0.visualType
   * @param param0.visualConfig
   */
  configure({
    owner,
    damage = 1,
    hitRadius = 4,
    hitShape = "circle",
    hitWidth,
    hitHeight,
    direction,
    moveSpeed,
    movePattern = "straight",
    moveConfig = {},
    visualType = "default",
    visualConfig = {},
  } = {}) {
    this.owner = owner;
    this.damage = damage;
    this.#configureCollider({ hitShape, hitRadius, hitWidth, hitHeight });
    applyBulletVisual(this.view, { visualType, visualConfig });

    const controller = this.getComponent(BulletControllerComponent);
    controller.configure({
      direction,
      moveSpeed,
      movePattern,
      moveConfig,
    });
  }

  /** 弾の当たり判定形状を設定する */
  #configureCollider({ hitShape = "circle", hitRadius = 4, hitWidth, hitHeight } = {}) {
    const currentCollider = this.getComponent(ColliderComponent);

    if (hitShape === "ellipse") {
      if (!(currentCollider instanceof EllipseColliderComponent)) {
        this.removeComponent(currentCollider);
        this.addComponent(
          new EllipseColliderComponent({
            radiusX: (hitWidth ?? hitRadius * 2) / 2,
            radiusY: (hitHeight ?? hitRadius * 2) / 2,
          }),
        );
      } else {
        currentCollider.radiusX = (hitWidth ?? hitRadius * 2) / 2;
        currentCollider.radiusY = (hitHeight ?? hitRadius * 2) / 2;
      }

      return;
    }

    if (!(currentCollider instanceof CircleColliderComponent)) {
      this.removeComponent(currentCollider);
      this.addComponent(new CircleColliderComponent({ radius: hitRadius }));
    } else {
      currentCollider.radius = hitRadius;
    }
  }
}
