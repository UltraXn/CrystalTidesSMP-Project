import React, { useState } from "react";

interface TwoFactorPromptProps {
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
  translations?: Record<string, string>;
}

export const TwoFactorPrompt: React.FC<TwoFactorPromptProps> = ({
  onVerify,
  onCancel,
  translations = {},
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, defaultValue: string) => translations[key] || defaultValue;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError(t("two_factor_error_length", "El código debe tener 6 dígitos"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onVerify(cleanCode);
      if (!success) {
        setError(t("two_factor_error_invalid", "Código inválido. Inténtalo de nuevo"));
        setIsLoading(false);
      }
    } catch (err) {
      setError(t("two_factor_error_failed", "Error al verificar el código"));
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
  };

  return (
    <div className="two-factor-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="glass-card" style={{
        width: 400,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{ fontSize: 48, color: "var(--accent)", marginBottom: 24 }}>🛡️</div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 20, fontWeight: "bold" }}>
          {t("two_factor_title", "Autenticación de Dos Factores")}
        </h2>
        <p style={{ margin: "0 0 32px 0", fontSize: 14, color: "rgba(255, 255, 255, 0.54)", textAlign: "center" }}>
          {t("two_factor_desc", "Por favor introduce el código de seguridad de 6 dígitos")}
        </p>

        <form onSubmit={handleVerify} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={handleInputChange}
            placeholder="000000"
            disabled={isLoading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              textAlign: "center",
              fontSize: 28,
              fontWeight: "bold",
              letterSpacing: 8,
              padding: 12,
              borderRadius: 12,
              border: "1px solid var(--border-low)",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              color: "#FFFFFF",
              marginBottom: error ? 16 : 0,
              outline: "none",
            }}
          />

          {error && (
            <span style={{ color: "var(--danger)", fontSize: 13, textAlign: "center" }}>
              {error}
            </span>
          )}

          <div style={{ display: "flex", gap: 16, width: "100%", marginTop: 32 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="btn btn-ghost btn-md"
              style={{ flex: 1 }}
            >
              {t("two_factor_cancel", "Cancelar")}
            </button>
            <button
              type="submit"
              disabled={code.length !== 6 || isLoading}
              className="btn btn-primary btn-md"
              style={{ flex: 1 }}
            >
              {t("two_factor_verify", "Verificar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
