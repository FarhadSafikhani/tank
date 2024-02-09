export interface MouseMessage {
    x: number;
    y: number;
}

export interface KeyMessage {
    keyCode: string;
}

export const enum CollisionCategory {
    PROJECTILE = 0x0001,
    PLAYER = 0x0002,
    WORLD = 0x0003
}