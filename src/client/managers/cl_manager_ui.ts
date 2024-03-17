import { CL_Match } from "../match";
import { CL_Manager } from "./cl_manager";

export class CL_UiManager extends CL_Manager {

    domConatiner: HTMLElement;

    constructor(match: CL_Match) {
        super(match);
        this.domConatiner = this.getElementById("ui-br");
    }

    update() {
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

    addToasterMessage(containerId: string, message: string, specialClass?: string) {
        const el = document.createElement("div");
        el.className = "toaster-message";
        specialClass && el.classList.add(specialClass);
        el.innerText = message;
        const container = this.getElementById(containerId);
        container.insertBefore(el, container.firstChild);
        setTimeout(() => {
            el.classList.add("fade-out");
            setTimeout(() => {
                el.remove();
            }, 1000);
        }, 5000);
    }

}