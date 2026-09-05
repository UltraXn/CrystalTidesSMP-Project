import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../services/authContext";
import { launchGame, LaunchParams } from "../services/launcherService";
import { getSettings } from "../services/settingsService";
import { getProfile, getProfiles } from "../services/profileService";
import {
  getFriends,
  getFriendRequests,
  Friend,
  FriendRequest,
} from "../services/friendsService";
import { AccountSwitcherModal } from "./AccountSwitcherModal";
import { LauncherSidebar } from "./LauncherSidebar";
import { LauncherTitleBar } from "./LauncherTitleBar";
import { LauncherHeroBanner } from "./LauncherHeroBanner";
import { LauncherActionDeck } from "./LauncherActionDeck";
import { LauncherNewsFeed } from "./LauncherNewsFeed";
import { LauncherFriendsPanel } from "./LauncherFriendsPanel";
import { LauncherChatPopup } from "./LauncherChatPopup";
import { LauncherChangeVersionView } from "./LauncherChangeVersionView";
import { LauncherLockerView } from "./LauncherLockerView";
import { LauncherGalleryView } from "./LauncherGalleryView";
import { LauncherRelayChatView } from "./LauncherRelayChatView";
import { LauncherCrashModal } from "./LauncherCrashModal";
import { LauncherVersionConfigModal } from "./LauncherVersionConfigModal";
import { RewardsPage } from "./RewardsPage";
import { PlayerStatsWidget } from "./PlayerStatsWidget";
import {
  NavSection,
  WallpaperMode,
  ConnectionStatus,
  FriendEntry,
  ChatMessage,
} from "./types";
import {
  CrystalSolidMonogram,
  CrystalTidesLogo,
  FabricLogo,
  ForgeLogo,
  NeoForgeLogo,
  QuiltLogo,
} from "./Logos";

export {
  CrystalSolidMonogram,
  CrystalTidesLogo,
  FabricLogo,
  ForgeLogo,
  NeoForgeLogo,
  QuiltLogo,
};

interface CrystalClientViewProps {
  onSwitchToV1?: () => void;
}

const getAutoWallpaperMode = (): WallpaperMode => {
  const currentHour = new Date().getHours();
  // Día: 06:00 a 18:59 | Noche: 19:00 a 05:59
  return currentHour >= 6 && currentHour < 19 ? "day" : "night";
};

export const CrystalClientView: React.FC<CrystalClientViewProps> = () => {
  const { currentSession } = useAuth();
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isCrashModalOpen, setIsCrashModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("online");
  const [activeNav, setActiveNav] = useState<NavSection>("home");
  const [selectedProfile, setSelectedProfile] = useState<string>("hypixel");
  const [wallpaperMode, setWallpaperMode] = useState<WallpaperMode>(getAutoWallpaperMode);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAsset, setCurrentAsset] = useState("Resolviendo dependencias de Minecraft...");
  const [searchFriend, setSearchFriend] = useState("");
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [friendRequestsList, setFriendRequestsList] = useState<FriendRequest[]>([]);
  const [activeChatFriend, setActiveChatFriend] = useState<FriendEntry | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "them", text: "Are you hopping on Bedwars tonight?", time: "19:02" },
    { sender: "me", text: "Yeah, just launched the client!", time: "19:04" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const refreshFriends = useCallback(() => {
    setFriendsList(getFriends());
    setFriendRequestsList(getFriendRequests());
  }, []);

  useEffect(() => {
    refreshFriends();
    const profiles = getProfiles();
    if (profiles.length > 0) {
      setSelectedProfile(profiles[0].id);
    }
  }, [refreshFriends]);

  const friendsOnline: FriendEntry[] = friendsList
    .filter((f) => f.status !== "offline")
    .map((f) => ({
      name: f.username,
      avatar: f.avatar,
      status: f.activityServer || f.status,
      statusType: f.status,
      activityServer: f.activityServer,
      hasUnreadMessage: f.hasUnreadMessage,
    }));

  const friendsOffline: FriendEntry[] = friendsList
    .filter((f) => f.status === "offline")
    .map((f) => ({
      name: f.username,
      avatar: f.avatar,
      status: f.lastSeen || "Offline",
      statusType: "offline",
    }));

  const handleToggleConnection = () => {
    setConnectionStatus((prev: ConnectionStatus) => (prev === "online" ? "offline" : "online"));
  };

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch {
      // Browser preview mode fallback
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().toggleMaximize();
    } catch {
      // Browser preview mode fallback
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch {
      // Browser preview mode fallback
    }
  };

  const handleStartDrag = async (e: React.MouseEvent) => {
    if (e.button === 0) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().startDragging();
      } catch {
        // Browser fallback
      }
    }
  };

  const abortControllerRef = useRef<boolean>(false);

  const handleLaunch = async () => {
    if (!currentSession && connectionStatus !== "offline") {
      setIsAccountSwitcherOpen(true);
      return;
    }

    if (isDownloading) return;
    setIsDownloading(true);
    setIsPaused(false);
    setDownloadProgress(5);
    setCurrentAsset("Comprobando entorno de ejecución...");
    abortControllerRef.current = false;

    const settings = getSettings();
    const profile = getProfile(selectedProfile);

    const params: LaunchParams = {
      username: currentSession?.username || "Player",
      uuid: currentSession?.id || "00000000-0000-0000-0000-000000000000",
      accessToken: currentSession?.accessToken || "dummy-token",
      mcVersion: profile?.mcVersion || settings.mcVersion || "1.21.1",
      loaderType: profile?.loaderType || settings.loaderType || "neoforge",
      loaderVersion: profile?.loaderVersion || settings.loaderVersion || "21.1.65",
      minRam: profile?.minRam || settings.minRam || 2048,
      maxRam: profile?.maxRam || settings.maxRam || 6144,
      useOptimization: profile?.useOptimization ?? settings.useOptimization ?? true,
      gameDir: profile?.gameDir || settings.gameDir,
      javaArgs: profile?.javaArgs,
      javaPath: profile?.javaPath || settings.javaPath,
    };

    try {
      await launchGame(params, (statusText, progressFraction) => {
        if (!abortControllerRef.current) {
          setCurrentAsset(statusText);
          setDownloadProgress(Math.min(100, Math.max(5, Math.round(progressFraction * 100))));
        }
      });
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1200);
    } catch (err: unknown) {
      console.error("Game launch error:", err);
      setIsDownloading(false);
      setDownloadProgress(0);
      setIsCrashModalOpen(true);
    }
  };

  const handleTogglePause = () => {
    if (!isDownloading) return;
    if (isPaused) {
      setIsPaused(false);
      handleLaunch();
    } else {
      setIsPaused(true);
      abortControllerRef.current = true;
    }
  };

  const handleCancelDownload = () => {
    abortControllerRef.current = true;
    setIsDownloading(false);
    setIsPaused(false);
    setDownloadProgress(0);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setChatMessages((prev) => [
      ...prev,
      { sender: "me", text: chatInput, time: timeStr },
    ]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "them",
          text: "Let's run some games together!",
          time: timeStr,
        },
      ]);
    }, 1200);
  };

  const showFriendsPanel = activeNav === "home";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#090A0D",
        color: "#FAFCFF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          height: "100%",
          overflow: "hidden",
          position: "relative",
          userSelect: "none",
        }}
      >
        {/* 1. LEFT NAVIGATION SIDEBAR */}
        <LauncherSidebar
          activeNav={activeNav}
          onSelectNav={(nav) => {
            setActiveNav(nav);
          }}
        />

        {/* 2. RIGHT WORKSPACE COLUMN (Header + Main Canvas + Optional Friends) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Top Titlebar */}
          <LauncherTitleBar
            connectionStatus={connectionStatus}
            onToggleConnection={handleToggleConnection}
            onStartDrag={handleStartDrag}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />

          {/* Main Workspace Canvas */}
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Main Content Workspace */}
            <main
              style={{
                flex: 1,
                padding: "47px 54px 0 54px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: 28,
                background:
                  activeNav === "home"
                    ? wallpaperMode === "night"
                      ? "linear-gradient(180deg, rgba(9, 10, 13, 0.72) 0%, rgba(9, 10, 13, 0.92) 100%), url('/wallpapers/crystaltides_night.png') center/cover no-repeat"
                      : "linear-gradient(180deg, rgba(9, 10, 13, 0.72) 0%, rgba(9, 10, 13, 0.92) 100%), url('/wallpapers/crystaltides_day.png') center/cover no-repeat"
                    : "#090A0D",
                boxSizing: "border-box",
                position: "relative",
                transition: "background 400ms ease",
                height: "100%",
              }}
            >
              {/* ── HOME VIEW ── */}
              {activeNav === "home" && (
                <>
                  <LauncherHeroBanner
                    playerName={currentSession?.username || "Player"}
                    playerAvatar={
                      currentSession?.skinUrl ||
                      (currentSession?.username
                        ? `https://mc-heads.net/avatar/${currentSession.username}/24`
                        : "https://mc-heads.net/avatar/Steve/24")
                    }
                    lastPlayedServer="CrystalTides SMP"
                    lastPlayedTime="Recently"
                    totalPlaytime="1,364h"
                    wallpaperMode={wallpaperMode}
                    onSelectWallpaperMode={setWallpaperMode}
                    onOpenAccountSwitcher={() => setIsAccountSwitcherOpen(true)}
                  />

                  <LauncherActionDeck
                    isDownloading={isDownloading}
                    downloadProgress={downloadProgress}
                    currentAsset={currentAsset}
                    downloadedMB={78.4}
                    totalMB={112.5}
                    isPaused={isPaused}
                    isOffline={connectionStatus === "offline"}
                    onPauseDownload={handleTogglePause}
                    onCancelDownload={handleCancelDownload}
                    onLaunch={handleLaunch}
                    selectedProfile={selectedProfile}
                    onSelectProfile={setSelectedProfile}
                    onChangeVersion={() => setActiveNav("versions")}
                  />

                  <LauncherNewsFeed />
                </>
              )}

              {/* ── CHANGE VERSION VIEW ── */}
              {activeNav === "versions" && (
                <LauncherChangeVersionView
                  onLaunchVersion={(_ver) => {
                    setSelectedProfile(_ver);
                    setActiveNav("home");
                    handleLaunch();
                  }}
                  onOpenSettings={(_ver) => setActiveNav("settings")}
                />
              )}

              {/* ── LOCKER VIEW (Skins & Capes) ── */}
              {activeNav === "locker" && <LauncherLockerView />}

              {/* ── GALLERY VIEW (Screenshots & Smart Filters) ── */}
              {activeNav === "gallery" && <LauncherGalleryView />}

              {/* ── CRYSTAL RELAY VIEW (Full Messenger) ── */}
              {activeNav === "chat" && <LauncherRelayChatView />}

              {/* ── STORE / REWARDS VIEW ── */}
              {(activeNav === "store" || activeNav === "rewards") && (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
                  <RewardsPage />
                </div>
              )}

              {/* ── NOTIFICATIONS / STATS VIEW ── */}
              {(activeNav === "notifications" || activeNav === "stats") && (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
                  <PlayerStatsWidget />
                </div>
              )}

              {/* ── SETTINGS VIEW (Exact Noctra Style) ── */}
              {activeNav === "settings" && (
                <LauncherVersionConfigModal
                  isOpen={true}
                  versionId={selectedProfile}
                  initialTab="advanced"
                  onClose={() => setActiveNav("home")}
                />
              )}

              {/* ── CUENTAS & SESIÓN (Inline Page View) ── */}
              {activeNav === "profiles" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "0 4px" }}>
                  <AccountSwitcherModal
                    mode="inline"
                    onClose={() => setActiveNav("home")}
                    onNavigateSettings={() => {
                      setActiveNav("settings");
                    }}
                  />
                </div>
              )}
            </main>

            {/* Social & Friends Panel (Visible on Home) */}
            {showFriendsPanel && (
              <LauncherFriendsPanel
                friendsOnline={friendsOnline}
                friendsOffline={friendsOffline}
                friendRequests={friendRequestsList}
                searchFriend={searchFriend}
                onSearchFriendChange={setSearchFriend}
                onSelectFriendChat={setActiveChatFriend}
                onRefreshFriends={refreshFriends}
              />
            )}

            {/* Active Chat Popup Overlay (on Home) */}
            {activeChatFriend && (
              <LauncherChatPopup
                friend={activeChatFriend}
                messages={chatMessages}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onSendMessage={handleSendChatMessage}
                onCloseChat={() => setActiveChatFriend(null)}
              />
            )}

            {/* Account Switcher Modal */}
            {isAccountSwitcherOpen && (
              <AccountSwitcherModal
                onClose={() => setIsAccountSwitcherOpen(false)}
                onNavigateSettings={() => {
                  setIsAccountSwitcherOpen(false);
                  setActiveNav("settings");
                }}
              />
            )}

            {/* Crash Reporter Modal */}
            <LauncherCrashModal
              isOpen={isCrashModalOpen}
              onClose={() => setIsCrashModalOpen(false)}
              onRelaunch={() => {
                setActiveNav("home");
                handleLaunch();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
