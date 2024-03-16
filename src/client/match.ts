import * as PIXI from 'pixi.js';
import { Room, Client } from "colyseus.js";
import { Viewport } from 'pixi-viewport'
import { BaseState } from "../server/rooms/sv_state_base";
import { KeyMessage, MouseMessage } from "../common/interfaces";
import { SV_Entity } from "../server/entities/sv_entity";
import { SV_Player } from "../server/entities/sv_player";
import { CL_Entity } from "./cl_entity";
import { CL_Player } from "./cl_player";
import { SV_WorldDoodad } from "../server/entities/sv_worlddoodad";
import { CL_WorldDoodad } from "./cl_worlddoodad";
import { SV_Projectile } from "../server/entities/sv_projectile";
import { CL_Projectile } from "./cl_projectile";
import { Particle } from "./particle";
import { CL_Enemy } from "./cl_enemy";
import { SV_Enemy } from "../server/entities/sv_enemy";
import { Game } from './game';
import { CL_EntityManager } from './cl_manager_entity';

//import dirtImg from '../assets/dirt.jpg';

const ENDPOINT = window.location.origin; //"http://localhost:2567";

export class CL_Match {

    em: CL_EntityManager;

    currentPlayerEntity: CL_Player;

    active: boolean = false;

    game: Game;
    room: Room<BaseState>;
    
    constructor (game: Game, room: Room<BaseState>) {

        this.em = new CL_EntityManager(this);
        
        this.active = true;
        this.game = game;
        this.room = room;

        this.addTilingBackground();

        this.onConnected(room);
        this.setupBindings();
        
        //start the engine
        this.tick();
        
    }

    setupBindings() {
        this.game.viewport.on("mousemove", (e) => {
            if(!this.currentPlayerEntity) return;
            const point = this.game.viewport.toLocal(e.global);
            this.room.send('mousemove', { x: point.x, y: point.y } as MouseMessage);
        });

        window.addEventListener("mousedown", (e) => {
            if(!this.currentPlayerEntity) return;
            const point = this.game.viewport.toLocal(e);
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

    }



    addTilingBackground() {
        // create a texture from an image path
        const texture = PIXI.Texture.from('/dirt.jpg');

        const tilingSprite = new PIXI.TilingSprite(
            texture,
            window.innerWidth,
            window.innerHeight
        );
        this.game.stage.addChildAt(tilingSprite, 0); 

        this.game.viewport.on("moved", () => {
            tilingSprite.tilePosition.x = -this.game.viewport.left;
            tilingSprite.tilePosition.y = -this.game.viewport.top;
        });

        // Resize the tiling sprite on window resize
        window.addEventListener("resize", () => {
            tilingSprite.width = window.innerWidth;
            tilingSprite.height = window.innerHeight;
        });

    }

    onConnected(room: Room<BaseState>) {
        console.log("Connected to server");

        this.addRoomIdText(this.room.roomId)

        this.room.onLeave((code) => {
            //this.room = null;
            //TODO: game cleans match
        });

        this.room.state.entities.onAdd((entity: SV_Entity, sessionId: string) => {

            this.em.addClEntity(entity);
            const clEntity = this.em.getClEntity(entity.id);

            if(!clEntity) {
                console.error("clEntity not found");
                return;
            }

            // detecting current user
            if (entity.id === this.room.sessionId) {
                this.currentPlayerEntity = clEntity as CL_Player;
                this.game.viewport.follow(this.currentPlayerEntity.graphics);
            }

            entity.onChange(() => {
                clEntity.onChange();
            });

        });

        this.room.state.entities.onRemove((entity: SV_Entity , entityId: string) => { 
            this.em.getClEntity(entityId).onSVDeath();
        });
    }

    tick() {

        if(!this.active){
            return;
        }


        if(this.room.state.isGameOver) {    
            console.log("Game Over");
            this.active = false;
            this.addGameOverText();
            return;
        }

        this.em.update();

        requestAnimationFrame(this.tick.bind(this));
    }

    addRoomIdText(roomId: string) {

        const gameOverText = new PIXI.Text(roomId, {
            fontFamily: "Arial",
            fontSize: 16,
            fill: 0xffffff,
            align: "center"
        });
        gameOverText.anchor.set(1, 0);
        gameOverText.position.set(window.innerWidth - 10, 0);
        this.game.stage.addChild(gameOverText);
        return;

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
        this.game.stage.addChild(gameOverText);
        return;

    }
}
