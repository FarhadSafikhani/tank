import { Game } from "./game";

const game = new Game();
document.body.appendChild(game.view);

(window as any).game = game;

// allow to resize viewport and renderer
window.onresize = () => {
    game.viewport.resize(window.innerWidth, window.innerHeight);
    game.renderer.resize(window.innerWidth, window.innerHeight);
}

