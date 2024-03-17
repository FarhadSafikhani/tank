import * as PIXI from 'pixi.js';
import { Room, Client } from "colyseus.js";
import { BaseState } from "../server/rooms/sv_state_base";
import { KeyMessage, MouseMessage } from "../common/interfaces";
import { SV_Entity } from "../server/entities/sv_entity";
import { CL_Player } from "./cl_player";
import { Game } from './game';
import { CL_EntityManager } from './managers/cl_manager_entity';
import { CL_UiManager } from './managers/cl_manager_ui';

//import dirtImg from '../assets/dirt.jpg';

const ENDPOINT = window.location.origin; //"http://localhost:2567";

export class CL_Match {

    em: CL_EntityManager;
    uim: CL_UiManager;

    currentPlayerEntity: CL_Player;

    active: boolean = false;

    game: Game;
    room: Room<BaseState>;
    
    constructor (game: Game, room: Room<BaseState>) {

        this.em = new CL_EntityManager(this);
        this.uim = new CL_UiManager(this);
        
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

        this.uim.updateText("room-id", this.room.roomId);
        this.uim.toggleElement("room-id", true);

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
            this.active = false;
            this.uim.toggleElement("gameover", true);
            return;
        }

        this.em.update();

        requestAnimationFrame(this.tick.bind(this));
    }

}
