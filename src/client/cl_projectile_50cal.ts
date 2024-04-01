import * as PIXI from "pixi.js";
import { CL_Entity, EntityState } from "./cl_entity";
import { Game } from "./game";
import { SV_Projectile } from "../server/entities/sv_projectile";
import { lerp } from "../common/utils";
import { CL_Match } from "./match";
import { CL_Projectile } from "./cl_projectile";


export class CL_Projectile_50cal extends CL_Projectile{

    entity: SV_Projectile;
   
    constructor(match: CL_Match, entity: SV_Projectile){
        super(match, entity);
        //this.drawDebugLine();
    }

    createGraphics(): PIXI.Graphics {

        const graphics = new PIXI.Graphics();

        // DRAW BODY
        graphics.rotation = this.entity.angle;
        graphics.x = this.entity.x;
        graphics.y = this.entity.y;

        const bodyVerts = JSON.parse(this.entity.verts);
        graphics.beginFill({ r: 222, g: 180, b: 180, a: .8 }); // Gray color
        graphics.drawPolygon(bodyVerts);
        graphics.endFill();
        


        this.match.game.viewport.addChild(graphics);

        // const sprite = PIXI.Sprite.from('/25mm.png');
        // sprite.width = 10; // increase width
        // sprite.height = 90; // increase height
        // sprite.angle = -90; // set rotation
        // sprite.anchor.set(0.5); // set anchor point to center
        // sprite.position.set(0, 0); // set position
        // graphics.addChild(sprite); // add sprite to graphics

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
            this.match.em.addParticle(this.entity.x, this.entity.y, 2);  
        }
    }

}