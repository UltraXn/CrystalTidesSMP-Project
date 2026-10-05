import React from 'react';
import { PlayerStatsWidget } from '../PlayerStatsWidget';

export interface StatsPageViewProps {
  username?: string;
}

export const StatsPageView: React.FC<Readonly<StatsPageViewProps>> = ({ username }) => {
  return (
    <div
      style={{
        padding: '24px 32px',
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 900,
            color: '#FFF',
          }}
        >
          📊 Estadísticas del Jugador
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Consulta tu progreso semanal e histórico en CrystalTides SMP.
        </p>
      </div>
      {username ? (
        <PlayerStatsWidget username={username} />
      ) : (
        <div
          style={{
            padding: 28,
            borderRadius: 16,
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.8)',
            marginTop: 20,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#2DD4BF',
              marginBottom: 6,
            }}
          >
            Autenticación Requerida
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 460,
              margin: '0 auto',
            }}
          >
            Inicia sesión con tu **Cuenta Web oficial de CrystalTides SMP** para consultar tus
            estadísticas semanales, racha, KilluCoins e historial de juego de forma 100% segura.
          </div>
        </div>
      )}
    </div>
  );
};
