import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameScene } from './GameScene';
import { VisionControls } from './visioncontrol';
import { GameState, Difficulty } from './constants';
import { RotateCcw } from 'lucide-react';

// Inject Minecraft font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const ROASTS = [
  `Score {score}? That's not a score. That's your bank balance !!.`,
  `{score} points.? That's the number of people who hate You, Maybe more!!.`,
  `Score {score}.? That's not the score. That's More than your IQ !!.`,
  `{score} points.? Your WiFi has more bars than you have braincells!!.`,
  `Score {score}.? That score is more than your number of friends!!.`,
  `{score} points.? You were woundering why they avoid you? This is why!!.`,
  `Score {score}.? My lil sister is better than you at this, SHE'S  Just 4!!.`,
  `{score} points.? That's The number of People find you ugly, probably more!!.`,
  `Score {score}.? That's more than your average in school, study LIL IDIOT!!.`,
  `{score} points.? A new born snail can play better than YOU, Thought of Giving up?.`,
];

function getRoast(score: number): string {
  return ROASTS[Math.floor(Math.random() * ROASTS.length)].replace('{score}', String(score));
}

const mc: React.CSSProperties = { fontFamily: "'Press Start 2P', monospace" };

// Minecraft block button
const MCButton = ({ onClick, children, bg = '#4a7c2f', color = '#fff' }: {
  onClick: () => void; children: React.ReactNode; bg?: string; color?: string;
}) => (
  <button onClick={onClick} style={{
    ...mc,
    fontSize: 'clamp(9px, 2.5vw, 12px)',
    color,
    background: bg,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    padding: 'clamp(12px, 3vw, 18px)',
    letterSpacing: '1px',
    lineHeight: 1.6,
    boxShadow: 'inset -3px -4px 0px rgba(0,0,0,0.35), inset 3px 3px 0px rgba(255,255,255,0.2)',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  }}
    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
    onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
  >
    {children}
  </button>
);

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>('fast');
  const [score, setScore] = useState(0);
  const [jumpCooldownTime, setJumpCooldownTime] = useState(0);
  const [commentary, setCommentary] = useState('');
  const controlsRef = useRef({ lane: 0, jump: false });

  const handleUpdateControls = useCallback((c: { lane: number; jump: boolean }) => {
    controlsRef.current = c;
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
    setCommentary(getRoast(score));
  }, [score]);

  const handleScoreUpdate = useCallback((s: number) => setScore(s), []);
  const handleJumpCooldownUpdate = useCallback((c: number) => setJumpCooldownTime(c), []);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameState(GameState.PLAYING);
    setCommentary('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      width: '100%', height: '100%',
      overflow: 'hidden',
      background: '#5ba3d9',
      // Prevent text selection and double-tap zoom on mobile
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
    }}>

      {/* 3D Canvas — fills screen */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Canvas
          shadows
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <GameScene
            gameState={gameState}
            difficulty={difficulty}
            controls={controlsRef}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onJumpCooldownUpdate={handleJumpCooldownUpdate}
          />
        </Canvas>
      </div>

      {/* Vision Cam — smaller on mobile */}
      <VisionControls onUpdateControls={handleUpdateControls} isActive={true} />

      {/* Score HUD — bottom left, mobile friendly size */}
      {gameState === GameState.PLAYING && (
        <div style={{
          position: 'absolute',
          bottom: 'clamp(10px, 3vw, 20px)',
          left: 'clamp(10px, 3vw, 20px)',
          zIndex: 20,
          background: 'rgba(0,0,0,0.75)',
          border: '3px solid #555',
          outline: '2px solid #000',
          padding: 'clamp(6px, 2vw, 12px) clamp(10px, 3vw, 18px)',
        }}>
          <div style={{ ...mc, fontSize: 'clamp(7px, 1.8vw, 10px)', color: '#aaa', marginBottom: '4px' }}>
            SCORE
          </div>
          <div style={{ ...mc, fontSize: 'clamp(14px, 4vw, 22px)', color: '#ffff' }}>
            {String(score).padStart(6, '0')}
          </div>
        </div>
      )}

      {/* Jump cooldown — top center */}
      {gameState === GameState.PLAYING && jumpCooldownTime > 0 && (
        <div style={{
          position: 'absolute',
          top: 'clamp(8px, 2vw, 14px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(0,0,0,0.8)',
          border: '2px solid #f5f5f5',
          outline: '2px solid #000',
          padding: '5px 12px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ ...mc, fontSize: 'clamp(7px, 1.8vw, 10px)', color: '#ff6622' }}>
            JUMP {jumpCooldownTime.toFixed(1)}s
          </span>
        </div>
      )}

      {/* Menu & Game Over overlay */}
      {gameState !== GameState.PLAYING && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.78)',
          padding: '16px',
        }}>

          {/* MENU */}
          {gameState === GameState.MENU && (
            <div style={{
              background: '#1a1a1a',
              border: '3px solid #555',
              outline: '3px solid #000',
              padding: 'clamp(16px, 4vw, 28px)',
              width: '100%',
              maxWidth: '420px',
            }}>
              {/* Grass bar */}
              <div style={{
                height: 'clamp(8px, 2vw, 14px)', marginBottom: 'clamp(14px, 3vw, 22px)',
                background: 'repeating-linear-gradient(90deg, #4a7c2f 0px, #4a7c2f 14px, #2d5a1b 14px, #2d5a1b 28px)',
                border: '2px solid #000',
              }} />

              <div style={{ ...mc, fontSize: 'clamp(10px, 3vw, 16px)', color: '#fff', textAlign: 'center', marginBottom: '6px', lineHeight: 1.8 }}>
                GESTURE RUNNER
              </div>
              <div style={{ ...mc, fontSize: 'clamp(6px, 1.5vw, 9px)', color: '#888', textAlign: 'center', marginBottom: 'clamp(14px, 3vw, 22px)', lineHeight: 2 }}>
                FINGER CONTROL EDITION
              </div>

              {/* Dirt bar */}
              <div style={{
                height: '8px', marginBottom: 'clamp(10px, 2.5vw, 18px)',
                background: 'repeating-linear-gradient(90deg, #8B4513 0px, #8B4513 8px, #6b3410 8px, #6b3410 16px)',
                border: '1px solid #000',
              }} />

              <div style={{ ...mc, fontSize: 'clamp(6px, 1.5vw, 9px)', color: '#888', textAlign: 'center', marginBottom: 'clamp(10px, 2.5vw, 16px)' }}>
                SELECT DIFFICULTY
              </div>

              <div style={{ display: 'flex', gap: 'clamp(6px, 2vw, 10px)', marginBottom: 'clamp(14px, 3vw, 22px)' }}>
                <MCButton onClick={() => startGame('slow')} bg="#1d4ed8">🐢 SLOW</MCButton>
                <MCButton onClick={() => startGame('fast')} bg="#15803d">⚡ FAST</MCButton>
                <MCButton onClick={() => startGame('ultrafast')} bg="#991b1b">💀 HARD</MCButton>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.4)', border: '2px solid #333',
                padding: 'clamp(8px, 2vw, 14px)',
              }}>
                {[
                  '👆 FINGER LEFT/RIGHT = LANE',
                  '⬆️ FINGER UP = JUMP',
                  '💀 SURVIVE AS LONG AS POSSIBLE',
                ].map((t, i) => (
                  <div key={i} style={{ ...mc, fontSize: 'clamp(5px, 1.4vw, 8px)', color: '#777', marginBottom: 'clamp(5px, 1.5vw, 9px)', lineHeight: 2 }}>
                    {t}
                  </div>
                ))}
              </div>

              <div style={{
                height: 'clamp(8px, 2vw, 14px)', marginTop: 'clamp(14px, 3vw, 22px)',
                background: 'repeating-linear-gradient(90deg, #4a7c2f 0px, #4a7c2f 14px, #2d5a1b 14px, #2d5a1b 28px)',
                border: '2px solid #000',
              }} />
            </div>
          )}

          {/* GAME OVER */}
          {gameState === GameState.GAME_OVER && (
            <div style={{
              background: '#1a0a0a',
              border: '3px solid #7f1d1d',
              outline: '3px solid #000',
              padding: 'clamp(16px, 4vw, 28px)',
              width: '100%',
              maxWidth: '420px',
            }}>
              {/* Red bar */}
              <div style={{
                height: 'clamp(8px, 2vw, 14px)', marginBottom: 'clamp(14px, 3vw, 22px)',
                background: 'repeating-linear-gradient(90deg, #7f1d1d 0px, #7f1d1d 14px, #450a0a 14px, #450a0a 28px)',
                border: '2px solid #000',
              }} />

              <div style={{ ...mc, fontSize: 'clamp(16px, 5vw, 28px)', color: '#ef4444', textAlign: 'center', marginBottom: '6px', lineHeight: 1.4 }}>
                YOU DIED!
              </div>

              <div style={{ textAlign: 'center', marginBottom: 'clamp(12px, 3vw, 20px)' }}>
                <div style={{ ...mc, fontSize: 'clamp(6px, 1.5vw, 9px)', color: '#888', marginBottom: '6px' }}>SCORE</div>
                <div style={{ ...mc, fontSize: 'clamp(20px, 6vw, 34px)', color: '#FFD700' }}>
                  {String(score).padStart(6, '0')}
                </div>
              </div>

              {/* Roast */}
              {commentary && (
                <div style={{
                  background: 'rgba(127,29,29,0.3)',
                  border: '2px solid #7f1d1d',
                  outline: '1px solid #000',
                  padding: 'clamp(8px, 2vw, 14px)',
                  marginBottom: 'clamp(12px, 3vw, 20px)',
                  textAlign: 'center',
                }}>
                  <div style={{ ...mc, fontSize: 'clamp(6px, 1.4vw, 8px)', color: '#ef4444', marginBottom: '8px' }}>
                    ☠ GAME MASTER SAYS ☠
                  </div>
                  <div style={{ ...mc, fontSize: 'clamp(7px, 1.8vw, 10px)', color: '#fca5a5', lineHeight: 2.2 }}>
                    {commentary}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 2vw, 10px)' }}>
                <MCButton onClick={() => startGame(difficulty)} bg="#15803d">↩ RESPAWN</MCButton>
                <MCButton onClick={() => setGameState(GameState.MENU)} bg="#374151">⬅ MAIN MENU</MCButton>
              </div>

              <div style={{
                height: 'clamp(8px, 2vw, 14px)', marginTop: 'clamp(14px, 3vw, 22px)',
                background: 'repeating-linear-gradient(90deg, #7f1d1d 0px, #7f1d1d 14px, #450a0a 14px, #450a0a 28px)',
                border: '2px solid #000',
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}