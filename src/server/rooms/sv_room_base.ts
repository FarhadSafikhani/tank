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
      this.getClientEntity(client.sessionId)?.onMouseMove(message.x, message.y);
    });

    this.onMessage("keydown", (client, message: KeyMessage) => {
      this.getClientEntity(client.sessionId)?.onKeyDown(message.keyCode);
    });

    this.onMessage("keyup", (client, message: KeyMessage) => {
      this.getClientEntity(client.sessionId)?.onKeyUp(message.keyCode);
    });

    this.onMessage("mousedown", (client, message: MouseMessage) => {
      this.getClientEntity(client.sessionId)?.onMouseDown(message.x, message.y);
    });

    this.onMessage("mouseup", (client, message: MouseMessage) => {
      this.getClientEntity(client.sessionId)?.onMouseUp(message.x, message.y);
    });
  }

  setupState() {
    this.setState(new BaseState(this));
    this.state.initialize();
  }

  onJoin(client: Client, clientOptions: any) {
    console.log("client joined:", client.sessionId, clientOptions);
  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId] as SV_Player;

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

  getClientEntity(sessionId: string): SV_Player | undefined {
    return this.state.entities[sessionId];
  }

  startTheGameLoop() {
    this.setSimulationInterval((delta) => this.state.update(delta));
  }

  onDispose(): void | Promise<any> {
    console.log('room:', this.roomId, 'disposed');
  }

}
