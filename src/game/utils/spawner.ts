// Entity spawning logic for Graviton Surge

import { Debris, Powerup, Vector2D } from '../types';
import { COLORS, SIZES, GAME_CONSTANTS } from '../../styles/theme';
import { randomInRange, randomAngle, randomVector } from './physics';

let entityIdCounter = 0;

const generateId = (): string => {
  entityIdCounter += 1;
  return `entity-${entityIdCounter}-${Date.now()}`;
};

// Spawn debris at screen edges moving inward
export const spawnDebris = (
  screenWidth: number,
  screenHeight: number,
  difficulty: number = 1
): Debris => {
  // Determine debris size based on difficulty and randomness
  const sizeRoll = Math.random();
  let type: 'small' | 'medium' | 'large';
  let radius: number;
  let mass: number;
  let color: string;
  
  // Higher difficulty = more large debris
  const largeProbability = Math.min(0.3, 0.1 + difficulty * 0.02);
  const mediumProbability = Math.min(0.5, 0.3 + difficulty * 0.02);
  
  if (sizeRoll < largeProbability) {
    type = 'large';
    radius = SIZES.debrisLargeRadius;
    mass = 3;
    color = COLORS.debrisLarge;
  } else if (sizeRoll < largeProbability + mediumProbability) {
    type = 'medium';
    radius = SIZES.debrisMediumRadius;
    mass = 2;
    color = COLORS.debrisMedium;
  } else {
    type = 'small';
    radius = SIZES.debrisSmallRadius;
    mass = 1;
    color = COLORS.debrisSmall;
  }
  
  // Spawn position - from edges of screen
  const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
  let position: Vector2D;
  let velocity: Vector2D;
  
  const baseSpeed = 1 + difficulty * 0.3;
  const speed = randomInRange(baseSpeed, baseSpeed + 1.5);
  
  switch (edge) {
    case 0: // Top
      position = { x: randomInRange(0, screenWidth), y: -radius - 10 };
      velocity = { 
        x: randomInRange(-1, 1) * speed * 0.5, 
        y: speed 
      };
      break;
    case 1: // Right
      position = { x: screenWidth + radius + 10, y: randomInRange(0, screenHeight) };
      velocity = { 
        x: -speed, 
        y: randomInRange(-1, 1) * speed * 0.5 
      };
      break;
    case 2: // Bottom
      position = { x: randomInRange(0, screenWidth), y: screenHeight + radius + 10 };
      velocity = { 
        x: randomInRange(-1, 1) * speed * 0.5, 
        y: -speed 
      };
      break;
    default: // Left
      position = { x: -radius - 10, y: randomInRange(0, screenHeight) };
      velocity = { 
        x: speed, 
        y: randomInRange(-1, 1) * speed * 0.5 
      };
      break;
  }
  
  return {
    id: generateId(),
    position,
    velocity,
    radius,
    rotation: randomAngle(),
    mass,
    type,
    color,
  };
};

// Spawn powerup at random position (avoiding center where player likely is)
export const spawnPowerup = (
  screenWidth: number,
  screenHeight: number,
  playerPosition: Vector2D
): Powerup => {
  // Determine powerup type
  const typeRoll = Math.random();
  let type: 'energy' | 'shield' | 'multiplier' | 'life';
  let value: number;
  
  if (typeRoll < 0.4) {
    type = 'energy';
    value = 30;
  } else if (typeRoll < 0.7) {
    type = 'shield';
    value = 1;
  } else if (typeRoll < 0.9) {
    type = 'multiplier';
    value = 2;
  } else {
    type = 'life';
    value = 1;
  }
  
  // Find position away from player
  let position: Vector2D;
  let attempts = 0;
  const minDistanceFromPlayer = 150;
  
  do {
    position = {
      x: randomInRange(SIZES.spawnPadding, screenWidth - SIZES.spawnPadding),
      y: randomInRange(SIZES.spawnPadding, screenHeight - SIZES.spawnPadding),
    };
    attempts++;
  } while (
    Math.hypot(position.x - playerPosition.x, position.y - playerPosition.y) < minDistanceFromPlayer &&
    attempts < 10
  );
  
  return {
    id: generateId(),
    position,
    velocity: randomVector(0.3), // Slight drift
    radius: SIZES.powerupRadius,
    rotation: 0,
    type,
    value,
  };
};

// Spawn multiple initial debris
export const spawnInitialDebris = (
  count: number,
  screenWidth: number,
  screenHeight: number,
  playerPosition: Vector2D,
  safeRadius: number = 150
): Debris[] => {
  const debris: Debris[] = [];
  
  for (let i = 0; i < count; i++) {
    let newDebris = spawnDebris(screenWidth, screenHeight, 1);
    
    // Ensure debris doesn't spawn too close to player initially
    let attempts = 0;
    while (
      Math.hypot(
        newDebris.position.x - playerPosition.x,
        newDebris.position.y - playerPosition.y
      ) < safeRadius &&
      attempts < 5
    ) {
      newDebris = spawnDebris(screenWidth, screenHeight, 1);
      attempts++;
    }
    
    debris.push(newDebris);
  }
  
  return debris;
};

// Break large debris into smaller pieces
export const breakDebris = (debris: Debris): Debris[] => {
  if (debris.type === 'small') {
    return []; // Small debris is destroyed
  }
  
  const newType = debris.type === 'large' ? 'medium' : 'small';
  const newRadius = newType === 'medium' ? SIZES.debrisMediumRadius : SIZES.debrisSmallRadius;
  const newMass = newType === 'medium' ? 2 : 1;
  const newColor = newType === 'medium' ? COLORS.debrisMedium : COLORS.debrisSmall;
  
  const count = debris.type === 'large' ? 3 : 2;
  const pieces: Debris[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + randomInRange(-0.3, 0.3);
    const speed = randomInRange(1.5, 3);
    
    pieces.push({
      id: generateId(),
      position: { ...debris.position },
      velocity: {
        x: debris.velocity.x + Math.cos(angle) * speed,
        y: debris.velocity.y + Math.sin(angle) * speed,
      },
      radius: newRadius,
      rotation: randomAngle(),
      mass: newMass,
      type: newType,
      color: newColor,
    });
  }
  
  return pieces;
};
