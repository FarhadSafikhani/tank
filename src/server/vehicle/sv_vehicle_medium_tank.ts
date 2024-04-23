import Matter from "matter-js";
import { CollisionCategory, Vehicles } from "../../common/interfaces";
import { SV_Player } from "../entities/sv_player";
import { SV_Weapon_120mm } from "../weapons/sv_weapon_120mm";
import { SV_Weapon_50cal } from "../weapons/sv_weapon_50cal";
import { SV_Vehicle } from "./sv_vehicle";



export class SV_MediumTank extends SV_Vehicle {


    constructor(entityId: string, player: SV_Player, x: number, y: number) {

        const stats = {
            width: 60,
            height: 40,
            accel: .42,
            turnRate: 0.03,
            maxSpeed: 11,
            friction: .03,
            startingMaxHealth: 120,
            density: 1
        };

        super(entityId, player, x, y, stats);
        this.tag = Vehicles.MEDIUM_TANK;
        
        this.mainWeapon = new SV_Weapon_120mm(this);
        this.secondaryWeapon = new SV_Weapon_50cal(this);
        

    }

    createBody() {
        
        const tankBody = Matter.Bodies.rectangle(this.x, this.y, this.stats.width, this.stats.height,
        {
            isStatic: false, friction: .3, 
            frictionAir: this.stats.friction, restitution: 0.6, 
            density: this.stats.density,
            chamfer: { radius: 6 },
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