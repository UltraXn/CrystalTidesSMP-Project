import { useState } from 'react';
import './AmbientBubbles.css';

const AmbientBubbles = () => {
    const [bubbles] = useState(() => {
        const bubbleCount = 20; // Increased count
        return Array.from({ length: bubbleCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 25 + 15, // 15px - 40px (Smaller, sharper pixels)
            left: Math.random() * 100, // 0% - 100%
            animationDuration: Math.random() * 15 + 10, // 10s - 25s (Slower rise)
            animationDelay: Math.random() * 20, // 0s - 20s
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

export default AmbientBubbles;
