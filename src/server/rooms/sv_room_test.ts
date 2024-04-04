import { Client } from "colyseus";
import { RoomBase } from "./sv_room_base";
import { StateTest } from "./sv_state_test";

//<BaseState>
export class RoomTest extends RoomBase {

  setupState() {
    this.setState(new StateTest(this));
    this.state.initialize();
  }

  onJoin(client: Client, clientOptions: any) {
    super.onJoin(client, clientOptions);
    const nextTeam = this.getState().getNextTeam();
    this.getState().createPlayer(client.sessionId, {x: 0, y: 0}, nextTeam, clientOptions);
  }

  onLeave(client: Client<any, any>): void {
    super.onLeave(client);
    this.getState().removePlayer(client.sessionId);
  }

  getState(): StateTest {
    return this.state as StateTest;
  }

}
