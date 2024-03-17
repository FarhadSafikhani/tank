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

        //const room = await client.reconnect(cachedReconnectionToken);

        
        

        //TODO: move to a user class
        const userName = localStorage.getItem("userName");
        if(userName) {
            this.pickRoom();
        }

        else{   
            // const userName = prompt("Please enter your name", "Harry Potter");
            // if (userName != null) {
            //     localStorage.setItem("userName", userName);
            //     this.pickRoom();
            // }
            document.getElementById("player-name-panel")!.style.display = "block";
        }
        
    }

    setupBindings() {
       

        this.viewport.on("wheel", (e) => {
            console.log("WHEEL", e.deltaY);
        });

        window.onresize = () => {
            this.viewport.resize(window.innerWidth, window.innerHeight);
            this.renderer.resize(window.innerWidth, window.innerHeight);
        };

        document.getElementById("player-name-submit-button")!.onclick = () => {
            this.setUserName();
        }
    }

    setUserName() {
        const userName = (document.getElementById("player-name-input") as HTMLInputElement).value;
        const sanitizedUserName = this.sanitizeUserName(userName);
        if(sanitizedUserName && sanitizedUserName.length > 0) {
            localStorage.setItem("userName", sanitizedUserName);
            this.pickRoom();
            document.getElementById("player-name-panel")!.style.display = "none";
        }
    }

    sanitizeUserName(userName: string): string {
        // Remove unwanted characters or spaces from the username
        //const sanitizedUserName = userName.replace(/[^\x00-\x7F]/g, '');
        return userName.trim();
    }

    pickRoom() {
        //this.connect("roomTest");
        this.connect("roomBR");
    }

    async connect(roomType: string) {

        //.joinOrCreate<State>(roomType);
        this.room = await this.client.joinOrCreate(roomType, {"userName": localStorage.getItem("userName")});
        this.match = new CL_Match(this, this.room);

    }

}
