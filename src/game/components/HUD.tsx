// Heads-up display for game stats

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, GAME_CONSTANTS } from '../../styles/theme';

interface HUDProps {
  score: number;
  multiplier: number;
  energy: number;
  maxEnergy: number;
  lives: number;
  shieldCharges: number;
  isConnected: boolean;
  isPaused: boolean;
}

const HUD: React.FC<HUDProps> = memo(({
  score,
  multiplier,
  energy,
  maxEnergy,
  lives,
  shieldCharges,
  isConnected,
  isPaused,
}) => {
  const energyPercent = (energy / maxEnergy) * 100;
  
  // Determine energy bar color based on level
  let energyColor = COLORS.energyFull;
  if (energyPercent < 30) {
    energyColor = COLORS.energyLow;
  } else if (energyPercent < 60) {
    energyColor = COLORS.energyMid;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top left - Score */}
      <View style={styles.topLeft}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        {multiplier > 1 && (
          <Text style={styles.multiplier}>×{multiplier}</Text>
        )}
      </View>

      {/* Top right - Lives & Shields */}
      <View style={styles.topRight}>
        <View style={styles.livesContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Text
              key={i}
              style={[
                styles.lifeIcon,
                { opacity: i < lives ? 1 : 0.2 },
              ]}
            >
              ♥
            </Text>
          ))}
        </View>
        <View style={styles.shieldContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Text
              key={i}
              style={[
                styles.shieldIcon,
                { opacity: i < shieldCharges ? 1 : 0.2 },
              ]}
            >
              🛡
            </Text>
          ))}
        </View>
      </View>

      {/* Bottom left - Energy bar */}
      <View style={styles.bottomLeft}>
        <Text style={styles.energyLabel}>GRAVITY ENERGY</Text>
        <View style={styles.energyBarContainer}>
          <View style={styles.energyBarBackground}>
            <View
              style={[
                styles.energyBarFill,
                {
                  width: `${energyPercent}%`,
                  backgroundColor: energyColor,
                },
              ]}
            />
          </View>
          <Text style={styles.energyValue}>
            {Math.floor(energy)}/{maxEnergy}
          </Text>
        </View>
      </View>

      {/* Bottom right - Controller status */}
      <View style={styles.bottomRight}>
        <View
          style={[
            styles.connectionDot,
            { backgroundColor: isConnected ? COLORS.uiSuccess : COLORS.uiDanger },
          ]}
        />
        <Text style={styles.connectionText}>
          {isConnected ? 'CONTROLLER CONNECTED' : 'NO CONTROLLER'}
        </Text>
      </View>

      {/* Pause overlay */}
      {isPaused && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseText}>PAUSED</Text>
          <Text style={styles.pauseSubtext}>Press START to resume</Text>
        </View>
      )}

      {/* Controls hint (shown when no controller) */}
      {!isConnected && (
        <View style={styles.controlsHint}>
          <Text style={styles.hintTitle}>CONNECT A GAMEPAD TO PLAY</Text>
          <Text style={styles.hintText}>Supports PS4, Xbox, and generic controllers</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: SIZES.hudPadding,
  },
  topLeft: {
    position: 'absolute',
    top: SIZES.hudPadding,
    left: SIZES.hudPadding,
  },
  scoreLabel: {
    color: COLORS.uiSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  scoreValue: {
    color: COLORS.uiPrimary,
    fontSize: SIZES.hudFontSizeLarge,
    fontWeight: 'bold',
  },
  multiplier: {
    color: COLORS.powerupMultiplier,
    fontSize: SIZES.hudFontSize,
    fontWeight: 'bold',
    marginTop: 2,
  },
  topRight: {
    position: 'absolute',
    top: SIZES.hudPadding,
    right: SIZES.hudPadding,
    alignItems: 'flex-end',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  lifeIcon: {
    fontSize: 20,
    color: COLORS.powerupLife,
  },
  shieldContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  shieldIcon: {
    fontSize: 16,
    color: COLORS.powerupShield,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: SIZES.hudPadding,
    left: SIZES.hudPadding,
  },
  energyLabel: {
    color: COLORS.uiSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  energyBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  energyBarBackground: {
    width: SIZES.energyBarWidth,
    height: SIZES.energyBarHeight,
    backgroundColor: COLORS.energyBackground,
    borderRadius: SIZES.energyBarHeight / 2,
    overflow: 'hidden',
  },
  energyBarFill: {
    height: '100%',
    borderRadius: SIZES.energyBarHeight / 2,
  },
  energyValue: {
    color: COLORS.uiPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomRight: {
    position: 'absolute',
    bottom: SIZES.hudPadding,
    right: SIZES.hudPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    color: COLORS.uiSecondary,
    fontSize: 10,
    letterSpacing: 1,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    color: COLORS.uiPrimary,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  pauseSubtext: {
    color: COLORS.uiSecondary,
    fontSize: 16,
    marginTop: 20,
  },
  controlsHint: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: -50,
  },
  hintTitle: {
    color: COLORS.uiAccent,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  hintText: {
    color: COLORS.uiSecondary,
    fontSize: 14,
  },
});

export default HUD;
