import * as PIXI from "pixi.js";
import { CL_Manager, } from "./cl_manager";
import { CL_Match } from "../match";
import { Particle } from "../particle";

import * as PParticle from "@pixi/particle-emitter";
import * as emit_explosion_vehcile from "./../emit_explosion_vehcile.json"
import * as emit_turret_big from "./../emit_turret_big.json"
import * as emit_turret_small from "./../emit_turret_small.json"

export class CL_ParticleManager extends CL_Manager {

    particles: Particle[] = [];

    constructor(match: CL_Match) {
        super(match);
    }

    update() {
        this.updateParticles();
    }

    addParticle(x: number, y: number, size: number) {
        this.particles.push(new Particle(this.match, x, y, size));
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => particle.update());
    }


    ///
    spawnParticles50cal(container: PIXI.Container, angle: number) {
        const emitConfig = PParticle.upgradeConfig(emit_turret_small, PIXI.Texture.from('/fire.png'));
        const emitter = new PParticle.Emitter(container, emitConfig);
        emitter.spawnPos.set(10, 0);
        emitter.rotate(angle);
        emitter.addAtBack = false;
        emitter.playOnceAndDestroy();
    }

    spawnParticles120mm(container: PIXI.Container, angle: number) {
        const emitConfig: PParticle.EmitterConfigV3 = PParticle.upgradeConfig(emit_turret_big, PIXI.Texture.from('/fire.png'));
        const emitter = new PParticle.Emitter(container, emitConfig);
        emitter.spawnPos.set(40, 0);
        emitter.rotate(angle);
        emitter.playOnceAndDestroy();
    }

    spawnKiaParticles(container: PIXI.Container) {
        const emitConfig = PParticle.upgradeConfig(emit_explosion_vehcile, PIXI.Texture.from('/fire.png'));
        const emitter = new PParticle.Emitter(container, emitConfig);
        emitter.addAtBack = false;
        emitter.playOnceAndDestroy();
    }
}