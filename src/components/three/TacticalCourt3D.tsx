"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  COURT_DIMENSIONS,
  createBadmintonCourtTexture,
  createBadmintonNetGroup,
  createShuttlecockModel,
} from "./courtGeometry";
import { TournamentCategory } from "@/types/tournament";
import { Eye, RotateCcw, Maximize2 } from "lucide-react";

interface TacticalCourt3DProps {
  servingTeam?: "teamA" | "teamB";
  servingCourtSide?: "right" | "left";
  category?: TournamentCategory;
  teamAName?: string;
  teamBName?: string;
  scoreA?: number;
  scoreB?: number;
  height?: number | string;
  interactive?: boolean;
}

export const TacticalCourt3D: React.FC<TacticalCourt3DProps> = ({
  servingTeam = "teamA",
  servingCourtSide = "right",
  category = "mens_doubles_a",
  teamAName = "Team A",
  teamBName = "Team B",
  scoreA = 0,
  scoreB = 0,
  height = 280,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const courtMeshRef = useRef<THREE.Mesh | null>(null);
  const shuttleGroupRef = useRef<THREE.Group | null>(null);
  const [viewAngle, setViewAngle] = useState<"iso" | "top" | "side">("iso");

  const isDoubles = !category.toLowerCase().includes("singles");

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const h = typeof height === "number" ? height : container.clientHeight || 280;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 100);
    camera.position.set(0, 10.5, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 3. OrbitControls
    let controls: OrbitControls | null = null;
    if (interactive) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go below floor
      controls.minDistance = 6;
      controls.maxDistance = 22;
      controlsRef.current = controls;
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 14, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x00e5ff, 1.5, 25, Math.PI / 4, 0.3);
    spotLight.position.set(0, 12, 0);
    scene.add(spotLight);

    // 5. Badminton Court Plane
    const courtWidth = COURT_DIMENSIONS.widthDoubles + 2.0;
    const courtLength = COURT_DIMENSIONS.length + 2.0;
    const courtGeo = new THREE.PlaneGeometry(courtWidth, courtLength);

    const texture = createBadmintonCourtTexture({
      highlightServiceBox: servingCourtSide,
      servingSide: servingTeam === "teamA" ? "near" : "far",
      isDoubles,
      highlightColor: servingTeam === "teamA" ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)",
    });

    const courtMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.rotation.x = -Math.PI / 2;
    courtMesh.receiveShadow = true;
    scene.add(courtMesh);
    courtMeshRef.current = courtMesh;

    // 6. Net Group
    const netGroup = createBadmintonNetGroup();
    scene.add(netGroup);

    // 7. 3D Shuttlecock on the active serving spot
    const shuttle = createShuttlecockModel(1.2);
    shuttle.castShadow = true;
    scene.add(shuttle);
    shuttleGroupRef.current = shuttle;

    // Position shuttle based on serving team & side
    const isNear = servingTeam === "teamA";
    const isRight = servingCourtSide === "right";
    const xPos = isNear ? (isRight ? 1.5 : -1.5) : (isRight ? -1.5 : 1.5);
    const zPos = isNear ? 3.8 : -3.8;
    shuttle.position.set(xPos, 0.25, zPos);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle hover on shuttlecock to draw the eye
      if (shuttleGroupRef.current) {
        shuttleGroupRef.current.position.y = 0.35 + Math.sin(elapsedTime * 4) * 0.08;
        shuttleGroupRef.current.rotation.y = elapsedTime * 1.5;
      }

      if (controls) {
        controls.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = typeof height === "number" ? height : container.clientHeight || 280;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (controls) controls.dispose();
      renderer.dispose();
      courtGeo.dispose();
      courtMat.dispose();
      texture.dispose();
      container.replaceChildren();
    };
  }, [servingTeam, servingCourtSide, category, isDoubles, height, interactive]);

  // Handle Preset Camera Changes
  const setPresetView = (type: "iso" | "top" | "side") => {
    setViewAngle(type);
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (type === "top") {
      camera.position.set(0, 16, 0.01);
      camera.lookAt(0, 0, 0);
    } else if (type === "side") {
      camera.position.set(14, 4, 0);
      camera.lookAt(0, 0.5, 0);
    } else {
      camera.position.set(0, 10.5, 12);
      camera.lookAt(0, 0, 0);
    }
    controls.target.set(0, 0, 0);
    controls.update();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 shadow-inner group">
      {/* 3D Canvas Mounting Point */}
      <div
        ref={mountRef}
        style={{ height: typeof height === "number" ? `${height}px` : height }}
        className="w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Overlay Badge & Telemetry */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono font-bold text-white flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            3D TACTICAL SERVICE RADAR
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
            {isDoubles ? "Doubles Box" : "Singles Box"}
          </span>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 pointer-events-auto bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[10px] font-mono">
          <button
            onClick={() => setPresetView("iso")}
            className={`px-2 py-0.5 rounded-lg transition ${
              viewAngle === "iso" ? "bg-white/20 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            3D Iso
          </button>
          <button
            onClick={() => setPresetView("top")}
            className={`px-2 py-0.5 rounded-lg transition ${
              viewAngle === "top" ? "bg-white/20 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Top 2D
          </button>
          <button
            onClick={() => setPresetView("side")}
            className={`px-2 py-0.5 rounded-lg transition ${
              viewAngle === "side" ? "bg-white/20 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Courtside
          </button>
        </div>
      </div>

      {/* Bottom Service Indicator Strip */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Serving:</span>
          <span className={servingTeam === "teamA" ? "text-emerald-400 font-bold truncate max-w-[120px]" : "text-slate-400 truncate max-w-[120px]"}>
            {teamAName} ({scoreA})
          </span>
          <span className="text-slate-600">vs</span>
          <span className={servingTeam === "teamB" ? "text-rose-400 font-bold truncate max-w-[120px]" : "text-slate-400 truncate max-w-[120px]"}>
            {teamBName} ({scoreB})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-[10px] border border-emerald-500/30">
            {servingCourtSide.toUpperCase()} COURT
          </span>
          <span className="text-[10px] text-slate-500 hidden md:inline">
            Drag to rotate 360°
          </span>
        </div>
      </div>
    </div>
  );
};
