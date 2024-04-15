import * as PIXI from "pixi.js";
import { lerp } from "../../common/utils";
import { CL_Match } from "../match";
import { CL_Projectile } from "./cl_projectile";
import { SV_Projectile_Tow } from "../../server/entities/sv_projectile_tow";


export class CL_Projectile_Tow extends CL_Projectile{

    entity: SV_Projectile_Tow;

    rocketNozzle: PIXI.Container;
    
    reticle?: PIXI.Graphics;
   
    constructor(match: CL_Match, entity: SV_Projectile_Tow){
        super(match, entity);

        //backblast
        const casterEntity = this.match.em.getClEntity(this.entity.casterId);
        const casterContainer = casterEntity.container;
        const oppositeAngle = this.entity.angle + Math.PI;
        this.match.ptm.spawnParticlesTurretMed(casterContainer, oppositeAngle, {x: 15, y: -10});

        this.match.ptm.spawnRocketParticles(this.rocketNozzle, this.entity.angle);

        this.createReticle();
        this.updateReticlePosition(false);
    }

    createGraphics(): void {
        const graphics = new PIXI.Graphics();
        const bodyVerts = JSON.parse(this.entity.verts);
        graphics.clear();
        graphics.beginFill({ r: 222, g: 180, b: 180, a: .8 }); // Gray color
        graphics.drawPolygon(bodyVerts);
        graphics.endFill();

        this.rocketNozzle = new PIXI.Container();
        this.rocketNozzle.angle = -180;
        this.container.addChild(this.rocketNozzle);
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
        //center the reticle on the target position based on the size of reticle
        this.updateReticlePosition(true);


    }

    //called from update in cl_entity when state is DYING
    dieTick(): void {
        super.dieTick();
        this.container.x = this.entity.x;
        this.container.y = this.entity.y;

        if(this.reticle){
            this.match.game.viewport.removeChild(this.reticle);
            this.reticle.destroy();
        }

    }

    spawnPartiles(){
        for (let i = 0; i < 10; i++) {
            this.match.ptm.addParticle(this.entity.x, this.entity.y, 2);  
        }
    }

    createReticle(){

        if(!this.casterIsLocalPlayer) return;

        this.reticle = new PIXI.Graphics();
        //stroke a rectangle
        this.reticle.lineStyle(2, {r: 0, g: 255, b: 0, a: 1});
        this.reticle.drawRect(0, 0, 20, 20);
        this.reticle.endFill();
        this.reticle.position.set(this.entity.x, this.entity.y);
        this.match.game.viewport.addChild(this.reticle);
    }

    updateReticlePosition(doLerp: boolean = true){
        if(!this.reticle || !this.casterIsLocalPlayer) return;

        const x = this.entity.targetX - this.reticle.width / 2;
        const y = this.entity.targetY - this.reticle.height / 2;

        if(doLerp){
            this.reticle.x = lerp(this.reticle.x, x, .1);
            this.reticle.y = lerp(this.reticle.y, y, .1);
        }else{
            this.reticle.x = x;
            this.reticle.y = y;
        }
    }

}