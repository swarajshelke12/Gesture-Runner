import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { 
  LANE_CENTER, LANE_LEFT, LANE_RIGHT, LANE_WIDTH, 
  PLAYER_SPEED_INITIAL, PLAYER_SPEED_MAX, JUMP_FORCE, 
  GRAVITY, SPAWN_DISTANCE, ControlState, GameState 
} from '../constants';

interface GameSceneProps {
  gameState: GameState;
  controls: React.MutableRefObject<ControlState>;
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
}

// --- TYPES ---
type ObstacleType = 'BARRIER' | 'CYLINDER' | 'CUBE';

interface ObstacleData {
  id: number;
  position: THREE.Vector3;
  type: ObstacleType;
  seed: number; // for random variations
}

// --- MATERIALS ---
const robotMaterial = new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.3, metalness: 0.8 });
const robotJointMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 });

const barrierFrameMat = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.2, metalness: 1 });
const barrierCoreMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', emissive: '#dc2626', emissiveIntensity: 2, transparent: true, opacity: 0.8 });

const spikeCylinderMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.5, metalness: 0.8 });
const spikeTipMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 });

const cubeMat = new THREE.MeshStandardMaterial({ color: '#8b5cf6', roughness: 0.1, metalness: 0.9, emissive: '#7c3aed', emissiveIntensity: 0.5 });
const cubeWireMat = new THREE.MeshBasicMaterial({ color: '#ddd6fe', wireframe: true });

// --- OBSTACLE COMPONENTS ---

const Barrier = () => (
  <group>
     {/* Frame */}
     <mesh position={[0, 0, 0]} castShadow material={barrierFrameMat}>
       <boxGeometry args={[1.8, 0.1, 0.1]} />
     </mesh>
     <mesh position={[0, 1.2, 0]} castShadow material={barrierFrameMat}>
       <boxGeometry args={[1.8, 0.1, 0.1]} />
     </mesh>
     <mesh position={[-0.8, 0.6, 0]} castShadow material={barrierFrameMat}>
       <boxGeometry args={[0.1, 1.2, 0.1]} />
     </mesh>
     <mesh position={[0.8, 0.6, 0]} castShadow material={barrierFrameMat}>
       <boxGeometry args={[0.1, 1.2, 0.1]} />
     </mesh>
     {/* Energy Field */}
     <mesh position={[0, 0.6, 0]} material={barrierCoreMat}>
       <planeGeometry args={[1.5, 1.1]} />
     </mesh>
  </group>
);

const SpikedCylinder = ({ seed }: { seed: number }) => {
  const mesh = useRef<THREE.Group>(null);
  useFrame((state: any) => {
    if (mesh.current) {
       // Rolling animation
       mesh.current.rotation.x -= 0.1; 
    }
  });

  return (
    <group position={[0, 0.3, 0]}>
       <group ref={mesh}>
         {/* Main Log */}
         <mesh rotation={[0, 0, Math.PI/2]} castShadow material={spikeCylinderMat}>
            <cylinderGeometry args={[0.25, 0.25, 2, 16]} />
         </mesh>
         {/* Spikes */}
         {Array.from({ length: 8 }).map((_, i) => (
            <group key={i} rotation={[i * (Math.PI/4), 0, 0]}>
               {[-0.6, -0.2, 0.2, 0.6].map((z, j) => (
                  <mesh key={j} position={[0, 0.2, z]} material={spikeTipMat}>
                     <coneGeometry args={[0.08, 0.4, 8]} />
                  </mesh>
               ))}
            </group>
         ))}
       </group>
    </group>
  );
};

const FloatingCube = ({ seed }: { seed: number }) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state: any) => {
    if (mesh.current) {
       const t = state.clock.elapsedTime + seed;
       mesh.current.rotation.x = t;
       mesh.current.rotation.y = t * 0.5;
       mesh.current.position.y = 0.8 + Math.sin(t * 2) * 0.3;
    }
  });
  return (
    <group>
        <mesh ref={mesh} position={[0, 0.8, 0]} castShadow material={cubeMat}>
           <boxGeometry args={[0.7, 0.7, 0.7]} />
        </mesh>
        {/* Inner core effect */}
        <mesh position={[0, 0.8, 0]} scale={[0.8,0.8,0.8]} material={cubeWireMat}>
           <boxGeometry args={[0.7, 0.7, 0.7]} />
        </mesh>
    </group>
  );
};

// Wrapper that syncs position from mutable data
interface ObstacleItemProps {
  data: ObstacleData;
}

const ObstacleItem: React.FC<ObstacleItemProps> = ({ data }) => {
  const group = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (group.current) {
      group.current.position.copy(data.position);
    }
  });

  return (
    <group ref={group}>
      {data.type === 'BARRIER' && <Barrier />}
      {data.type === 'CYLINDER' && <SpikedCylinder seed={data.seed} />}
      {data.type === 'CUBE' && <FloatingCube seed={data.seed} />}
    </group>
  );
};

const RobotCharacter = ({ position, isJumping }: { position: React.MutableRefObject<THREE.Vector3>, isJumping: React.MutableRefObject<boolean> }) => {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  
  useFrame((state: any) => {
    if (!group.current) return;
    
    // Sync physics position
    group.current.position.copy(position.current);

    const t = state.clock.elapsedTime * 15;
    const runAmplitude = 0.5;

    // Procedural Running Animation
    if (!isJumping.current) {
      group.current.position.y += Math.sin(t * 2) * 0.1;
      if (leftArm.current) leftArm.current.rotation.x = Math.sin(t) * runAmplitude;
      if (rightArm.current) rightArm.current.rotation.x = Math.sin(t + Math.PI) * runAmplitude;
      if (leftLeg.current) leftLeg.current.rotation.x = Math.sin(t + Math.PI) * runAmplitude;
      if (rightLeg.current) rightLeg.current.rotation.x = Math.sin(t) * runAmplitude;
    } else {
      if (leftArm.current) leftArm.current.rotation.x = -2.5;
      if (rightArm.current) rightArm.current.rotation.x = -2.5;
      if (leftLeg.current) leftLeg.current.rotation.x = 0.5;
      if (rightLeg.current) rightLeg.current.rotation.x = 1.0;
    }
    
    const targetRotZ = -position.current.x * 0.1;
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, 0.1);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.8, 0]} castShadow material={robotMaterial}>
        <boxGeometry args={[0.4, 0.4, 0.45]} />
      </mesh>
      <mesh position={[0, 0.8, 0.2]} material={new THREE.MeshBasicMaterial({ color: '#00ffcc' })}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow material={robotMaterial}>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
      </mesh>
      <group position={[-0.35, 0.4, 0]}>
        <mesh ref={leftArm} position={[0, -0.25, 0]} castShadow material={robotJointMat}>
           <boxGeometry args={[0.15, 0.6, 0.15]} />
        </mesh>
      </group>
      <group position={[0.35, 0.4, 0]}>
        <mesh ref={rightArm} position={[0, -0.25, 0]} castShadow material={robotJointMat}>
           <boxGeometry args={[0.15, 0.6, 0.15]} />
        </mesh>
      </group>
      <group position={[-0.15, -0.3, 0]}>
        <mesh ref={leftLeg} position={[0, -0.3, 0]} castShadow material={robotJointMat}>
           <boxGeometry args={[0.18, 0.7, 0.18]} />
        </mesh>
      </group>
      <group position={[0.15, -0.3, 0]}>
        <mesh ref={rightLeg} position={[0, -0.3, 0]} castShadow material={robotJointMat}>
           <boxGeometry args={[0.18, 0.7, 0.18]} />
        </mesh>
      </group>
      <pointLight intensity={2} distance={3} color="#0ea5e9" position={[0, 0.5, 0.5]} />
    </group>
  );
};

const Floor = ({ speed }: { speed: number }) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state: any) => {
     if (mesh.current) {
        // @ts-ignore
        mesh.current.material.map.offset.y -= speed * 0.001;
     }
  });

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = '#0f172a';
        context.fillRect(0, 0, 512, 512);
        context.strokeStyle = '#1e293b';
        context.lineWidth = 4;
        for(let i=0; i<512; i+=64) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(512, i);
            context.stroke();
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, 512);
            context.stroke();
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 20);
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow ref={mesh}>
      <planeGeometry args={[50, 200]} />
      <meshStandardMaterial map={texture} roughness={0.5} metalness={0.5} />
    </mesh>
  );
};

export const GameScene: React.FC<GameSceneProps> = ({ gameState, controls, onGameOver, onScoreUpdate }) => {
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const playerVelY = useRef(0);
  const isJumping = useRef(false);
  const obstacles = useRef<ObstacleData[]>([]);
  const obstacleIdCounter = useRef(0);
  const speed = useRef(PLAYER_SPEED_INITIAL);
  const score = useRef(0);
  const lastObstacleTime = useRef(0);
  const [frameTick, setFrameTick] = useState(0);

  useFrame((state: any, delta) => {
    if (gameState !== GameState.PLAYING) return;

    const dt = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();

    // 1. Update Controls
    const targetLaneX = controls.current.lane * LANE_WIDTH;
    playerPos.current.x = THREE.MathUtils.lerp(playerPos.current.x, targetLaneX, dt * 10);

    if (controls.current.jump && !isJumping.current) {
      playerVelY.current = JUMP_FORCE;
      isJumping.current = true;
    }

    playerPos.current.y += playerVelY.current * dt;
    playerVelY.current -= GRAVITY * dt;

    if (playerPos.current.y <= 0) {
      playerPos.current.y = 0;
      playerVelY.current = 0;
      isJumping.current = false;
    }

    // 2. Obstacles Logic
    speed.current = Math.min(PLAYER_SPEED_MAX, speed.current + dt * 0.1);
    const distTraveled = speed.current * dt;
    
    let needsUpdate = false;

    for (let i = obstacles.current.length - 1; i >= 0; i--) {
      obstacles.current[i].position.z += distTraveled;
      
      const obs = obstacles.current[i];
      // Hitbox Logic - Varies by type
      const dx = Math.abs(obs.position.x - playerPos.current.x);
      const dz = Math.abs(obs.position.z - playerPos.current.z);
      
      let safeHeight = 2.0; // Default: too tall to jump
      let widthCheck = 0.8;
      
      if (obs.type === 'CYLINDER') {
        safeHeight = 0.6; // Can jump over
      } else if (obs.type === 'CUBE') {
        safeHeight = 1.2; // Might be able to jump very high, but generally need to dodge
      }

      // Simple collision box
      // If within horizontal bounds
      if (dx < widthCheck && dz < 0.6) {
        // If player is not high enough to clear it
        if (playerPos.current.y < safeHeight) {
          onGameOver();
        }
      }

      if (obs.position.z > 5) {
        obstacles.current.splice(i, 1);
        score.current += 10;
        onScoreUpdate(Math.floor(score.current));
        needsUpdate = true;
      }
    }

    // Spawn Logic
    const spawnRate = 25 / speed.current;
    if (time - lastObstacleTime.current > 0.6 + Math.random() * spawnRate) {
      const lane = Math.floor(Math.random() * 3) - 1; 
      const x = lane * LANE_WIDTH;
      
      const types: ObstacleType[] = ['BARRIER', 'CYLINDER', 'CUBE'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      obstacles.current.push({
        id: obstacleIdCounter.current++,
        position: new THREE.Vector3(x, 0, -SPAWN_DISTANCE),
        type,
        seed: Math.random() * 100
      });
      
      lastObstacleTime.current = time;
      needsUpdate = true;
    }

    if (needsUpdate) setFrameTick(t => t + 1);
  });

  React.useEffect(() => {
    if (gameState === GameState.PLAYING) {
      obstacles.current = [];
      score.current = 0;
      speed.current = PLAYER_SPEED_INITIAL;
      playerPos.current.set(0, 0, 0);
      onScoreUpdate(0);
      setFrameTick(0);
    }
  }, [gameState, onScoreUpdate]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 9]} fov={60} rotation={[-0.3, 0, 0]} />
      <Environment preset="night" />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <RobotCharacter position={playerPos} isJumping={isJumping} />
      
      {obstacles.current.map(obs => (
        <ObstacleItem key={obs.id} data={obs} />
      ))}
      
      <Floor speed={speed.current} />
      
      {/* Lane Guides */}
      <group position={[0, 0.02, 0]}>
        {[LANE_LEFT, LANE_CENTER, LANE_RIGHT].map((x, i) => (
             <mesh key={i} position={[x, 0, 0]} rotation={[-Math.PI/2,0,0]}>
                 <planeGeometry args={[0.05, 100]} />
                 <meshBasicMaterial color="#0ea5e9" opacity={0.2} transparent />
             </mesh>
        ))}
      </group>
    </>
  );
};
