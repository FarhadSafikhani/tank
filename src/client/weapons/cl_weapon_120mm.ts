import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { SV_Weapon_120mm } from "../../server/weapons/sv_weapon_120mm";
import { CL_Player } from "../cl_player";
import { CL_Weapon } from "./cl_weapon";


export class CL_Weapon_120mm extends CL_Weapon {

    
    svWeapon: SV_Weapon_120mm;

    localCooldownLeftMs: number = 0;

    htmlUiContainer: HTMLElement;
    htmlUiBar: HTMLElement;

    constructor(player: CL_Player, svWeapon: SV_Weapon){
        super(player, svWeapon);
    }

    setupUi() {

        this.htmlUiContainer = this.match.uim.create({
            id: 'cooldown-bar-120mm',
            class: 'ui-text cooldown-bar',
            parent: this.match.uim.weaponsContainer
        });

        this.htmlUiBar = this.match.uim.create({
            class: 'cooldown-bar-fill',
            parent: this.htmlUiContainer
        });
    }

    update() {

        if(this.player.isCLientEntity && this.localCooldownLeftMs != this.svWeapon.cooldownLeftMs){
            this.localCooldownLeftMs = this.svWeapon.cooldownLeftMs;
            const percent = (1 - (this.localCooldownLeftMs / this.svWeapon.cooldownMaxMs)) * 100;
            
            this.match.uim.updateBar(this.htmlUiBar, percent);
            this.match.uim.toggleClass(this.htmlUiContainer, "active", percent < 100);
        }

    }    

}




