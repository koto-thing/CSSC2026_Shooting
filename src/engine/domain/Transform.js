import { Component } from "./Component.js";

export class Transform extends Component {
    constructor(renderTarget) {
        super();
        this.renderTarget = renderTarget;
    }

    get x() {
        return this.renderTarget.x;
    }

    set x(value) {
        this.renderTarget.x = value;
    }

    get y() {
        return this.renderTarget.y;
    }

    set y(value) {
        this.renderTarget.y = value;
    }

    get position() {
        return { x: this.x, y: this.y };
    }

    set position(value) {
        this.x = value.x;
        this.y = value.y;
    }

    get rotation() {
        return this.renderTarget.rotation;
    }

    set rotation(value) {
        this.renderTarget.rotation = value;
    }

    get scaleX() {
        return this.renderTarget.scaleX;
    }

    set scaleX(value) {
        this.renderTarget.scaleX = value;
    }

    get scaleY() {
        return this.renderTarget.scaleY;
    }

    set scaleY(value) {
        this.renderTarget.scaleY = value;
    }

    setScale(x, y = x) {
        this.scaleX = x;
        this.scaleY = y;
    }

    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}
