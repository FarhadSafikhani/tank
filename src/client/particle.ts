import * as PIXI from "pixi.js";
import { Game } from "./game";

export class Particle {

    graphic = new PIXI.Graphics();
    velocity: { x: number; y: number; };
    lifespan: number;
    lifespanMax: number = 20;
    game: Game;

    constructor(game: Game, x: number, y: number) {
        this.game = game;

        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill({r: 255, g: 255, b: 0}); // Yellow color
        this.graphic.drawCircle(0, 0, 2); // Draw a circle with radius 5
        this.graphic.endFill();
        this.graphic.x = x;
        this.graphic.y = y;

        this.velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };

        this.lifespan = this.lifespanMax;
        this.game.viewport.addChild(this.graphic);
    }

    update() {
        this.graphic.x += this.velocity.x;
        this.graphic.y += this.velocity.y;
        this.lifespan--;

        this.graphic.alpha = this.lifespan / this.lifespanMax; // Fade out effect

        if (this.lifespan <= 0) {
            this.game.viewport.removeChild(this.graphic);
            this.graphic.destroy();
            return false;
        }
        return true;
    }
}