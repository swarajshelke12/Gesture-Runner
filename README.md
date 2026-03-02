# Time Pass Game - 3D Running Adventure

A fun 3D running game built with React, Three.js, and MediaPipe hand gesture recognition!

## Features

- 🤖 3D animated robot character that runs along lanes
- 👆 Hand gesture control using MediaPipe
- 🎮 Dodge obstacles (barriers, spinning cylinders, floating cubes)
- 🚀 Dynamic difficulty that increases as you play
- ✨ Beautiful 3D graphics with lighting and effects
- 📱 Camera-based hand tracking for intuitive controls

## Controls

- **Move Finger Left/Right**: Switch between lanes
- **Move Finger Up**: Jump to avoid obstacles
- **Camera**: Required for hand gesture recognition

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Webcam for hand gesture tracking

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`
   - Allow camera permission when prompted
   - Point your finger to start playing!

### Build for Production

```bash
npm run build
```

The optimized production build will be created in the `dist` folder.

## How to Play

1. Start the game from the main menu
2. Allow camera access
3. Point your index finger at the camera
4. Move your finger left or right to move between lanes
5. Move your finger upward to jump over obstacles
6. Avoid barriers, spinning cylinders, and floating cubes
7. The game gets faster as you earn points
8. Reach the highest score possible!

## File Structure

```
├── src/
│   ├── components/
│   │   ├── gamescene.tsx      # 3D game scene and physics
│   │   └── visioncontrol.tsx  # Hand gesture detection
│   ├── App.tsx                # Main app component
│   ├── constants.ts           # Game constants
│   └── index.css              # Global styles
├── main.tsx                   # Entry point
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Dependencies
```

## Technologies Used

- **React 18** - UI framework
- **Three.js** - 3D graphics
- **React Three Fiber** - React wrapper for Three.js
- **React Three Drei** - Useful helpers for 3D
- **MediaPipe** - Hand gesture recognition
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Game Mechanics

### Obstacles
- **Barrier**: Red energy field - must jump over it
- **Spiked Cylinder**: Spinning spikes - can be jumped over if timed right
- **Floating Cube**: Purple glowing cube - must dodge or jump high

### Physics
- Gravity affects jump height
- Lane switching is smooth with lerp interpolation
- Collision detection based on obstacle type
- Progressive difficulty increase

### Scoring
- +10 points for each obstacle avoided
- Score increases continuously during gameplay

## Troubleshooting

### Camera not working
- Check browser camera permissions
- Ensure you have a webcam connected
- Try a different browser if issues persist

### Low FPS / Lag
- Reduce graphics quality in your browser settings
- Check GPU usage in your system
- Close other applications

### Hand not detected
- Ensure adequate lighting in your environment
- Point finger at camera clearly
- Move your finger slowly and deliberately
- Keep hand in frame

## Future Enhancements

- [ ] Multiplayer support
- [ ] Power-ups and special abilities
- [ ] Different game modes
- [ ] Mobile support
- [ ] Sound effects and music
- [ ] Leaderboards
- [ ] Different robot skins

## License

MIT License - feel free to use this game as you wish!

## Contributing

Found a bug or want to improve the game? Feel free to fork and submit pull requests!

---

**Enjoy the game and have fun dodging obstacles!** 🎮✨
