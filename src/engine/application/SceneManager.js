export class SceneManager {
    constructor(stage) {
        this.stage = stage;
        this.sceneFactories = new Map();
        this.currentScene = null;
        this.nextSceneName = null;
        this.viewport = {
            width: stage.canvas.width,
            height: stage.canvas.height,
        };
    }
    
    register(name, factory) {
        if (this.sceneFactories.has(name)) {
            throw new Error(`Scene "${name}" is already registered.`);
        }
        
        this.sceneFactories.set(name,  factory);
    }
    
    changeScene(name) {
        if (!this.sceneFactories.has(name)) {
            throw new Error(`Scene "${name}" is not registered.`);
        }
        
        // update中に即座にシーンを破棄しないために予約する
        this.nextSceneName = name;
    }
    
    tick(deltaTime) {
        if (this.nextSceneName !== null) {
            this.applySceneChange();
        }
        
        this.currentScene?.tick(deltaTime);
    }

    resize(width, height) {
        this.viewport.width = width;
        this.viewport.height = height;
        this.currentScene?.resize(width, height);
    }
    
    applySceneChange() {
        if (this.currentScene !== null) {
            this.currentScene.exit();
            this.stage.removeChild(this.currentScene.root);
            this.currentScene.dispose();
        }
        
        const factory = this.sceneFactories.get(this.nextSceneName);
        
        this.currentScene = factory();
        this.nextSceneName = null;
        
        this.currentScene.resize(this.viewport.width, this.viewport.height);
        this.stage.addChild(this.currentScene.root);
        this.currentScene.enter();
    }
}
