import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StaffMemberRow } from './StaffMemberRow';

export interface StaffMember {
  username: string;
  avatar: string;
  role: string;
  role_image?: string;
  login_time: number | null;
  mc_status: string;
  discord_status: string;
}

interface StaffActivityProps {
  staffOnline: StaffMember[];
  serverOnline: boolean;
}

export default function StaffActivity({ staffOnline, serverOnline }: Readonly<StaffActivityProps>) {
  const { t } = useTranslation();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            padding: '8px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Users style={{ color: 'var(--accent)' }} />
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
          {t('admin.dashboard.staff.title')}
        </span>
        {staffOnline.length > 0 && (
          <span
            style={{
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '4px 10px',
              borderRadius: '8px',
              marginLeft: 'auto',
              letterSpacing: '0.5px',
            }}
          >
            {staffOnline.length} ON
          </span>
        )}
      </h3>

      <div style={{ flex: 1 }}>
        {serverOnline || staffOnline.length > 0 ? (
          <div
            style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}
            className="custom-scrollbar"
          >
            {staffOnline.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {staffOnline.map((staff) => (
                  <StaffMemberRow key={staff.username} staff={staff} now={now} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 0',
                  opacity: 0.5,
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <Users size={24} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: '500',
                  }}
                >
                  {t('admin.dashboard.staff.no_staff')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontWeight: '500' }}>
              {t('admin.dashboard.staff.offline_msg')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
