import * as PIXI from "pixi.js";
import { CL_Match } from "./match";
import { CL_Vehicle } from "./cl_vehicle";
import { SV_MediumTank } from "../server/vehicle/sv_vehicle_medium_tank";

export class CL_MediumTank extends CL_Vehicle{

    entity: SV_MediumTank;

    constructor(match: CL_Match, entity: SV_MediumTank){
        super(match, entity);
    }

    createGraphics(): void {
        
        this.gConatiner = new PIXI.Graphics();

        // DRAW BODY
        const tankVertices = JSON.parse(this.entity.verts);
        this.graphicsTankBody = new PIXI.Graphics();
        // Create a closed path by connecting the vertices
        this.graphicsTankBody.clear();
        this.graphicsTankBody.beginFill( { r: 155, g: 155, b: 155 }); // Set the fill color g155 0 0
        this.graphicsTankBody.drawPolygon(tankVertices);
        this.graphicsTankBody.endFill();
        this.gConatiner.addChild(this.graphicsTankBody);
        this.container.addChild(this.gConatiner);
    }

    drawAngleIndicator() {
        const size = 15;
        const position = 22;
        const angleIndicator = new PIXI.Graphics();
        angleIndicator.lineStyle(3, { r: 200, g: 200, b: 200 }); 
        angleIndicator.moveTo(0, -size);
        angleIndicator.lineTo(0, size);
        angleIndicator.lineTo(3, 0); // Add this line to draw the arrow-like triangle
        angleIndicator.lineTo(0, -size); // Add this line to complete the triangle
        angleIndicator.endFill();
        angleIndicator.x = position;
        this.graphicsTankBody.addChild(angleIndicator);
    }

    drawTurret(){

        // DRAW TURRET
        const lineLength = 35; // adjust the length of the line as needed
        const tankCenterX = 0;
        const tankCenterY = 0;
        const lineEndX = tankCenterX + lineLength;
        const lineEndY = tankCenterY;
        const turret = new PIXI.Graphics();
        turret.lineStyle(6, { r: 200, g: 200, b: 200 }); // Set the line color to dark green
        turret.beginFill(0x006400); // Set the fill color to dark green
        
        turret.moveTo(tankCenterX, tankCenterY);
        turret.lineTo(lineEndX, lineEndY);
        turret.endFill();

        // DRAW CIRCLE AT THE BASE OF TURRET
        const circleRadius = 13; // adjust the radius of the circle as needed

        turret.beginFill({ r: 233, g: 233, b: 233 }); // Set the fill color to dark green
        turret.drawCircle(tankCenterX, tankCenterY, circleRadius);
        turret.endFill();

        this.graphicsTurret = turret;
        this.gConatiner.addChild(turret);
    }


    onChange(): void {
        super.onChange();
    }

    aliveTick(): void {
        super.aliveTick();
    }

    destroy(): void {
        super.destroy();
    }


    onKia(): void {
        super.onKia();
    }

    onRespawn(): void {
        super.onRespawn();
    }


}