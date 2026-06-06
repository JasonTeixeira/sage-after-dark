"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// NeuralField — a surrounding constellation of glowing nodes joined by faint
// synaptic lines, drifting. Random nodes "fire" (flare bright) as if thoughts.
// Plus a set of tendrils of light reaching outward from the core.
// ---------------------------------------------------------------------------

type Props = {
  count: number;
  energy: React.RefObject<number>;
  surge: React.RefObject<number>;
};

const CYAN = new THREE.Color("#00e5ff");
const MAGENTA = new THREE.Color("#f472b6");

// Deterministic PRNG so SSR/build and client agree and frames are stable.
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

const POINT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uSurge;
  attribute float aSeed;
  attribute float aScale;
  varying float vFire;
  varying float vSeed;

  void main(){
    vSeed = aSeed;
    // Each node fires on its own phase — a thought.
    float phase = aSeed * 6.2831;
    float fire = sin(uTime * (0.5 + aSeed * 1.5) + phase);
    fire = smoothstep(0.85, 1.0, fire);
    vFire = fire;

    vec3 p = position;
    // Gentle drift / breathing of the whole cloud.
    p += 0.06 * vec3(
      sin(uTime * 0.2 + phase),
      cos(uTime * 0.17 + phase * 1.3),
      sin(uTime * 0.23 + phase * 0.7)
    );

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = aScale * (1.0 + fire * 3.0 + uSurge * 1.5);
    gl_PointSize = size * (300.0 / -mv.z) * (1.0 + uEnergy * 0.4);
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAG = /* glsl */ `
  uniform vec3 uCyan;
  uniform vec3 uMagenta;
  uniform float uSurge;
  varying float vFire;
  varying float vSeed;

  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    glow = pow(glow, 1.6);

    vec3 col = mix(uCyan, uMagenta, vSeed * 0.6 + vFire * 0.4 + uSurge * 0.3);
    float intensity = 0.35 + vFire * 1.6 + uSurge * 0.6;
    gl_FragColor = vec4(col * intensity, glow);
  }
`;

export function NeuralField({ count, energy, surge }: Props) {
  const pointsMat = useRef<THREE.ShaderMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Build node positions on a clustered shell around the core.
  const { positions, seeds, scales, linePositions } = useMemo(() => {
    const rand = mulberry32(1337);
    const pos = new Float32Array(count * 3);
    const seedArr = new Float32Array(count);
    const scaleArr = new Float32Array(count);
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      // Spherical shell with depth variance — feels volumetric.
      const r = 2.6 + rand() * 7.5;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      const z = r * Math.cos(phi);
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      seedArr[i] = rand();
      scaleArr[i] = 0.5 + rand() * 1.6;
      pts.push(new THREE.Vector3(x, y, z));
    }

    // Synaptic lines: connect each node to a couple of nearby neighbours.
    const linePts: number[] = [];
    const maxDist = 2.4;
    const maxLines = Math.min(count * 2, 2600);
    let made = 0;
    for (let i = 0; i < count && made < maxLines; i++) {
      let linked = 0;
      for (let j = i + 1; j < count && linked < 2; j++) {
        if (pts[i].distanceTo(pts[j]) < maxDist) {
          linePts.push(
            pts[i].x, pts[i].y, pts[i].z,
            pts[j].x, pts[j].y, pts[j].z,
          );
          linked++;
          made++;
        }
      }
    }

    return {
      positions: pos,
      seeds: seedArr,
      scales: scaleArr,
      linePositions: new Float32Array(linePts),
    };
  }, [count]);

  const pointUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uSurge: { value: 0 },
      uCyan: { value: CYAN.clone() },
      uMagenta: { value: MAGENTA.clone() },
    }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (pointsMat.current) {
      const u = pointsMat.current.uniforms;
      u.uTime.value += dt;
      u.uEnergy.value = energy.current ?? 0;
      u.uSurge.value = surge.current ?? 0;
    }
    if (lineMat.current) {
      const s = surge.current ?? 0;
      const e = energy.current ?? 0;
      lineMat.current.opacity = 0.06 + e * 0.1 + s * 0.22;
    }
    if (groupRef.current) {
      // Slow majestic rotation of the whole constellation.
      groupRef.current.rotation.y += dt * 0.025;
      groupRef.current.rotation.x = Math.sin((pointUniforms.uTime.value) * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
          <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={pointsMat}
          vertexShader={POINT_VERT}
          fragmentShader={POINT_FRAG}
          uniforms={pointUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMat}
          color={CYAN}
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
