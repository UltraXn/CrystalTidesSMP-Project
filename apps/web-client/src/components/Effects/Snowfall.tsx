import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import './Snowfall.css';

const SnowflakeIcon = ({ size, blur, opacity }: { size: number, blur: number, opacity: number }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ 
            filter: `blur(${blur}px)`,
            opacity: opacity
        }}
    >
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
    </svg>
);

interface Snowflake {
    id: number;
    size: number;
    left: number;
    animationDuration: number;
    animationDelay: number;
    swayDuration: number;
    swayAmount: number;
    rotation: number;
    blur: number;
    opacity: number;
}

const generateSnowflakes = (count: number): Snowflake[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        size: Math.random() * 20 + 8,
        left: Math.random() * 100,
        animationDuration: Math.random() * 12 + 8,
        animationDelay: Math.random() * 15,
        swayDuration: Math.random() * 4 + 3,
        swayAmount: Math.random() * 40 + 30,
        rotation: Math.random() * 360,
        blur: Math.random() > 0.8 ? 2 : 0, // Some background flakes are blurred
        opacity: Math.random() * 0.5 + 0.3
    }));
};

const Snowfall = () => {
    const snowflakes = useMemo(() => generateSnowflakes(50), []);

    return createPortal(
        <div className="snow-container" aria-hidden="true">
            {snowflakes.map((flake: Snowflake) => (
                <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                        left: `${flake.left}vw`,
                        animationDuration: `${flake.animationDuration}s`,
                        animationDelay: `-${flake.animationDelay}s`,
                        rotate: `${flake.rotation}deg`
                    }}
                >
                    <div style={{
                        animation: `sway ${flake.swayDuration}s ease-in-out infinite alternate`,
                        display: 'flex'
                    }}>
                        <SnowflakeIcon size={flake.size} blur={flake.blur} opacity={flake.opacity} />
                    </div>
                </div>
            ))}
        </div>,
        document.body
    );
};

export default Snowfall;
