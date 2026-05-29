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
