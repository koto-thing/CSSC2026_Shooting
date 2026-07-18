import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { HitodamaShaderSurface } from "../effects/HitodamaShaderSurface.js";
import { EnemyControllerComponent } from "./EnemyControllerComponent.js";

/** 敵キャラクターを表すゲームオブジェクト */
export class Enemy extends GameObject {
    /** 敵を初期化する */
    constructor({ boundsProvider, bulletManager, spawnPosition, enemyType } = {}) {
        const radius = enemyType?.radius ?? 12;
        const color = enemyType?.color ?? "#f58220";
        const visualType = enemyType?.visualType ?? "circle";
        
        let view;
        let shaderSurface = null;

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
        } else {
            view = new createjs.Shape();
            view.graphics
                .beginFill(color)
                .drawCircle(0, 0, radius);

            view.cache(-radius, -radius, radius * 2, radius * 2);
        }

        super("enemy", view);

        this.hp = enemyType?.hp;
        this.maxHp = enemyType?.hp ?? 1;
        this.radius = radius;
        this.color = color;
        this.shaderSurface = shaderSurface;

        if (spawnPosition !== undefined) {
            this.transform.position = spawnPosition;
        }

        this.addComponent(new CircleColliderComponent({ radius }));
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

    /** シェーダー時刻を進め、先端の揺らぎを再描画する。 */
    tick(deltaTime) {
        super.tick(deltaTime);

        if (this.active && this.shaderSurface !== null) {
            this.shaderSurface.tick(deltaTime);
        }
    }

    /** 専用WebGL描画面を解放してから敵オブジェクトを破棄する。 */
    destroy() {
        this.shaderSurface?.destroy();
        this.shaderSurface = null;
        super.destroy();
    }
}
