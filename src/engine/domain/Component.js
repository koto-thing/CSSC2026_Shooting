export class Component {
    constructor() {
        this.gameObject = null;
        this.enabled = true;
        this._started = false;
    }
    
    get transform() {
        return this.gameObject?.transform ?? null;
    }
    
    initialize() {
        
    }
    
    start() {
        
    }
    
    tick() {
        
    }
    
    lateTick() {
        
    }
    
    onDestroy() {
        
    }
    
    destroy() {
        this.gameObject?.destroy();
    }
}