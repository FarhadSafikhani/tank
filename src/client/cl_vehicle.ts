import * as PIXI from "pixi.js";
import { CL_Entity } from "./cl_entity";
import { lerp } from "../common/utils";
import { CL_Match } from "./match";
import { CL_Weapon } from "./weapons/cl_weapon";
import { SV_Weapon } from "../server/weapons/sv_weapon";
import { CL_Weapon_25mm } from "./weapons/cl_weapon_25mm";
import { CL_Weapon_120mm } from "./weapons/cl_weapon_120mm";
import { CL_Weapon_50cal } from "./weapons/cl_weapon_50cal";
import { SV_Vehicle } from "../server/vehicle/sv_vehicle";


export class CL_Vehicle extends CL_Entity{

    entity: SV_Vehicle;

    gConatiner: PIXI.Graphics;
    graphicsTankBody: PIXI.Graphics;
    graphicsTurret: PIXI.Graphics;
    graphicsHealthBar: PIXI.Graphics;

    isCLientVehicle: boolean = false;
    muzzleScale: number = 0;

    localKia: boolean = false;

    mainWeapon: CL_Weapon | undefined;
    secondaryWeapon: CL_Weapon | undefined;

    colorFilter: PIXI.ColorMatrixFilter;

    constructor(match: CL_Match, entity: SV_Vehicle){
        super(match, entity);
        this.drawAngleIndicator();
        this.drawTurret();
        this.createHealthBar()
        this.isCLientVehicle = match.room.sessionId === entity.id;
        if(this.isCLientVehicle){
            this.match.currentPlayerVehcile = this;
            this.match.game.viewport.follow(this.container);
            this.mainWeapon = this.setupWeapon(entity.mainWeapon);
            this.secondaryWeapon = this.setupWeapon(entity.secondaryWeapon);
        }
        this.colorFilter = CL_Vehicle.getColorFilterByTeam(this.entity.team);
        this.resetColorFilter(this.gConatiner);
    }

    setupWeapon(svWeapon: SV_Weapon): CL_Weapon{
        let weapon: CL_Weapon;
        switch(svWeapon.tag){
            case "25mm":
                weapon = new CL_Weapon_25mm(this, svWeapon);
                break;
            case "120mm":
                weapon = new CL_Weapon_120mm(this, svWeapon);
                break;
            case "50cal":
                weapon = new CL_Weapon_50cal(this, svWeapon);
                break;  
            default:
                throw new Error("Unknown weapon tag: " + svWeapon.tag);
                break;
        }
        return weapon;
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

    createHealthBar(){
        const healthBar = new PIXI.Graphics();
        healthBar.lineStyle(1, { r: 110, g: 110, b: 110 });
        healthBar.drawRect(-20, -40, 40, 4);
        healthBar.endFill();
        healthBar.position.set(0, -10);
        this.graphicsHealthBar = healthBar;

        const healthBarBarFG = new PIXI.Graphics();
        healthBarBarFG.beginFill({ r: 0, g: 255, b: 0, a: .6});
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
        
        const compDestro = this.entity.cDestructable;
        if(compDestro){
            if(this.localKia != compDestro.isKia){
                this.localKia = compDestro.isKia;
                if(this.localKia){
                    this.onKia();
                } else {
                    this.onRespawn();
                }     
            }
        }


        this.updateHealthBar();

        this.mainWeapon?.update();
        this.secondaryWeapon?.update();
    }

    aliveTick(): void {
        this.container.x = lerp(this.container.x, this.entity.x, 0.2);
        this.container.y = lerp(this.container.y, this.entity.y, 0.2);
        this.graphicsTankBody.rotation = this.entity.angle;
        this.graphicsTurret.rotation = this.entity.turretAngle;
    }

    destroy(): void {
        if(this.isCLientVehicle){
            this.match.game.viewport.pause = true;
        }
        super.destroy();
    }

    // Helper function to interpolate angles
    //this.lerpAngle(this.graphicsTurret.rotation, this.entity.turretAngle + Math.PI, 0.5); 
    lerpAngle(a: number, b: number, t: number): number {
        const angle = (((b - a + Math.PI * 2) % (Math.PI * 2) - Math.PI) % (Math.PI * 2));
        return a + angle * t;
    }

    onKia(): void {
        const gray = new PIXI.Color({r: 111, g: 111, b: 111}).toNumber();
        const filter = new PIXI.ColorMatrixFilter();
        filter.tint(gray, false);
        this.gConatiner.filters = [filter];
        this.graphicsHealthBar.alpha = 0;
        this.match.ptm.spawnKiaParticles(this.container);
    }

    onRespawn(): void {
        this.gConatiner.filters = [];
        this.container.x = this.entity.x;
        this.container.y = this.entity.y;
        this.graphicsTankBody.rotation = this.entity.angle;
        this.graphicsTurret.rotation = this.entity.turretAngle;
        this.gConatiner.alpha = 1;
        this.graphicsHealthBar.alpha = 1;
        this.resetColorFilter(this.gConatiner);
    }

    // public readonly hueShifts = [0, 0, 90, 240, 270, 180, 300, 150, 60, 120, 210];
    // getTeamHueShift(team: number): number {

    //     if(team < this.hueShifts.length){
    //         return this.hueShifts[team];
    //     }

    //     return Math.round(Math.random() * 360);
    // }

    resetColorFilter(graphics: PIXI.Graphics): void {
        graphics.filters = [this.colorFilter];
    }

    //TODO: move to match and persist color, so random colors are consistent between client and server
    static getColorFilterByTeam(team: number): PIXI.ColorMatrixFilter {
        
        const colorMatrix = new PIXI.ColorMatrixFilter();

        if(team == 0){
            return colorMatrix;
        }

        switch(team){
            
            case 1:
                //lime green
                const team1Color = new PIXI.Color({r: 0, g: 255, b: 0}).toNumber();
                colorMatrix.tint(team1Color, true);
                break;
            case 2:
                //cyan
                const team6Color = new PIXI.Color({r: 0, g: 255, b: 255}).toNumber();
                colorMatrix.tint(team6Color, true);
                break;
            case 3:
                //red
                const team3Color = new PIXI.Color({r: 255, g: 0, b: 0}).toNumber();
                colorMatrix.tint(team3Color, true);
                break;
            case 4:
                //yellow
                const team4Color = new PIXI.Color({r: 255, g: 255, b: 0}).toNumber();
                colorMatrix.tint(team4Color, true);
                break;
            case 5:
                //hot pink
                const team5Color = new PIXI.Color({r: 255, g: 0, b: 255}).toNumber();
                colorMatrix.tint(team5Color, true);
                break;
            case 6:
                //blue
                const team2Color = new PIXI.Color({r: 6, g: 6, b: 120}).toNumber();
                colorMatrix.contrast(.6, true);
                colorMatrix.brightness(1.75, true);
                colorMatrix.tint(team2Color, true);
                break;
            case 7:
                //orange
                const team7Color = new PIXI.Color({r: 255, g: 165, b: 0}).toNumber();
                colorMatrix.tint(team7Color, true);
                break;
            case 8:
                //soft pink
                const team8Color = new PIXI.Color({r: 255, g: 105, b: 180}).toNumber();
                colorMatrix.tint(team8Color, true);
                break;
            case 9:
                //dark purple
                const team9Color = new PIXI.Color({r: 75, g: 0, b: 133}).toNumber();
                colorMatrix.tint(team9Color, true);
                colorMatrix.brightness(1.4, true);
                break;
            default:
                const huedColor = new PIXI.Color({r:255, g: 255, b: 255}).toNumber();
                colorMatrix.tint(huedColor, true);
                colorMatrix.hue(60, true);
                break;
        }

        return colorMatrix;

    }




}