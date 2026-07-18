import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { PlayerControllerComponent } from "./PlayerControllerComponent.js";
import { SphereShaderFilter } from "../effects/SphereShaderFilter.js";

/** プレイヤーが操作する自機を表すゲームオブジェクト */
export class Player extends GameObject {
    /** プレイヤーを初期化する */
    constructor({ boundsProvider, onShot } = {}) {
        const view = new createjs.Shape();
        
        view.graphics
            .beginFill("#44aaff")
            .drawCircle(0, 0, 12);
        
        view.filters = [new SphereShaderFilter()];
        view.cache(-12, -12, 24, 24);
        
        super("player", view);

        this.hp = 10;
        this.shotSlots = [];
        
        this.addComponent(new CircleColliderComponent({ radius: 12 }));
        this.addComponent(new PlayerControllerComponent({ boundsProvider, onShot }));
    }
}
