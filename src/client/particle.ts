import * as PIXI from "pixi.js";
import { CL_Match } from "./match";

export class Particle {

    graphic = new PIXI.Graphics();
    velocity: { x: number; y: number; };
    lifespan: number;
    lifespanMax: number = 20;
    match: CL_Match;

    constructor(match: CL_Match, x: number, y: number, size: number) {
        this.match = match;

        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill({r: 255, g: 255, b: 0}); // Yellow color
        this.graphic.drawCircle(0, 0, size); // Draw a circle with radius 5
        this.graphic.endFill();
        this.graphic.x = x;
        this.graphic.y = y;

        this.velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };

        this.lifespan = this.lifespanMax;
        this.match.particleContainer.addChild(this.graphic);
    }

    update(): boolean {
        this.graphic.x += this.velocity.x;
        this.graphic.y += this.velocity.y;
        this.lifespan--;

        this.graphic.alpha = this.lifespan / this.lifespanMax; // Fade out effect

        if (this.lifespan <= 0) {
            this.match.particleContainer.removeChild(this.graphic);
            this.graphic.destroy();
            return false;
        };
        
        return true;
    }
}