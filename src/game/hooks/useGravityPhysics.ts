// Hook for managing gravity physics calculations

import { useCallback } from 'react';
import { Vector2D, Debris, Powerup, Player } from '../types';
import { 
  calculateAimedGravity, 
  vectorAdd, 
  vectorMultiply,
  vectorMagnitude,
  vectorClamp,
  circleCollision,
  resolveDebrisCollision,
} from '../utils/physics';
import { GAME_CONSTANTS } from '../../styles/theme';

interface GravityPhysicsOptions {
  maxRange?: number;
  maxForce?: number;
}

export const useGravityPhysics = (options: GravityPhysicsOptions = {}) => {
  const { 
    maxRange = GAME_CONSTANTS.gravityRange, 
    maxForce = GAME_CONSTANTS.gravityMaxForce 
  } = options;

  // Apply gravity effects to all debris based on player input
  const applyGravityToDebris = useCallback((
    debris: Debris[],
    player: Player,
    deltaTime: number
  ): Debris[] => {
    if (player.gravityIntensity === 0) return debris;

    const isAttracting = player.gravityMode === 'attract';
    const intensity = player.gravityIntensity * maxForce;

    return debris.map((d) => {
      const gravityForce = calculateAimedGravity(
        player.position,
        player.gravityDirection,
        d.position,
        intensity,
        maxRange,
        isAttracting
      );

      // Apply force inversely proportional to mass
      const acceleration = vectorMultiply(gravityForce, 1 / d.mass);
      
      return {
        ...d,
        velocity: vectorAdd(d.velocity, vectorMultiply(acceleration, deltaTime * 60)),
      };
    });
  }, [maxRange, maxForce]);

  // Apply gravity effects to powerups (always attracted)
  const applyGravityToPowerups = useCallback((
    powerups: Powerup[],
    player: Player,
    deltaTime: number
  ): Powerup[] => {
    if (player.gravityMode !== 'attract' || player.gravityIntensity === 0) {
      return powerups;
    }

    const intensity = player.gravityIntensity * maxForce * 1.5; // Power-ups are more attracted

    return powerups.map((p) => {
      const gravityForce = calculateAimedGravity(
        player.position,
        player.gravityDirection,
        p.position,
        intensity,
        maxRange * 1.2, // Slightly larger range for power-ups
        true // Always attract
      );

      return {
        ...p,
        velocity: vectorAdd(p.velocity, vectorMultiply(gravityForce, deltaTime * 60)),
      };
    });
  }, [maxRange, maxForce]);

  // Handle debris-debris collisions
  const handleDebrisCollisions = useCallback((debris: Debris[]): Debris[] => {
    const newDebris = [...debris];
    
    for (let i = 0; i < newDebris.length; i++) {
      for (let j = i + 1; j < newDebris.length; j++) {
        if (circleCollision(newDebris[i], newDebris[j])) {
          const [newVelA, newVelB] = resolveDebrisCollision(newDebris[i], newDebris[j]);
          newDebris[i] = { ...newDebris[i], velocity: newVelA };
          newDebris[j] = { ...newDebris[j], velocity: newVelB };
          
          // Separate overlapping debris
          const overlap = (newDebris[i].radius + newDebris[j].radius) - 
            Math.hypot(
              newDebris[i].position.x - newDebris[j].position.x,
              newDebris[i].position.y - newDebris[j].position.y
            );
          
          if (overlap > 0) {
            const dx = newDebris[j].position.x - newDebris[i].position.x;
            const dy = newDebris[j].position.y - newDebris[i].position.y;
            const dist = Math.hypot(dx, dy) || 1;
            const separationX = (dx / dist) * (overlap / 2 + 1);
            const separationY = (dy / dist) * (overlap / 2 + 1);
            
            newDebris[i] = {
              ...newDebris[i],
              position: {
                x: newDebris[i].position.x - separationX,
                y: newDebris[i].position.y - separationY,
              },
            };
            newDebris[j] = {
              ...newDebris[j],
              position: {
                x: newDebris[j].position.x + separationX,
                y: newDebris[j].position.y + separationY,
              },
            };
          }
        }
      }
    }
    
    return newDebris;
  }, []);

  // Graviton Burst - area-of-effect repel
  const applyGravitonBurst = useCallback((
    debris: Debris[],
    playerPosition: Vector2D,
    burstRadius: number = 200,
    burstForce: number = 15
  ): Debris[] => {
    return debris.map((d) => {
      const dx = d.position.x - playerPosition.x;
      const dy = d.position.y - playerPosition.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance === 0 || distance > burstRadius) return d;
      
      const falloff = 1 - (distance / burstRadius);
      const force = burstForce * falloff * falloff;
      const direction = { x: dx / distance, y: dy / distance };
      
      return {
        ...d,
        velocity: vectorAdd(d.velocity, vectorMultiply(direction, force / d.mass)),
      };
    });
  }, []);

  return {
    applyGravityToDebris,
    applyGravityToPowerups,
    handleDebrisCollisions,
    applyGravitonBurst,
  };
};

export default useGravityPhysics;
