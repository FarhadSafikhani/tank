import { MapSchema, Schema, type } from "@colyseus/schema";
import { Room, generateId } from "colyseus";
import Matter, { Engine, IEventCollision, IEventTimestamped } from "matter-js";
import { Cords, Vehicles } from "../../common/interfaces";
import { SV_Enemy } from "../entities/sv_enemy";
import { SV_Entity } from "../entities/sv_entity";
import { SV_Player } from "../entities/sv_player";
import { SV_Projectile_120mm } from "../entities/sv_projectile_120mm";
import { SV_Projectile_25mm } from "../entities/sv_projectile_25mm";
import { SV_Projectile_50cal } from "../entities/sv_projectile_50cal";
import { SV_Projectile_Tow } from "../entities/sv_projectile_tow";
import { SV_WorldDoodad } from "../entities/sv_worlddoodad";
import { SV_Vehicle } from "../vehicle/sv_vehicle";
import { SV_APC } from "../vehicle/sv_vehicle_apc";
import { SV_MediumTank } from "../vehicle/sv_vehicle_medium_tank";
import { SV_Weapon } from "../weapons/sv_weapon";
import { RoomBase } from "./sv_room_base";

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

  @type({ map: SV_Player }) players = new MapSchema<SV_Player>();
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
    this.players.set(sessionId, p);
  }

  createVehicle(player: SV_Player, x: number, y: number, vehicleTag: Vehicles): SV_Vehicle {
    let vehicle: SV_Vehicle;
    switch(vehicleTag) {
      case Vehicles.MEDIUM_TANK:
        vehicle = new SV_MediumTank(player, x, y);
        this.addEntity(player.id, vehicle);
        return vehicle;
      case Vehicles.APC:
        vehicle = new SV_APC(player, x, y);
        this.addEntity(player.id, vehicle);
        return vehicle;
    }
    throw new Error("Unknown vehicle tag: " + vehicleTag);
  }

  createProjectile(weapon: SV_Weapon, x: number, y: number, angle: number) {
    const entityId = generateId();
    if(weapon.tag === "25mm") {
      const p = new SV_Projectile_25mm(this, entityId, weapon.caster, x, y, angle);
      this.addEntity(entityId, p);
      return;
    }

    if(weapon.tag === "120mm") {
      const p = new SV_Projectile_120mm(this, entityId, weapon.caster, x, y, angle);
      this.addEntity(entityId, p);
      return;
    }

    if(weapon.tag === "50cal") {
      const p = new SV_Projectile_50cal(this, entityId, weapon.caster, x, y, angle);
      this.addEntity(entityId, p);
      return;
    }

    if(weapon.tag === "tow") {
      const p = new SV_Projectile_Tow(this, entityId, weapon.caster, x, y, angle);
      this.addEntity(entityId, p);
      return;
    }

    throw new Error("Unknown weapon tag: " + weapon.tag);

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

  removePlayer(sessionId: string) {
    const p = this.players.get(sessionId);
    if(!p) {
      console.error("removePlayer not found:", sessionId);
      return;
    }
    p.onLeave();
    this.players.delete(sessionId);
  }

  update(deltaTime) {

    if(this.isGameOver) {
      return;
    }

    Matter.Engine.update(this.engine, deltaTime)

  }

  matterAfterUpdate(engineTimeEvent: IEventTimestamped<Engine>) {
    const d = engineTimeEvent['delta'];

    // delete all dead entities
    this.entities.forEach((entity, entityId) => {
      entity.dead && this.removeEntity(entityId);
    });

    this.entities.forEach((entity, entityId) => {
      entity.update(d);

      // touch all satic entities for filtering by distance...
      // entity['$changes'].touch(0);
    });

    this.players.forEach((player, sessionId) => {
      player.update(d);
    });
  }


  gameOver() {
    this.isGameOver = true;
  }

  pickRandomSpawnPoint() {
    return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
  }

  getNextTeam() {
    let nextTeam = 1;
    const teamIds = new Set<number>();
    this.players.forEach((player) => {
      teamIds.add(player.team);
    });


    while (teamIds.has(nextTeam)) {
      nextTeam++;
    }

    return nextTeam;
  }

}
