import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { SV_Weapon_120mm } from "../../server/weapons/sv_weapon_120mm";
import { CL_Player } from "../cl_player";
import { CL_Weapon } from "./cl_weapon";


export class CL_Weapon_120mm extends CL_Weapon {

    
    svWeapon: SV_Weapon_120mm;

    localCooldownLeftMs: number = -1;


    htmlUiBar: HTMLElement;
    htmlUiContainer: HTMLElement;

    constructor(player: CL_Player, svWeapon: SV_Weapon){
        super(player, svWeapon);
    }

    setupUi() {

        this.htmlUiContainer = this.match.uim.create({
            id: 'weapon-ui-120mm',
            class: 'ui-text weapon-ui',
            parent: this.match.uim.weaponsContainer,
            html: '<div class="weapon-name">120mm</div><div class="weapon-ammo">♾</div>'
        });

        this.htmlUiBar = this.match.uim.create({
            class: 'cooldown-bar-fill',
            parent: this.htmlUiContainer,
            prepend: true
        });

    }

    update() {

        if(!this.player.isCLientEntity){
            return;
        }

        if(this.localCooldownLeftMs != this.svWeapon.cooldownLeftMs){
            this.localCooldownLeftMs = this.svWeapon.cooldownLeftMs;
            const percent = (1 - (this.localCooldownLeftMs / this.svWeapon.cooldownMaxMs)) * 100;
            this.match.uim.updateBar(this.htmlUiBar, percent);
        }

    }    

}




