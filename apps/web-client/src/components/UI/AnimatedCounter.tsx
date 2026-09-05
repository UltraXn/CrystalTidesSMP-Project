import { useEffect, useState, useRef, useMemo } from 'react';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
}

export default function AnimatedCounter({ 
    value, 
    duration = 1000, 
    decimals = 0,
    prefix = '', 
    suffix = '' 
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const startValue = useRef(value);
    const startTime = useRef<number | null>(null);
    const finalValue = useRef(value);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        // Cuando el valor objetivo cambia, iniciamos la animación desde el valor actual mostrado
        startValue.current = displayValue;
        finalValue.current = value;
        startTime.current = null;
        
        // Respetar preferencia de reducción de movimiento
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplayValue(value);
            return;
        }

        // Función de animación
        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = timestamp - startTime.current;
            
            // Easing function (easeOutExpo para un efecto suave al final)
            const easeOutExpo = (x: number): number => {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            }

            const percentage = Math.min(progress / duration, 1);
            const ease = easeOutExpo(percentage);
            
            const current = startValue.current + (finalValue.current - startValue.current) * ease;
            
            setDisplayValue(current);

            if (progress < duration) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(finalValue.current); // Asegurar valor final exacto
            }
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration]); // Dependemos de 'value' para reiniciar

    // Formateo del número
    const formatter = useMemo(() => new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }), [decimals]);
    const formatted = formatter.format(displayValue);

    return <span className="tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{formatted}{suffix}</span>;
}
