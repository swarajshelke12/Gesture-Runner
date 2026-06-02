<div align="center">

# Gesture Runner

**A 3D endless runner controlled by your hand. No keyboard. No controller. Just your index finger.**

<br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0F9D58?style=for-the-badge&logo=google&logoColor=white)](https://mediapipe.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Runs in Browser](https://img.shields.io/badge/Runs_in-Browser-blue?style=for-the-badge&logo=googlechrome&logoColor=white)]()
[![No Install](https://img.shields.io/badge/No_Install_Required-green?style=for-the-badge)]()
[![Stars](https://img.shields.io/github/stars/swarajshelke12/Gesture-Runner?style=for-the-badge&color=gold)](https://github.com/swarajshelke12/Gesture-Runner/stargazers)
[![Webcam Required](https://img.shields.io/badge/Webcam-Required-red?style=for-the-badge&logo=camera&logoColor=white)]()

<br/>

> Point your index finger at the camera. Move it left or right to switch lanes.
> Raise it above the threshold line to jump. Survive as long as you can.

<br/>

```
  60 FPS WebGL          On-Device ML          Zero Data Upload          3 Difficulty Modes
  3D Voxel World        4 Obstacle Types      Particle Collisions       Real-Time Gestures
```

<br/>

[**Play Now**](#getting-started) &nbsp;&bull;&nbsp; [**How It Works**](#how-the-gesture-control-works) &nbsp;&bull;&nbsp; [**Architecture**](#architecture)

</div>

---

## What It Does

Your webcam becomes the controller. MediaPipe's hand landmark model detects your index fingertip in real time — every frame, on-device, with no data leaving the browser. That position is mapped to lane switches and jump inputs, then fed directly into a Three.js game loop running at 60 FPS.

The world is fully 3D: procedurally scrolling terrain, a voxel character with animated limbs, four distinct obstacle types with dynamic lighting, a particle system that fires on collision, and a handcrafted scene with trees, houses, mountains, and clouds.

---

## How the Gesture Control Works

```
Webcam Frame  →  MediaPipe HandLandmarker  →  Landmark[8] (index fingertip)
                                                       │
                              ┌────────────────────────┤
                              │   2-frame rolling avg   │
                              └────────────────────────┘
                                           │
                     ┌─────────────────────┼────────────────────┐
                     ▼                                          ▼
             X position → Lane (L / C / R)          Y position → Jump trigger
```

**The key engineering decisions:**

- **Smoothing without lag** — A 2-frame rolling average removes jitter while keeping input responsive. Larger windows introduce delay that breaks the feel.
- **Edge detection on jump** — A jump fires only on the transition from below-threshold to above-threshold. Holding your finger up does not repeat the jump.
- **0.5s cooldown** — Enforces intentional input and prevents accidental double-jumps.
- **Zero-overhead control sharing** — Vision output is written into a `useRef`, not React state. The game loop reads it inside `useFrame` — no re-renders, no prop updates, no dropped frames.
- **Graceful tracking loss** — When the hand leaves frame, the dot holds its last known position and the last lane is maintained rather than snapping to center.

---

## The 3D World

<table>
<tr>
<td width="50%">

**Scene Elements**
- Procedurally textured dirt floor with UV-offset scrolling
- Voxel Steve character with sinusoidal limb animation
- Floating clouds built from stacked block meshes
- Voxel oak trees with layered leaf crowns
- Minecraft-style houses with pitched roofs and glass windows
- Snow-capped mountains in the distance with atmospheric fog

</td>
<td width="50%">

**Obstacle Types**
- `BARRIER` — TNT blocks on a lava bar, oscillating point light
- `CYLINDER` — Spinning cobblestone cluster, continuous rotation
- `CUBE` — Floating creeper face, bobbing and yaw animation
- `MEGA_WALL` — Obsidian columns with pulsing purple emissive plane

</td>
</tr>
</table>

**Collision** uses per-frame AABB checks between player bounds and each obstacle. On hit, a 30-particle GPU point cloud spawns at impact position with randomized velocity vectors and gravity simulation.

**Difficulty scaling** — Speed increases at 0.06 u/s² continuously. Spawn interval compresses from 2.2s to 1.0s as speed climbs.

---

## Difficulty Modes

<div align="center">

| Mode | Initial Speed | Max Speed | Feel |
| :---: | :---: | :---: | :--- |
| **Slow** | 15 u/s | 27 u/s | Comfortable — good for learning gestures |
| **Fast** | 20 u/s | 32 u/s | Recommended starting point |
| **Hard** | 30 u/s | 42 u/s | High reaction demand from the first second |

</div>

---

## Getting Started

**Prerequisites:** Node.js 18+, a connected webcam, hardware acceleration enabled in your browser.

```bash
# Clone the repository
git clone https://github.com/swarajshelke12/Gesture-Runner.git
cd Gesture-Runner

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser. Grant camera access when prompted.

> **Tip:** Use Chrome, Edge, or Firefox with hardware acceleration enabled (`chrome://settings/system`) for optimal performance.

---

## How to Play

```
1.  Grant camera access when the browser prompts
2.  Raise your hand — extend your index finger toward the camera
3.  Move finger LEFT  →  switch to left lane
    Move finger RIGHT →  switch to right lane
4.  Raise finger ABOVE the gold line in the camera preview  →  JUMP
5.  Avoid all obstacles — score increases with each one you pass
```

> The jump requires you to **lower your finger first** before jumping again.
> Holding up does not repeat the jump — this is intentional.

---

## Architecture

```
src/
├── App.tsx            Game state machine: MENU → PLAYING → GAME_OVER
│                      Score HUD, jump cooldown display, roast commentary
│
├── GameScene.tsx      Three.js scene graph
│                      Character animation, obstacle spawning, AABB collision
│                      Particle system, procedural terrain, lighting setup
│
├── VisionControl.tsx  MediaPipe initialization and webcam management
│                      Per-frame landmark inference, smoothing, gesture classification
│                      Canvas overlay with lane guides and jump threshold line
│
└── constants.ts       Physics constants, lane widths, gravity, difficulty speeds
```

**Data flow:**

```
VisionControl  →  useRef (ControlState)  →  GameScene (useFrame)
    writes               shared                    reads
```

No React state updates from gesture input. Control data never triggers a re-render. The game loop reads directly from memory on every animation frame.

---

## Troubleshooting

| Symptom | Fix |
| :--- | :--- |
| Tracking drifts or loses hand | Improve lighting — avoid backlighting from windows. Keep full hand in frame. |
| Low frame rate / stuttering | Enable hardware acceleration in browser. Close GPU-heavy apps. |
| Camera not detected | Close Zoom, Teams, or OBS. Check browser site-level camera permissions. |
| Jump fires accidentally | Keep your hand steady. The threshold line is at 38% from the top of the preview. |

---

## Privacy

All processing is local. No video frames, landmark coordinates, or game data are sent anywhere. The only external requests are the one-time fetch of the MediaPipe WASM binary and model file from the jsdelivr CDN on first load.

---

## Stack

<div align="center">

| Technology | Version | Role |
| :--- | :---: | :--- |
| React | 18 | Component model and state machine |
| TypeScript | 5 | Type safety across the entire codebase |
| Three.js | 0.153 | WebGL renderer, geometry, lighting |
| React Three Fiber | 8 | Declarative Three.js scene graph |
| @react-three/drei | 9 | PerspectiveCamera helper |
| MediaPipe Tasks Vision | 0.10 | On-device hand landmark detection |
| Vite | 5 | Development server and production build |

</div>

---

<div align="center">

MIT License &nbsp;&bull;&nbsp; Built by [swarajshelke12](https://github.com/swarajshelke12)

</div>
