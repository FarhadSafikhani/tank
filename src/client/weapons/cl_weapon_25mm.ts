import { SV_Weapon_25mm } from "../../server/weapons/sv_weapon_25mm";
import { CL_Vehicle } from "../cl_vehicle";
import { CL_Weapon } from "./cl_weapon";



export class CL_Weapon_25mm extends CL_Weapon {

    svWeapon: SV_Weapon_25mm;

    localCooldownLeftMs: number = -1;
    localReplenishLeftMs: number = -1;
    localRoundsLeft: number = -1;

    htmlUiContainer: HTMLElement;
    htmlUiBar: HTMLElement;
    ammoCounter: HTMLElement;
    replenishBar: HTMLElement;

    constructor(vehicle: CL_Vehicle, svWeapon: SV_Weapon_25mm){
        super(vehicle, svWeapon);
    }

    setupUi() {

        this.htmlUiContainer = this.vehicle.match.uim.create({
            id: 'weapon-ui-25mm',
            class: 'ui-text weapon-ui',
            parent: this.vehicle.match.uim.weaponsContainer,
            html: '<div class="weapon-name">25mm</div>'
        });

        this.replenishBar = this.vehicle.match.uim.create({
            class: 'bar-fill replenish',
            parent: this.htmlUiContainer,
            prepend: true
        });

        this.htmlUiBar = this.vehicle.match.uim.create({
            class: 'bar-fill cooldown',
            parent: this.htmlUiContainer,
            prepend: true
        });

        this.ammoCounter = this.vehicle.match.uim.create({
            class: 'weapon-ammo',
            parent: this.htmlUiContainer,
            html: 'xxx'
        });

    }

    removeUi(): void {
        this.vehicle.match.uim.weaponsContainer.removeChild(this.htmlUiContainer);
    }


    update() {
        
        if(!this.vehicle.isCLientVehicle){
            return;
        }

        if(this.localCooldownLeftMs != this.svWeapon.cooldownLeftMs){
            this.localCooldownLeftMs = this.svWeapon.cooldownLeftMs;
            const percent = (1 - (this.localCooldownLeftMs / this.svWeapon.cooldownMaxMs)) * 100;
            this.vehicle.match.uim.updateBar(this.htmlUiBar, percent);
        }

        if(this.localRoundsLeft != this.svWeapon.roundsLeft){
            this.localRoundsLeft = this.svWeapon.roundsLeft;
            this.ammoCounter.innerText = this.svWeapon.roundsLeft.toString();

            if(this.svWeapon.roundsLeft == this.svWeapon.roundsMax){
                this.vehicle.match.uim.updateBar(this.replenishBar, 0);
                return;
            }
        }

        if(this.localReplenishLeftMs != this.svWeapon.roundsReplenishTimeLeftMs){
            this.localReplenishLeftMs = this.svWeapon.roundsReplenishTimeLeftMs;
            if(this.svWeapon.roundsLeft == this.svWeapon.roundsMax){
                return;
            }
            const percent = Math.max(0, Math.min(100, (1 - (this.localReplenishLeftMs / this.svWeapon.roundsReplenishMaxMs)) * 100));
            this.vehicle.match.uim.updateBar(this.replenishBar, percent);
        }

    }  
 
}




