import { Component, InputSystem, KeyCode, Vector2, clamp } from "../engine/index.js";

export class PlayerControllerComponent extends Component {
  constructor({ boundsProvider, onShot } = {}) {
    super();

    this.boundsProvider = boundsProvider;
    this.onShot = onShot;
    this.moveSpeed = 300;
    this.slowMoveSpeed = 120;
    this.isSlowMoving = false;
  }

  tick(deltaTime) {
    this.#move(deltaTime);
    this.#shot(deltaTime);
  }

  #move(deltaTime) {
    const direction = Vector2.zero();

    if (InputSystem.getKey(KeyCode.ArrowLeft) || InputSystem.getKey(KeyCode.A)) {
      direction.x -= 1;
    }
    if (InputSystem.getKey(KeyCode.ArrowRight) || InputSystem.getKey(KeyCode.D)) {
      direction.x += 1;
    }
    if (InputSystem.getKey(KeyCode.ArrowUp) || InputSystem.getKey(KeyCode.W)) {
      direction.y -= 1;
    }
    if (InputSystem.getKey(KeyCode.ArrowDown) || InputSystem.getKey(KeyCode.S)) {
      direction.y += 1;
    }

    this.isSlowMoving =
      InputSystem.getKey(KeyCode.ShiftLeft) || InputSystem.getKey(KeyCode.ShiftRight);

    if (direction.sqrMagnitude === 0) {
      return;
    }

    direction.normalize();
    const speed = this.isSlowMoving ? this.slowMoveSpeed : this.moveSpeed;
    this.transform.x += direction.x * speed * deltaTime;
    this.transform.y += direction.y * speed * deltaTime;

    const bounds = this.boundsProvider?.playArea ?? {
      x: 0,
      y: 0,
      width: this.boundsProvider?.width ?? 1,
      height: this.boundsProvider?.height ?? 1,
    };

    this.transform.x = clamp(this.transform.x, bounds.x, bounds.x + bounds.width);
    this.transform.y = clamp(this.transform.y, bounds.y, bounds.y + bounds.height);
  }

  #shot(deltaTime) {
    if (!InputSystem.getKey(KeyCode.Z)) {
      return;
    }

    for (const shotSlot of this.gameObject.shotSlots) {
      shotSlot.timer -= deltaTime;
      if (shotSlot.timer > 0) {
        continue;
      }

      shotSlot.timer = shotSlot.cooldown;
      this.onShot?.(this.gameObject, shotSlot);
    }
  }
}
