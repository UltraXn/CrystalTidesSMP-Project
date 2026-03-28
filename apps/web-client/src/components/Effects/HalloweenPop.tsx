import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './HalloweenPop.css';

interface Pumpkin {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    isExiting: boolean;
}

const PumpkinIcon = ({ size }: { size: number }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 12px rgba(255, 87, 34, 0.7))' }}
    >
        {/* Pumpkin Body */}
        <path 
            d="M50 15C30 15 15 25 10 45C5 65 15 85 35 90C45 92 55 92 65 90C85 85 95 65 90 45C85 25 70 15 50 15Z" 
            fill="#E65100" 
        />
        {/* Stem (Longer and curved) */}
        <path 
            d="M50 15C50 15 48 5 55 2C62 -2 70 5 65 12C62 16 55 17 50 15Z" 
            fill="#2E7D32" 
        />
        {/* Eyes (Triangles) */}
        <path d="M30 40L45 45L35 55L30 40Z" fill="white" />
        <path d="M70 40L55 45L65 55L70 40Z" fill="white" />
        {/* Mouth (Jagged) */}
        <path 
            d="M25 65C35 75 65 75 75 65L65 72L55 65L50 72L45 65L35 72L25 65Z" 
            fill="white" 
        />
    </svg>
);

const HalloweenPop = () => {
    const [pumpkins, setPumpkins] = useState<Pumpkin[]>([]);

    const spawnPumpkin = useCallback(() => {
        const id = Date.now();
        const newPumpkin: Pumpkin = {
            id,
            x: Math.random() * 90 + 5,
            y: Math.random() * 80 + 10,
            size: Math.random() * 40 + 30,
            rotation: Math.random() * 40 - 20,
            isExiting: false
        };

        setPumpkins(prev => [...prev.slice(-10), newPumpkin]);

        // Start exit animation after 4 seconds
        setTimeout(() => {
            setPumpkins(prev => prev.map(p => p.id === id ? { ...p, isExiting: true } : p));
        }, 4000);

        // Remove from DOM after exit animation
        setTimeout(() => {
            setPumpkins(prev => prev.filter(p => p.id !== id));
        }, 4500);
    }, []);

    useEffect(() => {
        const interval = setInterval(spawnPumpkin, 2500);
        return () => clearInterval(interval);
    }, [spawnPumpkin]);

    return createPortal(
        <div className="halloween-pop-container">
            {pumpkins.map((p) => (
                <div
                    key={p.id}
                    className={`pumpkin-pop ${p.isExiting ? 'exiting' : ''}`}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        rotate: `${p.rotation}deg`
                    }}
                >
                    <PumpkinIcon size={p.size} />
                </div>
            ))}
        </div>,
        document.body
    );
};

export default HalloweenPop;
