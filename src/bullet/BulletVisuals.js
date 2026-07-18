import { EnemyBulletGlowFilter } from "../effects/EnemyBulletGlowFilter.js";

/**
 * 弾の視覚的な定義を格納するオブジェクト
 * @type {{default: {radius: number, color: string, cachePadding: number, filters: []}, enemyBlueGlow: {radius: number, color: string, cachePadding: number, filters: [function(): EnemyBulletGlowFilter], draw(*, {radius: *}): void}}}
 */
const visualDefinitions = {
    default: {
        radius: 4,
        color: "#dc143c",
        cachePadding: 0,
        filters: [],
    },

    enemyBlueGlow: {
        radius: 12,        // 弾の半径を6に設定
        color: "#4f68ff", // 弾の色
        cachePadding: 3,  // キャッシュの余白を3に設定
        filters: [() => new EnemyBulletGlowFilter()], // フィルターを適用する関数の配列
        draw(graphics, { radius }) {
            graphics
                .beginRadialGradientFill(
                    ["#ffffff", "#6f83ff", "#1421a8", "rgba(0, 0, 0, 0)"],
                    [0, 0.38, 0.72, 1],
                    0,
                    0,
                    0,
                    0,
                    0,
                    radius,
                )
                .drawCircle(0, 0, radius)
                .endFill()
                .setStrokeStyle(1.5)
                .beginStroke("#0b126e")
                .drawCircle(0, 0, radius - 0.75)
                .endStroke();
        },
    },

    enemyPurpleOval: {
        radiusX: 8,
        radiusY: 18,
        cachePadding: 4,
        filters: [() => new EnemyBulletGlowFilter()],
        draw(graphics, { radiusX, radiusY }) {
            graphics
                .beginRadialGradientFill(
                    ["#ffffff", "#d9c7ff", "#6f45ff", "#19077a"],
                    [0, 0.28, 0.68, 1],
                    -radiusX * 0.25,
                    -radiusY * 0.2,
                    0,
                    0,
                    0,
                    radiusY,
                )
                .drawEllipse(-radiusX, -radiusY, radiusX * 2, radiusY * 2)
                .endFill()
                .setStrokeStyle(2)
                .beginStroke("#13004f")
                .drawEllipse(-radiusX + 0.8, -radiusY + 0.8, (radiusX - 0.8) * 2, (radiusY - 0.8) * 2)
                .endStroke();
        },
    },
};

/**
 * 弾の視覚的な定義を解決する関数
 * @param visualType 弾の見た目の種類
 * @param visualConfig 弾の見た目の追加設定
 * @returns {{radius: number, color: string, cachePadding: number, filters: []}}
 */
function resolveVisualDefinition(visualType = "default", visualConfig = {}) {
    return {
        ...visualDefinitions.default,
        ...(visualDefinitions[visualType] ?? visualDefinitions.default),
        ...visualConfig,
    };
}

/**
 * 弾の見た目を適用する関数
 * @param view 弾のビューオブジェクト
 * @param param1
 * @param param1.visualType
 * @param param1.visualConfig
 */
export function applyBulletVisual(view, { visualType = "default", visualConfig = {} } = {}) {
    const visual = resolveVisualDefinition(visualType, visualConfig);
    const radius = visual.radius;
    const radiusX = visual.radiusX ?? radius;
    const radiusY = visual.radiusY ?? radius;
    const padding = visual.cachePadding ?? 0;
    const cacheWidth = (radiusX + padding) * 2;
    const cacheHeight = (radiusY + padding) * 2;
    const cacheX = -(radiusX + padding);
    const cacheY = -(radiusY + padding);

    // ビューのキャッシュをクリアして再描画する
    view.uncache?.();
    view.graphics.clear();

    // ビューの描画を行う
    if (typeof visual.draw === "function") {
        visual.draw(view.graphics, visual);
    } else {
        view.graphics
            .beginFill(visual.color)
            .drawCircle(0, 0, radius);
    }

    // ビューのフィルターを適用する
    view.filters = (visual.filters ?? []).map((createFilter) => createFilter());
    view.cache(cacheX, cacheY, cacheWidth, cacheHeight);
}
