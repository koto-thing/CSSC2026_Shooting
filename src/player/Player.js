import { CircleColliderComponent, GameObject } from "../engine/index.js";
import { SphereShaderFilter } from "../effects/SphereShaderFilter.js";
import { PlayerControllerComponent } from "./PlayerControllerComponent.js";

export class Player extends GameObject {
  constructor({ boundsProvider, onShot, character } = {}) {
    const view = new createjs.Shape();
    super("player", view);

    this.color = character?.color ?? "#44aaff";
    this.hp = 1;
    this.hitRadius = 3;
    this.grazeRadius = 22;
    this.shotSlots = [];

    this.addComponent(new CircleColliderComponent({ radius: this.hitRadius }));
    this.controller = this.addComponent(new PlayerControllerComponent({ boundsProvider, onShot }));
    this.controller.moveSpeed = character?.moveSpeed ?? this.controller.moveSpeed;
    this.controller.slowMoveSpeed = character?.slowMoveSpeed ?? this.controller.slowMoveSpeed;
    this.#redraw();
  }

  tick(deltaTime) {
    super.tick(deltaTime);
    this.#redraw();
  }

  #redraw() {
    this.view.uncache();
    this.view.graphics
      .clear()
      .beginFill(this.color)
      .drawCircle(0, 0, 12)
      .beginFill("#ffffff")
      .drawCircle(0, 0, 2.5);

    if (this.controller?.isSlowMoving) {
      this.view.graphics
        .setStrokeStyle(1.5)
        .beginStroke("#ffedf5")
        .drawCircle(0, 0, this.grazeRadius)
        .setStrokeStyle(2)
        .beginStroke("#ff5b9c")
        .drawCircle(0, 0, this.hitRadius + 2);
    }

    this.view.filters = [new SphereShaderFilter()];
    this.view.cache(-24, -24, 48, 48);
  }
}
