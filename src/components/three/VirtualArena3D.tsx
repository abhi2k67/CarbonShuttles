"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  COURT_DIMENSIONS,
  createBadmintonCourtTexture,
  createBadmintonNetGroup,
  createMatchPointShaderMaterial,
} from "./courtGeometry";
import { Match, OngoingMatch, ScheduledMatch, CATEGORY_SHORT } from "@/types/tournament";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Radio,
  Eye,
  Zap,
  Clock,
  Trophy,
  ChevronRight,
  Layers,
} from "lucide-react";

interface VirtualArena3DProps {
  matches: Match[];
  onOpenUmpire?: (courtNumber: number) => void;
  onOpenHawkEye?: (match: Match) => void;
  isAdmin?: boolean;
  selectedCourtFocus?: number | null;
}

// 6 Court positions in the 3D stadium: 2 rows of 3 courts
// Row 1 (Near): Courts 1, 2, 3 (Z = 12)
// Row 2 (Far): Courts 4, 5, 6 (Z = -12)
// Spacing between courts: X = -14, 0, 14
const COURT_SPATIAL_COORDS: Record<number, { x: number; z: number }> = {
  1: { x: -14, z: 12 },
  2: { x: 0, z: 12 },
  3: { x: 14, z: 12 },
  4: { x: -14, z: -12 },
  5: { x: 0, z: -12 },
  6: { x: 14, z: -12 },
};

/**
 * Creates dynamic canvas texture for a floating 3D court billboard scoreboard
 */
function createCourtScoreboardTexture(courtNum: number, match: Match | null): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const W = canvas.width;
  const H = canvas.height;

  // Background
  const isOngoing = match?.status === "ongoing";
  const isScheduled = match?.status === "scheduled";
  const ongoing = isOngoing ? (match as OngoingMatch) : null;

  ctx.fillStyle = isOngoing ? "rgba(10, 20, 35, 0.95)" : "rgba(15, 23, 42, 0.9)";
  ctx.roundRect(4, 4, W - 8, H - 8, 20);
  ctx.fill();

  // Border
  ctx.lineWidth = 6;
  if (isOngoing) {
    if (ongoing?.isMatchPoint) {
      ctx.strokeStyle = "#ef4444"; // Red Match Point
    } else if (ongoing?.isGamePoint) {
      ctx.strokeStyle = "#f59e0b"; // Amber Game Point
    } else {
      ctx.strokeStyle = "#10b981"; // Emerald Ongoing
    }
  } else if (isScheduled) {
    ctx.strokeStyle = "#94a3b8";
  } else {
    ctx.strokeStyle = "#475569";
  }
  ctx.stroke();

  // Header Bar: Court # and Status
  ctx.fillStyle = isOngoing ? "#10b981" : "#94a3b8";
  ctx.font = "bold 28px monospace";
  ctx.fillText(`COURT ${courtNum}`, 24, 46);

  ctx.textAlign = "right";
  ctx.font = "bold 22px monospace";
  if (isOngoing) {
    if (ongoing?.isMatchPoint) {
      ctx.fillStyle = "#ef4444";
      ctx.fillText("● MATCH POINT", W - 24, 46);
    } else if (ongoing?.isDeuce) {
      ctx.fillStyle = "#00e5ff";
      ctx.fillText("● DEUCE (14-14)", W - 24, 46);
    } else {
      ctx.fillStyle = "#10b981";
      ctx.fillText(`● SET ${ongoing?.currentSet} / 3`, W - 24, 46);
    }
  } else if (isScheduled) {
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("IN QUEUE", W - 24, 46);
  } else {
    ctx.fillStyle = "#64748b";
    ctx.fillText("VACANT", W - 24, 46);
  }

  // Divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 64);
  ctx.lineTo(W - 24, 64);
  ctx.stroke();

  ctx.textAlign = "left";

  if (isOngoing && ongoing) {
    // Team A
    ctx.fillStyle = ongoing.servingTeam === "teamA" ? "#34d399" : "#ffffff";
    ctx.font = "bold 28px sans-serif";
    const teamATrunc = ongoing.teamA.length > 16 ? ongoing.teamA.slice(0, 15) + "…" : ongoing.teamA;
    ctx.fillText(teamATrunc, 24, 116);

    ctx.textAlign = "right";
    ctx.font = "bold 44px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(ongoing.currentScore.teamA), W - 24, 120);

    // Team B
    ctx.textAlign = "left";
    ctx.fillStyle = ongoing.servingTeam === "teamB" ? "#34d399" : "#ffffff";
    ctx.font = "bold 28px sans-serif";
    const teamBTrunc = ongoing.teamB.length > 16 ? ongoing.teamB.slice(0, 15) + "…" : ongoing.teamB;
    ctx.fillText(teamBTrunc, 24, 186);

    ctx.textAlign = "right";
    ctx.font = "bold 44px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(ongoing.currentScore.teamB), W - 24, 190);

    // Footer info
    ctx.textAlign = "left";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "18px monospace";
    ctx.fillText(`${CATEGORY_SHORT[ongoing.category]} • ${ongoing.round}`, 24, 230);
  } else if (isScheduled && match) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(match.teamA, 24, 116);
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 20px monospace";
    ctx.fillText("VS", 24, 150);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(match.teamB, 24, 190);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "18px monospace";
    ctx.fillText(`${CATEGORY_SHORT[match.category]} • Scheduled ${match.scheduledTime}`, 24, 230);
  } else {
    ctx.fillStyle = "#64748b";
    ctx.font = "24px sans-serif";
    ctx.fillText("Standing by for next fixture...", 24, 130);
    ctx.font = "18px monospace";
    ctx.fillText("Ready for Umpire Check-in", 24, 180);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const VirtualArena3D: React.FC<VirtualArena3DProps> = ({
  matches,
  onOpenUmpire,
  onOpenHawkEye,
  isAdmin = false,
  selectedCourtFocus = null,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [focusedCourt, setFocusedCourt] = useState<number | null>(null);
  const [selectedCourtData, setSelectedCourtData] = useState<{
    courtNumber: number;
    match: Match | null;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Animation target for smooth camera transition
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 48, 55));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Store billboard textures to clean up
  const billboardMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const shaderMatsRef = useRef<THREE.ShaderMaterial[]>([]);

  // Setup Three.js 3D Virtual Stadium Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    scene.fog = new THREE.FogExp2(0x060914, 0.008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    camera.position.set(0, 48, 55);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 8;
    controls.maxDistance = 140;
    controlsRef.current = controls;

    // 5. Stadium Environment & Floor
    // Large dark arena floor surround
    const floorGeo = new THREE.PlaneGeometry(120, 100);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.75,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    // Stadium outer barriers / grandstand outline
    const wallGeo = new THREE.BoxGeometry(100, 4, 1);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const wallNorth = new THREE.Mesh(wallGeo, wallMat);
    wallNorth.position.set(0, 2, -35);
    scene.add(wallNorth);

    const wallSouth = new THREE.Mesh(wallGeo, wallMat);
    wallSouth.position.set(0, 2, 35);
    scene.add(wallSouth);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);

    const mainDirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainDirLight.position.set(20, 40, 20);
    mainDirLight.castShadow = true;
    mainDirLight.shadow.mapSize.width = 2048;
    mainDirLight.shadow.mapSize.height = 2048;
    scene.add(mainDirLight);

    // Reusable court mat geometry
    const courtWidth = COURT_DIMENSIONS.widthDoubles + 1.2;
    const courtLength = COURT_DIMENSIONS.length + 1.2;
    const courtGeo = new THREE.PlaneGeometry(courtWidth, courtLength);
    const courtTexture = createBadmintonCourtTexture();
    const courtMat = new THREE.MeshStandardMaterial({ map: courtTexture, roughness: 0.6 });

    // 6. Build the 6 Badminton Courts
    [1, 2, 3, 4, 5, 6].forEach((courtNum) => {
      const coords = COURT_SPATIAL_COORDS[courtNum];
      const match =
        matches.find((m): m is OngoingMatch => m.status === "ongoing" && m.courtNumber === courtNum) ||
        matches.find((m): m is ScheduledMatch => m.status === "scheduled" && m.courtNumber === courtNum) ||
        null;

      const isLive = match?.status === "ongoing";
      const isMatchPoint = isLive && (match as OngoingMatch).isMatchPoint;
      const isDeuce = isLive && (match as OngoingMatch).isDeuce;

      const courtGroup = new THREE.Group();
      courtGroup.position.set(coords.x, 0, coords.z);
      courtGroup.name = `court_${courtNum}`;

      // Court surface
      const courtMesh = new THREE.Mesh(courtGeo, courtMat);
      courtMesh.rotation.x = -Math.PI / 2;
      courtMesh.receiveShadow = true;
      courtGroup.add(courtMesh);

      // Net
      const net = createBadmintonNetGroup();
      courtGroup.add(net);

      // Spotlight over court
      const spotLight = new THREE.SpotLight(
        isLive ? (isMatchPoint ? 0xff003c : isDeuce ? 0x00e5ff : 0x10b981) : 0x64748b,
        isLive ? 2.5 : 0.8,
        35,
        Math.PI / 4,
        0.4
      );
      spotLight.position.set(0, 16, 0);
      spotLight.target = courtMesh;
      courtGroup.add(spotLight);

      // Match Point / Deuce Custom Shader Aura ring
      if (isLive && (isMatchPoint || isDeuce)) {
        const pulseMat = createMatchPointShaderMaterial(isMatchPoint ? 0xff003c : 0x00e5ff);
        shaderMatsRef.current.push(pulseMat);
        const auraGeo = new THREE.PlaneGeometry(courtWidth + 1.5, courtLength + 1.5);
        const auraMesh = new THREE.Mesh(auraGeo, pulseMat);
        auraMesh.rotation.x = -Math.PI / 2;
        auraMesh.position.y = 0.02;
        courtGroup.add(auraMesh);
      }

      // 3D Floating Scoreboard Billboard above court
      const billboardGeo = new THREE.PlaneGeometry(6.4, 3.2);
      const billboardTex = createCourtScoreboardTexture(courtNum, match);
      const billboardMat = new THREE.MeshBasicMaterial({
        map: billboardTex,
        side: THREE.DoubleSide,
        transparent: true,
      });
      billboardMatsRef.current.push(billboardMat);

      const billboardMesh = new THREE.Mesh(billboardGeo, billboardMat);
      billboardMesh.position.set(0, 5.2, 0);
      billboardMesh.name = `billboard_${courtNum}`;
      courtGroup.add(billboardMesh);

      scene.add(courtGroup);
    });

    // 7. Raycasting for Clicking 3D Courts
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        // Find which court group was clicked
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name.startsWith("court_") && obj.parent) {
          obj = obj.parent;
        }

        if (obj && obj.name.startsWith("court_")) {
          const courtNum = Number(obj.name.replace("court_", ""));
          if (courtNum >= 1 && courtNum <= 6) {
            focusOnCourt(courtNum);
          }
        }
      }
    };

    renderer.domElement.addEventListener("click", handlePointerDown);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update custom shaders
      shaderMatsRef.current.forEach((mat) => {
        if (mat.uniforms && mat.uniforms.time) {
          mat.uniforms.time.value = elapsedTime;
        }
      });

      // Smooth camera interpolation towards target
      camera.position.lerp(targetCamPos.current, 0.05);
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();

      // Make billboards always face towards camera (billboard orientation)
      scene.traverse((obj) => {
        if (obj.name.startsWith("billboard_")) {
          obj.quaternion.copy(camera.quaternion);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("click", handlePointerDown);
      controls.dispose();
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      courtGeo.dispose();
      courtMat.dispose();
      courtTexture.dispose();
      billboardMatsRef.current.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      shaderMatsRef.current.forEach((s) => s.dispose());
      container.replaceChildren();
    };
  }, [matches]);

  // Smoothly focus camera onto a specific court
  const focusOnCourt = (courtNum: number) => {
    setFocusedCourt(courtNum);
    const coords = COURT_SPATIAL_COORDS[courtNum];
    if (!coords) return;

    // Set camera target slightly above and in front of court
    targetCamPos.current.set(coords.x, 14, coords.z + 16);
    targetLookAt.current.set(coords.x, 1.5, coords.z);

    const match =
      matches.find((m): m is OngoingMatch => m.status === "ongoing" && m.courtNumber === courtNum) ||
      matches.find((m): m is ScheduledMatch => m.status === "scheduled" && m.courtNumber === courtNum) ||
      null;

    setSelectedCourtData({ courtNumber: courtNum, match });
  };

  // Reset camera to wide panoramic arena view
  const resetToOverview = () => {
    setFocusedCourt(null);
    setSelectedCourtData(null);
    targetCamPos.current.set(0, 48, 55);
    targetLookAt.current.set(0, 0, 0);
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950 transition-all duration-300 shadow-2xl ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "min-h-[580px] w-full"
      }`}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[580px] sm:h-[640px] cursor-grab active:cursor-grabbing"
      />

      {/* Top Header Bar & Telemetry HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-emerald-500/40 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>VIRTUAL 3D BWF ARENA</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-400">
            <span>Click any court to zoom • Drag to orbit • Scroll to zoom</span>
          </div>
        </div>

        {/* View Controls & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {focusedCourt !== null && (
            <button
              onClick={resetToOverview}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Full Arena View
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-black/70 hover:bg-black/90 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer shadow-md"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen 3D Arena"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Court Quick Switcher Strip (C1 - C6) */}
      <div className="absolute top-16 left-4 flex flex-wrap gap-1.5 pointer-events-auto z-10">
        {[1, 2, 3, 4, 5, 6].map((cNum) => {
          const match = matches.find((m) => m.status === "ongoing" && m.courtNumber === cNum);
          const isOngoing = !!match;
          const isSelected = focusedCourt === cNum;

          return (
            <button
              key={cNum}
              onClick={() => focusOnCourt(cNum)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md border ${
                isSelected
                  ? "bg-white text-slate-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                  : isOngoing
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                  : "bg-black/70 hover:bg-black/90 text-slate-300 border-white/10"
              }`}
            >
              {isOngoing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
              C{cNum}
            </button>
          );
        })}
      </div>

      {/* Selected Court Floating Inspection Card */}
      {selectedCourtData && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md p-4 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl text-white font-mono animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-sm font-bold text-emerald-400">
                COURT {selectedCourtData.courtNumber} SPOTLIGHT
              </span>
            </div>

            <button
              onClick={() => setSelectedCourtData(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {selectedCourtData.match ? (
            <div className="space-y-2">
              <div className="text-xs text-slate-400">
                {CATEGORY_SHORT[selectedCourtData.match.category]} • {selectedCourtData.match.round}
              </div>

              <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="truncate max-w-[180px] font-bold text-sm">
                  {selectedCourtData.match.teamA}
                </div>
                {selectedCourtData.match.status === "ongoing" && (
                  <div className="font-mono font-black text-emerald-400 text-lg">
                    {(selectedCourtData.match as OngoingMatch).currentScore.teamA}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="truncate max-w-[180px] font-bold text-sm">
                  {selectedCourtData.match.teamB}
                </div>
                {selectedCourtData.match.status === "ongoing" && (
                  <div className="font-mono font-black text-emerald-400 text-lg">
                    {(selectedCourtData.match as OngoingMatch).currentScore.teamB}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                {onOpenUmpire && (
                  <button
                    onClick={() => onOpenUmpire(selectedCourtData.courtNumber)}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Umpire Console
                  </button>
                )}

                {onOpenHawkEye && (
                  <button
                    onClick={() => onOpenHawkEye(selectedCourtData.match!)}
                    className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Hawk-Eye
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2 text-center text-xs text-slate-400">
              Court is currently idle. Awaiting next fixture assignment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
