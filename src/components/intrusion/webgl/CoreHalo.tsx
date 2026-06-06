"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// CoreHalo — a large camera-facing additive glow disc sitting just behind the
// core. At rest it's a faint nimbus; on surge it floods toward full-screen so
// the living core genuinely BLAZES through the cracked skin. Bloom amplifies
// it. Pure radial gradient in a fragment — extremely cheap.
// ---------------------------------------------------------------------------

type Props = {
  energy: React.RefObject<number>;
  surge: React.RefObject<number>;
};

export function CoreHalo({ energy, surge }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uSurge: { value: 0 },
      uCyan: { value: new THREE.Color("#00e5ff") },
      uMagenta: { value: new THREE.Color("#f472b6") },
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
    if (meshRef.current) {
      // Keep facing the camera; grow with surge so it floods the frame.
      meshRef.current.quaternion.copy(camera.quaternion);
      const s = 6 + (surge.current ?? 0) * 14;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1.2]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          uniform float uEnergy;
          uniform float uSurge;
          uniform vec3 uCyan;
          uniform vec3 uMagenta;
          varying vec2 vUv;
          void main(){
            float d = distance(vUv, vec2(0.5));
            float core = smoothstep(0.5, 0.0, d);
            core = pow(core, 2.2);
            float mixT = 0.5 + 0.5 * sin(uTime * 0.5) + uSurge * 0.4;
            vec3 col = mix(uCyan, uMagenta, clamp(mixT, 0.0, 1.0));
            float intensity = (0.12 + uEnergy * 0.18 + uSurge * 1.4);
            float pulse = 0.9 + 0.1 * sin(uTime * 1.4);
            gl_FragColor = vec4(col * intensity * pulse, core);
          }
        `}
      />
    </mesh>
  );
}
