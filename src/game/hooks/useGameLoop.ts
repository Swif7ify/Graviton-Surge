// Custom hook for smooth 60fps game loop with delta time

import { useRef, useEffect, useCallback } from 'react';

interface GameLoopOptions {
  onUpdate: (deltaTime: number, elapsedTime: number) => void;
  targetFPS?: number;
  enabled?: boolean;
}

export const useGameLoop = ({ 
  onUpdate, 
  targetFPS = 60, 
  enabled = true 
}: GameLoopOptions) => {
  const frameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);
  const targetFrameTime = 1000 / targetFPS;

  const gameLoop = useCallback((currentTime: number) => {
    if (!enabled) return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    
    // Cap delta time to prevent huge jumps (e.g., when tab is inactive)
    const cappedDelta = Math.min(deltaTime, targetFrameTime * 3);
    
    if (deltaTime >= targetFrameTime * 0.9) {
      lastTimeRef.current = currentTime;
      elapsedTimeRef.current += cappedDelta;
      
      onUpdate(cappedDelta / 1000, elapsedTimeRef.current); // Convert to seconds
    }

    frameIdRef.current = requestAnimationFrame(gameLoop);
  }, [onUpdate, enabled, targetFrameTime]);

  useEffect(() => {
    if (enabled) {
      lastTimeRef.current = 0;
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [gameLoop, enabled]);

  const reset = useCallback(() => {
    elapsedTimeRef.current = 0;
    lastTimeRef.current = 0;
  }, []);

  return { reset, elapsedTime: elapsedTimeRef.current };
};

export default useGameLoop;
