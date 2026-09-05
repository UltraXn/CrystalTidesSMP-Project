import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { index } from '../index';

describe('index', () => {
  beforeEach(() => {
    // Mockea cualquier dependencia externa si es necesario
  });

  afterEach(() => {
    // Limpia cualquier mockeo después de cada prueba
  });

  it('should export all components correctly', () => {
    expect(index).toHaveProperty('CrystalClientView');
    expect(index).toHaveProperty('LauncherLoginView');
    expect(index).toHaveProperty('LauncherSidebar');
    expect(index).toHaveProperty('LauncherTitleBar');
    expect(index).toHaveProperty('LauncherHeroBanner');
    expect(index).toHaveProperty('LauncherActionDeck');
    expect(index).toHaveProperty('LauncherNewsFeed');
    expect(index).toHaveProperty('LauncherFriendsPanel');
    expect(index).toHaveProperty('LauncherChatPopup');
    expect(index).toHaveProperty('LauncherChangeVersionView');
    expect(index).toHaveProperty('LauncherVersionConfigModal');
    expect(index).toHaveProperty('LauncherLockerView');
    expect(index).toHaveProperty('LauncherGalleryView');
    expect(index).toHaveProperty('LauncherRelayChatView');
    expect(index).toHaveProperty('LauncherCrashModal');
    expect(index).toHaveProperty('RewardsPage');
    expect(index).toHaveProperty('PlayerStatsWidget');
    expect(index).toHaveProperty('AccountSwitcherModal');
    expect(index).toHaveProperty('RoleBadge');
    expect(index).toHaveProperty('UpdaterModal');
    expect(index).toHaveProperty('Launcher3DSkinViewer');
    expect(index).toHaveProperty('LauncherLoadingScreen');
    expect(index).toHaveProperty('LauncherLegalModal');
  });

  it('should not export empty components', () => {
    expect(index.CrystalClientView).not.toBeUndefined();
    expect(index.LauncherLoginView).not.toBeUndefined();
    expect(index.LauncherSidebar).not.toBeUndefined();
    expect(index.LauncherTitleBar).not.toBeUndefined();
    expect(index.LauncherHeroBanner).not.toBeUndefined();
    expect(index.LauncherActionDeck).not.toBeUndefined();
    expect(index.LauncherNewsFeed).not.toBeUndefined();
    expect(index.LauncherFriendsPanel).not.toBeUndefined();
    expect(index.LauncherChatPopup).not.toBeUndefined();
    expect(index.LauncherChangeVersionView).not.toBeUndefined();
    expect(index.LauncherVersionConfigModal).not.toBeUndefined();
    expect(index.LauncherLockerView).not.toBeUndefined();
    expect(index.LauncherGalleryView).not.toBeUndefined();
    expect(index.LauncherRelayChatView).not.toBeUndefined();
    expect(index.LauncherCrashModal).not.toBeUndefined();
    expect(index.RewardsPage).not.toBeUndefined();
    expect(index.PlayerStatsWidget).not.toBeUndefined();
    expect(index.AccountSwitcherModal).not.toBeUndefined();
    expect(index.RoleBadge).not.toBeUndefined();
    expect(index.UpdaterModal).not.toBeUndefined();
    expect(index.Launcher3DSkinViewer).not.toBeUndefined();
    expect(index.LauncherLoadingScreen).not.toBeUndefined();
    expect(index.LauncherLegalModal).not.toBeUndefined();
  });

  it('should export types and Logos correctly', () => {
    expect(index).toHaveProperty('types');
    expect(index).toHaveProperty('Logos');
  });
});
