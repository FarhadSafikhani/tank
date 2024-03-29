import { Room, generateId } from "colyseus";
import { Schema, type, MapSchema, filterChildren } from "@colyseus/schema";
import { SV_Entity } from "../entities/sv_entity";
import { SV_Player } from "../entities/sv_player";
import Matter, { Engine, IEventCollision, IEventTimestamped } from "matter-js";
import { SV_WorldDoodad } from "../entities/sv_worlddoodad";
import { SV_Projectile } from "../entities/sv_projectile";
import { SV_Enemy } from "../entities/sv_enemy";
import { RoomBase } from "./sv_room_base";
import { Cords } from "../../common/interfaces";
import { SV_Projectile_25mm } from "../entities/sv_projectile_25mm";
import { SV_Weapon } from "../weapons/sv_weapon";
import { SV_Projectile120mm } from "../entities/sv_projectile_120mm";

const GAME_CONFIG = {
  worldSize: 1200
};

export class BaseState extends Schema {

  width = GAME_CONFIG.worldSize;
  height = GAME_CONFIG.worldSize;
  engine: Matter.Engine;
  world: Matter.World;
  room: Room;
  startTime: number = 0;
  matterBodies: { [entityId: string]: Matter.Body } = {};
  nextTeam: number = 1;

  @type({ map: SV_Entity }) entities = new MapSchema<SV_Entity>();
  @type("boolean") isGameOver: boolean = false;

  spawnPoints: Cords[] = [{ x: 0, y: 0}];

  constructor(room: RoomBase) {
    super();
    this.room = room;
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


  
  initialize () {
    this.initMatter();
  }

  initMatter() {
    this.initMatterUpdateEvents()
    this.initMatterCollisionEvents()
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

  createWorldDoodad(x: number, y: number, w: number, h: number) {
    const entityId = generateId();
    const p = new SV_WorldDoodad(this, entityId, x, y, w, h);
    this.addEntity(entityId, p);
  }

  createPlayer(sessionId: string, position: Cords, team: number, clientOptions: any) {
    const username = clientOptions && clientOptions['userName'] || 'anon';
    const p = new SV_Player(this, sessionId, position.x, position.y, username, team);
    this.addEntity(sessionId, p);
  }

  createProjectile(weapon: SV_Weapon, x: number, y: number, angle: number) {
    const entityId = generateId();
    console.log("createProjectile", weapon.tag, entityId);
    if(weapon.tag === "25mm") {
      const p = new SV_Projectile_25mm(this, entityId, weapon.caster, x, y, angle);
      this.addEntity(entityId, p);
      return;
    }

    if(weapon.tag === "120mm") {
      const p = new SV_Projectile120mm(this, entityId, weapon.caster, x, y, angle);
      this.addEntity(entityId, p);
      return;
    }

    const p = new SV_Projectile(this, entityId, weapon.caster, x, y, angle);
    this.addEntity(entityId, p);
  }

  createEnemy(position: Cords) {
    const entityId = generateId();
    const p = new SV_Enemy(this, entityId, position.x, position.y);
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

    if(this.isGameOver) {
      return;
    }

    // delete all dead entities
    this.entities.forEach((entity, entityId) => {
      entity.dead && this.removeEntity(entityId);
    });
    Matter.Engine.update(this.engine, deltaTime)

  }

  matterAfterUpdate(engineTimeEvent: IEventTimestamped<Engine>) {
    this.entities.forEach((entity, entityId) => {
      entity.update(engineTimeEvent['delta']);

      // touch all satic entities for filtering by distance...
      // entity['$changes'].touch(0);
    });
  }

  onPlayerDeath(player: SV_Player) {
    this.gameOver();
  }

  gameOver() {
    this.isGameOver = true;
    console.log("game over:", this.room.roomId);
  }

  pickRandomSpawnPoint() {
    return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
  }

  getNextTeam() {
    return this.nextTeam++;
  }

}
