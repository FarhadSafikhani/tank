import * as PIXI from 'pixi.js';
import { Room, Client } from "colyseus.js";
import { Viewport } from 'pixi-viewport'
import { BaseState } from "../server/rooms/sv_state_base";
import { CL_Match } from './match';

//import dirtImg from '../assets/dirt.jpg';

const ENDPOINT = window.location.origin; //"http://localhost:2567";

export class Game extends PIXI.Application {

    viewport: Viewport;

    client = new Client(ENDPOINT);
    room: null | Room<BaseState>;

    match: CL_Match;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0c0c0c,
        });

        this.viewport = new Viewport({     
            // screenWidth: window.innerWidth,
            // screenHeight: window.innerHeight,
            // worldWidth: 1000,
            // worldHeight: 1000,
            events: this.renderer.events
        });

        this.stage.addChild(this.viewport);

        this.setupBindings();

        //this.connect("roomTest");
        this.connect("roomBR"); 
        
    }

    setupBindings() {
       

        this.viewport.on("wheel", (e) => {
            console.log("WHEEL", e.deltaY);
        });

        window.onresize = () => {
            this.viewport.resize(window.innerWidth, window.innerHeight);
            this.renderer.resize(window.innerWidth, window.innerHeight);
        };

    }


    async connect(roomType: string) {

        //.joinOrCreate<State>(roomType);
        this.room = await this.client.joinOrCreate(roomType);
        this.match = new CL_Match(this, this.room);

    }

}
