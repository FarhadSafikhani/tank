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

  onJoin(client: Client, options: any) {
    
    super.onJoin(client, options);
    // const e = (this.state as BaseState).getEntity(client.sessionId);
    // if(e) {
    //   console.log('prev player found:', e.id);
    //   return;
    // }

    this.getState().createPlayer(client.sessionId, this.getState().pickRandomSpawnPoint(), options);

  }

  getState(){
    return this.state as StateBR;
  }
}
