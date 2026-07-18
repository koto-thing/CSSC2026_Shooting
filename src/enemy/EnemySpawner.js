/** 
 * ウェーブ設定に従って敵を出現させるクラス 
 */
export class EnemySpawner {
    /** 
     * 敵スポーナーを初期化する
     * @param {Object} param0
     * @param {EnemyManager} param0.enemyManager
     * @param {BoundsProvider} param0.boundsProvider
     * @param {Array} param0.waves
     */
    constructor({ enemyManager, boundsProvider, waves = [] } = {}) {
        this.enemyManager = enemyManager;
        this.boundsProvider = boundsProvider;
        this.waves = waves;
        this.elapsedTime = 0;
        this.nextIndex = 0;
    }
    
    /** 
     * 経過時間に応じてウェーブ内の敵を生成する
     * @param {number} deltaTime 前回のフレームからの経過時間（秒）
     */
    tick(deltaTime) {
        this.elapsedTime += deltaTime;
        
        // 敵の出現タイミングをチェックし、出現させる
        while(
            this.nextIndex < this.waves.length &&
            this.waves[this.nextIndex].time <= this.elapsedTime
        ) {
            const wave = this.waves[this.nextIndex];
            const enemies = wave.enemies ?? [wave];

            for (const enemy of enemies) {
                this.#spawnEnemy(enemy);
            }
            
            this.nextIndex++;
        }
    }

    /** 指定されたステージ定義から敵を1体生成する */
    #spawnEnemy(enemy) {
        const bounds = this.boundsProvider.playArea ?? {
            x: 0,
            y: 0,
            width: this.boundsProvider.width,
            height: this.boundsProvider.height,
        };
        const x = enemy.x ?? bounds.x + bounds.width * (enemy.xRatio ?? 0.5);
        const y = enemy.y ?? bounds.y - 40;

        this.enemyManager.spawn({
            ...enemy,
            x,
            y,
        });
    }

    /**
     * 敵の出現タイミングをリセットする
     */
    reset() {
        this.elapsedTime = 0;
        this.nextIndex = 0;
    }
}
