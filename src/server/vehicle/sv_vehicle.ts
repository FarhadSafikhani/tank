import { Schema, type } from "@colyseus/schema";
import { SV_Entity } from "../entities/sv_entity";
import Matter from "matter-js";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Weapon } from "../weapons/sv_weapon";
import { SV_Weapon_120mm } from "../weapons/sv_weapon_120mm";
import { SV_Weapon_50cal } from "../weapons/sv_weapon_50cal";
import { BaseState } from "../rooms/sv_state_base";
import { SV_Player } from "../entities/sv_player";
import { SV_Weapon_25mm } from "../weapons/sv_weapon_25mm";

export class SV_Vehicle extends SV_Entity {

    @type("float64") vx: number = 0;
    @type("float64") vy: number = 0;
    @type("float64") turretAngle: number = 0;
    @type("string") verts: string = "";
    @type("int32") healthCurr: number = 0;
    @type("int32") healthMax: number = 0;
    @type("boolean") isKia: boolean = false;
    @type("int32") w: number = 60;
    @type("int32") h: number = 40;
    @type(SV_Weapon) mainWeapon: SV_Weapon;
    @type(SV_Weapon) secondaryWeapon: SV_Weapon;

    isDestructable: boolean = true;
    
    player: SV_Player;
    body: Matter.Body;

    //Tank Handling, Balance
    accel: number = .42;
    turnRate: number = 0.03;
    maxSpeed: number = 116;
    friction: number = .03;
    startingMaxHealth: number = 120;

    constructor(player: SV_Player, x: number, y: number) {
        super(player.state, player.id, player.team);
        this.player = player;
        this.name = player.name;
        this.tag = "vehicle";
        this.x = x;
        this.y = y;
        this.body = this.createBody();
        this.healthMax = this.startingMaxHealth;
        this.healthCurr = this.healthMax;
        
        this.mainWeapon = new SV_Weapon_120mm(this);
        //this.secondaryWeapon = new SV_Weapon_25mm(this);
        this.secondaryWeapon = new SV_Weapon_50cal(this);
    }

    createBody() {
        
        const tankBody = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: false, friction: .3, 
            frictionAir: this.friction, restitution: 0.6, 
            density: 1,
            chamfer: { radius: 6 },
            collisionFilter: {
                group: -this.team, //group for collision filtering
                category: CollisionCategory.PLAYER, // category for projectiles
                mask: CollisionCategory.PROJECTILE | CollisionCategory.PLAYER | 
                CollisionCategory.ENEMY | CollisionCategory.ENEMY_PROJECTILE, // mask for other objects (e.g., players)
                
            },
        });

        const points = tankBody.vertices.map(vertex => {
            return { x: this.x - vertex.x, y: this.y - vertex.y };
        });

        this.verts = JSON.stringify(points);
        return tankBody;
    }

    update() {

        if(this.dead) return;

        this.mainWeapon.update();
        this.secondaryWeapon.update();

        if(!this.isKia){
            this.updateMovement();
            this.player.rmDown && this.secondaryWeapon.fire(this.turretAngle);
            this.player.mDown && this.mainWeapon.fire(this.turretAngle);
        }

        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;

    }

    updateMovement() {

        if (this.player.aDown) {
            Matter.Body.rotate(this.body, -this.turnRate);
            Matter.Body.setAngularSpeed(this.body, 0);     
        } else if (this.player.dDown) {
            Matter.Body.rotate(this.body, +this.turnRate);
            Matter.Body.setAngularSpeed(this.body, 0);
        } 

        if (this.player.wDown) {
            this.vx = Math.cos(this.angle) * this.accel;
            this.vy = Math.sin(this.angle) * this.accel;
            Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});
        } else if (this.player.sDown) {
            this.vx = -Math.cos(this.angle) * this.accel;
            this.vy = -Math.sin(this.angle) * this.accel;
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

    takeDamage(damage: number, attacker: SV_Entity) {
        
        if(this.dead || this.player.isKia || this.healthCurr <= 0) return;
        
        this.healthCurr -= damage;
        if(this.healthCurr <= 0 && attacker){
            this.healthCurr = 0;
            this.isKia = true;
            this.player.killedInAction();
            this.player.lastKillerId = attacker.id;
            this.player.lastKillerName = attacker.name;
        }
    }

    onMouseMove(mx: number, my: number) {
        if(this.isKia){
            return;
        }
        this.turretAngle = Math.atan2(my - this.y, mx - this.x);
    }

    respawn() {
        const spawnPos = this.state.pickRandomSpawnPoint();
        Matter.Body.setPosition(this.body, { x: spawnPos.x, y: spawnPos.y });
        Matter.Body.setAngularSpeed(this.body, 0);
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 }); 

        this.healthCurr = this.healthMax;
        this.mainWeapon.reInit();
        this.secondaryWeapon.reInit();
        this.isKia = false;
    }

}