import { Room, Client } from "colyseus";
import { BaseState } from "./sv_state_base";
import { SV_Player } from "../entities/sv_player";
import { KeyMessage, MouseMessage } from "../../common/interfaces";

//<BaseState>
export class RoomBase extends Room {

  onCreate() {

    this.setupBindings();
    this.setupState();
    this.startTheGameLoop();
    
    console.log('room:', this.roomId, 'created');
  }

  setupBindings() {
    this.onMessage("mousemove", (client, message: MouseMessage) => {
      this.getPlayerById(client.sessionId)?.onMouseMove(message.x, message.y);
    });

    this.onMessage("keydown", (client, message: KeyMessage) => {
      this.getPlayerById(client.sessionId)?.onKeyDown(message.keyCode);
    });

    this.onMessage("keyup", (client, message: KeyMessage) => {
      this.getPlayerById(client.sessionId)?.onKeyUp(message.keyCode);
    });

    this.onMessage("mousedown", (client, message: MouseMessage) => {
      if (message.button === 0){
        this.getPlayerById(client.sessionId)?.onMouseDown(message.x, message.y);
      } else if (message.button === 2){
        this.getPlayerById(client.sessionId)?.onRightMouseDown(message.x, message.y);
      }
    });

    this.onMessage("mouseup", (client, message: MouseMessage) => {
      if(message.button === 0){
        this.getPlayerById(client.sessionId)?.onMouseUp(message.x, message.y);
      } else if (message.button === 2){
        this.getPlayerById(client.sessionId)?.onRightMouseUp(message.x, message.y);
      }
    });
  }

  setupState() {
    this.setState(new BaseState(this));
    this.state.initialize();
  }

  getState(){
    return this.state as BaseState;
  }

  onJoin(client: Client, clientOptions: any) {
    console.log("client joined:", client.sessionId, clientOptions);
  }

  onLeave(client: Client) {
    console.log("client left:", client.sessionId);
    this.getState().removePlayer(client.sessionId);
  }

  getPlayerById(sessionId: string): SV_Player | undefined {
    return this.state.players.get(sessionId);
  }

  startTheGameLoop() {
    this.setSimulationInterval((delta) => this.state.update(delta));
  }

  onDispose(): void | Promise<any> {
    console.log('room:', this.roomId, 'disposed');
  }

}
