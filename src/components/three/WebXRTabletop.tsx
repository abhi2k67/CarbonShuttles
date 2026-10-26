"use client";

import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import {
  COURT_DIMENSIONS,
  createBadmintonCourtTexture,
  createBadmintonNetGroup,
  createShuttlecockModel,
} from "./courtGeometry";
import { Smartphone, Glasses, CheckCircle2, X } from "lucide-react";

interface WebXRTabletopProps {
  onClose?: () => void;
}

export const WebXRTabletop: React.FC<WebXRTabletopProps> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check WebXR AR support asynchronously
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      const navXR = (navigator as unknown as { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }).xr;
      navXR
        ?.isSessionSupported("immersive-ar")
        .then((supported: boolean) => {
          setIsSupported(Boolean(supported));
        })
        .catch(() => {
          setIsSupported(false);
        });
    }

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    // Tabletop 3D Scene (Holographic Preview)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 3.5, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    container.replaceChildren(renderer.domElement);

    // Mini Tabletop Court
    const scale = 0.25; // Scaled down to fit on a coffee table
    const courtGeo = new THREE.PlaneGeometry(
      (COURT_DIMENSIONS.widthDoubles + 1) * scale,
      (COURT_DIMENSIONS.length + 1) * scale
    );
    const courtTex = createBadmintonCourtTexture();
    const courtMat = new THREE.MeshStandardMaterial({
      map: courtTex,
      roughness: 0.5,
      metalness: 0.1,
    });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.rotation.x = -Math.PI / 2;
    scene.add(courtMesh);

    const net = createBadmintonNetGroup();
    net.scale.setScalar(scale);
    scene.add(net);

    const shuttle = createShuttlecockModel(scale * 1.5);
    shuttle.position.set(0, 0.3, 0);
    scene.add(shuttle);

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0x00e5ff, 1.5);
    dir.position.set(2, 4, 2);
    scene.add(dir);

    // Append AR Button if WebXR is supported
    let arButtonEl: HTMLElement | null = null;
    if (renderer.xr) {
      try {
        arButtonEl = ARButton.createButton(renderer, {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: document.body },
        });
        arButtonEl.style.position = "absolute";
        arButtonEl.style.bottom = "20px";
        arButtonEl.style.left = "50%";
        arButtonEl.style.transform = "translateX(-50%)";
        arButtonEl.style.zIndex = "999";
        arButtonEl.style.backgroundColor = "#00e5ff";
        arButtonEl.style.color = "#000000";
        arButtonEl.style.fontWeight = "bold";
        arButtonEl.style.borderRadius = "12px";
        arButtonEl.style.padding = "10px 20px";
        container.appendChild(arButtonEl);
      } catch (e) {
        console.warn("Could not create AR Button:", e);
      }
    }

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow elegant holographic rotation
      courtMesh.rotation.z = elapsed * 0.15;
      net.rotation.y = -elapsed * 0.15;
      shuttle.position.y = 0.3 + Math.sin(elapsed * 3) * 0.08;
      shuttle.rotation.y = elapsed * 2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (arButtonEl && arButtonEl.parentNode) {
        arButtonEl.parentNode.removeChild(arButtonEl);
      }
      renderer.dispose();
      courtGeo.dispose();
      courtMat.dispose();
      courtTex.dispose();
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 space-y-4 text-white font-mono shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <Glasses className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">WebXR Augmented Reality</h3>
            <p className="text-[11px] text-slate-400">Holographic Tabletop Badminton Court</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSupported ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              AR Ready
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-400 text-[10px] flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              3D Simulation Mode
            </span>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-white/10 bg-black">
        <div ref={mountRef} className="w-full h-full" />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {isSupported
          ? "Tap 'START AR' below to anchor a 1:4 scale interactive badminton court right on your tabletop using Chrome on Android or WebXR viewer."
          : "WebXR AR is supported on compatible mobile browsers (Chrome Android / Apple Vision Pro / Meta Quest). On other devices, enjoy the interactive 3D holographic projection above."}
      </p>
    </div>
  );
};
