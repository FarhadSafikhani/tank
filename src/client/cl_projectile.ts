import * as PIXI from "pixi.js";
import { CL_Entity, EntityState } from "./cl_entity";
import { Game } from "./game";
import { SV_Projectile } from "../server/entities/sv_projectile";
import { lerp } from "../common/utils";
import { CL_Match } from "./match";


export class CL_Projectile extends CL_Entity{

    entity: SV_Projectile;
   
    constructor(match: CL_Match, entity: SV_Projectile){
        super(match, entity);
        //this.drawDebugLine();
    }

    createGraphics(): PIXI.Graphics {

        const graphics = new PIXI.Graphics();

        // DRAW BODY
        const bodyVerts = JSON.parse(this.entity.verts);

        //create a rectangle from the verts from matter.js
        graphics.clear();
        graphics.beginFill({ r: 125, g: 115, b: 125, a: .7 }); // Gray color
        graphics.drawPolygon(bodyVerts);
        graphics.endFill();
        
        graphics.rotation = this.entity.angle;
        graphics.x = this.entity.x;
        graphics.y = this.entity.y;

        this.match.game.viewport.addChild(graphics);

        return graphics;
    }

    drawDebugLine(){
        const line = new PIXI.Graphics();
        line.lineStyle(4, 'cyan', 1);
        line.moveTo(this.entity.casterX, this.entity.casterY);
        line.lineTo(this.entity.x, this.entity.y);
        this.match.game.viewport.addChild(line);
    }

    aliveTick(): void {
        this.graphics.x = lerp(this.graphics.x, this.entity.x, 0.2);
        this.graphics.y = lerp(this.graphics.y, this.entity.y, 0.2);
        this.graphics.rotation = this.entity.angle;
    }

    //called from update in cl_entity when state is DYING
    dieTick(): void {
        super.dieTick();
        this.spawnPartiles();
    }

    spawnPartiles(){
        for (let i = 0; i < 10; i++) {
            this.match.addParticle(this.entity.x, this.entity.y);  
        }
    }

}