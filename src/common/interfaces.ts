export interface MouseMessage {
    x: number;
    y: number;
    button: number;
}

export interface KeyMessage {
    keyCode: string;
}

export const enum CollisionCategory {
    PROJECTILE = 0x0001,
    PLAYER = 0x0002,
    ENEMY = 0x0004,
    ENEMY_PROJECTILE = 0x0004,
    WORLD = 0x0005
}

export interface Cords {
    x: number,
    y: number
}