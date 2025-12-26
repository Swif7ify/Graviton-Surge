// Animated starfield background with parallax effect

import React, { memo, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../styles/theme';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  layer: number; // 0 = far, 1 = mid, 2 = close
}

interface BackgroundProps {
  width: number;
  height: number;
  playerVelocity?: { x: number; y: number };
}

const generateStars = (count: number, width: number, height: number): Star[] => {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(Math.random() * 3);
    stars.push({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: layer === 0 ? 1 : layer === 1 ? 1.5 : 2,
      opacity: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 1000 + Math.random() * 3000,
      layer,
    });
  }
  return stars;
};

const StarComponent: React.FC<{ star: Star }> = memo(({ star }) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: star.opacity * 0.3,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: star.opacity,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
      ])
    );
    twinkle.start();
    return () => twinkle.stop();
  }, [opacityAnim, star.opacity, star.twinkleSpeed]);

  const color = star.layer === 2 ? COLORS.starTwinkle : COLORS.starBright;

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          backgroundColor: color,
          opacity: opacityAnim,
          shadowColor: color,
          shadowOpacity: star.layer === 2 ? 0.8 : 0.4,
          shadowRadius: star.size * 2,
        },
      ]}
    />
  );
});

const Background: React.FC<BackgroundProps> = memo(({ width, height }) => {
  const stars = useMemo(() => generateStars(100, width, height), [width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Gradient overlay */}
      <View style={[styles.gradientTop, { width }]} />
      <View style={[styles.gradientBottom, { width }]} />
      
      {/* Stars */}
      {stars.map((star) => (
        <StarComponent key={star.id} star={star} />
      ))}
      
      {/* Nebula effects */}
      <View style={[styles.nebula, styles.nebula1]} />
      <View style={[styles.nebula, styles.nebula2]} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.background,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 200,
    backgroundColor: COLORS.backgroundGradientStart,
    opacity: 0.5,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 200,
    backgroundColor: COLORS.backgroundGradientEnd,
    opacity: 0.5,
  },
  star: {
    position: 'absolute',
    borderRadius: 50,
  },
  nebula: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  nebula1: {
    top: '20%',
    left: '10%',
    width: 300,
    height: 200,
    backgroundColor: COLORS.attractField,
    transform: [{ rotate: '30deg' }],
  },
  nebula2: {
    bottom: '30%',
    right: '15%',
    width: 250,
    height: 180,
    backgroundColor: COLORS.repelField,
    transform: [{ rotate: '-20deg' }],
  },
});

export default Background;
