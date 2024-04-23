import { Client } from "colyseus";
import { RoomBase } from "./sv_room_base";
import { StateTest } from "./sv_state_test";

//<BaseState>
export class RoomTest extends RoomBase {

  setupState() {
    this.setState(new StateTest(this));
    this.state.initialize();
  }

  getState(): StateTest {
    return this.state as StateTest;
  }

  onJoin(client: Client, clientOptions: any) {
    super.onJoin(client, clientOptions);
    const nextTeam = this.getState().getNextTeam();

    //TODO: instead of creating the player rightaway, 
    //we should wait for the client to send a message to the server to create the player
    this.getState().createPlayer(client.sessionId, {x: 0, y: 0}, nextTeam, clientOptions);
  }


}
