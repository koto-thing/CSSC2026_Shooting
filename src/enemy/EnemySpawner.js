/** ウェーブ設定に従って敵を出現させるクラス */
export class EnemySpawner {
    /** 敵スポーナーを初期化する */
    constructor({ enemyManager, boundsProvider, waves = [] } = {}) {
        this.enemyManager = enemyManager;
        this.boundsProvider = boundsProvider;
        this.waves = waves;
        this.elapsedTime = 0;
        this.nextIndex = 0;
    }
    
    /** 経過時間に応じてウェーブ内の敵を生成する */
    tick(deltaTime) {
        this.elapsedTime += deltaTime;
        
        // 敵の出現タイミングをチェックし、出現させる
        while(
            this.nextIndex < this.waves.length &&
            this.waves[this.nextIndex].time <= this.elapsedTime
        ) {
            const wave = this.waves[this.nextIndex];
            const x = wave.x ?? this.boundsProvider.width * (wave.xRatio ?? 0.5);
            const y = wave.y ?? -40;
            
            this.enemyManager.spawn({
                type: wave.type, 
                x,
                y,
            });
            
            this.nextIndex++;
        }
    }

    /**
     * 敵の出現タイミングをリセットする
     */
    reset() {
        this.elapsedTime = 0;
        this.nextIndex = 0;
    }
}
