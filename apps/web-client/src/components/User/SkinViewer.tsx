import { ReactSkinview3d } from 'react-skinview3d';
import {
  IdleAnimation,
  WalkingAnimation,
  RunningAnimation,
  FlyingAnimation,
  SkinViewer as SkinView3DViewer,
} from 'skinview3d';

interface SkinViewerProps {
  username: string;
  width?: number;
  height?: number;
  animation?: 'idle' | 'walk' | 'run' | 'fly';
  capeUrl?: string;
}

export default function SkinViewer({
  username,
  width = 300,
  height = 400,
  animation = 'idle',
  capeUrl,
}: Readonly<SkinViewerProps>) {
  const skinUrl = `https://mc-heads.net/skin/${username}`;

  // Map animation string to skinview3d animation class
  const getAnimation = () => {
    switch (animation) {
      case 'walk':
        return WalkingAnimation;
      case 'run':
        return RunningAnimation;
      case 'fly':
        return FlyingAnimation;
      default:
        return IdleAnimation;
    }
  };

  return (
    <div className="skin-viewer-container" style={{ cursor: 'grab' }}>
      <ReactSkinview3d
        skinUrl={skinUrl}
        capeUrl={capeUrl}
        height={height}
        width={width}
        onReady={({ viewer }: { viewer: SkinView3DViewer }) => {
          viewer.animation = new (getAnimation())();
          viewer.controls.enableZoom = false;
          viewer.autoRotate = true;
          viewer.autoRotateSpeed = 0.5;
        }}
      />
    </div>
  );
}
