import { Schema, type } from "@colyseus/schema";
import { BaseState } from "../rooms/sv_state_base";
import { Engine, IEventCollision } from "matter-js";

export class SV_Entity extends Schema {
    @type("float64") x!: number;
    @type("float64") y!: number;
    @type("float64") angle: number = 0;
    @type("string") id: string;
    @type("string") tag: string = "entity";
    @type("int32") team: number = 0;
    
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