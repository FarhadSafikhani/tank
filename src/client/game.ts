import * as PIXI from 'pixi.js';
import { Room, Client } from "colyseus.js";
import { Viewport } from 'pixi-viewport'
import { BaseState } from "../server/rooms/sv_state_base";
import { CL_Match } from './match';
import { KeyMessage, MouseMessage } from '../common/interfaces';

//import dirtImg from '../assets/dirt.jpg';

const ENDPOINT = window.location.origin; //"http://localhost:2567";

export class Game extends PIXI.Application {

    viewport: Viewport;

    client = new Client(ENDPOINT);
    room: null | Room<BaseState>;

    match: CL_Match;

    constructor () {
        const gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;
        super({
            view: gameCanvas,
            width: 1920,
            height: 1080,
            backgroundColor: 0x0c0c0c,
        });

        this.viewport = new Viewport({
            events: this.renderer.events
        });

        this.stage.addChild(this.viewport);

        this.setupBindings();

        //const room = await client.reconnect(cachedReconnectionToken);

        //TODO: move to a user class
        const userName = localStorage.getItem("userName");
        if(userName) {
            this.pickRoom();
        } else {   
            document.getElementById("player-name-panel")!.style.display = "block";
        }

        setTimeout(() => {
            this.resizeView();
        }, 0);
        
    }

    setupBindings() {
        
        this.viewport.on("wheel", (e) => {
            console.log("WHEEL", e.deltaY);
        });

        window.onresize = () => {
            this.resizeView()
        };

        this.viewport.on("mousemove", (e) => {
            const point = this.viewport.toLocal(e.global);
            this.room?.send('mousemove', { x: point.x, y: point.y } as MouseMessage);
        });

        window.addEventListener("mousedown", (e) => {
            const point = this.viewport.toLocal(e);
            this.room?.send('mousedown', { x: point.x, y: point.y } as MouseMessage);
        });

        window.addEventListener("keydown", (e) => {
            this.room?.send('keydown', { keyCode: e.key } as KeyMessage);
        });

        window.addEventListener("keyup", (e) => {
            this.room?.send('keyup', { keyCode: e.key } as KeyMessage);
        });

        document.getElementById("player-name-submit-button")!.onclick = () => {
            this.setUserName();
        }
    }

    public resizeView(): void {

        const maxw = 1920;
        const maxh = 1080;
        const ratio = maxw / maxh;

        const w = Math.min(maxw, window.innerWidth);
        const h = Math.min(maxh, window.innerHeight);

        this.renderer.resize(w, h);
        this.viewport.resize(w, h);

        const gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;
        const parentElement = document.getElementById("canvas-container") as HTMLCanvasElement;
        parentElement.appendChild(document.getElementById("game-canvas")!);

        const verticalMargin = (window.innerHeight - gameCanvas.clientHeight) /2;
        const horizontalMargin = (window.innerWidth - gameCanvas.clientWidth) /2;
        gameCanvas.style.top = `${verticalMargin}px`;
        gameCanvas.style.left = `${horizontalMargin}px`;

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
