import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { PlayerControllerComponent } from "./PlayerControllerComponent.js";

/** プレイヤーが操作する自機を表すゲームオブジェクト */
export class Player extends GameObject {
    /** プレイヤーを初期化する */
    constructor({ boundsProvider, onShot } = {}) {
        const view = new createjs.Shape();
        
        view.graphics
            .beginFill("#44aaff")
            .drawCircle(0, 0, 12);
        
        super("player", view);

        this.hp = 10;
        
        this.addComponent(new CircleColliderComponent({ radius: 12 }));
        this.addComponent(new PlayerControllerComponent({ boundsProvider, onShot }));
    }
}
