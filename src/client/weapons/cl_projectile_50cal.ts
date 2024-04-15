import * as PIXI from "pixi.js";
import { CL_Entity, EntityState } from "../cl_entity";
import { Game } from "../game";
import { SV_Projectile } from "../../server/entities/sv_projectile";
import { lerp } from "../../common/utils";
import { CL_Match } from "../match";
import { CL_Projectile } from "./cl_projectile";
import { SV_Projectile_50cal } from "../../server/entities/sv_projectile_50cal";



export class CL_Projectile_50cal extends CL_Projectile{

    entity: SV_Projectile_50cal;
   
    constructor(match: CL_Match, entity: SV_Projectile_50cal){
        super(match, entity);

        const casterEntity = this.match.em.getClEntity(this.entity.casterId);
        const casterContainer = casterEntity.container;
        this.match.ptm.spawnParticles50cal(casterContainer, this.entity.angle);

    }

    createGraphics(): void {
        const graphics = new PIXI.Graphics();
        const bodyVerts = JSON.parse(this.entity.verts);
        graphics.beginFill({ r: 222, g: 180, b: 180, a: .8 }); // Gray color
        graphics.drawPolygon(bodyVerts);
        graphics.endFill();
        this.container.addChild(graphics);
    }

    drawDebugLine(){
        const line = new PIXI.Graphics();
        line.lineStyle(4, 'cyan', 1);
        line.moveTo(this.entity.casterX, this.entity.casterY);
        line.lineTo(this.entity.x, this.entity.y);
        this.match.game.viewport.addChild(line);
    }

    aliveTick(): void {
        this.container.x = lerp(this.container.x, this.entity.x, .5);
        this.container.y = lerp(this.container.y, this.entity.y, .5);
        this.container.rotation = this.entity.angle;
    }

    //called from update in cl_entity when state is DYING
    dieTick(): void {
        super.dieTick();
        this.container.x = this.entity.x;
        this.container.y = this.entity.y;
    }

    spawnPartiles(){
        for (let i = 0; i < 10; i++) {
            this.match.ptm.addParticle(this.entity.x, this.entity.y, 2);  
        }
    }

}