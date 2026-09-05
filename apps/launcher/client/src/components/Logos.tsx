import React from "react";

/* ── AUTHENTIC LOADER SVGs (faithful to official branding) ── */

// Fabric: Official icon.png from FabricMC/fabric repo
export const FabricLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <img
    src="/icons/fabric.png"
    alt="Fabric"
    width={size}
    height={size}
    style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
  />
);

// Forge: Official icon.ico from MinecraftForge/MinecraftForge repo
export const ForgeLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <img
    src="/icons/forge.ico"
    alt="Forge"
    width={size}
    height={size}
    style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
  />
);

// NeoForge: Official installer_profile_icon.png from neoforged/NeoForge repo
export const NeoForgeLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <img
    src="/icons/neoforge.png"
    alt="NeoForge"
    width={size}
    height={size}
    style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
  />
);

// Quilt: Official quilt_x128.png from QuiltMC/quilt-loader repo
export const QuiltLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <img
    src="/icons/quilt.png"
    alt="Quilt"
    width={size}
    height={size}
    style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
  />
);

// Vanilla: Official grass block
export const VanillaLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <img
    src="/icons/vanilla.png"
    alt="Vanilla"
    width={size}
    height={size}
    style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
  />
);

export const CrystalSolidMonogram: React.FC<{ size?: number; color?: string }> = ({
  size = 38,
  color = "#FFFFFF",
}) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0L31 9.5L25 33L16 40L7 33L1 9.5L16 0Z" fill={color} />
    <path d="M16 0L1 9.5H31L16 0Z" fill="#E2E8F0" opacity="0.85" />
    <path d="M16 21L1 9.5H31L16 21Z" fill="#F8FAFC" />
    <path d="M1 9.5L16 21V40L7 33L1 9.5Z" fill="#CBD5E1" />
    <path d="M31 9.5L16 21V40L25 33L31 9.5Z" fill="#FFFFFF" />
  </svg>
);

export const CrystalTidesLogo: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = "#2DD4BF",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3H18L22 9.5L12 21L2 9.5L6 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 9.5H22" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
    <path d="M12 21L7.5 9.5L12 3L16.5 9.5L12 21Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
  </svg>
);
