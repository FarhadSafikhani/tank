import Matter from "matter-js";
import { type } from "@colyseus/schema";
import { SV_Entity } from "../entities/sv_entity";
import { SV_Weapon } from "./sv_weapon";


export class SV_Weapon_25mm extends SV_Weapon {

    cooldownMaxMs: number = 200;

    constructor(caster: SV_Entity) {
        super(caster);
        this.tag = "25mm";
    }

    fire(angle: number) {

        if(!this.canFire()){
            return;
        }

        this.cooldownEndsMs = Date.now() + this.cooldownMaxMs;

        this.shots++;

        const spawnX = this.caster.x + Math.cos(angle) * 70;
        const spawnY = this.caster.y + Math.sin(angle) * 70;
        const spawnAngle = Math.atan2(this.caster.y - spawnY, this.caster.x - spawnX);

        this.caster.state.createProjectile(this, spawnX, spawnY, spawnAngle);

    }

    update() {
        this.cooldownLeftMs = Math.max(0, this.cooldownEndsMs - Date.now());
    }

    
}




