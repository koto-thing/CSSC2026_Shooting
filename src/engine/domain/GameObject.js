import { Transform } from "./Transform.js";

export class GameObject {
    constructor(name = "GameObject", view = null) {
        this.name = name;
        this.active = true;
        this.destroyed = false;
        
        this.view = view ?? {
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            removeAllEventListeners() {},
        };
        this.components = [];
        
        this.transform = new Transform(this.view);
        this.addComponent(this.transform);
    }
    
    addComponent(component) {
        if (this.destroyed) {
            throw new Error(`Cannot add component to destroyed GameObject "${this.name}".`);
        }
        
        if (component.gameObject !== null) {
            throw new Error("This component is already attached to a GameObject.");
        }
        
        component.gameObject = this;
        this.components.push(component);
        component.initialize();
        
        return component;
    }
    
    getComponent(ComponentType) {
        return this.components.find(
            (component) => component instanceof ComponentType,
        ) ?? null;
    }
    
    getComponents(ComponentType) {
        return this.components.filter(
            (component) => component instanceof ComponentType,
        );
    }
    
    hasComponent(ComponentType) {
        return this.getComponent(ComponentType) !== null;
    }
    
    removeComponent(componentOrType) {
        const index = typeof componentOrType === "function" 
            ? this.components.findIndex((component) => component instanceof componentOrType)
            : this.components.indexOf(componentOrType);
        
        if (index < 0) {
            return false;
        }
        
        const [component] = this.components.splice(index, 1);
        if (component === this.transform) {
            throw new Error("Transform cannot be removed.");
        }
        
        component.onDestroy();
        component.gameObject = null;
        return true;
    }
    
    tick(deltaTime) {
        if (!this.active || this.destroyed) {
            return;
        }
        
        for (const component of [...this.components]) {
            if (!component.enabled) {
                continue;
            }
            
            if (!component._started) {
                component._started = true;
                component.start();
            }
            
            component.tick(deltaTime);
        }
    }
    
    lateTick(deltaTime) {
        if (!this.active || this.destroyed) {
            return;
        }
        
        for (const component of [...this.components]) {
            if (component.enabled && component._started) {
                component.lateTick(deltaTime);
            }
        }
    }
    
    setActive(active) {
        this.active = active;
        this.view.visible = active;
    }
    
    destroy() {
        if (this.destroyed) {
            return;
        }
        
        this.destroyed = true;
        
        for (const component of [...this.components].reverse()) {
            component.onDestroy();
            component.gameObject = null;
        }
        
        this.components.length = 0;
        this.view.removeAllEventListeners?.();
        this.view.parent?.removeChild(this.view);
    }
}
