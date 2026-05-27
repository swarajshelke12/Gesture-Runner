# Gesture Runner

A 3D browser-based endless runner game controlled via real-time hand gestures. The project integrates machine-learning-based hand tracking with a 3D graphics rendering engine to deliver an interactive web-based gaming experience.

---

## Features

- **Hand Gesture Control**: Real-time hand landmark tracking using Google MediaPipe. Players steer and jump using physical hand movements captured by their webcam.
- **High-Performance 3D Rendering**: Built with Three.js and React Three Fiber to maintain a 60 FPS rendering loop with dynamic lighting, shadows, and voxel-style structures.
- **Procedural Animations**: Real-time sinusoidal animation cycles for character movement, running, and jumping physics.
- **Endless World Generation**: Side scenery, terrain, obstacles, and cloud formations scroll procedurally to simulate endless forward momentum.
- **Adaptive Difficulty**: Game physics, obstacle spawn frequency, and base speeds scale up dynamically as the player's score increases.
- **Custom Feedback System**: Features custom retro-style UI screens and dynamically selected, humorous commentary upon game termination.

---

## How to Play

1. **Camera Permissions**: Grant the browser camera access when prompted. (All processing is done locally on the client; no data is uploaded).
2. **Gesture Setup**: Raise your hand and point your index finger at the camera.
3. **Horizontal Movement**: Move your index finger left or right to switch the runner between the three lanes.
4. **Jumping**: Lift your index finger above the vertical threshold line (displayed on the camera preview) to jump over barriers.
5. **Objective**: Avoid obstacles (barriers, spiked cylinders, and floating cubes) to accumulate score points.

---

## Tech Stack

| Dependency | Purpose |
| :--- | :--- |
| **React 18 & TypeScript** | Component structure, global state management, and type safety. |
| **Three.js** | Low-level WebGL graphics engine, lighting, material setups, and geometry rendering. |
| **React Three Fiber (R3F)** | React wrapper for Three.js declarative component bindings. |
| **@react-three/drei** | Auxiliary 3D helpers, including environment setups and camera utilities. |
| **MediaPipe Tasks Vision** | Client-side computer vision API for real-time hand landmarks tracking. |
| **Tailwind CSS** | Stylesheets for responsive 2D menus, HUD, and overlays. |
| **Vite** | Frontend build tool and development server. |

---

## Project Architecture

- `src/App.tsx`: Manages top-level game state machine (Menu, Playing, Game Over), UI overlay screens, and routes real-time telemetry from the camera to the 3D canvas using references (`useRef`) to avoid frame-rate drops.
- `src/VisionControl.tsx`: Initializes the webcam, manages the MediaPipe hand-landmarker task loop, handles canvas mirroring, applies index-finger smoothing, and evaluates gesture coordinate thresholds.
- `src/GameScene.tsx`: Implements the 3D viewport, lighting setups, environment scenery, endless road scrolling mechanics, procedural voxel character structure, obstacle spawning queues, and Axis-Aligned Bounding Box (AABB) collision checks.
- `src/constants.ts`: Contains constant physics values, lane widths, gravity models, and difficulty scaling multipliers.

---

## Installation and Setup

### Prerequisites
- Node.js (v16.0.0 or higher)
- A connected webcam

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/swarajshelke12/Gesture-Runner.git
   cd Gesture-Runner
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## Troubleshooting

- **Hand Tracking Latency / Inaccuracy**: Ensure your environment is adequately lit. Avoid highly reflective backgrounds, and keep your hand fully within the camera's field of view.
- **Low Frame Rate (FPS)**: Verify that Hardware Acceleration is enabled in your browser settings. Close background applications to free up GPU resources.
- **Camera Access Issues**: Check your browser permissions panel to ensure camera access is allowed for this origin. Close other applications (e.g., Zoom, Teams, Discord) that might be using the webcam.

---

## Contributing

Contributions are welcome. Please follow these steps to propose changes:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m 'Add detailed description of changes'`.
4. Push to your branch: `git push origin feature/your-feature-name`.
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.
