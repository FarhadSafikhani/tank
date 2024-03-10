import * as PIXI from "pixi.js";
import { SV_Entity } from "../server/entities/sv_entity";
import { Game } from "./game";
import e from "express";


export const enum EntityState {

    VOID = "VOID",
    ALIVE = "ALIVE",
    DYING = "DYING",
    DISPOSED = "DISPOSED"
}

export class CL_Entity{
    entity: SV_Entity;
    graphics: PIXI.Graphics;
    game: Game;
    
    state: EntityState = EntityState.VOID;

    constructor(game: Game, entity: SV_Entity){
        this.game = game;
        this.entity = entity;
        this.graphics = this.createGraphics();
        this.state = EntityState.ALIVE;
    }

    createGraphics(): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        return graphics;
    }

    update(){
        if(this.state === EntityState.ALIVE){
            this.aliveTick();
        } else if(this.state === EntityState.DYING){
            this.dieTick();
        } else if(this.state === EntityState.DISPOSED){
            this.destroy();
        }
    }

    onSVDeath(){
        this.state = EntityState.DYING;
    }

    aliveTick(){}

    dieTick(){
        this.state = EntityState.DISPOSED;
    }

    destroy(){ 
        this.game.viewport.removeChild(this.graphics);
        this.graphics.destroy();
        this.game.removeClEntity(this.entity.id);
    }


    onChange(){}

}