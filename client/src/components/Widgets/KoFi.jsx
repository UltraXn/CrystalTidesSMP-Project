import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

const KoFiWidget = ({
    kofiId = "G2G03Y8FL",
    color = "#0C5952",
    text = "¡Dona por Ko-Fi!"
}) => {
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

const KoFiButton = ({ kofiId = "G2G03Y8FL", text = "¡Dona por Ko-Fi!" }) => {
    const iconRef = useRef(null);
    const animationRef = useRef(null);

    const handleMouseEnter = () => {
        // Stop any current animation to restart
        if (animationRef.current) animationRef.current.pause();

        animationRef.current = anime({
            targets: iconRef.current,
            translateY: [
                { value: -10, duration: 200, easing: 'easeOutQuad' },
                { value: 0, duration: 200, easing: 'easeInQuad' },
                { value: -5, duration: 200, easing: 'easeOutQuad' },
                { value: 0, duration: 200, easing: 'easeInQuad' }
            ],
            duration: 800
        });
    };

    return (
        <a
            href={`https://ko-fi.com/${kofiId}`}
            target="_blank"
            rel="noreferrer"
            className='btn-donate-hero'
            onMouseEnter={handleMouseEnter}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
                backgroundColor: '#29abe0',
                borderColor: '#29abe0',
                color: '#fff',
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
