// Theme and styling constants for Graviton Surge

export const COLORS = {
  // Background colors
  background: '#0a0a1a',
  backgroundGradientStart: '#0f0f2d',
  backgroundGradientEnd: '#0a0a1a',
  
  // Player ship colors
  shipPrimary: '#00d4ff',
  shipSecondary: '#0099cc',
  shipGlow: 'rgba(0, 212, 255, 0.6)',
  thrusterFlame: '#ff6600',
  thrusterGlow: 'rgba(255, 102, 0, 0.5)',
  
  // Gravity field colors
  attractField: '#ff00ff',
  attractGlow: 'rgba(255, 0, 255, 0.3)',
  repelField: '#00ffff',
  repelGlow: 'rgba(0, 255, 255, 0.3)',
  
  // Shield colors
  shieldActive: 'rgba(0, 255, 200, 0.4)',
  shieldBorder: '#00ffc8',
  
  // Debris colors
  debrisSmall: '#888899',
  debrisMedium: '#667788',
  debrisLarge: '#556677',
  debrisOutline: '#aabbcc',
  
  // Powerup colors
  powerupEnergy: '#ffff00',
  powerupShield: '#00ff88',
  powerupMultiplier: '#ff8800',
  powerupLife: '#ff4488',
  powerupGlow: 'rgba(255, 255, 0, 0.5)',
  
  // UI colors
  uiPrimary: '#ffffff',
  uiSecondary: '#aabbcc',
  uiAccent: '#00d4ff',
  uiDanger: '#ff4444',
  uiSuccess: '#44ff44',
  uiWarning: '#ffaa00',
  
  // Energy bar
  energyFull: '#00ff88',
  energyMid: '#ffaa00',
  energyLow: '#ff4444',
  energyBackground: 'rgba(255, 255, 255, 0.2)',
  
  // Stars
  starBright: '#ffffff',
  starDim: 'rgba(255, 255, 255, 0.5)',
  starTwinkle: '#aaddff',
};

export const SIZES = {
  // Player
  playerRadius: 20,
  shieldRadius: 35,
  thrusterLength: 15,
  
  // Debris
  debrisSmallRadius: 8,
  debrisMediumRadius: 15,
  debrisLargeRadius: 25,
  
  // Powerups
  powerupRadius: 12,
  
  // Gravity field
  gravityFieldMaxRadius: 150,
  gravityFieldMinRadius: 30,
  
  // UI
  hudPadding: 20,
  hudFontSize: 18,
  hudFontSizeLarge: 24,
  energyBarWidth: 150,
  energyBarHeight: 12,
  
  // Game bounds padding
  spawnPadding: 50,
};

export const GAME_CONSTANTS = {
  // Physics
  maxPlayerSpeed: 8,
  playerAcceleration: 0.5,
  playerDrag: 0.95,
  gravityMaxForce: 5,
  gravityRange: 200,
  
  // Energy system
  maxEnergy: 100,
  energyDrainRate: 0.3,
  energyRegenRate: 0.1,
  burstEnergyCost: 30,
  
  // Shield
  shieldDuration: 2000, // ms
  shieldCooldown: 5000, // ms
  
  // Spawning
  maxDebris: 25,
  maxPowerups: 5,
  debrisSpawnInterval: 1500, // ms
  powerupSpawnInterval: 8000, // ms
  
  // Scoring
  debrisDestroyScore: 10,
  powerupCollectScore: 50,
  survivalScorePerSecond: 1,
  
  // Difficulty scaling
  difficultyIncreaseInterval: 30000, // ms
  maxDifficultyLevel: 10,
};

export const FONTS = {
  primary: 'System',
  mono: 'monospace',
};
