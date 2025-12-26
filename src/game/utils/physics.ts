// Physics utility functions for Graviton Surge

import { Vector2D, Entity, Debris } from '../types';

// Vector operations
export const vectorAdd = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const vectorSubtract = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const vectorMultiply = (v: Vector2D, scalar: number): Vector2D => ({
  x: v.x * scalar,
  y: v.y * scalar,
});

export const vectorMagnitude = (v: Vector2D): number => 
  Math.sqrt(v.x * v.x + v.y * v.y);

export const vectorNormalize = (v: Vector2D): Vector2D => {
  const mag = vectorMagnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
};

export const vectorDistance = (a: Vector2D, b: Vector2D): number => 
  vectorMagnitude(vectorSubtract(a, b));

export const vectorDot = (a: Vector2D, b: Vector2D): number => 
  a.x * b.x + a.y * b.y;

export const vectorRotate = (v: Vector2D, angle: number): Vector2D => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
};

export const vectorLerp = (a: Vector2D, b: Vector2D, t: number): Vector2D => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const vectorClamp = (v: Vector2D, maxMagnitude: number): Vector2D => {
  const mag = vectorMagnitude(v);
  if (mag <= maxMagnitude) return v;
  return vectorMultiply(vectorNormalize(v), maxMagnitude);
};

// Collision detection
export const circleCollision = (a: Entity, b: Entity): boolean => {
  const distance = vectorDistance(a.position, b.position);
  return distance < a.radius + b.radius;
};

export const pointInCircle = (point: Vector2D, center: Vector2D, radius: number): boolean => {
  return vectorDistance(point, center) <= radius;
};

// Gravitational physics
export const calculateGravityForce = (
  sourcePos: Vector2D,
  targetPos: Vector2D,
  intensity: number,
  maxRange: number,
  attract: boolean
): Vector2D => {
  const direction = vectorSubtract(attract ? sourcePos : targetPos, attract ? targetPos : sourcePos);
  const distance = vectorMagnitude(direction);
  
  if (distance === 0 || distance > maxRange) {
    return { x: 0, y: 0 };
  }
  
  // Inverse square law with distance falloff
  const normalizedDistance = distance / maxRange;
  const falloff = 1 - normalizedDistance;
  const forceMagnitude = intensity * falloff * falloff;
  
  const normalized = vectorNormalize(direction);
  return vectorMultiply(normalized, attract ? forceMagnitude : -forceMagnitude);
};

// Calculate gravitational effect on debris based on player's aim direction
export const calculateAimedGravity = (
  playerPos: Vector2D,
  aimDirection: Vector2D,
  targetPos: Vector2D,
  intensity: number,
  maxRange: number,
  attract: boolean,
  fieldAngle: number = Math.PI / 3 // 60 degree cone
): Vector2D => {
  const toTarget = vectorSubtract(targetPos, playerPos);
  const distance = vectorMagnitude(toTarget);
  
  if (distance === 0 || distance > maxRange) {
    return { x: 0, y: 0 };
  }
  
  // Check if target is within the gravity field cone
  const toTargetNorm = vectorNormalize(toTarget);
  const aimNorm = vectorNormalize(aimDirection);
  const dot = vectorDot(toTargetNorm, aimNorm);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  
  // If we're aiming (right stick has input), use directional gravity
  const aimMagnitude = vectorMagnitude(aimDirection);
  if (aimMagnitude > 0.3) {
    if (angle > fieldAngle) {
      return { x: 0, y: 0 }; // Outside the cone
    }
    
    // Reduce force based on angle from aim direction
    const angleMultiplier = 1 - (angle / fieldAngle);
    const distanceFalloff = 1 - (distance / maxRange);
    const forceMagnitude = intensity * angleMultiplier * distanceFalloff;
    
    // For attract: pull toward player, for repel: push away from player
    const forceDirection = attract ? vectorMultiply(toTargetNorm, -1) : toTargetNorm;
    return vectorMultiply(forceDirection, forceMagnitude);
  } else {
    // No aiming - radial gravity from player (360 degrees)
    const distanceFalloff = 1 - (distance / maxRange);
    const forceMagnitude = intensity * distanceFalloff * 0.5; // Reduced without aiming
    const forceDirection = attract ? vectorMultiply(toTargetNorm, -1) : toTargetNorm;
    return vectorMultiply(forceDirection, forceMagnitude);
  }
};

// Debris-debris collision response
export const resolveDebrisCollision = (a: Debris, b: Debris): [Vector2D, Vector2D] => {
  const normal = vectorNormalize(vectorSubtract(b.position, a.position));
  const relativeVelocity = vectorSubtract(a.velocity, b.velocity);
  const velocityAlongNormal = vectorDot(relativeVelocity, normal);
  
  // Don't resolve if moving apart
  if (velocityAlongNormal < 0) {
    return [a.velocity, b.velocity];
  }
  
  const restitution = 0.7; // Bounciness
  const totalMass = a.mass + b.mass;
  
  const impulse = (-(1 + restitution) * velocityAlongNormal) / totalMass;
  const impulseVector = vectorMultiply(normal, impulse);
  
  return [
    vectorSubtract(a.velocity, vectorMultiply(impulseVector, b.mass)),
    vectorAdd(b.velocity, vectorMultiply(impulseVector, a.mass)),
  ];
};

// Screen wrapping / bounds checking
export const wrapPosition = (
  position: Vector2D,
  screenWidth: number,
  screenHeight: number,
  padding: number = 50
): Vector2D => {
  let { x, y } = position;
  
  if (x < -padding) x = screenWidth + padding;
  if (x > screenWidth + padding) x = -padding;
  if (y < -padding) y = screenHeight + padding;
  if (y > screenHeight + padding) y = -padding;
  
  return { x, y };
};

export const isOutOfBounds = (
  position: Vector2D,
  screenWidth: number,
  screenHeight: number,
  padding: number = 100
): boolean => {
  return (
    position.x < -padding ||
    position.x > screenWidth + padding ||
    position.y < -padding ||
    position.y > screenHeight + padding
  );
};

// Clamp position within screen bounds
export const clampToScreen = (
  position: Vector2D,
  screenWidth: number,
  screenHeight: number,
  radius: number
): Vector2D => ({
  x: Math.max(radius, Math.min(screenWidth - radius, position.x)),
  y: Math.max(radius, Math.min(screenHeight - radius, position.y)),
});

// Random utilities
export const randomInRange = (min: number, max: number): number => 
  Math.random() * (max - min) + min;

export const randomVector = (maxMagnitude: number): Vector2D => ({
  x: randomInRange(-maxMagnitude, maxMagnitude),
  y: randomInRange(-maxMagnitude, maxMagnitude),
});

export const randomAngle = (): number => Math.random() * Math.PI * 2;
