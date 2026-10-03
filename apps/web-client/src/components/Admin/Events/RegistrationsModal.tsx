import { useState, useEffect } from "react";
import { Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "../../UI/Loader";
import { supabase } from "../../../services/supabaseClient";
import { getAuthHeaders } from "../../../services/adminAuth";
import { Registration } from "./types";

const STYLES = {
  BORDER_DIVIDER: "1px solid rgba(255,255,255,0.05)",
  HEADER_PADDING: "2rem 2.5rem",
  MUTED_WHITE: "rgba(255,255,255,0.2)",
  ACCENT_COLOR: "var(--accent)",
} as const;

interface RegistrationsModalProps {
  eventId: number;
  onClose: () => void;
  API_URL: string;
  mockRegistrations?: Registration[];
}

interface RegistrationAvatarProps {
  avatarUrl?: string | null;
}

function RegistrationAvatar({ avatarUrl }: RegistrationAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        alt="avatar"
      />
    );
  }

  return (
    <div
      style={{
        color: STYLES.MUTED_WHITE,
        fontSize: "1rem",
        fontWeight: "900",
      }}
    >
      CT
    </div>
  );
}

function RegistrationStatusIndicator() {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: STYLES.ACCENT_COLOR,
        boxShadow: `0 0 10px ${STYLES.ACCENT_COLOR}`,
      }}
    />
  );
}

interface RegistrationRowProps {
  registration: Registration;
  unknownUserLabel: string;
}

function RegistrationRow({ registration, unknownUserLabel }: RegistrationRowProps) {
  const username = registration.profiles?.username || unknownUserLabel;
  const formattedDate = new Date(registration.created_at).toLocaleDateString();

  return (
    <div className="registration-item">
      <div className="reg-avatar-ring">
        <div className="reg-avatar-content">
          <RegistrationAvatar avatarUrl={registration.profiles?.avatar_url} />
        </div>
      </div>
      <div className="reg-info">
        <div className="reg-name">{username}</div>
        <div className="reg-date">{formattedDate}</div>
      </div>
      <RegistrationStatusIndicator />
    </div>
  );
}

function RegistrationsLoadingState({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "4rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      <Loader style={{ height: "auto", minHeight: "60px" }} />
      <span
        style={{
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.3)",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function RegistrationsEmptyState({ label }: { label: string }) {
  return (
    <div
      className="poll-empty-state"
      style={{ padding: "3rem 1rem", marginTop: 0 }}
    >
      <Users size={40} style={{ color: "rgba(255,255,255,0.05)" }} />
      <p style={{ color: STYLES.MUTED_WHITE, fontWeight: "800" }}>
        {label}
      </p>
    </div>
  );
}

interface RegistrationsBodyProps {
  loading: boolean;
  registrations: Registration[];
}

function RegistrationsBody({ loading, registrations }: RegistrationsBodyProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <RegistrationsLoadingState
        label={t("admin.events.registrations.loading")}
      />
    );
  }

  if (registrations.length === 0) {
    return (
      <RegistrationsEmptyState
        label={t("admin.events.registrations.empty")}
      />
    );
  }

  const unknownUserLabel = t("admin.events.registrations.unknown_user");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {registrations.map((reg) => (
        <RegistrationRow
          key={reg.id}
          registration={reg}
          unknownUserLabel={unknownUserLabel}
        />
      ))}
    </div>
  );
}

async function fetchEventRegistrations(
  apiUrl: string,
  eventId: number
): Promise<Registration[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(`${apiUrl}/events/${eventId}/registrations`, {
    headers: getAuthHeaders(session?.access_token || null),
  });

  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default function RegistrationsModal({
  eventId,
  onClose,
  API_URL,
  mockRegistrations,
}: RegistrationsModalProps) {
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState<Registration[]>(
    mockRegistrations || []
  );
  const [loading, setLoading] = useState(!mockRegistrations);

  useEffect(() => {
    let ignore = false;

    const loadRegistrations = async () => {
      if (mockRegistrations) return;
      try {
        const data = await fetchEventRegistrations(API_URL, eventId);
        if (!ignore) setRegistrations(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadRegistrations();
    return () => {
      ignore = true;
    };
  }, [eventId, API_URL, mockRegistrations]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="sync-modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="sync-modal-content poll-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registrations-modal-title"
        style={{
          maxWidth: "550px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="modal-accent-line" />

        <div
          className="poll-form-header"
          style={{
            padding: STYLES.HEADER_PADDING,
            borderBottom: STYLES.BORDER_DIVIDER,
          }}
        >
          <h3
            id="registrations-modal-title"
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "1.4rem",
              fontWeight: "900",
              color: "#fff",
            }}
          >
            <Users style={{ color: STYLES.ACCENT_COLOR }} aria-hidden="true" />
            {t("admin.events.registrations.title")}{" "}
            <span className="tabular-nums">({registrations.length})</span>
          </h3>
          <button
            aria-label={t("common.close", "Cerrar ventana")}
            type="button"
            onClick={onClose}
            className="btn-close-mini"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: STYLES.HEADER_PADDING }}>
          <RegistrationsBody loading={loading} registrations={registrations} />
        </div>

        <div
          style={{
            padding: "1.5rem 2.5rem",
            borderTop: STYLES.BORDER_DIVIDER,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="modal-btn-primary"
            style={{ height: "44px", padding: "0 2rem" }}
          >
            {t("admin.events.close_btn", "Cerrar")}
          </button>
        </div>
      </div>
    </div>
  );
}