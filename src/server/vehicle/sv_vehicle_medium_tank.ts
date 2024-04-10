import { Schema, type } from "@colyseus/schema";
import { SV_Comp_Destructable, SV_Entity } from "../entities/sv_entity";
import Matter from "matter-js";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Weapon } from "../weapons/sv_weapon";
import { SV_Weapon_120mm } from "../weapons/sv_weapon_120mm";
import { SV_Weapon_50cal } from "../weapons/sv_weapon_50cal";
import { SV_Player } from "../entities/sv_player";
import { SV_Weapon_25mm } from "../weapons/sv_weapon_25mm";
import { SV_Vehicle, VehicleBaseStats } from "./sv_vehicle";



export class SV_MediumTank extends SV_Vehicle {

    w: number = 60;
    h: number = 40;

    constructor(player: SV_Player, x: number, y: number) {

        const stats = {
            accel: .42,
            turnRate: 0.03,
            maxSpeed: 11,
            friction: .03,
            startingMaxHealth: 120,
            density: 1
        };

        super(player, x, y, stats);
        this.tag = "medium_tank";
        
        this.mainWeapon = new SV_Weapon_120mm(this);
        this.secondaryWeapon = new SV_Weapon_50cal(this);
        

    }

    createBody() {
        
        const tankBody = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: false, friction: .3, 
            frictionAir: this.stats.friction, restitution: 0.6, 
            density: this.stats.density,
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
        super.update();
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
        super.onKia();
    }

    onMouseMove(mx: number, my: number) {
        super.onMouseMove(mx, my);
    }

    respawn() {
        super.respawn();
    }

}