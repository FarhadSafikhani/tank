import Matter from "matter-js";
import { CollisionCategory } from "../../common/interfaces";
import { BaseState } from "../rooms/sv_state_base";
import { SV_Entity } from "./sv_entity";
import { SV_Projectile } from "./sv_projectile";

export class SV_Projectile_120mm extends SV_Projectile {

    // configs
    w: number = 25;
    h: number = 7;
    initialSpeed: number = 15; //40
    damage: number = 36;
    maxAge: number = 1500;
    

    constructor(state: BaseState, id: string, caster: SV_Entity, x: number, y: number, angle: number) {
        super(state, id, caster, x, y, angle);
        this.tag = "120mm";
        this.body = this.createBody();

        this.vx = Math.cos(this.angle) * this.initialSpeed;
        this.vy = Math.sin(this.angle) * this.initialSpeed;
        
        Matter.Body.setVelocity(this.body, {x: this.vx, y: this.vy});
    }

    createBody() {

        const body = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: false, frictionAir: 0, friction: .05, restitution: 0.6, density: 0.3,
            collisionFilter: {
                group: -this.caster.team, //set group -1 if projectiles should not collide with each other
                category: CollisionCategory.PROJECTILE,
                mask: CollisionCategory.PLAYER | CollisionCategory.WORLD,  
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




