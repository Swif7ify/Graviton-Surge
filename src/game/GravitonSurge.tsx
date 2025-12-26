// Main Graviton Surge game component

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useGamepad } from 'react-native-earl-gamepad';

// Components
import Background from './components/Background';
import Ship from './components/Ship';
import { DebrisField } from './components/Debris';
import { PowerupField } from './components/Powerup';
import GravityField from './components/GravityField';
import HUD from './components/HUD';
import GameOver from './components/GameOver';

// Hooks
import { useGameLoop } from './hooks/useGameLoop';
import { useGravityPhysics } from './hooks/useGravityPhysics';

// Utils & Types
import { GameState, Player, Debris, Powerup, Vector2D, GameInput } from './types';
import { 
  vectorAdd, 
  vectorMultiply, 
  vectorClamp, 
  vectorMagnitude,
  vectorNormalize,
  circleCollision,
  clampToScreen,
  isOutOfBounds,
  wrapPosition,
} from './utils/physics';
import { spawnDebris, spawnPowerup, spawnInitialDebris, breakDebris } from './utils/spawner';
import { COLORS, SIZES, GAME_CONSTANTS } from '../styles/theme';

// Get initial screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Create initial player state
const createInitialPlayer = (screenWidth: number, screenHeight: number): Player => ({
  id: 'player',
  position: { x: screenWidth / 2, y: screenHeight / 2 },
  velocity: { x: 0, y: 0 },
  radius: SIZES.playerRadius,
  rotation: -Math.PI / 2, // Pointing up
  energy: GAME_CONSTANTS.maxEnergy,
  maxEnergy: GAME_CONSTANTS.maxEnergy,
  lives: 3,
  shieldCharges: 3,
  isShieldActive: false,
  shieldCooldown: 0,
  gravityMode: 'none',
  gravityIntensity: 0,
  gravityDirection: { x: 0, y: 0 },
});

// Create initial game state
const createInitialGameState = (screenWidth: number, screenHeight: number): GameState => {
  const player = createInitialPlayer(screenWidth, screenHeight);
  return {
    player,
    debris: spawnInitialDebris(8, screenWidth, screenHeight, player.position),
    powerups: [],
    score: 0,
    multiplier: 1,
    isGameOver: false,
    isPaused: false,
    screenWidth,
    screenHeight,
    difficulty: 1,
    timeElapsed: 0,
  };
};

const GravitonSurge: React.FC = () => {
  // Screen dimensions
  const [dimensions, setDimensions] = useState({ 
    width: SCREEN_WIDTH, 
    height: SCREEN_HEIGHT 
  });

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState(dimensions.width, dimensions.height)
  );

  // Input state refs (for performance - avoid re-renders on input changes)
  const inputRef = useRef<GameInput>({
    moveX: 0,
    moveY: 0,
    aimX: 0,
    aimY: 0,
    attractIntensity: 0,
    repelIntensity: 0,
    shieldPressed: false,
    burstPressed: false,
    pausePressed: false,
  });

  // Timing refs for spawning
  const lastDebrisSpawnRef = useRef(0);
  const lastPowerupSpawnRef = useRef(0);
  const shieldButtonReleasedRef = useRef(true);
  const burstButtonReleasedRef = useRef(true);
  const pauseButtonReleasedRef = useRef(true);
  const startButtonReleasedRef = useRef(true);

  // Physics hook
  const { 
    applyGravityToDebris, 
    applyGravityToPowerups,
    handleDebrisCollisions,
    applyGravitonBurst,
  } = useGravityPhysics();

  // Gamepad hook
  const { 
    pressedButtons, 
    axes, 
    buttonValues, 
    isPressed, 
    bridge, 
    info,
  } = useGamepad({
    enabled: true,
    axisThreshold: 0.15,
  });

  const isControllerConnected = info?.connected ?? false;

  // Update input ref from gamepad
  useEffect(() => {
    inputRef.current = {
      moveX: axes.leftX ?? 0,
      moveY: axes.leftY ?? 0,
      aimX: axes.rightX ?? 0,
      aimY: axes.rightY ?? 0,
      attractIntensity: buttonValues?.lt ?? 0,
      repelIntensity: buttonValues?.rt ?? 0,
      shieldPressed: isPressed('a'),
      burstPressed: isPressed('b'),
      pausePressed: isPressed('start'),
    };
  }, [axes, buttonValues, isPressed]);

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription.remove();
  }, []);

  // Game update function
  const updateGame = useCallback((deltaTime: number, elapsedTime: number) => {
    setGameState((prevState) => {
      if (prevState.isGameOver || prevState.isPaused) {
        // Check for restart/unpause
        const input = inputRef.current;
        
        if (prevState.isPaused && input.pausePressed && pauseButtonReleasedRef.current) {
          pauseButtonReleasedRef.current = false;
          return { ...prevState, isPaused: false };
        }
        if (!input.pausePressed) {
          pauseButtonReleasedRef.current = true;
        }
        
        return prevState;
      }

      const input = inputRef.current;
      const { screenWidth, screenHeight } = prevState;

      // Check for pause
      if (input.pausePressed && pauseButtonReleasedRef.current) {
        pauseButtonReleasedRef.current = false;
        return { ...prevState, isPaused: true };
      }
      if (!input.pausePressed) {
        pauseButtonReleasedRef.current = true;
      }

      // === UPDATE PLAYER ===
      let player = { ...prevState.player };

      // Movement from left stick
      const moveInput: Vector2D = { x: input.moveX, y: input.moveY };
      const acceleration = vectorMultiply(moveInput, GAME_CONSTANTS.playerAcceleration);
      player.velocity = vectorAdd(player.velocity, acceleration);
      player.velocity = vectorMultiply(player.velocity, GAME_CONSTANTS.playerDrag);
      player.velocity = vectorClamp(player.velocity, GAME_CONSTANTS.maxPlayerSpeed);
      player.position = vectorAdd(player.position, player.velocity);
      player.position = clampToScreen(player.position, screenWidth, screenHeight, SIZES.playerRadius);

      // Update rotation to face movement direction (or aim direction)
      const aimDirection: Vector2D = { x: input.aimX, y: input.aimY };
      if (vectorMagnitude(aimDirection) > 0.3) {
        player.rotation = Math.atan2(aimDirection.y, aimDirection.x);
        player.gravityDirection = aimDirection;
      } else if (vectorMagnitude(moveInput) > 0.3) {
        player.rotation = Math.atan2(moveInput.y, moveInput.x);
        player.gravityDirection = { x: 0, y: 0 };
      } else {
        player.gravityDirection = { x: 0, y: 0 };
      }

      // Gravity mode and intensity from triggers
      const attracting = input.attractIntensity > 0.1;
      const repelling = input.repelIntensity > 0.1;
      
      if (attracting && !repelling && player.energy > 0) {
        player.gravityMode = 'attract';
        player.gravityIntensity = input.attractIntensity;
        player.energy = Math.max(0, player.energy - GAME_CONSTANTS.energyDrainRate * input.attractIntensity);
      } else if (repelling && !attracting && player.energy > 0) {
        player.gravityMode = 'repel';
        player.gravityIntensity = input.repelIntensity;
        player.energy = Math.max(0, player.energy - GAME_CONSTANTS.energyDrainRate * input.repelIntensity);
      } else {
        player.gravityMode = 'none';
        player.gravityIntensity = 0;
        // Regenerate energy when not using gravity
        player.energy = Math.min(GAME_CONSTANTS.maxEnergy, player.energy + GAME_CONSTANTS.energyRegenRate);
      }

      // Shield activation (A button)
      if (input.shieldPressed && shieldButtonReleasedRef.current && player.shieldCharges > 0 && !player.isShieldActive) {
        shieldButtonReleasedRef.current = false;
        player.isShieldActive = true;
        player.shieldCharges -= 1;
        player.shieldCooldown = GAME_CONSTANTS.shieldDuration;
      }
      if (!input.shieldPressed) {
        shieldButtonReleasedRef.current = true;
      }

      // Update shield duration
      if (player.isShieldActive) {
        player.shieldCooldown -= deltaTime * 1000;
        if (player.shieldCooldown <= 0) {
          player.isShieldActive = false;
          player.shieldCooldown = 0;
        }
      }

      // === UPDATE DEBRIS ===
      let debris = prevState.debris.map((d) => {
        // Update position
        const newPos = vectorAdd(d.position, d.velocity);
        // Slow rotation
        const newRotation = d.rotation + 0.01 * d.mass;
        
        return {
          ...d,
          position: newPos,
          rotation: newRotation,
        };
      });

      // Remove out-of-bounds debris
      debris = debris.filter((d) => !isOutOfBounds(d.position, screenWidth, screenHeight, 150));

      // Apply gravity to debris
      debris = applyGravityToDebris(debris, player, deltaTime);

      // Handle debris-debris collisions
      debris = handleDebrisCollisions(debris);

      // Graviton Burst (B button)
      if (input.burstPressed && burstButtonReleasedRef.current && player.energy >= GAME_CONSTANTS.burstEnergyCost) {
        burstButtonReleasedRef.current = false;
        debris = applyGravitonBurst(debris, player.position, 200, 15);
        player.energy -= GAME_CONSTANTS.burstEnergyCost;
      }
      if (!input.burstPressed) {
        burstButtonReleasedRef.current = true;
      }

      // === UPDATE POWERUPS ===
      let powerups = prevState.powerups.map((p) => ({
        ...p,
        position: vectorAdd(p.position, p.velocity),
        rotation: p.rotation + 0.02,
      }));

      // Apply gravity to powerups
      powerups = applyGravityToPowerups(powerups, player, deltaTime);

      // === COLLISION DETECTION ===
      let newLives = player.lives;
      let newScore = prevState.score;
      let newMultiplier = prevState.multiplier;
      let newShieldCharges = player.shieldCharges;
      let debrisToRemove: string[] = [];
      let powerupsToRemove: string[] = [];
      let newDebrisToAdd: Debris[] = [];

      // Player vs Debris collision
      if (!player.isShieldActive) {
        for (const d of debris) {
          if (circleCollision(player, d)) {
            newLives -= 1;
            debrisToRemove.push(d.id);
            // Add broken pieces
            newDebrisToAdd.push(...breakDebris(d));
            break; // Only one hit per frame
          }
        }
      } else {
        // Shield destroys debris on contact
        for (const d of debris) {
          if (circleCollision({ ...player, radius: SIZES.shieldRadius }, d)) {
            debrisToRemove.push(d.id);
            newDebrisToAdd.push(...breakDebris(d));
            newScore += GAME_CONSTANTS.debrisDestroyScore * newMultiplier;
          }
        }
      }

      // Player vs Powerup collision
      for (const p of powerups) {
        if (circleCollision(player, p)) {
          powerupsToRemove.push(p.id);
          newScore += GAME_CONSTANTS.powerupCollectScore * newMultiplier;

          switch (p.type) {
            case 'energy':
              player.energy = Math.min(GAME_CONSTANTS.maxEnergy, player.energy + p.value);
              break;
            case 'shield':
              newShieldCharges = Math.min(3, player.shieldCharges + 1);
              break;
            case 'multiplier':
              newMultiplier = Math.min(8, newMultiplier + 1);
              break;
            case 'life':
              newLives = Math.min(3, newLives + 1);
              break;
          }
        }
      }

      // Remove collected/destroyed items
      debris = debris.filter((d) => !debrisToRemove.includes(d.id));
      debris.push(...newDebrisToAdd);
      powerups = powerups.filter((p) => !powerupsToRemove.includes(p.id));

      // === SPAWNING ===
      const currentTime = elapsedTime;

      // Spawn debris
      const debrisSpawnInterval = Math.max(500, GAME_CONSTANTS.debrisSpawnInterval - prevState.difficulty * 100);
      if (currentTime - lastDebrisSpawnRef.current > debrisSpawnInterval && debris.length < GAME_CONSTANTS.maxDebris) {
        debris.push(spawnDebris(screenWidth, screenHeight, prevState.difficulty));
        lastDebrisSpawnRef.current = currentTime;
      }

      // Spawn powerups
      if (currentTime - lastPowerupSpawnRef.current > GAME_CONSTANTS.powerupSpawnInterval && powerups.length < GAME_CONSTANTS.maxPowerups) {
        powerups.push(spawnPowerup(screenWidth, screenHeight, player.position));
        lastPowerupSpawnRef.current = currentTime;
      }

      // === DIFFICULTY SCALING ===
      const newDifficulty = Math.min(
        GAME_CONSTANTS.maxDifficultyLevel,
        1 + Math.floor(elapsedTime / GAME_CONSTANTS.difficultyIncreaseInterval)
      );

      // === SURVIVAL SCORE ===
      newScore += GAME_CONSTANTS.survivalScorePerSecond * deltaTime * newMultiplier;

      // Update player state
      player.lives = newLives;
      player.shieldCharges = newShieldCharges;

      // Check game over
      const isGameOver = newLives <= 0;

      return {
        ...prevState,
        player,
        debris,
        powerups,
        score: Math.floor(newScore),
        multiplier: newMultiplier,
        isGameOver,
        difficulty: newDifficulty,
        timeElapsed: elapsedTime,
      };
    });
  }, [applyGravityToDebris, applyGravityToPowerups, handleDebrisCollisions, applyGravitonBurst]);

  // Game loop
  useGameLoop({
    onUpdate: updateGame,
    enabled: !gameState.isGameOver,
    targetFPS: 60,
  });

  // Restart game
  const handleRestart = useCallback(() => {
    lastDebrisSpawnRef.current = 0;
    lastPowerupSpawnRef.current = 0;
    setGameState(createInitialGameState(dimensions.width, dimensions.height));
  }, [dimensions]);

  // Check for restart input on game over
  useEffect(() => {
    if (gameState.isGameOver) {
      const checkRestart = () => {
        const startPressed = isPressed('start');
        const aPressed = isPressed('a');
        
        if ((startPressed && startButtonReleasedRef.current) || (aPressed && shieldButtonReleasedRef.current)) {
          handleRestart();
        }
        
        startButtonReleasedRef.current = !startPressed;
        shieldButtonReleasedRef.current = !aPressed;
      };

      const interval = setInterval(checkRestart, 100);
      return () => clearInterval(interval);
    }
  }, [gameState.isGameOver, isPressed, handleRestart]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Gamepad Bridge - must be rendered */}
      {bridge}

      {/* Background */}
      <Background width={dimensions.width} height={dimensions.height} />

      {/* Game entities layer */}
      <View style={styles.gameLayer}>
        {/* Gravity field effect */}
        <GravityField player={gameState.player} />

        {/* Debris */}
        <DebrisField debris={gameState.debris} />

        {/* Powerups */}
        <PowerupField powerups={gameState.powerups} />

        {/* Player ship */}
        <Ship player={gameState.player} />
      </View>

      {/* HUD layer */}
      <HUD
        score={gameState.score}
        multiplier={gameState.multiplier}
        energy={gameState.player.energy}
        maxEnergy={gameState.player.maxEnergy}
        lives={gameState.player.lives}
        shieldCharges={gameState.player.shieldCharges}
        isConnected={isControllerConnected}
        isPaused={gameState.isPaused}
      />

      {/* Game Over screen */}
      {gameState.isGameOver && (
        <GameOver
          score={gameState.score}
          onRestart={handleRestart}
          isControllerConnected={isControllerConnected}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gameLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GravitonSurge;
