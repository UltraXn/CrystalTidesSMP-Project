import React, { useState } from "react";
import "./AmbientBubbles.css";

export const AmbientBubbles: React.FC = () => {
  const [bubbles] = useState(() => {
    const bubbleCount = 22;
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 24 + 14, // 14px - 38px
      left: Math.random() * 100, // 0% - 100%
      animationDuration: Math.random() * 14 + 9, // 9s - 23s
      animationDelay: Math.random() * 18, // 0s - 18s
    }));
  });

  return (
    <div className="ambient-bubbles-container">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="ambient-bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}vw`,
            animationDuration: `${b.animationDuration}s`,
            animationDelay: `${b.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};
