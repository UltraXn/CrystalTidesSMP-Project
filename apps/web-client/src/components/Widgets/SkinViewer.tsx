import { useEffect, useRef, useState } from 'react';
import { SkinViewer, IdleAnimation, WalkingAnimation } from 'skinview3d';

interface SkinViewerProps {
    skinUrl: string;
    width?: number;
    height?: number;
}

const SkinViewerComponent = ({ skinUrl, width = 300, height = 400 }: SkinViewerProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewerRef = useRef<SkinViewer | null>(null);

    // 1. Observer for visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { rootMargin: '100px 0px' } // Pre-load slightly before appearing
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
             observer.disconnect();
        };
    }, []);

    // 2. Initialize Viewer when visible
    useEffect(() => {
        if (!isVisible || !canvasRef.current) return;

        let viewer: SkinViewer | null = null;

        // Initialize
        try {
            viewer = new SkinViewer({
                canvas: canvasRef.current,
                width: width,
                height: height,
                skin: skinUrl,
            });

            // Animation
            if (typeof IdleAnimation !== 'undefined') {
                viewer.animation = new IdleAnimation();
                viewer.animation.paused = true;
            } else if (typeof WalkingAnimation !== 'undefined') {
                viewer.animation = new WalkingAnimation();
                viewer.animation.paused = true;
            }

            // Controls
            viewer.controls.enableZoom = false;
            viewer.camera.position.z = 80;
            viewer.controls.target.y = 12;

            viewerRef.current = viewer;
        } catch (error) {
            console.error("Failed to initialize SkinViewer", error);
        }

        // Cleanup function
        return () => {
            if (viewer) {
                try {
                    // Stop animation & render loop first to prevent frame ticks on disposed context
                    if (viewer.animation) {
                        viewer.animation.paused = true;
                    }
                    viewer.dispose();
                } catch {
                    // Ignore benign WebGL dispose race conditions during React Strict Mode unmount
                } finally {
                    viewerRef.current = null;
                }
            }
        };
    }, [isVisible, skinUrl, width, height]);

    return (
        <div ref={containerRef} className="skin-viewer-container" style={{ width: width, height: height, position: 'relative', zIndex: 2 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: isVisible ? 'block' : 'none' }} />
        </div>
    );
};

export default SkinViewerComponent;
