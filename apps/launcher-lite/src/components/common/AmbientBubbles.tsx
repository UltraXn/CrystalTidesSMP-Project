import React, { useMemo } from "react";
import "./AmbientBubbles.css";

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const AmbientBubbles: React.FC<{ count?: number }> = ({ count = 25 }) => {
  const bubbles = useMemo(() => {
    const list: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        size: Math.floor(Math.random() * 20) + 6,
        left: Math.floor(Math.random() * 100),
        duration: Math.floor(Math.random() * 8) + 6,
        delay: Math.floor(Math.random() * 6),
        opacity: Math.random() * 0.45 + 0.15,
      });
    }
    return list;
  }, [count]);

  return (
    <div className="ambient-bubbles-container" aria-hidden="true">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="ambient-bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity,
          }}
        />
      ))}
    </div>
  );
};
