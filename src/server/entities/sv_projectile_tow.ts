import Matter, { Collision, Engine, IEventCollision } from "matter-js";
import { SV_Entity } from "./sv_entity";
import { type } from "@colyseus/schema"; 
import { BaseState } from "../rooms/sv_state_base";
import { CollisionCategory } from "../../common/interfaces";
import { SV_Player } from "./sv_player";
import { SV_Enemy } from "./sv_enemy";
import { SV_Projectile } from "./sv_projectile";

export class SV_Projectile_Tow extends SV_Projectile {

    // configs
    w: number = 22; //25
    h: number = 5; //7
    initialSpeed: number = .25;//4;
    acceleration: number = .05;
    turnRate: number = 0.07;
    damage: number = 80;
    maxAge: number = 6000;

    @type("number") targetX: number;
    @type("number") targetY: number;
    
    caster: SV_Entity;
    player: SV_Player | undefined;

    constructor(state: BaseState, id: string, caster: SV_Entity, x: number, y: number, angle: number) {
        super(state, id, caster, x, y, angle);
        this.tag = "tow";
        this.body = this.createBody();
        this.caster = caster;
        this.vx = Math.cos(this.angle) * this.initialSpeed;
        this.vy = Math.sin(this.angle) * this.initialSpeed;

        this.player = this.state.players.get(this.caster.id);
        this.targetX = this.player?.mX || 0;
        this.targetY = this.player?.mY || 0;

        Matter.Body.setVelocity(this.body, {x: this.vx, y: this.vy});
    }

    createBody() {

        const body = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: false, frictionAir: .02, friction: .05, restitution: 0.6, density: 0.9,
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

    update(deltaTime: any): void {



        if(this.player){

            this.targetX = this.player.mX;
            this.targetY = this.player.mY;


            //rotate the rocket body to head to the mouse
            const currentAngle = this.body.angle;
            const targetAngle = Math.atan2(this.targetY - this.y, this.targetX - this.x);

            // Adjust the angle difference to be within -PI to PI range
            let angleDifference = targetAngle - currentAngle;
            if (angleDifference > Math.PI) {
                angleDifference -= 2 * Math.PI;
            } else if (angleDifference < -Math.PI) {
                angleDifference += 2 * Math.PI;
            }

            // Limit the turn speed
            const turnAmount = Math.min(this.turnRate, Math.abs(angleDifference));
            const turnDirection = Math.sign(angleDifference);
            const newAngle = currentAngle + turnAmount * turnDirection;
  
            this.vx = Math.cos(newAngle) * this.acceleration;
            this.vy = Math.sin(newAngle) * this.acceleration;
            Matter.Body.setAngle(this.body, newAngle);
            Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});
        
        } else {
        
            this.vx = Math.cos(this.angle) * this.acceleration;
            this.vy = Math.sin(this.angle) * this.acceleration;
            Matter.Body.applyForce(this.body, this.body.position, {x: this.vx, y: this.vy});

        }

        super.update(deltaTime);
        
    }
 

}




