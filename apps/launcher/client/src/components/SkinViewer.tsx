import React, { useEffect, useRef } from "react";
import * as skinview3d from "skinview3d";
import { invoke } from "@tauri-apps/api/core";

interface SkinViewerProps {
  username: string;
  uuid?: string;
  capeUrl?: string;
  style?: React.CSSProperties;
}

export const SkinViewer: React.FC<SkinViewerProps> = ({ username, uuid, capeUrl, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<skinview3d.SkinViewer | null>(null);

  // 1. Initialize viewer (only when skin/canvas changes)
  useEffect(() => {
    if (!canvasRef.current) return;

    let isSubscribed = true;
    let skinViewer: skinview3d.SkinViewer | null = null;

    const initViewer = async () => {
      // Resolve skin URL from mc-heads using uuid or username
      // Offline UUID or generic guest accounts don't have valid online skins, fallback to Steve/Alex by mc-heads
      const identifier = uuid && uuid !== "00000000-0000-0000-0000-000000000000" ? uuid : username;
      const skinUrl = `https://mc-heads.net/skin/${identifier}`;

      if (!isSubscribed) return;

      console.log("Initializing SkinViewer for identifier:", identifier, "url:", skinUrl);

      try {
        skinViewer = new skinview3d.SkinViewer({
          canvas: canvasRef.current!,
          width: canvasRef.current!.clientWidth || 220,
          height: canvasRef.current!.clientHeight || 340,
          skin: skinUrl,
        });

        // Lighting configuration
        skinViewer.globalLight.intensity = 2.0;
        skinViewer.cameraLight.intensity = 2.0;

        // Walking animation
        const idleAnimation = new skinview3d.IdleAnimation();
        idleAnimation.speed = 0.5;
        skinViewer.animation = idleAnimation;

        // Auto rotation
        skinViewer.autoRotate = true;
        skinViewer.autoRotateSpeed = 0.7;

        // Adjust camera placement
        skinViewer.camera.position.set(0, 10, 55);
        skinViewer.zoom = 0.82;

        // Disable zoom interaction to prevent user breaking the layout
        if (skinViewer.controls) {
          skinViewer.controls.enableZoom = false;
        }

        viewerRef.current = skinViewer;
        
        // Initial cape load if present
        if (capeUrl) {
          updateCape(skinViewer, capeUrl);
        }
      } catch (err) {
        console.error("Failed to initialize skinview3d:", err);
      }
    };

    const updateCape = async (viewer: skinview3d.SkinViewer, url: string) => {
      let resolved = url;
      if (url && url.startsWith("http")) {
        try {
          resolved = await invoke<string>("fetch_image_base64", { url });
        } catch (err) {
          console.error("Failed to proxy initial cape:", err);
          return;
        }
      }
      if (isSubscribed && viewer) {
        viewer.loadCape(resolved);
      }
    };

    initViewer();

    // Resize handler
    const handleResize = () => {
      if (skinViewer && canvasRef.current) {
        skinViewer.width = canvasRef.current.clientWidth;
        skinViewer.height = canvasRef.current.clientHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isSubscribed = false;
      window.removeEventListener("resize", handleResize);
      if (skinViewer) {
        skinViewer.dispose();
      }
      viewerRef.current = null;
    };
  }, [username, uuid]);

  // 2. Load / Update Cape dynamically when capeUrl changes (no re-creation of viewer)
  useEffect(() => {
    let isSubscribed = true;

    const updateCapeDynamically = async () => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      let resolvedCapeUrl = capeUrl;
      if (capeUrl && capeUrl.startsWith("http")) {
        try {
          resolvedCapeUrl = await invoke<string>("fetch_image_base64", { url: capeUrl });
        } catch (err) {
          console.error("Failed to proxy cape image through backend:", err);
          resolvedCapeUrl = undefined;
        }
      }

      if (!isSubscribed) return;

      try {
        console.log("Loading cape dynamically, length:", resolvedCapeUrl?.length || 0);
        if (resolvedCapeUrl) {
          viewer.loadCape(resolvedCapeUrl);
        } else {
          viewer.loadCape(null);
        }
      } catch (err) {
        console.error("Failed to load cape in viewer:", err);
      }
    };

    updateCapeDynamically();

    return () => {
      isSubscribed = false;
    };
  }, [capeUrl]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", ...style }}>
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
    </div>
  );
};
