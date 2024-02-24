import { Room, Client } from "colyseus";
import { SV_Entity } from "./sv_entity";
import { State } from "./State";
import { SV_Player } from "./sv_player";
import { KeyMessage, MouseMessage } from "../../common/interfaces";


export class MyRoom extends Room<State> {

  onCreate() {
    
    this.setState(new State());
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
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "JOINED");
    this.state.createPlayer(client.sessionId);
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

}
