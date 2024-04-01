import { CL_Match } from "../match";
import { CL_Manager } from "./cl_manager";

export class CL_UiManager extends CL_Manager {

    domConatiner: HTMLElement;
    weaponsContainer: HTMLElement;

    constructor(match: CL_Match) {
        super(match);
        this.domConatiner = this.getElementById("ui-br");
        this.weaponsContainer = this.getElementById('ui-weapons-container');
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

    updateBar(el: HTMLElement, percent: number) {
        //const el = this.getElementById(id);
        el.style.width = percent + "%";
    }

    toggleClass(id: string | HTMLElement, className: string, on: boolean) {
        const el = typeof(id) === "string" ? this.getElementById(id) : id;
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
		(data.class || "").split(" ").forEach(c => element.classList.add(c));

        // Add html
		if (data.html) {
			element.innerHTML = data.html;
		}
		
        // Append or Prepend to parent
        data.prepend ? data.parent.prepend(element) : data.parent.appendChild(element);

		return element;
	};

}

interface ElementOptions {
    type?: string;
    id?: string;
    class?: string;
    html?: string;
    parent: HTMLElement;
    prepend?: boolean;
}