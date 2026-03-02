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

  // Initialize MediaPipe
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

    return () => {
      handLandmarkerRef.current?.close();
    };
  }, []);

  // Setup Camera
  useEffect(() => {
    const setupCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setPermissionGranted(true);
        });
      } catch (err) {
        console.error("Camera permission denied or error:", err);
      }
    };

    if (!loading) {
      setupCamera();
    }
  }, [loading]);

  // Processing Loop
  useEffect(() => {
    if (!permissionGranted || !isActive) return;

    const processFrame = () => {
      if (videoRef.current && handLandmarkerRef.current && canvasRef.current) {
        let startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoRef.current.currentTime;
          
          const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
          const ctx = canvasRef.current.getContext('2d');
          
          // Clear and prep canvas
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.save();
            // Mirror the canvas context to match the CSS mirrored video
            ctx.scale(-1, 1);
            ctx.translate(-canvasRef.current.width, 0);

            // Draw Lane Guides (Invisible in logic, visible to user)
            // Note: Since we are drawing mirrored, coordinates are tricky.
            // Let's draw in normalized space [0, 1] mapped to width
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;

            // Zones:
            // Right Lane (Screen Left due to mirror): x > 0.65
            // Left Lane (Screen Right due to mirror): x < 0.35
            
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            
            // Draw vertical dividers
            ctx.beginPath();
            ctx.moveTo(w * 0.35, 0);
            ctx.lineTo(w * 0.35, h);
            ctx.moveTo(w * 0.65, 0);
            ctx.lineTo(w * 0.65, h);
            ctx.stroke();

            // Draw Jump Threshold
            ctx.beginPath();
            ctx.moveTo(0, h * 0.3);
            ctx.lineTo(w, h * 0.3);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.stroke();

            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              
              // Use INDEX_FINGER_TIP (8) for precise finger control
              const x = landmarks[8].x; 
              const y = landmarks[8].y;

              // Draw Tracking Point
              const px = x * w;
              const py = y * h;

              ctx.beginPath();
              ctx.arc(px, py, 10, 0, 2 * Math.PI);
              ctx.fillStyle = '#06b6d4';
              ctx.fill();
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Logic for Control
              // MediaPipe X is 0 (left) -> 1 (right).
              // In mirrored view: 0 is Right Side of Screen, 1 is Left Side of Screen.
              // We want: 
              // User moves finger Right -> Dot moves Right (in mirrored view) -> Lane Right.
              // If user moves Right -> Camera sees object moving Left -> x decreases towards 0.
              
              let lane: -1 | 0 | 1 = 0;
              
              // Refined Thresholds
              if (x < 0.35) lane = 1; // Right Lane
              else if (x > 0.65) lane = -1; // Left Lane
              else lane = 0; // Center

              const jump = y < 0.3; // Top area

              onUpdateControls({ lane, jump });
            }
            ctx.restore();
          }
        }
      }
      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, permissionGranted, onUpdateControls]);

  return (
    <div className="absolute top-4 right-4 w-64 h-48 bg-black/50 rounded-lg overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-60"
      />
      <canvas 
        ref={canvasRef}
        width={320}
        height={240}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          Loading AI...
        </div>
      )}
      {!loading && !permissionGranted && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs text-center p-2">
          Allow Camera
        </div>
      )}
      <div className="absolute bottom-1 left-0 w-full text-[10px] text-center text-white/90 bg-black/60 font-mono py-1">
        Point Finger to Guide • High to Jump
      </div>
    </div>
  );
};
