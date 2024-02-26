import Matter, { Engine, IEventCollision } from "matter-js";
import { SV_Entity } from "./sv_entity";
import { type } from "@colyseus/schema"; 
import { State } from "./State";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Player } from "./sv_player";

export class SV_Enemy extends SV_Entity {

    @type("float64") vx: number = 0;
    @type("float64") vy: number = 0;
    @type("float64") turretAngle: number = 0;
    @type("int32") healthCurr: number = 0;
    @type("int32") healthMax: number = 0;
    @type("int32") size: number = 32;


    accel: number = .15; 
    turnRate: number = 0.05; 
    maxSpeed: number = 4;
    friction: number = 0.75;
    startingMaxHealth: number = 100;
    damage: number = 10;

    body: Matter.Body;

    constructor(state: State, id: string, x: number, y: number) {
        super(state, id);
        this.tag = "enemy";
        this.x = x;
        this.y = y;
        this.body = this.createBody();
        this.healthMax = this.startingMaxHealth;
        this.healthCurr = this.healthMax;
    }

    createBody() {
        
        const tankBody = Matter.Bodies.circle(this.x, this.y, this.size,
        {
            isStatic: false, friction: this.friction, 
            frictionAir: 0.01, restitution: 0.4, 
            density: 0.4,
            collisionFilter: {
                category: CollisionCategory.ENEMY, // category for projectiles
                mask: CollisionCategory.PROJECTILE | CollisionCategory.PLAYER | CollisionCategory.WORLD | CollisionCategory.ENEMY
                // group: 1
            },
        });

        return tankBody;
    }


    update() {

        if(this.dead) return;

        if(this.healthCurr <= 0) {
            this.healthCurr = 0;
            this.dead = true;
            return;
        }

        //console.log("enemy update", this.x, this.y, this.healthCurr);

        
        // if (this.aDown) {
            
        //     Matter.Body.rotate(this.body, -this.turnRate);
        //     Matter.Body.setAngularSpeed(this.body, 0);
            
        // } else if (this.dDown) {
            
        //     Matter.Body.rotate(this.body, +this.turnRate);
        //     Matter.Body.setAngularSpeed(this.body, 0);
        // } 

        // if (this.wDown) {
        //     this.vx = Math.cos(this.angle) * this.accel;
        //     this.vy = Math.sin(this.angle) * this.accel;
        //     Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});
        // } else if (this.sDown) {
        //     this.vx = -Math.cos(this.angle) * this.accel;
        //     this.vy = -Math.sin(this.angle) * this.accel;
        //     Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});
        // } else {

        //     //goal here is, when no acceleration keys are pressed, apply a force to reduce the sideways velocity
        //     const velocity = this.body.velocity;

        //     // Calculate the perpendicular vector (to the tank's facing direction)
        //     const perpAngle = this.angle + Math.PI / 2; // Rotate the angle by 90 degrees to get the perpendicular
        //     const perpVx = Math.cos(perpAngle);
        //     const perpVy = Math.sin(perpAngle);
        
        //     // Project the current velocity onto the perpendicular vector to get the sideways velocity component
        //     const dotProduct = velocity.x * perpVx + velocity.y * perpVy;
        //     const sideVx = perpVx * dotProduct;
        //     const sideVy = perpVy * dotProduct;
        
        //     // Apply a force to reduce the sideways velocity
        //     // Adjust the reductionFactor to control how quickly the velocity is reduced
        //     const reductionFactor = 0.15;
        //     Matter.Body.applyForce(this.body, this.body.position, {
        //         x: -sideVx * reductionFactor,
        //         y: -sideVy * reductionFactor
        //     });
        // }


        // // Limit velocity to maximum speed
        // const speed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
        // if (speed > this.maxSpeed) {
        //     const ratio = this.maxSpeed / speed;
        //     Matter.Body.setVelocity(this.body, {
        //         x: this.body.velocity.x * ratio,
        //         y: this.body.velocity.y * ratio
        //     });
        // }


        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;
        


    }

    // onClick(x: number, y: number) {

        
    //     const spawnX = this.x + Math.cos(this.turretAngle) * 40;
    //     const spawnY = this.y + Math.sin(this.turretAngle) * 40;
    //     const spawnAngle = Math.atan2(this.y - spawnY, this.x - spawnX);

    //     this.state.createProjectile(this, spawnX, spawnY, spawnAngle);

    //     const forceMagnitude = -1; //kickback force - gradual
    //     const forceX = Math.cos(spawnAngle) * forceMagnitude;
    //     const forceY = Math.sin(spawnAngle) * forceMagnitude;
    //     Matter.Body.applyForce(this.body, { x: this.x, y: this.y }, { x: -forceX, y: -forceY });

    //     // Move the tank along the same vector as the applied force
    //     const moveMagnitude = 5; //kickback force - sudden
    //     const moveX = Math.cos(spawnAngle) * moveMagnitude;
    //     const moveY = Math.sin(spawnAngle) * moveMagnitude;
    //     Matter.Body.setPosition(this.body, { x: this.body.position.x + moveX, y: this.body.position.y + moveY });

        
    // }


    onCollisionStart(otherEntity: SV_Entity, collision: IEventCollision<Engine>) {
        if(this.body && otherEntity && otherEntity.body) {
            if(otherEntity.tag === "player"){
                const player = otherEntity as SV_Player;
                player.healthCurr -= this.damage;
            }
        }

    }

    
}




