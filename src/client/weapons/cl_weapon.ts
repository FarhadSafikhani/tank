import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { CL_Player } from "../cl_player";
import { CL_Match } from "../match";

export class CL_Weapon {

    player: CL_Player;
    match: CL_Match;
    svWeapon: SV_Weapon;

    constructor(player: CL_Player, svWeapon: SV_Weapon) {
        this.player = player;
        this.match = this.player.match;
        this.svWeapon = svWeapon;
        this.setupUi();
    }

    setupUi(){}

    update() {}    
}




