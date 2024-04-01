import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { SV_Weapon_25mm } from "../../server/weapons/sv_weapon_25mm";
import { SV_Weapon_50cal } from "../../server/weapons/sv_weapon_50cal";
import { CL_Player } from "../cl_player";
import { CL_Weapon } from "./cl_weapon";



export class CL_Weapon_50cal extends CL_Weapon {

    svWeapon: SV_Weapon_50cal;

    localCooldownLeftMs: number = -1;
    localReplenishLeftMs: number = -1;
    localRoundsLeft: number = -1;

    htmlUiContainer: HTMLElement;
    htmlUiBar: HTMLElement;
    ammoCounter: HTMLElement;
    replenishBar: HTMLElement;

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

        this.replenishBar = this.match.uim.create({
            class: 'bar-fill replenish',
            parent: this.htmlUiContainer,
            prepend: true
        });

        this.htmlUiBar = this.match.uim.create({
            class: 'bar-fill cooldown',
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

        if(this.localRoundsLeft != this.svWeapon.roundsLeft){
            this.localRoundsLeft = this.svWeapon.roundsLeft;
            this.ammoCounter.innerText = this.svWeapon.roundsLeft.toString();

            if(this.svWeapon.roundsLeft == this.svWeapon.roundsMax){
                this.match.uim.updateBar(this.replenishBar, 0);
                return;
            }

        }

        if(this.localReplenishLeftMs != this.svWeapon.roundsReplenishTimeLeftMs){
            this.localReplenishLeftMs = this.svWeapon.roundsReplenishTimeLeftMs;

            if(this.svWeapon.roundsLeft == this.svWeapon.roundsMax){
                
                return;
            }

            const percent = Math.max(0, Math.min(100, (1 - (this.localReplenishLeftMs / this.svWeapon.roundsReplenishMaxMs)) * 100));
            this.match.uim.updateBar(this.replenishBar, percent);


            // if(this.localRoundsLeft == 0){

            //     const percent = Math.max(0, Math.min(100, (1 - (this.localReplenishLeftMs / this.svWeapon.roundsReplenishMaxMs)) * 100));
            //     console.log("replenishing", percent, this.localReplenishLeftMs, this.svWeapon.roundsReplenishMaxMs);
            //     this.match.uim.updateBar(this.replenishBar, percent);

            // } else {
            //     this.match.uim.updateBar(this.replenishBar, 0);
            // }
        }







    }  
 
}




