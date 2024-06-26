import { Schema, type, MapSchema } from "@colyseus/schema";
import { BaseState } from "../rooms/sv_state_base";
import { SV_Vehicle } from "../vehicle/sv_vehicle";
import { Vehicles } from "../../common/interfaces";

export class SV_Player extends Schema{

    @type("int32") respawnTimeLeft: number = 0;
    @type("string") name: string = "";
    @type("int32") team: number = 0;
    @type("string") lastKillerName: string = "";
    @type("boolean") isKia: boolean = false;
    @type({ map: "int32" }) matchStats = new MapSchema<number>();
    @type(SV_Vehicle) vehicle?: SV_Vehicle;
    @type("string") id: string;

    state: BaseState;

    lastKillerId: string = "";
    respawnTimeNext = 0;
    respawnTime: number = 3000;

    wDown: boolean = false;
    sDown: boolean = false;
    aDown: boolean = false;
    dDown: boolean = false;
    mDown: boolean = false;
    rmDown: boolean = false;
    mX: number = 0;
    mY: number = 0;

    constructor(state: BaseState, id: string, x: number, y: number, name: string, team: number) {
        super()
        this.id = id;
        this.state = state;
        this.team = team;
        this.name = name;
        //this.vehicle = this.state.createVehicle(this, x, y, Vehicles.APC);

        // const which = Math.random() > 0.5;
        // this.vehicle = which ? this.state.createVehicle(this, x, y, Vehicles.APC) :
        // this.state.createVehicle(this, x, y, Vehicles.MEDIUM_TANK);
    }


    onMouseMove(x: number, y: number) {
        this.mX = x;
        this.mY = y;
        this.vehicle?.onMouseMove(x, y);
    }

    onKeyDown(keyCode: string) {
        
        if (keyCode === "w") {
            this.wDown = true;
            this.sDown = false;
        } 
        if (keyCode === "s") {
            this.sDown = true;
            this.wDown = false;
        } 

        if (keyCode === "a") {
            this.aDown = true;
            this.dDown = false;
        }
        if (keyCode === "d") {
            this.dDown = true;
            this.aDown = false;
        }

    }

    onKeyUp(keyCode: string) {
        
        if (keyCode === "w") {
            this.wDown = false;
        } 
        if (keyCode === "s") {
            this.sDown = false;
        } 
        if (keyCode === "a") {
            this.aDown = false;
        }
        if (keyCode === "d") {
            this.dDown = false;
        }
    }

    onMouseDown(x: number, y: number) {
        this.mDown = true;
    }

    onMouseUp(x: number, y: number) {
        this.mDown = false;
    }

    onRightMouseDown(x: number, y: number) {
        this.rmDown = true;
    }

    onRightMouseUp(x: number, y: number) {
        this.rmDown = false;
    }

    killedInAction() {
        if(this.isKia) { return; }
        this.isKia = true;
        this.respawnTimeNext = Date.now() + this.respawnTime;
    }

    respawn() {
        this.isKia = false;
        this.vehicle?.respawn();
    }

    update(engineDeltaTime) {
        if(this.isKia) {
            if(Date.now() >= this.respawnTimeNext) {
                this.respawnTimeLeft = 0;
                this.respawn();
            } else {
                this.respawnTimeLeft = this.respawnTimeNext - Date.now();
            }
            return;
        }
    }

    onLeave() {
        if(this.vehicle) {
            this.vehicle.dead = true;
        }
        this.isKia = true;
    }



    pickVehicle(vehicleType: Vehicles) {
        if (!Object.values(Vehicles).includes(vehicleType)) {
            console.error("Invalid vehicle type: " + vehicleType);
            return;
        }

        if (this.vehicle) {
            this.vehicle.dead = true;
        }
        const spawnPos = this.state.pickRandomSpawnPoint();
        this.vehicle = this.state.createVehicle(this, spawnPos.x, spawnPos.y, vehicleType);
    }

    
}




