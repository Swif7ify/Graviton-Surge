// Powerup components with visual effects

import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { Powerup as PowerupType } from '../types';
import { COLORS, SIZES } from '../../styles/theme';

interface PowerupProps {
  powerup: PowerupType;
}

const getColorForType = (type: PowerupType['type']) => {
  switch (type) {
    case 'energy':
      return COLORS.powerupEnergy;
    case 'shield':
      return COLORS.powerupShield;
    case 'multiplier':
      return COLORS.powerupMultiplier;
    case 'life':
      return COLORS.powerupLife;
    default:
      return COLORS.powerupEnergy;
  }
};

const getSymbolForType = (type: PowerupType['type']) => {
  switch (type) {
    case 'energy':
      return '⚡';
    case 'shield':
      return '🛡';
    case 'multiplier':
      return '×2';
    case 'life':
      return '♥';
    default:
      return '?';
  }
};

const PowerupItem: React.FC<PowerupProps> = memo(({ powerup }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Slow rotation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const color = getColorForType(powerup.type);
  const symbol = getSymbolForType(powerup.type);
  const size = SIZES.powerupRadius * 2;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: powerup.position.x - SIZES.powerupRadius,
          top: powerup.position.y - SIZES.powerupRadius,
          transform: [{ scale: pulseAnim }, { rotate: rotation }],
        },
      ]}
    >
      {/* Outer glow */}
      <View
        style={[
          styles.glow,
          {
            backgroundColor: color,
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: size * 0.9,
          },
        ]}
      />

      {/* Main body */}
      <View
        style={[
          styles.body,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={styles.symbol}>{symbol}</Text>
      </View>

      {/* Sparkle effects */}
      <View style={[styles.sparkle, styles.sparkle1, { backgroundColor: color }]} />
      <View style={[styles.sparkle, styles.sparkle2, { backgroundColor: color }]} />
      <View style={[styles.sparkle, styles.sparkle3, { backgroundColor: color }]} />
      <View style={[styles.sparkle, styles.sparkle4, { backgroundColor: color }]} />
    </Animated.View>
  );
});

// Render multiple powerups
interface PowerupFieldProps {
  powerups: PowerupType[];
}

export const PowerupField: React.FC<PowerupFieldProps> = memo(({ powerups }) => {
  return (
    <>
      {powerups.map((p) => (
        <PowerupItem key={p.id} powerup={p} />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZES.powerupRadius * 4,
    height: SIZES.powerupRadius * 4,
  },
  glow: {
    position: 'absolute',
    opacity: 0.3,
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  symbol: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  sparkle1: {
    top: 0,
    left: '50%',
    marginLeft: -2,
  },
  sparkle2: {
    bottom: 0,
    left: '50%',
    marginLeft: -2,
  },
  sparkle3: {
    left: 0,
    top: '50%',
    marginTop: -2,
  },
  sparkle4: {
    right: 0,
    top: '50%',
    marginTop: -2,
  },
});

export default PowerupItem;
