import Matter, { Engine, IEventCollision } from "matter-js";
import { SV_Entity } from "./sv_entity";
import { type } from "@colyseus/schema"; 
import { BaseState } from "../rooms/sv_state_base";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Player } from "./sv_player";

export class SV_Enemy extends SV_Entity {

    @type("float64") vx: number = 0;
    @type("float64") vy: number = 0;
    @type("float64") turretAngle: number = 0;
    @type("int32") healthCurr: number = 0;
    @type("int32") healthMax: number = 0;
    @type("int32") size: number = 26;

    name: string = "";
    accel: number = .15; 
    turnRate: number = 1; 
    maxSpeed: number = 3;
    friction: number = 0.75;
    startingMaxHealth: number = 60;
    damage: number = 22;

    body: Matter.Body;

    currentTarget: SV_Player | null = null;

    constructor(state: BaseState, id: string, x: number, y: number) {
        super(state, id);
        this.tag = "enemy";
        this.x = x;
        this.y = y;
        this.body = this.createBody();
        this.healthMax = this.startingMaxHealth;
        this.healthCurr = this.healthMax;
        this.name = "Grunt";
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

        //chase the nearby players
        this.currentTarget = this.acquireTarget();

        if(this.currentTarget) {
            const angleToPlayer = Math.atan2(this.currentTarget.y - this.y, this.currentTarget.x - this.x);
            const angleDiff = angleToPlayer - this.body.angle;

            if(angleDiff > Math.PI) {
                Matter.Body.rotate(this.body, this.turnRate);
            } else if(angleDiff < -Math.PI) {
                Matter.Body.rotate(this.body, -this.turnRate);
            } else if(angleDiff > 0) {
                Matter.Body.rotate(this.body, this.turnRate);
            } else if(angleDiff < 0) {
                Matter.Body.rotate(this.body, -this.turnRate);
            }

            //apply force towards player
            this.vx = Math.cos(this.angle) * this.accel;
            this.vy = Math.sin(this.angle) * this.accel;
            Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});

            // Limit velocity to maximum speed
            const speed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
            if (speed > this.maxSpeed) {
                const ratio = this.maxSpeed / speed;
                Matter.Body.setVelocity(this.body, {
                    x: this.body.velocity.x * ratio,
                    y: this.body.velocity.y * ratio
                });
            }

        }

        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;

    }

    acquireTarget(): SV_Player | null {
    
        //chase the nearby players
        const players = this.state.entities.values();
        let closestPlayer: SV_Player | null = null;
        let closestDistance = 999999;
        for(let player of players) {
            if(player.tag === "player") {
                const distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));
                if(distance < closestDistance) {
                    closestDistance = distance;
                    closestPlayer = player as SV_Player;
                }
            }
        }

        return closestPlayer;

    }

    onCollisionStart(otherEntity: SV_Entity, collision: IEventCollision<Engine>) {
        if(this.body && otherEntity && otherEntity.body) {
            if(otherEntity.tag === "player"){
                const player = otherEntity as SV_Player;
                player.healthCurr -= this.damage;
            }
        }

    }

    takeDamage(damage: number, attacker: SV_Entity) {
        console.log("player taking damage", damage, );
        this.healthCurr -= damage;
        // if(this.healthCurr <= 0 && attacker){
        //     this.lastKillerId = attacker.id;
        //     this.lastKillerName = attacker.name;
        // }

    }

    
}




