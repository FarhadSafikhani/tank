import { Client } from "colyseus";
import { RoomBase } from "./sv_room_base";
import { StateTest } from "./sv_state_test";

//<BaseState>
export class RoomTest extends RoomBase {

  setupState() {
    this.setState(new StateTest(this));
    this.state.initialize();
  }

  onJoin(client: Client, options: any) {
    
    super.onJoin(client, options);
    // const e = (this.state as BaseState).getEntity(client.sessionId);
    // if(e) {
    //   console.log('prev player found:', e.id);
    //   return;
    // }

    this.getState().createPlayer(client.sessionId, {x: 0, y: 0}, options);

  }

  getState(){
    return this.state as StateTest;
  }

}
