import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {
  LANE_WIDTH, GRAVITY, SPAWN_DISTANCE,
  ControlState, GameState, Difficulty, DIFFICULTY_SPEEDS
} from './constants';

const JUMP_FORCE = 18.0;
const WALL_HEIGHT = 4.0;

interface GameSceneProps {
  gameState: GameState;
  difficulty: Difficulty;
  controls: React.MutableRefObject<ControlState>;
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onJumpCooldownUpdate: (cooldown: number) => void;
}

type ObstacleType = 'BARRIER' | 'CYLINDER' | 'CUBE' | 'MEGA_WALL';
interface ObstacleData {
  id: number; position: THREE.Vector3;
  type: ObstacleType; width: number; height: number; seed: number;
}

// ── MATERIALS ───────────────────────────────────────────────
const steveSkinMat = new THREE.MeshLambertMaterial({ color: '#f5c89a' });
const steveBodyMat = new THREE.MeshLambertMaterial({ color: '#2563eb' });
const stevePantsMat = new THREE.MeshLambertMaterial({ color: '#374151' });
const tntRedMat = new THREE.MeshLambertMaterial({ color: '#dc2626' });
const tntWhiteMat = new THREE.MeshLambertMaterial({ color: '#f5f5f5' });
const tntTopMat = new THREE.MeshLambertMaterial({ color: '#f97316' });
const cobble1Mat = new THREE.MeshLambertMaterial({ color: '#9ca3af' });
const cobble2Mat = new THREE.MeshLambertMaterial({ color: '#6b7280' });
const cobble3Mat = new THREE.MeshLambertMaterial({ color: '#4b5563' });
const creeperGreenMat = new THREE.MeshLambertMaterial({ color: '#16a34a' });
const creeperDarkMat = new THREE.MeshLambertMaterial({ color: '#000000' });
const obsidianMat = new THREE.MeshStandardMaterial({ color: '#1e1b4b', roughness: 0.3, metalness: 0.6, emissive: '#312e81', emissiveIntensity: 0.3 });
const purpleGlowMat = new THREE.MeshStandardMaterial({ color: '#7c3aed', emissive: '#7c3aed', emissiveIntensity: 2, transparent: true, opacity: 0.6 });
const lavaMat = new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#dc2626', emissiveIntensity: 3 });

// Nature materials
const oakLogMat = new THREE.MeshLambertMaterial({ color: '#6b4c2a' });
const oakLeafMat = new THREE.MeshLambertMaterial({ color: '#22863a', transparent: true, opacity: 0.95 });
const darkLeafMat = new THREE.MeshLambertMaterial({ color: '#166534', transparent: true, opacity: 0.95 });
const stoneMat = new THREE.MeshLambertMaterial({ color: '#9ca3af' });
const darkStoneMat = new THREE.MeshLambertMaterial({ color: '#6b7280' });
const woodPlanks = new THREE.MeshLambertMaterial({ color: '#b5854a' });
const darkWoodMat = new THREE.MeshLambertMaterial({ color: '#7c4a1e' });
const glassMat = new THREE.MeshLambertMaterial({ color: '#bfdbfe', transparent: true, opacity: 0.6 });
const roofMat = new THREE.MeshLambertMaterial({ color: '#991b1b' });
const grassMat = new THREE.MeshLambertMaterial({ color: '#4a7c2f' });
const mountainMat = new THREE.MeshLambertMaterial({ color: '#6b7280' });
const snowMat = new THREE.MeshLambertMaterial({ color: '#f1f5f9' });

// ── PARTICLES ────────────────────────────────────────────────
const ParticleSystem = ({ position, color, count = 25, lifetime = 1.2 }: {
  position: THREE.Vector3; color: string; count?: number; lifetime?: number
}) => {
  const points = useRef<THREE.Points>(null);
  const velocities = useRef<THREE.Vector3[]>([]);
  const ages = useRef<number[]>([]);
  useEffect(() => {
    const positions = new Float32Array(count * 3);
    velocities.current = []; ages.current = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5);
      positions[i * 3 + 1] = position.y + Math.random();
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5);
      velocities.current.push(new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 6 + 1, (Math.random() - 0.5) * 5));
      ages.current.push(0);
    }
    if (points.current) points.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }, [position, count]);
  useFrame((_, delta) => {
    if (!points.current) return;
    const pos = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      if (ages.current[i] < lifetime) {
        pos[i * 3] += velocities.current[i].x * delta;
        pos[i * 3 + 1] += velocities.current[i].y * delta;
        pos[i * 3 + 2] += velocities.current[i].z * delta;
        velocities.current[i].y -= 14 * delta;
        ages.current[i] += delta;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });
  return <points ref={points}><bufferGeometry /><pointsMaterial size={0.15} color={color} /></points>;
};

// ── OBSTACLES ────────────────────────────────────────────────
const Barrier = () => {
  const group = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    if (group.current) { group.current.position.x = Math.sin(s.clock.elapsedTime * 18) * 0.04; }
    if (glowRef.current) glowRef.current.intensity = 4 + Math.sin(s.clock.elapsedTime * 8) * 2;
  });
  return (
    <group ref={group}>
      {[-0.65, 0.65].map((x, i) => (
        <group key={i} position={[x, 0.6, 0]}>
          <mesh castShadow material={tntRedMat}><boxGeometry args={[1.0, 1.2, 1.0]} /></mesh>
          <mesh position={[0, 0, 0.51]}><planeGeometry args={[0.8, 0.32]} /><primitive object={tntWhiteMat} /></mesh>
          <mesh position={[0, 0.62, 0]} material={tntTopMat}><boxGeometry args={[1.0, 0.12, 1.0]} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.05, 0]} material={lavaMat}><boxGeometry args={[2.2, 0.1, 1.0]} /></mesh>
      <pointLight ref={glowRef} position={[0, 1, 1]} intensity={4} distance={7} color="#ff4400" />
    </group>
  );
};

const SpikedCylinder = () => {
  const mesh = useRef<THREE.Group>(null);
  useFrame((s) => { if (mesh.current) { mesh.current.rotation.z += 0.1; mesh.current.rotation.y = s.clock.elapsedTime * 0.5; } });
  const mats = [cobble1Mat, cobble2Mat, cobble3Mat];
  return (
    <group position={[0, 0.65, 0]} ref={mesh}>
      {[-0.55, 0, 0.55].map((x, xi) => [-0.55, 0, 0.55].map((y, yi) => (
        <mesh key={`${xi}-${yi}`} position={[x, y, 0]} castShadow material={mats[(xi + yi) % 3]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
      )))}
    </group>
  );
};

const FloatingCube = ({ seed }: { seed: number }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      const t = state.clock.elapsedTime + seed;
      group.current.rotation.y = Math.sin(t * 1.5) * 0.3;
      group.current.position.y = 0.85 + Math.abs(Math.sin(t * 2.5)) * 0.65;
    }
  });
  return (
    <group ref={group} position={[0, 0.85, 0]}>
      <mesh castShadow material={creeperGreenMat}><boxGeometry args={[1.1, 1.1, 1.1]} /></mesh>
      {[[-0.24, 0.16, 0.56], [0.24, 0.16, 0.56]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={creeperDarkMat}><boxGeometry args={[0.3, 0.3, 0.05]} /></mesh>
      ))}
      <mesh position={[0, -0.07, 0.56]} material={creeperDarkMat}><boxGeometry args={[0.2, 0.2, 0.05]} /></mesh>
      {[[-0.2, -0.3, 0.56], [0.2, -0.3, 0.56]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={creeperDarkMat}><boxGeometry args={[0.2, 0.2, 0.05]} /></mesh>
      ))}
      <pointLight position={[0, 0, 0.8]} intensity={2} distance={4} color="#22c55e" />
    </group>
  );
};

const MegaWall = () => {
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(s.clock.elapsedTime * 3) * 0.8;
      mat.opacity = 0.4 + Math.sin(s.clock.elapsedTime * 3) * 0.2;
    }
  });
  return (
    <group>
      {[-0.65, 0, 0.65].map((x, i) => (
        <mesh key={i} position={[x, WALL_HEIGHT / 2, 0]} castShadow material={obsidianMat}>
          <boxGeometry args={[0.6, WALL_HEIGHT, 0.6]} />
        </mesh>
      ))}
      <mesh ref={glowRef} position={[0, WALL_HEIGHT / 2, 0.31]} material={purpleGlowMat}>
        <planeGeometry args={[1.7, WALL_HEIGHT - 0.4]} />
      </mesh>
      <pointLight position={[0, WALL_HEIGHT / 2, 1]} intensity={5} distance={8} color="#7c3aed" />
    </group>
  );
};

const ObstacleItem: React.FC<{ data: ObstacleData }> = ({ data }) => {
  const group = useRef<THREE.Group>(null);
  useFrame(() => { if (group.current) group.current.position.copy(data.position); });
  return (
    <group ref={group}>
      {data.type === 'BARRIER' && <Barrier />}
      {data.type === 'CYLINDER' && <SpikedCylinder />}
      {data.type === 'CUBE' && <FloatingCube seed={data.seed} />}
      {data.type === 'MEGA_WALL' && <MegaWall />}
    </group>
  );
};

// ── STEVE ────────────────────────────────────────────────────
const RobotCharacter = ({ position, isJumping }: { position: any; isJumping: any }) => {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.copy(position.current);
    const t = state.clock.elapsedTime * 12;
    const amp = 0.7;
    if (isJumping.current) {
      if (leftArm.current) leftArm.current.rotation.x = -2.0;
      if (rightArm.current) rightArm.current.rotation.x = -2.0;
      if (leftLeg.current) leftLeg.current.rotation.x = 0.5;
      if (rightLeg.current) rightLeg.current.rotation.x = 0.9;
    } else {
      group.current.position.y += Math.sin(t * 2) * 0.04;
      if (leftArm.current) leftArm.current.rotation.x = Math.sin(t) * amp;
      if (rightArm.current) rightArm.current.rotation.x = Math.sin(t + Math.PI) * amp;
      if (leftLeg.current) leftLeg.current.rotation.x = Math.sin(t + Math.PI) * amp;
      if (rightLeg.current) rightLeg.current.rotation.x = Math.sin(t) * amp;
    }
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -position.current.x * 0.08, 0.1);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 1.0, 0]} castShadow material={steveSkinMat}><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh>
      <mesh position={[-0.13, 1.05, 0.26]} material={new THREE.MeshBasicMaterial({ color: '#1e3a8a' })}><boxGeometry args={[0.13, 0.1, 0.02]} /></mesh>
      <mesh position={[0.13, 1.05, 0.26]} material={new THREE.MeshBasicMaterial({ color: '#1e3a8a' })}><boxGeometry args={[0.13, 0.1, 0.02]} /></mesh>
      <mesh position={[0, 0.35, 0]} castShadow material={steveBodyMat}><boxGeometry args={[0.5, 0.65, 0.28]} /></mesh>
      <group position={[-0.37, 0.55, 0]}><mesh ref={leftArm} position={[0, -0.28, 0]} castShadow material={steveBodyMat}><boxGeometry args={[0.2, 0.58, 0.2]} /></mesh></group>
      <group position={[0.37, 0.55, 0]}><mesh ref={rightArm} position={[0, -0.28, 0]} castShadow material={steveBodyMat}><boxGeometry args={[0.2, 0.58, 0.2]} /></mesh></group>
      <group position={[-0.14, -0.15, 0]}><mesh ref={leftLeg} position={[0, -0.32, 0]} castShadow material={stevePantsMat}><boxGeometry args={[0.22, 0.66, 0.22]} /></mesh></group>
      <group position={[0.14, -0.15, 0]}><mesh ref={rightLeg} position={[0, -0.32, 0]} castShadow material={stevePantsMat}><boxGeometry args={[0.22, 0.66, 0.22]} /></mesh></group>
    </group>
  );
};

// ── MINECRAFT TREE ───────────────────────────────────────────
const Tree = ({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) => (
  <group position={[x, -0.5, z]} scale={[scale, scale, scale]}>
    {/* Trunk - 3 blocks tall */}
    {[0, 1, 2].map(y => (
      <mesh key={y} position={[0, y * 0.9 + 0.45, 0]} castShadow material={oakLogMat}>
        <boxGeometry args={[0.55, 0.88, 0.55]} />
      </mesh>
    ))}
    {/* Leaf crown - layered blocks */}
    {[
      [0, 3.2, 0, 2.2, 1.0, 2.2],
      [0, 4.0, 0, 1.8, 0.9, 1.8],
      [0, 4.8, 0, 1.2, 0.9, 1.2],
      [0, 5.5, 0, 0.7, 0.7, 0.7],
    ].map(([lx, ly, lz, w, h, d], i) => (
      <mesh key={i} position={[lx, ly, lz]} castShadow material={i % 2 === 0 ? oakLeafMat : darkLeafMat}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
    ))}
  </group>
);

// ── MINECRAFT HOUSE ──────────────────────────────────────────
const House = ({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) => (
  <group position={[x, -0.5, z]} scale={[scale, scale, scale]}>
    {/* Foundation */}
    <mesh position={[0, 0.25, 0]} receiveShadow material={stoneMat}>
      <boxGeometry args={[4.5, 0.5, 3.5]} />
    </mesh>
    {/* Walls */}
    <mesh position={[0, 1.5, 0]} castShadow material={woodPlanks}>
      <boxGeometry args={[4.5, 2.5, 3.5]} />
    </mesh>
    {/* Hollow inside - dark interior */}
    <mesh position={[0, 1.6, 0]}>
      <boxGeometry args={[3.8, 2.0, 2.8]} />
      <meshBasicMaterial color="#1a0f00" />
    </mesh>
    {/* Windows */}
    {[[-1.2, 1.6, 1.76], [1.2, 1.6, 1.76]].map(([wx, wy, wz], i) => (
      <mesh key={i} position={[wx, wy, wz]} material={glassMat}>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
      </mesh>
    ))}
    {/* Door */}
    <mesh position={[0, 0.9, 1.77]}>
      <boxGeometry args={[0.75, 1.5, 0.05]} />
      <meshBasicMaterial color="#4a2800" />
    </mesh>
    {/* Roof - pitched */}
    {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((rx, i) => (
      <mesh key={i} position={[rx, 3.0 + Math.max(0, (0.8 - Math.abs(rx)) * 0.5), 0]}
        castShadow material={roofMat}>
        <boxGeometry args={[0.6, 0.6 + Math.max(0, (0.8 - Math.abs(rx)) * 0.3), 3.8]} />
      </mesh>
    ))}
    {/* Chimney */}
    <mesh position={[1.5, 4.2, 0.5]} castShadow material={darkStoneMat}>
      <boxGeometry args={[0.6, 1.8, 0.6]} />
    </mesh>
    {/* Smoke hint */}
    <mesh position={[1.5, 5.2, 0.5]}>
      <sphereGeometry args={[0.25, 6, 6]} />
      <meshBasicMaterial color="#aaaaaa" transparent opacity={0.3} />
    </mesh>
  </group>
);

// ── MOUNTAINS IN DISTANCE ────────────────────────────────────
const Mountains = () => {
  const mountains = useMemo(() => [
    { x: -35, z: -90, w: 18, h: 22, d: 12 },
    { x: -20, z: -100, w: 14, h: 28, d: 10 },
    { x: -50, z: -80, w: 20, h: 18, d: 14 },
    { x: 35, z: -90, w: 18, h: 22, d: 12 },
    { x: 20, z: -100, w: 14, h: 28, d: 10 },
    { x: 50, z: -80, w: 20, h: 18, d: 14 },
    { x: 0, z: -110, w: 22, h: 32, d: 16 },
    { x: -38, z: -120, w: 16, h: 20, d: 12 },
    { x: 38, z: -120, w: 16, h: 20, d: 12 },
  ], []);

  return (
    <group>
      {mountains.map((m, i) => (
        <group key={i} position={[m.x, -0.5, m.z]}>
          {/* Mountain body */}
          <mesh castShadow material={mountainMat}>
            <boxGeometry args={[m.w, m.h, m.d]} />
          </mesh>
          {/* Snow cap */}
          <mesh position={[0, m.h * 0.35, 0]} material={snowMat}>
            <boxGeometry args={[m.w * 0.5, m.h * 0.3, m.d * 0.5]} />
          </mesh>
          <mesh position={[0, m.h * 0.47, 0]} material={snowMat}>
            <boxGeometry args={[m.w * 0.28, m.h * 0.2, m.d * 0.28]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ── GRASS FIELD ON SIDES ─────────────────────────────────────
const GrassSides = () => {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    [leftRef, rightRef].forEach(ref => {
      if (ref.current) {
        const mat = ref.current.material as THREE.MeshLambertMaterial;
        if (mat.map) mat.map.offset.y -= 8 * delta * 0.0007;
      }
    });
  });

  const grassTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 512;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#4a7c2f'; ctx.fillRect(0, 0, 256, 512);
    // Grass patches
    for (let i = 0; i < 300; i++) {
      const shade = Math.random() > 0.5 ? '#22863a' : '#166534';
      ctx.fillStyle = shade;
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 6 + Math.random() * 12, 6 + Math.random() * 12);
    }
    // Block grid
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i % 256, 0); ctx.lineTo(i % 256, 512); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 8);
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, []);

  return (
    <>
      {/* Left grass field */}
      <mesh ref={leftRef} rotation={[-Math.PI / 2, 0, 0]} position={[-22, -0.48, -30]} receiveShadow>
        <planeGeometry args={[25, 200]} />
        <meshLambertMaterial map={grassTex} />
      </mesh>
      {/* Right grass field */}
      <mesh ref={rightRef} rotation={[-Math.PI / 2, 0, 0]} position={[22, -0.48, -30]} receiveShadow>
        <planeGeometry args={[25, 200]} />
        <meshLambertMaterial map={grassTex} />
      </mesh>
    </>
  );
};

// ── CLOUDS ───────────────────────────────────────────────────
const Clouds = () => {
  const cloudsRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud, i) => {
        cloud.position.x += delta * (0.3 + i * 0.1);
        if (cloud.position.x > 35) cloud.position.x = -35;
      });
    }
  });
  const cloudDefs = [
    { pos: [-12, 14, -50] as [number,number,number], blocks: [[-1.5,0,0],[0,0,0],[1.5,0,0],[0,0.85,0],[-0.75,0.85,0],[0.75,0.85,0]] },
    { pos: [8, 16, -70] as [number,number,number], blocks: [[-1,0,0],[0,0,0],[1,0,0],[0,0.85,0]] },
    { pos: [-5, 15, -90] as [number,number,number], blocks: [[-2,0,0],[-1,0,0],[0,0,0],[1,0,0],[2,0,0],[-1,0.85,0],[0,0.85,0],[1,0.85,0]] },
    { pos: [18, 13, -55] as [number,number,number], blocks: [[-1,0,0],[0,0,0],[1,0,0],[0,0.85,0]] },
    { pos: [-22, 17, -75] as [number,number,number], blocks: [[-1.5,0,0],[0,0,0],[1.5,0,0],[0,0.85,0],[0.75,0.85,0]] },
  ];
  return (
    <group ref={cloudsRef}>
      {cloudDefs.map((cloud, ci) => (
        <group key={ci} position={cloud.pos}>
          {cloud.blocks.map(([bx, by, bz], bi) => (
            <mesh key={bi} position={[bx, by, bz]}>
              <boxGeometry args={[1.6, 1.0, 1.4]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// ── FLOOR ────────────────────────────────────────────────────
const Floor = ({ speed }: { speed: number }) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (mesh.current) {
      const mat = mesh.current.material as THREE.MeshLambertMaterial;
      if (mat.map) mat.map.offset.y -= speed * 0.0007;
    }
  });
  const texture = useMemo(() => {
    const size = 512;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d')!;
    // Rich dirt
    ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * size; const y = Math.random() * size;
      const s = 4 + Math.random() * 10;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${0.1 + Math.random() * 0.2})` : `rgba(180,100,40,${0.1 + Math.random() * 0.15})`;
      ctx.fillRect(x, y, s, s);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < size; i += 64) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
    }
    // Dashed lane markers
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([20, 14]);
    ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(170, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(342, 0); ctx.lineTo(342, size); ctx.stroke();
    ctx.setLineDash([]);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 18);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestMipmapNearestFilter;
    return tex;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow ref={mesh}>
      {/* Wider track — 20 units */}
      <planeGeometry args={[20, 200]} />
      <meshLambertMaterial map={texture} />
    </mesh>
  );
};

// ── STATIC SCENERY (trees + houses placed around track) ──────
const Scenery = () => {
  const items = useMemo(() => {
    const result: JSX.Element[] = [];
    // Left side trees
    const leftTreePositions = [
      [-12, -8], [-14, -20], [-11, -35], [-15, -50], [-12, -65],
      [-14, -80], [-11, -95], [-13, -110], [-16, -125], [-12, -140],
    ];
    leftTreePositions.forEach(([x, z], i) => {
      result.push(<Tree key={`lt${i}`} x={x} z={z} scale={0.9 + Math.random() * 0.4} />);
    });
    // Right side trees
    const rightTreePositions = [
      [12, -12], [15, -25], [11, -40], [14, -55], [12, -70],
      [15, -85], [11, -100], [13, -115], [16, -130], [12, -145],
    ];
    rightTreePositions.forEach(([x, z], i) => {
      result.push(<Tree key={`rt${i}`} x={x} z={z} scale={0.9 + Math.random() * 0.4} />);
    });
    // Houses — further back on both sides
    result.push(<House key="h1" x={-20} z={-30} scale={0.9} />);
    result.push(<House key="h2" x={22} z={-55} scale={1.0} />);
    result.push(<House key="h3" x={-22} z={-85} scale={0.85} />);
    result.push(<House key="h4" x={20} z={-110} scale={0.95} />);
    result.push(<House key="h5" x={-21} z={-135} scale={1.0} />);
    // Extra trees between houses
    result.push(<Tree key="et1" x={-18} z={-45} scale={1.1} />);
    result.push(<Tree key="et2" x={19} z={-70} scale={0.95} />);
    result.push(<Tree key="et3" x={-19} z={-100} scale={1.05} />);
    result.push(<Tree key="et4" x={18} z={-125} scale={0.9} />);
    return result;
  }, []);

  return <group>{items}</group>;
};

// ── MAIN SCENE ───────────────────────────────────────────────
export const GameScene: React.FC<GameSceneProps> = ({
  gameState, difficulty, controls, onGameOver, onScoreUpdate, onJumpCooldownUpdate
}) => {
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const playerVelY = useRef(0);
  const isJumping = useRef(false);
  const obstacles = useRef<ObstacleData[]>([]);
  const obstacleIdCounter = useRef(0);
  const speed = useRef(8.0);
  const score = useRef(0);
  const jumpCooldown = useRef(0);
  const prevJumpInput = useRef(false);
  const fingerBelowLine = useRef(true);
  const lastSpawnTime = useRef(0);
  const [frameTick, setFrameTick] = useState(0);
  const [collisionParticles, setCollisionParticles] = useState<{ id: number; position: THREE.Vector3 }[]>([]);
  const particleIdCounter = useRef(0);

  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING) return;
    const dt = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();
    const targetLaneX = controls.current.lane * LANE_WIDTH;
    playerPos.current.x = THREE.MathUtils.lerp(playerPos.current.x, targetLaneX, dt * 16);
    const isFingerUp = controls.current.jump;
    if (!isFingerUp) fingerBelowLine.current = true;
    const isFreshJump = isFingerUp && !prevJumpInput.current && fingerBelowLine.current;
    if (isFreshJump && playerPos.current.y <= 0 && jumpCooldown.current <= 0) {
      playerVelY.current = JUMP_FORCE; isJumping.current = true;
      fingerBelowLine.current = false; jumpCooldown.current = 0.5;
    }
    prevJumpInput.current = isFingerUp;
    playerPos.current.y += playerVelY.current * dt;
    playerVelY.current -= GRAVITY * dt;
    if (playerPos.current.y <= 0) { playerPos.current.y = 0; playerVelY.current = 0; isJumping.current = false; }
    if (jumpCooldown.current > 0) {
      jumpCooldown.current = Math.max(0, jumpCooldown.current - dt);
      if (onJumpCooldownUpdate) onJumpCooldownUpdate(jumpCooldown.current);
    }
    const maxSpeed = DIFFICULTY_SPEEDS[difficulty] + 12;
    speed.current = Math.min(maxSpeed, speed.current + dt * 0.06);
    const moveDist = speed.current * dt;
    let needsRender = false;
    for (let i = obstacles.current.length - 1; i >= 0; i--) {
      const obs = obstacles.current[i];
      obs.position.z += moveDist;
      const dx = Math.abs(obs.position.x - playerPos.current.x);
      const dz = Math.abs(obs.position.z - playerPos.current.z);
      if (dz < 0.6 && dx < 0.8 && playerPos.current.y < obs.height) {
        setCollisionParticles(prev => [...prev, { id: particleIdCounter.current++, position: playerPos.current.clone() }]);
        onGameOver(); return;
      }
      if (obs.position.z > 5) {
        obstacles.current.splice(i, 1); score.current += 10;
        onScoreUpdate(Math.floor(score.current)); needsRender = true;
      }
    }
    const spawnRate = Math.max(1.0, 2.2 - speed.current / 35);
    if (time - lastSpawnTime.current > spawnRate) {
      const pattern = Math.random();
      const spawn = (laneIdx: number, type: ObstacleType, h: number) => {
        obstacles.current.push({
          id: obstacleIdCounter.current++,
          position: new THREE.Vector3((laneIdx - 1) * LANE_WIDTH, 0, -SPAWN_DISTANCE),
          type, height: h, width: 1.5, seed: Math.random() * 100
        });
      };
      if (pattern < 0.5) {
        const lane = Math.floor(Math.random() * 3);
        const types: ObstacleType[] = ['BARRIER', 'CYLINDER', 'CUBE', 'MEGA_WALL'];
        const type = types[Math.floor(Math.random() * types.length)];
        spawn(lane, type, type === 'MEGA_WALL' ? WALL_HEIGHT : type === 'CUBE' ? 1.5 : type === 'CYLINDER' ? 0.8 : 1.2);
      } else if (pattern < 0.8) {
        const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, 2);
        lanes.forEach(lane => {
          const types: ObstacleType[] = ['BARRIER', 'CYLINDER', 'CUBE'];
          const type = types[Math.floor(Math.random() * types.length)];
          spawn(lane, type, type === 'CUBE' ? 1.5 : type === 'CYLINDER' ? 0.8 : 1.2);
        });
      } else {
        [0, 1, 2].forEach(lane => {
          const types: ObstacleType[] = ['BARRIER', 'CYLINDER', 'CUBE'];
          const type = types[Math.floor(Math.random() * types.length)];
          spawn(lane, type, type === 'CUBE' ? 1.5 : type === 'CYLINDER' ? 0.8 : 1.2);
        });
      }
      lastSpawnTime.current = time; needsRender = true;
    }
    if (needsRender) setFrameTick(t => t + 1);
  });

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      obstacles.current = []; score.current = 0;
      speed.current = DIFFICULTY_SPEEDS[difficulty];
      playerPos.current.set(0, 0, 0); setFrameTick(0);
      onJumpCooldownUpdate(0); prevJumpInput.current = false;
      jumpCooldown.current = 0; fingerBelowLine.current = true;
    }
  }, [gameState, difficulty]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 9]} fov={70} rotation={[-0.25, 0, 0]} />
      <color attach="background" args={['#5ba3d9']} />
      {/* Fog for natural depth fade */}
      <fog attach="fog" args={['#87CEEB', 30, 100]} />
      {/* Warm sun */}
      <ambientLight intensity={0.75} color="#fff8e7" />
      <directionalLight position={[10, 25, 10]} intensity={2.2} color="#fffacd" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-far={80} shadow-camera-left={-20} shadow-camera-right={20}
        shadow-camera-top={20} shadow-camera-bottom={-20}
      />
      {/* Ground bounce light */}
      <pointLight position={[0, -0.3, 2]} intensity={0.6} color="#c8771a" distance={15} />
      {/* Side warm fill */}
      <pointLight position={[-10, 3, -10]} intensity={0.8} color="#ff9933" distance={20} />
      <pointLight position={[10, 3, -10]} intensity={0.8} color="#ff9933" distance={20} />

      <Clouds />
      <Mountains />
      <GrassSides />
      <Scenery />
      <Floor speed={speed.current} />
      <RobotCharacter position={playerPos} isJumping={isJumping} />
      {obstacles.current.map(obs => <ObstacleItem key={obs.id} data={obs} />)}
      {collisionParticles.map(p => (
        <ParticleSystem key={p.id} position={p.position} color="#ff6600" count={30} lifetime={1.2} />
      ))}
    </>
  );
};