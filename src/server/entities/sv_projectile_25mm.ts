import Matter, { Collision, Engine, IEventCollision } from "matter-js";
import { SV_Entity } from "./sv_entity";
import { type } from "@colyseus/schema"; 
import { BaseState } from "../rooms/sv_state_base";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Player } from "./sv_player";
import { SV_Enemy } from "./sv_enemy";
import { SV_Projectile } from "./sv_projectile";

export class SV_Projectile_25mm extends SV_Projectile {

    // configs
    w: number = 75;
    h: number = 4;
    initialSpeed: number = 20; //40
    damage: number = 10;
    maxAge: number = 711100;
    

    constructor(state: BaseState, id: string, caster: SV_Entity, x: number, y: number, angle: number) {
        super(state, id, caster, x, y, angle);
        this.tag = "25mm";
        this.body = this.createBody();

        this.vx = -Math.cos(this.angle) * this.initialSpeed;
        this.vy = -Math.sin(this.angle) * this.initialSpeed;
        
        Matter.Body.setVelocity(this.body, {x: this.vx, y: this.vy});
    }

    createBody() {
    
        const body = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: false, frictionAir: 0, friction: .5, restitution: 0.6, density: 0.03,
            collisionFilter: {
                group: -this.caster.team, //set group -1 if projectiles should not collide with each other
                category: CollisionCategory.PROJECTILE,
                mask: CollisionCategory.PLAYER | CollisionCategory.WORLD
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


}




