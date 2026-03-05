# 🏃‍♂️ Gesture-Runner - 3D Running Adventure

A browser-based, 3D endless runner game where you control a Minecraft-inspired character using **real-time hand gestures** via your webcam! Built from scratch bridging computer vision and 3D web gaming.

---

## ✨ Features

- 🤖 **3D Animated Character**: Procedural running and jumping animations.
- 👆 **Hand Gesture Control**: AI-powered hand tracking using MediaPipe.
- 🎮 **Dynamic Obstacles**: Dodge barriers, spinning cylinders, and floating cubes.
- 🚀 **Progressive Difficulty**: The game gets faster and harder the longer you survive.
- 🖼️ **Minecraft Aesthetics**: Custom voxel-style UI, retro fonts, and savage game-over roasting!
- ✨ **Beautiful 3D World**: Features dynamic lighting, shadows, and particle collision effects.

---

## 🛠️ The Tech Stack

- **React 18 & TypeScript**: The foundation of the app, ensuring component-based architecture and strict type safety.
- **Three.js & React Three Fiber (@react-three/fiber)**: Used to render the 3D world, handle lighting, and manage the game loop at 60 FPS.
- **Drei (@react-three/drei)**: Provides essential 3D helpers like `PerspectiveCamera`, `Environment`, and `Stars`.
- **MediaPipe Vision (@mediapipe/tasks-vision)**: Google's AI model used to process the webcam feed and track the user's hand landmarks in real-time.
- **Tailwind CSS**: For rapidly styling the 2D UI overlays (Main Menu, HUD, Game Over screens).
- **Vite**: Blazing-fast build tool and development server.

---

## 🏗️ System Architecture & File Breakdown

The project is cleanly separated into three main layers: **State & UI**, **Computer Vision**, and **3D Game Logic**.

### 1. Game Constants & Configuration (`src/constants.ts`)
This is the brain of your game's physics and rules. By centralizing these, the game is easily tweakable:
- **Lanes**: The game features a 3-lane system (`LANE_WIDTH = 3.0`).
- **Physics**: Gravity is set to `40.0`, and the initial speed is `15.0` (scaling up to a max of `35.0`).
- **Difficulty Speeds**: Mapped strictly to Slow (15), Fast (20), and Ultra-fast (30).

### 2. UI & State Management (`src/App.tsx`)
Acts as the orchestrator. It sits on top of the 3D canvas and handles the game states (`MENU`, `PLAYING`, `GAME_OVER`).
- **Minecraft Aesthetics**: Integrates the `'Press Start 2P'` font and custom `<MCButton>` components with CSS box-shadows to mimic Minecraft's UI.
- **The Roasting System**: A highly entertaining feature where an array of funny, savage insults is randomly selected to roast the player based on their score when they die.
- **Ref Passing**: Instead of using heavy React state for the player's real-time position (which would cause lag), it smartly uses `useRef` to pass the vision data down to the 3D scene without triggering constant re-renders.

### 3. The AI Vision Controller (`src/visioncontrol.tsx`)
This is where the magic happens. It uses MediaPipe to turn a webcam into a game controller.
- **Canvas Mirroring**: Webcams are mirrored by default, so `ctx.scale(-1, 1)` is applied to the canvas. When a user moves their hand right, the character moves right.
- **Finger Tracking**: The AI tracks 21 points on the hand, but isolates **Landmark 8 (The Index Finger Tip)** for precise control.
- **Lane Switching Logic**: The screen is divided into thirds. If the finger crosses `0.33`, it goes right; if it crosses `0.66`, it goes left.
- **Jump Logic**: A golden threshold line sits at 38% of the screen height. Moving the finger above this triggers a jump.
- **Frame Smoothing**: Implements an array (`recentX`, `recentY`) that averages the last few frames to prevent the character from jittering.

### 4. The 3D Game Engine (`src/gamescene.tsx`)
The heaviest file in the project, using `useFrame` to run logic at 60 FPS.
- **Procedural Animation**: The player character is built out of raw Three.js geometries. Using `Math.sin()`, arms and legs swing based on the game clock to mimic a running cycle.
- **Endless World**: Instead of moving the player forward, the floor texture's Y-offset is scrolled (`mat.map.offset.y -= speed`) to create the illusion of endless forward momentum.
- **Object Pooling**: To save memory, obstacles are removed from the array as soon as they pass the camera (`obs.position.z > 5`), awarding +10 points.
- **Collision Detection**: Uses custom AABB (Axis-Aligned Bounding Box) logic to check if the player's coordinates overlap with the obstacle.
- **Particle Effects**: Hitting an obstacle generates a `<ParticleSystem>` that uses `Float32Array` buffers to explode particles outward.

---

## 🎮 How to Play & Controls

1. Start the game from the main menu and **Allow camera access**.
2. Point your **index finger** at the camera.
3. **Move Finger Left/Right**: Switch between the 3 lanes.
4. **Move Finger Up**: Jump to avoid obstacles.
5. Avoid barriers, spinning cylinders, and floating cubes.
6. The game gets faster as you earn points!

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Webcam for hand gesture tracking

### Installation

1. **Install dependencies:**
   ```bash
   npm install
Start the development server:

Bash
npm run dev
Open your browser: Navigate to http://localhost:3000

### 📁 File Structure

```text
├── src/
│   ├── components/
│   │   ├── gamescene.tsx         # 3D game scene and physics
│   │   └── visioncontrol.tsx     # Hand gesture detection
│   ├── App.tsx                   # Main app component
│   ├── constants.ts              # Game constants
│   └── index.css                 # Global styles
├── main.tsx                      # Entry point
├── index.html                    # HTML template
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── package.json                  # Dependencies
```


###🔧 Troubleshooting
Camera not working: Check your browser's site settings to ensure camera permissions are granted. Make sure no other app (like Zoom or Discord) is using the camera.

Low FPS / Lag: Turn on hardware acceleration in your browser settings. Close other heavy applications to free up GPU resources.

Hand not detected: Ensure adequate lighting in your room. Keep your hand clearly in frame and move your finger smoothly.

🔮 Future Enhancements
[ ] Audio Integration (8-bit background track & SFX)

[ ] Collectible Coins/Power-ups

[ ] Persistent High Scores using localStorage

[ ] Mobile-friendly touch-control toggle

[ ] Different robot skins

📄 License & Contributing
MIT License - feel free to use this game as you wish! Found a bug or want to improve the game? Feel free to fork and submit pull requests.

Enjoy the game and have fun dodging obstacles! 🎮✨
