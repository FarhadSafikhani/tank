import Matter from "matter-js";
import { SV_Entity } from "../entities/sv_entity";
import { SV_Weapon } from "./sv_weapon";


export class SV_Weapon_120mm extends SV_Weapon {

    cooldownMaxMs: number = 1500;

    constructor(caster: SV_Entity) {
        super(caster);
        this.tag = "120mm";
    }

    fire(angle: number) {

        if(!this.canFire()){
            return;
        }
        super.fire(angle);
        const spawnX = this.caster.x + Math.cos(angle) * 40;
        const spawnY = this.caster.y + Math.sin(angle) * 40;
        this.caster.state.createProjectile(this, spawnX, spawnY, angle);

        this.kickback120mm(angle);
    }

    kickback120mm(angle: number) {
        if(this.caster.body){
            const forceMagnitude = -.5; //kickback force - gradual
            const forceX = Math.cos(angle) * forceMagnitude;
            const forceY = Math.sin(angle) * forceMagnitude;
            Matter.Body.applyForce(this.caster.body, { x: this.caster.x, y: this.caster.y }, { x: -forceX, y: -forceY });
    
            // Move the tank along the same vector as the applied force
            const moveMagnitude = -3; //kickback force - sudden
            const moveX = Math.cos(angle) * moveMagnitude;
            const moveY = Math.sin(angle) * moveMagnitude;
            Matter.Body.setPosition(this.caster.body, { x: this.caster.body.position.x + moveX, y: this.caster.body.position.y + moveY });
    
            //this.caster.matchStats.set("shots", this.caster.shots);
        }
    }

    update() {
        this.cooldownLeftMs = Math.max(0, this.cooldownEndsMs - Date.now());
    }

    
}




