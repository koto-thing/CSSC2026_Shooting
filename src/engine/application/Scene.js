export class Scene {
    constructor() {
        this.root = new createjs.Container();
        this.viewport = {
            width: 0,
            height: 0,
        };
    }

    get width() {
        return this.viewport.width;
    }

    get height() {
        return this.viewport.height;
    }
    
    enter() {
        // シーン開始時
    }
    
    tick(deltaTime) {
        // 毎フレーム
    }
    
    exit() {
        // シーン終了時
    }

    resize(width, height) {
        this.viewport.width = width;
        this.viewport.height = height;
    }
    
    dispose() {
        this.root.removeAllEventListeners();
        this.root.removeAllChildren();
    }
}
