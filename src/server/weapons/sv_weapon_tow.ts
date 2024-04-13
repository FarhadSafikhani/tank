import Matter from "matter-js";
import { type } from "@colyseus/schema";
import { SV_Entity } from "../entities/sv_entity";
import { SV_Weapon } from "./sv_weapon";


export class SV_Weapon_Tow extends SV_Weapon {

    cooldownMaxMs: number = 500;

    constructor(caster: SV_Entity) {
        super(caster);
        this.tag = "tow";
    }

    fire(angle: number) {

        if(!this.canFire()){
            return;
        }
        super.fire(angle);
        const spawnX = this.caster.x + Math.cos(angle) * 20;
        const spawnY = this.caster.y + Math.sin(angle) * 20 + 10;
        this.caster.state.createProjectile(this, spawnX, spawnY, angle);

    }

    update() {
        this.cooldownLeftMs = Math.max(0, this.cooldownEndsMs - Date.now());
    }

    
}




