import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

declare global {
    interface Window {
        kofiwidget2: {
            init: (text: string, color: string, id: string) => void;
            draw: () => void;
        };
    }
}

interface KoFiWidgetProps {
    kofiId?: string;
    color?: string;
    text?: string;
}

const KoFiWidget = ({
    kofiId = "G2G03Y8FL",
    color = "#0C5952",
    text = "¡Dona por Ko-Fi!"
}: KoFiWidgetProps) => {
    useEffect(() => {
        // Load the Ko-Fi script
        const scriptId = 'kofi-widget-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
        script.async = true;

        script.onload = () => {
            if (window.kofiwidget2) {
                window.kofiwidget2.init(text, color, kofiId);
                window.kofiwidget2.draw();
            }
        };

        document.body.appendChild(script);

        return () => {
            // Widget cleanup is manual as noted before
        };
    }, [kofiId, color, text]);

    return null;
};

interface KoFiButtonProps {
    kofiId?: string;
    text?: string;
}

const KoFiButton = ({ kofiId = "G2G03Y8FL", text = "¡Dona por Ko-Fi!" }: KoFiButtonProps) => {
    const iconRef = useRef<HTMLImageElement>(null);
    const animationRef = useRef<gsap.core.Tween | null>(null);

    const handleMouseEnter = () => {
        if (animationRef.current) animationRef.current.kill();

        animationRef.current = gsap.to(iconRef.current, {
            y: -10,
            duration: 0.2,
            ease: 'power2.out',
            yoyo: true,
            repeat: 3
        });
    };

    const handleMouseLeave = () => {
        if (animationRef.current) animationRef.current.kill();
        
        gsap.to(iconRef.current, {
            y: 0,
            duration: 0.2,
            ease: 'power2.out'
        });
    };

    return (
        <a
            href={`https://ko-fi.com/${kofiId}`}
            target="_blank"
            rel="noreferrer"
            className='flex items-center gap-2 mt-6 px-6 py-2 bg-(--accent) text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg shadow-(--accent)/20 btn-donate-hero'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                overflow: 'visible' // Ensure jump doesn't get clipped
            }}
        >
            <img
                ref={iconRef}
                src="https://storage.ko-fi.com/cdn/cup-border.png"
                alt="Ko-fi donation icon"
                style={{ height: '20px', width: 'auto', display: 'block' }}
            />
            <span>{text}</span>
        </a>
    );
}

export { KoFiWidget, KoFiButton };
