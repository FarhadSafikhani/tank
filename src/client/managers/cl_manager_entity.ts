import { SV_Enemy } from "../../server/entities/sv_enemy";
import { SV_Entity } from "../../server/entities/sv_entity";
import { SV_Player } from "../../server/entities/sv_player";
import { SV_Projectile } from "../../server/entities/sv_projectile";
import { SV_WorldDoodad } from "../../server/entities/sv_worlddoodad";
import { CL_Enemy } from "../cl_enemy";
import { CL_Entity } from "../cl_entity";
import { CL_Manager, } from "./cl_manager";
import { CL_Player } from "../cl_player";
import { CL_Projectile } from "../cl_projectile";
import { CL_WorldDoodad } from "../cl_worlddoodad";
import { CL_Match } from "../match";
import { Particle } from "../particle";
import { CL_Projectile_25mm } from "../cl_projectile_25mm";
import { CL_Projectile_120mm } from "../cl_projectile_120mm";

export class CL_EntityManager extends CL_Manager{

    clEntities: { [id: string]: CL_Entity } = {};
    particles: Particle[] = [];

    constructor(match: CL_Match) {
        super(match);
    }

    update() {

        for (let id in this.clEntities) {
            this.getClEntity(id).update();
        }

        this.updateParticles();

    }

    getClEntity(entityId: string) {
        return this.clEntities[entityId];
    }

    addClEntity(entity: SV_Entity) {
        
        let clEntity: CL_Entity;
        console.log("entity.tag", entity.tag);
        switch (entity.tag) {
            case "player":
                clEntity = new CL_Player(this.match, entity as SV_Player);
                break;
            case "wdoodad":
                clEntity = new CL_WorldDoodad(this.match, entity as SV_WorldDoodad);
                break;
            case "projectile":
                clEntity = new CL_Projectile(this.match, entity as SV_Projectile);
                break;
            case "120mm":
                clEntity = new CL_Projectile_120mm(this.match, entity as SV_Projectile);
                break;
            case "25mm":
                clEntity = new CL_Projectile_25mm(this.match, entity as SV_Projectile);
                break;
            case "enemy":
                clEntity = new CL_Enemy(this.match, entity as SV_Enemy);
                break;
            default:
                throw new Error("Unknown entity type");
                return;
        }

        this.clEntities[entity.id] = clEntity;
    }

    removeClEntity(entityId: string) {
        delete this.clEntities[entityId];
    }

    addParticle(x: number, y: number, size: number) {
        this.particles.push(new Particle(this.match, x, y, size));
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => particle.update());
    }
}