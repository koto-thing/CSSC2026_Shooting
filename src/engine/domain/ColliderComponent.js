import { Component } from "./Component.js";

/** 衝突判定に使用する形状と位置の基底コンポーネント */
export class ColliderComponent extends Component {
    /** コライダーを初期化する */
    constructor({ offsetX = 0, offsetY = 0 } = {}) {
        super();

        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
    
    get centerX() {
        return (this.transform?.x ?? 0) + this.offsetX;
    }

    get centerY() {
        return (this.transform?.y ?? 0) + this.offsetY;
    }

    get center() {
        return { x: this.centerX, y: this.centerY };
    }

    /**
     * コライダーが他のコライダーと交差しているかどうかを判定する
     * @param other {ColliderComponent} 判定対象のコライダー
     * @returns {*|boolean} 交差している場合はtrue、そうでない場合はfalse
     */
    intersects(other) {
        if (!(other instanceof ColliderComponent)) {
            return false;
        }

        if (this instanceof CircleColliderComponent && other instanceof CircleColliderComponent) {
            return ColliderComponent.#intersectsCircleCircle(this, other);
        }

        if (this instanceof RectangleColliderComponent && other instanceof RectangleColliderComponent) {
            return ColliderComponent.#intersectsRectangleRectangle(this, other);
        }

        if (this instanceof CircleColliderComponent && other instanceof RectangleColliderComponent) {
            return ColliderComponent.#intersectsCircleRectangle(this, other);
        }

        if (this instanceof RectangleColliderComponent && other instanceof CircleColliderComponent) {
            return ColliderComponent.#intersectsCircleRectangle(other, this);
        }

        return false;
    }

    /**
     * 2つの円形コライダーが交差しているかどうかを判定する
     * @param a コライダーA
     * @param b コライダーB
     * @returns {boolean} 交差している場合はtrue、そうでない場合はfalse
     */
    static #intersectsCircleCircle(a, b) {
        const dx = a.centerX - b.centerX;
        const dy = a.centerY - b.centerY;
        const radius = a.radius + b.radius;

        return dx * dx + dy * dy <= radius * radius;
    }

    /**
     * 2つの矩形コライダーが交差しているかどうかを判定する
     * @param a コライダーA
     * @param b コライダーB
     * @returns {boolean} 交差している場合はtrue、そうでない場合はfalse
     */
    static #intersectsRectangleRectangle(a, b) {
        return (
            a.left <= b.right &&
            a.right >= b.left &&
            a.top <= b.bottom &&
            a.bottom >= b.top
        );
    }

    /**
     *  円形コライダーと矩形コライダーが交差しているかどうかを判定する
     * @param circle 円コライダー
     * @param rectangle 矩形コライダー
     * @returns {boolean} 交差している場合はtrue、そうでない場合はfalse
     */
    static #intersectsCircleRectangle(circle, rectangle) {
        const closestX = Math.max(rectangle.left, Math.min(circle.centerX, rectangle.right));
        const closestY = Math.max(rectangle.top, Math.min(circle.centerY, rectangle.bottom));
        const dx = circle.centerX - closestX;
        const dy = circle.centerY - closestY;

        return dx * dx + dy * dy <= circle.radius * circle.radius;
    }
}

/**
 * 円形コライダーコンポーネント
 */
export class CircleColliderComponent extends ColliderComponent {
    /** 円形コライダーを初期化する */
    constructor({ radius, offsetX = 0, offsetY = 0 } = {}) {
        super({ offsetX, offsetY });

        if (radius === undefined) {
            throw new Error("CircleColliderComponent requires a radius.");
        }

        this.radius = radius;
    }
}

/**
 * 矩形コライダーコンポーネント
 */
export class RectangleColliderComponent extends ColliderComponent {
    /** 矩形コライダーを初期化する */
    constructor({ width, height, offsetX = 0, offsetY = 0 } = {}) {
        super({ offsetX, offsetY });

        if (width === undefined || height === undefined) {
            throw new Error("RectangleColliderComponent requires width and height.");
        }

        this.width = width;
        this.height = height;
    }

    get left() {
        return this.centerX - this.width / 2;
    }

    get right() {
        return this.centerX + this.width / 2;
    }

    get top() {
        return this.centerY - this.height / 2;
    }

    get bottom() {
        return this.centerY + this.height / 2;
    }
}
