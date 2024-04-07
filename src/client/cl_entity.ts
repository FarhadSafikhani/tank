import * as PIXI from "pixi.js";
import { SV_Entity } from "../server/entities/sv_entity";
import { Game } from "./game";
import e from "express";
import { CL_Match } from "./match";


export const enum EntityState {

    VOID = "VOID",
    ALIVE = "ALIVE",
    DYING = "DYING",
    DISPOSED = "DISPOSED"
}

export class CL_Entity{
    entity: SV_Entity;
    container: PIXI.Container;
    match: CL_Match;
    
    state: EntityState = EntityState.VOID;

    constructor(match: CL_Match, entity: SV_Entity){
        this.match = match;
        this.entity = entity;
        this.container = new PIXI.Container();
        this.match.game.viewport.addChild(this.container);
        this.createGraphics();
        this.state = EntityState.ALIVE;
    }

    createGraphics(): void {}

    update(){
        if(this.state === EntityState.ALIVE) {
            this.aliveTick();
        } else if(this.state === EntityState.DYING) {
            this.dieTick();
        } else if(this.state === EntityState.DISPOSED) {
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
        this.match.game.viewport.removeChild(this.container);
        this.container.destroy();
        this.match.em.removeClEntity(this.entity.id);
    }


    onChange(){}

}