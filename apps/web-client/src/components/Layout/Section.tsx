import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface SectionProps {
    title?: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
    id?: string;
    style?: React.CSSProperties;
    separator?: boolean;
}

const Separator = () => (
    <div className="w-full flex items-center justify-center gap-8 py-16 opacity-50 select-none pointer-events-none">
        <div className="h-px w-32 sm:w-64 bg-linear-to-r from-transparent to-(--accent)"></div>
        <div className="w-3 h-3 rotate-45 bg-(--accent) shadow-[0_0_15px_var(--accent)] animate-pulse"></div>
        <div className="h-px w-32 sm:w-64 bg-linear-to-l from-transparent to-(--accent)"></div>
    </div>
);

export default function Section({
    title,
    children,
    delay = 0,
    direction = 'up',
    className = '',
    id,
    style = {},
    separator = false
}: SectionProps) {
    const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ triggerOnce: true, threshold: 0.1 });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (isVisible && !hasAnimated.current && ref.current) {
            hasAnimated.current = true;

            const startY = direction === 'up' ? 50 : (direction === 'down' ? -50 : 0);
            const startX = direction === 'left' ? -50 : (direction === 'right' ? 50 : 0);

            gsap.fromTo(ref.current,
                { 
                    opacity: 0, 
                    y: startY, 
                    x: startX 
                },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay: delay / 1000 // gsap uses seconds
                }
            );
        }
    }, [isVisible, delay, direction, ref]);



    if (title) {
        return (
            <section
                ref={ref}
                id={id}
                className={`w-full max-w-[1200px] mx-auto px-4 py-16 text-center ${className}`.trim()}
                style={{ opacity: 0, ...style }}
            >
                <h2 className="text-3xl md:text-4xl font-black mb-8 text-(--accent) uppercase tracking-widest drop-shadow-lg">
                    {title}
                </h2>
                <div className="relative mb-8">{children}</div>
                {separator && <Separator />}
            </section>
        )
    }

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            id={id}
            className={`w-full max-w-[1200px] mx-auto ${className}`.trim()}
            style={{ opacity: 0, ...style }}
        >
            {children}
            {separator && <Separator />}
        </div>
    )
}
