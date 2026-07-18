import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { BulletControllerComponent } from "./BulletControllerComponent.js";

/** プレイヤーまたは敵が発射する弾を表すゲームオブジェクト */
export class Bullet extends GameObject {
    /** 弾を初期化する */
    constructor({ boundsProvider, direction, moveSpeed } = {}) {
        const view = new createjs.Shape();
        
        view.graphics
            .beginFill("#dc143c")
            .drawCircle(0, 0, 4);
        
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
     * @param param0.direction
     * @param param0.moveSpeed
     */
    configure({ owner, damage = 1, hitRadius = 4, direction, moveSpeed } = {}) {
        this.owner = owner;
        this.damage = damage;
        this.getComponent(CircleColliderComponent).radius = hitRadius;

        const controller = this.getComponent(BulletControllerComponent);
        controller.configure({ direction, moveSpeed });
    }
}
