import { generateId } from "colyseus";
import { Schema, type, MapSchema, filterChildren } from "@colyseus/schema";

import { SV_Entity } from "./sv_entity";
import { SV_Player } from "./sv_player";
import Matter, { Engine, IEventCollision, IEventTimestamped } from "matter-js";
import { Bodies } from "matter-js";
import { SV_WorldDoodad } from "./sv_worlddoodad";
import { SV_Projectile } from "./sv_projectile";

const GAME_CONFIG = {
  worldSize: 1200
};

export class State extends Schema {

  width = GAME_CONFIG.worldSize;
  height = GAME_CONFIG.worldSize;
  engine: Matter.Engine;
  world: Matter.World;

  startTime: number = 0;

  matterBodies: { [entityId: string]: Matter.Body } = {};

  constructor() {
    super();
    this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0 }});
    this.world = this.engine.world;
    this.startTime = Date.now();
  }

  // @filterChildren(function(client, key: string, value: SV_Entity, root: State) {
  //   const currentPlayer = root.entities.get(client.sessionId);
  //   if (currentPlayer) {
  //       const a = value.x - currentPlayer.x;
  //       const b = value.y - currentPlayer.y;

  //       return (Math.sqrt(a * a + b * b)) <= 500;

  //   } else {
  //       return false;
  //   }
  // })

  @type({ map: SV_Entity })
  entities = new MapSchema<SV_Entity>();
  
  initialize () {
    this.initMatter();
  }

  initMatter() {
    this.initMatterUpdateEvents()
    this.initMatterCollisionEvents()
    this.createWorldBounds()
  }

  initMatterUpdateEvents() {
    // Update events to sync bodies in the world to the state.
    Matter.Events.on(this.engine, "afterUpdate", (event) => {
      this.matterAfterUpdate(event);
    })
  }

  initMatterCollisionEvents() {
    // The collision events
    Matter.Events.on(this.engine, "collisionStart", (event: IEventCollision<Engine>) => {
      const pairs = event.pairs;
      // Loop through all the collision pairs
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];

        // Access the colliding bodies
        const bodyA = pair.bodyA;
        const entityA = this.entities.get(bodyA.label);
        const bodyB = pair.bodyB;
        const entityB = this.entities.get(bodyB.label);

        entityA && entityB && entityA.onCollisionStart(entityB, event);
        entityB && entityA && entityB.onCollisionStart(entityA, event);

      }
    });
  }

  createWorldBounds() {
    const wallThickness = 100;
    const sideLength = GAME_CONFIG.worldSize;
    // Add some boundary in our world
    this.createWorldDoodad(0, 0, sideLength, wallThickness);
    this.createWorldDoodad(-sideLength/2, sideLength/2, wallThickness, sideLength + wallThickness);
    this.createWorldDoodad(sideLength/2, sideLength/2, wallThickness, sideLength + wallThickness);
    this.createWorldDoodad(0, sideLength, sideLength, wallThickness);
  }

  createWorldDoodad(x: number, y: number, w: number, h: number) {
    const entityId = generateId();
    const p = new SV_WorldDoodad(this, entityId, x, y, w, h);
    this.addEntity(entityId, p);
  }

  createPlayer(sessionId: string, position?: { x: number, y: number }) {
    const spawnPos = position || { x: 0, y: 500 };
    const p = new SV_Player(this, sessionId, spawnPos.x, spawnPos.y);
    this.addEntity(sessionId, p);
  }

  createProjectile(caster: SV_Entity, x: number, y: number, angle: number) {
    const entityId = generateId();
    const p = new SV_Projectile(this, entityId, caster, x, y, angle);
    this.addEntity(entityId, p);
  }

  addEntity(entityId: string, entity: SV_Entity) {

    if(entity.body) {
      entity.body.label = entityId;
      // Add to world
      Matter.Composite.add(this.world, [entity.body]);
      this.matterBodies[entityId] = entity.body;
    }

    // Add to state
    this.entities.set(entityId, entity);
  }

  getEntity(entityId: string) {
    return this.entities.get(entityId);
  }

  removeEntity(entityId: string) {
    // Remove from state
    this.entities.delete(entityId);
    // Remove from world
    const player = this.matterBodies[entityId];
    Matter.Composite.remove(this.world, [player]);
    delete this.matterBodies[entityId];
  }

  update(deltaTime) {

    // delete all dead entities
    this.entities.forEach((entity, entityId) => {
      entity.dead && this.removeEntity(entityId);
    });
    Matter.Engine.update(this.engine, deltaTime)

    this.waveSpawner(deltaTime);
  }

  matterAfterUpdate(engineTimeEvent: IEventTimestamped<Engine>) {
    this.entities.forEach((entity, entityId) => {
      entity.update(engineTimeEvent['delta']);

      // touch all satic entities for filtering by distance...
      // entity['$changes'].touch(0);
    });
  }


  nextSpawnTime = Date.now();

  //TODO: move to a wave manager
  waveSpawner(deltaTime) {
    if(this.nextSpawnTime >= Date.now()) {
      return;
    }
    this.createPlayer("testbot" + Math.random());
    this.nextSpawnTime = Date.now() + 2000;
  }



}
