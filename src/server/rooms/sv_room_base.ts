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

    this.onMessage("click", (client, message: MouseMessage) => {
      this.getClientEntity(client.sessionId)?.onClick(message.x, message.y);
    });
  }

  setupState() {
    this.setState(new BaseState(this));
    this.state.initialize();
  }

  onJoin(client: Client, options: any) {
    this.state.createPlayer(client.sessionId, { x: 0, y: 0 });
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
