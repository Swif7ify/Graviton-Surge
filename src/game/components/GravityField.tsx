// Visual representation of gravitational field

import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Player, Vector2D } from '../types';
import { COLORS, SIZES, GAME_CONSTANTS } from '../../styles/theme';
import { vectorMagnitude, vectorNormalize } from '../utils/physics';

interface GravityFieldProps {
  player: Player;
}

const GravityField: React.FC<GravityFieldProps> = memo(({ player }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const intensityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Animate intensity changes
  useEffect(() => {
    Animated.timing(intensityAnim, {
      toValue: player.gravityIntensity,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [player.gravityIntensity, intensityAnim]);

  if (player.gravityMode === 'none' || player.gravityIntensity < 0.1) {
    return null;
  }

  const isAttract = player.gravityMode === 'attract';
  const color = isAttract ? COLORS.attractField : COLORS.repelField;
  const glowColor = isAttract ? COLORS.attractGlow : COLORS.repelGlow;

  // Calculate field direction
  const aimMag = vectorMagnitude(player.gravityDirection);
  const hasAim = aimMag > 0.3;
  
  let aimAngle = 0;
  if (hasAim) {
    const normalized = vectorNormalize(player.gravityDirection);
    aimAngle = Math.atan2(normalized.y, normalized.x);
  }

  // Field size based on intensity
  const baseRadius = SIZES.gravityFieldMinRadius;
  const maxRadius = SIZES.gravityFieldMaxRadius;
  const fieldRadius = baseRadius + (maxRadius - baseRadius) * player.gravityIntensity;

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.1],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <View
      style={[
        styles.container,
        {
          left: player.position.x - fieldRadius,
          top: player.position.y - fieldRadius,
          width: fieldRadius * 2,
          height: fieldRadius * 2,
        },
      ]}
    >
      {hasAim ? (
        // Directional cone when aiming
        <View
          style={[
            styles.coneContainer,
            {
              transform: [{ rotate: `${aimAngle}rad` }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.cone,
              {
                borderRightColor: color,
                borderRightWidth: fieldRadius,
                borderTopWidth: fieldRadius * 0.6,
                borderBottomWidth: fieldRadius * 0.6,
                opacity: pulseOpacity,
                transform: [{ scaleX: pulseScale }],
              },
            ]}
          />
          {/* Inner cone */}
          <View
            style={[
              styles.cone,
              {
                borderRightColor: color,
                borderRightWidth: fieldRadius * 0.7,
                borderTopWidth: fieldRadius * 0.4,
                borderBottomWidth: fieldRadius * 0.4,
                opacity: 0.4,
              },
            ]}
          />
        </View>
      ) : (
        // Radial field when not aiming
        <>
          {/* Outer ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                width: fieldRadius * 2,
                height: fieldRadius * 2,
                borderRadius: fieldRadius,
                borderColor: color,
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          {/* Middle ring */}
          <View
            style={[
              styles.ring,
              {
                width: fieldRadius * 1.4,
                height: fieldRadius * 1.4,
                borderRadius: fieldRadius * 0.7,
                borderColor: color,
                opacity: 0.4,
              },
            ]}
          />
          {/* Inner ring */}
          <View
            style={[
              styles.ring,
              {
                width: fieldRadius * 0.8,
                height: fieldRadius * 0.8,
                borderRadius: fieldRadius * 0.4,
                borderColor: color,
                opacity: 0.6,
              },
            ]}
          />
        </>
      )}

      {/* Particle effects would go here in a more advanced version */}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  coneContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cone: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderLeftWidth: 0,
  },
});

export default GravityField;
