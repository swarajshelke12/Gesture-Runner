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
