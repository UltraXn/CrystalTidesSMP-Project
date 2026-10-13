import { describe, it, expect } from 'vitest';
import * as Components from '../index';

describe('components index module', () => {
  it('should export all components correctly', () => {
    expect(Components).toHaveProperty('CrystalClientView');
    expect(Components).toHaveProperty('LauncherLoginView');
    expect(Components).toHaveProperty('LauncherSidebar');
    expect(Components).toHaveProperty('LauncherTitleBar');
    expect(Components).toHaveProperty('LauncherHeroBanner');
    expect(Components).toHaveProperty('LauncherActionDeck');
    expect(Components).toHaveProperty('LauncherNewsFeed');
    expect(Components).toHaveProperty('LauncherFriendsPanel');
    expect(Components).toHaveProperty('LauncherChatPopup');
    expect(Components).toHaveProperty('LauncherChangeVersionView');
    expect(Components).toHaveProperty('LauncherVersionConfigModal');
    expect(Components).toHaveProperty('LauncherLockerView');
    expect(Components).toHaveProperty('LauncherGalleryView');
    expect(Components).toHaveProperty('LauncherRelayChatView');
    expect(Components).toHaveProperty('LauncherCrashModal');
    expect(Components).toHaveProperty('RewardsPage');
    expect(Components).toHaveProperty('PlayerStatsWidget');
    expect(Components).toHaveProperty('AccountSwitcherModal');
    expect(Components).toHaveProperty('RoleBadge');
    expect(Components).toHaveProperty('UpdaterModal');
    expect(Components).toHaveProperty('Launcher3DSkinViewer');
    expect(Components).toHaveProperty('LauncherLoadingScreen');
    expect(Components).toHaveProperty('LauncherLegalModal');
  });

  it('should not export empty or undefined components', () => {
    expect(Components.CrystalClientView).toBeDefined();
    expect(Components.LauncherLoginView).toBeDefined();
    expect(Components.LauncherSidebar).toBeDefined();
    expect(Components.LauncherTitleBar).toBeDefined();
    expect(Components.LauncherHeroBanner).toBeDefined();
    expect(Components.LauncherActionDeck).toBeDefined();
    expect(Components.LauncherNewsFeed).toBeDefined();
    expect(Components.LauncherFriendsPanel).toBeDefined();
    expect(Components.LauncherChatPopup).toBeDefined();
    expect(Components.LauncherChangeVersionView).toBeDefined();
    expect(Components.LauncherVersionConfigModal).toBeDefined();
    expect(Components.LauncherLockerView).toBeDefined();
    expect(Components.LauncherGalleryView).toBeDefined();
    expect(Components.LauncherRelayChatView).toBeDefined();
    expect(Components.LauncherCrashModal).toBeDefined();
    expect(Components.RewardsPage).toBeDefined();
    expect(Components.PlayerStatsWidget).toBeDefined();
    expect(Components.AccountSwitcherModal).toBeDefined();
    expect(Components.RoleBadge).toBeDefined();
    expect(Components.UpdaterModal).toBeDefined();
    expect(Components.Launcher3DSkinViewer).toBeDefined();
    expect(Components.LauncherLoadingScreen).toBeDefined();
    expect(Components.LauncherLegalModal).toBeDefined();
  });

  it('should export loader and branding logos correctly', () => {
    expect(Components.FabricLogo).toBeDefined();
    expect(Components.ForgeLogo).toBeDefined();
    expect(Components.NeoForgeLogo).toBeDefined();
    expect(Components.QuiltLogo).toBeDefined();
    expect(Components.VanillaLogo).toBeDefined();
    expect(Components.CrystalSolidMonogram).toBeDefined();
    expect(Components.CrystalTidesLogo).toBeDefined();
  });
});
