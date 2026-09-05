import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Launcher3DSkinViewer } from './Launcher3DSkinViewer';
import * as skinview3d from 'skinview3d';

vi.mock('skinview3d', () => ({
  SkinViewer: vi.fn().mockImplementation(() => ({
    globalLight: { intensity: 0 },
    cameraLight: { intensity: 0 },
    camera: { position: { set: vi.fn() }, zoom: 0 },
    controls: { enableZoom: true, enableRotate: true, enablePan: false, minDistance: 0, maxDistance: 0 },
    animation: null,
    loadSkin: vi.fn(),
    loadCape: vi.fn(),
    resetCape: vi.fn(),
    dispose: vi.fn(),
  })),
  IdleAnimation: vi.fn().mockImplementation(() => ({ speed: 0 })),
  WalkingAnimation: vi.fn().mockImplementation(() => ({ speed: 0 })),
  RunningAnimation: vi.fn().mockImplementation(() => ({ speed: 0 })),
  FlyingAnimation: vi.fn().mockImplementation(() => ({ speed: 0 })),
}));

describe('Launcher3DSkinViewer', () => {
  const skinUrl = 'https://example.com/skin.png';
  const capeUrl = 'https://example.com/cape.png';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the canvas element', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} />);
    expect(screen.getByRole('canvas')).toBeInTheDocument();
  });

  it('should initialize the SkinViewer with correct parameters', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} width={300} height={400} />);
    expect(skinview3d.SkinViewer).toHaveBeenCalledWith({
      canvas: expect.any(Object),
      width: 300,
      height: 400,
      skin: skinUrl,
    });
  });

  it('should apply the correct animation based on animationType', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} animationType="walk" />);
    expect(skinview3d.WalkingAnimation).toHaveBeenCalledWith();
    expect(skinview3d.WalkingAnimation.prototype.speed).toBe(0.7);
  });

  it('should handle autoRotate correctly', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} autoRotate={true} />);
    expect(skinview3d.SkinViewer.prototype.autoRotate).toBe(true);
    expect(skinview3d.SkinViewer.prototype.autoRotateSpeed).toBe(0.8);
  });

  it('should load cape if capeUrl is provided', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} capeUrl={capeUrl} />);
    expect(skinview3d.SkinViewer.prototype.loadCape).toHaveBeenCalledWith(capeUrl);
  });

  it('should reset cape if capeUrl is not provided', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} />);
    expect(skinview3d.SkinViewer.prototype.resetCape).toHaveBeenCalled();
  });

  it('should handle isLoading state correctly', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} />);
    expect(screen.getByText('Cargando 3D...')).toBeInTheDocument();
  });

  it('should call onViewerReady callback when viewer is ready', () => {
    const onViewerReady = vi.fn();
    render(<Launcher3DSkinViewer skinUrl={skinUrl} onViewerReady={onViewerReady} />);
    expect(onViewerReady).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should handle dynamic skin update', () => {
    const { rerender } = render(<Launcher3DSkinViewer skinUrl={skinUrl} />);
    rerender(<Launcher3DSkinViewer skinUrl="https://example.com/new-skin.png" />);
    expect(skinview3d.SkinViewer.prototype.loadSkin).toHaveBeenCalledWith('https://example.com/new-skin.png');
  });

  it('should handle dynamic cape update', () => {
    const { rerender } = render(<Launcher3DSkinViewer skinUrl={skinUrl} />);
    rerender(<Launcher3DSkinViewer skinUrl={skinUrl} capeUrl="https://example.com/new-cape.png" />);
    expect(skinview3d.SkinViewer.prototype.loadCape).toHaveBeenCalledWith('https://example.com/new-cape.png');
  });

  it('should handle dynamic animation update', () => {
    const { rerender } = render(<Launcher3DSkinViewer skinUrl={skinUrl} animationType="idle" />);
    rerender(<Launcher3DSkinViewer skinUrl={skinUrl} animationType="walk" />);
    expect(skinview3d.WalkingAnimation).toHaveBeenCalledWith();
    expect(skinview3d.WalkingAnimation.prototype.speed).toBe(0.7);
  });

  it('should handle dynamic autoRotate update', () => {
    const { rerender } = render(<Launcher3DSkinViewer skinUrl={skinUrl} autoRotate={false} />);
    rerender(<Launcher3DSkinViewer skinUrl={skinUrl} autoRotate={true} />);
    expect(skinview3d.SkinViewer.prototype.autoRotate).toBe(true);
  });

  it('should handle boundary cases for width and height', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} width={0} height={0} />);
    expect(skinview3d.SkinViewer).toHaveBeenCalledWith({
      canvas: expect.any(Object),
      width: 0,
      height: 0,
      skin: skinUrl,
    });
  });

  it('should handle null and undefined values for optional props', () => {
    render(<Launcher3DSkinViewer skinUrl={skinUrl} />);
    expect(skinview3d.SkinViewer).toHaveBeenCalledWith({
      canvas: expect.any(Object),
      width: 240,
      height: 360,
      skin: skinUrl,
    });
  });

  it('should handle cleanup on component unmount', () => {
    const { unmount } = render(<Launcher3DSkinViewer skinUrl={skinUrl} />);
    unmount();
    expect(skinview3d.SkinViewer.prototype.dispose).toHaveBeenCalled();
  });
});
