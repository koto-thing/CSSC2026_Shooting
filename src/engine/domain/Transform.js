import { Component } from "./Component.js";

/** ゲームオブジェクトの位置、回転、拡縮を管理するコンポーネント */
export class Transform extends Component {
    /**
     * コンストラクタ
     * @param renderTarget {object} トランスフォームの対象となる表示オブジェクト
     */
    constructor(renderTarget) {
        super();
        this.renderTarget = renderTarget;
    }

    /**
     * ゲームオブジェクトの位置を取得または設定する
     * @returns {*}
     */
    get x() {
        return this.renderTarget.x;
    }

    /**
     * ゲームオブジェクトの位置を設定する
     * @param value {number} 新しいx座標
     */
    set x(value) {
        this.renderTarget.x = value;
    }

    /**
     * ゲームオブジェクトの位置を取得または設定する
     * @returns {*}
     */
    get y() {
        return this.renderTarget.y;
    }

    /**
     * ゲームオブジェクトの位置を設定する
     * @param value {number} 新しいy座標
     */
    set y(value) {
        this.renderTarget.y = value;
    }

    /**
     * ゲームオブジェクトの位置を取得または設定する
     * @returns {{x: *, y: *}}
     */
    get position() {
        return { x: this.x, y: this.y };
    }

    /**
     * ゲームオブジェクトの位置を設定する
     * @param value {{x: number, y: number}} 新しい位置
     */
    set position(value) {
        this.x = value.x;
        this.y = value.y;
    }

    /**
     * ゲームオブジェクトの回転を取得または設定する
     * @returns {number|*}
     */
    get rotation() {
        return this.renderTarget.rotation;
    }

    /**
     * ゲームオブジェクトの回転を設定する
     * @param value
     */
    set rotation(value) {
        this.renderTarget.rotation = value;
    }

    /**
     * ゲームオブジェクトのスケールを取得または設定する
     * @returns {number|*}
     */
    get scaleX() {
        return this.renderTarget.scaleX;
    }

    /**
     * ゲームオブジェクトのスケールを設定する
     * @param value {number} 新しいスケールX
     */
    set scaleX(value) {
        this.renderTarget.scaleX = value;
    }

    /**
     * ゲームオブジェクトのスケールを取得または設定する
     * @returns {number|*}
     */
    get scaleY() {
        return this.renderTarget.scaleY;
    }

    /**
     * ゲームオブジェクトのスケールを設定する
     * @param value {number} 新しいスケールY
     */
    set scaleY(value) {
        this.renderTarget.scaleY = value;
    }

    /**
     * ゲームオブジェクトのスケールを設定する
     * @param x {number} 新しいスケールX
     * @param y {number} 新しいスケールY
     */
    setScale(x, y = x) {
        this.scaleX = x;
        this.scaleY = y;
    }

    /**
     * ゲームオブジェクトの位置を移動する
     * @param dx {number} x方向の移動量
     * @param dy {number} y方向の移動量
     */
    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}
