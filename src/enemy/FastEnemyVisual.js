/**
 * 高速敵の本体と、実際に通った経路を描く表示オブジェクト
 * 履歴はワールド座標で保持し、描画時に現在座標からの相対位置へ変換する
 */
export class FastEnemyVisual {
    constructor({ trailDuration = 0.24, sampleDistance = 3 } = {}) {
        this.container = new createjs.Container();
        this.trail = new createjs.Shape();
        this.body = new createjs.Shape();
        this.history = [];
        this.age = 0;
        this.trailDuration = trailDuration;
        this.sampleDistance = sampleDistance;
        this.lastX = null;
        this.lastY = null;

        this.#drawBody();
        // StageGLではShapeをキャッシュしないと正しく描画されないぽい
        // 直近の移動経路が収まる領域をあらかじめ確保しておく
        this.trail.cache(-160, -160, 320, 320);
        this.container.addChild(this.trail, this.body);
    }

    get view() {
        return this.container;
    }

    /**
     * 毎フレーム更新処理
     * @param deltaTime 善フレームからの経過時間
     * @param x 現在のx座標
     * @param y 現在のy座標
     */
    tick(deltaTime, x, y) {
        this.age += deltaTime;

        const dx = this.lastX === null ? 0 : x - this.lastX;
        const dy = this.lastY === null ? 0 : y - this.lastY;
        const distance = Math.hypot(dx, dy);

        if (this.lastX === null || distance >= this.sampleDistance) {
            this.history.push({ x, y, time: this.age });

            if (distance > 0.01) {
                // 本体はローカル座標の上方向を先頭として描く
                this.body.rotation = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            }

            this.lastX = x;
            this.lastY = y;
        }

        const oldestTime = this.age - this.trailDuration;
        while (this.history.length > 2 && this.history[1].time < oldestTime) {
            this.history.shift();
        }

        this.#drawTrail(x, y);
    }

    /**
     * ボディ部分を描画
     */
    #drawBody() {
        const graphics = this.body.graphics;

        // 小さな赤い菱形を矢じり状に並べる。
        this.#drawDiamond(graphics, 0, -8, 3.4, 5.2, "#ff4d6d");
        this.#drawDiamond(graphics, -5, -2, 3.2, 4.8, "#ff4d6d");
        this.#drawDiamond(graphics, 5, -2, 3.2, 4.8, "#ff4d6d");
        this.#drawDiamond(graphics, 0, 4, 3.4, 5.2, "#ff4d6d");

        this.body.cache(-10, -14, 20, 24);
    }

    /**
     * ひし形描画
     * @param graphics
     * @param x
     * @param y
     * @param halfWidth
     * @param halfHeight
     * @param color
     */
    #drawDiamond(graphics, x, y, halfWidth, halfHeight, color) {
        graphics
            .beginFill(color)
            .moveTo(x, y - halfHeight)
            .lineTo(x + halfWidth, y)
            .lineTo(x, y + halfHeight)
            .lineTo(x - halfWidth, y)
            .closePath();
    }

    /**
     * 後ろの線部分を描画
     * @param currentX 現在のx座標
     * @param currentY 現在のy座標
     */
    #drawTrail(currentX, currentY) {
        const graphics = this.trail.graphics;
        graphics.clear();

        if (this.history.length < 2) {
            this.trail.updateCache();
            return;
        }

        graphics
            .setStrokeStyle(3.5, "round", "round")
            .beginStroke("#ff2344")
            .moveTo(
                this.history[0].x - currentX,
                this.history[0].y - currentY,
            );

        for (let i = 1; i < this.history.length; i += 1) {
            graphics.lineTo(
                this.history[i].x - currentX,
                this.history[i].y - currentY,
            );
        }

        graphics.endStroke();
        this.trail.updateCache();
    }
}
