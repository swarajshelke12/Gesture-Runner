# Gesture Runner

A browser-based 3D endless runner controlled entirely by hand gestures. No keyboard. No mouse. Just your index finger and a webcam.

---

## What It Does

Point your index finger at your webcam. Move it left or right to switch lanes. Raise it above a threshold line to jump. The game reads your hand position at every frame using on-device machine learning and translates it into real-time game input with no perceptible latency.

The 3D world is rendered with Three.js at 60 FPS — procedural terrain, animated obstacles, dynamic lighting, particle effects on collision, and a voxel character with full running and jumping animation cycles. Everything runs in the browser, client-side, with no data leaving the device.

---

## How the Gesture Control Works

MediaPipe's `HandLandmarker` model runs in VIDEO mode, processing each webcam frame through a GPU-accelerated WASM inference pipeline. Landmark 8 — the index fingertip — is extracted from the normalized landmark array on every frame.

A 2-frame rolling average smooths out jitter without introducing noticeable input lag. The smoothed X coordinate is mapped to three lane zones (left, center, right), and the Y coordinate is compared against a fixed threshold (38% from the top of frame) to determine jump state.

The jump input uses edge detection: a jump fires only on the transition from below-threshold to above-threshold, preventing the player from holding their finger up to continuously jump. A 0.5-second cooldown further enforces intentional input.

All vision processing happens on a `requestAnimationFrame` loop running independently of the Three.js render loop. Control state is written into a shared `useRef` object, bypassing React's re-render cycle entirely. The game loop reads from that ref at render time — zero overhead.

---

## The 3D World

Built with React Three Fiber on top of Three.js. The scene includes:

- **Procedurally textured floor** — canvas-generated dirt texture with block grid lines and dashed lane dividers, UV-offset scrolling at game speed to simulate forward motion
- **Voxel character** — a Steve-style figure with separate mesh refs for each limb, driven by sinusoidal animation tied to the game clock; arm and leg swing invert correctly during jump state
- **Four obstacle types** — TNT-block barriers with lava base and oscillating point light; spinning cobblestone clusters; floating creeper-face cubes with bobbing and rotation; obsidian mega-walls with pulsing purple emissive planes
- **Particle system** — GPU-driven point cloud emitter that spawns on collision, with per-particle velocity vectors and gravity simulation
- **Scenery** — voxel oak trees with layered leaf crowns, Minecraft-style houses with pitched roofs, chimneys, and glass windows; all statically placed off-track
- **Terrain** — canvas-generated grass texture with block patch variation scrolling on lateral planes; distant mountains with snow caps; five block-assembled cloud formations drifting independently across the sky
- **Lighting** — warm directional sun with shadow map, ground bounce point light, and amber fill lights on both sides; atmospheric fog for depth falloff

Collision detection uses AABB math: per-frame distance check between player position and each obstacle's bounding volume. When a hit is detected, a particle emitter is spawned at impact position and `onGameOver` fires.

Obstacle spawn rate and speed both scale dynamically. Speed increases continuously at 0.06 units/second² until reaching the difficulty ceiling. Spawn interval compresses from 2.2 seconds down to 1.0 second as speed climbs.

---

## Difficulty Modes

| Mode | Initial Speed | Ceiling |
| :--- | :--- | :--- |
| Slow | 15 u/s | 27 u/s |
| Fast | 20 u/s | 32 u/s |
| Hard | 30 u/s | 42 u/s |

---

## Stack

| | |
| :--- | :--- |
| React 18 + TypeScript | Component model, state machine, type safety |
| Three.js | WebGL renderer, geometry, materials, lighting |
| React Three Fiber | Declarative Three.js in JSX |
| @react-three/drei | PerspectiveCamera helper |
| MediaPipe Tasks Vision | On-device hand landmark detection |
| Vite | Dev server and production build |

---

## Getting Started

**Requirements:** Node.js 16+, a connected webcam, a browser with hardware acceleration enabled.

```bash
git clone https://github.com/swarajshelke12/Gesture-Runner.git
cd Gesture-Runner
npm install
npm run dev
```

Open `http://localhost:3000`. Grant camera access when prompted. Raise your hand, point your index finger, and play.

---

## Playing

1. Grant camera access when the browser prompts.
2. Raise your hand and extend your index finger toward the camera.
3. Move your finger left or right to switch between the three lanes.
4. Lift your finger above the gold threshold line visible in the camera preview to jump.
5. Avoid barriers, spinning cubes, and obsidian walls. Score increases every time an obstacle clears past you.

The jump system requires you to lower your finger below the threshold before jumping again — holding up does not repeat the jump. A cooldown indicator appears at the top of the screen when jump is on cooldown.

---

## Troubleshooting

**Tracking feels slow or drifts** — Improve ambient lighting. Avoid backlighting (windows behind you). Keep your full hand visible and your index finger clearly extended.

**Low FPS** — Enable hardware acceleration in browser settings (`chrome://settings/system`). Close any application holding the GPU (video editors, other games). Reduce background tab count.

**Camera not detected** — Check that no other application (Zoom, Teams, OBS) has an exclusive lock on the webcam. Verify browser camera permissions at the site level, not just the OS level.

---

## Architecture

```
src/
  App.tsx          — Game state machine (MENU / PLAYING / GAME_OVER), score HUD,
                     jump cooldown display, roast commentary on death
  GameScene.tsx    — Three.js scene: character, obstacles, terrain, lighting,
                     collision detection, spawn logic, particle system
  VisionControl.tsx — MediaPipe initialization, webcam stream, per-frame
                     landmark inference, smoothing, gesture classification
  constants.ts     — Physics constants, lane dimensions, difficulty presets
```

State flows in one direction. `VisionControl` writes gesture output into a `useRef` in `App`. `App` passes that ref down to `GameScene`. The game loop reads it inside `useFrame` — no prop drilling, no re-renders from control input.

---

## Privacy

All hand tracking runs locally in the browser. No video frames, landmark data, or game telemetry are transmitted anywhere. The only external network calls are the initial fetch of the MediaPipe WASM binary and model weights from the jsdelivr CDN on first load.

---

## License

MIT
