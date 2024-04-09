import { Schema, type } from "@colyseus/schema";
import { BaseState } from "../rooms/sv_state_base";
import { Engine, IEventCollision } from "matter-js";

export class SV_Comp_Destructable extends Schema {
    @type("int32") healthCurr: number = 0;
    @type("int32") healthMax: number = 0;
    @type("boolean") isKia: boolean = false;

    entity: SV_Entity;
    onKiaCallback: Function | undefined;
    lastAttackerId: string = "";
    lastAttackerName: string = "";

    constructor(entity: SV_Entity, startingHealthMax: number, onKiaCallback: Function | undefined = undefined) {
        super();
        this.entity = entity;
        this.healthMax = startingHealthMax;
        this.healthCurr = startingHealthMax;
        this.onKiaCallback = onKiaCallback;

    }

    takeDamage(damage: number, attacker: SV_Entity) {
        if(this.entity.dead || this.isKia) return;
        this.lastAttackerId = attacker.id;
        this.lastAttackerName = attacker.name;
        this.healthCurr -= damage;
        if(this.healthCurr <= 0) {
            this.healthCurr = 0;
            this.isKia = true;
            if(this.onKiaCallback) {
                this.onKiaCallback();
            }
        }
    }

    reset() {
        this.healthCurr = this.healthMax;
        this.isKia = false;
    }
}

export class SV_Entity extends Schema {
    @type("float64") x!: number;
    @type("float64") y!: number;
    @type("float64") angle: number = 0;
    @type("string") id: string;
    @type("string") tag: string = "entity";
    @type("int32") team: number = 0;
    @type(SV_Comp_Destructable) cDestructable: SV_Comp_Destructable | undefined;
    
    state: BaseState;
    body: Matter.Body | undefined;
    dead: boolean = false;
    name: string = "baseentity";

    constructor(state: BaseState, id: string, team: number = 0) {
        super();
        this.id = id;
        this.state = state;
        this.team = team || 0;
    }

    static distance(a: SV_Entity, b: SV_Entity) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }

    update(engineDeltaTime) {}

    onCollisionStart(otherEntity: SV_Entity, collision: IEventCollision<Engine>) {}

}

