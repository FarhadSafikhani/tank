import { SV_Entity } from "../entities/sv_entity";
import { SV_Weapon } from "./sv_weapon";
import { Schema, type } from "@colyseus/schema";


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
        this.cooldownLeftMs = Math.max(0, this.cooldownEndsMs - Date.now());
        
        if(this.roundsLeft == this.roundsMax){
            this.roundsNextReplenishMs = 0;
        } else {
            this.roundsReplenishTimeLeftMs = Math.max(0, this.roundsNextReplenishMs - Date.now());

            if(this.roundsLeft < this.roundsMax && Date.now() >= this.roundsNextReplenishMs) {
                this.roundsNextReplenishMs = Date.now() + this.roundsReplenishMaxMs;
                this.roundsLeft = Math.min(this.roundsMax, this.roundsLeft + this.roundsReplenishCount);
            }
        }

    }

    fire(angle: number) {

        if(!this.canFire()){
            return;
        }

        this.cooldownEndsMs = Date.now() + this.cooldownMaxMs;

        this.shots++;

        const spawnX = this.caster.x + Math.cos(angle) * 30;
        const spawnY = this.caster.y + Math.sin(angle) * 30;
        const spawnAngle = Math.atan2(this.caster.y - spawnY, this.caster.x - spawnX);

        this.caster.state.createProjectile(this, spawnX, spawnY, spawnAngle);
        
        this.roundsLeft--;
        if(this.roundsNextReplenishMs === 0){
            this.roundsNextReplenishMs = Date.now() + this.roundsReplenishMaxMs;
        }
        
    }

    canFire(): boolean {
        return super.canFire() && this.roundsLeft > 0;
    }

    
}




