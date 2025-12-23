import { useEffect, useRef } from 'react';
import { SkinViewer, IdleAnimation, WalkingAnimation } from 'skinview3d';

interface SkinViewerProps {
    skinUrl: string;
    width?: number;
    height?: number;
}

const SkinViewerComponent = ({ skinUrl, width = 300, height = 400 }: SkinViewerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewerRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize the viewer
        try {
            const viewer = new SkinViewer({
                canvas: canvasRef.current,
                width: width,
                height: height,
                skin: skinUrl,
            });

            // Set animation if available, otherwise just render
            // Use WalkingAnimation paused as a fallback for a natural pose if Idle is missing
            if (typeof IdleAnimation !== 'undefined') {
                viewer.animation = new IdleAnimation();
                viewer.animation.paused = true;
            } else if (typeof WalkingAnimation !== 'undefined') {
                viewer.animation = new WalkingAnimation();
                viewer.animation.paused = true;
            }

            // Adjust controls - disable zoom if desired
            viewer.controls.enableZoom = true; // Fixed zoom level
            viewer.camera.position.z = 60; // Closer zoom (default is usually ~60-70)
            // Shift the camera target UP so the model appears LOWER in the frame
            viewer.controls.target.y = 5; // Slight adjustment based on feedback

            viewerRef.current = viewer;
        } catch (error) {
            console.error("Failed to initialize SkinViewer", error);
        }

        // Cleanup
        return () => {
            if (viewerRef.current) {
                viewerRef.current.dispose();
                viewerRef.current = null;
            }
        };
    }, [skinUrl, width, height]);

    return (
        <div className="skin-viewer-container" style={{ width: width, height: height, position: 'relative', zIndex: 2 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default SkinViewerComponent;
