import * as PIXI from "pixi.js";
import { CL_Entity, EntityState } from "./cl_entity";
import { SV_Player } from "../server/entities/sv_player";
import { Game } from "./game";
import { lerp } from "../common/utils";
import { SV_Enemy } from "../server/entities/sv_enemy";
import { CL_Match } from "./match";


export class CL_Enemy extends CL_Entity{

    entity: SV_Enemy;
    graphicsHealthBar: PIXI.Graphics;

    constructor(match: CL_Match, entity: SV_Enemy){
        super(match, entity);
        this.createHealthBar();
    }

    createGraphics(): void {
        const g = new PIXI.Graphics();
        g.beginFill({ r: 222, g: 0, b: 0 })
        g.drawCircle(0, 0, this.entity.size);
        g.endFill();
        this.container.addChild(g);
    }


    createHealthBar(){
        const healthBar = new PIXI.Graphics();
        
        healthBar.lineStyle(1, { r: 110, g: 110, b: 110 });
        healthBar.drawRect(-20, -40, 40, 4);
        healthBar.endFill();
        
        this.graphicsHealthBar = healthBar;

        const healthBarBarFG = new PIXI.Graphics();
        healthBarBarFG.beginFill({ r: 0, g: 255, b: 0 });
        healthBarBarFG.drawRect(-20, -40, 40, 4);
        healthBarBarFG.endFill();
        
        this.graphicsHealthBar.addChild(healthBarBarFG);

        this.container.addChild(this.graphicsHealthBar);

        this.updateHealthBar();
    }

    updateHealthBar(){
        const compDestro = this.entity.cDestructable;
        if(!compDestro){
            return;
        }

        const healthBarFG = this.graphicsHealthBar.children[0] as PIXI.Graphics;
        let scale = compDestro.healthCurr / compDestro.healthMax;
        if(scale < 0 ) {
            scale = 0;
        }

        healthBarFG.scale.x = scale;
        // Adjust the position instead of pivot to keep the left edge anchored
        healthBarFG.position.x = -20 * (1 - scale); // Adjust this value as needed to align correctly with the parent
    }

    onChange(): void {

        this.updateHealthBar();
    }


    aliveTick(): void {
        this.container.x = lerp(this.container.x, this.entity.x, 0.2);
        this.container.y = lerp(this.container.y, this.entity.y, 0.2);
        this.container.rotation = this.entity.angle;
        this.container.rotation = this.entity.turretAngle;
    }



}