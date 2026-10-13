import React, { useState } from 'react';
import './AmbientBubbles.css';

const getSecureRandom = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / 4294967296;
};

export const AmbientBubbles: React.FC = () => {
  const [bubbles] = useState(() => {
    const bubbleCount = 20;
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      size: getSecureRandom() * 25 + 15,
      left: getSecureRandom() * 100,
      animationDuration: getSecureRandom() * 15 + 10,
      animationDelay: getSecureRandom() * 20,
    }));
  });

  return (
    <div className="ambient-bubbles-container">
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="ambient-bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            animationDuration: `${bubble.animationDuration}s`,
            animationDelay: `${bubble.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};
