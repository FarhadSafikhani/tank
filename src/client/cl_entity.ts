import * as PIXI from "pixi.js";
import { SV_Entity } from "../server/rooms/sv_entity";
import { Game } from "./game";


export class CL_Entity{
    entity: SV_Entity;
    graphics: PIXI.Graphics;
    game: Game;
    constructor(game: Game, entity: SV_Entity){
        this.game = game;
        this.entity = entity;
        this.graphics = this.createGraphics();
    }

    createGraphics(): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        return graphics;
    }

    destroy(){ 
        this.game.viewport.removeChild(this.graphics);
        this.graphics.destroy();
        this.game.removeClEntity(this.entity.id);
    }

    update(){}

    onChange(){}

    onDeath(){
        this.destroy();
    }
}