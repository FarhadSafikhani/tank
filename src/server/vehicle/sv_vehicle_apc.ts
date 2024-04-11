import { Schema, type } from "@colyseus/schema";
import { SV_Comp_Destructable, SV_Entity } from "../entities/sv_entity";
import Matter from "matter-js";
import { CollisionCategory, Vehicles } from "../../common/interfaces";
import { SV_Weapon } from "../weapons/sv_weapon";
import { SV_Weapon_120mm } from "../weapons/sv_weapon_120mm";
import { SV_Weapon_50cal } from "../weapons/sv_weapon_50cal";
import { SV_Player } from "../entities/sv_player";
import { SV_Weapon_25mm } from "../weapons/sv_weapon_25mm";
import { SV_Vehicle, VehicleBaseStats } from "./sv_vehicle";



export class SV_APC extends SV_Vehicle {

    constructor(player: SV_Player, x: number, y: number) {

        const stats = {
            width: 47,
            height: 35,
            accel: .4,
            turnRate: 0.03,
            maxSpeed: 7,
            friction: .03,
            startingMaxHealth: 69,
            density: .7
        };

        super(player, x, y, stats);
        this.tag = Vehicles.APC;
        
        this.mainWeapon = new SV_Weapon_25mm(this);
        this.secondaryWeapon = new SV_Weapon_50cal(this);
        

    }

    createBody() {
        const tankBody = Matter.Bodies.rectangle(this.x, this.y, this.stats.width, this.stats.height,
        {
            isStatic: false, friction: .3, 
            frictionAir: this.stats.friction, restitution: 0.7, 
            density: this.stats.density,
            chamfer: { radius: 11 },
            collisionFilter: {
                group: -this.team, //group for collision filtering
                category: CollisionCategory.PLAYER, // category for projectiles
                mask: CollisionCategory.PROJECTILE | CollisionCategory.PLAYER | 
                CollisionCategory.ENEMY | CollisionCategory.ENEMY_PROJECTILE, // mask for other objects (e.g., players)
                
            },
        });

        const points = tankBody.vertices.map(vertex => {
            return { x: this.x - vertex.x, y: this.y - vertex.y };
        });

        this.verts = JSON.stringify(points);
        return tankBody;
    }

    update() {
        super.update();
    }

    updateMovement() {
        super.updateMovement();
    }

    onKia() {
        super.onKia();
    }

    onMouseMove(mx: number, my: number) {
        super.onMouseMove(mx, my);
    }

    respawn() {
        super.respawn();
    }

}