import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { EnemyControllerComponent } from "./EnemyControllerComponent.js";

/** 敵キャラクターを表すゲームオブジェクト */
export class Enemy extends GameObject {
    /** 敵を初期化する */
    constructor({ boundsProvider, bulletManager, spawnPosition, enemyType } = {}) {
        const radius = enemyType?.radius ?? 12;
        const color = enemyType?.color ?? "#f58220";
        
        const view = new createjs.Shape();

        view.graphics
            .beginFill(color)
            .drawCircle(0, 0, radius);

        super("enemy", view);

        this.hp = enemyType?.hp;

        if (spawnPosition !== undefined) {
            this.transform.position = spawnPosition;
        }

        this.addComponent(new CircleColliderComponent({ radius: 12 }));
        this.addComponent(new EnemyControllerComponent({
            boundsProvider,
            bulletManager,
            moveSpeed: enemyType?.moveSpeed, 
            shotCooldown: enemyType?.shotCooldown,
            movePattern: enemyType?.movePattern,
            moveConfig: enemyType, 
            shotPattern: enemyType?.shotPattern,
            shotConfig: enemyType,
        }));
    }
}
