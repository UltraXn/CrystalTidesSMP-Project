import React from 'react';

export const RulesAmbientLighting: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 select-none"
      style={{
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
      aria-hidden="true"
    >
      <div
        className="absolute -left-32 top-1/2 size-[650px] -translate-y-1/2 rounded-full blur-[100px]"
        style={{
          background:
            'radial-gradient(circle, rgba(137, 217, 209, 0.12) 0%, rgba(137, 217, 209, 0.04) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute -right-32 top-16 size-[650px] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.03) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute -right-24 bottom-24 size-[600px] rounded-full blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(14, 165, 233, 0.10) 0%, rgba(14, 165, 233, 0.03) 45%, transparent 70%)',
        }}
      />
    </div>
  );
};
