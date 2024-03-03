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
import { Particle } from "./particle";
import { CL_Enemy } from "./cl_enemy";
import { SV_Enemy } from "../server/rooms/sv_enemy";
//import dirtImg from '../assets/dirt.jpg';

const ENDPOINT = "http://localhost:2567";

export class Game extends PIXI.Application {
    clEntities: { [id: string]: CL_Entity } = {};
    particles: Particle[] = [];
    currentPlayerEntity: CL_Player;

    client = new Client(ENDPOINT);
    room: Room<State>;
    
    viewport: Viewport;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0c0c0c
        });

        // create a texture from an image path
        const texture = PIXI.Texture.from(ENDPOINT+'/dirt.jpg');

        const tilingSprite = new PIXI.TilingSprite(
            texture,
            window.innerWidth,
            window.innerHeight
        );
        this.stage.addChild(tilingSprite);

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            events: this.renderer.events
        })

        this.viewport.on("moved", () => {
            tilingSprite.tilePosition.x = -this.viewport.left;
            tilingSprite.tilePosition.y = -this.viewport.top;
        });

        // add viewport to stage
        this.stage.addChild(this.viewport);

        this.connect();

        this.setupBindings();

        //start the engine
        this.loop();
        
    }

    setupBindings() {
       
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
        this.room = await this.client.joinOrCreate<State>("room1");

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

        this.room.state.entities.onRemove((entity: SV_Entity , entityId: string) => { 
            this.getClEntity(entityId).onSVDeath();
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
        else if (entity.tag === "enemy") {
            clEntity = new CL_Enemy(this, entity as SV_Enemy);
        }
        else {
            console.error("Unknown entity type");
            return;
        }

        this.clEntities[entity.id] = clEntity;
    }

    removeClEntity(entityId: string) {
        delete this.clEntities[entityId];
    }

    loop() {

        if(this.room){

            console.log("loop");

            if(this.room.state.isGameOver) {    
                this.addGameOverText();
            }

            for (let id in this.clEntities) {
                this.getClEntity(id).update();
            }
    
            this.updateParticles();

        }

        requestAnimationFrame(this.loop.bind(this));
    }


    //TOOO: move to particle manager
    addParticle(x: number, y: number) {
        this.particles.push(new Particle(this, x, y));
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => particle.update());
    }


    addGameOverText() {

        const gameOverText = new PIXI.Text("Game Over", {
            fontFamily: "Arial",
            fontSize: 48,
            fill: 0xffffff,
            align: "center"
        });
        gameOverText.anchor.set(0.5);
        gameOverText.position.set(window.innerWidth / 2, window.innerHeight / 2);
        this.stage.addChild(gameOverText);
        return;

    }
}
