import { Schema, type } from "@colyseus/schema";
import { SV_Entity } from "../entities/sv_entity";


export class SV_Weapon extends Schema{

    @type("string") tag: string = "base_weapon";
    @type("int32") shots: number = 0;
    @type("int32") cooldownLeftMs: number = 0;
    @type("int32") cooldownMaxMs: number = 1000;

    cooldownEndsMs: number = 0;
    caster: SV_Entity;

    constructor(caster: SV_Entity) {
        super();
        this.caster = caster;
    }

    canFire(): boolean {
        return Date.now() >= this.cooldownEndsMs;
    }

    fire(angle: number) {
        
    }

    update() {

    }    
}




