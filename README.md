<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Exploding%20Head.png" alt="Exploding Head" width="100" />
  <h1>
    <span style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57); background-size: 300% 300%; animation: gradient 3s ease infinite; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
      🏃‍♂️ GESTURE RUNNER 🏃‍♂️
    </span>
  </h1>
  <p><strong style="color: #ff6b6b; font-size: 1.2em;">The 3D browser game you play with your finger.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/ThreeJs-black?style=for-the-badge&logo=three.js&logoColor=white" alt="ThreeJS" />
    <img src="https://img.shields.io/badge/MediaPipe-00B4A8?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

<style>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>

---

> ⚠️ **WARNING:** This game might cause you to aggressively wave at your monitor in public spaces. Play at your own risk. ⚠️

<span style="color:#ff9a9e">Welcome to **Gesture Runner**, next-gen browser experience that turns your webcam into a controller. Say goodbye to your keyboard and mouse! You control this Minecraft-inspired 3D runner by moving your **index finger** in real life. It's fast ☄️, it's frantic 🚀, and if you lose, the game *will* verbally abuse you. 💢</span>

## ✨ Why this is illegally good

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 10px; color: white;">

*   🖐️ **Jedi-Level Hand Tracking:** <span style="color:#00ff88">Powered by Google's AI (MediaPipe)</span>, we track 21 landmarks on your hand at lightspeed. You move, the character moves. 
*   🚀 **Buttery Smooth 60FPS 3D:** <span style="color:#ffd700">Crafted with React Three Fiber (`@react-three/fiber`)</span>, delivering glorious WebGL graphics right in your browser without breaking a sweat.
*   🎤 **The Savage Roast Engine™:** <span style="color:#ff6b6b">Die in the game? Get ready to be emotionally destroyed.</span> We built an array of custom, savage insults in retro fonts to make sure you know exactly how bad you are.
*   🧱 **Voxel Aesthetics:** <span style="color:#4ecdc4">Procedural running animations, dynamic lighting, endless world generation</span>, and a UI straight out of your favorite blocky nostalgia trip.
*   ⚡ **Zero Setup, Infinite Adrenaline:** <span style="color:#feca57">No downloads. No plugins.</span> Open the link, allow your camera, and start sweating.

</div>

<hr style="border: 0; height: 3px; background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #feca57); border-radius: 10px; margin: 20px 0;">

<div style="background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 15px; color: white; margin: 20px 0;">

## 🎮 How to Play (Without looking crazy)

<div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">

1.  **👁️ Give it Eyes**: Allow Camera access when the browser asks. (We don't record you, promise).
2.  **✋ The Magic Finger**: Point your **INDEX FINGER** ☝️ directly at the camera.
3.  **↔️ Swerve**: Move your finger **Left / Right** to seamlessly switch between the 3 lanes.
4.  **⬆️ Leap of Faith**: Move your finger **UP** past the invisible threshold to JUMP over obstacles.
5.  **🏃‍♂️ Survive**: Dodge the spinning cylinders, floating cubes, and barriers. The longer you survive, the faster it gets!

</div>
</div>

---

## 🛠️ The Tech Stack (Under the hood)

We threw the kitchen sink at this to make it blazingly fast and incredibly fun:

<table style="width:100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <th colspan="2" style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 15px; border-radius: 10px 10px 0 0;">Tech Stack</th>
  </tr>
  <tr>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef; font-weight: bold; color: #667eea;">🟦 React 18 & TS</td>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef;">The mastermind. Manages state, the HUD, and the Roast Engine.</td>
  </tr>
  <tr>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef; font-weight: bold; color: #ff6b6b;">🎮 Three.js & R3F</td>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef;">Renders the beautiful 3D world, handles lighting, and runs the 60fps game loop.</td>
  </tr>
  <tr>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef; font-weight: bold; color: #4ecdc4;">👁️ MediaPipe Vision</td>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef;">The AI eye. Turns your webcam feed into mathematical coordinates we can use to steer.</td>
  </tr>
  <tr>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef; font-weight: bold; color: #feca57;">💅 Tailwind CSS</td>
    <td style="background: #f8f9fa; padding: 12px; border-bottom: 2px solid #e9ecef;">Styles the sleek, responsive UI overlays so they look good on any screen.</td>
  </tr>
  <tr>
    <td style="background: #f8f9fa; padding: 12px; font-weight: bold; color: #764ba2;">⚡ Vite</td>
    <td style="background: #f8f9fa; padding: 12px;">The ridiculously fast build tool that bundles this masterpiece.</td>
  </tr>
</table>

---

## 🚀 Installation (Takes literally 12 seconds)

Got Node.js installed? Good. Let's ride.

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/swarajshelke12/Gesture-Runner.git
cd gesture-runner

# 2. Install the magic dependencies
npm install

# 3. Start the V8 engine
npm run dev
```

Boom! Open `http://localhost:3000` and start dodging.

---

## 🧠 Brain Cells Inside (Architecture)

For the nerds who want to know how it works:

*   `src/visioncontrol.tsx` **(The AI Eye):** Mirrors your webcam, isolates *Landmark 8* (your index finger tip), and calculates lane-switching math and jump thresholds in real-time.
*   `src/gamescene.tsx` **(The Matrix):** The heaviest file. Runs `useFrame` at 60FPS. Handles procedural animations using `Math.sin()`, endless floor scrolling (`mat.map.offset.y -= speed`), and custom AABB collision detection.
*   `src/App.tsx` **(The Maestro):** Sits on top of the 3D canvas, routing the vision data to the game via `useRef` to prevent React from unnecessarily re-rendering and lagging the game.
*   `src/constants.ts` **(The Rulebook):** Gravity, speeds, lane widths. Tweak these to make the game literally impossible.

---

## 🔥 Troubleshooting (When things go wrong)

*   **"My hand isn't tracking!"** 👉 Turn on some lights, Dracula. The AI needs to see your hand clearly.
*   **"It's lagging!"** 👉 Turn on Hardware Acceleration in your browser settings. Close your 147 open tabs.
*   **"Camera blocked"** 👉 Check your browser URL bar for the little blocked camera icon. Make sure Zoom or Discord isn't hoarding your webcam!

---

## 🤝 Contributing

Want to add an 8-bit background track? Better skins? Even meaner roasts? 
We love crazy ideas. Fork it, mod it, and send a PR.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. Do whatever you want with it, just don't blame us if you accidentally punch your monitor while playing. 🎮✨
