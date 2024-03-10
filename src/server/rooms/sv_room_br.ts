import { Client } from "colyseus";
import { RoomBase } from "./sv_room_base";
import { StateBR } from "./sv_state_br";
import { StateTest } from "./sv_state_test";

//<BaseState>
export class RoomBR extends RoomBase {

  setupState() {
    this.setState(new StateBR(this));
    this.state.initialize();
  }

  onJoin(client: Client, options: any) {
    this.state.createPlayer(client.sessionId);
  }

}
