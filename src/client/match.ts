import * as PIXI from 'pixi.js';
import { Room, Client } from "colyseus.js";
import { BaseState } from "../server/rooms/sv_state_base";
import { KeyMessage, MouseMessage } from "../common/interfaces";
import { SV_Entity } from "../server/entities/sv_entity";
import { CL_Vehicle } from "./cl_vehicle";
import { Game } from './game';
import { CL_EntityManager } from './managers/cl_manager_entity';
import { CL_UiManager } from './managers/cl_manager_ui';
import { SV_Player } from '../server/entities/sv_player';
import { CL_Player } from './cl_player';
import { CL_ParticleManager } from './managers/cl_manager_particles';

//import dirtImg from '../assets/dirt.jpg';

const ENDPOINT = window.location.origin; //"http://localhost:2567";

export class CL_Match {
    
    em: CL_EntityManager;
    uim: CL_UiManager;
    ptm: CL_ParticleManager;

    doodadContainer: PIXI.Container;
    entityContainer: PIXI.Container;
    particleContainer: PIXI.Container; //actual particle container seems laggy?

    //TODO: player manager?
    players: { [id: string]: CL_Player } = {};

    currentPlayerVehcile: CL_Vehicle;
    currentClientPlayer: CL_Player;

    active: boolean = false;

    game: Game;
    room: Room<BaseState>;
    
    constructor (game: Game, room: Room<BaseState>) {

        this.em = new CL_EntityManager(this);
        this.uim = new CL_UiManager(this);
        this.ptm = new CL_ParticleManager(this);
        
        this.active = true;
        this.game = game;
        this.room = room;

        //TODO: doodad container

        this.entityContainer = new PIXI.Container();
        this.game.viewport.addChild(this.entityContainer);
        this.particleContainer = new PIXI.Container();
        this.game.viewport.addChild(this.particleContainer);

        this.addTilingBackground();

        this.onConnected(room);
        
        //start the engine
        this.tick();

        //TODO: load textures needed for match
        // /25mm.png
        PIXI.Texture.from('/fire.png');
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

            const clEntity = this.em.addClEntity(entity);

            //TODO: maybe instead of update all entities every tick, only update the ones that have changed
            entity.onChange(() => {
                clEntity.onChange();
            });

        });

        this.room.state.entities.onRemove((entity: SV_Entity , entityId: string) => { 
            this.em.getClEntity(entityId).onSVDeath();
        });

        this.room.state.players.onAdd((player: SV_Player, sessionId: string) => {
            
            this.players[sessionId] = new CL_Player(this, player);
            player.onChange(() => {
                this.players[sessionId]?.onChange();
            });
        });

        this.room.state.players.onRemove((player: SV_Player, sessionId: string) => { 
            this.players[player.id]?.onLeave();
            delete this.players[player.id];
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
        this.ptm.update();
        this.particleContainer.zIndex = 111111111;
        requestAnimationFrame(this.tick.bind(this));
    }


}
