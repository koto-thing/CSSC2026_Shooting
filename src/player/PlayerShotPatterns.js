import { Vector2 } from "../engine/index.js";

function directionFromAngle(degrees) {
  const radians = ((-90 + degrees) * Math.PI) / 180;
  return new Vector2(Math.cos(radians), Math.sin(radians));
}

export const PlayerShotPatterns = {
  straight(player, context) {
    context.bulletManager.spawnBullet({
      owner: "player",
      x: player.transform.x + (context.config.offsetX ?? 0),
      y: player.transform.y,
      direction: Vector2.up(),
      moveSpeed: context.config.moveSpeed ?? 600,
      damage: context.config.damage ?? 1,
    });
  },

  angled(player, context) {
    context.bulletManager.spawnBullet({
      owner: "player",
      x: player.transform.x + (context.config.offsetX ?? 0),
      y: player.transform.y,
      direction: directionFromAngle(context.config.angle ?? 0),
      moveSpeed: context.config.moveSpeed ?? 600,
      damage: context.config.damage ?? 1,
    });
  },

  homing(player, context) {
    context.bulletManager.spawnBullet({
      owner: "player",
      x: player.transform.x,
      y: player.transform.y,
      direction: Vector2.up(),
      moveSpeed: context.config.moveSpeed ?? 420,
      damage: context.config.damage ?? 1,
      movePattern: "homing",
      moveConfig: {
        enemyProvider: context.enemyProvider,
        turnRate: context.config.turnRate ?? 2,
      },
    });
  },
};
