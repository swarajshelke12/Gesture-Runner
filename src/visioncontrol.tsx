import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { ControlState } from '../constants';

interface VisionControlsProps {
  onUpdateControls: (controls: ControlState) => void;
  isActive: boolean;
}

export const VisionControls: React.FC<VisionControlsProps> = ({ onUpdateControls, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastLaneRef = useRef<-1 | 0 | 1>(0);

  const recentX = useRef<number[]>([]);
  const recentY = useRef<number[]>([]);
  const SMOOTH_FRAMES = 2; // reduced — less lag, more responsive

  const CANVAS_W = 320;
  const CANVAS_H = 240;

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLoading(false);
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };
    initMediaPipe();
    return () => { handLandmarkerRef.current?.close(); };
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => setPermissionGranted(true));
      } catch (err) {
        console.error("Camera permission error:", err);
      }
    };
    if (!loading) setupCamera();
  }, [loading]);

  useEffect(() => {
    if (!permissionGranted || !isActive) return;

    const processFrame = () => {
      if (videoRef.current && handLandmarkerRef.current && canvasRef.current) {
        const startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoRef.current.currentTime;
          const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
          const ctx = canvasRef.current.getContext('2d');

          if (ctx) {
            const w = CANVAS_W;
            const h = CANVAS_H;
            ctx.clearRect(0, 0, w, h);

            // Mirrored guides
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-w, 0);

            // Lane dividers — white dashed
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 5]);
            ctx.beginPath();
            ctx.moveTo(w * 0.33, 0); ctx.lineTo(w * 0.33, h);
            ctx.moveTo(w * 0.66, 0); ctx.lineTo(w * 0.66, h);
            ctx.stroke();
            ctx.setLineDash([]);

            // Jump line — gold
            const jumpY = h * 0.38;
            ctx.beginPath();
            ctx.moveTo(0, jumpY); ctx.lineTo(w, jumpY);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFD700';
            ctx.stroke();

            ctx.restore();

            // Labels
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 11px monospace';
            ctx.fillText("▲ JUMP", 8, jumpY - 5);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '10px monospace';
            ctx.fillText("▼ LOWER", 8, jumpY + 15);

            // Lane labels at bottom
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = 'bold 10px monospace';
            ctx.fillText("L", 12, h - 8);
            ctx.fillText("C", w / 2 - 5, h - 8);
            ctx.fillText("R", w - 18, h - 8);

            // ── Tracking ──
            let dotX = w / 2;
            let dotY = h / 2;
            let dotColor = 'rgba(255,255,255,0.2)';
            let dotSize = 6;
            let isTracking = false;

            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              const fingerTip = landmarks[8];

              // Always push latest position immediately
              recentX.current.push(fingerTip.x);
              recentY.current.push(fingerTip.y);
              if (recentX.current.length > SMOOTH_FRAMES) recentX.current.shift();
              if (recentY.current.length > SMOOTH_FRAMES) recentY.current.shift();

              const avgX = recentX.current.reduce((a, b) => a + b, 0) / recentX.current.length;
              const avgY = recentY.current.reduce((a, b) => a + b, 0) / recentY.current.length;

              // Ball ALWAYS follows finger — no center lock
              dotX = (1 - avgX) * w;
              dotY = avgY * h;
              dotColor = avgY < 0.38 ? '#FFD700' : '#00ff88';
              dotSize = 15;
              isTracking = true;

              let lane: -1 | 0 | 1 = 0;
              if (avgX < 0.33) lane = 1;
              else if (avgX > 0.66) lane = -1;
              else lane = 0;

              lastLaneRef.current = lane;
              // Store last known dot position so it STAYS on finger when tracking drops
              onUpdateControls({ lane, jump: avgY < 0.38 });
            } else {
              recentX.current = [];
              recentY.current = [];
              onUpdateControls({ lane: lastLaneRef.current, jump: false });
            }

            // Glow
            ctx.shadowColor = dotColor;
            ctx.shadowBlur = isTracking ? 22 : 6;

            // Ball
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotSize, 0, 2 * Math.PI);
            ctx.fillStyle = dotColor;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            if (isTracking) {
              // Pulse ring
              const pulse = dotSize + 5 + Math.sin(performance.now() * 0.007) * 3;
              ctx.beginPath();
              ctx.arc(dotX, dotY, pulse, 0, 2 * Math.PI);
              ctx.strokeStyle = 'rgba(255,255,255,0.3)';
              ctx.lineWidth = 2;
              ctx.shadowBlur = 0;
              ctx.stroke();

              // Crosshair
              ctx.beginPath();
              ctx.moveTo(dotX - dotSize - 8, dotY); ctx.lineTo(dotX + dotSize + 8, dotY);
              ctx.moveTo(dotX, dotY - dotSize - 8); ctx.lineTo(dotX, dotY + dotSize + 8);
              ctx.strokeStyle = 'rgba(255,255,255,0.55)';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
            ctx.shadowBlur = 0;
          }
        }
      }
      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isActive, permissionGranted, onUpdateControls]);

  return (
    // Properly sized — big enough to see clearly, Minecraft styled border
    <div style={{
      position: 'absolute',
      top: 'clamp(10px, 2vw, 16px)',
      right: 'clamp(10px, 2vw, 16px)',
      // Mobile: ~140x105px, Tablet: ~200x150px, Desktop: ~280x210px
      width: 'clamp(140px, 22vw, 280px)',
      height: 'clamp(105px, 16.5vw, 210px)',
      zIndex: 50,
      background: 'rgba(0,0,0,0.75)',
      border: '3px solid #555',
      outline: '3px solid #000',
      overflow: 'hidden',
    }}>
      {/* Video feed */}
      <video ref={videoRef} autoPlay playsInline style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)',
        opacity: 0.35,
      }} />

      {/* Canvas overlay */}
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
      }} />

      {/* Minecraft-style label at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.7)',
        padding: '3px 6px',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 'clamp(6px, 1.5vw, 8px)',
        color: '#FFD700',
        letterSpacing: '1px',
        textAlign: 'center',
        borderBottom: '2px solid #555',
      }}>
        👁 GESTURE CAM
      </div>

      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: '10px', color: '#aaa',
        }}>
          Loading...
        </div>
      )}
      {!loading && !permissionGranted && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          fontFamily: 'monospace', fontSize: '10px', color: '#fff', padding: '8px',
        }}>
          Allow Camera
        </div>
      )}
    </div>
  );
};