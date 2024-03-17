import Matter, { Collision, Engine, IEventCollision } from "matter-js";
import { SV_Entity } from "./sv_entity";
import { type } from "@colyseus/schema"; 
import { BaseState } from "../rooms/sv_state_base";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Player } from "./sv_player";
import { SV_Enemy } from "./sv_enemy";

export class SV_Projectile extends SV_Entity {

    @type("string") verts: string = "";
    @type("number") casterX: number;
    @type("number") casterY: number;

    caster: SV_Entity;
    body: Matter.Body;
    vx: number = 0;
    vy: number = 0;
    age: number = 0;

    // configs
    w: number = 25;
    h: number = 7;
    initialSpeed: number = 10; //40
    damage: number = 32;
    maxAge: number = 1800;
    

    constructor(state: BaseState, id: string, caster: SV_Entity, x: number, y: number, angle: number) {
        super(state, id);
        this.caster = caster;
        this.tag = "projectile";
        this.x = x;
        this.y = y;
        this.casterX = caster.x;
        this.casterY = caster.y;
        this.angle = angle;
        this.body = this.createBody();

        this.vx = -Math.cos(this.angle) * this.initialSpeed;
        this.vy = -Math.sin(this.angle) * this.initialSpeed;
        
        Matter.Body.setVelocity(this.body, {x: this.vx, y: this.vy});
    }

    createBody() {

        /*
            category?: number | undefined; // The category of colliding bodies
            mask?: number | undefined; // determines the category of objects that this body can collide with
            group?: number | undefined;   // bodies with same group always collide if group is positive, 
            never collide if group is negative
        */
        
        const body = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: false, frictionAir: 0, friction: 0, restitution: 0.5, density: 0.2,
            collisionFilter: {
                category: CollisionCategory.PROJECTILE,
                mask: CollisionCategory.PLAYER | CollisionCategory.WORLD, 
                group: -1 //set group -1 if projectiles should not collide with each other
            }
        });
        
        const points = body.vertices.map(vertex => {
            return { x: this.x - vertex.x, y: this.y - vertex.y };
        });
        //setting the angle here will keep the vertices in the same position relative to the body
        Matter.Body.setAngle(body, this.angle);
        this.verts = JSON.stringify(points);

        return body;
    }

    update(deltaTime): void {
        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.angle = this.body.angle;
        this.age += deltaTime;
        if(this.age > this.maxAge) {
            this.dead = true;
        }
    }

    onCollisionStart(otherEntity: SV_Entity, collision: IEventCollision<Engine>) {
        if(this.body && otherEntity && otherEntity.body) {
            if(otherEntity.tag === "player"){
                const player = otherEntity as SV_Player;
                player.takeDamage(this.damage, this.caster);
            } else if (otherEntity.tag === "enemy") {
                const enemy = otherEntity as SV_Enemy;
                enemy.takeDamage(this.damage, this.caster);
            }
            //console.log("collision start", this.tag , " hits ", otherEntity.tag);
            this.dead = true;
        }
    }

       

    

}




