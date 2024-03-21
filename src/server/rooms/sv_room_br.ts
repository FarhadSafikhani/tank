import { Client } from "colyseus";
import { RoomBase } from "./sv_room_base";
import { StateBR } from "./sv_state_br";
import { StateTest } from "./sv_state_test";
import { BaseState } from "./sv_state_base";

//<BaseState>
export class RoomBR extends RoomBase {

  setupState() {
    this.setState(new StateBR(this));
    this.getState().initialize();
  }

  onJoin(client: Client, clientOptions: any) {
    
    super.onJoin(client, clientOptions);
    const randomSpawnPoint = this.getState().pickRandomSpawnPoint();
    const nextTeam = this.getState().getNextTeam();
    this.getState().createPlayer(client.sessionId, randomSpawnPoint, nextTeam, clientOptions);

  }

  getState(){
    return this.state as StateBR;
  }
}
