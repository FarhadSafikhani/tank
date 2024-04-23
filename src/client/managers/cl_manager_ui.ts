import { Vehicles } from "../../common/interfaces";
import { CL_Match } from "../match";
import { CL_Manager } from "./cl_manager";

export class CL_UiManager extends CL_Manager {

    domConatiner: HTMLElement;
    weaponsContainer: HTMLElement;

    constructor(match: CL_Match) {
        super(match);
        this.domConatiner = this.getElementById("ui-br");
        this.weaponsContainer = this.getElementById('ui-weapons-container');

        this.setupDialogChar();
        this.showDialogChar();

        this.getElementById('settings-btn').addEventListener("click", () => {
            this.showDialogChar();
        });

    }

    update() {}

    getElement(cssQuery: string): HTMLElement | null{
        return document.querySelector(cssQuery);
    }

    getElementById(id: string): HTMLElement {
        const h = document.getElementById(id);
        if (!h) throw new Error("Element not found: " + id);
        return h;
    }

    updateText(id: string, text: string | number) {
        const el = this.getElementById(id);
        el.innerText = text.toString();
    }

    toggleElement(id: string, on: boolean) {
        const el = this.getElementById(id);
        el.style.display = on ? "block" : "none";
    }

    emptyElement(element: HTMLElement) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        element.innerHTML = "";
    }

    addToasterMessage(containerId: string, message: string, specialClass?: string) {
        
        const el = this.create({
            parent: this.getElementById(containerId),
            html: message,
            class: "toaster-message " + (specialClass || ""),
            prepend: true
        });

        setTimeout(() => {
            el.classList.add("fade-out");
            setTimeout(() => {
                el.remove();
            }, 1000);
        }, 5000);
    }

    updateBar(el: HTMLElement, percent: number) {
        //const el = this.getElementById(id);
        el.style.width = percent + "%";
    }

    toggleClass(el: HTMLElement, className: string, on: boolean) {
        if (on) {
            el.classList.add(className);
        } else {
            el.classList.remove(className);
        }
    }

    create(data: ElementOptions) {
		var element = document.createElement(data.type || "div");

        // Add id
        if (data.id) {
            element.id = data.id;
        }
		
        // Add classes
		(data.class || "").trim().split(" ").forEach(c => element.classList.add(c));

        // Add html
		if (data.html) {
			element.innerHTML = data.html;
		}
		
        // Append or Prepend to parent
        data.prepend ? data.parent.prepend(element) : data.parent.appendChild(element);

		return element;
	};




    ///DIALOGS
    openDialog(id: string) {
        this.toggleClass(this.getElementById(id), "dialog-open", true);
        this.toggleClass(this.getElementById('dialog-mask'), "dialog-open", true);
    }
    closeDialog(id: string) {
        this.toggleClass(this.getElementById(id), "dialog-open", false);
        this.toggleClass(this.getElementById('dialog-mask'), "dialog-open", false);
    }

    setupDialogChar(){
        const closeBtn = this.getElementById('dialog-char').querySelector('.dialog-close')!;
        closeBtn.addEventListener("click", () => {
            this.closeDialogChar();
        });
    }

    showDialogChar(){
        const userName = localStorage.getItem("userName") || this.match.game.getRandomName();
        (document.getElementById("player-name-input") as HTMLInputElement).value = userName;
        this.setCharOptions();
        this.openDialog('dialog-char');
    }
    closeDialogChar(){
        const userName = (this.getElementById('player-name-input') as HTMLInputElement).value;
        const sanitizedUserName = this.match.game.sanitizeUserName(userName);
        if(sanitizedUserName && sanitizedUserName.length > 0) {
            this.match.game.setUserName(sanitizedUserName);
        }
        this.closeDialog('dialog-char');
    }

    setCharOptions(){
        const charOptions = this.getElementById('dialog-vehcile-choices');
        this.emptyElement(charOptions);
        for (const v in Vehicles) {
            if (isNaN(Number(v))) {
                const el = this.create({
                    type: "div",
                    class: "tank-select",
                    html: v,
                    parent: charOptions
                });
                el.addEventListener("click", () => {
                    this.match.pickVehicle(Vehicles[v]);
                    this.closeDialogChar();
                });
            }
        }
    }

}

interface ElementOptions {
    type?: string;
    id?: string;
    class?: string;
    html?: string;
    parent: HTMLElement;
    prepend?: boolean;
}