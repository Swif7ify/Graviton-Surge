// Game Over screen component

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { COLORS } from '../../styles/theme';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  isControllerConnected: boolean;
}

const GameOver: React.FC<GameOverProps> = memo(({ score, onRestart, isControllerConnected }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Button pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim, scaleAnim, buttonPulse]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnim }
      ]}
    >
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.gameOverText}>GAME OVER</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>FINAL SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>

        <View style={styles.statsContainer}>
          {/* Could add more stats here like time survived, debris destroyed, etc */}
        </View>

        <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
          <Pressable 
            style={styles.restartButton}
            onPress={onRestart}
          >
            <Text style={styles.restartButtonText}>
              {isControllerConnected ? 'PRESS START TO RESTART' : 'TAP TO RESTART'}
            </Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.hint}>
          {isControllerConnected 
            ? 'Or press A button'
            : 'Connect a gamepad for the best experience'
          }
        </Text>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  gameOverText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.uiDanger,
    textShadowColor: COLORS.uiDanger,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
    marginBottom: 40,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.uiSecondary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.uiAccent,
    textShadowColor: COLORS.uiAccent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  statsContainer: {
    marginBottom: 40,
  },
  restartButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.uiAccent,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  restartButtonText: {
    color: COLORS.uiAccent,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  hint: {
    color: COLORS.uiSecondary,
    fontSize: 12,
    marginTop: 20,
  },
});

export default GameOver;
