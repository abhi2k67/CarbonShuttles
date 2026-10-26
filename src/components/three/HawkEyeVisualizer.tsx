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
import { Zap, Play, RotateCcw, X, CheckCircle2, AlertOctagon } from "lucide-react";

export type ShotType = "smash" | "drop" | "clear" | "drive";

interface HawkEyeVisualizerProps {
  isOpen?: boolean;
  onClose?: () => void;
  teamA?: string;
  teamB?: string;
  scoringTeam?: "teamA" | "teamB";
  initialShotType?: ShotType;
}

export const HawkEyeVisualizer: React.FC<HawkEyeVisualizerProps> = ({
  isOpen = true,
  onClose,
  teamA = "Team A",
  teamB = "Team B",
  scoringTeam = "teamA",
  initialShotType = "smash",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [shotType, setShotType] = useState<ShotType>(initialShotType);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [pointVerdict, setPointVerdict] = useState<"IN" | "OUT">("IN");
  const [shotSpeedKmh, setShotSpeedKmh] = useState<number>(328);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Animation state refs
  const shuttleMeshRef = useRef<THREE.Group | null>(null);
  const trailLineRef = useRef<THREE.Line | null>(null);
  const impactRingRef = useRef<THREE.Mesh | null>(null);
  const progressRef = useRef<number>(0);
  const trajectoryPointsRef = useRef<THREE.Vector3[]>([]);

  // Calculate realistic aerodynamic badminton trajectory curve
  const computeTrajectory = (type: ShotType): { points: THREE.Vector3[]; isIn: boolean; speed: number } => {
    const points: THREE.Vector3[] = [];
    let start = new THREE.Vector3(0, 2.4, 4.8); // Attacker contact point
    let target = new THREE.Vector3(0, 0, 0);
    let speed = 328;
    let isIn = true;

    if (type === "smash") {
      start = new THREE.Vector3(1.2, 2.7, 4.5);
      // Lands near the singles line on opponent's court
      target = new THREE.Vector3(2.35, 0.05, -3.8); // Near singles sideline
      speed = 346;
      isIn = true;
    } else if (type === "drop") {
      start = new THREE.Vector3(-0.8, 2.5, 4.2);
      // Soft drop right over net
      target = new THREE.Vector3(-1.4, 0.05, -1.2);
      speed = 142;
      isIn = true;
    } else if (type === "clear") {
      start = new THREE.Vector3(0.5, 2.2, 4.8);
      // Deep high clear hitting back boundary line
      target = new THREE.Vector3(0.8, 0.05, -6.65); // Just touching the line
      speed = 224;
      isIn = true;
    } else {
      // Fast drive
      start = new THREE.Vector3(-1.0, 1.4, 3.5);
      target = new THREE.Vector3(2.2, 0.05, -4.2);
      speed = 278;
      isIn = true;
    }

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Parabolic arc with aerodynamic steep descent
      const x = THREE.MathUtils.lerp(start.x, target.x, t);
      const z = THREE.MathUtils.lerp(start.z, target.z, t);

      // Height formula with aerodynamic drop-off
      let y = 0;
      if (type === "smash") {
        y = start.y * (1 - t * t) + target.y * (t * t);
      } else if (type === "clear") {
        // High apex above net
        const apex = 5.8;
        y = start.y * (1 - t) + target.y * t + apex * Math.sin(t * Math.PI);
      } else if (type === "drop") {
        // Peaks gently then drops steep
        const apex = 1.9;
        y = start.y * (1 - t) + target.y * t + apex * Math.sin(t * Math.PI * 0.85);
      } else {
        // Drive flat skimming net
        const apex = 0.8;
        y = start.y * (1 - t) + target.y * t + apex * Math.sin(t * Math.PI);
      }

      points.push(new THREE.Vector3(x, Math.max(0.04, y), z));
    }

    return { points, isIn, speed };
  };

  useEffect(() => {
    if (!isOpen) return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a14);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 6, 8);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controlsRef.current = controls;

    // 5. Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(6, 12, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Stadium spotlights
    const spotCyan = new THREE.SpotLight(0x00e5ff, 2.0, 30, Math.PI / 3);
    spotCyan.position.set(0, 10, 0);
    scene.add(spotCyan);

    // 6. Court & Net
    const courtWidth = COURT_DIMENSIONS.widthDoubles + 2.0;
    const courtLength = COURT_DIMENSIONS.length + 2.0;
    const courtGeo = new THREE.PlaneGeometry(courtWidth, courtLength);
    const courtTex = createBadmintonCourtTexture();
    const courtMat = new THREE.MeshStandardMaterial({ map: courtTex, roughness: 0.5 });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.rotation.x = -Math.PI / 2;
    courtMesh.receiveShadow = true;
    scene.add(courtMesh);

    const netGroup = createBadmintonNetGroup();
    scene.add(netGroup);

    // 7. Shuttlecock
    const shuttle = createShuttlecockModel(1.1);
    shuttle.castShadow = true;
    scene.add(shuttle);
    shuttleMeshRef.current = shuttle;

    // 8. Trajectory Glowing Trail (Line)
    const { points, isIn, speed } = computeTrajectory(shotType);
    trajectoryPointsRef.current = points;
    setPointVerdict(isIn ? "IN" : "OUT");
    setShotSpeedKmh(speed);

    const trailGeo = new THREE.BufferGeometry().setFromPoints(points);
    const trailMat = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      linewidth: 3,
      transparent: true,
      opacity: 0.85,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);
    trailLineRef.current = trailLine;

    // 9. Impact Landing Shockwave Ring
    const ringGeo = new THREE.RingGeometry(0.05, 0.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const impactRing = new THREE.Mesh(ringGeo, ringMat);
    impactRing.rotation.x = -Math.PI / 2;
    const endPoint = points[points.length - 1];
    impactRing.position.set(endPoint.x, 0.02, endPoint.z);
    scene.add(impactRing);
    impactRingRef.current = impactRing;

    // 10. Animation Loop
    let animationFrameId: number;
    let tProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isSimulating && points.length > 0) {
        tProgress += 0.018; // Speed of playback
        if (tProgress > 1.4) {
          tProgress = 0; // Loop replay
        }

        const clampedT = Math.min(1, tProgress);
        const currentIndex = Math.floor(clampedT * (points.length - 1));
        const currentPt = points[currentIndex];

        if (shuttle && currentPt) {
          shuttle.position.copy(currentPt);

          // Rotate shuttle so head faces movement direction
          if (currentIndex < points.length - 1) {
            const nextPt = points[currentIndex + 1];
            shuttle.lookAt(nextPt);
          }
        }

        // Pulse impact ring when shuttle lands
        if (impactRing) {
          if (clampedT >= 0.98) {
            const impactAge = (tProgress - 1) * 3;
            impactRing.scale.setScalar(1 + impactAge * 2);
            (impactRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - impactAge);
          } else {
            (impactRing.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
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
      controls.dispose();
      renderer.dispose();
      courtGeo.dispose();
      courtMat.dispose();
      courtTex.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      container.replaceChildren();
    };
  }, [isOpen, shotType, isSimulating]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.3)] flex flex-col">
        {/* Top Hawk-Eye Broadcast Banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <Zap className="w-5 h-5 fill-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-cyan-400 tracking-widest uppercase">
                  HAWK-EYE 3D TELEMETRY
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                  BWF CERTIFIED
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Point Trajectory & Line Call Review
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Verdict Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-4 h-4" />
              VERDICT: {pointVerdict}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 3D Simulation Canvas Container */}
        <div className="relative w-full h-[400px] sm:h-[480px] bg-black">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Telemetry HUD Overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none font-mono">
            <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-400">Exit Velocity: </span>
              <span className="text-cyan-400 font-black text-sm">{shotSpeedKmh} km/h</span>
            </div>
            <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-400">Contact Point: </span>
              <span className="text-white font-bold">{teamA}</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-400 pointer-events-none">
            Drag to Rotate 360° • Scroll to Zoom
          </div>
        </div>

        {/* Bottom Playback & Shot Selector Controls */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Shot Archetype Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">Rally Shot:</span>
            {(["smash", "drop", "clear", "drive"] as ShotType[]).map((type) => (
              <button
                key={type}
                onClick={() => setShotType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition cursor-pointer border ${
                  shotType === type
                    ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Replay Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isSimulating ? "Pause Replay" : "Resume Loop"}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.5)]"
              >
                Return to Match
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
