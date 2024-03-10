import { Room, Client } from "colyseus";
import { BaseState } from "./sv_state_base";
import { SV_Player } from "../entities/sv_player";
import { KeyMessage, MouseMessage } from "../../common/interfaces";

//<BaseState>
export class MyRoom extends Room {

  onCreate() {
    
    this.setState(new BaseState(this));
    this.state.initialize();

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

    this.startTheGameLoop();
    
    console.log('room:', this.roomId, 'created');
  }

  onJoin(client: Client, options: any) {
    //console.log(client.sessionId, "JOINED");
    this.state.createPlayer(client.sessionId, { x: 0, y: 0 });
    //this.state.createPlayer("testbot", { x: 200, y: 500 });
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
