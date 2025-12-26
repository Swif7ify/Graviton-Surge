# 🌌 Graviton Surge

A unique physics-based mobile game where you control gravitational forces to navigate through cosmic debris fields. Built with React Native and powered by [react-native-earl-gamepad](https://github.com/Swif7ify/react-native-earl-gamepad).

![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb)
![Expo](https://img.shields.io/badge/Expo-54-000020)

## 🎮 Game Concept

**You are the gravity.** Pilot a ship that can create gravitational fields to attract or repel cosmic debris. The unique twist is that YOU become the gravity source — carefully balance pushing obstacles away while attracting power-ups toward you.

### What Makes It Unique

- **Dual Analog Control** — Left stick moves the ship, right stick aims the gravitational beam
- **Analog Trigger Mechanics** — LT/RT for attract/repel with pressure-sensitive intensity
- **Gravitational Chain Reactions** — Debris can collide and create chain reactions
- **Risk/Reward Gameplay** — Attracting brings items closer but also danger; repelling clears space but uses energy

## 🕹️ Controls

| Input | Action |
|-------|--------|
| **Left Stick** | Move ship (smooth 360° movement) |
| **Right Stick** | Aim gravitational field direction |
| **LT (Left Trigger)** | Attract mode — pull objects toward beam direction |
| **RT (Right Trigger)** | Repel mode — push objects away from ship |
| **A Button** | Activate Shield (temporary invulnerability) |
| **B Button** | Graviton Burst (area-of-effect repel) |
| **Start** | Pause/Resume |

> **Note:** This game requires a physical gamepad controller (PS4, Xbox, or generic Bluetooth controller).

## 📱 Platform Support

| Platform | Supported |
|----------|-----------|
| Android (Expo Go) | ✅ Yes |
| iOS (Expo Go) | ✅ Yes |
| Web | ❌ No |

> **Important:** `react-native-earl-gamepad` uses a hidden WebView to bridge the HTML5 Gamepad API. This only works on **Android** and **iOS** through **Expo Go** or a development build. Web is not supported.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your Android/iOS device
- A Bluetooth gamepad controller

### Installation

```bash
# Clone the repository
git clone https://github.com/Swif7ify/Graviton-Surge
cd graviton-surge

# Install dependencies
npm install

# Start the Expo development server
npm start
```

### Running the Game

1. Start the Expo server with `npm start`
2. Open the **Expo Go** app on your Android or iOS device
3. Scan the QR code displayed in the terminal
4. **Connect your Bluetooth gamepad** to your phone/tablet
5. Start playing!

## 🎯 Gameplay Tips

1. **Conserve Energy** — Don't hold the triggers constantly; let energy regenerate
2. **Use the Shield Wisely** — You only have 3 charges, save them for emergencies
3. **Aim Your Gravity** — Using the right stick focuses your gravitational pull in a cone
4. **Collect Multipliers** — Orange power-ups increase your score multiplier
5. **Graviton Burst** — Save it for when you're surrounded by debris

## 🏗️ Project Structure

```
graviton-surge/
├── App.tsx                    # Main entry point
├── src/
│   ├── game/
│   │   ├── GravitonSurge.tsx  # Main game component
│   │   ├── components/
│   │   │   ├── Background.tsx # Animated starfield
│   │   │   ├── Ship.tsx       # Player ship
│   │   │   ├── Debris.tsx     # Asteroid debris
│   │   │   ├── Powerup.tsx    # Collectible power-ups
│   │   │   ├── GravityField.tsx # Gravity visual effects
│   │   │   ├── HUD.tsx        # Heads-up display
│   │   │   └── GameOver.tsx   # Game over screen
│   │   ├── hooks/
│   │   │   ├── useGameLoop.ts # 60fps game loop
│   │   │   └── useGravityPhysics.ts # Gravity calculations
│   │   ├── utils/
│   │   │   ├── physics.ts     # Vector math & collisions
│   │   │   └── spawner.ts     # Entity spawning
│   │   └── types.ts           # TypeScript interfaces
│   └── styles/
│       └── theme.ts           # Colors & constants
├── package.json
└── app.json
```

## 🔧 Technologies Used

- **React Native** — Cross-platform mobile framework
- **Expo** — Development toolchain and runtime
- **react-native-earl-gamepad** — Gamepad input via WebView bridge
- **TypeScript** — Type-safe JavaScript

## 📄 License

MIT License — feel free to use this code for your own projects!

## 🙏 Credits

- Gamepad support powered by [react-native-earl-gamepad](https://github.com/Swif7ify/react-native-earl-gamepad)
- Built with [Expo](https://expo.dev/)

---

**Connect a gamepad and enjoy the gravitational chaos!** 🚀✨
