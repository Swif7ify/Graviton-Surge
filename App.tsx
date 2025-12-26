import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GravitonSurge from './src/game/GravitonSurge';

export default function App() {
  return (
    <SafeAreaProvider>
      <GravitonSurge />
    </SafeAreaProvider>
  );
}
