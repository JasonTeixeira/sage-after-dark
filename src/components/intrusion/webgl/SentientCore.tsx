"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// SentientCore — a breathing, watching icosphere.
//
// A high-detail icosphere with a custom vertex-displacement shader (curl-ish
// simplex turbulence + slow respiration) and a fresnel rim that bleeds cyan at
// rest and surges toward magenta as the pointer moves. The whole entity slowly
// orients toward the pointer — it watches you.
// ---------------------------------------------------------------------------

type Props = {
  /** Normalised pointer (-1..1) shared from the scene. */
  pointer: React.RefObject<THREE.Vector2>;
  /** 0..1 energy from recent pointer movement — drives the surge. */
  energy: React.RefObject<number>;
  /** Beat 0..1 from the reveal choreography — pushes the core "through". */
  surge: React.RefObject<number>;
};

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uSurge;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDisp;

  //
  // Simplex noise (Ashima / Stefan Gustavson) — 3D.
  //
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Fractal turbulence
  float fbm(vec3 p){
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++){
      f += amp * snoise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return f;
  }

  void main(){
    vNormal = normalize(normalMatrix * normal);

    // Respiration: a slow global breathe, plus turbulent internal energy.
    float breathe = 0.5 + 0.5 * sin(uTime * 0.55);
    float turb = fbm(normal * 1.7 + vec3(uTime * 0.12));
    float ripple = snoise(normal * 4.5 + vec3(uTime * 0.4)) * 0.35;

    float displace =
        breathe * 0.10
      + turb * (0.18 + uEnergy * 0.22)
      + ripple * (0.05 + uSurge * 0.30)
      + uSurge * 0.25;

    vDisp = displace;

    vec3 pos = position + normal * displace;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uSurge;
  uniform vec3 uCyan;
  uniform vec3 uMagenta;
  uniform vec3 uCore;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDisp;

  void main(){
    // Fresnel rim — bright at grazing angles, the "containment field".
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.4);

    // Pulse the colour cyan<->magenta with breathing + pointer energy.
    float mixT = 0.5 + 0.5 * sin(uTime * 0.5);
    mixT = clamp(mixT + uEnergy * 0.45 + uSurge * 0.6, 0.0, 1.0);
    vec3 rim = mix(uCyan, uMagenta, mixT);

    // Internal energy glow keyed off displacement (the "thoughts").
    float inner = smoothstep(0.0, 0.35, vDisp);
    vec3 body = mix(uCore, rim, inner * 0.7);

    // Eye-like dark pupil core that the rim contains.
    float core = pow(max(dot(vNormal, vViewDir), 0.0), 1.5);
    body *= mix(1.0, 0.25, core * 0.6);

    vec3 col = body + rim * fres * (1.4 + uEnergy * 1.6 + uSurge * 4.5);

    // On surge the whole body blazes — emissive flood so bloom catches it and
    // the core reads as a contained sun pushing through the screen.
    col += rim * uSurge * (0.9 + inner * 1.6);
    col += rim * pow(fres, 0.6) * uSurge * 2.2;

    // Faint flicker so it never reads as static.
    col *= 0.92 + 0.08 * sin(uTime * 7.0 + vDisp * 20.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function SentientCore({ pointer, energy, surge }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uSurge: { value: 0 },
      uCyan: { value: new THREE.Color("#00e5ff") },
      uMagenta: { value: new THREE.Color("#f472b6") },
      uCore: { value: new THREE.Color("#0a1822") },
    }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value += dt;
      u.uEnergy.value = energy.current ?? 0;
      u.uSurge.value = surge.current ?? 0;
    }
    // Watch the pointer: orient the core toward where it is.
    if (groupRef.current && pointer.current) {
      const targetX = pointer.current.y * 0.35;
      const targetY = pointer.current.x * 0.5;
      groupRef.current.rotation.x +=
        (targetX - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.y +=
        (targetY - groupRef.current.rotation.y) * 0.04;
      // Slow idle drift so it never feels frozen.
      groupRef.current.rotation.z += dt * 0.02;
      // On surge the core swells toward the camera — it pushes through.
      const s = 1 + (surge.current ?? 0) * 0.85;
      groupRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.7, 48]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
        />
      </mesh>
    </group>
  );
}
