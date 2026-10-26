"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createTrophyModel } from "./courtGeometry";
import { Trophy, Sparkles, RotateCw } from "lucide-react";

interface Trophy3DProps {
  championName?: string;
  categoryLabel?: string;
  division?: string;
  height?: number | string;
  autoRotate?: boolean;
}

export const Trophy3D: React.FC<Trophy3DProps> = ({
  championName = "Tournament Champion",
  categoryLabel = "Men's Doubles - Class A",
  division = "Gold Division",
  height = 340,
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const trophyGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(autoRotate);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const h = typeof height === "number" ? height : container.clientHeight || 340;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 50);
    camera.position.set(0, 1.8, 3.8);
    camera.lookAt(0, 1.0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // 4. Studio Lighting setup (Key, Fill, Rim, Gold bounce)
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    // Key light (Warm gold)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light (Cool blue contrast)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // Rim light from behind
    const rimLight = new THREE.PointLight(0xf59e0b, 2.5, 8);
    rimLight.position.set(0, 2.5, -2);
    scene.add(rimLight);

    // 5. Procedural Trophy Model
    const trophy = createTrophyModel(1.2);
    trophy.position.set(0, 0, 0);
    scene.add(trophy);
    trophyGroupRef.current = trophy;

    // 6. Floating Golden Sparkle Particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = Math.random() * 2.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      speeds[i] = 0.005 + Math.random() * 0.01;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 7. Ground Mirror Reflection Pedestal
    const groundGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.1, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -0.05, 0);
    scene.add(ground);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating && trophyGroupRef.current) {
        trophyGroupRef.current.rotation.y += delta * 0.7;
      }

      // Animate floating particles
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          array[i * 3 + 1] += speeds[i];
          if (array[i * 3 + 1] > 2.8) {
            array[i * 3 + 1] = 0.1;
          }
        }
        posAttr.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = typeof height === "number" ? height : container.clientHeight || 340;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      container.replaceChildren();
    };
  }, [height, isRotating]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.2)] group">
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        style={{ height: typeof height === "number" ? `${height}px` : height }}
        className="w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Trophy Banner */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            3D CHAMPION CUP
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 hidden sm:inline-block">
            {division}
          </span>
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="pointer-events-auto p-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          title={isRotating ? "Pause auto-spin" : "Auto-spin"}
        >
          <RotateCw className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Bottom Inscription Plaque */}
      <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/30 text-center shadow-lg">
        <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-0.5">
          {categoryLabel}
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-wide truncate">
          🏆 {championName}
        </div>
        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
          Interactive PBR 3D Metal Model • Drag to inspect 360°
        </div>
      </div>
    </div>
  );
};
