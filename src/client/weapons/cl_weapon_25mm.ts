import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { SV_Weapon_25mm } from "../../server/weapons/sv_weapon_25mm";
import { CL_Player } from "../cl_player";
import { CL_Weapon } from "./cl_weapon";



export class CL_Weapon_25mm extends CL_Weapon {

    svWeapon: SV_Weapon_25mm;

    localCooldownLeftMs: number = -1;

    htmlUiContainer: HTMLElement;
    htmlUiBar: HTMLElement;
    ammoCounter: HTMLElement;

    constructor(player: CL_Player, svWeapon: SV_Weapon){
        super(player, svWeapon);
    }

    setupUi() {

        this.htmlUiContainer = this.match.uim.create({
            id: 'weapon-ui-25mm',
            class: 'ui-text weapon-ui',
            parent: this.match.uim.weaponsContainer,
            html: '<div class="weapon-name">25mm</div>'
        });

        this.htmlUiBar = this.match.uim.create({
            class: 'cooldown-bar-fill',
            parent: this.htmlUiContainer,
            prepend: true
        });

        this.ammoCounter = this.match.uim.create({
            class: 'weapon-ammo',
            parent: this.htmlUiContainer,
            html: '25'
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

        this.ammoCounter.innerText = this.svWeapon.roundsLeft.toString();

    }  
 
}




