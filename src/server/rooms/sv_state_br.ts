
import Matter from "matter-js";
import { RoomBase } from "./sv_room_base";
import { BaseState } from "./sv_state_base";

const GAME_CONFIG = {
  worldSize: 2600
};

export class StateBR extends BaseState {

  constructor(room: RoomBase) {
    super(room);
  }

  
  initialize () {
    super.initialize();
    this.createWorldBounds();
    this.createWorldInnerDoodads();
  }

  createWorldBounds() {
    const wallThickness = 200;
    const sideLength = GAME_CONFIG.worldSize;
    // Add some boundary in our world
    this.createWorldDoodad(-sideLength/2, 0, wallThickness, sideLength + wallThickness);
    this.createWorldDoodad(0, -sideLength/2, sideLength + wallThickness, wallThickness);
    this.createWorldDoodad(0, sideLength/2, sideLength + wallThickness, wallThickness);
    this.createWorldDoodad(sideLength/2, 0, wallThickness, sideLength + wallThickness);
    this.populateSpawnPoints(sideLength, wallThickness);
  }

  populateSpawnPoints(sideLength: number, wallThickness: number) {
    const edgePointCount = 8; // Number of evenly spaced points along the edge
    const edgePadding = 100; // Distance from the edge to spawn points
    const edgeStep = (sideLength - 2 * wallThickness - 2 * edgePadding) / (edgePointCount - 1);

    this.spawnPoints = [
      { x: -sideLength/2 + wallThickness + edgePadding, y: -sideLength/2 + wallThickness + edgePadding }, // Top-left corner
      { x: sideLength/2 - wallThickness - edgePadding, y: -sideLength/2 + wallThickness + edgePadding }, // Top-right corner
      { x: sideLength/2 - wallThickness - edgePadding, y: sideLength/2 - wallThickness - edgePadding }, // Bottom-right corner
      { x: -sideLength/2 + wallThickness + edgePadding, y: sideLength/2 - wallThickness - edgePadding } // Bottom-left corner
    ];

    for (let i = 0; i < edgePointCount; i++) {
      const x = -sideLength/2 + wallThickness + edgePadding + i * edgeStep;
      const y = -sideLength/2 + wallThickness;
      this.spawnPoints.push({ x, y }); // Top edge points
    }

    for (let i = 0; i < edgePointCount; i++) {
      const x = sideLength/2 - wallThickness;
      const y = -sideLength/2 + wallThickness + edgePadding + i * edgeStep;
      this.spawnPoints.push({ x, y }); // Right edge points
    }

    for (let i = 0; i < edgePointCount; i++) {
      const x = sideLength/2 - wallThickness - edgePadding - i * edgeStep;
      const y = sideLength/2 - wallThickness;
      this.spawnPoints.push({ x, y }); // Bottom edge points
    }

    for (let i = 0; i < edgePointCount; i++) {
      const x = -sideLength/2 + wallThickness;
      const y = sideLength/2 - wallThickness - edgePadding - i * edgeStep;
      this.spawnPoints.push({ x, y }); // Left edge points
    }


  }

  createWorldInnerDoodads() {
    const wallThickness = 500;
    const sideLength = GAME_CONFIG.worldSize;
    const innerDoodadCount = 20;
    const padding = 150; // Padding between world bounds and spawn position
    // Add some boundary in our world
    for (let i = 0; i < innerDoodadCount; i++) {
      const width = Math.random() * 30 + 200;
      const height = Math.random() * 30 + 200;
      const x = Math.random() * (sideLength - wallThickness - padding - width) - sideLength / 2 + wallThickness / 2 + padding + width / 2;
      const y = Math.random() * (sideLength - wallThickness - padding - height) - sideLength / 2 + wallThickness / 2 + padding + height / 2;
      this.createWorldDoodad(x, y, width, height);
    }
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

    //this.waveSpawner(deltaTime);
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
    this.nextSpawnTime = Date.now() + 2000;
  }



}
