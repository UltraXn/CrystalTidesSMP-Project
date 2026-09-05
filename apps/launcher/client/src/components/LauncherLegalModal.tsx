import React, { useState } from "react";

export type LegalTabType = "tos" | "privacy" | "support";

interface LauncherLegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTabType;
  onClose: () => void;
}

export const LauncherLegalModal: React.FC<LauncherLegalModalProps> = ({
  isOpen,
  initialTab = "tos",
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        userSelect: "none",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 960,
          height: 600,
          backgroundColor: "#07040A",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          boxShadow: "0 28px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(45, 212, 191, 0.06)",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 9,
            color: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            zIndex: 30,
            transition: "all 140ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── LEFT SIDEBAR (Width: 230px) ── */}
        <div
          style={{
            width: 230,
            height: "100%",
            backgroundColor: "#060308",
            borderRight: "1px solid rgba(255, 255, 255, 0.06)",
            padding: "24px 16px 20px 20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Branding Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: 24, height: 24, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(45, 212, 191, 0.35))" }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                  Legal & Policies
                </span>
                <span style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.4)" }}>
                  Crystal Client Core
                </span>
              </div>
            </div>

            {/* Navigation Tabs List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Tab 1: Terms of Service */}
              <button
                type="button"
                onClick={() => setActiveTab("tos")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 10,
                  backgroundColor: activeTab === "tos" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  border: activeTab === "tos" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid transparent",
                  color: activeTab === "tos" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                  fontSize: 12.5,
                  fontWeight: activeTab === "tos" ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "tos") {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "tos") {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  }
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Terms of Service</span>
              </button>

              {/* Tab 2: Privacy Policy */}
              <button
                type="button"
                onClick={() => setActiveTab("privacy")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 10,
                  backgroundColor: activeTab === "privacy" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  border: activeTab === "privacy" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid transparent",
                  color: activeTab === "privacy" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                  fontSize: 12.5,
                  fontWeight: activeTab === "privacy" ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "privacy") {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "privacy") {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  }
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Privacy Policy</span>
              </button>

              {/* Tab 3: Help & Support */}
              <button
                type="button"
                onClick={() => setActiveTab("support")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 10,
                  backgroundColor: activeTab === "support" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  border: activeTab === "support" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid transparent",
                  color: activeTab === "support" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                  fontSize: 12.5,
                  fontWeight: activeTab === "support" ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 140ms ease",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "support") {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "support") {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  }
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Help & Support</span>
              </button>
            </div>
          </div>

          {/* Bottom Sidebar Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 14, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.35)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                Estatus Legal
              </span>
              <span style={{ fontSize: 11, color: "#2DD4BF", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2DD4BF" }} />
                Vigente • 2026
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT AREA ── */}
        <div
          style={{
            flex: 1,
            height: "100%",
            padding: "24px 28px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingRight: 40 }}>
            {/* Search Input */}
            <div
              style={{
                width: 280,
                height: 36,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                gap: 8,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar términos y políticas..."
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#FFFFFF",
                  fontSize: 12,
                  width: "100%",
                }}
              />
            </div>

            {/* Cloud Sync State */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255, 255, 255, 0.4)", fontWeight: 600 }}>
              <span style={{ color: "#2DD4BF" }}>●</span> Crystal Cloud Verified
            </div>
          </div>

          {/* Title and Subtitle */}
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>
              {activeTab === "tos" && "Terms of Service"}
              {activeTab === "privacy" && "Privacy Policy"}
              {activeTab === "support" && "Help & Community Channels"}
            </h2>
            <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
              {activeTab === "tos" && "Directrices de uso, licenciamiento y cumplimiento con el EULA de Mojang Studios."}
              {activeTab === "privacy" && "Políticas de privacidad, almacenamiento seguro en OS Vault y cero telemetría invasiva."}
              {activeTab === "support" && "Accede a nuestros canales oficiales de resolución de incidencias y soporte técnico."}
            </p>
          </div>

          {/* Scrollable Content Container (Generous top/bottom margin for transform lift) */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 10px 20px 4px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* TAB 1: TERMS OF SERVICE */}
            {activeTab === "tos" && (
              <>
                {/* Section 1 */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.045)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                      1. Cumplimiento con Mojang / Microsoft EULA
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(45, 212, 191, 0.12)", color: "#2DD4BF" }}>
                      EULA Compliant
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.6 }}>
                    Crystal Client es un launcher y cliente independiente para Minecraft. Cumple estrictamente con el Acuerdo de Licencia de Usuario Final (EULA) y las Directrices Comerciales de Mojang Studios. Minecraft es una marca registrada de Mojang AB / Microsoft.
                  </p>
                </div>

                {/* Section 2 */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.045)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                      2. Cuentas y Seguridad de Acceso
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(168, 85, 247, 0.12)", color: "#C084FC" }}>
                      OS Secure Vault
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.6 }}>
                    El usuario es responsable de la administración de sus credenciales. Crystal Client almacena los tokens de acceso mediante cifrado nativo en el almacén seguro del sistema operativo (Keychain / Credential Manager) sin transferir contraseñas a servidores intermediarios.
                  </p>
                </div>

                {/* Section 3 */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.045)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                      3. Código de Conducta y Fair Play
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#F87171" }}>
                      Fair Play Invariant
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.6 }}>
                    Queda estrictamente prohibido el uso de modificaciones maliciosas o cheats de ventaja injusta que vulneren la experiencia multijugador en servidores de CrystalTides SMP. El equipo se reserva el derecho de revocar el acceso a las funciones en línea en caso de infracción.
                  </p>
                </div>

                {/* Section 4 */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.045)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                    4. Exención de Responsabilidad
                  </span>
                  <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.6 }}>
                    El software se suministra en su estado actual para optimizar la experiencia de juego. No nos responsabilizamos por incompatibilidades de mods de terceros o caídas en la conectividad de servidores externos.
                  </p>
                </div>
              </>
            )}

            {/* TAB 2: PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <>
                {/* Section 1 */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.045)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                      1. Cero Telemetría Invasiva y Datos Recopilados
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(45, 212, 191, 0.12)", color: "#2DD4BF" }}>
                      No Trackers
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.6 }}>
                    Crystal Client no recopila pulsaciones de teclado, archivos personales ni historiales de navegación. Los únicos datos procesados corresponden a identificadores públicos de Minecraft (IGN, UUID), configuraciones locales de RAM/resolución y tokens de sesión oficiales de Microsoft.
                  </p>
                </div>

                {/* Section 2 */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.045)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                      2. Cifrado Local y Protección TLS 1.3
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, backgroundColor: "rgba(168, 85, 247, 0.12)", color: "#C084FC" }}>
                      TLS 1.3 & AES-GCM
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.6 }}>
                    Todas las conexiones con los servicios de CrystalTides (amigos, cosméticos, recompensas) se realizan a través de túneles HTTPS con cifrado TLS 1.3 e infraestructura Supabase protegida por Row Level Security (RLS).
                  </p>
                </div>

                {/* Section 3 */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.045)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>
                    3. No Venta de Información
                  </span>
                  <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: 1.6 }}>
                    No comercializamos, alquilamos ni transferimos información de ningún tipo a empresas de publicidad o intermediarios de datos. Tu privacidad y la integridad de tu sesión son la prioridad número uno.
                  </p>
                </div>
              </>
            )}

            {/* TAB 3: HELP & SUPPORT */}
            {activeTab === "support" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "2px 0" }}>
                {/* Discord Card */}
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 140,
                    boxSizing: "border-box",
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(88, 101, 242, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(88, 101, 242, 0.35)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.5), 0 0 20px rgba(88, 101, 242, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(88, 101, 242, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#5865F2" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.4)" }}>↗</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#FFFFFF", marginBottom: 2 }}>
                      Discord Comunitario
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.5)" }}>
                      Canal de asistencia en tiempo real y comunidad.
                    </div>
                  </div>
                </a>

                {/* GitHub Issues Card */}
                <a
                  href="https://github.com/UltraXn/CrystalTidesSMP-Project/issues"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 140,
                    boxSizing: "border-box",
                    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(45, 212, 191, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.35)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.5), 0 0 20px rgba(45, 212, 191, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(45, 212, 191, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2DD4BF" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.4)" }}>↗</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#FFFFFF", marginBottom: 2 }}>
                      GitHub Issue Tracker
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.5)" }}>
                      Reportes de bugs y sugerencias de código abierto.
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
