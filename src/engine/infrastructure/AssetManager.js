export class AssetManager {
    constructor() {
        this.queue = new createjs.LoadQueue();
        this.manifest = [];
        this.isLoaded = false;
        
        this.queue.installPlugin(createjs.Sound);
    }
    
    register(assetList) {
        if (this.isLoaded) {
            throw new Error("Cannot register assets after loading has started.");
        }
        
        this.manifest.push(...assetList);
    }
    
    load() {
        if (this.isLoaded) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            this.queue.on("complete", () => {
                this.isLoaded = true;
                resolve();
            });
            
            this.queue.on("error", (event) => {
                reject(new Error(`Failed to load asset: ${event.data?.src ?? "unknown"}`));
            });
            
            this.queue.loadManifest(this.manifest);
        });
    }
    
    get(id) {
        if (!this.isLoaded) {
            throw new Error("Assets are not loaded yet.");
        }
        
        const result = this.queue.getResult(id);
        if (result === null || result === undefined) {
            throw new Error(`Asset with id "${id}" not found.`);
        }
        
        return result;
    }
}