import { Game } from "../game";
import { CL_Match } from "../match";

export class CL_Manager {

    match: CL_Match;

    constructor(match: CL_Match) {
        if(!match) throw new Error("Match not found during manager setup");
        if(!match.game) throw new Error("Game not found during manager setup");
        this.match = match;
    }

    update() {}
}