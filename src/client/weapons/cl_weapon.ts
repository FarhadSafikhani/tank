import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { CL_Vehicle } from "../cl_vehicle";

export class CL_Weapon {

    vehicle: CL_Vehicle;
    svWeapon: SV_Weapon;

    constructor(vehicle: CL_Vehicle, svWeapon: SV_Weapon) {
        this.vehicle = vehicle;
        this.svWeapon = svWeapon;
        this.setupUi();
    }

    setupUi(){}

    update() {}    

    destroy() {
        this.removeUi();
    }

    removeUi() {}
}




