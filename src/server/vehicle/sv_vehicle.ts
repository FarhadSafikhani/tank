import { type } from "@colyseus/schema";
import Matter from "matter-js";
import { SV_Comp_Destructable, SV_Entity } from "../entities/sv_entity";
import { SV_Player } from "../entities/sv_player";
import { SV_Weapon } from "../weapons/sv_weapon";

export interface VehicleBaseStats {
    width: number;
    height: number;
    accel: number;
    turnRate: number;
    maxSpeed: number;
    friction: number;
    startingMaxHealth: number;
    density: number;
}

export class SV_Vehicle extends SV_Entity {

    @type("float64") vx: number = 0;
    @type("float64") vy: number = 0;
    @type("float64") turretAngle: number = 0;
    @type("string") verts: string = "";
    @type(SV_Weapon) mainWeapon: SV_Weapon | undefined;
    @type(SV_Weapon) secondaryWeapon: SV_Weapon | undefined;

    cDestructable!: SV_Comp_Destructable;
    player: SV_Player;
    body!: Matter.Body;
    stats: VehicleBaseStats;

    constructor(player: SV_Player, x: number, y: number, stats: VehicleBaseStats) {
        super(player.state, player.id, player.team);
        this.stats = stats;
        this.player = player;
        this.name = player.name;
        this.tag = "vehicle";
        this.x = x;
        this.y = y;
        this.body = this.createBody();
        this.cDestructable = new SV_Comp_Destructable(this, this.stats.startingMaxHealth, this.onKia.bind(this));
    }

    createBody() {
        const tankBody = Matter.Bodies.circle(this.x, this.y, this.stats.width);
        const points = tankBody.vertices.map(vertex => {
            return { x: this.x - vertex.x, y: this.y - vertex.y };
        });
        this.verts = JSON.stringify(points);
        return tankBody;
    }

    update() {

        if(this.dead) return;

        if(!this.cDestructable.isKia) {
            this.updateMovement();
            this.player.mDown && this.mainWeapon?.fire(this.turretAngle);
            this.player.rmDown && this.secondaryWeapon?.fire(this.turretAngle);
        }

        this.mainWeapon?.update();
        this.secondaryWeapon?.update();

        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;

    }

    updateMovement() {

        if (this.player.aDown) {
            Matter.Body.rotate(this.body, -this.stats.turnRate);
            Matter.Body.setAngularSpeed(this.body, 0);     
        } else if (this.player.dDown) {
            Matter.Body.rotate(this.body, +this.stats.turnRate);
            Matter.Body.setAngularSpeed(this.body, 0);
        } 

        if (this.player.wDown) {
            this.vx = Math.cos(this.angle) * this.stats.accel;
            this.vy = Math.sin(this.angle) * this.stats.accel;
            Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});
        } else if (this.player.sDown) {
            this.vx = -Math.cos(this.angle) * this.stats.accel;
            this.vy = -Math.sin(this.angle) * this.stats.accel;
            Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});
        } else {

            //goal here is, when no acceleration keys are pressed, apply a force to reduce the sideways velocity
            const velocity = this.body.velocity;

            // Calculate the perpendicular vector (to the tank's facing direction)
            const perpAngle = this.angle + Math.PI / 2; // Rotate the angle by 90 degrees to get the perpendicular
            const perpVx = Math.cos(perpAngle);
            const perpVy = Math.sin(perpAngle);
        
            // Project the current velocity onto the perpendicular vector to get the sideways velocity component
            const dotProduct = velocity.x * perpVx + velocity.y * perpVy;
            const sideVx = perpVx * dotProduct;
            const sideVy = perpVy * dotProduct;
        
            // Apply a force to reduce the sideways velocity
            // Adjust the reductionFactor to control how quickly the velocity is reduced
            const reductionFactor = 0.15;
            Matter.Body.applyForce(this.body, this.body.position, {
                x: -sideVx * reductionFactor,
                y: -sideVy * reductionFactor
            });
        }
    }

    onKia() {
        this.player.killedInAction();
        this.player.lastKillerId = this.cDestructable.lastAttackerId;
        this.player.lastKillerName = this.cDestructable.lastAttackerName;
    }

    onMouseMove(mx: number, my: number) {
        if(this.cDestructable?.isKia){
            return;
        }
        this.turretAngle = Math.atan2(my - this.y, mx - this.x);
    }

    respawn() {
        const spawnPos = this.state.pickRandomSpawnPoint();
        Matter.Body.setPosition(this.body, { x: spawnPos.x, y: spawnPos.y });
        Matter.Body.setAngularSpeed(this.body, 0);
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 }); 

        this.cDestructable.reset();
        this.mainWeapon?.reInit();
        this.secondaryWeapon?.reInit();
    }

}