"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { SentientCore } from "./SentientCore";
import { CoreHalo } from "./CoreHalo";
import { NeuralField } from "./NeuralField";
import { Starfield } from "./Starfield";

// ---------------------------------------------------------------------------
// CoreScene — composes the living world and wires pointer-awareness.
//
// Pointer-awareness model:
//  - `pointer` (Vector2, -1..1) drives camera parallax + core orientation.
//  - `energy` rises with pointer *movement* and decays — the system reacting
//    to you. Feeds bloom, rim surge, line opacity.
//  - `surge` is driven externally by the reveal choreography (the blaze).
// ---------------------------------------------------------------------------

type Quality = "high" | "mobile";

type Props = {
  quality: Quality;
  /** External 0..1 from the cracking-reveal beats. */
  surgeRef: React.RefObject<number>;
};

export function CoreScene({ quality, surgeRef }: Props) {
  const { camera, size } = useThree();

  const pointer = useRef(new THREE.Vector2(0, 0));
  const pointerTarget = useRef(new THREE.Vector2(0, 0));
  const energy = useRef(0);
  const lastMove = useRef(0);

  const counts = useMemo(
    () =>
      quality === "mobile"
        ? { nodes: 420, stars: 700 }
        : { nodes: 1500, stars: 2200 },
    [quality],
  );

  // Pointer + device-orientation listeners (the scene feels you).
  useEffect(() => {
    const onMove = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -((clientY / window.innerHeight) * 2 - 1);
      const prev = pointerTarget.current;
      const dist = Math.hypot(nx - prev.x, ny - prev.y);
      // Movement injects energy (the watcher notices).
      energy.current = Math.min(1, energy.current + dist * 2.2);
      lastMove.current = performance.now();
      pointerTarget.current.set(nx, ny);
    };
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const nx = Math.max(-1, Math.min(1, e.gamma / 35));
      const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
      energy.current = Math.min(1, energy.current + 0.04);
      pointerTarget.current.set(nx, ny);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // Smooth the pointer.
    pointer.current.lerp(pointerTarget.current, 0.06);
    // Energy decays back toward calm.
    energy.current = Math.max(0, energy.current - dt * 0.9);

    // Camera parallax — real depth shift toward the pointer.
    const px = pointer.current.x * 0.9;
    const py = pointer.current.y * 0.6;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += (py - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  const chromaOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0008), []);

  return (
    <>
      <color attach="background" args={["#05070a"]} />
      <fog attach="fog" args={["#05070a", 9, 26]} />

      <Starfield count={counts.stars} />
      <NeuralField count={counts.nodes} energy={energy} surge={surgeRef} />
      <CoreHalo energy={energy} surge={surgeRef} />
      <SentientCore pointer={pointer} energy={energy} surge={surgeRef} />

      {/* A soft key so the core mesh body reads even where the shader is dark. */}
      <ambientLight intensity={0.15} />

      <EffectComposer multisampling={quality === "mobile" ? 0 : 2}>
        <Bloom
          intensity={quality === "mobile" ? 0.9 : 1.35}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.7}
          mipmapBlur
          radius={0.85}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={chromaOffset}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.95} />
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.035} />
      </EffectComposer>
    </>
  );
}
