import { Vector2 } from "../engine/index.js";

/** 角度から正規化された方向ベクトルを生成する */
function directionFromAngle(degrees) {
    const radians = degrees * Math.PI / 180;
    
    return new Vector2(
        Math.cos(radians),
        Math.sin(radians),
    );
}

export const EnemyShotPattern = {
    /** 弾を発射しない */
    none(enemy, context) {
        
    },
    
    /** 真下へ1発の弾を発射する */
    singleDown(enemy, context) {
        context.bulletManager.spawnBullet({
            owner: "enemy",
            x: enemy.transform.x,
            y: enemy.transform.y,
            direction: new Vector2(0, 1),
            moveSpeed: context.config.bulletSpeed ?? 300,
            damage: 1,
        });
    }, 
    
    /** 扇状に3発の弾を発射する */
    fan3(enemy, context) {
        const speed = context.config.bulletSpeed ?? 300;
        const angles = [75, 90, 105];
        
        for (const angle of angles) {
            context.bulletManager.spawnBullet({
                owner: "enemy",
                x: enemy.transform.x,
                y: enemy.transform.y,
                direction: directionFromAngle(angle),
                moveSpeed: speed,
                damage: 1,
            });
        }
    },
    
    /** 全方向へ12発の弾を発射する */
    circle12(enemy, context) {
        const speed = context.config.bulletSpeed ?? 220;
        
        for (let i = 0; i < 12; i++) {
            const angle = i * 30;
            
            context.bulletManager.spawnBullet({
                owner: "enemy",
                x: enemy.transform.x,
                y: enemy.transform.y,
                direction: directionFromAngle(angle),
                moveSpeed: speed, 
                damage: 1,
            });
        }
    },
};
