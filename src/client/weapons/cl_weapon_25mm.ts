import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { CL_Player } from "../cl_player";
import { CL_Match } from "../match";
import { CL_Weapon } from "./cl_weapon";



export class CL_Weapon_25mm extends CL_Weapon {



    constructor(player: CL_Player, svWeapon: SV_Weapon){
        super(player, svWeapon);
    }

    setupUi() {
    }
 
}




