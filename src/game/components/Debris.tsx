// Debris asteroid components

import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Debris as DebrisType } from '../types';
import { COLORS } from '../../styles/theme';

interface DebrisProps {
  debris: DebrisType;
}

// Generate random polygon points for asteroid shape
const generateAsteroidPoints = (radius: number, sides: number = 8): string => {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const variance = 0.6 + Math.random() * 0.4;
    const r = radius * variance;
    const x = 50 + (Math.cos(angle) * r * 100 / (radius * 2));
    const y = 50 + (Math.sin(angle) * r * 100 / (radius * 2));
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
};

const DebrisItem: React.FC<DebrisProps> = memo(({ debris }) => {
  // Keep the same shape for each debris instance
  const clipPath = useMemo(() => {
    const sides = debris.type === 'large' ? 10 : debris.type === 'medium' ? 8 : 6;
    return generateAsteroidPoints(debris.radius, sides);
  }, [debris.id, debris.type, debris.radius]);

  const rotation = `${debris.rotation}rad`;
  const size = debris.radius * 2;

  return (
    <View
      style={[
        styles.container,
        {
          left: debris.position.x - debris.radius,
          top: debris.position.y - debris.radius,
          width: size,
          height: size,
          transform: [{ rotate: rotation }],
        },
      ]}
    >
      {/* Main asteroid body - using a simplified circle shape */}
      <View
        style={[
          styles.asteroid,
          {
            backgroundColor: debris.color,
            width: size,
            height: size,
            borderRadius: size / 2 * 0.8, // Slightly irregular
          },
        ]}
      >
        {/* Surface details */}
        <View 
          style={[
            styles.crater, 
            styles.crater1,
            { 
              width: size * 0.25, 
              height: size * 0.25,
              borderRadius: size * 0.125,
            }
          ]} 
        />
        <View 
          style={[
            styles.crater, 
            styles.crater2,
            { 
              width: size * 0.15, 
              height: size * 0.15,
              borderRadius: size * 0.075,
            }
          ]} 
        />
        {debris.type !== 'small' && (
          <View 
            style={[
              styles.crater, 
              styles.crater3,
              { 
                width: size * 0.2, 
                height: size * 0.2,
                borderRadius: size * 0.1,
              }
            ]} 
          />
        )}
      </View>

      {/* Outline glow */}
      <View
        style={[
          styles.outline,
          {
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
          },
        ]}
      />
    </View>
  );
});

// Render multiple debris items efficiently
interface DebrisFieldProps {
  debris: DebrisType[];
}

export const DebrisField: React.FC<DebrisFieldProps> = memo(({ debris }) => {
  return (
    <>
      {debris.map((d) => (
        <DebrisItem key={d.id} debris={d} />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  asteroid: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  crater: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  crater1: {
    top: '20%',
    left: '25%',
  },
  crater2: {
    top: '55%',
    right: '20%',
  },
  crater3: {
    bottom: '20%',
    left: '40%',
  },
  outline: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.debrisOutline,
    opacity: 0.3,
  },
});

export default DebrisItem;
