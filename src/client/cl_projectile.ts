import * as PIXI from "pixi.js";
import { CL_Entity } from "./cl_entity";
import { Game } from "./game";
import { SV_Projectile } from "../server/rooms/sv_projectile";
import { lerp } from "../common/utils";


export class CL_Projectile extends CL_Entity{

    entity: SV_Projectile;
   
    constructor(game: Game, entity: SV_Projectile){
        super(game, entity);
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


        //manually go over verts and draw circles
        // const gVerts = new PIXI.Graphics();
        // bodyVerts.forEach((v: { x: number, y: number }, i: number) => {
        //     console.log("v", v);
        //     gVerts.beginFill({ r: 255, g: 255, b: 255 });
        //     gVerts.drawCircle(v.x, v.y, 3);
        //     gVerts.endFill();
        // });
        // graphics.addChild(gVerts);

        //graphics.rotation = this.entity.angle;
        this.game.viewport.addChild(graphics);

        return graphics;
    }

    drawDebugLine(){
        const line = new PIXI.Graphics();
        line.lineStyle(4, 'cyan', 1);
        line.moveTo(this.entity.casterX, this.entity.casterY);
        line.lineTo(this.entity.x, this.entity.y);
        this.game.viewport.addChild(line);
    }


    destroy(){ 
        this.game.viewport.removeChild(this.graphics);
        this.graphics.destroy();
    }

    update(): void {
        if(!this.entity || !this.graphics || this.entity.dead) return;
        this.graphics.x = lerp(this.graphics.x, this.entity.x, 0.2);
        this.graphics.y = lerp(this.graphics.y, this.entity.y, 0.2);
        this.graphics.rotation = this.entity.angle;

        // const gVerts = this.graphics.children[0] as PIXI.Graphics;
        // const bodyVerts = JSON.parse(this.entity.verts);
        // gVerts.clear();
        // bodyVerts.forEach((v: { x: number, y: number }, i: number) => {
        //     gVerts.beginFill({ r: 255, g: 255, b: 255 });
        //     gVerts.drawCircle(v.x, v.y, 3);
        //     gVerts.endFill();
        // });

        
    }

}