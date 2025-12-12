import { useRef, useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export default function Section({
    title,
    children,
    delay = 0,
    direction = 'up',
    className = '',
    style = {}
}) {
    const [ref, isVisible] = useIntersectionObserver({ triggerOnce: true, threshold: 0.1 });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (isVisible && !hasAnimated.current) {
            hasAnimated.current = true;

            let translateY = [50, 0];
            let translateX = [0, 0];

            if (direction === 'left') translateX = [-50, 0];
            if (direction === 'right') translateX = [50, 0];

            anime({
                targets: ref.current,
                opacity: [0, 1],
                translateY: translateY,
                translateX: translateX,
                easing: 'easeOutExpo',
                duration: 1000,
                delay: delay
            });
        }
    }, [isVisible, delay, direction]);

    if (title) {
        return (
            <section
                ref={ref}
                className={`section ${className}`.trim()}
                style={{ opacity: 0, ...style }}
            >
                <h2>{title}</h2>
                <div>{children}</div>
            </section>
        )
    }

    return (
        <div
            ref={ref}
            className={className}
            style={{ opacity: 0, ...style }}
        >
            {children}
        </div>
    )
}
