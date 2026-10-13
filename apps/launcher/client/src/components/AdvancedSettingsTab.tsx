import React from 'react';
import { MorphIcon } from 'morphicons/react';
import { Settings, AlertTriangle, Cloud, Monitor, RotateCcw, Eye, Check, Cpu, Code } from 'lucide';

export interface AdvancedSettingsTabProps {
  resEnabled: boolean;
  setResEnabled: (val: boolean) => void;
  resWidth: number;
  setResWidth: (val: number) => void;
  resHeight: number;
  setResHeight: (val: number) => void;
  fullscreen: boolean;
  setFullscreen: (val: boolean) => void;
  borderless: boolean;
  setBorderless: (val: boolean) => void;
  lockAspect: boolean;
  setLockAspect: (val: boolean) => void;
  matchNative: boolean;
  setMatchNative: (val: boolean) => void;
  ramEnabled: boolean;
  setRamEnabled: (val: boolean) => void;
  allocatedRam: number;
  setAllocatedRam: (val: number) => void;
  maxSystemRam: number;
  jvmEnabled: boolean;
  setJvmEnabled: (val: boolean) => void;
  jvmArgs: string;
  setJvmArgs: (val: string) => void;
  onSaveAdvancedSettings: (newRam?: number, newW?: number, newH?: number, newFs?: boolean) => void;
}

export const AdvancedSettingsTab: React.FC<AdvancedSettingsTabProps> = ({
  resEnabled,
  setResEnabled,
  resWidth,
  setResWidth,
  resHeight,
  setResHeight,
  fullscreen,
  setFullscreen,
  borderless,
  setBorderless,
  lockAspect,
  setLockAspect,
  matchNative,
  setMatchNative,
  ramEnabled,
  setRamEnabled,
  allocatedRam,
  setAllocatedRam,
  maxSystemRam,
  jvmEnabled,
  setJvmEnabled,
  jvmArgs,
  setJvmArgs,
  onSaveAdvancedSettings,
}) => {
  return (
    <>
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <MorphIcon icon={Settings} size={18} color="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>Advanced Settings</div>
            <div
              style={{
                fontSize: 11,
                color: '#F87171',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
              }}
            >
              <MorphIcon icon={AlertTriangle} size={13} color="#F87171" strokeWidth={2.2} />
              <span>
                Proceed with caution. Modifying these settings may cause game instability.
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 10.5,
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'right',
          }}
        >
          <div>
            <div>All settings synced to Crystal Cloud</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.25)' }}>Last synced: 2 hours ago</div>
          </div>
          <MorphIcon icon={Cloud} size={16} color="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
        </div>
      </div>

      {/* 2. Game Resolution Card */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <MorphIcon
                icon={Monitor}
                size={16}
                color="rgba(255, 255, 255, 0.7)"
                strokeWidth={2}
              />
            </div>

            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>
                Game Resolution
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                Define custom launch resolution and fullscreen preferences.
              </div>
            </div>
          </div>

          {/* Enabled Toggle */}
          <button
            type="button"
            onClick={() => setResEnabled(!resEnabled)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 800,
              color: resEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <span>Enabled</span>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: resEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                border: resEnabled ? '1.5px solid #10B981' : '1.5px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {resEnabled && <MorphIcon icon={Check} size={11} color="#FFFFFF" strokeWidth={3} />}
            </div>
          </button>
        </div>

        {/* Resolution Input Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* W / H inputs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              padding: '4px 8px',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)' }}>
              W
            </span>
            <input
              type="number"
              value={resWidth}
              onChange={(e) => {
                const val = Number(e.target.value);
                setResWidth(val);
                onSaveAdvancedSettings(undefined, val, undefined, undefined);
              }}
              style={{
                width: 54,
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 800,
                outline: 'none',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)' }}>
              H
            </span>
            <input
              type="number"
              value={resHeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setResHeight(val);
                onSaveAdvancedSettings(undefined, undefined, val, undefined);
              }}
              style={{
                width: 54,
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 800,
                outline: 'none',
                textAlign: 'center',
              }}
            />
          </div>

          {/* Checkboxes */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={fullscreen}
              onChange={(e) => {
                setFullscreen(e.target.checked);
                onSaveAdvancedSettings(undefined, undefined, undefined, e.target.checked);
              }}
              style={{ accentColor: '#10B981' }}
            />
            <span>Fullscreen mode:</span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={borderless}
              onChange={(e) => setBorderless(e.target.checked)}
              style={{ accentColor: '#10B981' }}
            />
            <span>Borderless Window:</span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
              style={{ accentColor: '#10B981' }}
            />
            <span>Lock Aspect Ratio:</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setResWidth(1920);
              setResHeight(1080);
              onSaveAdvancedSettings(undefined, 1920, 1080, undefined);
            }}
            title="Reset Resolution"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              padding: 2,
            }}
          >
            <MorphIcon icon={RotateCcw} size={14} color="currentColor" strokeWidth={2.2} />
          </button>
        </div>

        {/* Resolution Presets & Options */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            paddingTop: 4,
          }}
        >
          {[
            { label: '1080p', w: 1920, h: 1080 },
            { label: '1440p', w: 2560, h: 1440 },
            { label: '4K', w: 3840, h: 2160 },
          ].map((p) => {
            const isSel = resWidth === p.w && resHeight === p.h;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setResWidth(p.w);
                  setResHeight(p.h);
                  onSaveAdvancedSettings(undefined, p.w, p.h, undefined);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: isSel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSel ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSel ? '#10B981' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            );
          })}

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              marginLeft: 6,
            }}
          >
            <input
              type="checkbox"
              checked={matchNative}
              onChange={(e) => setMatchNative(e.target.checked)}
              style={{ accentColor: '#10B981' }}
            />
            <span>Match Native Display</span>
          </label>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              marginLeft: 6,
            }}
          >
            <MorphIcon icon={Eye} size={14} color="currentColor" strokeWidth={2} />
            <span>Visualize on screen</span>
          </div>
        </div>
      </div>

      {/* 3. Allocated Memory (RAM) Card */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <MorphIcon icon={Cpu} size={16} color="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
            </div>

            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>
                Allocated Memory
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                Overrides global RAM settings for this specific profile.
              </div>
            </div>
          </div>

          {/* Enabled Toggle */}
          <button
            type="button"
            onClick={() => setRamEnabled(!ramEnabled)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 800,
              color: ramEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <span>Enabled</span>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: ramEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                border: ramEnabled ? '1.5px solid #10B981' : '1.5px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {ramEnabled && <MorphIcon icon={Check} size={11} color="#FFFFFF" strokeWidth={3} />}
            </div>
          </button>
        </div>

        {/* RAM Slider Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 11.5,
              fontWeight: 800,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            {allocatedRam} GB / {maxSystemRam} GB
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              type="range"
              min={1}
              max={maxSystemRam}
              value={allocatedRam}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAllocatedRam(val);
                onSaveAdvancedSettings(val, undefined, undefined, undefined);
              }}
              style={{
                width: '100%',
                accentColor: '#E2E8F0',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 9.5,
                color: 'rgba(255, 255, 255, 0.35)',
                fontWeight: 600,
              }}
            >
              <span>1 GB</span>
              <span>8 GB</span>
              <span>16 GB</span>
              <span>24 GB</span>
              <span>32 GB</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setAllocatedRam(6);
              onSaveAdvancedSettings(6, undefined, undefined, undefined);
            }}
            title="Reset RAM to 6GB"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              padding: 2,
            }}
          >
            <MorphIcon icon={RotateCcw} size={14} color="currentColor" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* 4. JVM Arguments Card */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <MorphIcon icon={Code} size={16} color="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
            </div>

            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>JVM Arguments</div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                Custom Java execution flags for advanced performance tweaking.
              </div>
            </div>
          </div>

          {/* Enabled Toggle */}
          <button
            type="button"
            onClick={() => setJvmEnabled(!jvmEnabled)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 800,
              color: jvmEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <span>Enabled</span>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: jvmEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                border: jvmEnabled ? '1.5px solid #10B981' : '1.5px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {jvmEnabled && <MorphIcon icon={Check} size={11} color="#FFFFFF" strokeWidth={3} />}
            </div>
          </button>
        </div>

        {jvmEnabled && (
          <input
            type="text"
            value={jvmArgs}
            onChange={(e) => setJvmArgs(e.target.value)}
            placeholder="-XX:+UseG1GC..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#2DD4BF',
              fontFamily: 'monospace',
              fontSize: 11,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}
      </div>
    </>
  );
};
