// Game Entity Types for Graviton Surge

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  rotation: number;
}

export interface Player extends Entity {
  energy: number;
  maxEnergy: number;
  lives: number;
  shieldCharges: number;
  isShieldActive: boolean;
  shieldCooldown: number;
  gravityMode: 'attract' | 'repel' | 'none';
  gravityIntensity: number;
  gravityDirection: Vector2D;
}

export interface Debris extends Entity {
  mass: number;
  type: 'small' | 'medium' | 'large';
  color: string;
}

export interface Powerup extends Entity {
  type: 'energy' | 'shield' | 'multiplier' | 'life';
  value: number;
}

export interface GameState {
  player: Player;
  debris: Debris[];
  powerups: Powerup[];
  score: number;
  multiplier: number;
  isGameOver: boolean;
  isPaused: boolean;
  screenWidth: number;
  screenHeight: number;
  difficulty: number;
  timeElapsed: number;
}

export interface GameInput {
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  attractIntensity: number;
  repelIntensity: number;
  shieldPressed: boolean;
  burstPressed: boolean;
  pausePressed: boolean;
}

export type GamepadButtonName = 
  | 'a' | 'b' | 'x' | 'y'
  | 'lb' | 'rb' | 'lt' | 'rt'
  | 'back' | 'start'
  | 'ls' | 'rs'
  | 'dpadUp' | 'dpadDown' | 'dpadLeft' | 'dpadRight'
  | 'home' | 'touchpad';

export type StickAxisName = 'leftX' | 'leftY' | 'rightX' | 'rightY';
