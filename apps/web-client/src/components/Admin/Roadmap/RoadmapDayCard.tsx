import { Calendar, Trophy } from 'lucide-react';
import { RoadmapDayConfig } from '../RoadmapAdminManager';

interface RoadmapDayCardProps {
  day: RoadmapDayConfig;
  index: number;
  onChange: <K extends keyof RoadmapDayConfig>(
    index: number,
    field: K,
    value: RoadmapDayConfig[K],
  ) => void;
}

export function RoadmapDayCard({
  day,
  index: idx,
  onChange: handleChange,
}: Readonly<RoadmapDayCardProps>) {
  const isJackpot = day.day === 30;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        backgroundColor: isJackpot ? 'rgba(177, 80, 179, 0.18)' : 'rgba(15, 23, 42, 0.6)',
        border: isJackpot ? '1.5px solid #B150B3' : '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: isJackpot ? '#E879F9' : '#2DD4BF',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isJackpot ? <Trophy size={16} /> : <Calendar size={14} />} Día {day.day}
        </span>
        {isJackpot && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              background: '#B150B3',
              color: '#FFF',
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            JACKPOT X50
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor={`roadmap-day-${day.day}-title`}
          style={{
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}
        >
          Título
        </label>
        <input
          id={`roadmap-day-${day.day}-title`}
          type="text"
          value={day.title}
          onChange={(e) => handleChange(idx, 'title', e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 6,
            padding: '6px 10px',
            color: '#FFF',
            fontSize: 12,
            marginTop: 2,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor={`roadmap-day-${day.day}-type`}
            style={{
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
            }}
          >
            Tipo
          </label>
          <select
            id={`roadmap-day-${day.day}-type`}
            value={day.reward_type}
            onChange={(e) =>
              handleChange(idx, 'reward_type', e.target.value as RoadmapDayConfig['reward_type'])
            }
            style={{
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '6px 8px',
              color: '#FFF',
              fontSize: 11.5,
              marginTop: 2,
              boxSizing: 'border-box',
            }}
          >
            <option value="killucoins">KilluCoins</option>
            <option value="gacha_spin">Tirada Gacha</option>
            <option value="achievement">Logro Único</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label
            htmlFor={`roadmap-day-${day.day}-value`}
            style={{
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
            }}
          >
            Valor Base
          </label>
          <input
            id={`roadmap-day-${day.day}-value`}
            type="number"
            value={day.reward_value}
            onChange={(e) =>
              handleChange(idx, 'reward_value', e.target.value ? Number(e.target.value) : 0)
            }
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '6px 8px',
              color: '#FFF',
              fontSize: 12,
              marginTop: 2,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ width: 64 }}>
          <label
            htmlFor={`roadmap-day-${day.day}-multiplier`}
            style={{
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
            }}
          >
            Mult.
          </label>
          <input
            id={`roadmap-day-${day.day}-multiplier`}
            type="number"
            value={day.multiplier}
            onChange={(e) =>
              handleChange(idx, 'multiplier', e.target.value ? Number(e.target.value) : 1)
            }
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '6px 8px',
              color: '#2DD4BF',
              fontWeight: 700,
              fontSize: 12,
              marginTop: 2,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  );
}
