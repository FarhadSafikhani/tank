import { type } from "@colyseus/schema";
import Matter, { Engine, IEventCollision } from "matter-js";
import { CollisionCategory } from "../../common/interfaces";
import { BaseState } from "../rooms/sv_state_base";
import { SV_Vehicle } from "../vehicle/sv_vehicle";
import { SV_Comp_Destructable, SV_Entity } from "./sv_entity";

export class SV_Enemy extends SV_Entity {

    @type("float64") vx: number = 0;
    @type("float64") vy: number = 0;
    @type("float64") turretAngle: number = 0;
    @type("int32") size: number = 26;

    name: string = "";
    accel: number = .1; 
    turnRate: number = .8; 
    maxSpeed: number = 3;
    friction: number = 0.75;
    startingMaxHealth: number = 40;
    damage: number = 18;

    cDestructable!: SV_Comp_Destructable;
    body: Matter.Body;

    currentTarget: SV_Vehicle | null = null;
    searchTargetEveryMs: number = 2000;
    nextChaseTime: number = Date.now();


    constructor(state: BaseState, id: string, x: number, y: number) {
        super(state, id);
        this.tag = "enemy";
        this.x = x;
        this.y = y;
        this.body = this.createBody();
        this.cDestructable = new SV_Comp_Destructable(this, this.startingMaxHealth, this.onKia.bind(this));
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

        if(!this.cDestructable.isKia) {
            this.tryAcquireTarget();
            this.tryChaseTarget();
        }

        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;

    }

    tryAcquireTarget() {
        if(this.nextChaseTime < Date.now()) {
            this.currentTarget = this.acquireTarget();
            this.nextChaseTime = Date.now() + this.searchTargetEveryMs;
        }
    }

    tryChaseTarget() {

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
    }

    acquireTarget(): SV_Vehicle | null {
        const entities = this.state.entities.values();   
        let closestPlayer: SV_Vehicle | null = null;
        let closestDistance = 999999;
        for(let vehicle of entities) {
            if(vehicle instanceof SV_Vehicle && vehicle.team !== this.team) {
                const distance = Math.sqrt(Math.pow(vehicle.x - this.x, 2) + Math.pow(vehicle.y - this.y, 2));
                if(distance < closestDistance) {
                    closestDistance = distance;
                    closestPlayer = vehicle;
                }
            }
        }
        return closestPlayer;
    }

    onCollisionStart(otherEntity: SV_Entity, collision: IEventCollision<Engine>) {
        if(this.body && otherEntity && otherEntity.body) {
            if(otherEntity instanceof SV_Vehicle && otherEntity.team !== this.team) {
                otherEntity.cDestructable?.takeDamage(this.damage, this);
            }
        }
    }

    onKia() {
        this.dead = true;
    }


    
}




