import React from "react";
import { MorphIcon } from "morphicons/react";
import {
  House,
  User,
  Bell,
  MessageSquare,
  Layers,
  Globe,
  Crop,
  ShoppingCart,
  Settings,
  UserCog,
} from "lucide";
import { NavSection } from "./types";

interface LauncherSidebarProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
}

export const LauncherSidebar: React.FC<LauncherSidebarProps> = ({
  activeNav,
  onSelectNav,
}) => {
  return (
    <nav
      style={{
        width: 132,
        minWidth: 132,
        backgroundColor: "#07080A",
        borderRight: "1px solid #1A1F2B",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "36px 0 34px 0",
        boxSizing: "border-box",
        zIndex: 10,
        height: "100%",
        userSelect: "none",
      }}
    >
      {/* Top Logo Mascot */}
      <div
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          width: "100%",
        }}
      >
        <img
          src="/logo.png"
          alt="Crystal Tides"
          style={{
            width: 42,
            height: 42,
            objectFit: "contain",
            imageRendering: "auto",
          }}
        />
      </div>

      {/* Divider 1 */}
      <div
        style={{
          width: 22,
          height: 1,
          backgroundColor: "#1A1F2B",
          marginBottom: 20,
        }}
      />

      {/* Cluster 1: Home, Account, Notifications */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onSelectNav("home")}
          title="Home"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border:
              activeNav === "home"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "home"
                ? "#0D1017"
                : "transparent",
            color: activeNav === "home" ? "#2DD4BF" : "#94A3B8",
            boxShadow:
              activeNav === "home"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "home") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "home") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={House}
            size={18}
            color={activeNav === "home" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2.2}
          />
        </button>

        {/* 2. User / Locker with Amber Dot */}
        <button
          type="button"
          onClick={() => onSelectNav("locker")}
          title="Locker"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border:
              activeNav === "locker"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "locker"
                ? "#0D1017"
                : "transparent",
            color:
              activeNav === "locker" ? "#2DD4BF" : "#94A3B8",
            boxShadow:
              activeNav === "locker"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "locker") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "locker") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={User}
            size={18}
            color={activeNav === "locker" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2.2}
          />
          <span
            style={{
              position: "absolute",
              bottom: 7,
              right: 7,
              width: 5.5,
              height: 5.5,
              borderRadius: "50%",
              backgroundColor: "#F2B82E",
              boxShadow: "0 0 6px rgba(242, 184, 46, 0.8)",
            }}
          />
        </button>

        {/* 3. Notifications Bell */}
        <button
          type="button"
          onClick={() => onSelectNav("notifications")}
          title="Notifications"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border:
              activeNav === "notifications"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "notifications"
                ? "#0D1017"
                : "transparent",
            color:
              activeNav === "notifications"
                ? "#2DD4BF"
                : "#94A3B8",
            boxShadow:
              activeNav === "notifications"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "notifications") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "notifications") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={Bell}
            size={18}
            color={activeNav === "notifications" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2.2}
          />
        </button>
      </div>

      {/* Divider 2 */}
      <div
        style={{
          width: 20,
          height: 1,
          backgroundColor: "#1A1F2B",
          margin: "20px 0 16px 0",
        }}
      />

      {/* Cluster 2: Chat, Versions, Servers, Mods */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 4. Chat Bubble */}
        <button
          type="button"
          onClick={() => onSelectNav("chat")}
          title="Messages"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border:
              activeNav === "chat"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "chat"
                ? "#0D1017"
                : "transparent",
            color: activeNav === "chat" ? "#2DD4BF" : "#94A3B8",
            boxShadow:
              activeNav === "chat"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "chat") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "chat") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={MessageSquare}
            size={18}
            color={activeNav === "chat" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2.2}
          />
        </button>

        {/* 5. Layers / Versions */}
        <button
          type="button"
          onClick={() => onSelectNav("versions")}
          title="Versions"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border:
              activeNav === "versions"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "versions"
                ? "#0D1017"
                : "transparent",
            color:
              activeNav === "versions" ? "#2DD4BF" : "#94A3B8",
            boxShadow:
              activeNav === "versions"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "versions") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "versions") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={Layers}
            size={18}
            color={activeNav === "versions" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2.2}
          />
        </button>

        {/* 6. Globe / Servers */}
        <button
          type="button"
          onClick={() => onSelectNav("servers")}
          title="Servers"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border:
              activeNav === "servers"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "servers"
                ? "#0D1017"
                : "transparent",
            color:
              activeNav === "servers" ? "#2DD4BF" : "#94A3B8",
            boxShadow:
              activeNav === "servers"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "servers") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "servers") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={Globe}
            size={18}
            color={activeNav === "servers" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2.2}
          />
        </button>

        {/* 7. Crop / Gallery with Red Dot */}
        <button
          type="button"
          onClick={() => onSelectNav("gallery")}
          title="Gallery"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border:
              activeNav === "gallery"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "gallery"
                ? "#0D1017"
                : "transparent",
            color: activeNav === "gallery" ? "#2DD4BF" : "#94A3B8",
            boxShadow:
              activeNav === "gallery"
                ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "gallery") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "gallery") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={Crop}
            size={18}
            color={activeNav === "gallery" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2.2}
          />
          <span
            style={{
              position: "absolute",
              bottom: 7,
              right: 7,
              width: 5.5,
              height: 5.5,
              borderRadius: "50%",
              backgroundColor: "#EF4444",
              boxShadow: "0 0 6px rgba(239, 68, 68, 0.8)",
            }}
          />
        </button>
      </div>

      {/* Empty breathing gap */}
      <div style={{ flex: 1, minHeight: 40 }} />

      {/* Cluster 3: Store & Settings */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Store / Cart */}
        <button
          type="button"
          onClick={() => onSelectNav("store")}
          title="Store"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: "transparent",
            border:
              activeNav === "store"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "store"
                ? "#0D1017"
                : "transparent",
            color:
              activeNav === "store" ? "#2DD4BF" : "#94A3B8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "store") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "store") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={ShoppingCart}
            size={18}
            color={activeNav === "store" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2}
          />
          <span
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 5.5,
              height: 5.5,
              borderRadius: "50%",
              backgroundColor: "#EF4444",
              boxShadow: "0 0 6px rgba(239, 68, 68, 0.8)",
            }}
          />
        </button>

        {/* Cuentas & Sesión */}
        <button
          type="button"
          onClick={() => onSelectNav("profiles")}
          title="Cuentas & Sesión"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: "transparent",
            border:
              activeNav === "profiles"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "profiles"
                ? "#0D1017"
                : "transparent",
            color:
              activeNav === "profiles"
                ? "#2DD4BF"
                : "#94A3B8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "profiles") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "profiles") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={UserCog}
            size={18}
            color={activeNav === "profiles" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2}
          />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => onSelectNav("settings")}
          title="Settings"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: "transparent",
            border:
              activeNav === "settings"
                ? "1px solid #121620"
                : "1px solid transparent",
            backgroundColor:
              activeNav === "settings"
                ? "#0D1017"
                : "transparent",
            color:
              activeNav === "settings"
                ? "#2DD4BF"
                : "#94A3B8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (activeNav !== "settings") {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor =
                "#1A1F2B";
              e.currentTarget.style.color = "#FAFCFF";
            }
          }}
          onMouseLeave={(e) => {
            if (activeNav !== "settings") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }
          }}
        >
          <MorphIcon
            icon={Settings}
            size={18}
            color={activeNav === "settings" ? "#2DD4BF" : "currentColor"}
            strokeWidth={2}
          />
        </button>
      </div>
    </nav>
  );
};
