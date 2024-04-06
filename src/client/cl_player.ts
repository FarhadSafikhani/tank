import { SV_Player } from "../server/entities/sv_player";
import { CL_Match } from "./match";


export class CL_Player {

    match: CL_Match;
    isCLient: boolean = false;
    localKia: boolean = false;
    svPlayer: SV_Player;

    constructor(match: CL_Match, svPlayer: SV_Player) {
        
        this.match = match;
        this.svPlayer = svPlayer;
        this.isCLient = match.room.sessionId === svPlayer.id;
        
        if(this.isCLient){
            this.match.currentClientPlayer = this;
        } else {
            this.match.uim.addToasterMessage("kill-message-area", svPlayer.name + " has joined the game", "message-blue");
        }
    }

    onChange(): void {
        
        if(this.localKia != this.svPlayer.isKia){

            this.localKia = this.svPlayer.isKia;
            if(this.localKia){
                this.onKia();
            }else{
                this.onRespawn();
            }     
        }

        //update respawn timer if local player
        if(this.isCLient && this.localKia){
            const t = this.svPlayer.respawnTimeLeft;
            const seconds = Math.floor(t / 1000);
            const milliseconds = Math.round((t % 1000) / 100) % 10;
            const formattedTime = `${seconds}.${milliseconds}s`;
            this.match.uim.updateText("respawn-timer", formattedTime);
        }
    }

    onLeave(): void {
        //any cleanup?
        this.match.uim.addToasterMessage("kill-message-area", this.svPlayer.name + " has left the game", "message-gray");
    }

    onKia(): void {
        this.isCLient && this.match.uim.toggleElement("respawn-panel", true);
        this.isCLient && this.match.uim.updateText("respawn-killer-name", this.svPlayer.lastKillerName);
        this.match.uim.addToasterMessage("kill-message-area", this.svPlayer.lastKillerName + " killed " + this.svPlayer.name);
    }

    onRespawn(): void {
        this.isCLient && this.match.uim.toggleElement("respawn-panel", false);
    }

}