import { RoomBase } from "./sv_room_base";
import { StateTest } from "./sv_state_test";

//<BaseState>
export class RoomTest extends RoomBase {

  setupState() {
    this.setState(new StateTest(this));
    this.state.initialize();
  }

}
