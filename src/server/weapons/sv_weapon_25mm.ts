import { SV_Entity } from "../entities/sv_entity";
import { SV_Weapon } from "./sv_weapon";


export class SV_Weapon_25mm extends SV_Weapon {

    cooldownMaxMs: number = 300;
    
    roundsLeft: number;
    roundsNextReplenishMs: number = 0;

    roundsMax: number = 25;
    roundsReplenishMs: number = 5000;
    roundsReplenishCount: number = 5;

    constructor(caster: SV_Entity) {
        super(caster);
        this.tag = "25mm";
        this.roundsLeft = this.roundsMax;
    }

    update() {
        this.cooldownLeftMs = Math.max(0, this.cooldownEndsMs - Date.now());

        if(this.roundsLeft < this.roundsMax && Date.now() >= this.roundsNextReplenishMs) {
            this.roundsNextReplenishMs = Date.now() + this.roundsReplenishMs;
            this.roundsLeft = Math.min(this.roundsMax, this.roundsLeft + this.roundsReplenishCount);
        }

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
        
        this.roundsLeft--;
        if(this.roundsNextReplenishMs === 0){
            this.roundsNextReplenishMs = Date.now() + this.roundsReplenishMs;
        }
        
    }




    canFire(): boolean {
        return super.canFire() && this.roundsLeft > 0;
    }

    
}




