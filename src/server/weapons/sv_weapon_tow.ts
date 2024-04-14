import { SV_Entity } from "../entities/sv_entity";
import { SV_Weapon } from "./sv_weapon";

export class SV_Weapon_Tow extends SV_Weapon {

    cooldownMaxMs: number = 3000;

    constructor(caster: SV_Entity) {
        super(caster);
        this.tag = "tow";
    }

    fire(angle: number) {

        if(!this.canFire()){
            return;
        }
        super.fire(angle);

        // Calculate projectile spawn point offset from turret base
        const modifiedSpwanAngle = angle + Math.PI / 4;
        const r = 12;
        const x = this.caster.x + r * Math.cos(modifiedSpwanAngle);
        const y = this.caster.y + r * Math.sin(modifiedSpwanAngle);
        this.caster.state.createProjectile(this, x, y, angle);
    }

    update() {
        this.cooldownLeftMs = Math.max(0, this.cooldownEndsMs - Date.now());
    }
    
}




