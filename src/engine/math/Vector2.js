/**
 * 2次元ベクトル
 */
export class Vector2 {
    /**
     * コンストラクタ
     * @param x {number} x成分
     * @param y {number} y成分
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * ゼロベクトルを作成する
     * @returns {Vector2} ゼロベクトル
     */
    static zero() {
        return new Vector2(0, 0);
    }

    /**
     * 右方向の単位ベクトルを作成する
     * @returns {Vector2} 右方向の単位ベクトル
     */
    static right() {
        return new Vector2(1, 0);
    }

    /**
     * 上方向の単位ベクトルを作成する
     * @returns {Vector2} 上方向の単位ベクトル
     */
    static up() {
        return new Vector2(0, -1);
    }

    /**
     * 2つのベクトルを加算する
     * @param a {Vector2} 加算するベクトル
     * @param b {Vector2} 加算するベクトル
     * @returns {Vector2} 加算結果
     */
    static add(a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    /**
     * 2つのベクトルを減算する
     * @param a {Vector2} 減算元のベクトル
     * @param b {Vector2} 減算するベクトル
     * @returns {Vector2} 減算結果
     */
    static subtract(a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    /**
     * ベクトルにスカラー値を掛ける
     * @param vector {Vector2} 対象のベクトル
     * @param scalar {number} 掛ける値
     * @returns {Vector2} 乗算結果
     */
    static multiply(vector, scalar) {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    /**
     * 2つのベクトルの内積を求める
     * @param a {Vector2} 対象のベクトル
     * @param b {Vector2} 対象のベクトル
     * @returns {number} 内積
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * 2つのベクトル間の距離を求める
     * @param a {Vector2} 対象のベクトル
     * @param b {Vector2} 対象のベクトル
     * @returns {number} 距離
     */
    static distance(a, b) {
        return Vector2.subtract(a, b).magnitude;
    }

    /**
     * ベクトルを複製する
     * @returns {Vector2} 複製されたベクトル
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * ベクトルの長さを取得する
     * @returns {number} ベクトルの長さ
     */
    get magnitude() {
        return Math.sqrt(this.sqrMagnitude);
    }

    /**
     * ベクトルの長さの2乗を取得する
     * @returns {number} ベクトルの長さの2乗
     */
    get sqrMagnitude() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * 正規化されたベクトルを取得する
     * @returns {Vector2} 正規化されたベクトル
     */
    get normalized() {
        return this.clone().normalize();
    }

    /**
     * ベクトルの成分を設定する
     * @param x {number} x成分
     * @param y {number} y成分
     * @returns {Vector2} 自分自身
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * ベクトルに別のベクトルを加算する
     * @param vector {Vector2} 加算するベクトル
     * @returns {Vector2} 自分自身
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**
     * ベクトルから別のベクトルを減算する
     * @param vector {Vector2} 減算するベクトル
     * @returns {Vector2} 自分自身
     */
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    /**
     * ベクトルにスカラー値を掛ける
     * @param scalar {number} 掛ける値
     * @returns {Vector2} 自分自身
     */
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * ベクトルを正規化する
     * @returns {Vector2} 自分自身
     */
    normalize() {
        const length = this.magnitude;
        if (length === 0) {
            return this;
        }

        this.x /= length;
        this.y /= length;
        return this;
    }
}
