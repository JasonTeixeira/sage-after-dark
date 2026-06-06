"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Starfield — a deep, receding field of faint motes giving the void real
// parallax and depth to fall into. Pure additive points, very cheap.
// ---------------------------------------------------------------------------

type Props = { count: number };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Starfield({ count }: Props) {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const rand = mulberry32(99);
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Box that recedes far on Z — deep space.
      pos[i * 3] = (rand() - 0.5) * 60;
      pos[i * 3 + 1] = (rand() - 0.5) * 40;
      pos[i * 3 + 2] = -rand() * 60 - 4;
      siz[i] = rand();
    }
    return { positions: pos, sizes: siz };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#7fdfff") },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (ref.current) {
      // Extremely slow drift toward camera = falling-into-space feel.
      ref.current.position.z += Math.min(delta, 0.05) * 0.15;
      if (ref.current.position.z > 8) ref.current.position.z = 0;
      uniforms.uTime.value += Math.min(delta, 0.05);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          uniform float uTime;
          attribute float aSize;
          varying float vTw;
          void main(){
            vTw = 0.5 + 0.5 * sin(uTime * (0.5 + aSize * 2.0) + aSize * 30.0);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (0.6 + aSize * 2.2) * (200.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          varying float vTw;
          void main(){
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;
            float g = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(uColor, g * (0.15 + vTw * 0.35));
          }
        `}
      />
    </points>
  );
}
