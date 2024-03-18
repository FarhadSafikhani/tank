import Matter, { Engine, IEventCollision } from "matter-js";
import { SV_Entity } from "./sv_entity";
import { type, MapSchema } from "@colyseus/schema";
import { BaseState } from "../rooms/sv_state_base";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Enemy } from "./sv_enemy";

export class SV_Player extends SV_Entity {

    @type("float64") vx: number = 0;
    @type("float64") vy: number = 0;
    @type("float64") turretAngle: number = 0;
    @type("string") verts: string = "";
    @type("int32") shots: number = 0;
    @type("int32") healthCurr: number = 0;
    @type("int32") healthMax: number = 0;
    @type("int32") w: number = 60;
    @type("int32") h: number = 40;
    @type("int32") respawnTimeLeft: number = 0;
    @type("string") name: string = "";
    @type("string") lastKillerName: string = "";

    //knocked out of action but not "dead" aka dont remove from game yet
    @type("boolean") kia: boolean = false;

    @type({ map: "int32" }) matchStats = new MapSchema<number>();

    //Tank Handling, Balance
    accel: number = .45;
    turnRate: number = 0.03;
    maxSpeed: number = 116;
    friction: number = .03;
    //turretSpeed: number = 0.04;
    startingMaxHealth: number = 120;
    respawnTime: number = 3000;

    respawnTimeNext = 0;
    body: Matter.Body;
    wDown: boolean = false;
    sDown: boolean = false;
    aDown: boolean = false;
    dDown: boolean = false;
    turretAngleTarget: number = 0;

    lastKillerId: string = "";


    constructor(state: BaseState, id: string, x: number, y: number, name: string) {
        super(state, id);
        this.tag = "player";
        this.x = x;
        this.y = y;
        this.body = this.createBody();
        this.healthMax = this.startingMaxHealth;
        this.healthCurr = this.healthMax;
        this.name = name;
    }

    createBody() {
        
        const tankBody = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: false, friction: .3, 
            frictionAir: this.friction, restitution: 0.6, 
            density: .8,
            chamfer: { radius: 6 },
            collisionFilter: {
                category: CollisionCategory.PLAYER, // category for projectiles
                mask: CollisionCategory.PROJECTILE | CollisionCategory.PLAYER | CollisionCategory.ENEMY | CollisionCategory.ENEMY_PROJECTILE // mask for other objects (e.g., players)
                // group: 1
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

        if(this.kia) {
            
            if(Date.now() >= this.respawnTimeNext) {
                this.respawnTimeLeft = 0;
                this.respawn();
            } else {
                this.respawnTimeLeft = this.respawnTimeNext - Date.now();
            }
            
        } else {

            if(this.healthCurr <= 0) {
                this.healthCurr = 0;
                this.killedInAction();
                // this.dead = true;
                // this.state.onPlayerDeath(this);
                return;
            }    

            this.updateMovement();
            this.updateTurretAngle();
        }

        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;

    }

    updateMovement() {

        if (this.aDown) {
            Matter.Body.rotate(this.body, -this.turnRate);
            Matter.Body.setAngularSpeed(this.body, 0);     
        } else if (this.dDown) {
            Matter.Body.rotate(this.body, +this.turnRate);
            Matter.Body.setAngularSpeed(this.body, 0);
        } 

        if (this.wDown) {
            this.vx = Math.cos(this.angle) * this.accel;
            this.vy = Math.sin(this.angle) * this.accel;
            Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});
        } else if (this.sDown) {
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

        
        // // Limit velocity to maximum speed
        // const speed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
        // if (speed > this.maxSpeed) {
        //     const ratio = this.maxSpeed / speed;
        //     Matter.Body.setVelocity(this.body, {
        //         x: this.body.velocity.x * ratio,
        //         y: this.body.velocity.y * ratio
        //     });
        // }

    }

    updateTurretAngle() {
        // const minSnapDistance = 0.05;
    
        // // Ensure turretAngle is always within 0 to 2*PI range
        // this.turretAngle = (this.turretAngle + 2 * Math.PI) % (2 * Math.PI);
    
        // // Calculate the difference in angles, taking into account angle wrapping
        // let angleDiff = (this.turretAngleTarget - this.turretAngle + Math.PI) % (2 * Math.PI) - Math.PI;
    
        // // Adjust angleDiff to be within the range -PI to PI for direct rotation
        // if (angleDiff > Math.PI) {
        //     angleDiff -= 2 * Math.PI;
        // } else if (angleDiff < -Math.PI) {
        //     angleDiff += 2 * Math.PI;
        // }
    
        // // Determine the step to move the turret by, ensuring it does not overshoot the target angle
        // let step = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turretSpeed);
    
        // // If the absolute difference is greater than a minimum threshold, update the angle by a fixed step
        // if (Math.abs(angleDiff) > minSnapDistance) {
        //     this.turretAngle += step;
    
        //     // Normalize the turret angle to stay within the 0 to 2*PI range
        //     this.turretAngle = (this.turretAngle + 2 * Math.PI) % (2 * Math.PI);
        // } else {
        //     // If the turret is close enough to the target angle, snap directly to the target angle
        //     this.turretAngle = this.turretAngleTarget;
        // }
        this.turretAngle = this.turretAngleTarget;
    }

    onMouseMove(x: number, y: number) {
        //set the turret angle target
        this.turretAngleTarget = Math.atan2(y - this.y, x - this.x);
    }

    onKeyDown(keyCode: string) {
        
        if (keyCode === "w") {
            this.wDown = true;
            this.sDown = false;
        } 
        if (keyCode === "s") {
            this.sDown = true;
            this.wDown = false;
        } 

        if (keyCode === "a") {
            this.aDown = true;
            this.dDown = false;
        }
        if (keyCode === "d") {
            this.dDown = true;
            this.aDown = false;
        }

    }

    onKeyUp(keyCode: string) {
        
        if (keyCode === "w") {
            this.wDown = false;
        } 
        if (keyCode === "s") {
            this.sDown = false;
        } 
        if (keyCode === "a") {
            this.aDown = false;
        }
        if (keyCode === "d") {
            this.dDown = false;
        }
    }

    onMouseDown(x: number, y: number) {

        if(this.dead || this.kia) return;

        this.shoot();
        
    }

    shoot() {

        this.shots++;
        
        //this.healthCurr -= 330;
        
        const spawnX = this.x + Math.cos(this.turretAngle) * 40;
        const spawnY = this.y + Math.sin(this.turretAngle) * 40;
        const spawnAngle = Math.atan2(this.y - spawnY, this.x - spawnX);

        this.state.createProjectile(this, spawnX, spawnY, spawnAngle);

        const forceMagnitude = -.5; //kickback force - gradual
        const forceX = Math.cos(spawnAngle) * forceMagnitude;
        const forceY = Math.sin(spawnAngle) * forceMagnitude;
        Matter.Body.applyForce(this.body, { x: this.x, y: this.y }, { x: -forceX, y: -forceY });

        // Move the tank along the same vector as the applied force
        const moveMagnitude = 3; //kickback force - sudden
        const moveX = Math.cos(spawnAngle) * moveMagnitude;
        const moveY = Math.sin(spawnAngle) * moveMagnitude;
        Matter.Body.setPosition(this.body, { x: this.body.position.x + moveX, y: this.body.position.y + moveY });

        this.matchStats.set("shots", this.shots);
    }


    onCollisionStart(otherEntity: SV_Entity, collision: IEventCollision<Engine>) {
        // if(this.body && otherEntity && otherEntity.body) {
        //     console.log("collision start", this.tag , "is hit by", otherEntity.tag);
        // }
        // this.dead = true;
    }

    killedInAction() {
        this.kia = true;
        this.respawnTimeNext = Date.now() + this.respawnTime;
        Matter.Body.setAngularSpeed(this.body, 0);
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 }); 
    }

    respawn() {
        const spawnPos = this.state.pickRandomSpawnPoint();
        Matter.Body.setPosition(this.body, { x: spawnPos.x, y: spawnPos.y });
        Matter.Body.setAngularSpeed(this.body, 0);
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 }); 
        
        this.kia = false;
        this.healthCurr = this.healthMax;
    }

    takeDamage(damage: number, attacker: SV_Entity) {
        console.log("player taking damage", damage, 'from', attacker.name);
        this.healthCurr -= damage;
        if(this.healthCurr <= 0 && attacker){
            this.lastKillerId = attacker.id;
            this.lastKillerName = attacker.name;
        }

    }

    
}




