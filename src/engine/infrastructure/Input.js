/** キーボードとマウスの入力状態をフレーム単位で管理するクラス */
export class Input {
    static #initialized = false;

    static #heldKeys = new Set();
    static #pressedKeys = new Set();
    static #releasedKeys = new Set();

    static #heldMouseButtons = new Set();
    static #pressedMouseButtons = new Set();
    static #releasedMouseButtons = new Set();

    static #mousePosition = {
        x: 0,
        y: 0,
    };

    static #mouseWheelDelta = 0;

    static #canvas = null;

    static #handlers = {};

    /**
     * 初期化
     * @param canvas
     */
    static initialize(canvas) {
        if (Input.#initialized) {
            console.warn("Inputはすでに初期化されています。");
            return;
        }

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(
                "Input.initialize()にはHTMLCanvasElementを渡してください。",
            );
        }

        Input.#canvas = canvas;

        Input.#handlers.keyDown = (event) => {
            const code = event.code;

            if (!Input.#heldKeys.has(code)) {
                Input.#pressedKeys.add(code);
            }

            Input.#heldKeys.add(code);
        };

        Input.#handlers.keyUp = (event) => {
            const code = event.code;

            Input.#heldKeys.delete(code);
            Input.#releasedKeys.add(code);
        };

        Input.#handlers.mouseDown = (event) => {
            const button = event.button;

            if (!Input.#heldMouseButtons.has(button)) {
                Input.#pressedMouseButtons.add(button);
            }

            Input.#heldMouseButtons.add(button);
            Input.#updateMousePosition(event);
        };

        Input.#handlers.mouseUp = (event) => {
            const button = event.button;

            Input.#heldMouseButtons.delete(button);
            Input.#releasedMouseButtons.add(button);
            Input.#updateMousePosition(event);
        };

        Input.#handlers.mouseMove = (event) => {
            Input.#updateMousePosition(event);
        };

        Input.#handlers.wheel = (event) => {
            Input.#mouseWheelDelta += event.deltaY;
        };

        Input.#handlers.blur = () => {
            Input.#resetAllInputs();
        };

        Input.#handlers.contextMenu = (event) => {
            event.preventDefault();
        };

        window.addEventListener("keydown", Input.#handlers.keyDown);
        window.addEventListener("keyup", Input.#handlers.keyUp);

        window.addEventListener("mouseup", Input.#handlers.mouseUp);
        window.addEventListener("blur", Input.#handlers.blur);

        canvas.addEventListener("mousedown", Input.#handlers.mouseDown);
        canvas.addEventListener("mousemove", Input.#handlers.mouseMove);
        canvas.addEventListener("wheel", Input.#handlers.wheel, {
            passive: true,
        });

        canvas.addEventListener(
            "contextmenu",
            Input.#handlers.contextMenu,
        );

        Input.#initialized = true;
    }

    /**
     * 更新
     */
    static tick() {
        if (!Input.#initialized) {
            throw new Error(
                "Input.initialize()を先に呼び出してください。",
            );
        }

        // 現時点では、フレーム開始時に行う処理はなし
    }

    /**
     * Tickの次に呼び出される
     */
    static lateTick() {
        if (!Input.#initialized) {
            return;
        }

        // GetKeyDown/GetKeyUpなどの1フレーム情報を消去する
        Input.#pressedKeys.clear();
        Input.#releasedKeys.clear();

        Input.#pressedMouseButtons.clear();
        Input.#releasedMouseButtons.clear();

        Input.#mouseWheelDelta = 0;
    }

    /**
     * キーに何かしらのアクションがあるかどうかをチェックする
     * @param code キーコード
     * @returns {boolean} アクションがあるかどうか
     */
    static getKey(code) {
        return Input.#heldKeys.has(code);
    }

    /**
     * キーが押されているかどうかをチェックする
     * @param code キーコード
     * @returns {boolean} 押されているかどうか
     */
    static getKeyDown(code) {
        return Input.#pressedKeys.has(code);
    }

    /**
     * キーが離されたどうかをチェックする
     * @param code キーコード
     * @returns {boolean} 離されたかどうか
     */
    static getKeyUp(code) {
        return Input.#releasedKeys.has(code);
    }

    /**
     * マウスボタンに何かアクションがあるかどうかをチェックする
     * @param button マウスボタンの種類
     * @returns {boolean} アクションがあるかどうか
     */
    static getMouseButton(button) {
        return Input.#heldMouseButtons.has(button);
    }

    /**
     * マウスボタンが押されているかどうかをチェックする
     * @param button マウスボタンの種類
     * @returns {boolean} 押されているかどうか
     */
    static getMouseButtonDown(button) {
        return Input.#pressedMouseButtons.has(button);
    }

    /**
     * マウスボタンが離されたかどうかをチェックする
     * @param button マウスボタンの種類
     * @returns {boolean} 離されたかどうか
     */
    static getMouseButtonUp(button) {
        return Input.#releasedMouseButtons.has(button);
    }

    /**
     * マウスカーソルの位置を取得する
     * @returns {{x: number, y: number}} マウスカーソルの(x, y)座標
     */
    static get mousePosition() {
        return {
            x: Input.#mousePosition.x,
            y: Input.#mousePosition.y,
        };
    }

    /**
     * マウスカーソルのX座標を取得する
     * @returns {number} マウスカーソルのx座標
     */
    static get mouseX() {
        return Input.#mousePosition.x;
    }

    /**
     * マウスカーソルのY座標を取得する
     * @returns {number} マウスカーソルのy座標
     */
    static get mouseY() {
        return Input.#mousePosition.y;
    }

    /**
     * マウスホイールの運動差分を取得する
     * @returns {number} マウスホイールの運動差分
     */
    static get mouseWheelDelta() {
        return Input.#mouseWheelDelta;
    }

    /**
     * 廃棄時に呼び出される
     */
    static dispose() {
        if (!Input.#initialized) {
            return;
        }

        window.removeEventListener(
            "keydown",
            Input.#handlers.keyDown,
        );

        window.removeEventListener(
            "keyup",
            Input.#handlers.keyUp,
        );

        window.removeEventListener(
            "mouseup",
            Input.#handlers.mouseUp,
        );

        window.removeEventListener(
            "blur",
            Input.#handlers.blur,
        );

        Input.#canvas.removeEventListener(
            "mousedown",
            Input.#handlers.mouseDown,
        );

        Input.#canvas.removeEventListener(
            "mousemove",
            Input.#handlers.mouseMove,
        );

        Input.#canvas.removeEventListener(
            "wheel",
            Input.#handlers.wheel,
        );

        Input.#canvas.removeEventListener(
            "contextmenu",
            Input.#handlers.contextMenu,
        );

        Input.#resetAllInputs();

        Input.#canvas = null;
        Input.#handlers = {};
        Input.#initialized = false;
    }

    /**
     * マウスカーソル位置のアップデートイベント
     * @param event
     */
    static #updateMousePosition(event) {
        const rect = Input.#canvas.getBoundingClientRect();

        const scaleX = Input.#canvas.width / rect.width;
        const scaleY = Input.#canvas.height / rect.height;

        Input.#mousePosition.x =
            (event.clientX - rect.left) * scaleX;

        Input.#mousePosition.y =
            (event.clientY - rect.top) * scaleY;
    }

    /**
     * すべての入力をリセット
     */
    static #resetAllInputs() {
        Input.#heldKeys.clear();
        Input.#pressedKeys.clear();
        Input.#releasedKeys.clear();

        Input.#heldMouseButtons.clear();
        Input.#pressedMouseButtons.clear();
        Input.#releasedMouseButtons.clear();

        Input.#mouseWheelDelta = 0;
    }
}
