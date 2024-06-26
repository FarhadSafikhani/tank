
import Matter from "matter-js";
import { RoomBase } from "./sv_room_base";
import { BaseState } from "./sv_state_base";

const GAME_CONFIG = {
  worldSize: 1200
};

export class StateTest extends BaseState {

  constructor(room: RoomBase) {
    super(room);
  }

  
  initialize () {
    super.initialize();
    this.createWorldBounds();
  }

  createWorldBounds() {
    const wallThickness = 100;
    const sideLength = GAME_CONFIG.worldSize;
    // Add some boundary in our world
    // this.createWorldDoodad(0, 0, sideLength, wallThickness);
    // this.createWorldDoodad(-sideLength/2, sideLength/2, wallThickness, sideLength + wallThickness);
    // this.createWorldDoodad(sideLength/2, sideLength/2, wallThickness, sideLength + wallThickness);
    // this.createWorldDoodad(0, sideLength, sideLength, wallThickness);
    //this.createWorldDoodad(0, 0, 50, 50);
  }


  update(deltaTime) {

    if(this.isGameOver) {
      return;
    }

    // delete all dead entities
    this.entities.forEach((entity, entityId) => {
      entity.dead && this.removeEntity(entityId);
    });
    Matter.Engine.update(this.engine, deltaTime)

    this.waveSpawner(deltaTime);
  }

  nextSpawnTime = Date.now();

  //TODO: move to a wave manager
  waveSpawner(deltaTime) {
    if(this.nextSpawnTime >= Date.now()) {
      return;
    }
    //random position from world bounds
    const padding = 100;
    const x = Math.random() * GAME_CONFIG.worldSize - GAME_CONFIG.worldSize / 2;
    const y = Math.random() * GAME_CONFIG.worldSize - GAME_CONFIG.worldSize / 2;
    //padd the x and y
    const spawnPos = { x: x < 0 ? x - padding : x + padding, y: y < 0 ? y - padding : y + padding };
    this.createEnemy(spawnPos);
    this.nextSpawnTime = Date.now() + 3000;
  }



}
