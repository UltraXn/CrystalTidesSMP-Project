import React, { useState } from 'react';
import './AmbientBubbles.css';

export const AmbientBubbles: React.FC = () => {
    const [bubbles] = useState(() => {
        const bubbleCount = 20;
        return Array.from({ length: bubbleCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 25 + 15,
            left: Math.random() * 100,
            animationDuration: Math.random() * 15 + 10,
            animationDelay: Math.random() * 20,
        }));
    });

    return (
        <div className="ambient-bubbles-container">
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
