import * as PIXI from "pixi.js";
import { CL_Match } from "./match";
import { CL_Vehicle } from "./cl_vehicle";
import { SV_MediumTank } from "../server/vehicle/sv_vehicle_medium_tank";
import { SV_APC } from "../server/vehicle/sv_vehicle_apc";

export class CL_APC extends CL_Vehicle{

    entity: SV_APC;

    constructor(match: CL_Match, entity: SV_APC){
        super(match, entity);
    }

    createGraphics(): void {
        
        this.gConatiner = new PIXI.Graphics();

        // DRAW BODY
        const tankVertices = JSON.parse(this.entity.verts);
        this.graphicsTankBody = new PIXI.Graphics();
        // Create a closed path by connecting the vertices
        this.graphicsTankBody.clear();
        this.graphicsTankBody.beginFill( { r: 145, g: 145, b: 145 }); // Set the fill color g155 0 0
        this.graphicsTankBody.drawPolygon(tankVertices);
        this.graphicsTankBody.endFill();
        this.gConatiner.addChild(this.graphicsTankBody);
        this.container.addChild(this.gConatiner);
    }

    drawAngleIndicator() {
        const size = 13;
        const position = 17;
        const angleIndicator = new PIXI.Graphics();
        angleIndicator.beginFill({ r: 200, g: 200, b: 200 }); 
        angleIndicator.moveTo(0, -size);
        angleIndicator.lineTo(0, size);
        angleIndicator.lineTo(6, 0); // Add this line to draw the arrow-like triangle
        angleIndicator.lineTo(0, -size); // Add this line to complete the triangle
        angleIndicator.endFill();
        angleIndicator.x = position;
        this.graphicsTankBody.addChild(angleIndicator);
    }

    drawTurret(){

        // DRAW TURRET
        const tankCenterX = -5;

        const fullTurret = new PIXI.Graphics();

        // DRAW TURRET BASE
        const squareSize = 18; // adjust the size of the square as needed
        const squareX = tankCenterX - squareSize / 2; // position the square at the base of the turret
        const squareY = 0 - squareSize / 2; // position the square vertically centered
        const triangleLength = 6; // adjust the length of the triangle as needed
        const triangleHeight = 17; // adjust the height of the triangle as needed
        const triangleX = squareX + squareSize; // position the triangle at the end of the square
        const triangleY = squareY + squareSize / 2 - triangleHeight / 2; // position the triangle vertically centered

        // Combine the square and triangle into a single polygon
        const polygon = new PIXI.Graphics();
        polygon.lineStyle(2, { r: 190, g: 190, b: 190 }); // Set the stroke color to dark green
        polygon.beginFill({ r: 133, g: 133, b: 133 }); // Set the fill color to dark green
        polygon.moveTo(squareX, squareY);
        polygon.lineTo(squareX + squareSize, squareY);
        polygon.lineTo(triangleX + triangleLength, triangleY + triangleHeight / 2);
        polygon.lineTo(squareX + squareSize, squareY + squareSize);
        polygon.lineTo(squareX, squareY + squareSize);
        polygon.lineTo(squareX, squareY);
        polygon.endFill();
        fullTurret.addChild(polygon);

        //rocket pod
        const rocketPod = new PIXI.Graphics();
        rocketPod.lineStyle(2, { r: 190, g: 190, b: 190 }); // Set the stroke color to dark green
        rocketPod.beginFill({ r: 133, g: 133, b: 133 }); // Set the fill color to dark green
        rocketPod.drawRect(-10, 6, 15, 10); // Draw a filled and stroked rectangle
        rocketPod.endFill();
        fullTurret.addChild(rocketPod);

        const turretBarrel = new PIXI.Graphics();
        turretBarrel.lineStyle(2, { r: 200, g: 200, b: 200 }); // Set the stroke color to dark green
        turretBarrel.beginFill({ r: 55, g: 55, b: 55 }); // Set the fill color to dark green
        turretBarrel.drawRect(6, -2, 22, 4); // Draw a filled and stroked rectangle
        turretBarrel.endFill();
        fullTurret.addChild(turretBarrel);

        this.graphicsTurret = fullTurret;
        this.gConatiner.addChild(fullTurret);
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