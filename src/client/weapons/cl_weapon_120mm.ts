import { SV_Weapon } from "../../server/weapons/sv_weapon";
import { SV_Weapon_120mm } from "../../server/weapons/sv_weapon_120mm";
import { CL_Vehicle } from "../cl_vehicle";
import { CL_Match } from "../match";
import { CL_Weapon } from "./cl_weapon";


export class CL_Weapon_120mm extends CL_Weapon {

    
    svWeapon: SV_Weapon_120mm;

    localCooldownLeftMs: number = -1;

    htmlUiBar: HTMLElement;
    htmlUiContainer: HTMLElement;

    constructor(vehicle: CL_Vehicle, svWeapon: SV_Weapon_120mm){
        super(vehicle, svWeapon);
    }

    setupUi() {
        this.htmlUiContainer = this.vehicle.match.uim.create({
            id: 'weapon-ui-120mm',
            class: 'ui-text weapon-ui',
            parent: this.vehicle.match.uim.weaponsContainer,
            html: '<div class="weapon-name">120mm</div><div class="weapon-ammo">♾</div>'
        });

        this.htmlUiBar = this.vehicle.match.uim.create({
            class: 'bar-fill cooldown',
            parent: this.htmlUiContainer,
            prepend: true
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
        
    }    

}




