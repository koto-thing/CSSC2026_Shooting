import { Vector2 } from "../engine/index.js";

/**
 * プレイヤーの弾の発射パターンを定義するオブジェクト
 * @type {{single(*, *): void, homing(*, *): void, twin(*, *): void}}
 */
export const PlayerShotPatterns = {
    /**
     * プレイヤーの弾を1発発射するパターン
     * @param player 自機インスタンス
     * @param context コンテキスト
     */
    straight(player, context) {
        context.bulletManager.spawnBullet({
            owner: "player",
            x: player.transform.x,
            y: player.transform.y,
            direction: Vector2.up(),
            moveSpeed: context.config.moveSpeed ?? 600,
            damage: context.config.damage ?? 1,
        });
    },

    /**
     * ホーミング弾を1発発射するパターン
     * @param player 自機インスタンス
     * @param context コンテキスト
     */
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

    /**
     * プレイヤーの弾を2発同時に発射するパターン
     * @param player 自機インスタンス
     * @param context コンテキスト
     */
    twin(player, context) {
        for (const offsetX of [-10, 10]) {
            context.bulletManager.spawnBullet({
                owner: "player",
                x: player.transform.x + offsetX,
                y: player.transform.y,
                direction: Vector2.up(),
                moveSpeed: 600,
                damage: 1,
            });
        }
    },
};