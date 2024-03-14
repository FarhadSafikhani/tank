import { Game } from "./game";

const game = new Game();
document.body.appendChild(game.view);

(window as any).game = game;


