import { Game } from "./game";

const game = new Game();
game.interpolation = true;
document.body.appendChild(game.view);

game.interpolation = true;

(window as any).game = game;

// allow to resize viewport and renderer
window.onresize = () => {
    game.viewport.resize(window.innerWidth, window.innerHeight);
    game.renderer.resize(window.innerWidth, window.innerHeight);
}

// toggle interpolation
document.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;

    if (el.id === "interpolation") {
        game.interpolation = (el as HTMLInputElement).checked;
    }
});
