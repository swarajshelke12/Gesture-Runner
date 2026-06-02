# Gesture Runner Beginner's Guide

![Gesture Runner](https://img.shields.io/badge/Level-Beginner-green?style=for-the-badge)

Welcome to Gesture Runner! This guide will help you master the game step by step, from setup to advanced techniques.

## Table of Contents
- [Getting Started](#getting-started)
- [Game Controls](#game-controls)
- [Gameplay Tips](#gameplay-tips)
- [Difficulty Levels](#difficulty-levels)
- [Troubleshooting](#troubleshooting)
- [Practice Drills](#practice-drills)
- [Advanced Techniques](#advanced-techniques)

---

## Getting Started

### System Requirements
✅ **Camera**: Any webcam (built-in or external)  
✅ **Browser**: Chrome, Edge, or Firefox with hardware acceleration enabled  
✅ **Lighting**: Good, even lighting (avoid backlighting)  
✅ **Space**: At least 2 feet from the camera for optimal tracking 📸

### Step-by-Step Setup 🚀

1. **Launch the Game** ▶️
   ```bash
   # Clone the repository if you haven't already
   git clone https://github.com/swarajshelke12/Gesture-Runner.git
   cd Gesture-Runner
   npm install
   npm run dev
   ```

2. **Grant Camera Permissions** 📷
   - Click "Allow" when prompted by your browser
   - Make sure camera access is enabled at the site level

3. **Position Your Hand** 🖐️
   - Sit 2-3 feet from the camera
   - Keep your whole hand visible
   - Rest your elbow on a surface for stability

---

## Game Controls

### Basic Movement

| Gesture | Action | Tips |
|---------|--------|------|
| **Move Left** | Shift finger to left side | Smooth, steady motion |
| **Move Right** | Shift finger to right side | Don't jerk your hand |
| **Jump** | Raise finger above gold line | Hold for 0.5 seconds |
| **Reset** | Lower finger below gold line | Wait for cooldown |

### Control Mechanics

🎯 **Lane Switching**
- 3 lanes: Left, Center, Right
- Smooth movements work better than quick jerks
- Plan your moves 1-2 blocks ahead
- Practice switching between adjacent lanes first

🏃‍♂️ **Jumping**
- Jump only when needed (saves energy)
- Timing is more important than height
- Wait for the cooldown period between jumps
- The gold line is at 38% from the top of preview

---

## Gameplay Tips

### Beginner Strategy

1. **Start Slow**
   - Choose "Slow" difficulty mode
   - Focus on staying alive rather than scoring
   - Get comfortable with the controls

2. **Obstacle Patterns**
   - TNT blocks appear in all lanes
   - Spinners alternate between lanes
   - Cubes float up and down
   - Mega walls are stationary but wide

3. **Score System**
   - +10 points per obstacle passed
   - +1 point for each second survived
   - Difficulty increases your score multiplier

### Visual Cues

🟡 **Gold Line** - Jump threshold  
🔴 **Red Dots** - Lane indicators  
💫 **Particles** - Collision effects  
🏃 **Character** - Your voxel avatar  

---

## Difficulty Levels

| Mode | Speed | Best For |
|------|-------|----------|
| **Slow** | 15-27 u/s | Learning controls, kids |
| **Fast** | 20-32 u/s | Recommended for most players |
| **Hard** | 30-42 u/s | Expert players, challenge seekers |

### Choosing Your Difficulty

🟢 **Beginners**: Start with Slow until you score 100+  
🟡 **Intermediate**: Try Fast when comfortable with controls  
🔴 **Advanced**: Hard mode for maximum challenge  

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Hand not detected** | Improve lighting, ensure full hand visible |
| **Drifting movement** | Keep hand steady, avoid jerky motions |
| **Jump not registering** | Hold finger above line for 0.5 seconds |
| **Low FPS** | Close other apps, enable hardware acceleration |
| **Camera blocked** | Close Zoom/Teams/OBS, check permissions |

---

## Practice Drills

### Drill 1: Lane Switching
1. Practice switching between left and center lanes
2. Count to 3 between switches
3. Aim for 10 consecutive successful switches

### Drill 2: Timing Jumps
1. Place an obstacle 2 blocks ahead
2. Wait until it's 1 block away
3. Jump and land successfully
4. Repeat 5 times

### Drill 3: Combo Moves
1. Switch lane while jumping
2. Practice on slow mode first
3. Build up to complex sequences

---

## Advanced Techniques

### Pro Tips

🔄 **Smooth Transitions**
- Use flowing motions between lanes
- Anticipate upcoming obstacles
- Keep your finger moving forward

⏱️ **Energy Management**
- Don't jump unnecessarily
- Use lane switching to avoid obstacles
- Save jumps when you can't dodge

🎯 **Precision Control**
- Small movements change lanes effectively
- Don't overextend your arm
- Find a comfortable position and stick to it

### Common Mistakes to Avoid

❌ **Panic Movements**: Quick, jerky gestures cause missed inputs  
❌ **Holding Jump**: Continuous high position doesn't work  
❌ **Poor Lighting**: Backlighting confuses the camera  
❌ **Wrong Distance**: Too close or far reduces tracking accuracy  

---

## Resources

- **Official Repo**: [GitHub - Gesture Runner](https://github.com/swarajshelke12/Gesture-Runner)
- **API Documentation**: [MediaPipe Hand Tracking](https://mediapipe.dev/)
- **Browser Support**: [Chrome, Edge, Firefox]

---

Happy Gaming! 🎮

> Remember: Practice makes perfect. Start slow, focus on control, and gradually increase your speed as you improve!