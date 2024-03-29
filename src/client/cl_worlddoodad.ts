import * as PIXI from "pixi.js";
import { CL_Entity } from "./cl_entity";
import { Game } from "./game";
import { SV_WorldDoodad } from "../server/entities/sv_worlddoodad";
import { CL_Match } from "./match";


export class CL_WorldDoodad extends CL_Entity{

    entity: SV_WorldDoodad;
   
    constructor(match: CL_Match, entity: SV_WorldDoodad){
        super(match, entity);
    }

    createGraphics(): PIXI.Graphics {
        
        const graphics = new PIXI.Graphics();

        graphics.x = this.entity.x;
        graphics.y = this.entity.y;

        // DRAW BODY
        const bodyVerts = JSON.parse(this.entity.verts);
        graphics.clear();
        graphics.beginFill({r:25, g:115, b:25}); // Gray color
        graphics.drawPolygon(bodyVerts);
        graphics.endFill();
        this.match.game.viewport.addChild(graphics);
        return graphics;
    }


    destroy(){ 
        this.match.game.viewport.removeChild(this.graphics);
        this.graphics.destroy();
    }

}