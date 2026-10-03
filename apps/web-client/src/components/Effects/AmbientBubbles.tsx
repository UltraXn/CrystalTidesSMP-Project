import { secureRandom } from '../../utils/random';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import './AmbientBubbles.css';

const AmbientBubbles = () => {
  const [bubbles] = useState(() => {
    const bubbleCount = 20; // Increased count
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      size: secureRandom() * 25 + 15, // 15px - 40px (Smaller, sharper pixels)
      left: secureRandom() * 100, // 0% - 100%
      animationDuration: secureRandom() * 15 + 10, // 10s - 25s (Slower rise)
      animationDelay: secureRandom() * 20, // 0s - 20s
    }));
  });

  return createPortal(
    <div className="ambient-bubbles-container" aria-hidden="true">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="ambient-bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}vw`,
            animationDuration: `${bubble.animationDuration}s`,
            animationDelay: `${bubble.animationDelay}s`,
          }}
        />
      ))}
    </div>,
    document.body,
  );
};

export default AmbientBubbles;
