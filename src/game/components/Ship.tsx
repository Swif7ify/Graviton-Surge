// Player ship component with visual effects

import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Player } from '../types';
import { COLORS, SIZES } from '../../styles/theme';

interface ShipProps {
  player: Player;
}

const Ship: React.FC<ShipProps> = memo(({ player }) => {
  const thrusterAnim = useRef(new Animated.Value(0)).current;
  const shieldPulse = useRef(new Animated.Value(1)).current;

  // Thruster animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(thrusterAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(thrusterAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [thrusterAnim]);

  // Shield pulse animation
  useEffect(() => {
    if (player.isShieldActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(shieldPulse, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(shieldPulse, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [player.isShieldActive, shieldPulse]);

  const thrusterScale = thrusterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const rotation = `${player.rotation}rad`;

  return (
    <View
      style={[
        styles.container,
        {
          left: player.position.x - SIZES.playerRadius,
          top: player.position.y - SIZES.playerRadius,
          transform: [{ rotate: rotation }],
        },
      ]}
    >
      {/* Shield effect */}
      {player.isShieldActive && (
        <Animated.View
          style={[
            styles.shield,
            {
              transform: [{ scale: shieldPulse }],
            },
          ]}
        />
      )}

      {/* Ship glow */}
      <View style={styles.glow} />

      {/* Main ship body */}
      <View style={styles.shipBody}>
        {/* Ship nose */}
        <View style={styles.shipNose} />
        
        {/* Ship wings */}
        <View style={styles.wingLeft} />
        <View style={styles.wingRight} />
        
        {/* Cockpit */}
        <View style={styles.cockpit} />
      </View>

      {/* Thrusters */}
      <View style={styles.thrusterContainer}>
        <Animated.View
          style={[
            styles.thruster,
            styles.thrusterLeft,
            { transform: [{ scaleY: thrusterScale }] },
          ]}
        />
        <Animated.View
          style={[
            styles.thruster,
            styles.thrusterRight,
            { transform: [{ scaleY: thrusterScale }] },
          ]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SIZES.playerRadius * 2,
    height: SIZES.playerRadius * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    position: 'absolute',
    width: SIZES.shieldRadius * 2,
    height: SIZES.shieldRadius * 2,
    borderRadius: SIZES.shieldRadius,
    backgroundColor: COLORS.shieldActive,
    borderWidth: 2,
    borderColor: COLORS.shieldBorder,
  },
  glow: {
    position: 'absolute',
    width: SIZES.playerRadius * 2.5,
    height: SIZES.playerRadius * 2.5,
    borderRadius: SIZES.playerRadius * 1.25,
    backgroundColor: COLORS.shipGlow,
    opacity: 0.3,
  },
  shipBody: {
    width: SIZES.playerRadius * 1.6,
    height: SIZES.playerRadius * 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipNose: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.shipPrimary,
  },
  wingLeft: {
    position: 'absolute',
    left: -8,
    top: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderRightWidth: 12,
    borderBottomWidth: 10,
    borderTopColor: 'transparent',
    borderRightColor: COLORS.shipSecondary,
    borderBottomColor: 'transparent',
  },
  wingRight: {
    position: 'absolute',
    right: -8,
    top: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderLeftWidth: 12,
    borderBottomWidth: 10,
    borderTopColor: 'transparent',
    borderLeftColor: COLORS.shipSecondary,
    borderBottomColor: 'transparent',
  },
  cockpit: {
    position: 'absolute',
    top: 14,
    width: 8,
    height: 10,
    borderRadius: 4,
    backgroundColor: COLORS.uiAccent,
  },
  thrusterContainer: {
    position: 'absolute',
    bottom: -5,
    flexDirection: 'row',
    gap: 8,
  },
  thruster: {
    width: 6,
    height: 12,
    backgroundColor: COLORS.thrusterFlame,
    borderRadius: 3,
    shadowColor: COLORS.thrusterFlame,
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  thrusterLeft: {
    marginRight: 2,
  },
  thrusterRight: {
    marginLeft: 2,
  },
});

export default Ship;
