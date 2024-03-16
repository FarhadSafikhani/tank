import { Game } from "../game";
import { CL_Match } from "../match";

export class CL_Manager {

    match: CL_Match;

    constructor(match: CL_Match) {
        this.match = match;
    }

    update() {}
}