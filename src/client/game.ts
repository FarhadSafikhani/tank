import * as PIXI from "pixi.js";
import { Viewport } from 'pixi-viewport'
import { Room, Client } from "colyseus.js";
import { State } from "../server/rooms/State";
import { KeyMessage, MouseMessage } from "../common/interfaces";
import { SV_Entity } from "../server/rooms/sv_entity";
import { SV_Player } from "../server/rooms/sv_player";
import { CL_Entity } from "./cl_entity";
import { CL_Player } from "./cl_player";
import { SV_WorldDoodad } from "../server/rooms/sv_worlddoodad";
import { CL_WorldDoodad } from "./cl_worlddoodad";
import { SV_Projectile } from "../server/rooms/sv_projectile";
import { CL_Projectile } from "./cl_projectile";

const ENDPOINT = "http://localhost:2567";

export class Game extends PIXI.Application {
    clEntities: { [id: string]: CL_Entity } = {};
    currentPlayerEntity: CL_Player;

    client = new Client(ENDPOINT);
    room: Room<State>;

    viewport: Viewport;
    _interpolation: boolean;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0c0c0c
        });

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            events: this.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        // // draw boundaries of the world
        // const boundaries = new PIXI.Graphics();
        // boundaries.beginFill(0x000000);
        // boundaries.drawRoundedRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30);
        // this.viewport.addChild(boundaries);

        // add viewport to stage
        this.stage.addChild(this.viewport);

        this.connect();

        this.interpolation = false;

        this.viewport.on("mousemove", (e) => {
            if(!this.currentPlayerEntity) return;
            const point = this.viewport.toLocal(e.global);
            this.room.send('mousemove', { x: point.x, y: point.y } as MouseMessage);
        });

        window.addEventListener("click", (e) => {
            if(!this.currentPlayerEntity) return;
            const point = this.viewport.toLocal(e);
            this.room.send('click', { x: point.x, y: point.y } as MouseMessage);
        });

        window.addEventListener("keydown", (e) => {
            if(!this.currentPlayerEntity) return;
            this.room.send('keydown', { keyCode: e.key } as KeyMessage);
        });

        window.addEventListener("keyup", (e) => {
            if(!this.currentPlayerEntity) return;
            this.room.send('keyup', { keyCode: e.key } as KeyMessage);
        });

        this.viewport.on("wheel", (e) => {
            console.log("WHEEL", e.deltaY);
        });

    }

    async connect() {
        this.room = await this.client.joinOrCreate<State>("my_room");

        this.room.state.entities.onAdd((entity: SV_Entity, sessionId: string) => {

            this.addClEntity(entity);
            const clEntity = this.getClEntity(entity.id);

            if(!clEntity) {
                console.error("clEntity not found");
                return;
            }

            // detecting current user
            if (entity.id === this.room.sessionId) {
                this.currentPlayerEntity = clEntity as CL_Player;
                this.viewport.follow(this.currentPlayerEntity.graphics);
            }

            entity.onChange(() => {
                clEntity.onChange();
            });
        });

        this.room.state.entities.onRemove((_, entityId: string) => {
            this.removeClEntity(entityId);
        });
    }

    getClEntity(entityId: string) {
        return this.clEntities[entityId];
    }

    addClEntity(entity: SV_Entity) {
        
        let clEntity: CL_Entity;
        if (entity.tag === "player") {
            clEntity = new CL_Player(this, entity as SV_Player);
        }
        else if (entity.tag === "wdoodad") {
            clEntity = new CL_WorldDoodad(this, entity as SV_WorldDoodad);
        }
        else if (entity.tag === "projectile") {
            clEntity = new CL_Projectile(this, entity as SV_Projectile);
        }
        else {
            console.error("Unknown entity type");
            return;
        }
        //debugger;
        this.clEntities[entity.id] = clEntity;
    }

    removeClEntity(entityId: string) {
        this.getClEntity(entityId).destroy();
        delete this.clEntities[entityId];
    }

    set interpolation (bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.loop();
        }
    }

    loop () {

        for (let id in this.clEntities) {
            this.getClEntity(id).update();
        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}
