import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Launcher3DSkinViewer } from '../Launcher3DSkinViewer';

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

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  m: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, button: ({ children, ...p }: any) => <button {...p}>{children}</button>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  LazyMotion: ({ children }: any) => <>{children}</>,
  domAnimation: {},
}));

describe('Launcher3DSkinViewer', () => {
  let mockOnViewerReady: jest.Mock;

  beforeEach(() => {
    mockOnViewerReady = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with default props', () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" />);
    expect(screen.getByText('Cargando 3D...')).toBeInTheDocument();
  });

  it('calls onViewerReady with the viewer instance', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" onViewerReady={mockOnViewerReady} />);
    await waitFor(() => expect(mockOnViewerReady).toHaveBeenCalled());
    expect(mockOnViewerReady).toHaveBeenCalledWith(expect.any(Object));
  });

  it('loads skin when skinUrl changes', async () => {
    const { rerender } = render(<Launcher3DSkinViewer skinUrl="test-skin-url" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    rerender(<Launcher3DSkinViewer skinUrl="new-skin-url" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(viewer.loadSkin).toHaveBeenCalledWith('new-skin-url');
  });

  it('loads cape when capeUrl changes', async () => {
    const { rerender } = render(<Launcher3DSkinViewer skinUrl="test-skin-url" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    rerender(<Launcher3DSkinViewer skinUrl="test-skin-url" capeUrl="test-cape-url" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(viewer.loadCape).toHaveBeenCalledWith('test-cape-url');
  });

  it('resets cape when capeUrl is removed', async () => {
    const { rerender } = render(<Launcher3DSkinViewer skinUrl="test-skin-url" capeUrl="test-cape-url" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    rerender(<Launcher3DSkinViewer skinUrl="test-skin-url" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(viewer.resetCape).toHaveBeenCalled();
  });

  it('applies idle animation when animationType is idle', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" animationType="idle" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(vi.mocked(skinview3d).IdleAnimation).toHaveBeenCalled();
    expect(viewer.animation).toBeInstanceOf(vi.mocked(skinview3d).IdleAnimation);
  });

  it('applies walk animation when animationType is walk', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" animationType="walk" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(vi.mocked(skinview3d).WalkingAnimation).toHaveBeenCalled();
    expect(viewer.animation).toBeInstanceOf(vi.mocked(skinview3d).WalkingAnimation);
  });

  it('applies run animation when animationType is run', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" animationType="run" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(vi.mocked(skinview3d).RunningAnimation).toHaveBeenCalled();
    expect(viewer.animation).toBeInstanceOf(vi.mocked(skinview3d).RunningAnimation);
  });

  it('applies fly animation when animationType is fly', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" animationType="fly" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(vi.mocked(skinview3d).FlyingAnimation).toHaveBeenCalled();
    expect(viewer.animation).toBeInstanceOf(vi.mocked(skinview3d).FlyingAnimation);
  });

  it('sets no animation when animationType is none', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" animationType="none" />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(viewer.animation).toBeNull();
  });

  it('enables autoRotate when autoRotate is true', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" autoRotate={true} />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(viewer.autoRotate).toBe(true);
  });

  it('disables autoRotate when autoRotate is false', async () => {
    render(<Launcher3DSkinViewer skinUrl="test-skin-url" autoRotate={false} />);
    await waitFor(() => expect(screen.getByText('Cargando 3D...')).toBeInTheDocument());

    const viewer = new (vi.mocked(skinview3d).SkinViewer)();
    expect(viewer.autoRotate).toBe(false);
  });
});
