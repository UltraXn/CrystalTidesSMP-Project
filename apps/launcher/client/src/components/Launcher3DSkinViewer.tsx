import React, { useEffect, useRef, useState } from "react";
import * as skinview3d from "skinview3d";

interface Launcher3DSkinViewerProps {
  skinUrl: string;
  capeUrl?: string;
  width?: number;
  height?: number;
  animationType?: "idle" | "walk" | "run" | "fly" | "none";
  autoRotate?: boolean;
  onViewerReady?: (viewer: skinview3d.SkinViewer) => void;
  style?: React.CSSProperties;
}

export const Launcher3DSkinViewer: React.FC<Launcher3DSkinViewerProps> = ({
  skinUrl,
  capeUrl,
  width = 240,
  height = 360,
  animationType = "idle",
  autoRotate = false,
  onViewerReady,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<skinview3d.SkinViewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initialize viewer
  useEffect(() => {
    if (!canvasRef.current) return;

    let isSubscribed = true;
    setIsLoading(true);

    try {
      const viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width,
        height,
        skin: skinUrl,
      });

      // Lighting configuration
      viewer.globalLight.intensity = 2.4;
      viewer.cameraLight.intensity = 2.0;

      // Camera positioning
      viewer.camera.position.set(0, 10, 52);
      viewer.zoom = 0.88;

      // Controls
      if (viewer.controls) {
        viewer.controls.enableZoom = true;
        viewer.controls.enableRotate = true;
        viewer.controls.enablePan = false;
        viewer.controls.minDistance = 25;
        viewer.controls.maxDistance = 90;
      }

      // Animation
      applyAnimation(viewer, animationType);

      // Auto rotation
      viewer.autoRotate = autoRotate;
      viewer.autoRotateSpeed = 0.8;

      // Load cape if present
      if (capeUrl) {
        viewer.loadCape(capeUrl).catch((e) => console.warn("Failed to load cape in 3D viewer:", e));
      }

      viewerRef.current = viewer;
      onViewerReady?.(viewer);
      if (isSubscribed) setIsLoading(false);
    } catch (err) {
      console.error("Failed to init 3D skin viewer:", err);
      if (isSubscribed) setIsLoading(false);
    }

    return () => {
      isSubscribed = false;
      if (viewerRef.current) {
        try {
          if (viewerRef.current.animation) {
            viewerRef.current.animation.paused = true;
          }
          viewerRef.current.dispose();
        } catch {
          // ignore cleanup race conditions
        } finally {
          viewerRef.current = null;
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // 2. Dynamically update skin
  useEffect(() => {
    if (viewerRef.current && skinUrl) {
      viewerRef.current.loadSkin(skinUrl).catch((e) => {
        console.warn("Could not load 3D skin texture:", e);
      });
    }
  }, [skinUrl]);

  // 3. Dynamically update cape
  useEffect(() => {
    if (viewerRef.current) {
      if (capeUrl) {
        viewerRef.current.loadCape(capeUrl).catch((e) => {
          console.warn("Could not load 3D cape texture:", e);
        });
      } else {
        viewerRef.current.resetCape();
      }
    }
  }, [capeUrl]);

  // 4. Dynamically update animation
  useEffect(() => {
    if (viewerRef.current) {
      applyAnimation(viewerRef.current, animationType);
    }
  }, [animationType]);

  // 5. Dynamically update auto rotate
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const applyAnimation = (viewer: skinview3d.SkinViewer, anim: string) => {
    switch (anim) {
      case "idle": {
        const idle = new skinview3d.IdleAnimation();
        idle.speed = 0.6;
        viewer.animation = idle;
        break;
      }
      case "walk": {
        const walk = new skinview3d.WalkingAnimation();
        walk.speed = 0.7;
        viewer.animation = walk;
        break;
      }
      case "run": {
        const run = new skinview3d.RunningAnimation();
        run.speed = 0.8;
        viewer.animation = run;
        break;
      }
      case "fly": {
        const fly = new skinview3d.FlyingAnimation();
        fly.speed = 0.7;
        viewer.animation = fly;
        break;
      }
      case "none":
      default:
        viewer.animation = null;
        break;
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          outline: "none",
          cursor: "grab",
        }}
      />
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(5, 3, 7, 0.6)",
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: 12,
          }}
        >
          Cargando 3D...
        </div>
      )}
    </div>
  );
};
