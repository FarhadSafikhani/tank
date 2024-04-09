import * as PIXI from "pixi.js";
import { CL_Entity, EntityState } from "../cl_entity";
import { Game } from "../game";
import { SV_Projectile } from "../../server/entities/sv_projectile";
import { lerp } from "../../common/utils";
import { CL_Match } from "../match";
import { CL_Projectile } from "./cl_projectile";
import { SV_Projectile_25mm } from "../../server/entities/sv_projectile_25mm";


export class CL_Projectile_25mm extends CL_Projectile{

    entity: SV_Projectile_25mm;
   
    constructor(match: CL_Match, entity: SV_Projectile){
        super(match, entity);
        //this.drawDebugLine();
        this.container.rotation = this.entity.angle;
        this.container.x = this.entity.x;
        this.container.y = this.entity.y;
    }

    createGraphics(): void {
        const sprite = PIXI.Sprite.from('/25mm.png');
        sprite.width = 10; // increase width
        sprite.height = 90; // increase height
        sprite.angle = -90; // set rotation
        sprite.anchor.set(0.5); // set anchor point to center
        sprite.position.set(0, 0); // set position
        this.container.addChild(sprite);
    }

    drawDebugLine(){
        const line = new PIXI.Graphics();
        line.lineStyle(4, 'cyan', 1);
        line.moveTo(this.entity.casterX, this.entity.casterY);
        line.lineTo(this.entity.x, this.entity.y);
        this.match.game.viewport.addChild(line);
    }

    aliveTick(): void {
        this.container.x = lerp(this.container.x, this.entity.x, 0.5);
        this.container.y = lerp(this.container.y, this.entity.y, 0.5);
        this.container.rotation = this.entity.angle;
    }

    //called from update in cl_entity when state is DYING
    dieTick(): void {
        super.dieTick();
        this.container.x = this.entity.x;
        this.container.y = this.entity.y;
        this.spawnPartiles();
    }

    spawnPartiles(){
        for (let i = 0; i < 10; i++) {
            this.match.ptm.addParticle(this.entity.x, this.entity.y, 2);  
        }
    }

}