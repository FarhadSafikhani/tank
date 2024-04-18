import { type } from "@colyseus/schema";
import { SV_Entity } from "../entities/sv_entity";
import { SV_Weapon } from "./sv_weapon";

export class SV_Weapon_50cal extends SV_Weapon {

    @type("int32") roundsLeft: number;
    roundsNextReplenishMs: number = 0;
    @type("int32") roundsReplenishTimeLeftMs: number = 0;

    cooldownMaxMs: number = 150;
    @type("int32") roundsMax: number = 40;
    @type("int32") roundsReplenishMaxMs: number = 4000;
    roundsReplenishCount: number = 5;

    constructor(caster: SV_Entity) {
        super(caster);
        this.tag = "50cal";
        this.roundsLeft = this.roundsMax;
    }

    update() {
        const now = Date.now();
        this.cooldownLeftMs = Math.max(0, this.cooldownEndsMs - now);
        
        if(this.roundsLeft == this.roundsMax){
            this.roundsNextReplenishMs = 0;
        } else {
            this.roundsReplenishTimeLeftMs = Math.max(0, this.roundsNextReplenishMs - now);

            if(this.roundsLeft < this.roundsMax && now >= this.roundsNextReplenishMs) {
                this.roundsNextReplenishMs = now + this.roundsReplenishMaxMs;
                this.roundsLeft = Math.min(this.roundsMax, this.roundsLeft + this.roundsReplenishCount);
            }
        }

    }

    fire(angle: number) {

        if(!this.canFire()){
            return;
        }

        super.fire(angle);
        const spawnX = this.caster.x + Math.cos(angle) * 30;
        const spawnY = this.caster.y + Math.sin(angle) * 30;
        this.caster.state.createProjectile(this, spawnX, spawnY, angle);
        
        this.roundsLeft--;
        if(this.roundsNextReplenishMs === 0){
            this.roundsNextReplenishMs = Date.now() + this.roundsReplenishMaxMs;
        }
        
    }

    canFire(): boolean {
        return super.canFire() && this.roundsLeft > 0;
    }

    reInit(): void {
        super.reInit();
        this.roundsLeft = this.roundsMax;
        this.roundsNextReplenishMs = 0;
        this.roundsReplenishTimeLeftMs = 0;
    }

    
}




