export class Scene {
    constructor() {
        this.root = new createjs.Container();
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
    
    dispose() {
        this.root.removeAllEventListeners();
        this.root.removeAllChildren();
    }
}
