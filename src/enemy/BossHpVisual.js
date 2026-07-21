import { Component, clamp } from "../engine/index.js";

/**
 * ボスのHPバーを表示する
 */
export class BossHpVisual extends Component {
    /**
     * コンストラクタ
     */
    constructor({
        root,
        radius = 50,
        lineWidth = 2.5,
        backgroundColor = "rgba(255, 210, 220, 0.28)",
        hpColor = "#fff4f6",
        glowColor = "#ff284f",
    } = {}) {
        super();

        this.root = root;
        this.radius = radius;
        this.lineWidth = lineWidth;
        this.backgroundColor = backgroundColor;
        this.hpColor = hpColor;
        this.glowColor = glowColor;

        this.view = new createjs.Shape();
        this.lastHpRate = -1;
    }

    initialize() {
        this.root?.addChild(this.view);
    }

    /**
     * 毎フレームごとの更新処理
     * @param deltaTime 前フレームからの経過時間
     */
    tick(deltaTime) {
        const currentHp = this.gameObject.hp ?? 0;
        const maxHp = Math.max(1, this.gameObject.maxHp ?? 1);
        const hpRate = clamp(currentHp / maxHp, 0, 1);

        // ボスの中心座標へ追従させる
        this.view.x = this.transform.x;
        this.view.y = this.transform.y;
        this.view.visible = this.gameObject.active;

        // HPが変化したときだけ書き直す
        if (hpRate !== this.lastHpRate) {
            this.lastHpRate = hpRate;
            this.circleHpRendering(hpRate);
        }
    }

    /**
     * 円形にHPバーをレンダリングする
     */
    circleHpRendering(hpRate) {
        const graphics = this.view.graphics;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * hpRate;

        graphics.clear();

        // 減った部分を示す、薄い一周分のリング
        graphics
            .setStrokeStyle(this.lineWidth, "round", "round")
            .beginStroke(this.backgroundColor)
            .drawCircle(0, 0, this.radius)
            .endStroke();

        if (hpRate <= 0) {
            return;
        }

        // 赤い光を太さと透明度の異なる線で重ねる
        graphics
            .setStrokeStyle(this.lineWidth * 4, "round", "round")
            .beginStroke("rgba(255, 20, 55, 0.16)")
            .arc(0, 0, this.radius, startAngle, endAngle, false)
            .endStroke()
            .setStrokeStyle(this.lineWidth * 2.2, "round", "round")
            .beginStroke(this.glowColor)
            .arc(0, 0, this.radius, startAngle, endAngle, false)
            .endStroke()
            // 中心に細い白色を置き、赤白く発光して見せる
            .setStrokeStyle(this.lineWidth, "round", "round")
            .beginStroke(this.hpColor)
            .arc(0, 0, this.radius, startAngle, endAngle, false)
            .endStroke();
    }

    onDestroy() {
        this.view.parent?.removeChild(this.view);
        this.view.removeAllEventListeners?.();
    }
}
