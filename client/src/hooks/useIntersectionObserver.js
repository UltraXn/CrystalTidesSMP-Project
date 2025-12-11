import { useRef, useEffect, useState } from 'react';

export function useIntersectionObserver(options = {}) {
    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Optional: Stop observing once visible if you only want it to trigger once
                if (options.triggerOnce) {
                    observer.unobserve(entry.target);
                }
            } else if (!options.triggerOnce) {
                setIsVisible(false);
            }
        }, {
            threshold: 0.1, // Trigger when 10% is visible
            ...options
        });

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [options]);

    return [elementRef, isVisible];
}
