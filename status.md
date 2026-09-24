# Project Briefing & System Status: Gesture Runner

> **Agent Notice**: Read this document first. It contains the complete architectural blueprint, module breakdown, state flow, and operational guidelines for this repository. Avoid scanning the entire codebase unless inspecting line-level logic. Keep this file updated whenever adding features or modifying architecture.

---

## 1. Project Overview
- **Name**: Gesture Runner
- **Description**: A high-performance 3D endless runner controlled entirely by webcam gestures. The player moves their index finger left/right to change lanes and raises it to jump over obstacles in a voxel/Minecraft-themed world.
- **Key Target**: 60 FPS WebGL rendering with real-time on-device machine learning (zero server latency or data upload).

---

## 2. Tech Stack & Dependencies
| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^18.2.0` | UI shell, state overlays, menu/game over screens |
| **3D Engine** | Three.js / R3F / Drei | `^0.153.0` / `^8.14.0` / `^9.88.0` | 3D scene, voxel meshes, shaders, camera, game loop |
| **Computer Vision** | MediaPipe Tasks-Vision | `^0.10.8` | Real-time on-device hand landmark detection (`HandLandmarker`) |
| **Bundler & Build** | Vite + TypeScript | `^5.0.0` / `^5.2.0` | Fast dev server, static bundling, type safety |
| **Styling** | TailwindCSS + Vanilla CSS | `^3.3.0` | Retro Minecraft aesthetic, responsive overlays |
| **Testing** | Vitest + Testing Library | `^4.0.18` | Unit testing constants and game logic |

---

## 3. High-Level Architecture & Data Flow

```text
[Webcam Stream]
      │
      ▼
[VisionControl.tsx] ──> MediaPipe HandLandmarker (GPU delegate, 1 hand)
      │                 Detects index finger tip: Landmark[8]
      │                 Applies 2-frame moving average (low latency + anti-jitter)
      │
      ▼
[useRef<ControlState>]  (Shared mutable reference: lane [-1, 0, 1], jump boolean)
      │
      ▼  (Zero React re-renders)
[GameScene.tsx] ──────> Reads controls inside `useFrame` (60 FPS loop)
                        ├── Player: Voxel Steve lerps to lane position & applies jump physics
                        ├── World: Procedurally UV-scrolled terrain + voxel scenery
                        ├── Obstacles: BARRIER, CYLINDER, CUBE, MEGA_WALL spawn & advance
                        ├── Collision: Per-frame 3D AABB bounding checks
                        └── Impact: GPU particle explosion on hit -> fires `onGameOver`
      │
      ▼
[App.tsx] ────────────> Manages overall GameState (`MENU`, `PLAYING`, `GAME_OVER`),
                        score, high scores, difficulty picker, and roast quotes.
```

---

## 4. File Structure & Responsibilities

```text
Gesture Runner/
├── src/
│   ├── App.tsx             # Root UI: HUD, score, death screens, sound/font injection, roast generator
│   ├── GameScene.tsx       # Core 3D engine: R3F Canvas, player physics, obstacle pooling, collisions, particles
│   ├── VisionControl.tsx   # MediaPipe pipeline: webcam feed, hand landmark tracking, debug coordinate HUD
│   ├── constants.ts        # Single source of truth: speeds, lane sizes, gravity, game states, difficulty multipliers
│   ├── constants.test.ts   # Unit tests for game balance variables and types
│   ├── main.tsx            # React DOM bootstrap
│   └── index.css           # Global resets and Tailwind directives
├── index.html              # HTML entrypoint
├── package.json            # Scripts and dependencies
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── status.md               # [THIS FILE] AI Agent project briefing and status
```

---

## 5. Key Constants & Mechanics (`src/constants.ts`)

- **Lanes**: 3 lanes (`-1`: Left, `0`: Center, `1`: Right) with width `LANE_WIDTH = 3.0`.
- **Speeds by Difficulty**:
  - `slow`: Initial `15.0 u/s`
  - `fast`: Initial `20.0 u/s`
  - `ultrafast`: Initial `30.0 u/s`
  - Speed scales dynamically during play (`PLAYER_SPEED_MAX = 35.0`).
- **Physics**:
  - `GRAVITY = 40.0`, `JUMP_FORCE = 18.0` (in `GameScene.tsx`).
  - Jump cooldown = `0.5s` to prevent accidental multi-jumps.
  - Edge-triggered jumping: finger must transition from below to above detection threshold.
- **Obstacle Types**:
  - `BARRIER`: TNT blocks with lava bar and dynamic light.
  - `CYLINDER`: Spinning cobblestone cluster.
  - `CUBE`: Bobbing Creeper face with yaw rotation.
  - `MEGA_WALL`: Obsidian columns with pulsating purple emissive barrier.

---

## 6. Critical Rules for AI Agents Working on this Codebase

1. **Zero State Updates in Game Loop**:
   - NEVER pipe continuous vision data (X/Y coordinates or frame ticks) through React `useState`.
   - ALWAYS use `React.MutableRefObject<ControlState>` so the Three.js `useFrame` loop reads values directly without causing React component re-renders.
2. **Material & Geometry Reuse**:
   - In `GameScene.tsx`, materials are created once at file scope (e.g. `steveSkinMat`, `obsidianMat`). Do NOT instantiate new `THREE.Material` or `THREE.Geometry` instances inside render loops or frame callbacks to avoid severe memory leaks.
3. **MediaPipe Asset Loading**:
   - MediaPipe WASM and model files are fetched asynchronously via Google/CDN URLs (`FilesetResolver.forVisionTasks`). Respect GPU delegate fallbacks.
4. **Build Verification**:
   - Verify every change with `npm run build` (`tsc && vite build`) and `npm test` before declaring completion.

---

## 7. Developer & Agent Commands

```bash
npm run dev      # Start Vite local development server (http://localhost:5173 or 3000)
npm run build    # Compile TypeScript and build production bundle into dist/
npm run preview  # Serve production build locally
npm test         # Run unit tests via Vitest
```

---

## 8. Current System Status
- **Build Status**: Passing cleanly (`tsc && vite build` exits 0).
- **Git Status**: Clean working tree on `main`.
- **Known Notes**: Rollup logs a standard warning for single bundle size (`> 500 kB`) due to bundled Three.js + MediaPipe libraries. This is expected for this single-page game.
