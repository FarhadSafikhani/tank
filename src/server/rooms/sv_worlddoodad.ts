import Matter from "matter-js";
import { SV_Entity } from "./sv_entity";
import { type } from "@colyseus/schema"; 
import { lerp } from '../../common/utils'; 
import { State } from "./State";

export class SV_WorldDoodad extends SV_Entity {

    @type("string") verts: string = "";

    body: Matter.Body;
    w: number = 0;
    h: number = 0;

    constructor(state: State, id: string, x: number, y: number, w: number, h: number) {
        super(state, id);
        this.tag = "wdoodad";
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.body = this.createBody();
    }

    createBody() {

        const body = Matter.Bodies.rectangle(this.x, this.y, this.w, this.h,
        {
            isStatic: true
        });

        const points = body.vertices.map(vertex => {
            return { x: this.x - vertex.x, y: this.y - vertex.y };
        });
        this.verts = JSON.stringify(points);

        return body;
    }


}




